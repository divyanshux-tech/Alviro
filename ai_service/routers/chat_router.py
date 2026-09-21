from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
import traceback
from services.agent_service import agent_service
from services.tts_service import tts_service

router = APIRouter(prefix="/api/ai", tags=["Conversational Agent"])

class ChatRequest(BaseModel):
    message: str = Field(..., description="Customer message")
    session_id: Optional[str] = "default"
    history: Optional[List[Dict[str, str]]] = []
    cart_context: Optional[str] = ""

class ChatResponse(BaseModel):
    reply: str
    action_type: str
    voice_summary: Optional[str] = None
    suggested_dishes: List[Dict[str, Any]] = []
    quick_replies: List[str] = []
    session_id: str

@router.post("/chat", response_model=ChatResponse)
async def chat_with_assistant(request: ChatRequest):
    """Multi-turn conversational chat with DineMate AI Agent (Sofia)."""
    try:
        result = await agent_service.process_chat(
            message=request.message,
            session_id=request.session_id,
            client_history=request.history,
            cart_context=request.cart_context or ""
        )
        # Ensure all required keys exist with safe defaults
        return {
            "reply": result.get("reply", "I'm here to help — what can I do for you?"),
            "action_type": result.get("action_type", "chat"),
            "voice_summary": result.get("voice_summary", ""),
            "suggested_dishes": result.get("suggested_dishes", []),
            "quick_replies": result.get("quick_replies", []),
            "session_id": result.get("session_id", request.session_id or "default")
        }
    except Exception as e:
        # Log full traceback to terminal so we can see what broke
        print(f"\n[ChatRouter] ❌ ERROR processing chat:\n{traceback.format_exc()}\n")
        raise HTTPException(
            status_code=500,
            detail=f"{type(e).__name__}: {str(e)}"
        )

@router.get("/tts")
async def get_tts_audio(text: str = Query(..., description="Text to synthesize")):
    """Generates text-to-speech audio on the fly using edge-tts."""
    try:
        # Clean markdown characters that might affect TTS
        clean_text = text.replace("**", "").replace("*", "").replace("#", "").strip()
        audio_stream = await tts_service.generate_audio_stream(clean_text)
        return StreamingResponse(audio_stream, media_type="audio/mpeg")
    except Exception as e:
        print(f"[ChatRouter] TTS Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate audio")
