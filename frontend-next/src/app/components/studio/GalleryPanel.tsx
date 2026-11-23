"use client";

import type { GalleryItem } from "@/lib/gallery";
import { ALGORITHMS } from "@/types/art";

interface GalleryPanelProps {
  items: GalleryItem[];
  onSave: () => void;
  onLoad: (item: GalleryItem) => void;
  onDelete: (id: string) => void;
  canSave: boolean;
}

function algorithmLabel(algorithm: GalleryItem["algorithm"]): string {
  return ALGORITHMS.find((a) => a.value === algorithm)?.label ?? algorithm;
}

export default function GalleryPanel({
  items,
  onSave,
  onLoad,
  onDelete,
  canSave,
}: GalleryPanelProps) {
  return (
    <section className="mt-10 border-t border-neutral-200 pt-8 dark:border-night-border">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-bloom-dark dark:text-night-strong">
            Gallery
          </h2>
          <p className="mt-1 text-sm text-neutral-600 dark:text-night-text">
            Save compositions on this device and reopen them later.
          </p>
        </div>
        <button
          type="button"
          onClick={onSave}
          disabled={!canSave}
          className="rounded-md border border-bloom bg-bloom px-4 py-2 text-sm font-medium text-white hover:border-bloom-pink hover:bg-bloom-pink disabled:cursor-not-allowed disabled:opacity-50"
        >
          Save to gallery
        </button>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-neutral-500 dark:text-night-text">
          No saved compositions yet.
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {items.map((item) => (
            <li
              key={item.id}
              className="overflow-hidden rounded-md border border-neutral-300 bg-white dark:border-night-border dark:bg-night-surface"
            >
              <button
                type="button"
                onClick={() => onLoad(item)}
                className="block w-full text-left"
                aria-label={`Open ${algorithmLabel(item.algorithm)} composition ${item.seed}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.thumbnail}
                  alt=""
                  className="aspect-[4/3] w-full object-cover bg-[#333]"
                />
                <div className="px-2 py-1.5">
                  <p className="truncate text-xs font-medium text-bloom-dark dark:text-night-strong">
                    {algorithmLabel(item.algorithm)}
                  </p>
                  <p className="truncate font-mono text-[11px] text-neutral-500 dark:text-night-text">
                    seed {item.seed}
                  </p>
                </div>
              </button>
              <div className="flex border-t border-neutral-200 dark:border-night-border">
                <button
                  type="button"
                  onClick={() => onLoad(item)}
                  className="flex-1 px-2 py-1.5 text-xs text-[#363636] hover:text-bloom-pink dark:text-night-strong"
                >
                  Load
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(item.id)}
                  className="flex-1 border-l border-neutral-200 px-2 py-1.5 text-xs text-[#363636] hover:text-bloom dark:border-night-border dark:text-night-strong dark:hover:text-bloom-pink"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
