from agno.agent import Agent
from typing import Dict, Optional, Tuple, Union, List, Any
from transformers import pipeline
import logging
import json
import os
import re
import concurrent.futures
from pathlib import Path

# Configure logger with both file and console handlers
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.FileHandler("chatbot.log"), logging.StreamHandler()]
)
logger = logging.getLogger(__name__)

# Depending on agno version, Ollama adapter may be in different paths:
try:
    from agno.models.ollama import Ollama
except ImportError:
    from agno.models.ollama.chat import Ollama


# In-memory session store: { session_id: { last_topic: str, last_prompt_key: str } }
sessions: Dict[str, Dict[str, Optional[str]]] = {}


def load_distress_words(file_path: str) -> Dict[str, List[str]]:
    """Load distress words dataset from a JSON file."""
    try:
        with open(file_path, "r") as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Failed to load distress words: {e}")
        return {"high_risk": [], "medium_risk": []}


# Load dataset (update path as needed)
distress_words = load_distress_words("data/distress_words.json")


def detect_risk_level(message: str) -> str:
    """Check if message contains distress words."""
    text = message.lower()
    for word in distress_words.get("high_risk", []):
        if word in text:
            return "high"
    for word in distress_words.get("medium_risk", []):
        if word in text:
            return "medium"
    return "low"


def make_agent() -> Agent:
    return Agent(
        model=Ollama(id="llama3.2"),
        name="PulseBot",
        role="You are PulseBot 🤖💙, a mental wellness companion for students. Provide short, empathetic, and supportive replies. If risk is high, suggest connecting to a counsellor immediately.",
        markdown=True,
    )


def classify_intent(message: str) -> str:
    """Classify message intent using transformers zero-shot classification."""
    try:
        classifier = pipeline("zero-shot-classification", model="valhalla/distilbart-mnli-12-1")
        candidate_labels = ["greeting", "goodbye", "thanks", "mental_health", "study_stress", "exam_anxiety", "personal_issue"]
        result = classifier(message, candidate_labels)
        return result["labels"][0]
    except Exception as e:
        logger.warning(f"Intent classification failed: {e}")
        return "general"


def process_message(session_id: str, message: str) -> str:
    """Process user message and return bot response."""
    # Get or create session
    session = sessions.setdefault(session_id, {"last_topic": None, "last_prompt_key": None})

    # Check for distress level
    risk = detect_risk_level(message)
    if risk == "high":
        return "⚠️ It sounds like you're going through a really tough time. Please connect with a counsellor immediately — you're not alone in this."

    # Classify intent
    intent = classify_intent(message)

    # Simple response logic for common intents
    if intent == "greeting":
        return "Hello! I'm PulseBot 🤖💙, your mental wellness companion. How are you feeling today?"
    elif intent == "goodbye":
        return "Take care! Remember, you're stronger than you think."
    elif intent == "thanks":
        return "You're welcome 💙 I'm always here for you."

    # AI-generated response for general/mental health
    agent = make_agent()
    response = agent.run(message)
    return response.content if hasattr(response, "content") else str(response)


if __name__ == "__main__":
    print("PulseBot is running! Type 'quit' to exit.\n")
    while True:
        user_input = input("You: ")
        if user_input.lower() in {"quit", "exit"}:
            print("Goodbye! Take care 💙")
            break
        reply = process_message("demo_session", user_input)
        print(f"PulseBot: {reply}")
