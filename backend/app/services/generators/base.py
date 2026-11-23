from __future__ import annotations

import random
from typing import Protocol

from app.schemas.generation import ArtElement, ArtGenerationRequest


class ArtGenerator(Protocol):
    """Common interface for all generative algorithms."""

    def generate(
        self,
        request: ArtGenerationRequest,
        rng: random.Random,
    ) -> list[ArtElement]:
        """Produce drawable elements for the given request."""
        ...


def random_color(rng: random.Random) -> str:
    return f"#{rng.randint(0, 0xFFFFFF):06x}"


def clamp(value: float, low: float, high: float) -> float:
    return max(low, min(high, value))


def as_float(params: dict[str, object], key: str, default: float) -> float:
    value = params.get(key, default)
    if isinstance(value, bool) or not isinstance(value, (int, float, str)):
        return default
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def as_int(params: dict[str, object], key: str, default: int) -> int:
    value = params.get(key, default)
    if isinstance(value, bool) or not isinstance(value, (int, float, str)):
        return default
    try:
        return int(value)
    except (TypeError, ValueError):
        return default
