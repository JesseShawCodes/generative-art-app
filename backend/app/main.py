from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import generation_router
from app.core.config import settings
from app.schemas.generation import HealthResponse

app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.backend_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(generation_router)


@app.get("/", response_model=HealthResponse)
async def root() -> HealthResponse:
    return HealthResponse(message="Generative Art API is running!")
