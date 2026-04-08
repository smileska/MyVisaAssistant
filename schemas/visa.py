from pydantic import BaseModel
from typing import Optional


class VisaCheckRequest(BaseModel):
    passport_code: str   # e.g. "MK"
    destination_code: str  # e.g. "ID"


class VisaRuleInfo(BaseModel):
    name: str
    duration: Optional[str]
    color: str
    link: Optional[str]


class MandatoryRegistration(BaseModel):
    name: str
    color: str
    link: Optional[str]


class DestinationInfo(BaseModel):
    code: str
    name: str
    continent: str
    capital: str
    currency: str
    exchange: Optional[str]
    passport_validity: Optional[str]
    phone_code: Optional[str]
    timezone: Optional[str]
    population: Optional[int]
    area_km2: Optional[int]
    embassy_url: Optional[str]


class VisaCheckResponse(BaseModel):
    passport_code: str
    destination: DestinationInfo
    visa_rule: VisaRuleInfo
    mandatory_registration: Optional[MandatoryRegistration]