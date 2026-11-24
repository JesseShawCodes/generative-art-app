# PixelBloom — common local development tasks
#
# Usage: make <target>
# Run `make` or `make help` to list targets.

.DEFAULT_GOAL := help

BACKEND_DIR  := backend
FRONTEND_DIR := frontend-next
VENV         := $(abspath $(BACKEND_DIR)/.venv)
PYTHON       := $(VENV)/bin/python
PIP          := $(VENV)/bin/pip
PYTEST       := $(VENV)/bin/pytest
UVICORN      := $(VENV)/bin/uvicorn

.PHONY: help
help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}'

# ── Setup ────────────────────────────────────────────────────────────────────

.PHONY: setup
setup: setup-backend setup-frontend ## Install backend + frontend dependencies

.PHONY: setup-backend
setup-backend: ## Create venv and install backend (with dev deps)
	@test -d $(VENV) || python3 -m venv $(VENV)
	$(PIP) install -U pip
	$(PIP) install -e "$(BACKEND_DIR)[dev]"
	@test -f $(BACKEND_DIR)/.env || cp $(BACKEND_DIR)/.env.example $(BACKEND_DIR)/.env
	@echo "Backend ready. Activate with: source $(VENV)/bin/activate"

.PHONY: lock-backend
lock-backend: ## Refresh backend/requirements.lock from the current venv
	@test -x $(PYTHON) || $(MAKE) setup-backend
	cd $(BACKEND_DIR) && $(PYTHON) scripts/lock_requirements.py

.PHONY: setup-frontend
setup-frontend: ## Install frontend npm dependencies
	npm --prefix $(FRONTEND_DIR) install
	@test -f $(FRONTEND_DIR)/.env.local || cp $(FRONTEND_DIR)/.env.example $(FRONTEND_DIR)/.env.local
	@echo "Frontend ready."

# ── Run ──────────────────────────────────────────────────────────────────────

.PHONY: backend
backend: ## Start backend (uvicorn --reload) on :8000
	@test -x $(UVICORN) || $(MAKE) setup-backend
	cd $(BACKEND_DIR) && $(UVICORN) app.main:app --reload --host 0.0.0.0 --port 8000

.PHONY: frontend
frontend: ## Start frontend (Next.js) on :3000
	npm --prefix $(FRONTEND_DIR) run dev

.PHONY: start
start: ## Print how to run both services (use two terminals)
	@echo "Start each service in its own terminal:"
	@echo "  make backend"
	@echo "  make frontend"
	@echo ""
	@echo "Frontend: http://localhost:3000"
	@echo "Backend:  http://localhost:8000"
	@echo "API docs: http://localhost:8000/docs"

# ── Test ─────────────────────────────────────────────────────────────────────

.PHONY: test
test: test-backend test-frontend ## Run all tests

.PHONY: test-backend
test-backend: ## Run backend pytest suite
	@test -x $(PYTEST) || $(MAKE) setup-backend
	cd $(BACKEND_DIR) && $(PYTEST)

.PHONY: test-frontend
test-frontend: ## Run frontend Jest suite
	npm --prefix $(FRONTEND_DIR) test -- --passWithNoTests

# ── Coverage ─────────────────────────────────────────────────────────────────

.PHONY: coverage
coverage: coverage-backend coverage-frontend ## Run all tests with coverage

.PHONY: coverage-backend
coverage-backend: ## Backend tests + HTML coverage report
	@test -x $(PYTEST) || $(MAKE) setup-backend
	cd $(BACKEND_DIR) && $(PYTEST) --cov-report=term-missing --cov-report=html
	@echo "Open: $(BACKEND_DIR)/htmlcov/index.html"
	@command -v open >/dev/null && open $(BACKEND_DIR)/htmlcov/index.html || true

.PHONY: coverage-frontend
coverage-frontend: ## Frontend tests + coverage report
	npm --prefix $(FRONTEND_DIR) run test:coverage
	@echo "Open: $(FRONTEND_DIR)/coverage/lcov-report/index.html"
	@command -v open >/dev/null && open $(FRONTEND_DIR)/coverage/lcov-report/index.html || true

# ── Lint / typecheck ─────────────────────────────────────────────────────────

.PHONY: lint
lint: lint-backend lint-frontend ## Lint backend (Ruff) + frontend (ESLint)

.PHONY: lint-backend
lint-backend: ## Ruff the backend
	@test -x $(VENV)/bin/ruff || $(MAKE) setup-backend
	cd $(BACKEND_DIR) && $(VENV)/bin/ruff check app tests

.PHONY: lint-frontend
lint-frontend: ## ESLint the frontend
	npm --prefix $(FRONTEND_DIR) run lint

.PHONY: typecheck
typecheck: typecheck-backend typecheck-frontend ## Typecheck backend (mypy) + frontend (tsc)

.PHONY: typecheck-backend
typecheck-backend: ## Mypy the backend
	@test -x $(VENV)/bin/mypy || $(MAKE) setup-backend
	cd $(BACKEND_DIR) && $(VENV)/bin/mypy app

.PHONY: typecheck-frontend
typecheck-frontend: ## TypeScript check (frontend)
	npm --prefix $(FRONTEND_DIR) run typecheck

.PHONY: test-e2e
test-e2e: ## Run Playwright browser tests
	npm --prefix $(FRONTEND_DIR) run test:e2e

.PHONY: check
check: lint typecheck test ## Lint, typecheck, and unit/component tests

# ── API types ────────────────────────────────────────────────────────────────

.PHONY: generate-api
generate-api: ## Regenerate OpenAPI → TypeScript types
	npm --prefix $(FRONTEND_DIR) run generate:api

.PHONY: check-api
check-api: ## Fail if committed OpenAPI types are stale
	npm --prefix $(FRONTEND_DIR) run check:api

# ── Build / clean ────────────────────────────────────────────────────────────

.PHONY: build
build: ## Production build of the frontend
	npm --prefix $(FRONTEND_DIR) run build

.PHONY: clean
clean: ## Remove caches, coverage, and build artifacts
	rm -rf $(BACKEND_DIR)/.pytest_cache $(BACKEND_DIR)/.coverage $(BACKEND_DIR)/htmlcov
	rm -rf $(BACKEND_DIR)/generative_art_backend.egg-info
	rm -rf $(FRONTEND_DIR)/.next $(FRONTEND_DIR)/coverage
	find $(BACKEND_DIR) -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	@echo "Cleaned."

.PHONY: clean-all
clean-all: clean ## Clean + remove venv and node_modules
	rm -rf $(VENV) $(FRONTEND_DIR)/node_modules
	@echo "Removed virtualenv and node_modules."
