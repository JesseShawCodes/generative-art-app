from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)

GENERATE_PATH = "/api/v1/generate-art"


def test_generate_art_default_payload() -> None:
    response = client.post(GENERATE_PATH, json={})
    assert response.status_code == 200
    body = response.json()
    assert body["algorithm"] == "circles"
    assert isinstance(body["seed"], int)
    assert len(body["elements"]) == 50
    assert body["elements"][0]["type"] == "circle"
    assert {"x", "y", "radius", "color"} <= body["elements"][0].keys()


def test_generate_art_custom_count_and_seed() -> None:
    payload = {
        "algorithm": "circles",
        "width": 400,
        "height": 300,
        "num_elements": 10,
        "seed": 123,
        "parameters": {"min_radius": 5, "max_radius": 50},
    }
    response = client.post(GENERATE_PATH, json=payload)
    assert response.status_code == 200
    body = response.json()
    assert body["seed"] == 123
    assert len(body["elements"]) == 10
    for circle in body["elements"]:
        assert circle["type"] == "circle"
        assert 0 <= circle["x"] <= 400
        assert 0 <= circle["y"] <= 300
        assert 5 <= circle["radius"] <= 50
        assert circle["color"].startswith("#")


def test_generate_art_reproducible_via_api() -> None:
    payload = {
        "algorithm": "geometric",
        "width": 240,
        "height": 180,
        "num_elements": 6,
        "seed": 55,
    }
    first = client.post(GENERATE_PATH, json=payload).json()
    second = client.post(GENERATE_PATH, json=payload).json()
    assert first == second


def test_generate_art_rejects_unknown_algorithm() -> None:
    response = client.post(
        GENERATE_PATH,
        json={"algorithm": "not-a-real-algo"},
    )
    assert response.status_code == 422


def test_list_algorithms() -> None:
    response = client.get("/api/v1/algorithms")
    assert response.status_code == 200
    body = response.json()
    ids = {item["id"] for item in body["algorithms"]}
    assert ids == {"circles", "flow_field", "geometric", "particles"}
    assert all("label" in item for item in body["algorithms"])
