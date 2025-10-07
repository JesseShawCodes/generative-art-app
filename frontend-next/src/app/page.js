"use client";
import React, { useRef, useEffect, useState } from 'react';
import Head from 'next/head'; // For managing document head

export default function Home() {
  const canvasRef = useRef(null);
  const [artData, setArtData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);
  const [numElements, setNumElements] = useState(50);

  const fetchArt = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/generate-art', {
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
  };

  useEffect(() => {
    fetchArt(); // Fetch art on initial load
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
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

  return (
    <div className="container">
      <Head>
        <title>Generative Art with Next.js</title>
        <meta name="description" content="Generative Art with Next.js and FastAPI" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="main">
        <h1 className="title">Generative Art Explorer</h1>

        <div className="controls">
          <label>
            Width:
            <input type="number" value={width} onChange={(e) => setWidth(Number(e.target.value))} />
          </label>
          <label>
            Height:
            <input type="number" value={height} onChange={(e) => setHeight(Number(e.target.value))} />
          </label>
          <label>
            Elements:
            <input type="number" value={numElements} onChange={(e) => setNumElements(Number(e.target.value))} />
          </label>
          <button onClick={fetchArt} disabled={loading}>
            {loading ? 'Generating...' : 'Generate New Art'}
          </button>
        </div>

        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          style={{ border: '1px solid #ccc', background: '#333', marginTop: '20px' }}
        />
      </main>

      <footer className="footer">
        Powered by Next.js & FastAPI
      </footer>
    </div>
  );
}
