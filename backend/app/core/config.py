from pydantic import field_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://mundial:mundial@localhost:5432/mundial"
    JWT_SECRET: str = "change-me-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    FOOTBALL_API_KEY: str = ""
    FOOTBALL_API_BASE_URL: str = "https://api.football-data.org/v4"
    FOOTBALL_API_VERIFY_SSL: bool = True

    TELEGRAM_BOT_TOKEN: str = ""
    TELEGRAM_CHANNEL_ID: str = ""

    CORS_ORIGINS: list[str] = ["http://localhost:5173"]

    ADMIN_USERNAME: str = "admin"
    ADMIN_PASSWORD: str = "change-me-in-production"

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v: object) -> list[str]:
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v  # type: ignore[return-value]

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
