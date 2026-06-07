from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Study M"
    database_url: str = "postgresql+psycopg2://postgres:postgres@localhost:5432/study_m"
    secret_key: str = "study-m-dev-secret"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 120
    auto_seed: bool = True
    cors_origins: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ]

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


@lru_cache
def get_settings() -> Settings:
    return Settings()
