from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Any


class HistoryEntry(BaseModel):
    id: str
    user_id: str
    passport_code: str
    destination_code: str
    result: Any
    created_at: datetime