import { renderArt } from "../renderArt";
import type { ArtElement } from "@/types/art";

function createMockContext() {
  return {
    clearRect: jest.fn(),
    save: jest.fn(),
    restore: jest.fn(),
    beginPath: jest.fn(),
    arc: jest.fn(),
    fill: jest.fn(),
    stroke: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    closePath: jest.fn(),
    globalAlpha: 1,
    fillStyle: "",
    strokeStyle: "",
    lineWidth: 1,
    lineCap: "butt",
  } as unknown as CanvasRenderingContext2D & {
    clearRect: jest.Mock;
    arc: jest.Mock;
    moveTo: jest.Mock;
    lineTo: jest.Mock;
  };
}

describe("renderArt", () => {
  it("draws each supported element type", () => {
    const context = createMockContext();
    const elements: ArtElement[] = [
      { type: "circle", x: 10, y: 20, radius: 5, color: "#fff", opacity: 0.8 },
      {
        type: "line",
        x1: 0,
        y1: 0,
        x2: 4,
        y2: 4,
        color: "#000",
        thickness: 2,
        opacity: 1,
      },
      {
        type: "polygon",
        points: [
          { x: 0, y: 0 },
          { x: 1, y: 0 },
          { x: 0, y: 1 },
        ],
        color: "#abc",
        filled: true,
        opacity: 1,
      },
    ];

    renderArt(context, elements, 100, 80);

    expect(context.clearRect).toHaveBeenCalledWith(0, 0, 100, 80);
    expect(context.arc).toHaveBeenCalled();
    expect(context.moveTo).toHaveBeenCalled();
    expect(context.lineTo).toHaveBeenCalled();
  });

  it("strokes unfilled polygons and skips degenerate ones", () => {
    const context = createMockContext();
    renderArt(
      context,
      [
        {
          type: "polygon",
          points: [
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: 0, y: 1 },
          ],
          color: "#abc",
          filled: false,
          opacity: 1,
        },
        {
          type: "polygon",
          points: [
            { x: 0, y: 0 },
            { x: 1, y: 0 },
          ],
          color: "#000",
          filled: true,
          opacity: 1,
        },
      ],
      50,
      50,
    );

    expect(context.stroke).toHaveBeenCalled();
  });
});
