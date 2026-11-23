import type {
  ArtElement,
  ArtGenerationRequest,
  ArtGenerationResponse,
  CircleElement,
  LineElement,
  PolygonElement,
} from "@/types/art";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function getApiBaseUrl(): string {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!baseUrl) {
    throw new ApiError(
      "NEXT_PUBLIC_API_URL is not set. Copy .env.example to .env.local and restart the dev server.",
    );
  }
  return baseUrl.replace(/\/+$/, "");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isPoint(value: unknown): value is { x: number; y: number } {
  return isRecord(value) && isFiniteNumber(value.x) && isFiniteNumber(value.y);
}

export function isCircleElement(value: unknown): value is CircleElement {
  return (
    isRecord(value) &&
    value.type === "circle" &&
    isFiniteNumber(value.x) &&
    isFiniteNumber(value.y) &&
    isFiniteNumber(value.radius) &&
    typeof value.color === "string"
  );
}

/** @deprecated Prefer isCircleElement. */
export function isCircle(value: unknown): value is CircleElement {
  // Legacy callers passed bare circles without a type field.
  if (isCircleElement(value)) return true;
  return (
    isRecord(value) &&
    isFiniteNumber(value.x) &&
    isFiniteNumber(value.y) &&
    isFiniteNumber(value.radius) &&
    typeof value.color === "string"
  );
}

export function isLineElement(value: unknown): value is LineElement {
  return (
    isRecord(value) &&
    value.type === "line" &&
    isFiniteNumber(value.x1) &&
    isFiniteNumber(value.y1) &&
    isFiniteNumber(value.x2) &&
    isFiniteNumber(value.y2) &&
    typeof value.color === "string"
  );
}

export function isPolygonElement(value: unknown): value is PolygonElement {
  return (
    isRecord(value) &&
    value.type === "polygon" &&
    Array.isArray(value.points) &&
    value.points.length >= 3 &&
    value.points.every(isPoint) &&
    typeof value.color === "string"
  );
}

export function isArtElement(value: unknown): value is ArtElement {
  return (
    isCircleElement(value) || isLineElement(value) || isPolygonElement(value)
  );
}

function isArtGenerationResponse(
  value: unknown,
): value is ArtGenerationResponse {
  return (
    isRecord(value) &&
    typeof value.algorithm === "string" &&
    isFiniteNumber(value.seed) &&
    isFiniteNumber(value.width) &&
    isFiniteNumber(value.height) &&
    Array.isArray(value.elements) &&
    value.elements.every(isArtElement)
  );
}

/** Calls `POST /generate-art` and validates the response shape at runtime. */
export async function generateArt(
  request: ArtGenerationRequest,
  signal?: AbortSignal,
): Promise<ArtGenerationResponse> {
  const response = await fetch(`${getApiBaseUrl()}/generate-art`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
    signal,
  });

  if (!response.ok) {
    throw new ApiError(
      `HTTP error! status: ${response.status}`,
      response.status,
    );
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new ApiError("Invalid JSON response from /generate-art");
  }

  if (!isArtGenerationResponse(data)) {
    throw new ApiError("Unexpected response shape from /generate-art");
  }
  return data;
}
