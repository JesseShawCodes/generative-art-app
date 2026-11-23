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

To start front end of app

```
npm run dev
```

Demo this app here:

https://pixel-bloom.netlify.app/
