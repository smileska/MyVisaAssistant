from fastapi import APIRouter, HTTPException, status
from schemas.auth import RegisterRequest, LoginRequest, TokenResponse
from core.security import hash_password, verify_password, create_access_token
from core.database import get_db
from services.email_service import send_verification_email
import secrets
from datetime import datetime, timedelta, timezone

router = APIRouter()


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(payload: RegisterRequest):
    db = get_db()

    if db.table("users").select("id").eq("email", payload.email).execute().data:
        raise HTTPException(status_code=400, detail="Email already registered")

    if db.table("users").select("id").eq("username", payload.username).execute().data:
        raise HTTPException(status_code=400, detail="Username already taken")

    token = secrets.token_urlsafe(32)
    expires_at = datetime.now(timezone.utc) + timedelta(hours=24)

    db.table("users").insert({
        "first_name": payload.first_name,
        "last_name": payload.last_name,
        "username": payload.username,
        "email": payload.email,
        "password_hash": hash_password(payload.password),
        "email_verification_token": token,
        "token_expires_at": expires_at.isoformat(),
    }).execute()

    send_verification_email(payload.email, payload.first_name, token)

    return {"message": "Registration successful. Please check your email to verify your account."}


@router.get("/verify")
async def verify_email(token: str):
    db = get_db()

    result = db.table("users").select("*").eq("email_verification_token", token).execute()
    if not result.data:
        raise HTTPException(status_code=400, detail="Invalid verification token")

    user = result.data[0]

    expires_at = datetime.fromisoformat(user["token_expires_at"])
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)

    if datetime.now(timezone.utc) > expires_at:
        raise HTTPException(status_code=400, detail="Verification token has expired")

    db.table("users").update({
        "is_verified": True,
        "email_verification_token": None,
        "token_expires_at": None,
    }).eq("id", user["id"]).execute()

    return {"message": "Email verified successfully. You can now log in."}


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest):
    db = get_db()

    result = db.table("users").select("*").eq("email", payload.email).execute()
    if not result.data:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    user = result.data[0]

    if not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not user.get("is_verified"):
        raise HTTPException(status_code=403, detail="Please verify your email before logging in")

    token = create_access_token({"sub": user["id"], "email": user["email"]})
    return TokenResponse(access_token=token)