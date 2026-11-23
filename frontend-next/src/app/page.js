"use client";
import React, { useRef, useEffect, useState, useCallback } from 'react';
import Head from 'next/head'; // For managing document head
import { useCanvas } from './CanvasContext';

export default function Home() {
  const localCanvasRef = useRef(null);
  const { canvasRef } = useCanvas();
  const [artData, setArtData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);
  const [numElements, setNumElements] = useState(50);

  useEffect(() => {
    if (localCanvasRef.current) {
      canvasRef.current = localCanvasRef.current;
    }
  }, [canvasRef]);

  const fetchArt = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/generate-art`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ width, height, num_elements: numElements }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setArtData(data);
    } catch (error) {
      console.error("Error fetching art:", error);
    } finally {
      setLoading(false);
    }
  }, [width, height, numElements]);

  useEffect(() => {
    // Fetch art on initial load and whenever the parameters change
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchArt();
  }, [fetchArt]);

  useEffect(() => {
    const canvas = localCanvasRef.current;
    if (!canvas) return; // Ensure canvas exists

    const context = canvas.getContext('2d');
    if (!context) return; // Ensure context exists

    context.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas

    artData.forEach(circle => {
      context.beginPath();
      context.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2, false);
      context.fillStyle = circle.color;
      context.fill();
    });
  }, [artData, width, height]);

  const fieldClass = 'mb-3';
  const labelClass = 'mb-1 block font-semibold text-bloom-dark dark:text-night-strong';
  const rangeClass = 'w-full accent-bloom dark:accent-bloom-pink';

  return (
    <div className="mx-auto w-full max-w-6xl px-4">
      <Head>
        <title>Generative Art with Next.js</title>
        <meta name="description" content="Generative Art with Next.js and FastAPI" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="py-6">
        <div>
          <div className={fieldClass}>
            <label className={labelClass} htmlFor="width-input">Width</label>
            <input id="width-input" type="range" min="100" max="1000" className={rangeClass} value={width} onChange={(e) => setWidth(Number(e.target.value))} />
          </div>
          <div className={fieldClass}>
            <label className={labelClass} htmlFor="height-input">Height</label>
            <input id="height-input" type="range" min="100" max="1000" className={rangeClass} value={height} onChange={(e) => setHeight(Number(e.target.value))} />
          </div>
          <div className={fieldClass}>
            <label className={labelClass} htmlFor="elements-input">Elements</label>
            <input id="elements-input" type="range" min="0" max="500" className={rangeClass} value={numElements} onChange={(e) => setNumElements(Number(e.target.value))} />
          </div>
          <button
            onClick={fetchArt}
            disabled={loading}
            className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-[#363636] hover:border-bloom-pink disabled:cursor-not-allowed disabled:opacity-50 dark:border-night-border dark:bg-night-surface dark:text-night-strong"
          >
            {loading ? 'Generating...' : 'Generate New Art'}
          </button>
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
