"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { generateArt } from "@/lib/api";
import type { GenerationEngine } from "@/lib/generationEngine";
import { generateArtLocal } from "@/lib/generators/client";
import type {
  Algorithm,
  ArtElement,
  ArtGenerationRequest,
  ArtGenerationResponse,
} from "@/types/art";

const DEBOUNCE_MS = 300;

export interface GenerateParams {
  algorithm: Algorithm;
  width: number;
  height: number;
  numElements: number;
  /** Parsed seed from the input; null means ask for a random seed. */
  seed: number | null;
  colors?: string[];
  /** Algorithm-specific knobs merged into `parameters` (e.g. flow field scale). */
  algorithmParams?: Record<string, number>;
  engine: GenerationEngine;
}

function buildRequest(
  params: GenerateParams,
  seedOverride?: number | null,
): ArtGenerationRequest {
  const seed = seedOverride === undefined ? params.seed : seedOverride;
  const parameters: Record<string, unknown> = {
    ...(params.algorithmParams ?? {}),
  };
  if (params.colors && params.colors.length > 0) {
    parameters.colors = params.colors;
  }
  return {
    algorithm: params.algorithm,
    width: params.width,
    height: params.height,
    num_elements: params.numElements,
    ...(seed !== null ? { seed } : {}),
    parameters,
  };
}

function isAbortError(err: unknown): boolean {
  return (
    (err instanceof DOMException && err.name === "AbortError") ||
    (err instanceof Error && err.name === "AbortError")
  );
}

async function runEngine(
  engine: GenerationEngine,
  request: ArtGenerationRequest,
  signal: AbortSignal,
): Promise<ArtGenerationResponse> {
  if (engine === "local") {
    return generateArtLocal(request, signal);
  }
  return generateArt(request, signal);
}

export function useGenerateArt(params: GenerateParams) {
  const [artData, setArtData] = useState<ArtElement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSeed, setLastSeed] = useState<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const paramsRef = useRef(params);
  const skipDebounceRef = useRef(true);
  const initialDoneRef = useRef(false);

  useEffect(() => {
    paramsRef.current = params;
  }, [params]);

  const runGenerate = useCallback(async (seedOverride?: number | null) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);
    try {
      const current = paramsRef.current;
      const data = await runEngine(
        current.engine,
        buildRequest(current, seedOverride),
        controller.signal,
      );
      if (controller.signal.aborted) return;
      setArtData(data.elements);
      setLastSeed(data.seed);
    } catch (err) {
      if (controller.signal.aborted || isAbortError(err)) return;
      console.error("Error fetching art:", err);
      setError(err instanceof Error ? err.message : "Failed to generate art");
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, []);

  const generate = useCallback(() => {
    void runGenerate();
  }, [runGenerate]);

  const regenerate = useCallback(() => {
    void runGenerate(null);
  }, [runGenerate]);

  useEffect(() => {
    if (initialDoneRef.current) return;
    initialDoneRef.current = true;
    void runGenerate();
    return () => {
      abortRef.current?.abort();
    };
  }, [runGenerate]);

  const colorsKey = params.colors?.join(",") ?? "";
  const algorithmParamsKey = JSON.stringify(params.algorithmParams ?? {});

  useEffect(() => {
    if (skipDebounceRef.current) {
      skipDebounceRef.current = false;
      return;
    }

    const timer = window.setTimeout(() => {
      void runGenerate();
    }, DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [
    params.algorithm,
    params.width,
    params.height,
    params.numElements,
    params.seed,
    params.engine,
    colorsKey,
    algorithmParamsKey,
    runGenerate,
  ]);

  return {
    artData,
    loading,
    error,
    lastSeed,
    generate,
    regenerate,
  };
}
