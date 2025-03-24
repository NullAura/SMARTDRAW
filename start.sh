#!/bin/bash

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

# 检测操作系统
OS_TYPE=$(uname -s)
if [ "$OS_TYPE" = "Darwin" ]; then
    OS_TYPE="macos"
    START_MONGODB="brew services start mongodb-community"
    STOP_MONGODB="brew services stop mongodb-community"
else
    OS_TYPE="linux"
    START_MONGODB="sudo systemctl start mongod"
    STOP_MONGODB="sudo systemctl stop mongod"
fi

# 获取脚本所在目录的绝对路径
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# 打印启动信息
echo -e "${BLUE}正在启动 SmartDraw 项目...${NC}"

# 启动 MongoDB
echo -e "${BLUE}正在启动 MongoDB...${NC}"
if [ "$OS_TYPE" = "macos" ]; then
    if ! brew services list | grep -q "mongodb-community.*started"; then
        $START_MONGODB
    fi
else
    if ! systemctl is-active --quiet mongod; then
        $START_MONGODB
    fi
fi

# 启动后端服务器
echo -e "${BLUE}正在启动后端服务器...${NC}"
cd "$SCRIPT_DIR/server" && npm run dev &
BACKEND_PID=$!

# 等待后端服务器启动
sleep 2

# 启动前端服务器
echo -e "${BLUE}正在启动前端服务器...${NC}"
cd "$SCRIPT_DIR" && npm run dev &
FRONTEND_PID=$!

# 等待前端服务器启动
sleep 2

# 打印成功信息
echo -e "${GREEN}SmartDraw 项目已启动！${NC}"
echo -e "${BLUE}前端地址: http://localhost:5173${NC}"
echo -e "${BLUE}后端地址: http://localhost:3000${NC}"

# 等待用户输入
echo -e "\n${BLUE}按 Ctrl+C 停止所有服务${NC}"

# 等待用户中断
trap "echo -e '\n${BLUE}正在停止服务...${NC}'; $STOP_MONGODB; kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait

# 清理进程
kill $BACKEND_PID $FRONTEND_PID
echo -e "\n${GREEN}所有服务已停止${NC}" 