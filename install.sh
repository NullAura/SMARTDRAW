#!/bin/bash

# 设置颜色输出
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 打印带颜色的信息
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查 Node.js 版本
check_node_version() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js 未安装，请先安装 Node.js"
        exit 1
    fi

    node_version=$(node -v | cut -d'v' -f2)
    if [[ $(echo "$node_version 16.0.0" | awk '{print ($1 >= $2)}') -eq 0 ]]; then
        print_error "Node.js 版本需要 >= 16.0.0，当前版本: $node_version"
        exit 1
    fi
}

# 检查 npm 版本
check_npm_version() {
    if ! command -v npm &> /dev/null; then
        print_error "npm 未安装，请先安装 npm"
        exit 1
    fi

    npm_version=$(npm -v)
    if [[ $(echo "$npm_version 8.0.0" | awk '{print ($1 >= $2)}') -eq 0 ]]; then
        print_error "npm 版本需要 >= 8.0.0，当前版本: $npm_version"
        exit 1
    fi
}

# 检查 MongoDB
check_mongodb() {
    if ! command -v mongod &> /dev/null; then
        print_error "MongoDB 未安装，请先安装 MongoDB"
        print_info "macOS 用户可以使用以下命令安装："
        print_info "brew tap mongodb/brew"
        print_info "brew install mongodb-community"
        exit 1
    fi

    # 检查 MongoDB 服务状态
    if ! brew services list | grep -q "mongodb-community.*started"; then
        print_info "正在启动 MongoDB 服务..."
        brew services start mongodb-community
        sleep 3
    fi
}

# 安装前端依赖
install_frontend() {
    print_info "正在安装前端依赖..."
    if [ ! -f "package.json" ]; then
        print_error "前端 package.json 不存在"
        exit 1
    fi

    npm install
    if [ $? -eq 0 ]; then
        print_success "前端依赖安装成功"
    else
        print_error "前端依赖安装失败"
        exit 1
    fi
}

# 安装后端依赖
install_backend() {
    print_info "正在安装后端依赖..."
    if [ ! -d "server" ]; then
        print_error "后端目录不存在"
        exit 1
    fi

    cd server
    if [ ! -f "package.json" ]; then
        print_error "后端 package.json 不存在"
        exit 1
    fi

    npm install
    if [ $? -eq 0 ]; then
        print_success "后端依赖安装成功"
    else
        print_error "后端依赖安装失败"
        exit 1
    fi
    cd ..
}

# 创建环境变量文件
create_env_file() {
    print_info "正在创建环境变量文件..."
    if [ ! -f "server/.env" ]; then
        cat > server/.env << EOL
PORT=3000
MONGODB_URI=mongodb://localhost:27017/smartdraw
JWT_SECRET=your-secret-key
EOL
        print_success "环境变量文件创建成功"
    else
        print_info "环境变量文件已存在"
    fi
}

# 主函数
main() {
    print_info "开始安装依赖..."
    
    # 检查环境
    check_node_version
    check_npm_version
    check_mongodb

    # 安装依赖
    install_frontend
    install_backend

    # 创建环境变量文件
    create_env_file

    print_success "所有依赖安装完成！"
    print_info "你可以使用 ./start.sh 启动项目"
}

# 执行主函数
main 