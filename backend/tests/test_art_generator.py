from app.schemas.generation import Algorithm, ArtGenerationRequest
from app.services.generators import generate_art


def test_generate_circles_count_and_bounds() -> None:
    request = ArtGenerationRequest(
        algorithm=Algorithm.CIRCLES,
        width=400,
        height=300,
        num_elements=10,
        seed=7,
        parameters={"min_radius": 5, "max_radius": 50},
    )
    result = generate_art(request)

    assert result.algorithm == Algorithm.CIRCLES
    assert result.seed == 7
    assert len(result.elements) == 10
    for element in result.elements:
        assert element.type == "circle"
        assert 0 <= element.x <= 400
        assert 0 <= element.y <= 300
        assert 5 <= element.radius <= 50
        assert element.color.startswith("#")
        assert len(element.color) == 7


def test_same_seed_is_reproducible() -> None:
    request = ArtGenerationRequest(
        algorithm=Algorithm.FLOW_FIELD,
        width=200,
        height=200,
        num_elements=5,
        seed=42,
    )
    first = generate_art(request)
    second = generate_art(request)

    assert first.model_dump() == second.model_dump()


def test_different_seeds_differ() -> None:
    base = {
        "algorithm": Algorithm.GEOMETRIC,
        "width": 200,
        "height": 200,
        "num_elements": 8,
    }
    a = generate_art(ArtGenerationRequest(**base, seed=1))
    b = generate_art(ArtGenerationRequest(**base, seed=2))
    assert a.model_dump() != b.model_dump()


def test_missing_seed_is_assigned() -> None:
    result = generate_art(
        ArtGenerationRequest(algorithm=Algorithm.PARTICLES, num_elements=3)
    )
    assert isinstance(result.seed, int)
    assert result.seed >= 0
    assert len(result.elements) > 0


def test_each_algorithm_returns_expected_element_types() -> None:
    cases = {
        Algorithm.CIRCLES: {"circle"},
        Algorithm.FLOW_FIELD: {"line"},
        Algorithm.GEOMETRIC: {"polygon"},
        Algorithm.PARTICLES: {"circle", "line"},
    }
    for algorithm, expected_types in cases.items():
        result = generate_art(
            ArtGenerationRequest(
                algorithm=algorithm,
                width=300,
                height=300,
                num_elements=4,
                seed=99,
            )
        )
        actual_types = {element.type for element in result.elements}
        assert actual_types == expected_types
