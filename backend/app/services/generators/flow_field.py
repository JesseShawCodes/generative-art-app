from __future__ import annotations

import math
import random

from app.schemas.generation import ArtElement, ArtGenerationRequest, LineElement
from app.services.generators.base import as_float, as_int, clamp, pick_color


def _angle_at(x: float, y: float, scale: float, time: float) -> float:
    """Simple analytic flow field (no external noise dependency)."""
    nx = x * scale
    ny = y * scale
    return (
        math.sin(nx * 0.7 + time)
        + math.cos(ny * 0.9 - time * 0.5)
        + math.sin((nx + ny) * 0.35)
    ) * math.pi


def generate_flow_field(
    request: ArtGenerationRequest,
    rng: random.Random,
) -> list[ArtElement]:
    params = request.parameters
    scale = max(0.001, as_float(params, "scale", 0.012))
    step_length = max(1.0, as_float(params, "step_length", 4.0))
    steps = max(2, as_int(params, "steps", 28))
    thickness = max(0.5, as_float(params, "thickness", 1.2))

    elements: list[ArtElement] = []
    time = rng.uniform(0, math.tau)

    for _ in range(request.num_elements):
        x = rng.uniform(0, request.width)
        y = rng.uniform(0, request.height)
        color = pick_color(rng, params)
        opacity = rng.uniform(0.35, 0.9)

        for _step in range(steps):
            angle = _angle_at(x, y, scale, time)
            x2 = x + math.cos(angle) * step_length
            y2 = y + math.sin(angle) * step_length

            if (
                x2 < -20
                or y2 < -20
                or x2 > request.width + 20
                or y2 > request.height + 20
            ):
                break

            elements.append(
                LineElement(
                    x1=x,
                    y1=y,
                    x2=x2,
                    y2=y2,
                    color=color,
                    thickness=thickness,
                    opacity=opacity,
                )
            )
            x, y = clamp(x2, 0, request.width), clamp(y2, 0, request.height)

    return elements
