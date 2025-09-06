from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List
import uvicorn

# Import our local chatbot factory and helpers
from chatbot import make_agent, get_token_limit

app = FastAPI(title="Pulse AI Chat API", version="1.0.0")

# CORS: allow localhost dev and any provided origins
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "*",  # adjust as needed; for production, restrict this
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1)
    session_id: Optional[str] = None
    last_topic: Optional[str] = None


class ChatResponse(BaseModel):
    reply: str
    last_topic: Optional[str] = None


# Create a single agent instance for the server process
try:
    agent = make_agent()
except Exception as e:
    # Defer failure until first request, but log it
    agent = None
    import traceback
    traceback.print_exc()


@app.get("/health")
async def health():
    return {"ok": True}


@app.post("/api/chat", response_model=ChatResponse)
async def api_chat(payload: ChatRequest):
    global agent
    if not payload.message or not payload.message.strip():
        raise HTTPException(status_code=400, detail="Empty message")

    # Lazily construct the agent if earlier init failed
    if agent is None:
        try:
            agent = make_agent()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to initialize agent: {e}")

    try:
        user_input = payload.message.strip()
        # Decide query according to the chatbot rules in chatbot.py
        if "explain more" in user_input.lower() and payload.last_topic:
            query = (
                f"Explain more about the SYMPTOMS and PRECAUTIONS of {payload.last_topic}. "
                "Do not add history, treatment, or statistics."
            )
            new_last_topic = payload.last_topic
        else:
            query = user_input
            new_last_topic = user_input  # assume new topic

        token_limit = get_token_limit(user_input)
        response = agent.run(query, max_tokens=token_limit, show_full_reasoning=False)
        reply_text = getattr(response, "content", None) or str(response)
        return ChatResponse(reply=reply_text, last_topic=new_last_topic)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Model error: {e}")


if __name__ == "__main__":
    uvicorn.run("server.main:app", host="0.0.0.0", port=8000, reload=False)
