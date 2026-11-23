"use client";

import { useEffect, useMemo, useState } from "react";
import { useCanvas } from "./CanvasContext";
import ControlPanel from "./components/studio/ControlPanel";
import ResponsiveCanvas from "./components/studio/ResponsiveCanvas";
import { useGenerateArt } from "./hooks/useGenerateArt";
import { colorsForPalette, type PaletteId } from "@/lib/palettes";
import type { Algorithm } from "@/types/art";

const INITIAL_WIDTH = 800;
const INITIAL_HEIGHT = 600;
const INITIAL_NUM_ELEMENTS = 50;
const INITIAL_ALGORITHM: Algorithm = "circles";

export default function Home() {
  const { canvasRef, exportMetaRef } = useCanvas();
  const [algorithm, setAlgorithm] = useState<Algorithm>(INITIAL_ALGORITHM);
  const [width, setWidth] = useState(INITIAL_WIDTH);
  const [height, setHeight] = useState(INITIAL_HEIGHT);
  const [numElements, setNumElements] = useState(INITIAL_NUM_ELEMENTS);
  const [seedInput, setSeedInput] = useState("");
  const [paletteId, setPaletteId] = useState<PaletteId>("bloom");
  const [customColors, setCustomColors] = useState<string[]>([]);

  const parsedSeed = useMemo(() => {
    if (seedInput.trim() === "") return null;
    const value = Number(seedInput);
    return Number.isInteger(value) && value >= 0 ? value : null;
  }, [seedInput]);

  const colors = useMemo(
    () => colorsForPalette(paletteId, customColors),
    [paletteId, customColors],
  );

  const { artData, loading, error, lastSeed, generate, regenerate } =
    useGenerateArt({
      algorithm,
      width,
      height,
      numElements,
      seed: parsedSeed,
      colors,
    });

  useEffect(() => {
    exportMetaRef.current = {
      algorithm,
      seed: lastSeed,
    };
  }, [algorithm, lastSeed, exportMetaRef]);

  const handleRegenerate = () => {
    setSeedInput("");
    regenerate();
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4">
      <main className="py-6">
        <p className="mb-6 max-w-xl text-sm text-neutral-600 dark:text-night-text">
          Tweak parameters live, lock a seed to refine a composition, and export
          as PNG or SVG.
        </p>

        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
          <div className="min-w-0 flex-1">
            <ResponsiveCanvas
              canvasRef={canvasRef}
              artData={artData}
              width={width}
              height={height}
            />
            {loading && (
              <p className="mt-2 text-xs text-neutral-500 dark:text-night-text">
                Generating…
              </p>
            )}
          </div>

          <ControlPanel
            algorithm={algorithm}
            onAlgorithmChange={setAlgorithm}
            width={width}
            onWidthChange={setWidth}
            height={height}
            onHeightChange={setHeight}
            numElements={numElements}
            onNumElementsChange={setNumElements}
            seedInput={seedInput}
            onSeedInputChange={setSeedInput}
            lastSeed={lastSeed}
            onReuseSeed={() => {
              if (lastSeed !== null) setSeedInput(String(lastSeed));
            }}
            onClearSeed={() => setSeedInput("")}
            paletteId={paletteId}
            onPaletteIdChange={setPaletteId}
            customColors={customColors}
            onCustomColorsChange={setCustomColors}
            loading={loading}
            error={error}
            onGenerate={generate}
            onRegenerate={handleRegenerate}
            canvasRef={canvasRef}
            artData={artData}
          />
        </div>
      </main>
    </div>
  );
}
