export type PaletteId = "random" | "bloom" | "midnight" | "citrus" | "mono" | "custom";

export interface PaletteDefinition {
  id: Exclude<PaletteId, "custom">;
  label: string;
  /** Empty means unconstrained random colors on the backend. */
  colors: string[];
}

export const PRESET_PALETTES: PaletteDefinition[] = [
  { id: "random", label: "Random", colors: [] },
  {
    id: "bloom",
    label: "Bloom",
    colors: ["#ff507c", "#82243b", "#f4eaed", "#320e16", "#ff8fab"],
  },
  {
    id: "midnight",
    label: "Midnight",
    colors: ["#1b2838", "#3d5a80", "#98c1d9", "#e0fbfc", "#ee6c4d"],
  },
  {
    id: "citrus",
    label: "Citrus",
    colors: ["#ff6b35", "#f7c59f", "#efefd0", "#004e89", "#1a659e"],
  },
  {
    id: "mono",
    label: "Mono",
    colors: ["#f5f5f5", "#d4d4d4", "#a3a3a3", "#525252", "#171717"],
  },
];

export function colorsForPalette(
  paletteId: PaletteId,
  customColors: string[],
): string[] | undefined {
  if (paletteId === "custom") {
    return customColors.length > 0 ? customColors : undefined;
  }
  const preset = PRESET_PALETTES.find((p) => p.id === paletteId);
  if (!preset || preset.colors.length === 0) {
    return undefined;
  }
  return preset.colors;
}
