#!/usr/bin/env python3
"""Dump FastAPI's OpenAPI schema to JSON without starting a server.

Used by the frontend type-generation pipeline so TypeScript stays in sync
with the Pydantic models that FastAPI exposes.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

# Allow `python scripts/export_openapi.py` from the backend directory.
BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from app.main import app  # noqa: E402


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "-o",
        "--output",
        type=Path,
        required=True,
        help="Path to write openapi.json",
    )
    args = parser.parse_args()

    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(
        json.dumps(app.openapi(), indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"Wrote OpenAPI schema to {args.output}")


if __name__ == "__main__":
    main()
