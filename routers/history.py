from fastapi import APIRouter, Depends
from core.security import get_current_user
from core.database import get_db

router = APIRouter()


@router.get("/")
async def get_history(current_user: dict = Depends(get_current_user)):
    db = get_db()
    result = db.table("search_history") \
        .select("*") \
        .eq("user_id", current_user["sub"]) \
        .order("created_at", desc=True) \
        .execute()
    return result.data


@router.get("/{entry_id}")
async def get_history_entry(entry_id: str, current_user: dict = Depends(get_current_user)):
    db = get_db()
    result = db.table("search_history") \
        .select("*") \
        .eq("id", entry_id) \
        .eq("user_id", current_user["sub"]) \
        .execute()
    if not result.data:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Entry not found")
    return result.data[0]


@router.delete("/{entry_id}", status_code=204)
async def delete_history_entry(entry_id: str, current_user: dict = Depends(get_current_user)):
    db = get_db()
    db.table("search_history") \
        .delete() \
        .eq("id", entry_id) \
        .eq("user_id", current_user["sub"]) \
        .execute()