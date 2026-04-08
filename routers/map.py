from fastapi import APIRouter, HTTPException
from services.visa_service import fetch_map_colors

router = APIRouter()


@router.get("/colors/{passport_code}")
async def get_map_colors(passport_code: str):
    """Returns country color categories for the interactive map."""
    try:
        colors = await fetch_map_colors(passport_code)
        return {"passport_code": passport_code.upper(), "colors": colors}
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Failed to fetch map data: {str(e)}")