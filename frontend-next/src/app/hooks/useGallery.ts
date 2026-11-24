"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { GalleryItemInput } from "@/lib/gallery";
import {
  deleteFromGallery,
  getGallerySnapshot,
  getServerGallerySnapshot,
  saveToGallery,
  subscribeGallery,
} from "@/lib/galleryStore";

export function useGallery() {
  const items = useSyncExternalStore(
    subscribeGallery,
    getGallerySnapshot,
    getServerGallerySnapshot,
  );

  const saveItem = useCallback((input: GalleryItemInput) => {
    saveToGallery(input);
  }, []);

  const deleteItem = useCallback((id: string) => {
    deleteFromGallery(id);
  }, []);

  return {
    items,
    saveItem,
    deleteItem,
  };
}
