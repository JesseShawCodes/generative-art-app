"use client";

import type { RefObject } from "react";
import { artToSvg } from "@/lib/exportSvg";
import {
  buildArtFilename,
  downloadTextFile,
  triggerDownload,
} from "@/lib/download";
import type { Algorithm, ArtElement } from "@/types/art";

interface ExportMenuProps {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  artData: ArtElement[];
  algorithm: Algorithm;
  seed: number | null;
  width: number;
  height: number;
  disabled?: boolean;
}

export default function ExportMenu({
  canvasRef,
  artData,
  algorithm,
  seed,
  width,
  height,
  disabled = false,
}: ExportMenuProps) {
  const downloadPng = () => {
    if (!canvasRef.current) return;
    triggerDownload(
      canvasRef.current.toDataURL("image/png"),
      buildArtFilename(algorithm, seed, "png"),
    );
  };

  const downloadSvg = () => {
    const svg = artToSvg(artData, width, height);
    downloadTextFile(
      svg,
      buildArtFilename(algorithm, seed, "svg"),
      "image/svg+xml",
    );
  };

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={downloadPng}
        disabled={disabled}
        className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-[#363636] hover:border-bloom-pink disabled:cursor-not-allowed disabled:opacity-50 dark:border-night-border dark:bg-night-surface dark:text-night-strong"
      >
        Download PNG
      </button>
      <button
        type="button"
        onClick={downloadSvg}
        disabled={disabled || artData.length === 0}
        className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-[#363636] hover:border-bloom-pink disabled:cursor-not-allowed disabled:opacity-50 dark:border-night-border dark:bg-night-surface dark:text-night-strong"
      >
        Download SVG
      </button>
    </div>
  );
}
