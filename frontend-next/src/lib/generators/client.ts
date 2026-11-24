import type {
  ArtGenerationRequest,
  ArtGenerationResponse,
} from "@/types/art";
import { generateArtSync } from "./index";
import type {
  WorkerRequestMessage,
  WorkerResponseMessage,
} from "./generation.worker";

let worker: Worker | null = null;
let nextId = 1;

const pending = new Map<
  number,
  {
    resolve: (value: ArtGenerationResponse) => void;
    reject: (reason: unknown) => void;
  }
>();

function getWorker(): Worker | null {
  if (typeof window === "undefined" || typeof Worker === "undefined") {
    return null;
  }
  if (worker) return worker;

  try {
    worker = new Worker(
      new URL("./generation.worker.ts", import.meta.url),
      { type: "module" },
    );
  } catch (err) {
    console.warn("Web Worker unavailable; using main-thread generation", err);
    return null;
  }

  worker.onmessage = (event: MessageEvent<WorkerResponseMessage>) => {
    const message = event.data;
    const entry = pending.get(message.id);
    if (!entry) return;
    pending.delete(message.id);
    if (message.ok) {
      entry.resolve(message.result);
    } else {
      entry.reject(new Error(message.error));
    }
  };

  worker.onerror = (event) => {
    console.error("Generation worker error", event);
  };

  return worker;
}

/** Generate art in a Web Worker when available; otherwise on the main thread. */
export function generateArtLocal(
  request: ArtGenerationRequest,
  signal?: AbortSignal,
): Promise<ArtGenerationResponse> {
  if (signal?.aborted) {
    return Promise.reject(new DOMException("Aborted", "AbortError"));
  }

  const activeWorker = getWorker();
  if (!activeWorker) {
    return new Promise((resolve, reject) => {
      if (signal?.aborted) {
        reject(new DOMException("Aborted", "AbortError"));
        return;
      }
      try {
        resolve(generateArtSync(request));
      } catch (err) {
        reject(err);
      }
    });
  }

  const id = nextId;
  nextId += 1;

  return new Promise((resolve, reject) => {
    const onAbort = () => {
      pending.delete(id);
      reject(new DOMException("Aborted", "AbortError"));
    };

    if (signal) {
      signal.addEventListener("abort", onAbort, { once: true });
    }

    pending.set(id, {
      resolve: (value) => {
        signal?.removeEventListener("abort", onAbort);
        resolve(value);
      },
      reject: (reason) => {
        signal?.removeEventListener("abort", onAbort);
        reject(reason);
      },
    });

    const message: WorkerRequestMessage = { id, request };
    activeWorker.postMessage(message);
  });
}
