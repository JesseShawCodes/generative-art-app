import type { ArtElement, ArtGenerationRequest } from "@/types/art";
import { asFloat, asInt, clamp, pickColor } from "./base";
import type { SeededRng } from "./rng";

const TAU = Math.PI * 2;

export function generateParticles(
  request: ArtGenerationRequest,
  rng: SeededRng,
): ArtElement[] {
  const params = (request.parameters ?? {}) as Record<string, unknown>;
  const trailLength = Math.max(2, asInt(params, "trail_length", 12));
  const particleRadius = Math.max(0.5, asFloat(params, "particle_radius", 2.5));
  const speed = Math.max(0.5, asFloat(params, "speed", 6));
  const width = request.width ?? 800;
  const height = request.height ?? 600;
  const count = request.num_elements ?? 50;

  const elements: ArtElement[] = [];

  for (let i = 0; i < count; i += 1) {
    let x = rng.uniform(0, width);
    let y = rng.uniform(0, height);
    let angle = rng.uniform(0, TAU);
    const color = pickColor(rng, params);
    const opacity = rng.uniform(0.45, 1);

    let prevX = x;
    let prevY = y;
    for (let step = 0; step < trailLength; step += 1) {
      angle += rng.uniform(-0.35, 0.35);
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      x = clamp(x + vx, 0, width);
      y = clamp(y + vy, 0, height);

      const fade = 1 - (step / trailLength) * 0.7;
      elements.push({
        type: "line",
        x1: prevX,
        y1: prevY,
        x2: x,
        y2: y,
        color,
        thickness: Math.max(0.6, particleRadius * fade),
        opacity: opacity * fade,
      });
      prevX = x;
      prevY = y;
    }

    elements.push({
      type: "circle",
      x,
      y,
      radius: particleRadius,
      color,
      opacity,
    });
  }

  return elements;
}
