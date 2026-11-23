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

## API contract (OpenAPI → TypeScript)

Pydantic models in the backend are the source of truth. After changing request/response schemas, regenerate frontend types:

```bash
cd frontend-next
npm run generate:api
```

This writes `frontend-next/openapi/openapi.json` and `frontend-next/src/types/openapi.d.ts`. Commit both with the schema change. `npm run check:api` regenerates and fails if the committed files are stale.

Demo this app here:

https://pixel-bloom.netlify.app/
