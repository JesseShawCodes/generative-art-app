# PixelBloom

To start backend locally (from virtual env)

Verify 
```
python3 --version
# Verify at least Python 3.10
python3 -m venv .venv
```

Start Virtual Environment
```
source .venv/bin/activate
```

Install dependencies (from `backend/`)
```
pip install -e ".[dev]"
```

```
uvicorn app.main:app --reload
```

To start front end of app (from `frontend-next/`)

```
npm install
npm run dev
```

Or from the repo root: `make setup`, then `make backend` / `make frontend`.

## API contract (OpenAPI → TypeScript)

Pydantic models in the backend are the source of truth. After changing request/response schemas, regenerate frontend types:

```bash
cd frontend-next
npm run generate:api
```

This writes `frontend-next/openapi/openapi.json` and `frontend-next/src/types/openapi.d.ts`. Commit both with the schema change. `npm run check:api` regenerates and fails if the committed files are stale.

## Testing

| Layer | Tool | Command |
|-------|------|---------|
| Python unit + API | Pytest | `make test-backend` |
| Python lint | Ruff | `make lint-backend` |
| Python types | Mypy | `make typecheck-backend` |
| React components | Jest + RTL | `make test-frontend` |
| Frontend lint | ESLint | `make lint-frontend` |
| Frontend types | TypeScript | `make typecheck-frontend` |
| Browser workflows | Playwright | `make test-e2e` |
| Everything local | — | `make check` |

## Generation engine

`POST /generate-art` dispatches to pluggable algorithms (`circles`, `flow_field`,
`geometric`, `particles`). The backend returns drawable geometry; the React
studio canvas renders it and can export PNG or SVG.

```json
{
  "algorithm": "circles",
  "width": 1200,
  "height": 800,
  "num_elements": 150,
  "seed": 48291,
  "parameters": {
    "min_radius": 5,
    "max_radius": 50,
    "colors": ["#ff507c", "#82243b", "#f4eaed"]
  }
}
```

`seed` is first-class: omit it for a random seed (echoed in the response), or
pass one to regenerate the same composition.

`parameters.colors` is an optional list of hex colors. When provided, generators
pick only from that palette; omit it for unconstrained random colors.

## Studio (frontend)

The home page is a creative studio: live (debounced) parameter controls, seed
lock/reuse, preset and custom palettes, regenerate without a page refresh, and
PNG/SVG export. Generation stays on the Python backend; the canvas only renders
and exports the returned geometry.

### Gallery

Saved compositions are stored in the browser via `localStorage` (key
`pixelbloom-gallery`, capped at 40 items). Each entry keeps algorithm, seed,
dimensions, element count, palette, and a small thumbnail so you can reload the
same composition later. Nothing is synced to the server yet.

## CI

Pull requests run GitHub Actions (`.github/workflows/ci.yml`):

- Backend: Ruff, Mypy, Pytest
- Frontend: ESLint, `tsc`, Jest, Next.js production build
- Playwright (Chromium) against the Next.js app

Demo this app here:

https://pixel-bloom.netlify.app/
