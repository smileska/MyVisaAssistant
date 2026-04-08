from fastapi import APIRouter, HTTPException
from schemas.chatbot import ChatRequest, ChatResponse
from services.chatbot_service import chat

router = APIRouter()


@router.post("/message", response_model=ChatResponse)
async def send_message(payload: ChatRequest):
    try:
        reply, session_id = await chat(payload.message, payload.session_id)
        return ChatResponse(reply=reply, session_id=session_id)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Chatbot error: {str(e)}")