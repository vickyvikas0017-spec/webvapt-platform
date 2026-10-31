#!/bin/bash
# WebVAPT Startup Script for Linux/macOS

echo "========================================"
echo "  WebVAPT - PortSwigger VAPT Platform"
echo "========================================"

ROOT="$(cd "$(dirname "$0")" && pwd)"

echo "[1/2] Starting Backend..."
cd "$ROOT/backend"
python3 -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload &
BACKEND_PID=$!

sleep 3

echo "[2/2] Starting Frontend..."
cd "$ROOT/frontend"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "Frontend: http://localhost:5173"
echo "Backend:  http://localhost:8000"
echo "API Docs: http://localhost:8000/docs"
echo "Press Ctrl+C to stop"

trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait

