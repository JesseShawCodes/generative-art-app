import {
  deleteFromGallery,
  getGallerySnapshot,
  getServerGallerySnapshot,
  resetGalleryStoreForTests,
  saveToGallery,
  subscribeGallery,
} from "../galleryStore";
import { GALLERY_STORAGE_KEY } from "../gallery";

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

describe("galleryStore", () => {
  beforeEach(() => {
    window.localStorage.clear();
    resetGalleryStoreForTests();
  });

  it("returns an empty server snapshot", () => {
    expect(getServerGallerySnapshot()).toEqual([]);
  });

  it("saves, notifies subscribers, and deletes", () => {
    const listener = jest.fn();
    const unsubscribe = subscribeGallery(listener);

    expect(getGallerySnapshot()).toEqual([]);

    saveToGallery(sampleInput);
    expect(listener).toHaveBeenCalled();
    expect(getGallerySnapshot()).toHaveLength(1);
    expect(window.localStorage.getItem(GALLERY_STORAGE_KEY)).toContain("42");

    const id = getGallerySnapshot()[0]!.id;
    deleteFromGallery(id);
    expect(getGallerySnapshot()).toEqual([]);
    expect(listener.mock.calls.length).toBeGreaterThanOrEqual(2);

    unsubscribe();
    saveToGallery(sampleInput);
    // Unsubscribed listener should not be called again.
    expect(listener).toHaveBeenCalledTimes(2);
  });
});
