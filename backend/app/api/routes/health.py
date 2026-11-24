from fastapi import APIRouter

from app.core.config import settings
from app.schemas.generation import HealthResponse

router = APIRouter(tags=["health"])


def build_health_response() -> HealthResponse:
    return HealthResponse(
        message="Generative Art API is running!",
        environment=settings.environment,
        version=settings.app_version,
    )


@router.get("/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    return build_health_response()
