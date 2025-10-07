from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import random
from typing import List

app = FastAPI()

app.add_middleware(
  CORSMiddleware,
  allow_origins=["http://localhost:3000"],
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"]
)

class Line(BaseModel):
  x: int
  y: int
  color: str

class Circle(BaseModel):
  x: int
  y: int
  radius: int
  color: str

class ArtGenerationRequest(BaseModel):
  width: int = 800
  height: int = 600
  num_elements: int = 50

@app.post("/generate-art", response_model=List[Circle])
async def generate_art(request: ArtGenerationRequest):
  """
  Generates random circles based on provided dimensions
  """
  lines = []
  '''
  for _ in range(request.num_elements):
    x = random.randint(0, request.width)
    y = random.randint(0, request.height)
    length = random.randint(5, 50)
    color = "#%06x" % random.randint(0, 0xFFFFFF) # Random HEX Color
    lines.append(Line(x=x, y=y, color=color))
  
  return lines
  '''
  circles = []
  for _ in range(request.num_elements):
    x = random.randint(0, request.width)
    y = random.randint(0, request.height)
    radius = random.randint(5, 50)
    color = "#%06x" % random.randint(0, 0xFFFFFF) # Random HEX Color
    circles.append(Circle(x=x, y=y, radius=radius, color=color))
  
  return circles


@app.get("/")
async def root():
  return {"message": "Generative Art API is running!"}
