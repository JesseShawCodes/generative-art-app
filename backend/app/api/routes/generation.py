from fastapi import APIRouter

from app.schemas.generation import ArtGenerationRequest, ArtGenerationResponse
from app.services.generators import generate_art

router = APIRouter(tags=["generation"])


@router.post(
    "/generate-art",
    response_model=ArtGenerationResponse,
)
async def generate_art_endpoint(
    request: ArtGenerationRequest,
) -> ArtGenerationResponse:
    return generate_art(request)
