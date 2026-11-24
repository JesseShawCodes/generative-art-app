import type { ArtElement, ArtGenerationRequest, Point } from "@/types/art";
import { asFloat, asInt, pickColor } from "./base";
import type { SeededRng } from "./rng";

const TAU = Math.PI * 2;

function regularPolygon(
  cx: number,
  cy: number,
  radius: number,
  sides: number,
  rotation: number,
): Point[] {
  const points: Point[] = [];
  for (let i = 0; i < sides; i += 1) {
    const angle = rotation + (TAU * i) / sides;
    points.push({
      x: cx + Math.cos(angle) * radius,
      y: cy + Math.sin(angle) * radius,
    });
  }
  return points;
}

export function generateGeometric(
  request: ArtGenerationRequest,
  rng: SeededRng,
): ArtElement[] {
  const params = (request.parameters ?? {}) as Record<string, unknown>;
  const minSides = Math.max(3, asInt(params, "min_sides", 3));
  const maxSides = Math.max(minSides, asInt(params, "max_sides", 6));
  const minSize = Math.max(4, asFloat(params, "min_size", 12));
  const maxSize = Math.max(minSize, asFloat(params, "max_size", 70));
  const width = request.width ?? 800;
  const height = request.height ?? 600;
  const count = request.num_elements ?? 50;

  const elements: ArtElement[] = [];
  for (let i = 0; i < count; i += 1) {
    const sides = rng.randint(minSides, maxSides);
    const radius = rng.uniform(minSize, maxSize);
    const cx = rng.uniform(radius, Math.max(radius, width - radius));
    const cy = rng.uniform(radius, Math.max(radius, height - radius));
    elements.push({
      type: "polygon",
      points: regularPolygon(cx, cy, radius, sides, rng.uniform(0, TAU)),
      color: pickColor(rng, params),
      filled: rng.random() > 0.25,
      opacity: rng.uniform(0.4, 0.95),
    });
  }
  return elements;
}
