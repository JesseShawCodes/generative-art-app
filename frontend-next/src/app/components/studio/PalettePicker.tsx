"use client";

import type { PaletteId } from "@/lib/palettes";
import { PRESET_PALETTES } from "@/lib/palettes";

interface PalettePickerProps {
  paletteId: PaletteId;
  customColors: string[];
  onPaletteIdChange: (id: PaletteId) => void;
  onCustomColorsChange: (colors: string[]) => void;
}

export default function PalettePicker({
  paletteId,
  customColors,
  onPaletteIdChange,
  onCustomColorsChange,
}: PalettePickerProps) {
  const addCustomColor = (color: string) => {
    const normalized = color.toLowerCase();
    if (customColors.includes(normalized)) return;
    onCustomColorsChange([...customColors, normalized]);
    onPaletteIdChange("custom");
  };

  const removeCustomColor = (color: string) => {
    onCustomColorsChange(customColors.filter((c) => c !== color));
  };

  return (
    <div className="mb-4">
      <p className="mb-2 font-semibold text-bloom-dark dark:text-night-strong">
        Palette
      </p>
      <div
        className="flex flex-wrap gap-2"
        role="listbox"
        aria-label="Color palette"
      >
        {PRESET_PALETTES.map((preset) => {
          const selected = paletteId === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              role="option"
              aria-selected={selected}
              onClick={() => onPaletteIdChange(preset.id)}
              className={`rounded-md border px-2.5 py-1.5 text-left text-sm transition-colors ${
                selected
                  ? "border-bloom-pink bg-bloom-white text-bloom-dark dark:bg-night-surface dark:text-night-strong"
                  : "border-neutral-300 bg-white text-[#363636] hover:border-bloom-pink dark:border-night-border dark:bg-night-raised dark:text-night-text"
              }`}
            >
              <span className="block text-xs font-medium">{preset.label}</span>
              <span className="mt-1 flex gap-0.5">
                {preset.colors.length === 0 ? (
                  <span
                    className="h-3 w-8 rounded-sm"
                    style={{
                      background:
                        "linear-gradient(90deg, #ff507c, #ffe66d, #4ecdc4, #112233)",
                    }}
                    aria-hidden
                  />
                ) : (
                  preset.colors.map((color) => (
                    <span
                      key={color}
                      className="h-3 w-3 rounded-sm border border-black/10"
                      style={{ backgroundColor: color }}
                      aria-hidden
                    />
                  ))
                )}
              </span>
            </button>
          );
        })}
        <button
          type="button"
          role="option"
          aria-selected={paletteId === "custom"}
          onClick={() => onPaletteIdChange("custom")}
          className={`rounded-md border px-2.5 py-1.5 text-sm ${
            paletteId === "custom"
              ? "border-bloom-pink bg-bloom-white text-bloom-dark dark:bg-night-surface dark:text-night-strong"
              : "border-neutral-300 bg-white text-[#363636] hover:border-bloom-pink dark:border-night-border dark:bg-night-raised dark:text-night-text"
          }`}
        >
          Custom
        </button>
      </div>

      {paletteId === "custom" && (
        <div className="mt-3">
          <label
            htmlFor="custom-color-input"
            className="mb-1 block text-sm font-medium text-bloom-dark dark:text-night-strong"
          >
            Add color
          </label>
          <div className="flex items-center gap-2">
            <input
              id="custom-color-input"
              type="color"
              defaultValue="#ff507c"
              className="h-9 w-12 cursor-pointer rounded border border-neutral-300 bg-white p-0.5 dark:border-night-border"
              onChange={(event) => addCustomColor(event.target.value)}
            />
            <ul className="flex flex-wrap gap-1.5">
              {customColors.map((color) => (
                <li key={color}>
                  <button
                    type="button"
                    onClick={() => removeCustomColor(color)}
                    className="group flex items-center gap-1 rounded border border-neutral-300 px-1.5 py-1 text-xs dark:border-night-border"
                    aria-label={`Remove ${color}`}
                  >
                    <span
                      className="h-3 w-3 rounded-sm border border-black/10"
                      style={{ backgroundColor: color }}
                    />
                    <span className="font-mono">{color}</span>
                    <span className="text-neutral-400 group-hover:text-bloom-pink">
                      ×
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
