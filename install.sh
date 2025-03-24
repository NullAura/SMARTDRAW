#!/bin/bash

# 设置颜色输出
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检测操作系统
OS=$(uname -s)
if [ "$OS" = "Darwin" ]; then
    OS_TYPE="macos"
    PACKAGE_MANAGER="brew"
    INSTALL_CMD="brew install"
    UPGRADE_CMD="brew upgrade"
    SERVICE_CMD="brew services"
elif [ "$OS" = "Linux" ]; then
    OS_TYPE="linux"
    # 检测包管理器
    if command -v apt-get &> /dev/null; then
        PACKAGE_MANAGER="apt"
        INSTALL_CMD="sudo apt-get install -y"
        UPGRADE_CMD="sudo apt-get upgrade -y"
        SERVICE_CMD="systemctl"
    elif command -v yum &> /dev/null; then
        PACKAGE_MANAGER="yum"
        INSTALL_CMD="sudo yum install -y"
        UPGRADE_CMD="sudo yum upgrade -y"
        SERVICE_CMD="systemctl"
    else
        print_error "不支持的 Linux 发行版"
        exit 1
    fi
else
    print_error "不支持的操作系统: $OS"
    exit 1
fi

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

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# 询问用户是否安装
ask_install() {
    local package=$1
    local install_cmd=$2
    print_warning "$package 未安装"
    read -p "是否安装 $package？(Y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]] || [[ -z $REPLY ]]; then
        print_info "正在安装 $package..."
        eval "$install_cmd"
        return 0
    else
        print_error "用户取消安装 $package"
        return 1
    fi
}

# 安装 Node.js（Linux）
install_nodejs_linux() {
    if [ "$PACKAGE_MANAGER" = "apt" ]; then
        # 添加 NodeSource 仓库
        curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
        $INSTALL_CMD nodejs
    elif [ "$PACKAGE_MANAGER" = "yum" ]; then
        # 添加 NodeSource 仓库
        curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
        $INSTALL_CMD nodejs
    fi
}

# 安装 MongoDB（Linux）
install_mongodb_linux() {
    if [ "$PACKAGE_MANAGER" = "apt" ]; then
        # 添加 MongoDB 仓库
        wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
        echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
        sudo apt-get update
        $INSTALL_CMD mongodb-org
        sudo systemctl start mongod
        sudo systemctl enable mongod
    elif [ "$PACKAGE_MANAGER" = "yum" ]; then
        # 添加 MongoDB 仓库
        echo "[mongodb-org-6.0]" | sudo tee /etc/yum.repos.d/mongodb-org-6.0.repo
        echo "name=MongoDB Repository" | sudo tee -a /etc/yum.repos.d/mongodb-org-6.0.repo
        echo "baseurl=https://repo.mongodb.org/yum/redhat/\$releasever/mongodb-org/6.0/x86_64/" | sudo tee -a /etc/yum.repos.d/mongodb-org-6.0.repo
        echo "gpgcheck=1" | sudo tee -a /etc/yum.repos.d/mongodb-org-6.0.repo
        echo "enabled=1" | sudo tee -a /etc/yum.repos.d/mongodb-org-6.0.repo
        sudo rpm --import https://www.mongodb.org/static/pgp/server-6.0.asc
        $INSTALL_CMD mongodb-org
        sudo systemctl start mongod
        sudo systemctl enable mongod
    fi
}

# 检查 Node.js 版本
check_node_version() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js 未安装"
        if [ "$OS_TYPE" = "macos" ]; then
            if ask_install "Node.js" "$INSTALL_CMD node"; then
                node_version=$(node -v | cut -d'v' -f2)
                if [[ $(echo "$node_version 20.0.0" | awk '{print ($1 >= $2)}') -eq 0 ]]; then
                    print_error "Node.js 版本需要 >= 20.0.0，当前版本: $node_version"
                    exit 1
                fi
            else
                exit 1
            fi
        else
            if ask_install "Node.js" "install_nodejs_linux"; then
                node_version=$(node -v | cut -d'v' -f2)
                if [[ $(echo "$node_version 20.0.0" | awk '{print ($1 >= $2)}') -eq 0 ]]; then
                    print_error "Node.js 版本需要 >= 20.0.0，当前版本: $node_version"
                    exit 1
                fi
            else
                exit 1
            fi
        fi
    else
        node_version=$(node -v | cut -d'v' -f2)
        if [[ $(echo "$node_version 20.0.0" | awk '{print ($1 >= $2)}') -eq 0 ]]; then
            print_error "Node.js 版本需要 >= 20.0.0，当前版本: $node_version"
            if [ "$OS_TYPE" = "macos" ]; then
                if ask_install "Node.js" "$UPGRADE_CMD node"; then
                    node_version=$(node -v | cut -d'v' -f2)
                    if [[ $(echo "$node_version 20.0.0" | awk '{print ($1 >= $2)}') -eq 0 ]]; then
                        print_error "Node.js 版本仍然不满足要求"
                        exit 1
                    fi
                else
                    exit 1
                fi
            else
                if ask_install "Node.js" "install_nodejs_linux"; then
                    node_version=$(node -v | cut -d'v' -f2)
                    if [[ $(echo "$node_version 20.0.0" | awk '{print ($1 >= $2)}') -eq 0 ]]; then
                        print_error "Node.js 版本仍然不满足要求"
                        exit 1
                    fi
                else
                    exit 1
                fi
            fi
        fi
    fi
}

# 检查 npm 版本
check_npm_version() {
    if ! command -v npm &> /dev/null; then
        print_error "npm 未安装"
        if [ "$OS_TYPE" = "macos" ]; then
            if ask_install "npm" "$INSTALL_CMD npm"; then
                npm_version=$(npm -v)
                if [[ $(echo "$npm_version 8.0.0" | awk '{print ($1 >= $2)}') -eq 0 ]]; then
                    print_error "npm 版本需要 >= 8.0.0，当前版本: $npm_version"
                    exit 1
                fi
            else
                exit 1
            fi
        else
            if ask_install "npm" "install_nodejs_linux"; then
                npm_version=$(npm -v)
                if [[ $(echo "$npm_version 8.0.0" | awk '{print ($1 >= $2)}') -eq 0 ]]; then
                    print_error "npm 版本需要 >= 8.0.0，当前版本: $npm_version"
                    exit 1
                fi
            else
                exit 1
            fi
        fi
    else
        npm_version=$(npm -v)
        if [[ $(echo "$npm_version 8.0.0" | awk '{print ($1 >= $2)}') -eq 0 ]]; then
            print_error "npm 版本需要 >= 8.0.0，当前版本: $npm_version"
            if [ "$OS_TYPE" = "macos" ]; then
                if ask_install "npm" "$UPGRADE_CMD npm"; then
                    npm_version=$(npm -v)
                    if [[ $(echo "$npm_version 8.0.0" | awk '{print ($1 >= $2)}') -eq 0 ]]; then
                        print_error "npm 版本仍然不满足要求"
                        exit 1
                    fi
                else
                    exit 1
                fi
            else
                if ask_install "npm" "install_nodejs_linux"; then
                    npm_version=$(npm -v)
                    if [[ $(echo "$npm_version 8.0.0" | awk '{print ($1 >= $2)}') -eq 0 ]]; then
                        print_error "npm 版本仍然不满足要求"
                        exit 1
                    fi
                else
                    exit 1
                fi
            fi
        fi
    fi
}

# 检查 MongoDB
check_mongodb() {
    if ! command -v mongod &> /dev/null; then
        print_error "MongoDB 未安装"
        if [ "$OS_TYPE" = "macos" ]; then
            if ask_install "MongoDB" "brew tap mongodb/brew && brew install mongodb-community"; then
                print_info "正在启动 MongoDB 服务..."
                brew services start mongodb-community
                sleep 3
            else
                exit 1
            fi
        else
            if ask_install "MongoDB" "install_mongodb_linux"; then
                print_info "MongoDB 已安装并启动"
            else
                exit 1
            fi
        fi
    else
        if [ "$OS_TYPE" = "macos" ]; then
            if ! brew services list | grep -q "mongodb-community.*started"; then
                print_info "正在启动 MongoDB 服务..."
                brew services start mongodb-community
                sleep 3
            fi
        else
            if ! systemctl is-active --quiet mongod; then
                print_info "正在启动 MongoDB 服务..."
                sudo systemctl start mongod
                sleep 3
            fi
        fi
    fi
}

# 检查前端依赖
check_frontend_deps() {
    print_info "检查前端依赖..."
    local required_deps=(
        "vue"
        "vue-router"
        "element-plus"
        "@element-plus/icons-vue"
        "axios"
        "pinia"
        "sass"
    )
    
    for dep in "${required_deps[@]}"; do
        if ! grep -q "\"$dep\"" package.json; then
            print_error "缺少前端依赖: $dep"
            print_info "请确保 package.json 中包含所有必要的依赖"
            exit 1
        fi
    done
}

# 检查后端依赖
check_backend_deps() {
    print_info "检查后端依赖..."
    local required_deps=(
        "express"
        "mongoose"
        "bcryptjs"
        "jsonwebtoken"
        "cors"
        "dotenv"
    )
    
    for dep in "${required_deps[@]}"; do
        if ! grep -q "\"$dep\"" server/package.json; then
            print_error "缺少后端依赖: $dep"
            print_info "请确保 server/package.json 中包含所有必要的依赖"
            exit 1
        fi
    done
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

    # 检查依赖
    check_frontend_deps
    check_backend_deps

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