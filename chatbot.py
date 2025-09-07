from agno.agent import Agent
from typing import Dict, Optional, Tuple

# Depending on agno version, Ollama adapter may be in different paths:
try:
    from agno.models.ollama import Ollama
except ImportError:
    from agno.models.ollama.chat import Ollama


# In-memory session store: { session_id: { last_topic: str, last_prompt_key: str } }
sessions: Dict[str, Dict[str, Optional[str]]] = {}


def make_agent():
    model = Ollama(id="llama3.2")

    agent = Agent(
        name="Llama3.2Agent",
        model=model,
        description="A chatbot running Llama 3.2 via Ollama and Agno",
        markdown=False,
        instructions=(
            "You are a medical assistant. "
            "Normally explain answers in up to 5 simple sentences so the user understands. "
            "If the user asks to 'explain more', ONLY expand about symptoms and precautions "
            "for the last disease/condition discussed. "
            "Avoid history, treatment, or statistics unless specifically requested."
        )
    )
    return agent


def get_token_limit(user_input: str) -> int:
    """Adjust token limit based on detail request"""
    if "explain more" in user_input.lower():
        return 200
    return 120


def _get_session(session_id: Optional[str]) -> Dict[str, Optional[str]]:
    key = session_id or "default"
    if key not in sessions:
        sessions[key] = {"last_topic": None, "last_prompt_key": None}
    return sessions[key]


def classify_intent(agent: Agent, message: str) -> str:
    """Classify message intent via the LLM into one of:
    gratitude, affirmation, deny, explain_more, new_topic
    Fallback to heuristics if the model call fails.
    """
    text = (message or "").strip()
    lower = text.lower()
    # Fast heuristic fallback
    def heuristic() -> str:
        if "explain more" in lower:
            return "explain_more"
        if lower in {"yes", "y", "yeah", "yep", "ok", "okay", "please", "pls", "plz", "s", "yes please", "yes plz"}:
            return "affirmation"
        if lower in {"no", "n", "nope", "nah"}:
            return "deny"
        if any(w in lower for w in ["thanks", "thank you", "thx", "ty"]):
            return "gratitude"
        return "new_topic"

    prompt = (
        "Classify the intent of this message into one of: gratitude, affirmation, deny, explain_more, new_topic. "
        f"Message: {text}\n"
        "Respond with only one of those labels in lowercase."
    )
    try:
        resp = agent.run(prompt, max_tokens=10, show_full_reasoning=False)
        raw = getattr(resp, "content", None) or str(resp)
        raw = (raw or "").strip().lower()
        for label in ["gratitude", "affirmation", "deny", "explain_more", "new_topic"]:
            if raw.startswith(label) or raw == label:
                return label
        return heuristic()
    except Exception:
        return heuristic()


def process_message(agent: Agent, message: str, session_id: Optional[str] = None) -> Tuple[str, Optional[str]]:
    
    sess = _get_session(session_id)
    last_topic = sess.get("last_topic")
    last_prompt_key = sess.get("last_prompt_key")
    text = (message or "").strip()
    lower = text.lower()

    # Intent classification (LLM with heuristic fallback)
    intent = classify_intent(agent, text)

    try:
        # Handle awaiting topic explicitly (takes precedence)
        if last_prompt_key == "awaiting_topic":
            # Treat the message as the new topic to explain briefly first
            sess["last_topic"] = text
            sess["last_prompt_key"] = "tried_technique"  # example follow-up key
            token_limit = get_token_limit(text)
            response = agent.run(text, max_tokens=token_limit, show_full_reasoning=False)
            reply = getattr(response, "content", None) or str(response)
            return reply, text

        # 1) Explain more intent
        if intent == "explain_more":
            if not last_topic:
                reply = (
                    "I didn’t explain a condition yet. Could you tell me what topic you’d like to learn about?"
                )
                # Keep prompt key to expect a topic
                sess["last_prompt_key"] = "awaiting_topic"
                return reply, last_topic
            query = (
                f"Explain more about the SYMPTOMS and PRECAUTIONS of {last_topic}. "
                "Do not add history, treatment, or statistics."
            )
            token_limit = get_token_limit("explain more")
            response = agent.run(query, max_tokens=token_limit, show_full_reasoning=False)
            reply = getattr(response, "content", None) or str(response)
            sess["last_prompt_key"] = None
            return reply, last_topic

        # 2) Yes/No follow-ups when we previously prompted
        if intent == "affirmation" and last_prompt_key == "tried_technique":
            reply = (
                "Great. Let’s build on that. Here are a few grounding techniques you can use right away: "
                "1) Box breathing (4-4-4-4), 2) 5-4-3-2-1 sensory check, 3) Name-and-release (label thoughts, let them pass). "
                "Would you like me to suggest more techniques or help you book a counsellor?"
            )
            sess["last_prompt_key"] = None
            return reply, last_topic
        if intent == "deny" and last_prompt_key == "tried_technique":
            reply = (
                "No problem. We can try something simple now: inhale 4s, hold 4s, exhale 4s, repeat 4 rounds. "
                "I can also share sleep/stress tips or help you book a counsellor. What would you prefer?"
            )
            sess["last_prompt_key"] = None
            return reply, last_topic
        if intent == "affirmation" and last_prompt_key == "memory_issues":
            reply = (
                "Here are some grounding techniques: 1) Box breathing (4-4-4-4), "
                "2) 5-4-3-2-1 sensory check, 3) Name-and-release (label thoughts, let them pass). "
                "Would you like me to suggest more or connect you to a counsellor?"
            )
            sess["last_prompt_key"] = None
            return reply, last_topic
        if intent == "deny" and last_prompt_key == "memory_issues":
            reply = (
                "No problem. Try this simple one: inhale 4s, hold 4s, exhale 4s, repeat 4 rounds. "
                "I can also share sleep/stress tips or help book a counsellor. What would you prefer?"
            )
            sess["last_prompt_key"] = None
            return reply, last_topic
        # If we asked a yes/no and the user is ambiguous, clarify
        if last_prompt_key in {"tried_technique", "memory_issues"} and intent not in {"affirmation", "deny"}:
            return "Just to check — was that a yes or no?", last_topic

        # 3) Gratitude intent (simple close)
        if intent == "gratitude":
            sess["last_prompt_key"] = None
            return "You're very welcome 💙 I'm here anytime you need support. Take care!", last_topic

        # 4) New topic or fallback
        if intent == "new_topic":
            sess["last_topic"] = text
            sess["last_prompt_key"] = "tried_technique"  # set a generic key for potential follow-ups
            token_limit = get_token_limit(text)
            response = agent.run(text, max_tokens=token_limit, show_full_reasoning=False)
            reply = getattr(response, "content", None) or str(response)
            return reply, text

        # If intent was affirmation/deny but no relevant prompt key, and we have a last topic, treat as explain_more/new_topic fallback
        if intent == "affirmation" and last_topic:
            query = (
                f"Explain more about the SYMPTOMS and PRECAUTIONS of {last_topic}. "
                "Do not add history, treatment, or statistics."
            )
            token_limit = get_token_limit("explain more")
            response = agent.run(query, max_tokens=token_limit, show_full_reasoning=False)
            reply = getattr(response, "content", None) or str(response)
            sess["last_prompt_key"] = None
            return reply, last_topic

        if intent == "deny":
            return "No worries. Could you share more about your concern?", last_topic

        # Default: treat as new topic
        sess["last_topic"] = text
        sess["last_prompt_key"] = "tried_technique"

        token_limit = get_token_limit(text)
        response = agent.run(text, max_tokens=token_limit, show_full_reasoning=False)
        reply = getattr(response, "content", None) or str(response)
        return reply, text

    except Exception as e:
        return f"[Error] {e}", last_topic


def main():
    agent = make_agent()
    print("Chatbot ready (Llama 3.2). Type 'exit' to quit.\n")

    session_id = "cli_session"
    while True:
        user_input = input("You: ").strip()
        if user_input.lower() in ("exit", "quit"):
            break
        reply, _ = process_message(agent, user_input, session_id=session_id)
        print("Bot:", reply, "\n")


if __name__ == "__main__":
    main()
