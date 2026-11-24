import type { ArtElement, ArtGenerationRequest } from "@/types/art";
import { asFloat, asInt, clamp, pickColor } from "./base";
import type { SeededRng } from "./rng";

const TAU = Math.PI * 2;

function angleAt(x: number, y: number, scale: number, time: number): number {
  const nx = x * scale;
  const ny = y * scale;
  return (
    (Math.sin(nx * 0.7 + time) +
      Math.cos(ny * 0.9 - time * 0.5) +
      Math.sin((nx + ny) * 0.35)) *
    Math.PI
  );
}

export function generateFlowField(
  request: ArtGenerationRequest,
  rng: SeededRng,
): ArtElement[] {
  const params = (request.parameters ?? {}) as Record<string, unknown>;
  const scale = Math.max(0.001, asFloat(params, "scale", 0.012));
  const stepLength = Math.max(1, asFloat(params, "step_length", 4));
  const steps = Math.max(2, asInt(params, "steps", 28));
  const thickness = Math.max(0.5, asFloat(params, "thickness", 1.2));
  const width = request.width ?? 800;
  const height = request.height ?? 600;
  const count = request.num_elements ?? 50;

  const elements: ArtElement[] = [];
  const time = rng.uniform(0, TAU);

  for (let i = 0; i < count; i += 1) {
    let x = rng.uniform(0, width);
    let y = rng.uniform(0, height);
    const color = pickColor(rng, params);
    const opacity = rng.uniform(0.35, 0.9);

    for (let step = 0; step < steps; step += 1) {
      const angle = angleAt(x, y, scale, time);
      const x2 = x + Math.cos(angle) * stepLength;
      const y2 = y + Math.sin(angle) * stepLength;

      if (x2 < -20 || y2 < -20 || x2 > width + 20 || y2 > height + 20) {
        break;
      }

      elements.push({
        type: "line",
        x1: x,
        y1: y,
        x2,
        y2,
        color,
        thickness,
        opacity,
      });
      x = clamp(x2, 0, width);
      y = clamp(y2, 0, height);
    }
  }

  return elements;
}
