from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import api_v1_router
from app.api.routes.health import build_health_response
from app.core.config import settings
from app.core.errors import register_exception_handlers
from app.core.logging import configure_logging
from app.core.middleware import RequestContextMiddleware
from app.schemas.generation import HealthResponse

configure_logging(level=settings.log_level, json_logs=settings.use_json_logging)

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    docs_url=settings.docs_url,
    redoc_url=settings.redoc_url,
    openapi_url=settings.openapi_url,
)

app.add_middleware(RequestContextMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.backend_cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Accept", "Content-Type", "X-Request-ID"],
    expose_headers=["X-Request-ID"],
    max_age=600,
)

register_exception_handlers(app, settings)
app.include_router(api_v1_router, prefix=settings.api_v1_prefix)


@app.get("/", response_model=HealthResponse, include_in_schema=False)
async def root() -> HealthResponse:
    """Lightweight root probe for platforms that hit `/` by default."""
    return build_health_response()
