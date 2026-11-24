# PixelBloom Backend

FastAPI service that generates generative art for the PixelBloom frontend.

## Layout

```
backend/
├── app/
│   ├── main.py              # FastAPI app + middleware
│   ├── api/routes/          # Versioned HTTP route handlers (`/api/v1`)
│   ├── schemas/             # Pydantic request/response models
│   ├── services/            # Art generation logic
│   └── core/                # Settings, logging, errors, middleware
├── tests/
├── requirements.lock        # Pinned runtime deps for deploys
├── pyproject.toml
└── README.md
```

## Setup

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
cp .env.example .env
```

## Configuration

Settings are loaded via Pydantic Settings from environment variables / `.env`:

| Variable | Default | Description |
|----------|---------|-------------|
| `ENVIRONMENT` | `development` | `development`, `staging`, `production`, or `test` |
| `FRONTEND_URL` | `http://localhost:3000` | Frontend origin (informational) |
| `BACKEND_CORS_ORIGINS` | `http://localhost:3000` | Comma-separated or JSON allow-list (required + no `*` in production) |
| `LOG_LEVEL` | `INFO` | Root log level |
| `LOG_JSON` | auto | Force JSON logs (`true`/`false`); defaults on in staging/production |
| `REQUEST_TIMEOUT_SECONDS` | `30` | Documented client/server soft timeout budget |
| `APP_VERSION` | `0.1.0` | Reported by `/api/v1/health` |
| `API_V1_PREFIX` | `/api/v1` | Versioned API mount path |

In production, interactive docs (`/docs`, `/redoc`, `/openapi.json`) are disabled and unhandled errors return a generic `500` body.

## Run

From this directory:

```bash
uvicorn app.main:app --reload
```

API docs (non-production): http://localhost:8000/docs

## Dependency locking

`pyproject.toml` declares version ranges. `requirements.lock` pins the exact
runtime tree used by Docker / production installs:

```bash
make lock-backend   # from repo root, after setup-backend
```

Docker installs from the lockfile, then the app with `--no-deps`.

## Tests / quality

```bash
pytest          # unit + API tests (httpx TestClient)
ruff check app tests
mypy app
```

Coverage is enabled by default via `pytest-cov`. For an HTML report:

```bash
pytest --cov-report=html
open htmlcov/index.html
```

## Endpoints

| Method | Path                   | Description                          |
|--------|------------------------|--------------------------------------|
| GET    | `/`                    | Lightweight health probe             |
| GET    | `/api/v1/health`       | Versioned health check               |
| GET    | `/api/v1/algorithms`   | List available generation algorithms |
| POST   | `/api/v1/generate-art` | Generate artwork geometry            |

## OpenAPI → frontend types

Schema changes in `app/schemas/` flow to the Next.js app via OpenAPI:

```bash
# from frontend-next/
npm run generate:api
```

That runs `scripts/export_openapi.py` (no server required) and regenerates
`frontend-next/src/types/openapi.d.ts`. Interactive docs: http://localhost:8000/docs

## Docker

```bash
docker build -t pixelbloom-api .
docker run --rm -p 8000:8000 \
  -e ENVIRONMENT=production \
  -e BACKEND_CORS_ORIGINS=https://pixel-bloom.netlify.app \
  pixelbloom-api
```

The image includes a `HEALTHCHECK` against `/api/v1/health` and runs Gunicorn
with a 60s worker timeout.
