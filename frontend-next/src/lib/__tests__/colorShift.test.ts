import { shiftArtColors, shiftHexHue } from "../colorShift";
import type { ArtElement } from "@/types/art";

describe("shiftHexHue", () => {
  it("rotates a saturated color and leaves grayscale unchanged", () => {
    expect(shiftHexHue("#ff0000", 120)).toBe("#00ff00");
    expect(shiftHexHue("#808080", 90)).toBe("#808080");
  });

  it("returns non-hex colors unchanged", () => {
    expect(shiftHexHue("red", 40)).toBe("red");
  });

  it("accepts 3-digit hex", () => {
    expect(shiftHexHue("#f00", 120)).toBe("#00ff00");
  });
});

describe("shiftArtColors", () => {
  it("shifts element colors without mutating geometry", () => {
    const elements: ArtElement[] = [
      { type: "circle", x: 1, y: 2, radius: 3, color: "#ff0000", opacity: 1 },
      {
        type: "line",
        x1: 0,
        y1: 0,
        x2: 1,
        y2: 1,
        color: "#00ff00",
        thickness: 2,
        opacity: 1,
      },
    ];

    const shifted = shiftArtColors(elements, 120);

    expect(shifted[0]).toMatchObject({
      type: "circle",
      x: 1,
      y: 2,
      radius: 3,
      color: "#00ff00",
    });
    expect(shifted[1]).toMatchObject({
      type: "line",
      color: "#0000ff",
      x1: 0,
      x2: 1,
    });
    expect(elements[0]?.color).toBe("#ff0000");
  });

  it("returns the same array when shift is a full turn", () => {
    const elements: ArtElement[] = [
      { type: "circle", x: 0, y: 0, radius: 1, color: "#abcdef", opacity: 1 },
    ];
    expect(shiftArtColors(elements, 360)).toBe(elements);
  });
});
