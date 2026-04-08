from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    supabase_url: str = ""
    supabase_key: str = ""

    secret_key: str = "change-me-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24

    travel_buddy_api_url: str = "https://travel-buddy.ai/api"
    hugging_face_api_key: str = ""
    hugging_face_model: str = "mistralai/Mistral-7B-Instruct-v0.2"
    rapidapi_key: str = ""

    class Config:
        env_file = ".env"


settings = Settings()