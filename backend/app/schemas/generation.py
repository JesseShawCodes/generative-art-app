from pydantic import BaseModel, Field


class Point(BaseModel):
    x: int
    y: int


class Line(BaseModel):
    start: Point
    end: Point
    color: str
    thickness: int


class Circle(BaseModel):
    x: int
    y: int
    radius: int
    color: str


class ArtGenerationRequest(BaseModel):
    width: int = Field(default=800, ge=100, le=4000)
    height: int = Field(default=600, ge=100, le=4000)
    num_elements: int = Field(default=50, ge=1, le=1000)
