# PixelBloom Backend

FastAPI service that generates random circle art for the PixelBloom frontend.

## Layout

```
backend/
├── app/
│   ├── main.py              # FastAPI app + middleware
│   ├── api/routes/          # HTTP route handlers
│   ├── schemas/             # Pydantic request/response models
│   ├── services/            # Art generation logic
│   └── core/                # Settings / config
├── tests/
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
| `ENVIRONMENT` | `development` | App environment name |
| `FRONTEND_URL` | `http://localhost:3000` | Frontend origin |
| `BACKEND_CORS_ORIGINS` | localhost + Netlify demo | Comma-separated or JSON list of allowed CORS origins |

## Run

From this directory:

```bash
uvicorn app.main:app --reload
```

API docs: http://localhost:8000/docs

## Tests

```bash
pytest
```

Coverage is enabled by default via `pytest-cov`. For an HTML report:

```bash
pytest --cov-report=html
open htmlcov/index.html
```


## Endpoints

| Method | Path            | Description                          |
|--------|-----------------|--------------------------------------|
| GET    | `/`             | Health / status message              |
| POST   | `/generate-art` | Generate random circles for a canvas |
