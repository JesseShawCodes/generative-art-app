import { colorsForPalette } from "../palettes";

describe("colorsForPalette", () => {
  it("returns undefined for random (unconstrained)", () => {
    expect(colorsForPalette("random", [])).toBeUndefined();
  });

  it("returns bloom preset colors", () => {
    expect(colorsForPalette("bloom", [])).toEqual(
      expect.arrayContaining(["#ff507c", "#82243b"]),
    );
  });

  it("returns custom colors when non-empty", () => {
    expect(colorsForPalette("custom", ["#112233"])).toEqual(["#112233"]);
  });

  it("returns undefined for empty custom palette", () => {
    expect(colorsForPalette("custom", [])).toBeUndefined();
  });
});
