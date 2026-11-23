/**
 * Ergonomic aliases over the OpenAPI-generated contract.
 *
 * Source of truth: backend Pydantic models → FastAPI OpenAPI →
 * `openapi/openapi.json` → `src/types/openapi.d.ts` (via `npm run generate:api`).
 *
 * Do not hand-edit schema shapes here; regenerate from the backend instead.
 */

import type { components, paths } from "@/types/openapi";

/** `components.schemas.Circle` from `POST /generate-art`. */
export type Circle = components["schemas"]["Circle"];

/** `components.schemas.ArtGenerationRequest` for `POST /generate-art`. */
export type ArtGenerationRequest = components["schemas"]["ArtGenerationRequest"];

/** Successful JSON body of `POST /generate-art`. */
export type GenerateArtResponse =
  paths["/generate-art"]["post"]["responses"][200]["content"]["application/json"];

/** Successful JSON body of `GET /`. */
export type HealthResponse =
  paths["/"]["get"]["responses"][200]["content"]["application/json"];
