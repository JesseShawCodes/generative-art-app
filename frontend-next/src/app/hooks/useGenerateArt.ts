"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { generateArt } from "@/lib/api";
import type {
  Algorithm,
  ArtElement,
  ArtGenerationRequest,
} from "@/types/art";

const DEBOUNCE_MS = 300;

export interface GenerateParams {
  algorithm: Algorithm;
  width: number;
  height: number;
  numElements: number;
  /** Parsed seed from the input; null means ask backend for a random seed. */
  seed: number | null;
  colors?: string[];
}

function buildRequest(
  params: GenerateParams,
  seedOverride?: number | null,
): ArtGenerationRequest {
  const seed = seedOverride === undefined ? params.seed : seedOverride;
  return {
    algorithm: params.algorithm,
    width: params.width,
    height: params.height,
    num_elements: params.numElements,
    ...(seed !== null ? { seed } : {}),
    ...(params.colors && params.colors.length > 0
      ? { parameters: { colors: params.colors } }
      : { parameters: {} }),
  };
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
      const data = await generateArt(
        buildRequest(paramsRef.current, seedOverride),
        controller.signal,
      );
      if (controller.signal.aborted) return;
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
  }, []);

  /** Explicit generate using current seed input (or random if empty). */
  const generate = useCallback(() => {
    void runGenerate();
  }, [runGenerate]);

  /** Force a fresh random composition (ignore seed input for this call). */
  const regenerate = useCallback(() => {
    void runGenerate(null);
  }, [runGenerate]);

  // Initial load once.
  useEffect(() => {
    if (initialDoneRef.current) return;
    initialDoneRef.current = true;
    void runGenerate();
    return () => {
      abortRef.current?.abort();
    };
  }, [runGenerate]);

  const colorsKey = params.colors?.join(",") ?? "";

  // Debounced live updates when controls change (skip the first mount).
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
    colorsKey,
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
