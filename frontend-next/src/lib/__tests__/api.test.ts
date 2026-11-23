import {
  ApiError,
  generateArt,
  isArtElement,
  isCircle,
  isCircleElement,
} from "../api";
import type { ArtGenerationResponse } from "@/types/art";

const request = {
  algorithm: "circles" as const,
  width: 800,
  height: 600,
  num_elements: 2,
};

const sampleResponse: ArtGenerationResponse = {
  algorithm: "circles",
  seed: 42,
  width: 800,
  height: 600,
  elements: [
    { type: "circle", x: 1, y: 2, radius: 3, color: "#abcdef", opacity: 1 },
  ],
};

function mockFetchResponse(body: unknown, ok = true, status = 200) {
  jest.mocked(global.fetch).mockResolvedValueOnce({
    ok,
    status,
    json: () => Promise.resolve(body),
  } as Response);
}

describe("isCircleElement", () => {
  it("accepts a valid circle element", () => {
    expect(
      isCircleElement({ type: "circle", x: 1, y: 2, radius: 3, color: "#fff" }),
    ).toBe(true);
  });

  it("rejects malformed values", () => {
    expect(isCircleElement(null)).toBe(false);
    expect(
      isCircleElement({ type: "circle", x: "1", y: 2, radius: 3, color: "#fff" }),
    ).toBe(false);
    expect(isCircleElement({ x: 1, y: 2, radius: 3, color: "#fff" })).toBe(
      false,
    );
  });
});

describe("isCircle (legacy)", () => {
  it("still accepts bare circles without type", () => {
    expect(isCircle({ x: 1, y: 2, radius: 3, color: "#fff" })).toBe(true);
  });
});

describe("isArtElement", () => {
  it("accepts line and polygon elements", () => {
    expect(
      isArtElement({
        type: "line",
        x1: 0,
        y1: 0,
        x2: 1,
        y2: 1,
        color: "#000",
      }),
    ).toBe(true);
    expect(
      isArtElement({
        type: "polygon",
        points: [
          { x: 0, y: 0 },
          { x: 1, y: 0 },
          { x: 0, y: 1 },
        ],
        color: "#111",
        filled: true,
      }),
    ).toBe(true);
  });
});

describe("generateArt", () => {
  it("returns typed artwork and posts the request body", async () => {
    mockFetchResponse(sampleResponse);

    await expect(generateArt(request)).resolves.toEqual(sampleResponse);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/generate-art"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(request),
      }),
    );
  });

  it("throws a clear error when NEXT_PUBLIC_API_URL is missing", async () => {
    const original = process.env.NEXT_PUBLIC_API_URL;
    delete process.env.NEXT_PUBLIC_API_URL;
    try {
      await expect(generateArt(request)).rejects.toThrow(/NEXT_PUBLIC_API_URL/);
    } finally {
      process.env.NEXT_PUBLIC_API_URL = original;
    }
  });

  it("throws an ApiError on a non-OK response", async () => {
    mockFetchResponse(null, false, 500);

    await expect(generateArt(request)).rejects.toMatchObject({
      name: "ApiError",
      status: 500,
    });
  });

  it("throws an ApiError when the response shape is wrong", async () => {
    mockFetchResponse([{ nope: true }]);

    await expect(generateArt(request)).rejects.toBeInstanceOf(ApiError);
  });

  it("throws an ApiError when the response body is not JSON", async () => {
    jest.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.reject(new SyntaxError("Unexpected token")),
    } as Response);

    await expect(generateArt(request)).rejects.toMatchObject({
      name: "ApiError",
      message: expect.stringMatching(/Invalid JSON/),
    });
  });
});
