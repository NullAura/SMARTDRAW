#!/bin/bash

# 设置颜色输出
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印启动信息
echo -e "${BLUE}正在启动 SmartDraw 项目...${NC}"

# 检查 MongoDB 是否运行
if ! brew services list | grep -q "mongodb-community.*started"; then
    echo -e "${BLUE}正在启动 MongoDB...${NC}"
    brew services start mongodb-community
    sleep 2
fi

# 启动后端服务器
echo -e "${BLUE}正在启动后端服务器...${NC}"
cd server
npm run dev &
BACKEND_PID=$!
cd ..

# 等待后端服务器启动
sleep 2

# 启动前端服务器
echo -e "${BLUE}正在启动前端服务器...${NC}"
npm run dev &
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
wait

# 清理进程
kill $BACKEND_PID $FRONTEND_PID
echo -e "\n${GREEN}所有服务已停止${NC}" 