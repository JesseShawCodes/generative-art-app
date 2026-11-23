from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_generate_art_default_payload() -> None:
    response = client.post("/generate-art", json={})
    assert response.status_code == 200
    circles = response.json()
    assert len(circles) == 50
    assert {"x", "y", "radius", "color"} <= circles[0].keys()


def test_generate_art_custom_count() -> None:
    payload = {"width": 400, "height": 300, "num_elements": 10}
    response = client.post("/generate-art", json=payload)
    assert response.status_code == 200
    circles = response.json()
    assert len(circles) == 10
    for circle in circles:
        assert 0 <= circle["x"] <= 400
        assert 0 <= circle["y"] <= 300
        assert 5 <= circle["radius"] <= 50
        assert circle["color"].startswith("#")
        assert len(circle["color"]) == 7
