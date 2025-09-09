from agno.agent import Agent
from typing import Dict, Optional, Tuple, Union, List, Any
from transformers import pipeline
import logging

# Configure logger
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

# Depending on agno version, Ollama adapter may be in different paths:
try:
    from agno.models.ollama import Ollama
except ImportError:
    from agno.models.ollama.chat import Ollama


# In-memory session store: { session_id: { last_topic: str, last_prompt_key: str } }
sessions: Dict[str, Dict[str, Optional[str]]] = {}


# ---------- Transformers Setup ----------
intent_classifier = pipeline(
    "zero-shot-classification",
    model="valhalla/distilbart-mnli-12-1"  
)


INTENTS = ["affirmation", "deny", "gratitude", "explain_more", "new_topic"]
TOPICS = ["exams", "sleep", "anxiety", "relationship", "stress", "other"]

# High/medium/low risk classifier (fast keyword-first)
HIGH_RISK_KEYWORDS = [
    "torture", "abuse", "rape", "molest", "suicide", "kill myself", "want to die",
    "end my life", "they will kill me", "beat me", "they abuse me", "self harm",
    "cut myself", "hurt myself"
]
MEDIUM_RISK_KEYWORDS = [
    "really sad", "depressed", "depression", "panic attack", "panic", "overwhelmed", 
    "hopeless", "can't cope", "breaking down", "losing control"
]


# ---------- Agent Setup ----------
def make_agent():
    try:
        model = Ollama(id="llama3.2", options={"temperature": 0.2})
    except TypeError:
        model = Ollama(id="llama3.2")

    agent = Agent(
        name="NexionWellnessCoach",
        model=model,
        description="A student mental wellness companion running via Ollama and Agno",
        markdown=False,
        instructions=(
            "You are a student mental wellness companion for campus use. "
            "Focus on academic stress, anxiety, sleep, study pressure, relationships, and student wellbeing. "
            "Use calm, supportive, and practical language with up to 5 concise sentences. "
            "When asked to 'explain more', expand with specific, actionable coping techniques, examples, and next steps for the LAST USER TOPIC. "
            "Do NOT interpret words like 'exams' as medical tests; treat them as academic exams. "
            "Avoid clinical diagnosis, medical history, treatment, or statistics unless explicitly requested. "
            "Encourage professional help when appropriate, but keep advice immediately actionable."
        )
    )
    return agent


def get_token_limit(user_input: str) -> int:
    if "explain more" in user_input.lower():
        return 200
    return 120


def classify_risk(text: str) -> str:
    """Return 'high', 'medium', or 'low'. Very conservative: prefer false negatives
    to avoid escalation mistakes. Use substring matching to catch variants.
    """
    if not text:
        return "low"
    lw = text.lower()
    try:
        # fast high-risk check
        for kw in HIGH_RISK_KEYWORDS:
            if kw in lw:
                return "high"
        for kw in MEDIUM_RISK_KEYWORDS:
            if kw in lw:
                return "medium"
        # Optional: if you have an intent_classifier, use it for corroboration
        # e.g. if "suicide" appears in classifier labels -> high
    except Exception as e:
        logger.exception("classify_risk failed: %s", e)
    return "low"


def make_counsellor_payload(counsellors: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Return a structured object the front-end can render. Keep minimal and serializable."""
    # Only include safe public fields
    safe = []
    for c in counsellors:
        safe.append({
            "id": c.get("id"),
            "name": c.get("name"),
            "specialization": c.get("specialization"),
            "affiliation": c.get("affiliation"),
            "fees": c.get("fees"),
            "experience_years": c.get("experience_years"),
            "ranking_score": c.get("ranking_score"),
            "languages": c.get("languages") or [],
            "bio": c.get("bio") or ""
        })
    return {"type": "counsellor_suggestion", "counsellors": safe}


def _get_session(session_id: Optional[str]) -> Dict[str, Optional[str]]:
    key = session_id or "default"
    if key not in sessions:
        sessions[key] = {"last_topic": None, "last_prompt_key": None}
    return sessions[key]


# ---------- New Transformers-Based Classification ----------
def classify_intent(agent: Agent, message: str) -> str:
    """
    Classify intent into: affirmation, deny, gratitude, explain_more, new_topic
    using zero-shot classification.
    """
    text = (message or "").strip().lower()
    if not text:
        return "new_topic"

    result = intent_classifier(text, INTENTS)
    best_intent = result["labels"][0]
    score = result["scores"][0]

    if score < 0.6:
        return "new_topic"

    return best_intent


def classify_topic(text: str) -> Optional[str]:
    """
    Classify user message into topics: exams, sleep, anxiety, relationship, stress, other
    using zero-shot classification.
    """
    if not text or len(text.strip()) < 2:
        return None

    result = intent_classifier(text, TOPICS)
    best_topic = result["labels"][0]
    score = result["scores"][0]

    if score < 0.5:
        return None

    return best_topic


# ---------- Main Conversation Handler ----------
def process_message(agent: Agent, message: str, session_id: Optional[str] = None) -> Tuple[Union[str, Dict[str, Any]], Optional[str]]:
    sess = _get_session(session_id)
    last_topic = sess.get("last_topic")
    last_prompt_key = sess.get("last_prompt_key")
    text = (message or "").strip()
    lower = text.lower()

    # -------------- NEW: High-risk detection --------------
    try:
        risk = classify_risk(text)
    except Exception as e:
        logger.exception("Risk classification failed, defaulting to low: %s", e)
        risk = "low"

    if risk == "high":
        logger.info("High-risk message detected for session %s: %s", session_id, text[:120])
        # Attempt to fetch counsellors; catch errors and fall back to a safe string
        try:
            # ADAPT: call your backend function that returns ranked counsellors for a user or generic list.
            user_id = sess.get("user_id")  # optional: set this where sessions are created
            counsellors = []
            try:
                # First try to get counsellors based on questionnaire responses
                from lib.counsellorRanking import fetchAndRankCounsellors
                # For high-risk cases, create a crisis-focused questionnaire response
                crisis_answers = {
                    "stress_level": "very_high",
                    "support_type": "crisis_intervention", 
                    "urgency": "immediate",
                    "preferred_specialization": "crisis_counseling"
                }
                counsellors = fetchAndRankCounsellors(crisis_answers, "crisis intervention")
            except Exception:
                # Fallback to user-specific ranking if available
                try:
                    from lib.counsellorRanking import getRankedCounsellors
                    counsellors = getRankedCounsellors(user_id)
                except Exception:
                    # Final fallback: create mock crisis counsellors for demo
                    logger.warning("Using mock counsellors for high-risk detection demo")
                    counsellors = [
                        {
                            "id": "crisis_1",
                            "name": "Dr. Sarah Johnson",
                            "specialization": "Crisis Intervention",
                            "affiliation": "Campus Mental Health",
                            "fees": 0,  # Emergency sessions free
                            "experience_years": 8,
                            "ranking_score": 9.5,
                            "languages": ["English", "Hindi"],
                            "bio": "Specialized in crisis intervention and suicide prevention"
                        },
                        {
                            "id": "crisis_2", 
                            "name": "Dr. Raj Patel",
                            "specialization": "Emergency Counseling",
                            "affiliation": "Student Wellness Center",
                            "fees": 0,
                            "experience_years": 12,
                            "ranking_score": 9.3,
                            "languages": ["English", "Hindi", "Gujarati"],
                            "bio": "Expert in trauma counseling and emergency mental health support"
                        }
                    ]

            if counsellors:
                payload = make_counsellor_payload(counsellors)
                # Also include a short textual safety-first message
                payload["message"] = (
                    "I'm really sorry you're experiencing this. This sounds serious. "
                    "Here are some counsellors who may be able to help — would you like me to help book a session?"
                )
                # Save last topic & prompt key
                sess["last_topic"] = text
                sess["last_prompt_key"] = "counsellor_suggested"
                return payload, text
            else:
                # No counsellors available — give an actionable fallback
                sess["last_topic"] = text
                sess["last_prompt_key"] = None
                fallback = (
                    "I'm really sorry you're going through this. I don't have counsellors available right now, "
                    "but you can contact campus counselling services or your local emergency services if you feel unsafe. "
                    "Would you like resources I can share?"
                )
                return fallback, text
        except Exception as e:
            # Fail-safe: log and return a simple, supportive message
            logger.exception("Error while preparing counsellor suggestion: %s", e)
            return (
                "I'm really sorry — I'm having trouble fetching counsellor options right now. "
                "Please reach out to a trusted person or emergency services if you feel unsafe.",
                text
            )
    # -------------- END HIGH-RISK BRANCH --------------

    intent = classify_intent(agent, text)
    new_label = classify_topic(text)
    last_label = classify_topic(last_topic or "") if last_topic else None

    if intent == "affirmation" and (len(text.split()) > 3 or new_label):
        intent = "new_topic"

    if new_label and last_label and new_label != last_label:
        intent = "new_topic"

    try:
        if not text or len(text.strip()) < 2:
            return "Could you share a bit more about how you’re feeling?", last_topic

        if last_prompt_key == "awaiting_topic":
            sess["last_topic"] = text
            sess["last_prompt_key"] = "tried_technique"
            token_limit = get_token_limit(text)
            query = (
                f"Student said: {text}\n"
                "Respond as a supportive student wellness companion."
            )
            response = agent.run(query, max_tokens=token_limit, show_full_reasoning=False)
            reply = getattr(response, "content", None) or str(response)
            return reply, text

        if intent == "explain_more":
            if not last_topic:
                reply = "I didn’t explain a condition yet. Could you tell me what topic you’d like to learn about?"
                sess["last_prompt_key"] = "awaiting_topic"
                return reply, last_topic
            query = (
                f"Student said: {last_topic}\n"
                "Respond as a supportive student wellness companion. "
                "Explain more with practical, step-by-step coping techniques, examples, and next actions for a student. "
                "Keep it non-clinical, actionable, and concise. Avoid medical diagnostics."
            )
            token_limit = get_token_limit("explain more")
            response = agent.run(query, max_tokens=token_limit, show_full_reasoning=False)
            reply = getattr(response, "content", None) or str(response)
            sess["last_prompt_key"] = None
            return reply, last_topic

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

        if last_prompt_key in {"tried_technique"} and intent not in {"affirmation", "deny"}:
            return "Just to check — was that a yes or no?", last_topic

        if intent == "gratitude":
            sess["last_prompt_key"] = None
            return "You're very welcome 💙 I'm here anytime you need support. Take care!", last_topic

        if intent == "new_topic":
            sess["last_topic"] = text
            sess["last_prompt_key"] = "tried_technique"
            token_limit = get_token_limit(text)
            query = (
                f"Student said: {text}\n"
                "Respond as a supportive student wellness companion."
            )
            response = agent.run(query, max_tokens=token_limit, show_full_reasoning=False)
            reply = getattr(response, "content", None) or str(response)
            return reply, text

        if intent == "affirmation" and last_topic:
            query = (
                f"Student said: {last_topic}\n"
                "Respond as a supportive student wellness companion. "
                "Explain more with practical, step-by-step coping techniques, examples, and next actions for a student. "
                "Keep it non-clinical, actionable, and concise. Avoid medical diagnostics."
                "Do not include any medical advice or diagnoses."
            )
            token_limit = get_token_limit("explain more")
            response = agent.run(query, max_tokens=token_limit, show_full_reasoning=False)
            reply = getattr(response, "content", None) or str(response)
            sess["last_prompt_key"] = None
            return reply, last_topic

        if intent == "deny":
            return "No worries. Could you share more about your concern?", last_topic

        sess["last_topic"] = text
        sess["last_prompt_key"] = "tried_technique"

        token_limit = get_token_limit(text)
        query = (
            f"Student said: {text}\n"
            "Respond as a supportive student wellness companion."
        )
        response = agent.run(query, max_tokens=token_limit, show_full_reasoning=False)
        reply = getattr(response, "content", None) or str(response)
        return reply, text

    except Exception as e:
        return f"[Error] {e}", last_topic


def main():
    agent = make_agent()
    print("Chatbot ready (Llama 3.2 + Transformers). Type 'exit' to quit.\n")

    session_id = "cli_session"
    while True:
        user_input = input("You: ").strip()
        if user_input.lower() in ("exit", "quit"):
            break
        reply, _ = process_message(agent, user_input, session_id=session_id)
        print("Bot:", reply, "\n")


if __name__ == "__main__":
    main()
