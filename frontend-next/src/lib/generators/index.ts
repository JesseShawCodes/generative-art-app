import type {
  Algorithm,
  ArtElement,
  ArtGenerationRequest,
  ArtGenerationResponse,
} from "@/types/art";
import { generateCircles } from "./circles";
import { generateFlowField } from "./flowField";
import { generateGeometric } from "./geometric";
import { generateParticles } from "./particles";
import { SeededRng, randomSeed } from "./rng";

type GeneratorFn = (
  request: ArtGenerationRequest,
  rng: SeededRng,
) => ArtElement[];

const GENERATORS: Record<Algorithm, GeneratorFn> = {
  circles: generateCircles,
  flow_field: generateFlowField,
  geometric: generateGeometric,
  particles: generateParticles,
};

/** Run generation on the current thread (also used inside the worker). */
export function generateArtSync(
  request: ArtGenerationRequest,
): ArtGenerationResponse {
  const seed =
    typeof request.seed === "number" && Number.isFinite(request.seed)
      ? request.seed
      : randomSeed();
  const algorithm = request.algorithm ?? "circles";
  const width = request.width ?? 800;
  const height = request.height ?? 600;
  const generator = GENERATORS[algorithm];
  if (!generator) {
    throw new Error(`Unknown algorithm: ${String(algorithm)}`);
  }

  const elements = generator(request, new SeededRng(seed));
  return {
    algorithm,
    seed,
    width,
    height,
    elements,
  };
}

export type { Algorithm };
export { SeededRng, randomSeed } from "./rng";
