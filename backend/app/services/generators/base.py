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


def _normalize_hex_color(value: object) -> str | None:
    if not isinstance(value, str):
        return None
    color = value.strip()
    if color.startswith("#"):
        color = color[1:]
    if len(color) != 6:
        return None
    try:
        int(color, 16)
    except ValueError:
        return None
    return f"#{color.lower()}"


def palette_colors(params: dict[str, object]) -> list[str]:
    """Extract valid hex colors from ``parameters.colors`` if provided."""
    raw = params.get("colors")
    if not isinstance(raw, list):
        return []
    colors: list[str] = []
    for item in raw:
        normalized = _normalize_hex_color(item)
        if normalized is not None:
            colors.append(normalized)
    return colors


def pick_color(rng: random.Random, params: dict[str, object]) -> str:
    """Pick from ``parameters.colors`` when set; otherwise a random hex color."""
    colors = palette_colors(params)
    if colors:
        return rng.choice(colors)
    return random_color(rng)


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
