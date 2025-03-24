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

# 获取服务器 IP 地址
if [ "$OS_TYPE" = "macos" ]; then
    SERVER_IP=$(ipconfig getifaddr en0 || ipconfig getifaddr en1)
else
    SERVER_IP=$(hostname -I | awk '{print $1}')
fi

# 创建日志目录
LOG_DIR="$SCRIPT_DIR/logs"
mkdir -p "$LOG_DIR"

# 日志文件
LOG_FILE="$LOG_DIR/app.log"
PID_FILE="$LOG_DIR/app.pid"

# 日志函数
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# 检查是否已经在运行
if [ -f "$PID_FILE" ]; then
    pid=$(cat "$PID_FILE")
    if ps -p "$pid" > /dev/null; then
        log "SmartDraw 已经在运行中 (PID: $pid)"
        exit 1
    else
        rm -f "$PID_FILE"
    fi
fi

# 保存当前进程 ID
echo $$ > "$PID_FILE"

# 打印启动信息
log "正在启动 SmartDraw 项目..."

# 启动 MongoDB
log "正在启动 MongoDB..."
if [ "$OS_TYPE" = "macos" ]; then
    if ! brew services list | grep -q "mongodb-community.*started"; then
        $START_MONGODB
    fi
else
    if ! systemctl is-active --quiet mongod; then
        $START_MONGODB
    fi
fi

# 设置环境变量
export SERVER_IP

# 启动后端服务器
log "正在启动后端服务器..."
cd "$SCRIPT_DIR/server" && npm run dev 2>&1 | tee -a "$LOG_FILE" &
BACKEND_PID=$!

# 等待后端服务器启动
sleep 2

# 启动前端服务器
log "正在启动前端服务器..."
cd "$SCRIPT_DIR" && npm run dev -- --host 2>&1 | tee -a "$LOG_FILE" &
FRONTEND_PID=$!

# 等待前端服务器启动
sleep 2

# 打印成功信息
log "SmartDraw 项目已启动！"
log "前端地址: http://$SERVER_IP:5173"
log "后端地址: http://$SERVER_IP:3000"
log "查看日志: tail -f $LOG_FILE"

# 等待用户中断
trap "log '正在停止服务...'; $STOP_MONGODB; kill $BACKEND_PID $FRONTEND_PID; rm -f '$PID_FILE'; exit" INT
wait

# 清理进程
kill $BACKEND_PID $FRONTEND_PID
rm -f "$PID_FILE"
log "所有服务已停止" 