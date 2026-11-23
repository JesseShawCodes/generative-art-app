import { artToSvg } from "../exportSvg";
import type { ArtElement } from "@/types/art";

describe("artToSvg", () => {
  it("serializes circle, line, and polygon elements", () => {
    const elements: ArtElement[] = [
      { type: "circle", x: 10, y: 20, radius: 5, color: "#ff507c", opacity: 0.8 },
      {
        type: "line",
        x1: 0,
        y1: 0,
        x2: 4,
        y2: 4,
        color: "#000000",
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
        color: "#aabbcc",
        filled: true,
        opacity: 1,
      },
      {
        type: "polygon",
        points: [
          { x: 2, y: 2 },
          { x: 3, y: 2 },
          { x: 2, y: 3 },
        ],
        color: "#112233",
        filled: false,
        opacity: 0.5,
      },
    ];

    const svg = artToSvg(elements, 100, 80);

    expect(svg).toContain('viewBox="0 0 100 80"');
    expect(svg).toContain(
      '<circle cx="10" cy="20" r="5" fill="#ff507c" opacity="0.800"',
    );
    expect(svg).toContain(
      '<line x1="0" y1="0" x2="4" y2="4" stroke="#000000" stroke-width="2"',
    );
    expect(svg).toContain('<polygon points="0,0 1,0 0,1" fill="#aabbcc"');
    expect(svg).toContain(
      '<polygon points="2,2 3,2 2,3" fill="none" stroke="#112233" stroke-width="1.5" opacity="0.500"',
    );
  });
});
