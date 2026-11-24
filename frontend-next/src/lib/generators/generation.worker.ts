/// <reference lib="webworker" />

import type { ArtGenerationRequest, ArtGenerationResponse } from "@/types/art";
import { generateArtSync } from "./index";

export interface WorkerRequestMessage {
  id: number;
  request: ArtGenerationRequest;
}

export type WorkerResponseMessage =
  | { id: number; ok: true; result: ArtGenerationResponse }
  | { id: number; ok: false; error: string };

const workerScope = self as DedicatedWorkerGlobalScope;

workerScope.onmessage = (event: MessageEvent<WorkerRequestMessage>) => {
  const { id, request } = event.data;
  try {
    const result = generateArtSync(request);
    const response: WorkerResponseMessage = { id, ok: true, result };
    workerScope.postMessage(response);
  } catch (err) {
    const response: WorkerResponseMessage = {
      id,
      ok: false,
      error: err instanceof Error ? err.message : "Local generation failed",
    };
    workerScope.postMessage(response);
  }
};
