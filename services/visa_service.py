import httpx
from core.config import settings
from schemas.visa import VisaCheckResponse, DestinationInfo, VisaRuleInfo, MandatoryRegistration

RAPIDAPI_HOST = "visa-requirement.p.rapidapi.com"


async def fetch_visa_info(passport_code: str, destination_code: str) -> VisaCheckResponse:
    url = "https://visa-requirement.p.rapidapi.com/v2/visa/check"
    headers = {
        "x-rapidapi-key": settings.rapidapi_key,
        "x-rapidapi-host": RAPIDAPI_HOST,
        "Content-Type": "application/x-www-form-urlencoded",
    }
    data = {
        "passport": passport_code.upper(),
        "destination": destination_code.upper(),
    }

    async with httpx.AsyncClient(timeout=10) as client:
        response = await client.post(url, data=data, headers=headers)
        response.raise_for_status()
        data = response.json()["data"]

    dest = data["destination"]
    primary = data["visa_rules"]["primary_rule"]
    mandatory = data.get("mandatory_registration")

    return VisaCheckResponse(
        passport_code=passport_code.upper(),
        destination=DestinationInfo(
            code=dest["code"],
            name=dest["name"],
            continent=dest["continent"],
            capital=dest["capital"],
            currency=dest["currency"],
            exchange=dest.get("exchange"),
            passport_validity=dest.get("passport_validity"),
            phone_code=dest.get("phone_code"),
            timezone=dest.get("timezone"),
            population=dest.get("population"),
            area_km2=dest.get("area_km2"),
            embassy_url=dest.get("embassy_url"),
        ),
        visa_rule=VisaRuleInfo(
            name=primary["name"],
            duration=primary.get("duration"),
            color=primary["color"],
            link=primary.get("link"),
        ),
        mandatory_registration=MandatoryRegistration(
            name=mandatory["name"],
            color=mandatory["color"],
            link=mandatory.get("link"),
        ) if mandatory else None,
    )


async def fetch_map_colors(passport_code: str) -> dict:
    url = "https://visa-requirement.p.rapidapi.com/v2/visa/map"
    headers = {
        "x-rapidapi-key": settings.rapidapi_key,
        "x-rapidapi-host": RAPIDAPI_HOST,
        "Content-Type": "application/x-www-form-urlencoded",
    }

    async with httpx.AsyncClient(timeout=10) as client:
        response = await client.post(url, data={"passport": passport_code.upper()}, headers=headers)
        response.raise_for_status()
        result = response.json()["data"]

    return result.get("colors", {})