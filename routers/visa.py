from fastapi import APIRouter, HTTPException, Depends
from schemas.visa import VisaCheckRequest, VisaCheckResponse
from services.visa_service import fetch_visa_info
from core.security import get_current_user
from core.database import get_db
import json

router = APIRouter()


@router.post("/check", response_model=VisaCheckResponse)
async def check_visa(
    payload: VisaCheckRequest,
    current_user: dict = Depends(get_current_user),
):
    try:
        result = await fetch_visa_info(payload.passport_code, payload.destination_code)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Failed to fetch visa data: {str(e)}")

    db = get_db()
    db.table("search_history").insert({
        "user_id": current_user["sub"],
        "passport_code": payload.passport_code.upper(),
        "destination_code": payload.destination_code.upper(),
        "result": result.model_dump(),
    }).execute()

    return result


@router.post("/check/guest", response_model=VisaCheckResponse)
async def check_visa_guest(payload: VisaCheckRequest):
    try:
        return await fetch_visa_info(payload.passport_code, payload.destination_code)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Failed to fetch visa data: {str(e)}")