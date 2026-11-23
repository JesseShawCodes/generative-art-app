"use client";
import { useRef, useEffect, useState, useCallback } from "react";
import { useCanvas } from "./CanvasContext";
import RangeField from "./components/RangeField";
import { generateArt } from "@/lib/api";
import { renderArt } from "@/lib/renderArt";
import {
  ALGORITHMS,
  type Algorithm,
  type ArtElement,
  type ArtGenerationRequest,
} from "@/types/art";

const INITIAL_WIDTH = 800;
const INITIAL_HEIGHT = 600;
const INITIAL_NUM_ELEMENTS = 50;
const INITIAL_ALGORITHM: Algorithm = "circles";

function buildRequest(
  algorithm: Algorithm,
  width: number,
  height: number,
  numElements: number,
  seed: number | null,
): ArtGenerationRequest {
  return {
    algorithm,
    width,
    height,
    num_elements: numElements,
    ...(seed !== null ? { seed } : {}),
  };
}

export default function Home() {
  const localCanvasRef = useRef<HTMLCanvasElement>(null);
  const { canvasRef } = useCanvas();
  const [artData, setArtData] = useState<ArtElement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [algorithm, setAlgorithm] = useState<Algorithm>(INITIAL_ALGORITHM);
  const [width, setWidth] = useState(INITIAL_WIDTH);
  const [height, setHeight] = useState(INITIAL_HEIGHT);
  const [numElements, setNumElements] = useState(INITIAL_NUM_ELEMENTS);
  const [seedInput, setSeedInput] = useState("");
  const [lastSeed, setLastSeed] = useState<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (localCanvasRef.current) {
      canvasRef.current = localCanvasRef.current;
    }
  }, [canvasRef]);

  const parsedSeed = (() => {
    if (seedInput.trim() === "") return null;
    const value = Number(seedInput);
    return Number.isInteger(value) && value >= 0 ? value : null;
  })();

  const fetchArt = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);
    try {
      const data = await generateArt(
        buildRequest(algorithm, width, height, numElements, parsedSeed),
        controller.signal,
      );
      setArtData(data.elements);
      setLastSeed(data.seed);
    } catch (err) {
      if (controller.signal.aborted) return;
      console.error("Error fetching art:", err);
      setError(err instanceof Error ? err.message : "Failed to generate art");
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, [algorithm, width, height, numElements, parsedSeed]);

  // Initial load only — control changes wait for the Generate button.
  useEffect(() => {
    const controller = new AbortController();
    abortRef.current = controller;

    void (async () => {
      try {
        const data = await generateArt(
          buildRequest(
            INITIAL_ALGORITHM,
            INITIAL_WIDTH,
            INITIAL_HEIGHT,
            INITIAL_NUM_ELEMENTS,
            null,
          ),
          controller.signal,
        );
        if (!controller.signal.aborted) {
          setArtData(data.elements);
          setLastSeed(data.seed);
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        console.error("Error fetching art:", err);
        setError(err instanceof Error ? err.message : "Failed to generate art");
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    })();

    return () => {
      controller.abort();
    };
  }, []);

  useEffect(() => {
    const canvas = localCanvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    renderArt(context, artData, width, height);
  }, [artData, width, height]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4">
      <main className="py-6">
        <div className="max-w-xl">
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
                setAlgorithm(event.target.value as Algorithm)
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

          <RangeField
            id="width-input"
            label="Width"
            min={100}
            max={1000}
            value={width}
            onValueChange={setWidth}
          />
          <RangeField
            id="height-input"
            label="Height"
            min={100}
            max={1000}
            value={height}
            onValueChange={setHeight}
          />
          <RangeField
            id="elements-input"
            label="Elements"
            min={1}
            max={500}
            value={numElements}
            onValueChange={setNumElements}
          />

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
                onChange={(event) => setSeedInput(event.target.value)}
                placeholder="Leave empty for random"
                className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-[#363636] dark:border-night-border dark:bg-night-surface dark:text-night-strong"
              />
              <button
                type="button"
                onClick={() => setSeedInput("")}
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
                  onClick={() => setSeedInput(String(lastSeed))}
                  className="underline hover:text-bloom-pink"
                >
                  reuse
                </button>
              </p>
            )}
          </div>

          <button
            onClick={() => void fetchArt()}
            disabled={loading}
            className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-[#363636] hover:border-bloom-pink disabled:cursor-not-allowed disabled:opacity-50 dark:border-night-border dark:bg-night-surface dark:text-night-strong"
          >
            {loading ? "Generating..." : "Generate New Art"}
          </button>
          {error && (
            <p
              role="alert"
              className="mt-3 text-sm text-bloom dark:text-bloom-pink"
            >
              {error}
            </p>
          )}
        </div>

        <canvas
          ref={localCanvasRef}
          width={width}
          height={height}
          className="mt-5 border border-[#ccc] bg-[#333]"
        />
      </main>
    </div>
  );
}
