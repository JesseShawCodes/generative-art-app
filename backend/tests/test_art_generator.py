from app.schemas.generation import ArtGenerationRequest
from app.services.art_generator import generate_circles


def test_generate_circles_count_and_bounds() -> None:
    request = ArtGenerationRequest(width=400, height=300, num_elements=10)
    circles = generate_circles(request)

    assert len(circles) == 10
    for circle in circles:
        assert 0 <= circle.x <= 400
        assert 0 <= circle.y <= 300
        assert 5 <= circle.radius <= 50
        assert circle.color.startswith("#")
        assert len(circle.color) == 7
