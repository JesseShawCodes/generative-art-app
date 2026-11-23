import type {
  ArtGenerationRequest,
  Circle,
  GenerateArtResponse,
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

export function isCircle(value: unknown): value is Circle {
  return (
    isRecord(value) &&
    typeof value.x === "number" &&
    Number.isFinite(value.x) &&
    typeof value.y === "number" &&
    Number.isFinite(value.y) &&
    typeof value.radius === "number" &&
    Number.isFinite(value.radius) &&
    typeof value.color === "string"
  );
}

function isCircleArray(value: unknown): value is GenerateArtResponse {
  return Array.isArray(value) && value.every(isCircle);
}

/** Calls `POST /generate-art` and validates the response shape at runtime. */
export async function generateArt(
  request: ArtGenerationRequest,
  signal?: AbortSignal,
): Promise<GenerateArtResponse> {
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

  if (!isCircleArray(data)) {
    throw new ApiError("Unexpected response shape from /generate-art");
  }
  return data;
}
