"use client";

import RangeField from "../RangeField";
import PalettePicker from "./PalettePicker";
import ExportMenu from "./ExportMenu";
import type { RefObject } from "react";
import {
  GENERATION_ENGINES,
  type GenerationEngine,
} from "@/lib/generationEngine";
import type { PaletteId } from "@/lib/palettes";
import { ALGORITHMS, type Algorithm, type ArtElement } from "@/types/art";

interface ControlPanelProps {
  algorithm: Algorithm;
  onAlgorithmChange: (value: Algorithm) => void;
  engine: GenerationEngine;
  onEngineChange: (value: GenerationEngine) => void;
  width: number;
  onWidthChange: (value: number) => void;
  height: number;
  onHeightChange: (value: number) => void;
  numElements: number;
  onNumElementsChange: (value: number) => void;
  /** Flow field noise scale; only shown when algorithm is flow_field. */
  flowFieldScale: number;
  onFlowFieldScaleChange: (value: number) => void;
  seedInput: string;
  onSeedInputChange: (value: string) => void;
  lastSeed: number | null;
  onReuseSeed: () => void;
  onClearSeed: () => void;
  paletteId: PaletteId;
  onPaletteIdChange: (id: PaletteId) => void;
  customColors: string[];
  onCustomColorsChange: (colors: string[]) => void;
  enoMode: boolean;
  onEnoModeChange: (enabled: boolean) => void;
  loading: boolean;
  error: string | null;
  onGenerate: () => void;
  onRegenerate: () => void;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  artData: ArtElement[];
}

export default function ControlPanel({
  algorithm,
  onAlgorithmChange,
  engine,
  onEngineChange,
  width,
  onWidthChange,
  height,
  onHeightChange,
  numElements,
  onNumElementsChange,
  flowFieldScale,
  onFlowFieldScaleChange,
  seedInput,
  onSeedInputChange,
  lastSeed,
  onReuseSeed,
  onClearSeed,
  paletteId,
  onPaletteIdChange,
  customColors,
  onCustomColorsChange,
  enoMode,
  onEnoModeChange,
  loading,
  error,
  onGenerate,
  onRegenerate,
  canvasRef,
  artData,
}: ControlPanelProps) {
  return (
    <aside className="w-full shrink-0 lg:w-80 xl:w-96">
      <div className="lg:sticky lg:top-4">
        <div className="mb-3">
          <label
            className="mb-1 block font-semibold text-bloom-dark dark:text-night-strong"
            htmlFor="algorithm-select"
          >
            Algorithm
          </label>
          <select
            id="algorithm-select"
            value={algorithm}
            onChange={(event) =>
              onAlgorithmChange(event.target.value as Algorithm)
            }
            className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-[#363636] dark:border-night-border dark:bg-night-surface dark:text-night-strong"
          >
            {ALGORITHMS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <p className="mb-1 font-semibold text-bloom-dark dark:text-night-strong">
            Engine
          </p>
          <div
            className="flex gap-2"
            role="radiogroup"
            aria-label="Generation engine"
          >
            {GENERATION_ENGINES.map((option) => {
              const selected = engine === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => onEngineChange(option.value)}
                  title={option.description}
                  className={`flex-1 rounded-md border px-3 py-2 text-sm ${
                    selected
                      ? "border-bloom-pink bg-bloom-white text-bloom-dark dark:bg-night-surface dark:text-night-strong"
                      : "border-neutral-300 bg-white text-[#363636] hover:border-bloom-pink dark:border-night-border dark:bg-night-raised dark:text-night-text"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
          <p className="mt-1 text-xs text-neutral-500 dark:text-night-text">
            {engine === "local"
              ? "Runs in a Web Worker on this device."
              : "Uses the Python backend API."}
          </p>
        </div>

        <RangeField
          id="width-input"
          label="Width"
          min={100}
          max={1000}
          value={width}
          onValueChange={onWidthChange}
        />
        <RangeField
          id="height-input"
          label="Height"
          min={100}
          max={1000}
          value={height}
          onValueChange={onHeightChange}
        />
        <RangeField
          id="elements-input"
          label="Elements"
          min={1}
          max={500}
          value={numElements}
          onValueChange={onNumElementsChange}
        />

        {algorithm === "flow_field" && (
          <RangeField
            id="flow-field-scale-input"
            label={`Scale (${flowFieldScale.toFixed(3)})`}
            min={0.001}
            max={0.08}
            step={0.001}
            value={flowFieldScale}
            onValueChange={onFlowFieldScaleChange}
          />
        )}

        <div className="mb-3">
          <label
            className="mb-1 block font-semibold text-bloom-dark dark:text-night-strong"
            htmlFor="seed-input"
          >
            Seed
          </label>
          <div className="flex gap-2">
            <input
              id="seed-input"
              type="number"
              min={0}
              step={1}
              value={seedInput}
              onChange={(event) => onSeedInputChange(event.target.value)}
              placeholder="Leave empty for random"
              className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-[#363636] dark:border-night-border dark:bg-night-surface dark:text-night-strong"
            />
            <button
              type="button"
              onClick={onClearSeed}
              className="shrink-0 rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-[#363636] hover:border-bloom-pink dark:border-night-border dark:bg-night-surface dark:text-night-strong"
            >
              Clear
            </button>
          </div>
          {lastSeed !== null && (
            <p className="mt-1 text-xs text-neutral-500 dark:text-night-text">
              Last seed: {lastSeed}{" "}
              <button
                type="button"
                onClick={onReuseSeed}
                className="underline hover:text-bloom-pink"
              >
                reuse
              </button>
            </p>
          )}
        </div>

        <PalettePicker
          paletteId={paletteId}
          customColors={customColors}
          onPaletteIdChange={onPaletteIdChange}
          onCustomColorsChange={onCustomColorsChange}
        />

        <div className="mb-3">
          <label
            htmlFor="eno-mode-toggle"
            className="flex cursor-pointer items-start gap-2"
          >
            <input
              id="eno-mode-toggle"
              type="checkbox"
              checked={enoMode}
              onChange={(event) => onEnoModeChange(event.target.checked)}
              className="mt-1 h-4 w-4 accent-bloom"
            />
            <span>
              <span className="block font-semibold text-bloom-dark dark:text-night-strong">
                Brian Eno Mode
              </span>
              <span className="block text-xs text-neutral-500 dark:text-night-text">
                Colors drift slowly over time, like ambient light.
              </span>
            </span>
          </label>
        </div>

        <div className="mb-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onGenerate}
            disabled={loading}
            className="rounded-md border border-bloom bg-bloom px-4 py-2 text-sm font-medium text-white hover:border-bloom-pink hover:bg-bloom-pink disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Generating..." : "Generate"}
          </button>
          <button
            type="button"
            onClick={onRegenerate}
            disabled={loading}
            className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm text-[#363636] hover:border-bloom-pink disabled:cursor-not-allowed disabled:opacity-50 dark:border-night-border dark:bg-night-surface dark:text-night-strong"
          >
            Regenerate
          </button>
        </div>

        <ExportMenu
          canvasRef={canvasRef}
          artData={artData}
          algorithm={algorithm}
          seed={lastSeed}
          width={width}
          height={height}
          disabled={loading}
        />

        {error && (
          <p
            role="alert"
            className="mt-3 text-sm text-bloom dark:text-bloom-pink"
          >
            {error}
          </p>
        )}
      </div>
    </aside>
  );
}
