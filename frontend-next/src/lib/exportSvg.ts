import type { ArtElement } from "@/types/art";

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function elementToSvg(element: ArtElement): string {
  const opacity = element.opacity ?? 1;
  const opacityAttr =
    opacity < 1 ? ` opacity="${opacity.toFixed(3)}"` : "";

  switch (element.type) {
    case "circle":
      return `<circle cx="${element.x}" cy="${element.y}" r="${element.radius}" fill="${escapeXml(element.color)}"${opacityAttr} />`;
    case "line":
      return `<line x1="${element.x1}" y1="${element.y1}" x2="${element.x2}" y2="${element.y2}" stroke="${escapeXml(element.color)}" stroke-width="${element.thickness}" stroke-linecap="round"${opacityAttr} />`;
    case "polygon": {
      const points = element.points.map((p) => `${p.x},${p.y}`).join(" ");
      if (element.filled) {
        return `<polygon points="${points}" fill="${escapeXml(element.color)}"${opacityAttr} />`;
      }
      return `<polygon points="${points}" fill="none" stroke="${escapeXml(element.color)}" stroke-width="1.5"${opacityAttr} />`;
    }
    default: {
      const _exhaustive: never = element;
      void _exhaustive;
      return "";
    }
  }
}

/** Serialize drawable geometry to an SVG document string. */
export function artToSvg(
  elements: ArtElement[],
  width: number,
  height: number,
): string {
  const body = elements.map(elementToSvg).join("\n  ");
  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
    `  <rect width="100%" height="100%" fill="#333333" />`,
    `  ${body}`,
    `</svg>`,
  ].join("\n");
}
