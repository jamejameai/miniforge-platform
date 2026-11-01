#!/usr/bin/env bash
set -e

# ==========================================
# MiniForge — Unified Single-Command Runner
# ==========================================

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

echo "=================================================="
echo "  🚀 Starting MiniForge Platform..."
echo "=================================================="

# 0. Free ports 8000 and 3000 if already occupied
echo "🔍 Checking port availability..."
if lsof -ti :8000 >/dev/null 2>&1; then
  echo "⚠️  Port 8000 in use. Freeing..."
  lsof -ti :8000 | xargs kill -9 2>/dev/null || true
  sleep 1
fi

if lsof -ti :3000 >/dev/null 2>&1; then
  echo "⚠️  Port 3000 in use. Freeing..."
  lsof -ti :3000 | xargs kill -9 2>/dev/null || true
  sleep 1
fi

# 1. Setup Backend Environment if needed
if [ ! -d "services/api/.venv" ]; then
  echo "📦 Initializing Python virtual environment..."
  cd services/api
  if command -v uv >/dev/null 2>&1; then
    uv venv
    uv pip install -r requirements.txt
  else
    python3 -m venv .venv
    .venv/bin/pip install --upgrade pip
    .venv/bin/pip install -r requirements.txt
  fi
  cd "$ROOT_DIR"
fi

# 2. Setup Node dependencies if needed
if [ ! -d "node_modules" ] || [ ! -d "apps/web/node_modules" ]; then
  echo "📦 Installing Node dependencies..."
  if command -v pnpm >/dev/null 2>&1; then
    pnpm install
  elif command -v npm >/dev/null 2>&1; then
    npx pnpm install
  fi
fi

# Cleanup on exit (Ctrl+C)
cleanup() {
  echo ""
  echo "🛑 Shutting down MiniForge services..."
  kill $(jobs -p) 2>/dev/null || true
  exit 0
}
trap cleanup SIGINT SIGTERM EXIT

# 3. Launch Backend API on Port 8000
echo "⚡ Starting FastAPI Backend on http://localhost:8000 ..."
(
  cd services/api
  PYTHONPATH=. .venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
) &
API_PID=$!

# 4. Wait briefly for API to initialize
sleep 2

# 5. Launch Frontend Studio & Runtime on Port 3000
echo "🎨 Starting Next.js Studio & Runtime on http://localhost:3000 ..."
(
  pnpm --filter @miniforce/web dev
) &
WEB_PID=$!

echo ""
echo "=================================================="
echo "  ✨ MiniForge is running successfully!"
echo "=================================================="
echo "  👉 Studio & Workspace:   http://localhost:3000"
echo "  👉 Standalone App:       http://localhost:3000/r/artisan-roast"
echo "  👉 Telegram Mini App:    http://localhost:3000/tg/artisan-roast"
echo "  👉 Interactive API Docs: http://localhost:8000/docs"
echo "=================================================="
echo "  Press Ctrl+C to stop all services."
echo ""

# Wait for both background processes
wait

