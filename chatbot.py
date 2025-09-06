from agno.agent import Agent

# Depending on agno version, Ollama adapter may be in different paths:
try:
    from agno.models.ollama import Ollama
except ImportError:
    from agno.models.ollama.chat import Ollama

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


def main():
    agent = make_agent()
    print("Chatbot ready (Llama 3.2). Type 'exit' to quit.\n")

    last_topic = None  # track last disease/condition

    while True:
        user_input = input("You: ").strip()
        if user_input.lower() in ("exit", "quit"):
            break

        try:
            # Detect "explain more"
            if "explain more" in user_input.lower() and last_topic:
                query = (
                    f"Explain more about the SYMPTOMS and PRECAUTIONS of {last_topic}. "
                    "Do not add history, treatment, or statistics."
                )
            else:
                query = user_input
                last_topic = user_input  # assume user is asking about new disease

            token_limit = get_token_limit(user_input)
            response = agent.run(query, max_tokens=token_limit, show_full_reasoning=False)
            reply = getattr(response, "content", None) or str(response)

        except Exception as e:
            reply = f"[Error] {e}"

        print("Bot:", reply, "\n")


if __name__ == "__main__":
    main()
