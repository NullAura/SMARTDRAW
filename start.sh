#!/usr/bin/env bash
set -Eeuo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="$PROJECT_DIR/logs"
mkdir -p "$LOG_DIR"

if [[ ! -f "$PROJECT_DIR/server/.env" ]]; then
  echo "缺少 server/.env，请先运行 ./install.sh" >&2
  exit 1
fi
if [[ ! -x "$PROJECT_DIR/.venv/bin/python" ]]; then
  echo "缺少 Python 虚拟环境，请先运行 ./install.sh" >&2
  exit 1
fi

start_service() {
  local name="$1"
  shift
  "$@" >>"$LOG_DIR/$name.log" 2>&1 &
  local pid=$!
  echo "$pid" >"$LOG_DIR/$name.pid"
  echo "$name 已启动（PID $pid）"
}

cleanup() {
  "$PROJECT_DIR/stop.sh" >/dev/null 2>&1 || true
}
trap cleanup INT TERM EXIT

start_service backend npm --prefix "$PROJECT_DIR/server" run dev
start_service ai "$PROJECT_DIR/.venv/bin/python" "$PROJECT_DIR/server.py"
start_service frontend npm --prefix "$PROJECT_DIR" run dev

echo "前端：http://127.0.0.1:5173"
echo "Node.js API：http://127.0.0.1:3000"
echo "AI gateway：http://127.0.0.1:8000"
echo "日志目录：$LOG_DIR"

wait
