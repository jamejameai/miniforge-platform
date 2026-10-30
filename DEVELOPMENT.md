# MiniForge Local Development Guide

## Prerequisites

- **Node.js**: v20+ or v24+ (Node v24 installed)
- **pnpm**: v9+ or v12+ (pnpm v12 installed)
- **Python**: 3.12+ (Python 3.15 installed)
- **uv**: Python package and project manager (installed)
- **Docker & Docker Compose**: Optional for PostgreSQL / Redis services

---

## 1. Quick Local Setup

### Backend API (`services/api`)

1. Change directory to the API service:
   ```bash
   cd services/api
   ```
2. Create and activate a Python virtual environment:
   ```bash
   uv venv
   source .venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   uv pip install -r requirements.txt
   ```
4. Copy the environment configuration:
   ```bash
   cp .env.example .env
   ```
5. Start the API server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   The interactive Swagger documentation is available at `http://localhost:8000/docs`.

---

## 2. Frontend Platform (`apps/web`)

1. Change directory to the web application:
   ```bash
   cd apps/web
   ```
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Copy the environment configuration:
   ```bash
   cp .env.example .env.local
   ```
4. Run the development server:
   ```bash
   pnpm dev
   ```
   MiniForge Studio is now accessible at `http://localhost:3000`.

---

## 3. Running Automated Tests

### Backend Unit & Integration Tests:
```bash
cd services/api
pytest tests/ -v
```

### Frontend Typechecking & Linting:
```bash
cd apps/web
pnpm typecheck
pnpm lint
```

