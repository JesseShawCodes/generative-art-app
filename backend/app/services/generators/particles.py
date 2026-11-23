from __future__ import annotations

import math
import random

from app.schemas.generation import (
    ArtElement,
    ArtGenerationRequest,
    CircleElement,
    LineElement,
)
from app.services.generators.base import as_float, as_int, clamp, random_color


def generate_particles(
    request: ArtGenerationRequest,
    rng: random.Random,
) -> list[ArtElement]:
    params = request.parameters
    trail_length = max(2, as_int(params, "trail_length", 12))
    particle_radius = max(0.5, as_float(params, "particle_radius", 2.5))
    speed = max(0.5, as_float(params, "speed", 6.0))

    elements: list[ArtElement] = []

    for _ in range(request.num_elements):
        x = rng.uniform(0, request.width)
        y = rng.uniform(0, request.height)
        angle = rng.uniform(0, math.tau)
        vx = math.cos(angle) * speed
        vy = math.sin(angle) * speed
        color = random_color(rng)
        opacity = rng.uniform(0.45, 1.0)

        prev_x, prev_y = x, y
        for step in range(trail_length):
            # Mild curl so trails feel organic rather than straight.
            angle += rng.uniform(-0.35, 0.35)
            vx = math.cos(angle) * speed
            vy = math.sin(angle) * speed
            x = clamp(x + vx, 0, request.width)
            y = clamp(y + vy, 0, request.height)

            fade = 1.0 - (step / trail_length) * 0.7
            elements.append(
                LineElement(
                    x1=prev_x,
                    y1=prev_y,
                    x2=x,
                    y2=y,
                    color=color,
                    thickness=max(0.6, particle_radius * fade),
                    opacity=opacity * fade,
                )
            )
            prev_x, prev_y = x, y

        elements.append(
            CircleElement(
                x=x,
                y=y,
                radius=particle_radius,
                color=color,
                opacity=opacity,
            )
        )

    return elements
