from fastapi import APIRouter, HTTPException, status, Depends
from schemas.auth import RegisterRequest, LoginRequest, TokenResponse
from core.security import hash_password, verify_password, create_access_token
from core.database import get_db

router = APIRouter()


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(payload: RegisterRequest):
    db = get_db()

    existing = db.table("users").select("id").eq("email", payload.email).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="Email already registered")

    existing_username = db.table("users").select("id").eq("username", payload.username).execute()
    if existing_username.data:
        raise HTTPException(status_code=400, detail="Username already taken")

    db.table("users").insert({
        "first_name": payload.first_name,
        "last_name": payload.last_name,
        "username": payload.username,
        "email": payload.email,
        "password_hash": hash_password(payload.password),
    }).execute()

    return {"message": "Registration successful. Please verify your email."}


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest):
    db = get_db()

    result = db.table("users").select("*").eq("email", payload.email).execute()
    if not result.data:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    user = result.data[0]
    if not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"sub": user["id"], "email": user["email"]})
    return TokenResponse(access_token=token)