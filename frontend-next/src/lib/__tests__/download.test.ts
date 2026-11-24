import { buildArtFilename } from "../download";

describe("buildArtFilename", () => {
  it("includes algorithm and seed", () => {
    expect(buildArtFilename("circles", 48291, "png")).toBe(
      "pixelbloom-circles-48291.png",
    );
  });

  it("uses random when seed is missing", () => {
    expect(buildArtFilename("flow_field", null, "svg")).toBe(
      "pixelbloom-flow_field-random.svg",
    );
  });
});
