"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useCanvas } from "./CanvasContext";
import ControlPanel from "./components/studio/ControlPanel";
import GalleryPanel from "./components/studio/GalleryPanel";
import ResponsiveCanvas from "./components/studio/ResponsiveCanvas";
import { useGallery } from "./hooks/useGallery";
import { useGenerateArt } from "./hooks/useGenerateArt";
import { captureThumbnail, type GalleryItem } from "@/lib/gallery";
import type { GenerationEngine } from "@/lib/generationEngine";
import { colorsForPalette, type PaletteId } from "@/lib/palettes";
import type { Algorithm } from "@/types/art";

const INITIAL_WIDTH = 800;
const INITIAL_HEIGHT = 600;
const INITIAL_NUM_ELEMENTS = 50;
const INITIAL_ALGORITHM: Algorithm = "circles";
const INITIAL_ENGINE: GenerationEngine = "local";
/** Matches backend / local generator default for flow_field `scale`. */
const INITIAL_FLOW_FIELD_SCALE = 0.012;

export default function Home() {
  const { canvasRef, exportMetaRef } = useCanvas();
  const [algorithm, setAlgorithm] = useState<Algorithm>(INITIAL_ALGORITHM);
  const [engine, setEngine] = useState<GenerationEngine>(INITIAL_ENGINE);
  const [width, setWidth] = useState(INITIAL_WIDTH);
  const [height, setHeight] = useState(INITIAL_HEIGHT);
  const [numElements, setNumElements] = useState(INITIAL_NUM_ELEMENTS);
  const [flowFieldScale, setFlowFieldScale] = useState(INITIAL_FLOW_FIELD_SCALE);
  const [seedInput, setSeedInput] = useState("");
  const [paletteId, setPaletteId] = useState<PaletteId>("bloom");
  const [customColors, setCustomColors] = useState<string[]>([]);
  const [enoMode, setEnoMode] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const { items, saveItem, deleteItem } = useGallery();

  const parsedSeed = useMemo(() => {
    if (seedInput.trim() === "") return null;
    const value = Number(seedInput);
    return Number.isInteger(value) && value >= 0 ? value : null;
  }, [seedInput]);

  const colors = useMemo(
    () => colorsForPalette(paletteId, customColors),
    [paletteId, customColors],
  );

  const algorithmParams = useMemo(() => {
    if (algorithm !== "flow_field") return undefined;
    return { scale: flowFieldScale };
  }, [algorithm, flowFieldScale]);

  const { artData, loading, error, lastSeed, generate, regenerate } =
    useGenerateArt({
      algorithm,
      width,
      height,
      numElements,
      seed: parsedSeed,
      colors,
      algorithmParams,
      engine,
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

  const handleSaveToGallery = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || lastSeed === null || loading) return;

    saveItem({
      algorithm,
      width,
      height,
      numElements,
      seed: lastSeed,
      paletteId,
      customColors,
      engine,
      thumbnail: captureThumbnail(canvas),
    });
    setSaveMessage("Saved to gallery");
  }, [
    algorithm,
    canvasRef,
    customColors,
    engine,
    height,
    lastSeed,
    loading,
    numElements,
    paletteId,
    saveItem,
    width,
  ]);

  useEffect(() => {
    if (!saveMessage) return;
    const timer = window.setTimeout(() => setSaveMessage(null), 2000);
    return () => window.clearTimeout(timer);
  }, [saveMessage]);

  const handleLoadFromGallery = useCallback((item: GalleryItem) => {
    setAlgorithm(item.algorithm);
    setWidth(item.width);
    setHeight(item.height);
    setNumElements(item.numElements);
    setSeedInput(String(item.seed));
    setPaletteId(item.paletteId);
    setCustomColors(item.customColors);
    setEngine(item.engine);
  }, []);

  return (
    <div className="mx-auto w-full max-w-7xl px-4">
      <div className="py-6">
        <p className="mb-6 max-w-xl text-sm text-neutral-600 dark:text-night-text">
          Tweak parameters live, lock a seed to refine a composition, and export
          as PNG or SVG. Local mode keeps the UI snappy via a Web Worker; Server
          mode uses the Python backend.
        </p>

        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
          <div className="min-w-0 flex-1">
            <ResponsiveCanvas
              canvasRef={canvasRef}
              artData={artData}
              width={width}
              height={height}
              enoMode={enoMode}
            />
            {loading && (
              <p className="mt-2 text-xs text-neutral-500 dark:text-night-text">
                Generating…
              </p>
            )}
            {saveMessage && (
              <p
                role="status"
                className="mt-2 text-xs text-bloom dark:text-bloom-pink"
              >
                {saveMessage}
              </p>
            )}
          </div>

          <ControlPanel
            algorithm={algorithm}
            onAlgorithmChange={setAlgorithm}
            engine={engine}
            onEngineChange={setEngine}
            width={width}
            onWidthChange={setWidth}
            height={height}
            onHeightChange={setHeight}
            numElements={numElements}
            onNumElementsChange={setNumElements}
            flowFieldScale={flowFieldScale}
            onFlowFieldScaleChange={setFlowFieldScale}
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
            enoMode={enoMode}
            onEnoModeChange={setEnoMode}
            loading={loading}
            error={error}
            onGenerate={generate}
            onRegenerate={handleRegenerate}
            canvasRef={canvasRef}
            artData={artData}
          />
        </div>

        <GalleryPanel
          items={items}
          onSave={handleSaveToGallery}
          onLoad={handleLoadFromGallery}
          onDelete={deleteItem}
          canSave={!loading && lastSeed !== null && artData.length > 0}
        />
      </div>
    </div>
  );
}
