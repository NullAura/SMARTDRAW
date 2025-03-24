# SMARTDRAW 智能绘图平台

一个基于 Vue 3 + Node.js + MongoDB 的智能绘图平台。

## 技术栈

### 前端
- Vue 3
- Vue Router
- Element Plus
- Axios

### 后端
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT

## 项目结构

```
smartdraw/
├── src/                    # 前端源代码目录
│   ├── assets/            # 静态资源
│   │   ├── Breadcrumb.vue # 面包屑导航
│   │   └── Header.vue     # 页面头部
│   │   └── ...            # 其他组件
│   ├── router/            # 路由配置
│   ├── views/             # 页面组件
│   │   ├── Login.vue      # 登录页
│   │   ├── Register.vue   # 注册页
│   │   ├── Home.vue       # 首页
│   │   ├── User.vue       # 用户中心
│   │   ├── Store.vue      # 商店页
│   │   └── Community.vue  # 社区页
│   ├── App.vue            # 根组件
│   └── main.js            # 入口文件
├── server/                 # 后端源代码目录
│   ├── src/
│   │   ├── app.js         # 应用入口文件
│   │   ├── routes/        # 路由文件
│   │   │   ├── auth.js    # 认证相关路由
│   │   │   ├── users.js   # 用户相关路由
│   │   │   └── works.js   # 作品相关路由
│   │   ├── models/        # 数据模型
│   │   │   ├── User.js    # 用户模型
│   │   │   └── Work.js    # 作品模型
│   │   ├── middleware/    # 中间件
│   │   │   └── auth.js    # 认证中间件
│   │   └── config/        # 配置文件
│   ├── .env               # 环境变量
│   └── package.json       # 后端依赖配置
├── public/                 # 公共资源目录
├── index.html             # HTML 模板
├── package.json           # 前端依赖配置
├── vite.config.js         # Vite 配置
├── start.sh               # 启动脚本
└── README.md              # 项目说明
```

## 环境要求

- Node.js >= 16.0.0
- MongoDB >= 6.0
- npm >= 8.0.0

## 安装依赖

### 方式一：使用一键安装脚本（推荐）

```bash
# 给安装脚本添加执行权限
chmod +x install.sh

# 运行安装脚本
./install.sh
```

该脚本会自动：
1. 检查 Node.js 和 npm 版本
2. 检查并启动 MongoDB 服务
3. 安装前端依赖
4. 安装后端依赖
5. 创建环境变量配置文件

### 方式二：手动安装

#### 前端依赖
```bash
# 安装前端依赖
npm install
```

前端依赖列表：
```json
{
  "dependencies": {
    "vue": "^3.3.4",
    "vue-router": "^4.2.4",
    "element-plus": "^2.3.9",
    "@element-plus/icons-vue": "^2.1.0",
    "axios": "^1.4.0",
    "pinia": "^2.1.6",
    "sass": "^1.66.1"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^4.3.4",
    "vite": "^4.4.9",
    "eslint": "^8.49.0",
    "eslint-plugin-vue": "^9.17.0",
    "prettier": "^3.0.3"
  }
}
```

#### 后端依赖
```bash
# 进入后端目录
cd server

# 安装后端依赖
npm install
```

后端依赖列表：
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^8.1.1",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

## 配置环境变量

1. 在 `server` 目录下创建 `.env` 文件：
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/smartdraw
JWT_SECRET=your-secret-key
```

## 启动服务

### 方式一：使用启动脚本（推荐）

```bash
# 给启动脚本添加执行权限
chmod +x start.sh

# 运行启动脚本
./start.sh
```

### 方式二：分别启动

1. 启动 MongoDB：
```bash
# macOS
brew services start mongodb-community

# 确保 MongoDB 正在运行
brew services list | grep mongodb
```

2. 启动后端服务：
```bash
# 进入后端目录
cd server

# 开发模式启动
npm run dev
```

3. 启动前端服务：
```bash
# 新开一个终端，在项目根目录下
npm run dev
```

## 访问地址

- 前端：http://localhost:5173
- 后端 API：http://localhost:3000

## 功能特性

- 用户注册和登录
- 支持邮箱或用户名登录
- JWT 认证
- 用户信息管理
- 作品管理（CRUD）
- 作品点赞和评论

## 开发说明

- 前端开发服务器支持热重载
- 后端开发服务器使用 nodemon 实现自动重启
- 使用 ESLint 进行代码规范检查
- 使用 Prettier 进行代码格式化

## 注意事项

1. 确保 MongoDB 服务已启动
2. 确保所有依赖都已正确安装
3. 确保环境变量配置正确
4. 开发时请遵循项目的代码规范

## 问题排查

如果遇到问题，请检查：

1. MongoDB 服务状态
2. 环境变量配置
3. 依赖安装是否完整
4. 端口是否被占用
5. 控制台错误信息

## 贡献指南

1. Fork 项目
2. 创建特性分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 许可证

MIT License 