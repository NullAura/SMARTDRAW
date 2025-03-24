#!/bin/bash

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

# 检测操作系统
OS_TYPE=$(uname -s)
if [ "$OS_TYPE" = "Darwin" ]; then
    OS_TYPE="macos"
    STOP_MONGODB="brew services stop mongodb-community"
else
    OS_TYPE="linux"
    STOP_MONGODB="sudo systemctl stop mongod"
fi

# 获取脚本所在目录的绝对路径
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PID_FILE="$SCRIPT_DIR/logs/app.pid"

echo -e "${BLUE}正在停止 SmartDraw 服务...${NC}"

# 停止 MongoDB
echo -e "${BLUE}正在停止 MongoDB...${NC}"
$STOP_MONGODB

# 查找并停止 Node.js 进程
echo -e "${BLUE}正在停止 Node.js 服务...${NC}"
pkill -f "node.*vite"
pkill -f "node.*nodemon"

# 如果存在 PID 文件，也尝试停止该进程
if [ -f "$PID_FILE" ]; then
    pid=$(cat "$PID_FILE")
    if ps -p "$pid" > /dev/null; then
        kill "$pid"
        rm -f "$PID_FILE"
    fi
fi

echo -e "${GREEN}所有服务已停止${NC}" 