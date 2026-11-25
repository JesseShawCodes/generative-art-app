"use client";

import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import {
  ENO_HUE_DEGREES_PER_SECOND,
  shiftArtColors,
} from "@/lib/colorShift";
import { renderArt } from "@/lib/renderArt";
import type { ArtElement } from "@/types/art";

interface ResponsiveCanvasProps {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  artData: ArtElement[];
  width: number;
  height: number;
  /** When true, slowly drifts artwork hues over time (Brian Eno Mode). */
  enoMode?: boolean;
}

export default function ResponsiveCanvas({
  canvasRef,
  artData,
  width,
  height,
  enoMode = false,
}: ResponsiveCanvasProps) {
  const localRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (localRef.current) {
      canvasRef.current = localRef.current;
    }
  }, [canvasRef]);

  useEffect(() => {
    const canvas = localRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context || typeof context.clearRect !== "function") return;

    if (!enoMode) {
      renderArt(context, artData, width, height);
      return;
    }

    let frameId = 0;
    const startedAt = performance.now();

    const tick = (now: number) => {
      const degrees =
        ((now - startedAt) / 1000) * ENO_HUE_DEGREES_PER_SECOND;
      renderArt(context, shiftArtColors(artData, degrees), width, height);
      frameId = window.requestAnimationFrame(tick);
    };

    frameId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frameId);
  }, [artData, width, height, enoMode]);

  return (
    <div className="w-full overflow-hidden rounded-sm border border-neutral-300 bg-[#333] dark:border-night-border">
      <canvas
        ref={localRef}
        width={width}
        height={height}
        className="block h-auto w-full max-w-full"
        style={{ aspectRatio: `${width} / ${height}` }}
      />
    </div>
  );
}
