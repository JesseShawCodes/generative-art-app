import random

from app.services.generators.base import (
    as_float,
    as_int,
    clamp,
    palette_colors,
    pick_color,
    random_color,
)


def test_random_color_format() -> None:
    color = random_color(random.Random(1))
    assert color.startswith("#")
    assert len(color) == 7
    int(color[1:], 16)


def test_palette_colors_filters_invalid_entries() -> None:
    colors = palette_colors(
        {
            "colors": [
                "#AABBCC",
                "ddeeff",
                "#abc",
                "zzzzzz",  # length 6 but not hex → ValueError path
                "nothex!",
                123,
                None,
                " #112233 ",
            ]
        }
    )
    assert colors == ["#aabbcc", "#ddeeff", "#112233"]


def test_palette_colors_non_list_returns_empty() -> None:
    assert palette_colors({"colors": "red"}) == []
    assert palette_colors({}) == []


def test_pick_color_uses_palette_or_random() -> None:
    rng = random.Random(0)
    assert pick_color(rng, {"colors": ["#ff0000"]}) == "#ff0000"
    fallback = pick_color(rng, {})
    assert fallback.startswith("#")


def test_clamp() -> None:
    assert clamp(5, 0, 10) == 5
    assert clamp(-1, 0, 10) == 0
    assert clamp(99, 0, 10) == 10


def test_as_float_edge_cases() -> None:
    assert as_float({"x": "1.5"}, "x", 0.0) == 1.5
    assert as_float({"x": True}, "x", 9.0) == 9.0
    assert as_float({"x": None}, "x", 3.0) == 3.0
    assert as_float({"x": "nope"}, "x", 4.0) == 4.0
    assert as_float({}, "x", 2.5) == 2.5
    assert as_float({"x": 7}, "x", 0.0) == 7.0


def test_as_int_edge_cases() -> None:
    assert as_int({"n": "8"}, "n", 0) == 8
    assert as_int({"n": False}, "n", 5) == 5
    assert as_int({"n": None}, "n", 3) == 3
    assert as_int({"n": "nope"}, "n", 4) == 4
    assert as_int({}, "n", 2) == 2
    assert as_int({"n": 7.9}, "n", 0) == 7
