from app.core.config import Settings


def test_cors_origins_from_comma_separated_env(monkeypatch) -> None:
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


def test_cors_origins_from_json_env(monkeypatch) -> None:
    monkeypatch.setenv(
        "BACKEND_CORS_ORIGINS",
        '["http://localhost:3000","https://pixel-bloom.netlify.app"]',
    )

    settings = Settings()

    assert settings.backend_cors_origins == [
        "http://localhost:3000",
        "https://pixel-bloom.netlify.app",
    ]
