from fastapi import APIRouter, HTTPException
from core.database import get_db
from schemas.chat import CreateSessionRequest, CreateMessageRequest

router = APIRouter(prefix="/chat", tags=["Chat"])


# 1. Create session
@router.post("/sessions")
def create_session(payload: CreateSessionRequest):
    db = get_db()

    result = db.table("chat_sessions").insert({
        "user_id": payload.user_id
    }).execute()

    return result.data[0]


# 2. Send message (user message only for now)
@router.post("/messages")
def send_message(payload: CreateMessageRequest):
    db = get_db()

    # check session exists
    session = db.table("chat_sessions") \
        .select("id") \
        .eq("id", payload.session_id) \
        .execute()

    if not session.data:
        raise HTTPException(status_code=404, detail="Session not found")

    message = db.table("chat_messages").insert({
        "session_id": payload.session_id,
        "role": "user",
        "content": payload.content
    }).execute()

    return message.data[0]


# 3. Get messages in session
@router.get("/sessions/{session_id}/messages")
def get_messages(session_id: str):
    db = get_db()

    messages = db.table("chat_messages") \
        .select("*") \
        .eq("session_id", session_id) \
        .order("created_at") \
        .execute()

    return messages.data