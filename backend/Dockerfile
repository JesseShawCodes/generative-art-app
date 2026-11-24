# Use an official Python runtime as a parent image
FROM python:3.12-slim-bookworm

# Set the working directory in the container
WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    ENVIRONMENT=production \
    LOG_LEVEL=INFO

# Install pinned runtime dependencies, then the app without re-resolving deps
COPY requirements.lock pyproject.toml README.md ./
COPY app ./app
RUN pip install --no-cache-dir -r requirements.lock \
    && pip install --no-cache-dir --no-deps .

# Expose port 8000
EXPOSE 8000

# Platform / orchestrator health probe
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/api/v1/health', timeout=4)" || exit 1

# Gunicorn enforces a worker timeout; keep it above REQUEST_TIMEOUT_SECONDS
CMD ["gunicorn", "app.main:app", \
     "--workers", "4", \
     "--worker-class", "uvicorn.workers.UvicornWorker", \
     "--bind", "0.0.0.0:8000", \
     "--timeout", "60", \
     "--access-logfile", "-", \
     "--error-logfile", "-"]
