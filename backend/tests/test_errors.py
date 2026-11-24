import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.core.config import Settings
from app.core.errors import register_exception_handlers


def test_unhandled_exception_hides_details_in_production(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setenv("ENVIRONMENT", "production")
    monkeypatch.setenv(
        "BACKEND_CORS_ORIGINS",
        "https://pixel-bloom.netlify.app",
    )
    prod_settings = Settings()

    app = FastAPI()
    register_exception_handlers(app, prod_settings)

    @app.get("/boom")
    async def boom() -> None:
        raise RuntimeError("secret failure detail")

    client = TestClient(app, raise_server_exceptions=False)
    response = client.get("/boom")

    assert response.status_code == 500
    assert response.json() == {"detail": "Internal server error"}


def test_unhandled_exception_includes_details_outside_production(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setenv("ENVIRONMENT", "development")
    monkeypatch.delenv("BACKEND_CORS_ORIGINS", raising=False)
    dev_settings = Settings()

    app = FastAPI()
    register_exception_handlers(app, dev_settings)

    @app.get("/boom")
    async def boom() -> None:
        raise RuntimeError("secret failure detail")

    client = TestClient(app, raise_server_exceptions=False)
    response = client.get("/boom")

    assert response.status_code == 500
    assert "secret failure detail" in response.json()["detail"]
