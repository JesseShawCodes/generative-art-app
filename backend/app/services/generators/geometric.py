from __future__ import annotations

import math
import random

from app.schemas.generation import (
    ArtElement,
    ArtGenerationRequest,
    Point,
    PolygonElement,
)
from app.services.generators.base import as_float, as_int, pick_color


def _regular_polygon(
    cx: float,
    cy: float,
    radius: float,
    sides: int,
    rotation: float,
) -> list[Point]:
    points: list[Point] = []
    for i in range(sides):
        angle = rotation + (math.tau * i / sides)
        points.append(
            Point(
                x=cx + math.cos(angle) * radius,
                y=cy + math.sin(angle) * radius,
            )
        )
    return points


def generate_geometric(
    request: ArtGenerationRequest,
    rng: random.Random,
) -> list[ArtElement]:
    params = request.parameters
    min_sides = max(3, as_int(params, "min_sides", 3))
    max_sides = max(min_sides, as_int(params, "max_sides", 6))
    min_size = max(4.0, as_float(params, "min_size", 12.0))
    max_size = max(min_size, as_float(params, "max_size", 70.0))

    elements: list[ArtElement] = []
    for _ in range(request.num_elements):
        sides = rng.randint(min_sides, max_sides)
        radius = rng.uniform(min_size, max_size)
        cx = rng.uniform(radius, max(radius, request.width - radius))
        cy = rng.uniform(radius, max(radius, request.height - radius))
        elements.append(
            PolygonElement(
                points=_regular_polygon(
                    cx,
                    cy,
                    radius,
                    sides,
                    rotation=rng.uniform(0, math.tau),
                ),
                color=pick_color(rng, params),
                filled=rng.random() > 0.25,
                opacity=rng.uniform(0.4, 0.95),
            )
        )
    return elements
