from __future__ import annotations

import random

from app.schemas.generation import ArtElement, ArtGenerationRequest, CircleElement
from app.services.generators.base import as_float, random_color


def generate_circles(
    request: ArtGenerationRequest,
    rng: random.Random,
) -> list[ArtElement]:
    params = request.parameters
    min_radius = max(1.0, as_float(params, "min_radius", 5.0))
    max_radius = max(min_radius, as_float(params, "max_radius", 50.0))

    elements: list[ArtElement] = []
    for _ in range(request.num_elements):
        elements.append(
            CircleElement(
                x=rng.uniform(0, request.width),
                y=rng.uniform(0, request.height),
                radius=rng.uniform(min_radius, max_radius),
                color=random_color(rng),
                opacity=rng.uniform(0.55, 1.0),
            )
        )
    return elements
