import {
  loadGalleryItems,
  saveGalleryItems,
  addGalleryItem,
  removeGalleryItem,
  type GalleryItem,
  type GalleryItemInput,
} from "@/lib/gallery";

let cachedItems: GalleryItem[] | null = null;
const listeners = new Set<() => void>();
const EMPTY_GALLERY: GalleryItem[] = [];

function readItems(): GalleryItem[] {
  if (cachedItems === null) {
    cachedItems = loadGalleryItems();
  }
  return cachedItems;
}

function writeItems(next: GalleryItem[]): void {
  cachedItems = next;
  saveGalleryItems(next);
  listeners.forEach((listener) => listener());
}

export function subscribeGallery(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
  };
}

export function getGallerySnapshot(): GalleryItem[] {
  return readItems();
}

export function getServerGallerySnapshot(): GalleryItem[] {
  return EMPTY_GALLERY;
}

export function saveToGallery(input: GalleryItemInput): void {
  writeItems(addGalleryItem(readItems(), input));
}

export function deleteFromGallery(id: string): void {
  writeItems(removeGalleryItem(readItems(), id));
}

/** Test helper to reset the in-memory cache between suites. */
export function resetGalleryStoreForTests(): void {
  cachedItems = null;
}
