import type { ArtElement, ArtGenerationRequest } from "@/types/art";
import { asFloat, pickColor } from "./base";
import type { SeededRng } from "./rng";

export function generateCircles(
  request: ArtGenerationRequest,
  rng: SeededRng,
): ArtElement[] {
  const params = (request.parameters ?? {}) as Record<string, unknown>;
  const minRadius = Math.max(1, asFloat(params, "min_radius", 5));
  const maxRadius = Math.max(minRadius, asFloat(params, "max_radius", 50));
  const width = request.width ?? 800;
  const height = request.height ?? 600;
  const count = request.num_elements ?? 50;

  const elements: ArtElement[] = [];
  for (let i = 0; i < count; i += 1) {
    elements.push({
      type: "circle",
      x: rng.uniform(0, width),
      y: rng.uniform(0, height),
      radius: rng.uniform(minRadius, maxRadius),
      color: pickColor(rng, params),
      opacity: rng.uniform(0.55, 1),
    });
  }
  return elements;
}
