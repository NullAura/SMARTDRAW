#!/usr/bin/env bash
set -Eeuo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="$PROJECT_DIR/logs"

for name in frontend ai backend; do
  pid_file="$LOG_DIR/$name.pid"
  [[ -f "$pid_file" ]] || continue
  pid="$(tr -cd '0-9' <"$pid_file")"
  if [[ -n "$pid" ]] && kill -0 "$pid" 2>/dev/null; then
    kill -TERM "$pid"
    echo "$name 已停止（PID $pid）"
  fi
  rm -f "$pid_file"
done
