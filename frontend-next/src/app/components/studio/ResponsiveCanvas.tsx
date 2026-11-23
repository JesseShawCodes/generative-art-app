"use client";

import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import { renderArt } from "@/lib/renderArt";
import type { ArtElement } from "@/types/art";

interface ResponsiveCanvasProps {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  artData: ArtElement[];
  width: number;
  height: number;
}

export default function ResponsiveCanvas({
  canvasRef,
  artData,
  width,
  height,
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
    renderArt(context, artData, width, height);
  }, [artData, width, height]);

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
