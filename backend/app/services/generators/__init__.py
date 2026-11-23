from __future__ import annotations

import random
from collections.abc import Callable

from app.schemas.generation import (
    Algorithm,
    ArtElement,
    ArtGenerationRequest,
    ArtGenerationResponse,
)
from app.services.generators.circles import generate_circles
from app.services.generators.flow_field import generate_flow_field
from app.services.generators.geometric import generate_geometric
from app.services.generators.particles import generate_particles

GeneratorFn = Callable[[ArtGenerationRequest, random.Random], list[ArtElement]]

GENERATORS: dict[Algorithm, GeneratorFn] = {
    Algorithm.CIRCLES: generate_circles,
    Algorithm.FLOW_FIELD: generate_flow_field,
    Algorithm.GEOMETRIC: generate_geometric,
    Algorithm.PARTICLES: generate_particles,
}


def generate_art(request: ArtGenerationRequest) -> ArtGenerationResponse:
    """Dispatch to the selected algorithm and always return a concrete seed."""
    seed = request.seed if request.seed is not None else random.randint(0, 2**31 - 1)
    rng = random.Random(seed)
    generator = GENERATORS[request.algorithm]
    elements = generator(request, rng)
    return ArtGenerationResponse(
        algorithm=request.algorithm,
        seed=seed,
        width=request.width,
        height=request.height,
        elements=elements,
    )


__all__ = ["GENERATORS", "generate_art"]
