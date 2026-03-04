# HighEQ - 高情商回复生成助手

> 基于 AI 的智能聊天回复生成工具，帮助用户在各类场景下生成得体、高情商的回复。

## 项目概述

HighEQ 是一个完整的前后端分离应用，通过分析聊天内容、角色背景和用户意图，利用 AI 生成高情商的回复建议。

### 核心功能

- **智能回复生成** - 输入聊天内容，AI 分析上下文生成多条高情商回复
- **角色背景适配** - 支持同事、朋友、家人、领导等多种角色场景
- **意图精准匹配** - 根据用户真实意图定制回复风格
- **历史记录管理** - 保存所有生成记录，支持收藏和删除
- **多 AI 模型** - 支持 DeepSeek、豆包、文心一言等模型

## 技术栈

### 前端

| 技术 | 版本 | 说明 |
|------|------|------|
| React | 19.2.1 | UI 框架 |
| Vite | 7.1.7 | 构建工具 |
| TypeScript | 5.6.3 | 类型系统 |
| Tailwind CSS | 4.1.14 | 样式框架 |
| Wouter | 3.3.5 | 路由管理 |
| Radix UI | - | UI 组件库 |
| Axios | 1.12.0 | HTTP 客户端 |

### 后端

| 技术 | 版本 | 说明 |
|------|------|------|
| Java | 17 | 编程语言 |
| Spring Boot | 3.2 | Web 框架 |
| MyBatis-Plus | 3.5 | ORM 框架 |
| MySQL | 8.0 | 数据库 |
| JWT | - | 用户认证 |

### AI 服务

- **DeepSeek API** (主要)
- 豆包 API (备选)
- 百度文心一言 (备选)

## 项目结构

```
high-eq-project/
├── high-eq-front/                 # 前端项目
│   ├── client/
│   │   ├── src/
│   │   │   ├── pages/            # 页面组件
│   │   │   │   ├── Home.tsx      # 首页
│   │   │   │   ├── Login.tsx     # 登录页
│   │   │   │   ├── Register.tsx  # 注册页
│   │   │   │   ├── ReplyApp.tsx  # 主应用（回复生成器）
│   │   │   │   ├── History.tsx   # 历史记录
│   │   │   │   └── Favorites.tsx # 收藏
│   │   │   ├── components/       # 业务组件
│   │   │   ├── components/ui/    # UI 组件库 (Radix UI)
│   │   │   ├── contexts/         # React Context
│   │   │   │   ├── AuthContext.tsx
│   │   │   │   └── ThemeContext.tsx
│   │   │   ├── lib/              # 工具库
│   │   │   │   └── api.ts        # API 客户端
│   │   │   └── App.tsx           # 应用入口
│   │   └── public/               # 静态资源
│   ├── vite.config.ts            # Vite 配置
│   └── package.json
│
└── high-eq-backend/               # 后端项目
    ├── src/main/java/com/highiq/
    │   ├── controller/           # REST API 控制器
    │   ├── service/              # 业务逻辑服务
    │   ├── entity/               # 数据库实体
    │   ├── mapper/               # MyBatis Mapper
    │   ├── dto/                  # 数据传输对象
    │   ├── util/                 # 工具类
    │   └── HighEqApplication.java
    ├── src/main/resources/
    │   ├── application.yml       # 应用配置
    │   └── db/init.sql           # 数据库初始化
    └── pom.xml
```

## 页面路由

| 路径 | 页面 | 说明 | 认证 |
|------|------|------|------|
| `/` | 首页 | 项目介绍和技术方案展示 | 公开 |
| `/login` | 登录 | 用户登录 | 公开 |
| `/register` | 注册 | 用户注册 | 公开 |
| `/app` | 回复生成器 | 核心功能页面 | 需登录 |
| `/history` | 历史记录 | 查看所有历史记录 | 需登录 |
| `/favorites` | 收藏 | 查看收藏的回复 | 需登录 |

## 快速开始

### 环境要求

- Node.js 18+
- Java 17+
- MySQL 8.0+
- pnpm (推荐) 或 npm

### 1. 克隆项目

```bash
git clone <repository-url>
cd high-eq-project
```

### 2. 启动后端

```bash
# 初始化数据库
mysql -u root -p < high-eq-backend/src/main/resources/db/init.sql

# 配置 application.yml 中的数据库连接和 AI API Key
# 编辑 high-eq-backend/src/main/resources/application.yml

# 启动后端服务
cd high-eq-backend
mvn spring-boot:run
```

后端服务运行在 `http://localhost:8080/api`

### 3. 启动前端

```bash
cd high-eq-front
pnpm install
pnpm dev
```

前端服务运行在 `http://localhost:3000`

### 4. 访问应用

打开浏览器访问 `http://localhost:3000`，注册账号后开始使用。

## API 接口

### 认证接口

```
POST   /api/auth/register      # 用户注册
POST   /api/auth/login         # 用户登录
POST   /api/auth/refresh       # 刷新 Token
GET    /api/auth/me            # 获取当前用户信息
```

### 回复生成接口

```
POST   /api/reply/generate                    # 生成回复
GET    /api/reply/history                     # 获取历史记录列表
GET    /api/reply/history/{id}                # 获取历史记录详情
DELETE /api/reply/history/{id}                # 删除历史记录
POST   /api/reply/history/{id}/favorite       # 收藏/取消收藏
GET    /api/reply/history/favorite            # 获取收藏列表
```

## 部署

### 开发环境

```bash
# 前端
cd high-eq-front
pnpm dev

# 后端
cd high-eq-backend
mvn spring-boot:run
```

### 生产环境

详细部署指南请参考 [DEPLOYMENT.md](./DEPLOYMENT.md)

**前端部署 (Nginx 静态托管)**:

```bash
cd high-eq-front
pnpm build
# 将 dist 目录部署到服务器
```

**后端部署**:

```bash
cd high-eq-backend
mvn clean package
java -jar target/high-eq-reply-1.0.0.jar
```

## 配置说明

### 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `VITE_API_URL` | 后端 API 地址 | `/api` |
| `DEEPSEEK_API_KEY` | DeepSeek API Key | - |

### 后端配置 (application.yml)

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/high_eq_db
    username: root
    password: root

server:
  port: 8080
  servlet:
    context-path: /api

ai:
  deepseek:
    api-key: ${DEEPSEEK_API_KEY}
    api-url: https://api.deepseek.com/v1
```

## 开发计划

- [x] 前端页面开发（登录、注册、主应用、历史、收藏）
- [ ] 用户信息管理
- [ ] 自定义角色功能
- [ ] 数据统计面板
- [ ] 导出历史记录
- [ ] 移动端适配

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License

## 联系方式

如有问题或建议，欢迎提交 Issue。
