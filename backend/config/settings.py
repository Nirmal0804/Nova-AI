from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    OPENROUTER_API_KEY: str                            # Required — set in .env
    OPENROUTER_BASE_URL: str = "https://openrouter.ai/api/v1"
    MODEL_NAME: str | None = None
    LOG_LEVEL: str = "INFO"

    class Config:
        env_file = ".env"

settings = Settings()
