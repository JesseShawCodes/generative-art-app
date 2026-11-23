import re

import pytest
from pydantic import ValidationError

from app.schemas.generation import ArtGenerationRequest
from app.services.art_generator import (
    MAX_RADIUS,
    MIN_RADIUS,
    generate_circles,
)

HEX_COLOR_RE = re.compile(r"^#[0-9a-f]{6}$")


def test_generate_circles_returns_requested_count() -> None:
    request = ArtGenerationRequest(width=400, height=300, num_elements=10)
    circles = generate_circles(request, seed=42)

    assert len(circles) == 10


def test_generate_circles_coordinates_within_canvas() -> None:
    request = ArtGenerationRequest(width=400, height=300, num_elements=25)
    circles = generate_circles(request, seed=7)

    for circle in circles:
        assert 0 <= circle.x <= 400
        assert 0 <= circle.y <= 300


def test_generate_circles_radii_within_expected_range() -> None:
    request = ArtGenerationRequest(width=800, height=600, num_elements=50)
    circles = generate_circles(request, seed=99)

    for circle in circles:
        assert MIN_RADIUS <= circle.radius <= MAX_RADIUS


def test_generate_circles_colors_are_valid_hex() -> None:
    request = ArtGenerationRequest(width=800, height=600, num_elements=20)
    circles = generate_circles(request, seed=1)

    for circle in circles:
        assert HEX_COLOR_RE.fullmatch(circle.color) is not None


def test_generate_circles_is_deterministic_with_same_seed() -> None:
    request = ArtGenerationRequest(width=400, height=300, num_elements=5)

    first = generate_circles(request, seed=123)
    second = generate_circles(request, seed=123)

    assert first == second


def test_generate_circles_differs_with_different_seeds() -> None:
    request = ArtGenerationRequest(width=400, height=300, num_elements=5)

    first = generate_circles(request, seed=1)
    second = generate_circles(request, seed=2)

    assert first != second


@pytest.mark.parametrize(
    ("field", "value"),
    [
        ("width", 99),
        ("width", 4001),
        ("height", 99),
        ("height", 4001),
    ],
)
def test_rejects_invalid_dimensions(field: str, value: int) -> None:
    payload = {"width": 800, "height": 600, "num_elements": 10, field: value}

    with pytest.raises(ValidationError):
        ArtGenerationRequest(**payload)


@pytest.mark.parametrize("num_elements", [0, -1, 1001])
def test_rejects_negative_or_excessive_element_counts(num_elements: int) -> None:
    with pytest.raises(ValidationError):
        ArtGenerationRequest(width=800, height=600, num_elements=num_elements)
