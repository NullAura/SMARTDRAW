# SMARTDRAW 智能家居绘图平台

SMARTDRAW 是一个面向家居设计与电商运营场景的全栈项目，包含 AI 辅助设计、商品管理、购物车、社区和商家数据分析功能。

## 技术架构

| 模块 | 技术栈 | 默认端口 |
| --- | --- | --- |
| Web 前端 | Vue 3、Vite、Pinia、Element Plus | 5173 |
| 业务 API | Node.js、Express、MongoDB | 3000 |
| AI 网关 | Python、Flask、Waitress | 8000 |
| 图片服务 | 独立 HTTP 服务 | 9000 |

## 目录结构

| 目录 | 职责 |
| --- | --- |
| `src/` | Web 前端、领域组件和 API 客户端 |
| `server/` | Node.js 业务 API |
| `services/ai_gateway/` | Python AI 网关及其测试 |
| `tests/integration/` | 外部服务集成测试 |
| `docs/` | 项目文档 |

## 环境要求

- Node.js 20.19+
- Python 3.10+
- MongoDB 6+

## 快速开始

```bash
git clone https://github.com/NullAura/SMARTDRAW.git
cd SMARTDRAW
./install.sh
```

编辑 `server/.env`，配置数据库、JWT 和 AI 服务参数，然后启动项目：

```bash
./start.sh
```

停止服务：

```bash
./stop.sh
```

## 配置

前端配置参考 [`.env.example`](.env.example)，服务端配置参考 [`server/.env.example`](server/.env.example)。

| 变量 | 用途 |
| --- | --- |
| `MONGODB_URI` | MongoDB 连接地址 |
| `JWT_SECRET` | JWT 签名密钥，至少 32 个字符 |
| `CORS_ORIGINS` | 业务 API 允许的浏览器来源 |
| `AI_CORS_ORIGINS` | AI 网关允许的浏览器来源 |
| `HUNYUAN_API_KEY` | 提示词服务凭据 |
| `OPENAI_API_KEY` | 图像分析服务凭据 |
| `OPENAI_API_BASE_URL` | OpenAI 兼容 API 地址 |
| `IMAGE_API_TARGET` | 图片服务地址 |
| `VITE_USE_MOCK_DATA` | 是否启用本地演示数据 |

## 质量检查

```bash
npm ci
npm --prefix server ci
npm test
npm run test:python
npm audit --audit-level=high
npm --prefix server audit --audit-level=high
gitleaks dir . --redact=100 --no-banner
```

图片服务集成测试：

```bash
IMAGE_SERVICE_URL=http://127.0.0.1:9000 npm run test:image-service
```

## 文档

- [变更记录](CHANGELOG.md)
- [安全规范](SECURITY.md)
- [开发时间线](docs/DEVELOPMENT_HISTORY.md)

## 许可证

[MIT License](LICENSE)
