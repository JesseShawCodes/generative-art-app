import { asFloat, asInt, clamp, paletteColors, pickColor, randomColor } from "../base";
import { SeededRng } from "../rng";

describe("generator base helpers", () => {
  it("clamps values", () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-1, 0, 10)).toBe(0);
    expect(clamp(99, 0, 10)).toBe(10);
  });

  it("parses floats with fallbacks", () => {
    expect(asFloat({ x: "1.5" }, "x", 0)).toBe(1.5);
    expect(asFloat({ x: true }, "x", 9)).toBe(9);
    expect(asFloat({ x: "nope" }, "x", 4)).toBe(4);
    expect(asFloat({ x: {} }, "x", 2)).toBe(2);
    expect(asFloat({ x: 3 }, "x", 0)).toBe(3);
  });

  it("truncates ints via asFloat", () => {
    expect(asInt({ n: "8.9" }, "n", 0)).toBe(8);
  });

  it("filters palette colors and picks from them", () => {
    expect(
      paletteColors({
        colors: ["#AABBCC", "ddeeff", "#abc", "zzzzzz", 1, " #112233 "],
      }),
    ).toEqual(["#aabbcc", "#ddeeff", "#112233"]);
    expect(paletteColors({ colors: "red" })).toEqual([]);

    const rng = new SeededRng(1);
    expect(pickColor(rng, { colors: ["#ff0000"] })).toBe("#ff0000");
    expect(randomColor(rng)).toMatch(/^#[0-9a-f]{6}$/);
  });
});
