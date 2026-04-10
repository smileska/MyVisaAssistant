from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    supabase_url: str = ""
    supabase_key: str = ""

    secret_key: str = "change-me-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24

    hugging_face_api_key: str = ""
    hugging_face_model: str = "mistralai/Mistral-7B-Instruct-v0.2"
    rapidapi_key: str = ""

    resend_api_key: str = ""
    frontend_url: str = "http://localhost:3000"

    class Config:
        env_file = ".env"
        case_sensitive=False


settings = Settings()