from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List, Union, Dict, Any
import uvicorn

# Import our local chatbot factory and helpers
from chatbot import make_agent, process_message

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


class CounsellorInfo(BaseModel):
    id: str
    name: str
    specialization: str
    affiliation: str
    fees: int
    experience_years: int
    ranking_score: float
    languages: List[str]
    bio: str

class CounsellorSuggestion(BaseModel):
    type: str = "counsellor_suggestion"
    message: str
    counsellors: List[CounsellorInfo]

class ChatResponse(BaseModel):
    reply: Union[str, CounsellorSuggestion]
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
        reply_data = process_message(payload.session_id, payload.message.strip())
        
        # Handle both string replies and counsellor suggestion dictionaries
        if isinstance(reply_data, dict) and reply_data.get("type") == "counsellor_suggestion":
            # Convert dict to CounsellorSuggestion model
            counsellor_suggestion = CounsellorSuggestion(
                type=reply_data["type"],
                message=reply_data["message"],
                counsellors=[CounsellorInfo(**c) for c in reply_data["counsellors"]]
            )
            return ChatResponse(reply=counsellor_suggestion, last_topic=None)
        else:
            # Regular string reply
            return ChatResponse(reply=str(reply_data), last_topic=None)
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Model error: {e}")


if __name__ == "__main__":
    uvicorn.run("server.main:app", host="0.0.0.0", port=8000, reload=False)
