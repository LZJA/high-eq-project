# HighEQ - 高情商回复生成助手

> 基于 AI 的高情商聊天回复生成工具，帮助用户在各类社交场景下生成得体、贴心的回复建议。

## 项目简介

HighEQ 是一个完整的前后端分离应用，通过分析对方聊天内容、角色背景、用户意图和期望语气，利用 AI 生成多条高情商的回复建议，每条建议都配有具体的推荐理由。

### 核心功能

- **智能回复生成** - AI 分析上下文，生成 1-5 条高情商回复建议
- **角色背景适配** - 支持同事、朋友、家人、领导、客户、陌生人、伴侣、老师等多种角色
- **语气风格选择** - 5 种语气可选（温和友善、正式得体、幽默风趣、真诚直接、委婉含蓄）
- **意图精准匹配** - 根据用户真实意图定制回复风格
- **智能推荐理由** - AI 为每条建议生成具体的推荐理由
- **历史记录管理** - 分页查看所有生成记录，支持收藏和删除
- **收藏夹** - 收藏精彩回复，建立个人沟通智慧库

## 技术栈

### 前端

| 技术 | 版本 | 说明 |
|------|------|------|
| React | 18.3.1 | UI 框架 |
| Vite | 5.4.20 | 构建工具 |
| TypeScript | 5.6.3 | 类型系统 |
| Tailwind CSS | 4.1.14 | 样式框架 |
| Wouter | 3.3.5 | 路由管理 |
| Radix UI | - | UI 组件库 |
| Axios | 1.12.0 | HTTP 客户端 |
| Sonner | - | Toast 通知 |

### 后端

| 技术 | 版本 | 说明 |
|------|------|------|
| Java | 17 | 编程语言 |
| Spring Boot | 3.2.0 | Web 框架 |
| MyBatis-Plus | 3.5.9 | ORM 框架 |
| MySQL | 8.0 | 数据库 |
| JWT | 0.12.3 | 用户认证 |

### AI 服务

- **DeepSeek API** (推荐) - 逻辑能力强，性价比高
- 豆包 API (备选) - 语气自然，响应速度快
- 百度文心一言 (备选) - 部分模型免费

## 项目结构

```
high-eq-project/
├── high-eq-front/                 # 前端项目
│   ├── client/
│   │   ├── src/
│   │   │   ├── pages/            # 页面组件
│   │   │   │   ├── Home.tsx      # 首页（炫酷展示页）
│   │   │   │   ├── Login.tsx     # 登录页
│   │   │   │   ├── Register.tsx  # 注册页
│   │   │   │   ├── ReplyApp.tsx  # 回复生成器（核心功能）
│   │   │   │   ├── History.tsx   # 历史记录（分页）
│   │   │   │   └── Favorites.tsx # 收藏夹
│   │   │   ├── components/       # 业务组件
│   │   │   │   ├── AppNav.tsx    # 导航组件
│   │   │   │   └── ui/           # UI 组件库 (Radix UI)
│   │   │   ├── contexts/         # React Context
│   │   │   │   └── AuthContext.tsx
│   │   │   ├── lib/              # 工具库
│   │   │   │   └── api.ts        # API 客户端
│   │   │   └── App.tsx           # 应用入口
│   │   ├── index.html            # HTML 入口
│   │   └── index.css             # 全局样式
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
    │   ├── config/               # 配置类
    │   └── util/                 # 工具类
    ├── src/main/resources/
    │   ├── application.yml       # 应用配置
    │   └── db/init.sql           # 数据库初始化脚本
    └── pom.xml
```

## 页面路由

| 路径 | 页面 | 说明 | 认证 |
|------|------|------|------|
| `/` | 首页 | 产品介绍和功能演示 | 公开 |
| `/login` | 登录 | 用户登录 | 公开 |
| `/register` | 注册 | 用户注册 | 公开 |
| `/app` | 回复生成器 | 核心功能页面 | 需登录 |
| `/history` | 历史记录 | 查看所有历史记录（分页）| 需登录 |
| `/favorites` | 收藏 | 查看收藏的回复 | 需登录 |

## 快速开始

### 环境要求

- Node.js 18+
- Java 17+
- MySQL 8.0+ (运行在 3307 端口)
- pnpm (推荐) 或 npm
- DeepSeek API Key

### 1. 克隆项目

```bash
git clone <repository-url>
cd high-eq-project
```

### 2. 配置环境变量

**后端配置：**
```bash
cd high-eq-backend

# 复制环境变量模板
cp .env .env.local

# 编辑 .env 文件，填入真实配置
# - MYSQL_PASSWORD: 你的 MySQL 密码
# - JWT_SECRET: JWT 密钥（用 openssl rand -base64 32 生成）
# - DEEPSEEK_API_KEY: DeepSeek API Key
```

**前端配置（可选）：**
```bash
cd high-eq-front

# 复制环境变量模板（如需自定义 API 地址）
cp .env.example .env

# 默认使用代理配置 /api，通常无需修改
```

### 3. 初始化数据库

```bash
# 初始化数据库（MySQL 运行在 3307 端口）
mysql -u root -p -P 3307 < high-eq-backend/src/main/resources/db/init.sql
```

### 4. 启动后端

```bash
cd high-eq-backend

# 方式一：使用启动脚本（推荐）
./start.sh        # Linux/Mac
start.bat         # Windows

# 方式二：直接使用 Maven
mvn spring-boot:run
```

后端服务运行在 `http://localhost:8080/api`

### 5. 启动前端

```bash
cd high-eq-front

# 方式一：使用启动脚本（推荐）
./start.sh        # Linux/Mac

# 方式二：直接使用 pnpm
pnpm dev
```

前端服务运行在 `http://localhost:3000`

### 6. 访问应用

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
GET    /api/reply/history?page=1&size=10      # 获取历史记录（分页）
GET    /api/reply/history/{id}                # 获取历史记录详情
DELETE /api/reply/history/{id}                # 删除历史记录
POST   /api/reply/history/{id}/favorite       # 收藏/取消收藏
GET    /api/reply/history/favorite            # 获取收藏列表
```

### 请求示例

#### 生成回复

```json
POST /api/reply/generate
Authorization: Bearer {token}

{
  "chatContent": "你最近怎么样？好久没见你了",
  "roleBackground": "朋友",
  "userIntent": "我最近很忙，想表达歉意但也要解释原因",
  "replyCount": 3,
  "tone": "温和友善"
}
```

#### 响应示例

```json
{
  "code": 200,
  "message": "回复生成成功",
  "data": {
    "historyId": "uuid",
    "suggestions": [
      {
        "id": "uuid",
        "content": "哈哈，好久不见！我最近确实有点忙...",
        "reason": "这条回复用轻松的语气回应了对方的问候...",
        "tone": "温和友善"
      }
    ],
    "modelUsed": "deepseek-chat",
    "generatedTime": 1234
  }
}
```

## 配置说明

### 环境变量

项目使用 `.env` 文件管理环境变量，避免敏感信息泄露。

#### 后端环境变量 (.env)

| 变量 | 说明 | 示例 |
|------|------|------|
| `MYSQL_USER` | MySQL 用户名 | root |
| `MYSQL_PASSWORD` | MySQL 密码 | your_password |
| `JWT_SECRET` | JWT 密钥（至少 32 字符）| 用 openssl rand -base64 32 生成 |
| `DEEPSEEK_API_KEY` | DeepSeek API Key | sk-xxxxx |

#### 前端环境变量 (.env)

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `VITE_API_URL` | 后端 API 地址 | `/api` |

### 配置文件说明

```
high-eq-backend/
├── .env                 # 实际环境变量（不提交到 Git）
├── .env.example         # 环境变量模板
└── application.yml      # 应用配置（不提交到 Git）

high-eq-front/
├── .env                 # 实际环境变量（不提交到 Git）
└── .env.example         # 环境变量模板
```

## 功能截图

### 回复生成器
- 输入对方聊天内容
- 选择角色背景（同事、朋友、家人等）
- 输入自己的真实意图
- 选择语气/风格（可选）
- 点击生成，AI 返回多条建议及推荐理由

### 历史记录
- 分页展示所有历史记录
- 点击记录查看详情和回复建议
- 支持收藏和删除操作

### 收藏夹
- 展示所有收藏的记录
- 支持展开/收起查看详情
- 一键复制回复内容

## 开发计划

- [x] 前端页面开发（登录、注册、主应用、历史、收藏）
- [x] 语气/风格选择功能
- [x] AI 生成推荐理由
- [x] 历史记录分页
- [x] 移动端适配
- [ ] 用户信息管理
- [ ] 自定义角色功能
- [ ] 数据统计面板
- [ ] 导出历史记录

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License

## 联系方式

如有问题或建议，欢迎提交 Issue。
