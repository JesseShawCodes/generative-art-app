import type { ArtGenerationResponse } from "@/types/art";

const sampleResponse: ArtGenerationResponse = {
  algorithm: "circles",
  seed: 5,
  width: 100,
  height: 80,
  elements: [
    { type: "circle", x: 1, y: 2, radius: 3, color: "#fff", opacity: 1 },
  ],
};

describe("generateArtLocal", () => {
  const originalWorker = global.Worker;

  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    global.Worker = originalWorker;
  });

  it("falls back to sync generation when Worker is unavailable", async () => {
    // @ts-expect-error force Worker absence
    delete global.Worker;

    jest.doMock("../index", () => ({
      generateArtSync: jest.fn(() => sampleResponse),
    }));

    const { generateArtLocal } = await import("../client");
    const { generateArtSync } = await import("../index");

    await expect(
      generateArtLocal({
        algorithm: "circles",
        width: 100,
        height: 80,
        num_elements: 1,
      }),
    ).resolves.toEqual(sampleResponse);
    expect(generateArtSync).toHaveBeenCalled();
  });

  it("rejects immediately when the signal is already aborted", async () => {
    // @ts-expect-error force Worker absence
    delete global.Worker;

    const { generateArtLocal } = await import("../client");
    const controller = new AbortController();
    controller.abort();

    await expect(
      generateArtLocal(
        {
          algorithm: "circles",
          width: 100,
          height: 80,
          num_elements: 1,
        },
        controller.signal,
      ),
    ).rejects.toMatchObject({ name: "AbortError" });
  });

  it("posts to a worker and resolves on success", async () => {
    class MockWorker {
      onmessage: ((event: MessageEvent) => void) | null = null;
      onerror: ((event: ErrorEvent) => void) | null = null;
      postMessage = jest.fn((message: { id: number }) => {
        queueMicrotask(() => {
          this.onmessage?.({
            data: { id: message.id, ok: true, result: sampleResponse },
          } as MessageEvent);
        });
      });
    }

    global.Worker = MockWorker as unknown as typeof Worker;

    const { generateArtLocal } = await import("../client");
    await expect(
      generateArtLocal({
        algorithm: "circles",
        width: 100,
        height: 80,
        num_elements: 1,
        seed: 5,
      }),
    ).resolves.toEqual(sampleResponse);
  });

  it("rejects when the worker returns an error", async () => {
    class MockWorker {
      onmessage: ((event: MessageEvent) => void) | null = null;
      onerror: ((event: ErrorEvent) => void) | null = null;
      postMessage = jest.fn((message: { id: number }) => {
        queueMicrotask(() => {
          this.onmessage?.({
            data: { id: message.id, ok: false, error: "worker failed" },
          } as MessageEvent);
        });
      });
    }

    // Fresh module so getWorker creates a new instance with this Worker.
    jest.resetModules();
    global.Worker = MockWorker as unknown as typeof Worker;
    const { generateArtLocal } = await import("../client");

    await expect(
      generateArtLocal({
        algorithm: "circles",
        width: 100,
        height: 80,
        num_elements: 1,
      }),
    ).rejects.toThrow("worker failed");
  });

  it("rejects when aborted while waiting on the worker", async () => {
    class MockWorker {
      onmessage: ((event: MessageEvent) => void) | null = null;
      onerror: ((event: ErrorEvent) => void) | null = null;
      postMessage = jest.fn();
    }

    jest.resetModules();
    global.Worker = MockWorker as unknown as typeof Worker;
    const { generateArtLocal } = await import("../client");

    const controller = new AbortController();
    const pending = generateArtLocal(
      {
        algorithm: "circles",
        width: 100,
        height: 80,
        num_elements: 1,
      },
      controller.signal,
    );
    controller.abort();

    await expect(pending).rejects.toMatchObject({ name: "AbortError" });
  });

  it("falls back when Worker construction throws", async () => {
    global.Worker = jest.fn(() => {
      throw new Error("Worker unsupported");
    }) as unknown as typeof Worker;

    jest.doMock("../index", () => ({
      generateArtSync: jest.fn(() => sampleResponse),
    }));
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

    const { generateArtLocal } = await import("../client");
    await expect(
      generateArtLocal({
        algorithm: "circles",
        width: 100,
        height: 80,
        num_elements: 1,
      }),
    ).resolves.toEqual(sampleResponse);
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it("rejects sync generation errors on the main thread", async () => {
    // @ts-expect-error force Worker absence
    delete global.Worker;
    jest.doMock("../index", () => ({
      generateArtSync: jest.fn(() => {
        throw new Error("sync boom");
      }),
    }));

    const { generateArtLocal } = await import("../client");
    await expect(
      generateArtLocal({
        algorithm: "circles",
        width: 100,
        height: 80,
        num_elements: 1,
      }),
    ).rejects.toThrow("sync boom");
  });

  it("rejects when aborted after falling back to sync generation", async () => {
    // @ts-expect-error force Worker absence
    delete global.Worker;
    jest.doMock("../index", () => ({
      generateArtSync: jest.fn(() => sampleResponse),
    }));

    const { generateArtLocal } = await import("../client");
    const controller = new AbortController();
    // Abort between the outer check and the sync Promise body.
    const signal = controller.signal;
    Object.defineProperty(signal, "aborted", {
      get: (() => {
        let calls = 0;
        return () => {
          calls += 1;
          return calls > 1;
        };
      })(),
    });

    await expect(
      generateArtLocal(
        {
          algorithm: "circles",
          width: 100,
          height: 80,
          num_elements: 1,
        },
        signal,
      ),
    ).rejects.toMatchObject({ name: "AbortError" });
  });
});
