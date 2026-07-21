#!/usr/bin/env bash
set -Eeuo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "缺少必要命令：$1" >&2
    exit 1
  fi
}

require_command node
require_command npm
require_command python3
require_command openssl

node -e "const major = Number(process.versions.node.split('.')[0]); if (major < 20) process.exit(1)" || {
  echo "需要 Node.js 20 或更高版本" >&2
  exit 1
}

echo "[1/4] 安装前端依赖"
npm ci

echo "[2/4] 安装 Node.js API 依赖"
npm --prefix server ci

echo "[3/4] 创建 Python 虚拟环境并安装依赖"
python3 -m venv .venv
"$PROJECT_DIR/.venv/bin/python" -m pip install --upgrade pip
"$PROJECT_DIR/.venv/bin/python" -m pip install --requirement requirements.txt

echo "[4/4] 准备本地环境配置"
if [[ ! -f .env ]]; then
  cp .env.example .env
fi
if [[ ! -f server/.env ]]; then
  umask 077
  cp server/.env.example server/.env
  jwt_secret="$(openssl rand -hex 32)"
  sed -i.bak "s/^JWT_SECRET=$/JWT_SECRET=$jwt_secret/" server/.env
  rm -f server/.env.bak
fi

echo "安装完成。请在 server/.env 中填写新的 API Key，并确认 MongoDB 已启动。"
echo "然后运行 ./start.sh。"
