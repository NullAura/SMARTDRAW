# SmartDraw - 智能绘图平台

SmartDraw 是一个基于 Vue.js 3 开发的现代化智能绘图平台，提供用户友好的界面和丰富的绘图功能。

## 功能特性

- 🎨 智能绘图功能
- 👤 用户认证系统
  - 邮箱密码登录
  - 用户注册
  - 记住登录状态
  - 第三方登录（微信、QQ、微博）
- 🎯 响应式设计
- 🎭 优雅的动画效果
- 🔒 安全的用户认证

## 技术栈

- Vue.js 3
- Vue Router
- Vite
- Font Awesome
- CSS3 (Flexbox, Grid, Animations)

## 项目结构

```
smartdraw/
├── src/                    # 源代码目录
│   ├── assets/            # 静态资源
│   ├── components/        # 公共组件
│   ├── layouts/           # 布局组件
│   ├── router/            # 路由配置
│   ├── styles/            # 全局样式
│   ├── views/             # 页面组件
│   ├── App.vue            # 根组件
│   └── main.js            # 入口文件
├── public/                 # 公共资源目录
├── index.html             # HTML 模板
├── package.json           # 项目配置
├── vite.config.js         # Vite 配置
└── README.md              # 项目说明
```

## 页面组件

- `Login.vue` - 登录页面
- `Register.vue` - 注册页面
- `Home.vue` - 首页
- `User.vue` - 用户中心
- `Store.vue` - 商店页面
- `Community.vue` - 社区页面

## 安装和运行

1. 克隆项目
```bash
git clone [项目地址]
cd smartdraw
```

2. 安装依赖
```bash
npm install
```

3. 启动开发服务器
```bash
npm run dev
```

4. 构建生产版本
```bash
npm run build
```

## 开发说明

- 开发服务器默认运行在 `http://localhost:5173`
- 使用 `npm run build` 构建生产版本
- 使用 `npm run preview` 预览生产构建

## 浏览器支持

- Chrome (推荐)
- Firefox
- Safari
- Edge

## 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 许可证

[MIT License](LICENSE) 