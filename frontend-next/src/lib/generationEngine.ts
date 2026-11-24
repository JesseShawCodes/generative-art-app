export type GenerationEngine = "local" | "server";

export const GENERATION_ENGINES: {
  value: GenerationEngine;
  label: string;
  description: string;
}[] = [
  {
    value: "local",
    label: "Local",
    description: "Generate in a Web Worker on this device",
  },
  {
    value: "server",
    label: "Server",
    description: "Generate via the Python backend",
  },
];

export function isGenerationEngine(value: unknown): value is GenerationEngine {
  return value === "local" || value === "server";
}
