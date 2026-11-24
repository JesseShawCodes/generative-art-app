import { generateArtSync } from "../index";

describe("generateArtSync", () => {
  it("is reproducible for a fixed seed", () => {
    const request = {
      algorithm: "circles" as const,
      width: 200,
      height: 150,
      num_elements: 8,
      seed: 42,
      parameters: { colors: ["#ff507c", "#82243b"] },
    };
    const first = generateArtSync(request);
    const second = generateArtSync(request);
    expect(first).toEqual(second);
    expect(first.elements).toHaveLength(8);
    expect(first.elements.every((el) => el.color === "#ff507c" || el.color === "#82243b")).toBe(
      true,
    );
  });

  it("returns expected element types per algorithm", () => {
    const cases = {
      circles: new Set(["circle"]),
      flow_field: new Set(["line"]),
      geometric: new Set(["polygon"]),
      particles: new Set(["circle", "line"]),
    } as const;

    for (const [algorithm, expected] of Object.entries(cases)) {
      const result = generateArtSync({
        algorithm: algorithm as keyof typeof cases,
        width: 200,
        height: 200,
        num_elements: 4,
        seed: 7,
        parameters: {},
      });
      const types = new Set(result.elements.map((el) => el.type));
      expect(types).toEqual(expected);
    }
  });

  it("assigns a seed when omitted", () => {
    const result = generateArtSync({
      algorithm: "geometric",
      width: 100,
      height: 100,
      num_elements: 2,
      parameters: {},
    });
    expect(typeof result.seed).toBe("number");
    expect(result.seed).toBeGreaterThanOrEqual(0);
  });
});
