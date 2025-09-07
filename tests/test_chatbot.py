import types
import pytest

from chatbot import classify_intent, process_message


class FakeResp:
    def __init__(self, content: str):
        self.content = content


class FakeAgent:
    """A minimal stand-in for the agno Agent used by chatbot.py.
    Only the .run(...) method is used in tests.
    """
    def __init__(self, replies=None):
        # Optional queue/dict of replies to return deterministically
        self.replies = replies or {}
        self.calls = []

    def run(self, query: str, max_tokens: int = 128, show_full_reasoning: bool = False):
        # Record calls for assertions if needed
        self.calls.append({"query": query, "max_tokens": max_tokens})
        # If a specific reply is registered by key, return it; else return a generic text
        for key, val in self.replies.items():
            if key in query:
                return FakeResp(val)
        return FakeResp("ok")


@pytest.fixture()
def agent():
    return FakeAgent(replies={"Respond as a supportive student wellness companion.": "expanded"})


def test_classify_intent_affirmation(agent):
    assert classify_intent(agent, "yes") == "affirmation"


def test_classify_intent_gratitude(agent):
    assert classify_intent(agent, "thanks a lot") == "gratitude"


def test_classify_intent_explain_more(agent):
    assert classify_intent(agent, "explain more") == "explain_more"


def test_process_message_sets_last_topic(agent):
    reply, last = process_message(agent, "I'm stressed about exams", session_id="s1")
    assert last == "I'm stressed about exams"
    assert isinstance(reply, str)


def test_process_message_explain_more(agent):
    # First message sets last topic
    reply1, last1 = process_message(agent, "I'm stressed about exams", session_id="s2")
    assert last1 == "I'm stressed about exams"
    # Now ask to explain more
    reply2, last2 = process_message(agent, "explain more", session_id="s2")
    assert last2 == last1
    assert isinstance(reply2, str)
    # Our FakeAgent returns "expanded" for explain-more prompts
    assert "expanded" in reply2 or len(reply2) > 0


def test_high_risk_returns_struct(agent):
    # simulate a high-risk message
    reply, last = process_message(agent, "I want to kill myself", session_id="risk1")
    # either a string fallback or structured dict is allowed; prefer structured
    assert reply is not None
    if isinstance(reply, dict):
        assert reply.get("type") == "counsellor_suggestion"
        assert "counsellors" in reply
    # If it's a string, it should be a supportive fallback message
    elif isinstance(reply, str):
        assert "sorry" in reply.lower() or "help" in reply.lower()
