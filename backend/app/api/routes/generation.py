from fastapi import APIRouter

from app.schemas.generation import ArtGenerationRequest, Circle
from app.services.art_generator import generate_circles

router = APIRouter(tags=["generation"])


@router.post(
    "/generate-art",
    response_model=list[Circle],
)
async def generate_art(
    request: ArtGenerationRequest,
) -> list[Circle]:
    return generate_circles(request)
