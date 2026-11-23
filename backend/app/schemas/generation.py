from enum import Enum
from typing import Annotated, Any, Literal

from pydantic import BaseModel, Field


class Algorithm(str, Enum):
    CIRCLES = "circles"
    FLOW_FIELD = "flow_field"
    GEOMETRIC = "geometric"
    PARTICLES = "particles"


class Point(BaseModel):
    x: float
    y: float


class CircleElement(BaseModel):
    type: Literal["circle"] = "circle"
    x: float
    y: float
    radius: float
    color: str
    opacity: float = Field(default=1.0, ge=0.0, le=1.0)


class LineElement(BaseModel):
    type: Literal["line"] = "line"
    x1: float
    y1: float
    x2: float
    y2: float
    color: str
    thickness: float = Field(default=1.0, gt=0)
    opacity: float = Field(default=1.0, ge=0.0, le=1.0)


class PolygonElement(BaseModel):
    type: Literal["polygon"] = "polygon"
    points: list[Point] = Field(min_length=3)
    color: str
    filled: bool = True
    opacity: float = Field(default=1.0, ge=0.0, le=1.0)


ArtElement = Annotated[
    CircleElement | LineElement | PolygonElement,
    Field(discriminator="type"),
]


class ArtGenerationRequest(BaseModel):
    algorithm: Algorithm = Algorithm.CIRCLES
    width: int = Field(default=800, ge=100, le=4000)
    height: int = Field(default=600, ge=100, le=4000)
    num_elements: int = Field(default=50, ge=1, le=1000)
    seed: int | None = Field(default=None, ge=0)
    parameters: dict[str, Any] = Field(default_factory=dict)


class ArtGenerationResponse(BaseModel):
    algorithm: Algorithm
    seed: int
    width: int
    height: int
    elements: list[ArtElement]


# Backwards-compatible aliases used by older imports / OpenAPI examples.
Circle = CircleElement
Line = LineElement


class HealthResponse(BaseModel):
    message: str
