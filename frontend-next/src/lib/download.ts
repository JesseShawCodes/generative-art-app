/** Trigger a browser file download from a data URL or object URL. */
export function triggerDownload(href: string, filename: string): void {
  const link = document.createElement("a");
  link.download = filename;
  link.href = href;
  link.click();
}

export function downloadTextFile(
  content: string,
  filename: string,
  mimeType: string,
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  try {
    triggerDownload(url, filename);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function buildArtFilename(
  algorithm: string,
  seed: number | null | undefined,
  extension: "png" | "svg",
): string {
  const seedPart =
    typeof seed === "number" && Number.isFinite(seed) ? String(seed) : "random";
  return `pixelbloom-${algorithm}-${seedPart}.${extension}`;
}
