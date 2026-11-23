/**
 * Ergonomic aliases over the OpenAPI-generated contract.
 *
 * Source of truth: backend Pydantic models → FastAPI OpenAPI →
 * `openapi/openapi.json` → `src/types/openapi.d.ts` (via `npm run generate:api`).
 *
 * Do not hand-edit schema shapes here; regenerate from the backend instead.
 */

import type { components, paths } from "@/types/openapi";

export type Algorithm = components["schemas"]["Algorithm"];

export type CircleElement = components["schemas"]["CircleElement"];
export type LineElement = components["schemas"]["LineElement"];
export type PolygonElement = components["schemas"]["PolygonElement"];
export type Point = components["schemas"]["Point"];

/** Discriminated union of drawable primitives from `POST /generate-art`. */
export type ArtElement = CircleElement | LineElement | PolygonElement;

/** `components.schemas.ArtGenerationRequest` for `POST /generate-art`. */
export type ArtGenerationRequest = components["schemas"]["ArtGenerationRequest"];

/** Successful JSON body of `POST /generate-art`. */
export type ArtGenerationResponse =
  paths["/generate-art"]["post"]["responses"][200]["content"]["application/json"];

/** @deprecated Prefer ArtGenerationResponse — kept for older imports. */
export type GenerateArtResponse = ArtGenerationResponse;

/** @deprecated Prefer CircleElement. */
export type Circle = CircleElement;

/** Successful JSON body of `GET /`. */
export type HealthResponse =
  paths["/"]["get"]["responses"][200]["content"]["application/json"];

export const ALGORITHMS: { value: Algorithm; label: string }[] = [
  { value: "circles", label: "Circles" },
  { value: "flow_field", label: "Flow Field" },
  { value: "geometric", label: "Geometric" },
  { value: "particles", label: "Particles" },
];
