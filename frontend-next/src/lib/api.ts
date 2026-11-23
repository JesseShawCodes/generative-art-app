import type { ArtGenerationRequest, Circle } from "@/types/art";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function isCircle(value: unknown): value is Circle {
  return (
    isRecord(value) &&
    typeof value.x === "number" &&
    typeof value.y === "number" &&
    typeof value.radius === "number" &&
    typeof value.color === "string"
  );
}

function isCircleArray(value: unknown): value is Circle[] {
  return Array.isArray(value) && value.every(isCircle);
}

/** Calls `POST /generate-art` and validates the response shape at runtime. */
export async function generateArt(
  request: ArtGenerationRequest,
  signal?: AbortSignal,
): Promise<Circle[]> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/generate-art`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
      signal,
    },
  );

  if (!response.ok) {
    throw new ApiError(
      `HTTP error! status: ${response.status}`,
      response.status,
    );
  }

  const data: unknown = await response.json();
  if (!isCircleArray(data)) {
    throw new ApiError("Unexpected response shape from /generate-art");
  }
  return data;
}
