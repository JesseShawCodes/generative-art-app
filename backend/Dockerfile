# Use an official Python runtime as a parent image
FROM python:3.10-slim-bookworm

# Set the working directory in the container
WORKDIR /app

# Install package and runtime dependencies from pyproject.toml
COPY pyproject.toml README.md ./
COPY app ./app
RUN pip install --no-cache-dir .

# Expose port 8000
EXPOSE 8000

# Command to run the application using Gunicorn and Uvicorn workers
CMD ["gunicorn", "app.main:app", "--workers", "4", "--worker-class", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8000"]
