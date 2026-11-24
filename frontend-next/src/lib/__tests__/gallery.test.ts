import {
  GALLERY_MAX_ITEMS,
  GALLERY_STORAGE_KEY,
  addGalleryItem,
  captureThumbnail,
  createGalleryItem,
  isGalleryItem,
  loadGalleryItems,
  parseGalleryItems,
  removeGalleryItem,
  saveGalleryItems,
  type GalleryItem,
} from "../gallery";
import { resetGalleryStoreForTests } from "../galleryStore";

const sampleInput = {
  algorithm: "circles" as const,
  width: 800,
  height: 600,
  numElements: 50,
  seed: 42,
  paletteId: "bloom" as const,
  customColors: [] as string[],
  engine: "local" as const,
  thumbnail: "data:image/jpeg;base64,abc",
};

function makeItem(overrides: Partial<GalleryItem> = {}): GalleryItem {
  return {
    id: "id-1",
    createdAt: "2026-01-01T00:00:00.000Z",
    ...sampleInput,
    ...overrides,
  };
}

describe("gallery helpers", () => {
  beforeEach(() => {
    window.localStorage.clear();
    resetGalleryStoreForTests();
  });

  it("validates gallery items", () => {
    expect(isGalleryItem(makeItem())).toBe(true);
    expect(isGalleryItem({ ...makeItem(), algorithm: "nope" })).toBe(false);
    expect(isGalleryItem(null)).toBe(false);
  });

  it("parses stored JSON and drops invalid entries", () => {
    const items = parseGalleryItems(
      JSON.stringify([makeItem(), { bad: true }, makeItem({ id: "id-2" })]),
    );
    expect(items).toHaveLength(2);
    expect(parseGalleryItems("not-json")).toEqual([]);
    expect(parseGalleryItems(null)).toEqual([]);
  });

  it("defaults missing engine to server for legacy rows", () => {
    const legacy = { ...makeItem(), engine: undefined };
    delete (legacy as { engine?: string }).engine;
    const items = parseGalleryItems(JSON.stringify([legacy]));
    expect(items[0]?.engine).toBe("server");
  });

  it("loads and saves via storage", () => {
    const store: Record<string, string> = {};
    const storage = {
      getItem: (key: string) => store[key] ?? null,
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
    };

    const item = makeItem();
    saveGalleryItems([item], storage);
    expect(store[GALLERY_STORAGE_KEY]).toContain("id-1");
    expect(loadGalleryItems(storage)).toEqual([item]);
  });

  it("adds items newest-first and trims to max", () => {
    const many = Array.from({ length: GALLERY_MAX_ITEMS }, (_, i) =>
      makeItem({ id: `old-${i}` }),
    );
    const next = addGalleryItem(many, sampleInput);
    expect(next).toHaveLength(GALLERY_MAX_ITEMS);
    expect(next[0]?.seed).toBe(42);
    expect(next[0]?.id).not.toBe("old-0");
  });

  it("removes by id", () => {
    const items = [makeItem({ id: "a" }), makeItem({ id: "b" })];
    expect(removeGalleryItem(items, "a").map((i) => i.id)).toEqual(["b"]);
  });

  it("creates items with id and timestamp", () => {
    const item = createGalleryItem(sampleInput);
    expect(item.id).toBeTruthy();
    expect(item.createdAt).toBeTruthy();
    expect(item.algorithm).toBe("circles");
  });

  it("rejects unknown palette ids", () => {
    expect(isGalleryItem({ ...makeItem(), paletteId: "neon" })).toBe(false);
  });

  it("returns empty when stored JSON is not an array", () => {
    expect(parseGalleryItems(JSON.stringify({ nope: true }))).toEqual([]);
  });

  it("captures a JPEG thumbnail from a canvas", () => {
    const source = document.createElement("canvas");
    source.width = 400;
    source.height = 200;

    const drawImage = jest.fn();
    const fillRect = jest.fn();
    const toDataURL = jest
      .fn()
      .mockReturnValue("data:image/jpeg;base64,thumb");

    jest.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
      drawImage,
      fillRect,
      fillStyle: "",
    } as unknown as CanvasRenderingContext2D);
    jest
      .spyOn(HTMLCanvasElement.prototype, "toDataURL")
      .mockImplementation(toDataURL);

    const thumb = captureThumbnail(source, 160);
    expect(thumb).toBe("data:image/jpeg;base64,thumb");
    expect(fillRect).toHaveBeenCalled();
    expect(drawImage).toHaveBeenCalled();
  });

  it("falls back to source toDataURL when 2d context is unavailable", () => {
    const source = document.createElement("canvas");
    source.width = 100;
    source.height = 100;
    jest.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
    jest
      .spyOn(HTMLCanvasElement.prototype, "toDataURL")
      .mockReturnValue("data:image/jpeg;base64,fallback");

    expect(captureThumbnail(source)).toBe("data:image/jpeg;base64,fallback");
  });
});
