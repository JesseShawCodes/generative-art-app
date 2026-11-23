import random

from app.schemas.generation import (
    ArtGenerationRequest,
    Circle,
)

MIN_RADIUS = 5
MAX_RADIUS = 50


def generate_circles(
    request: ArtGenerationRequest,
    seed: int | None = None,
) -> list[Circle]:
    """Generate random circles. Pass ``seed`` for reproducible output."""
    rng = random.Random(seed)
    circles: list[Circle] = []

    for _ in range(request.num_elements):
        circles.append(
            Circle(
                x=rng.randint(0, request.width),
                y=rng.randint(0, request.height),
                radius=rng.randint(MIN_RADIUS, MAX_RADIUS),
                color=f"#{rng.randint(0, 0xFFFFFF):06x}",
            )
        )

    return circles
