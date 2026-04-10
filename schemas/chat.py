from pydantic import BaseModel


class CreateSessionRequest(BaseModel):
    user_id: str


class CreateMessageRequest(BaseModel):
    session_id: str
    content: str