/**
 * Types mirroring the FastAPI models in backend/app/schemas/generation.py.
 * Keep these in sync with the pydantic models there.
 */

/** Response item of `POST /generate-art` (backend `Circle`). */
export interface Circle {
  x: number;
  y: number;
  radius: number;
  /** Hex color, e.g. `#a1b2c3` */
  color: string;
}

/** Request body of `POST /generate-art` (backend `ArtGenerationRequest`). */
export interface ArtGenerationRequest {
  width: number;
  height: number;
  num_elements: number;
}
