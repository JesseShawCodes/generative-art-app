#!/usr/bin/env python3
"""Freeze runtime dependencies into requirements.lock.

Run from the backend directory (or via `make lock-backend`) after
`pip install -e .` in a clean-ish venv. Dev-only packages are excluded.
"""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parents[1]
LOCK_PATH = BACKEND_ROOT / "requirements.lock"

DROP = {
    "pytest",
    "pytest-cov",
    "coverage",
    "ruff",
    "mypy",
    "mypy-extensions",
    "pygments",
    "iniconfig",
    "pluggy",
    "pathspec",
    "librt",
    "ast-serialize",
    "httpx",
    "httpcore",
}


def main() -> int:
    raw = subprocess.check_output(
        [sys.executable, "-m", "pip", "freeze", "--exclude-editable"],
        text=True,
    )
    lines: list[str] = []
    for line in raw.splitlines():
        if not line or line.startswith("#"):
            continue
        name = (
            line.split("==")[0]
            .split("@")[0]
            .split("[")[0]
            .strip()
            .lower()
            .replace("_", "-")
        )
        if name in {"generative-art-backend", "generative_art_backend"}:
            continue
        if name in DROP or name.startswith("types-"):
            continue
        lines.append(line)

    required = ["fastapi", "uvicorn", "gunicorn", "pydantic", "pydantic-settings"]
    frozen = {
        entry.split("==")[0].split("[")[0].lower().replace("_", "-") for entry in lines
    }
    missing = [name for name in required if name not in frozen]
    if missing:
        raise SystemExit(f"Missing required packages in freeze: {missing}")

    header = (
        "# Locked runtime dependencies for reproducible deploys.\n"
        "# Regenerate with: make lock-backend\n"
        "# Do not hand-edit; install from pyproject.toml first.\n"
    )
    LOCK_PATH.write_text(
        header + "\n".join(sorted(lines, key=str.lower)) + "\n",
        encoding="utf-8",
    )
    print(f"Wrote {LOCK_PATH} ({len(lines)} packages)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
