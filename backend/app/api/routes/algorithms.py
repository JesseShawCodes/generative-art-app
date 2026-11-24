from fastapi import APIRouter

from app.schemas.generation import (
    ALGORITHM_LABELS,
    Algorithm,
    AlgorithmInfo,
    AlgorithmsResponse,
)

router = APIRouter(tags=["algorithms"])


@router.get("/algorithms", response_model=AlgorithmsResponse)
async def list_algorithms() -> AlgorithmsResponse:
    return AlgorithmsResponse(
        algorithms=[
            AlgorithmInfo(id=algorithm, label=ALGORITHM_LABELS[algorithm])
            for algorithm in Algorithm
        ]
    )
