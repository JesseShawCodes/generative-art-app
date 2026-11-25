import type { ArtElement } from "@/types/art";

/** Ambient hue drift rate for Brian Eno Mode (° per second). Full cycle ≈ 8 minutes. */
export const ENO_HUE_DEGREES_PER_SECOND = 0.75;

function clampByte(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function parseHexColor(color: string): [number, number, number] | null {
  let hex = color.trim();
  if (hex.startsWith("#")) hex = hex.slice(1);
  if (hex.length === 3) {
    hex = `${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`;
  }
  if (hex.length !== 6 || !/^[0-9a-fA-F]{6}$/.test(hex)) return null;
  return [
    Number.parseInt(hex.slice(0, 2), 16),
    Number.parseInt(hex.slice(2, 4), 16),
    Number.parseInt(hex.slice(4, 6), 16),
  ];
}

function rgbToHsl(
  r: number,
  g: number,
  b: number,
): [number, number, number] {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const lightness = (max + min) / 2;

  if (max === min) {
    return [0, 0, lightness];
  }

  const delta = max - min;
  const saturation =
    lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);

  let hue = 0;
  switch (max) {
    case rn:
      hue = ((gn - bn) / delta + (gn < bn ? 6 : 0)) / 6;
      break;
    case gn:
      hue = ((bn - rn) / delta + 2) / 6;
      break;
    default:
      hue = ((rn - gn) / delta + 4) / 6;
      break;
  }

  return [hue * 360, saturation, lightness];
}

function hueToRgb(p: number, q: number, t: number): number {
  let tone = t;
  if (tone < 0) tone += 1;
  if (tone > 1) tone -= 1;
  if (tone < 1 / 6) return p + (q - p) * 6 * tone;
  if (tone < 1 / 2) return q;
  if (tone < 2 / 3) return p + (q - p) * (2 / 3 - tone) * 6;
  return p;
}

function hslToRgb(
  h: number,
  s: number,
  l: number,
): [number, number, number] {
  if (s === 0) {
    const gray = clampByte(l * 255);
    return [gray, gray, gray];
  }

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const hk = ((h % 360) + 360) % 360 / 360;

  return [
    clampByte(hueToRgb(p, q, hk + 1 / 3) * 255),
    clampByte(hueToRgb(p, q, hk) * 255),
    clampByte(hueToRgb(p, q, hk - 1 / 3) * 255),
  ];
}

function toHex([r, g, b]: [number, number, number]): string {
  return `#${[r, g, b]
    .map((channel) => channel.toString(16).padStart(2, "0"))
    .join("")}`;
}

/** Shift a CSS hex color's hue by `degrees`. Non-hex inputs are returned unchanged. */
export function shiftHexHue(color: string, degrees: number): string {
  const rgb = parseHexColor(color);
  if (!rgb) return color;
  const [h, s, l] = rgbToHsl(...rgb);
  if (s === 0) return toHex(rgb);
  return toHex(hslToRgb(h + degrees, s, l));
}

/** Return a copy of art elements with each fill/stroke color hue-shifted. */
export function shiftArtColors(
  elements: ArtElement[],
  degrees: number,
): ArtElement[] {
  if (degrees === 0 || elements.length === 0) return elements;
  const normalized = ((degrees % 360) + 360) % 360;
  if (normalized === 0) return elements;

  return elements.map((element) => ({
    ...element,
    color: shiftHexHue(element.color, normalized),
  }));
}
