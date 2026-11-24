"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import { useCanvas } from "../../CanvasContext";
import { buildArtFilename, triggerDownload } from "@/lib/download";

function DownloadButton() {
  const { canvasRef, exportMetaRef } = useCanvas();

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const meta = exportMetaRef.current;
    const filename = buildArtFilename(
      meta?.algorithm ?? "art",
      meta?.seed ?? null,
      "png",
    );
    triggerDownload(canvasRef.current.toDataURL("image/png"), filename);
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
        <FontAwesomeIcon icon={faDownload} className="download-icon" />
      </button>
    </div>
  );
}

export default DownloadButton;
