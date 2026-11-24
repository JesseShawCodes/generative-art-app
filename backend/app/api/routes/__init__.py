from fastapi import APIRouter

from app.api.routes.algorithms import router as algorithms_router
from app.api.routes.generation import router as generation_router
from app.api.routes.health import router as health_router

api_v1_router = APIRouter()
api_v1_router.include_router(health_router)
api_v1_router.include_router(algorithms_router)
api_v1_router.include_router(generation_router)

__all__ = ["api_v1_router"]
