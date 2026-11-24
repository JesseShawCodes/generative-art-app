import {
  buildArtFilename,
  downloadTextFile,
  triggerDownload,
} from "../download";

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

  it("uses random when seed is non-finite", () => {
    expect(buildArtFilename("particles", Number.NaN, "png")).toBe(
      "pixelbloom-particles-random.png",
    );
  });
});

describe("triggerDownload", () => {
  it("creates an anchor and clicks it", () => {
    const clickSpy = jest
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});
    const createSpy = jest.spyOn(document, "createElement");

    triggerDownload("data:text/plain,hi", "note.txt");

    const anchor = createSpy.mock.results.find(
      (result) => result.value instanceof HTMLAnchorElement,
    )?.value as HTMLAnchorElement | undefined;
    expect(anchor?.download).toBe("note.txt");
    expect(anchor?.href).toContain("data:text/plain");
    expect(clickSpy).toHaveBeenCalled();

    createSpy.mockRestore();
    clickSpy.mockRestore();
  });
});

describe("downloadTextFile", () => {
  it("downloads a blob URL and revokes it", () => {
    const createObjectURL = jest.fn(() => "blob:mock-url");
    const revokeObjectURL = jest.fn();
    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      writable: true,
      value: createObjectURL,
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      writable: true,
      value: revokeObjectURL,
    });
    const clickSpy = jest
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});

    downloadTextFile("<svg></svg>", "art.svg", "image/svg+xml");

    expect(createObjectURL).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:mock-url");

    clickSpy.mockRestore();
  });
});
