#!/usr/bin/env node
/**
 * Export FastAPI OpenAPI → generate TypeScript types.
 *
 * Usage (from frontend-next/):
 *   npm run generate:api
 *
 * Requires the backend virtualenv (or a Python with the backend package installed).
 */

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendRoot = path.resolve(__dirname, "..");
const repoRoot = path.resolve(frontendRoot, "..");
const backendRoot = path.join(repoRoot, "backend");
const openapiJson = path.join(frontendRoot, "openapi", "openapi.json");
const typesOut = path.join(frontendRoot, "src", "types", "openapi.d.ts");
const exportScript = path.join(backendRoot, "scripts", "export_openapi.py");

function resolvePython() {
  const candidates = [
    path.join(backendRoot, ".venv", "bin", "python"),
    path.join(backendRoot, ".venv", "bin", "python3"),
    path.join(repoRoot, ".venv", "bin", "python"),
    path.join(repoRoot, ".venv", "bin", "python3"),
  ];
  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate;
  }
  return process.platform === "win32" ? "python" : "python3";
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    ...options,
  });
  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

const python = resolvePython();
console.log(`Exporting OpenAPI with ${python}`);
run(python, [exportScript, "--output", openapiJson], { cwd: backendRoot });

console.log("Generating TypeScript types with openapi-typescript");
run(
  path.join(frontendRoot, "node_modules", ".bin", "openapi-typescript"),
  [openapiJson, "-o", typesOut],
  { cwd: frontendRoot },
);

console.log(`API types written to ${path.relative(frontendRoot, typesOut)}`);
