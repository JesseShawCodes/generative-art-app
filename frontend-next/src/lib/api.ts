import type {
  ArtElement,
  ArtGenerationRequest,
  ArtGenerationResponse,
  CircleElement,
  LineElement,
  PolygonElement,
} from "@/types/art";

export const API_V1_PREFIX = "/api/v1";

const DEFAULT_TIMEOUT_MS = 30_000;

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

function getTimeoutMs(): number {
  const raw = process.env.NEXT_PUBLIC_API_TIMEOUT_MS;
  if (!raw) return DEFAULT_TIMEOUT_MS;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_TIMEOUT_MS;
}

function apiUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${getApiBaseUrl()}${API_V1_PREFIX}${normalized}`;
}

function mergeSignals(
  userSignal: AbortSignal | undefined,
  timeoutMs: number,
): AbortSignal {
  const timeoutSignal = AbortSignal.timeout(timeoutMs);
  if (!userSignal) return timeoutSignal;
  if (typeof AbortSignal.any === "function") {
    return AbortSignal.any([userSignal, timeoutSignal]);
  }
  // Fallback for older runtimes: abort when either signal fires.
  const controller = new AbortController();
  const onAbort = () => controller.abort();
  if (userSignal.aborted || timeoutSignal.aborted) {
    controller.abort();
    return controller.signal;
  }
  userSignal.addEventListener("abort", onAbort, { once: true });
  timeoutSignal.addEventListener("abort", onAbort, { once: true });
  return controller.signal;
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

function isTimeoutError(err: unknown): boolean {
  return (
    (err instanceof DOMException && err.name === "TimeoutError") ||
    (err instanceof Error && err.name === "TimeoutError")
  );
}

/** Calls `POST /api/v1/generate-art` and validates the response shape at runtime. */
export async function generateArt(
  request: ArtGenerationRequest,
  signal?: AbortSignal,
  timeoutMs: number = getTimeoutMs(),
): Promise<ArtGenerationResponse> {
  let response: Response;
  try {
    response = await fetch(apiUrl("/generate-art"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
      signal: mergeSignals(signal, timeoutMs),
    });
  } catch (err) {
    if (isTimeoutError(err)) {
      throw new ApiError(`Request timed out after ${timeoutMs}ms`);
    }
    throw err;
  }

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
    throw new ApiError("Invalid JSON response from /api/v1/generate-art");
  }

  if (!isArtGenerationResponse(data)) {
    throw new ApiError("Unexpected response shape from /api/v1/generate-art");
  }
  return data;
}
