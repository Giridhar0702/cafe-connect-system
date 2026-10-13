from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+psycopg2://postgres:postgres@localhost:5432/cafe_connect"
    FALLBACK_TO_SQLITE: bool = True
    JWT_SECRET: str = "supersecretkey_cafe_connect_system_2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    ADMIN_USERNAME: str = "admin"
    ADMIN_PASSWORD: str = "admin123"
    FRONTEND_ORIGIN: str = "http://localhost:5173"
    PORT: int = 8000

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
