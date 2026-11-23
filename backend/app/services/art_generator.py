"""Public facade for artwork generation.

Prefer importing from ``app.services.generators``. This module remains so
existing imports keep working.
"""

from app.services.generators import generate_art

__all__ = ["generate_art"]
