import pytest
from pydantic import ValidationError

from app.core.config import Settings


def test_cors_origins_from_comma_separated_env(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv(
        "BACKEND_CORS_ORIGINS",
        "http://localhost:3000, https://example.com",
    )
    monkeypatch.setenv("FRONTEND_URL", "http://localhost:3000")
    monkeypatch.setenv("ENVIRONMENT", "staging")

    settings = Settings()

    assert settings.environment == "staging"
    assert settings.frontend_url == "http://localhost:3000"
    assert settings.backend_cors_origins == [
        "http://localhost:3000",
        "https://example.com",
    ]
    assert settings.use_json_logging is True


def test_cors_origins_from_json_env(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv(
        "BACKEND_CORS_ORIGINS",
        '["http://localhost:3000","https://pixel-bloom.netlify.app"]',
    )

    settings = Settings()

    assert settings.backend_cors_origins == [
        "http://localhost:3000",
        "https://pixel-bloom.netlify.app",
    ]


def test_default_cors_is_localhost_only(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.delenv("BACKEND_CORS_ORIGINS", raising=False)
    monkeypatch.setenv("ENVIRONMENT", "development")

    # Ignore backend/.env so this asserts the coded default, not local overrides.
    settings = Settings(_env_file=None)

    assert settings.backend_cors_origins == ["http://localhost:3000"]


def test_production_requires_cors_origins(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("ENVIRONMENT", "production")
    monkeypatch.setenv("BACKEND_CORS_ORIGINS", "")

    with pytest.raises(ValidationError, match="BACKEND_CORS_ORIGINS"):
        Settings()


def test_production_rejects_wildcard_cors(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("ENVIRONMENT", "production")
    monkeypatch.setenv("BACKEND_CORS_ORIGINS", "*")

    with pytest.raises(ValidationError, match="Wildcard"):
        Settings()


def test_development_uses_plain_logging_by_default(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setenv("ENVIRONMENT", "development")
    monkeypatch.delenv("LOG_JSON", raising=False)

    settings = Settings()

    assert settings.use_json_logging is False
    assert settings.docs_url == "/docs"
    assert settings.is_production is False


def test_production_hides_docs(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("ENVIRONMENT", "production")
    monkeypatch.setenv(
        "BACKEND_CORS_ORIGINS",
        "https://pixel-bloom.netlify.app",
    )

    settings = Settings()

    assert settings.is_production is True
    assert settings.docs_url is None
    assert settings.openapi_url is None
    assert settings.use_json_logging is True
