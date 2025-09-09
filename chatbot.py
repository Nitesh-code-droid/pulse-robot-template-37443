import os
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

from agno.agent import Agent
from typing import Dict, Optional, Tuple, Any, List
from transformers import pipeline
import concurrent.futures
import logging
import random
import json
import re
from pathlib import Path

# ----------------- Logging -----------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.FileHandler("chatbot.log"), logging.StreamHandler()]
)
logger = logging.getLogger(__name__)

# ----------------- Ollama -----------------
try:
    from agno.models.ollama import Ollama
except ImportError:
    from agno.models.ollama.chat import Ollama

# ----------------- Session Store -----------------
sessions: Dict[str, Dict[str, Optional[str]]] = {}

# ----------------- Distress Dataset -----------------
distress_words_cache: Dict[str, List[str]] = {"high_risk": [], "medium_risk": []}

def load_distress_words() -> Dict[str, List[str]]:
    """Load distress words from JSON."""
    global distress_words_cache
    try:
        possible_paths = [
            Path("data/distress_words.json"),
            Path("./distress_words.json"),
            Path(os.path.dirname(__file__)) / "data" / "distress_words.json",
        ]
        dataset_path = None
        for path in possible_paths:
            if path.exists():
                dataset_path = path
                break
        if not dataset_path:
            logger.warning("No distress_words.json found")
            return {"high_risk": [], "medium_risk": []}

        with open(dataset_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        distress_words_cache = {
            "high_risk": [w.lower() for w in data.get("high_risk", [])],
            "medium_risk": [w.lower() for w in data.get("medium_risk", [])],
        }
        return distress_words_cache
    except Exception as e:
        logger.error(f"Failed to load distress dataset: {e}")
        return {"high_risk": [], "medium_risk": []}

distress_words_cache = load_distress_words()


# ----------------- Coping Techniques -----------------
COPING_TECHNIQUES = [
    "**Box breathing** (4-4-4-4)",
    "**5-4-3-2-1 grounding** (notice 5 things you see, 4 touch, 3 hear, 2 smell, 1 taste)",
    "**Progressive muscle relaxation** (tense & release muscles)",
    "**Journaling one worry** then setting it aside",
    "**Stretching or walking for 2 minutes**",
    "**Listening to calming music**",
    "**Visualization** (picture a safe place you love)"
]

FALLBACK_RESPONSES = [
    "I'm here to support you. Try taking 3 deep breaths and focusing on the present moment.",
    "You're not alone. Consider trying some gentle stretching or a short walk to help clear your mind.",
    "I understand this is difficult. Try the 5-4-3-2-1 grounding technique: notice 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste.",
    "Take a moment to breathe deeply. Inhale for 4 counts, hold for 4, exhale for 4. Repeat 3 times.",
    "I'm here to listen. Sometimes writing down your thoughts can help. Try journaling for just 2-3 minutes."
]

def suggest_coping() -> str:
    return random.choice(COPING_TECHNIQUES)

def get_fallback_response() -> str:
    return random.choice(FALLBACK_RESPONSES)

# ----------------- Risk Detection -----------------
def classify_risk(text: str) -> str:
    text_lower = text.lower()
    for word in distress_words_cache.get("high_risk", []):
        if re.search(rf"\b{re.escape(word)}\b", text_lower):
            return "high"
    for word in distress_words_cache.get("medium_risk", []):
        if re.search(rf"\b{re.escape(word)}\b", text_lower):
            return "medium"
    return "low"

# ----------------- Agent -----------------
def make_agent():
    try:
        model = Ollama(id="llama3.2", options={
            "temperature": 0.2,
            "top_p": 0.8,
            "num_predict": 30,
            "num_ctx": 512,
            "stop": ["\n\n", "User:", "Human:", "Assistant:"]
        })
    except TypeError:
        model = Ollama(id="llama3.2")

    return Agent(
        name="WellnessAI",
        model=model,
        description="Student wellness AI companion",
        markdown=False,
        instructions=(
            "You are a supportive wellness AI. Keep responses under 2 sentences. "
            "Be empathetic and offer practical coping techniques. "
            "Focus on: breathing exercises, grounding techniques, or simple activities. "
            "Never give medical advice."
        )
    )

# ----------------- Timeout Wrapper -----------------
def run_with_timeout(agent, query, max_tokens=30, timeout=8):
    with concurrent.futures.ThreadPoolExecutor() as executor:
        future = executor.submit(agent.run, query, max_tokens=max_tokens)
        try:
            return future.result(timeout=timeout)
        except concurrent.futures.TimeoutError:
            logger.warning("Agent timeout, using fallback response")
            return get_fallback_response()

# ----------------- Counsellor Payload -----------------
def make_counsellor_payload() -> Dict[str, Any]:
    counsellors = [
        {
            "id": "crisis_1",
            "name": "Dr. Sarah Johnson",
            "specialization": "Crisis Intervention",
            "affiliation": "Campus Mental Health",
            "fees": 0,
            "experience_years": 8,
            "ranking_score": 9.5,
            "languages": ["English", "Hindi"],
            "bio": "Crisis intervention and suicide prevention specialist"
        },
        {
            "id": "crisis_2",
            "name": "Dr. Raj Patel",
            "specialization": "Emergency Counseling",
            "affiliation": "Student Wellness Center",
            "fees": 0,
            "experience_years": 12,
            "ranking_score": 9.8,
            "languages": ["English", "Hindi", "Gujarati"],
            "bio": "Trauma counseling and emergency support expert"
        }
    ]
    return {
        "type": "counsellor_suggestion",
        "message": "**I'm concerned about you.** Here are counsellors who can help right now.",
        "counsellors": counsellors
    }

# ----------------- Intent Classification -----------------
def classify_intent_fallback(message: str) -> str:
    """Fallback intent classification using keyword matching."""
    message_lower = message.lower()
    
    # Greeting keywords
    if any(word in message_lower for word in ["hi", "hello", "hey", "good morning", "good evening"]):
        return "greeting"
    
    # Goodbye keywords
    if any(word in message_lower for word in ["bye", "goodbye", "see you", "take care"]):
        return "goodbye"
    
    # Thanks keywords
    if any(word in message_lower for word in ["thank", "thanks", "appreciate"]):
        return "thanks"
    
    # Mental health keywords
    if any(word in message_lower for word in ["stress", "anxiety", "depressed", "worried", "panic", "overwhelmed"]):
        return "mental_health"
    
    return "general"

def classify_intent(message: str) -> str:
    """Classify message intent with fallback."""
    try:
        classifier = pipeline("zero-shot-classification", model="valhalla/distilbart-mnli-12-1")
        candidate_labels = ["greeting", "goodbye", "thanks", "mental_health", "study_stress", "exam_anxiety", "personal_issue"]
        result = classifier(message, candidate_labels)
        return result["labels"][0]
    except Exception as e:
        logger.warning(f"Intent classification failed: {e}, using fallback")
        return classify_intent_fallback(message)

# ----------------- Conversation -----------------
def process_message(agent: Agent, message: str, session_id: Optional[str] = None):
    if not message.strip():
        return "Could you share a bit more about how you're feeling?"

    sess = sessions.setdefault(session_id or "default", {"last_topic": None, "last_prompt_key": None})
    risk = classify_risk(message)
    
    # Session reset logic
    if sess.get("last_prompt_key") and len(message.split()) > 25:
        logger.info(f"Session {session_id}: Resetting due to long message after prompt key")
        sess["last_prompt_key"] = None
        sess["last_topic"] = None

    # Log session info
    intent = classify_intent(message)
    logger.info(f"Session {session_id}: intent={intent}, risk={risk}, last_topic={sess.get('last_topic')}, last_key={sess.get('last_prompt_key')}")

    if risk == "high":
        return make_counsellor_payload()

    # Quick responses for common queries
    message_lower = message.lower().strip()
    if message_lower in ["hi", "hello", "hey", "good morning", "good evening"]:
        return "Hello! I'm here to support you. How are you feeling today?"
    elif message_lower in ["bye", "goodbye", "see you", "take care"]:
        return "Take care! Remember, I'm here whenever you need support. 💙"
    elif message_lower in ["thank you", "thanks", "thank you so much"]:
        return "You're very welcome! I'm glad I could help. Feel free to reach out anytime."
    elif "anxious" in message_lower or "anxiety" in message_lower or "panic" in message_lower:
        return "I understand anxiety can be overwhelming. Try taking 3 deep breaths: inhale for 4 counts, hold for 4, exhale for 4. You've got this! 💙"
    elif "stressed" in message_lower or "stress" in message_lower or "exam" in message_lower:
        return "Stress is tough to deal with. Try the 5-4-3-2-1 grounding technique: notice 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste."
    elif "sleep" in message_lower or "tired" in message_lower or "insomnia" in message_lower:
        return "Sleep issues can be frustrating. Try some gentle stretching or listening to calming music before bed. A warm cup of herbal tea might help too."
    elif "overwhelmed" in message_lower or "overwhelm" in message_lower or "too much" in message_lower:
        return "Feeling overwhelmed is completely normal. Take it one step at a time. Try breaking tasks into smaller pieces and focus on just one thing right now."
    elif "sad" in message_lower or "depressed" in message_lower or "down" in message_lower:
        return "I'm sorry you're feeling this way. Remember that it's okay to not be okay. Try some gentle movement like a short walk, or consider talking to someone you trust."
    elif "angry" in message_lower or "mad" in message_lower or "frustrated" in message_lower:
        return "Anger is a valid emotion. Try taking a few deep breaths and counting to 10. Sometimes stepping away for a moment can help you feel more centered."
    elif "lonely" in message_lower or "alone" in message_lower or "isolated" in message_lower:
        return "Feeling lonely can be really hard. You're not alone in this feeling. Consider reaching out to a friend, family member, or joining a group activity that interests you."
    elif "relationship" in message_lower or "boyfriend" in message_lower or "girlfriend" in message_lower:
        return "Relationship issues can be really challenging. Remember to communicate openly and honestly. It's also important to take care of yourself during difficult times."

    # For other messages, try the AI model with shorter timeout
    query = f"Student said: {message}\nRespond as a supportive wellness AI."
    response = run_with_timeout(agent, query, max_tokens=30)

    reply = getattr(response, "content", None) or str(response)
    sess["last_topic"] = message
    return reply


if __name__ == "__main__":
    print("PulseBot is running! Type 'quit' to exit.\n")
    while True:
        user_input = input("You: ")
        if user_input.lower() in {"quit", "exit"}:
            print("Goodbye! Take care 💙")
            break
        agent = make_agent()
        reply = process_message(agent, user_input, "demo_session")
        print(f"PulseBot: {reply}")
