"use client"
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import { useCanvas } from '../../CanvasContext';

function DownloadButton() {
  const { canvasRef } = useCanvas();

  const handleDownload = () => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const link = document.createElement('a');
      const randomString = window.crypto.getRandomValues(new Uint32Array(1))[0].toString(36);
      link.download = `pixal-bloom-${randomString}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  };

  return (
    <div id="download-container">
      <button
        aria-label="Download Canvas"
        id="download-button"
        data-testid="download-button"
        className="btn-secondary"
        onClick={handleDownload}
        type="button"
      >
        <FontAwesomeIcon icon={faDownload} className='download-icon' />
      </button>
    </div>
  );
}

export default DownloadButton;
