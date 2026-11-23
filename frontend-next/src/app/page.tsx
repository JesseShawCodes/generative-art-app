"use client";
import { useRef, useEffect, useState, useCallback } from 'react';
import { useCanvas } from './CanvasContext';
import RangeField from './components/RangeField';
import { generateArt } from '@/lib/api';
import type { Circle } from '@/types/art';

export default function Home() {
  const localCanvasRef = useRef<HTMLCanvasElement>(null);
  const { canvasRef } = useCanvas();
  const [artData, setArtData] = useState<Circle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);
  const [numElements, setNumElements] = useState(50);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (localCanvasRef.current) {
      canvasRef.current = localCanvasRef.current;
    }
  }, [canvasRef]);

  const fetchArt = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);
    try {
      const data = await generateArt(
        { width, height, num_elements: numElements },
        controller.signal,
      );
      setArtData(data);
    } catch (err) {
      if (controller.signal.aborted) return;
      console.error("Error fetching art:", err);
      setError(err instanceof Error ? err.message : "Failed to generate art");
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, [width, height, numElements]);

  useEffect(() => {
    // Initial load only — slider changes wait for the Generate button.
    void fetchArt();
    return () => {
      abortRef.current?.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only fetch
  }, []);

  useEffect(() => {
    const canvas = localCanvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    context.clearRect(0, 0, canvas.width, canvas.height);

    artData.forEach(circle => {
      context.beginPath();
      context.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2, false);
      context.fillStyle = circle.color;
      context.fill();
    });
  }, [artData, width, height]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4">
      <main className="py-6">
        <div>
          <RangeField id="width-input" label="Width" min={100} max={1000} value={width} onValueChange={setWidth} />
          <RangeField id="height-input" label="Height" min={100} max={1000} value={height} onValueChange={setHeight} />
          <RangeField id="elements-input" label="Elements" min={1} max={500} value={numElements} onValueChange={setNumElements} />
          <button
            onClick={() => void fetchArt()}
            disabled={loading}
            className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-[#363636] hover:border-bloom-pink disabled:cursor-not-allowed disabled:opacity-50 dark:border-night-border dark:bg-night-surface dark:text-night-strong"
          >
            {loading ? 'Generating...' : 'Generate New Art'}
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
