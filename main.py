from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import auth, visa, chatbot, history, map

app = FastAPI(
    title="MyVisaAssistant API",
    description="Backend API for MyVisaAssistant - visa information platform",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router,    prefix="/auth",    tags=["Authentication"])
app.include_router(visa.router,    prefix="/visa",    tags=["Visa"])
app.include_router(chatbot.router, prefix="/chatbot", tags=["Chatbot"])
app.include_router(history.router, prefix="/history", tags=["History"])
app.include_router(map.router,     prefix="/map",     tags=["Map"])


@app.get("/")
def root():
    return {"message": "MyVisaAssistant API is running"}