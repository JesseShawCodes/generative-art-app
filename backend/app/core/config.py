import json
from typing import Annotated, Any, Literal

from pydantic import Field, field_validator, model_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict

EnvironmentName = Literal["development", "staging", "production", "test"]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    app_name: str = "Generative Art API"
    app_version: str = "0.1.0"
    environment: EnvironmentName = "development"
    frontend_url: str = "http://localhost:3000"
    api_v1_prefix: str = "/api/v1"
    log_level: str = "INFO"
    # None = auto (JSON in production/staging, plain in development/test)
    log_json: bool | None = None
    # Soft request budget surfaced to clients / docs; gunicorn also enforces a timeout.
    request_timeout_seconds: float = Field(default=30.0, gt=0, le=300)
    backend_cors_origins: Annotated[list[str], NoDecode] = Field(
        default_factory=lambda: ["http://localhost:3000"]
    )

    @field_validator("environment", mode="before")
    @classmethod
    def normalize_environment(cls, value: Any) -> Any:
        if isinstance(value, str):
            return value.strip().lower()
        return value

    @field_validator("log_level", mode="before")
    @classmethod
    def normalize_log_level(cls, value: Any) -> Any:
        if isinstance(value, str):
            return value.strip().upper()
        return value

    @field_validator("backend_cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, value: Any) -> Any:
        if value is None:
            return []
        if isinstance(value, str):
            stripped = value.strip()
            if not stripped:
                return []
            if stripped.startswith("["):
                return json.loads(stripped)
            return [origin.strip() for origin in stripped.split(",") if origin.strip()]
        return value

    @model_validator(mode="after")
    def validate_production_cors(self) -> "Settings":
        if self.environment == "production":
            if not self.backend_cors_origins:
                raise ValueError(
                    "BACKEND_CORS_ORIGINS must be set to an explicit allow-list "
                    "when ENVIRONMENT=production"
                )
            if any(origin.strip() == "*" for origin in self.backend_cors_origins):
                raise ValueError(
                    "Wildcard CORS origin '*' is not allowed when "
                    "ENVIRONMENT=production"
                )
        return self

    @property
    def is_production(self) -> bool:
        return self.environment == "production"

    @property
    def is_development(self) -> bool:
        return self.environment == "development"

    @property
    def use_json_logging(self) -> bool:
        if self.log_json is not None:
            return self.log_json
        return self.environment in {"production", "staging"}

    @property
    def docs_url(self) -> str | None:
        return None if self.is_production else "/docs"

    @property
    def redoc_url(self) -> str | None:
        return None if self.is_production else "/redoc"

    @property
    def openapi_url(self) -> str | None:
        return None if self.is_production else "/openapi.json"


settings = Settings()
