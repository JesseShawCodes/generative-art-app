import type { PaletteId } from "@/lib/palettes";
import type { Algorithm } from "@/types/art";

export const GALLERY_STORAGE_KEY = "pixelbloom-gallery";
export const GALLERY_MAX_ITEMS = 40;

export interface GalleryItem {
  id: string;
  createdAt: string;
  algorithm: Algorithm;
  width: number;
  height: number;
  numElements: number;
  seed: number;
  paletteId: PaletteId;
  customColors: string[];
  /** Compact JPEG data URL for the grid preview. */
  thumbnail: string;
}

export type GalleryItemInput = Omit<GalleryItem, "id" | "createdAt">;

function isAlgorithm(value: unknown): value is Algorithm {
  return (
    value === "circles" ||
    value === "flow_field" ||
    value === "geometric" ||
    value === "particles"
  );
}

function isPaletteId(value: unknown): value is PaletteId {
  return (
    value === "random" ||
    value === "bloom" ||
    value === "midnight" ||
    value === "citrus" ||
    value === "mono" ||
    value === "custom"
  );
}

export function isGalleryItem(value: unknown): value is GalleryItem {
  if (typeof value !== "object" || value === null) return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.id === "string" &&
    typeof item.createdAt === "string" &&
    isAlgorithm(item.algorithm) &&
    typeof item.width === "number" &&
    typeof item.height === "number" &&
    typeof item.numElements === "number" &&
    typeof item.seed === "number" &&
    isPaletteId(item.paletteId) &&
    Array.isArray(item.customColors) &&
    item.customColors.every((c) => typeof c === "string") &&
    typeof item.thumbnail === "string"
  );
}

export function parseGalleryItems(raw: string | null): GalleryItem[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isGalleryItem);
  } catch {
    return [];
  }
}

export function loadGalleryItems(
  storage: Pick<Storage, "getItem"> = localStorage,
): GalleryItem[] {
  return parseGalleryItems(storage.getItem(GALLERY_STORAGE_KEY));
}

export function saveGalleryItems(
  items: GalleryItem[],
  storage: Pick<Storage, "setItem"> = localStorage,
): void {
  storage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(items));
}

export function createGalleryItem(input: GalleryItemInput): GalleryItem {
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `gallery-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

  return {
    ...input,
    id,
    createdAt: new Date().toISOString(),
  };
}

/** Prepend a new item and trim to the max gallery size. */
export function addGalleryItem(
  items: GalleryItem[],
  input: GalleryItemInput,
): GalleryItem[] {
  const next = [createGalleryItem(input), ...items];
  return next.slice(0, GALLERY_MAX_ITEMS);
}

export function removeGalleryItem(
  items: GalleryItem[],
  id: string,
): GalleryItem[] {
  return items.filter((item) => item.id !== id);
}

/** Shrink the live canvas into a small JPEG data URL for storage. */
export function captureThumbnail(
  canvas: HTMLCanvasElement,
  maxSize = 160,
): string {
  const scale = Math.min(1, maxSize / Math.max(canvas.width, canvas.height));
  const width = Math.max(1, Math.round(canvas.width * scale));
  const height = Math.max(1, Math.round(canvas.height * scale));
  const tmp = document.createElement("canvas");
  tmp.width = width;
  tmp.height = height;
  const context = tmp.getContext("2d");
  if (!context) {
    return canvas.toDataURL("image/jpeg", 0.7);
  }
  context.fillStyle = "#333333";
  context.fillRect(0, 0, width, height);
  context.drawImage(canvas, 0, 0, width, height);
  return tmp.toDataURL("image/jpeg", 0.72);
}
