import random

from app.schemas.generation import (
    ArtGenerationRequest,
    Circle,
)


def generate_circles(
    request: ArtGenerationRequest,
) -> list[Circle]:
    circles: list[Circle] = []

    for _ in range(request.num_elements):
        circles.append(
            Circle(
                x=random.randint(0, request.width),
                y=random.randint(0, request.height),
                radius=random.randint(5, 50),
                color=f"#{random.randint(0, 0xFFFFFF):06x}",
            )
        )

    return circles
