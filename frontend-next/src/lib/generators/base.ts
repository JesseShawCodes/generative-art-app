import type { SeededRng } from "./rng";

export function clamp(value: number, low: number, high: number): number {
  return Math.max(low, Math.min(high, value));
}

export function asFloat(
  params: Record<string, unknown>,
  key: string,
  defaultValue: number,
): number {
  const value = params[key] ?? defaultValue;
  if (typeof value === "boolean") return defaultValue;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : defaultValue;
  }
  return defaultValue;
}

export function asInt(
  params: Record<string, unknown>,
  key: string,
  defaultValue: number,
): number {
  return Math.trunc(asFloat(params, key, defaultValue));
}

export function randomColor(rng: SeededRng): string {
  const value = rng.randint(0, 0xffffff);
  return `#${value.toString(16).padStart(6, "0")}`;
}

function normalizeHexColor(value: unknown): string | null {
  if (typeof value !== "string") return null;
  let color = value.trim();
  if (color.startsWith("#")) color = color.slice(1);
  if (color.length !== 6) return null;
  if (!/^[0-9a-fA-F]{6}$/.test(color)) return null;
  return `#${color.toLowerCase()}`;
}

export function paletteColors(params: Record<string, unknown>): string[] {
  const raw = params.colors;
  if (!Array.isArray(raw)) return [];
  const colors: string[] = [];
  for (const item of raw) {
    const normalized = normalizeHexColor(item);
    if (normalized) colors.push(normalized);
  }
  return colors;
}

export function pickColor(
  rng: SeededRng,
  params: Record<string, unknown>,
): string {
  const colors = paletteColors(params);
  if (colors.length > 0) return rng.choice(colors);
  return randomColor(rng);
}
