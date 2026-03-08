# 高情商回复生成助手 - 后端服务

## 项目简介

这是"高情商回复生成助手"的后端服务，采用 Java + Spring Boot 3 + MyBatis-Plus + MySQL 的技术栈。该服务提供用户认证、聊天内容处理、AI 模型调用、历史记录管理（分页）和智能推荐理由生成等核心功能。

## 技术栈

- **Java 17+** - 编程语言
- **Spring Boot 3.2** - Web 框架
- **Spring Security + JWT** - 安全认证
- **MyBatis-Plus 3.5** - ORM 框架
- **MySQL 8** - 数据库（UTF-8 编码）
- **DeepSeek API** - AI 模型服务

## 项目结构

```
high-eq-backend/
├── src/
│   ├── main/
│   │   ├── java/com/highiq/
│   │   │   ├── controller/          # 控制器层
│   │   │   │   ├── AuthController.java      # 认证接口
│   │   │   │   └── ReplyController.java     # 回复生成接口
│   │   │   ├── service/             # 业务逻辑层
│   │   │   │   ├── AiService.java           # AI 服务
│   │   │   │   └── ReplyService.java        # 回复服务
│   │   │   ├── entity/              # 数据库实体
│   │   │   │   ├── User.java                # 用户实体
│   │   │   │   ├── History.java             # 历史记录实体
│   │   │   │   └── ReplySuggestion.java     # 回复建议实体
│   │   │   ├── mapper/              # MyBatis Mapper
│   │   │   ├── dto/                 # 数据传输对象
│   │   │   │   ├── ApiResponse.java         # 统一响应格式
│   │   │   │   ├── HistoryDTO.java          # 历史记录 DTO
│   │   │   │   ├── PageResponse.java         # 分页响应 DTO
│   │   │   │   ├── SuggestionDTO.java        # 建议 DTO
│   │   │   │   └── GenerateReplyRequest.java # 生成请求 DTO
│   │   │   ├── config/              # 配置类
│   │   │   │   ├── SecurityConfig.java       # 安全配置
│   │   │   │   ├── CorsConfig.java           # 跨域配置
│   │   │   │   └── JwtAuthenticationFilter.java # JWT 过滤器
│   │   │   ├── util/                # 工具类
│   │   │   │   └── JwtUtil.java              # JWT 工具
│   │   │   └── HighEqApplication.java  # 应用启动类
│   │   └── resources/
│   │       ├── application.yml      # 应用配置
│   │       └── db/
│   │           └── init.sql         # 数据库初始化脚本
│   └── test/                        # 测试代码
├── pom.xml                          # Maven 配置
└── README.md                        # 项目文档
```

## 快速开始

### 前置条件

- Java 17 或更高版本
- Maven 3.6 或更高版本
- MySQL 8.0 或更高版本（运行在 3307 端口）
- DeepSeek API Key（用于 AI 功能）

### 安装步骤

#### 方式一：本地开发环境

1. **初始化数据库**
   ```bash
   mysql -u root -p -P 3307 < src/main/resources/db/init.sql
   ```

2. **配置环境变量**
   复制并编辑环境变量配置：
   ```bash
   cp .env.example .env
   # 编辑 .env 文件，填入正确的配置
   ```

3. **编译并运行**
   使用启动脚本：
   ```bash
   # Linux/Mac
   ./start.sh

   # Windows
   start.bat
   ```

   或直接使用 Maven：
   ```bash
   mvn spring-boot:run
   ```

应用将在 `http://localhost:8080/api` 启动。

#### 方式二：Docker 部署（推荐用于生产环境）

1. **前置条件**
   - Docker 20.10 或更高版本
   - Docker Compose 2.0 或更高版本

2. **配置环境变量**
   ```bash
   cp .env.example .env
   # 编辑 .env 文件，填入正确的配置
   ```

3. **使用部署脚本**
   ```bash
   # 构建并启动服务
   ./deploy-docker.sh up

   # 查看服务状态
   ./deploy-docker.sh status

   # 查看日志
   ./deploy-docker.sh logs

   # 停止服务
   ./deploy-docker.sh down

   # 重启服务
   ./deploy-docker.sh restart
   ```

4. **或使用 Docker Compose 命令**
   ```bash
   # 构建镜像
   docker-compose build

   # 启动服务（包含 MySQL 和后端）
   docker-compose up -d

   # 查看服务状态
   docker-compose ps

   # 查看日志
   docker-compose logs -f

   # 停止服务
   docker-compose down

   # 停止服务并删除数据卷
   docker-compose down -v
   ```

5. **服务访问地址**
   - 后端 API: http://localhost:8080
   - MySQL: localhost:3306

### Docker 镜像说明

- 使用多阶段构建，优化镜像大小
- 基于 Alpine Linux，最终镜像约 200MB
- 内置健康检查，自动监控服务状态
- 非 root 用户运行，提高安全性
- 支持 JVM 参数优化，默认使用 75% 容器内存

## API 文档

### 认证相关

#### 用户注册
```
POST /api/auth/register
Content-Type: application/json

{
  "username": "user123",
  "password": "password123",
  "email": "user@example.com"
}
```

#### 用户登录
```
POST /api/auth/login
Content-Type: application/json

{
  "username": "user123",
  "password": "password123"
}
```

### 回复生成相关

#### 生成高情商回复
```
POST /api/reply/generate
Authorization: Bearer {token}
Content-Type: application/json

{
  "chatContent": "你最近怎么样？好久没见你了",
  "roleBackground": "朋友",
  "userIntent": "我最近很忙，想表达歉意但也要解释原因",
  "replyCount": 3,
  "tone": "温和友善"
}

Response:
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

#### 获取历史记录（分页）
```
GET /api/reply/history?page=1&size=10
Authorization: Bearer {token}

Response:
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "items": [...],
    "totalPages": 5,
    "total": 50,
    "currentPage": 1,
    "pageSize": 10
  }
}
```

#### 获取历史记录详情
```
GET /api/reply/history/{historyId}
Authorization: Bearer {token}

Response:
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "id": "uuid",
    "chatContent": "你最近怎么样？",
    "roleBackground": "朋友",
    "userIntent": "我想表达歉意",
    "tone": "温和友善",
    "isFavorite": false,
    "createTime": "202603-03 10:00",
    "suggestions": [...]
  }
}
```

#### 收藏/取消收藏
```
POST /api/reply/history/{historyId}/favorite
Authorization: Bearer {token}
```

#### 获取收藏列表
```
GET /api/reply/history/favorite
Authorization: Bearer {token}
```

## 数据库设计

### 用户表 (user)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | VARCHAR(36) | 用户唯一标识符 (UUID) |
| username | VARCHAR(50) | 用户名（唯一） |
| password | VARCHAR(255) | 加密密码 |
| email | VARCHAR(100) | 邮箱（唯一） |
| phone | VARCHAR(20) | 手机号（唯一） |
| avatar_url | VARCHAR(500) | 头像 URL |
| nickname | VARCHAR(100) | 昵称 |
| status | TINYINT | 状态 (1-正常, 0-禁用) |
| create_time | DATETIME | 创建时间 |
| update_time | DATETIME | 更新时间 |

### 会话历史表 (history)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | VARCHAR(36) | 会话唯一标识符 (UUID) |
| user_id | VARCHAR(36) | 用户 ID |
| chat_content | TEXT | 对方聊天内容 |
| role_background | VARCHAR(100) | 角色背景 |
| user_intent | TEXT | 用户真实意图 |
| model_used | VARCHAR(50) | 使用的 AI 模型 |
| tone | VARCHAR(50) | 语气/风格 |
| status | TINYINT | 状态 (1-正常, 0-已删除) |
| is_favorite | TINYINT | 是否收藏 (1-是, 0-否) |
| create_time | DATETIME | 创建时间 |
| update_time | DATETIME | 更新时间 |

### 回复建议表 (reply_suggestion)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | VARCHAR(36) | 回复建议唯一标识符 (UUID) |
| history_id | VARCHAR(36) | 关联的会话历史 ID |
| suggestion_text | TEXT | AI 生成的回复文本（含推荐理由） |
| order_index | INT | 排序索引 |
| is_selected | TINYINT | 是否被用户选中 |
| create_time | DATETIME | 创建时间 |

### 预设角色表 (preset_role)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | VARCHAR(36) | 角色唯一标识符 |
| role_name | VARCHAR(50) | 角色名称 |
| description | VARCHAR(255) | 角色描述 |
| is_default | TINYINT | 是否为预设角色 |
| create_time | DATETIME | 创建时间 |

## 环境变量配置

项目使用 `.env` 文件管理环境变量，**本地开发和 Docker 部署共用同一个 `.env` 文件**。

请复制 `.env.example` 文件并重命名为 `.env`，然后填入实际配置值：

```bash
cp .env.example .env
# 编辑 .env 文件，填入正确的配置
```

| 变量名 | 说明 | 示例 | 必填 |
|--------|------|------|------|
| `MYSQL_USER` | MySQL 用户名 | root | 是 |
| `MYSQL_PASSWORD` | MySQL 密码 | password | 是 |
| `MYSQL_ROOT_PASSWORD` | MySQL root 密码（Docker） | root | 是 |
| `MYSQL_DATABASE` | 数据库名（Docker） | higheq | 是 |
| `MYSQL_HOST` | MySQL 主机（本地开发） | localhost | 否 |
| `MYSQL_PORT` | MySQL 端口（本地开发） | 3306 | 否 |
| `JWT_SECRET` | JWT 密钥（至少32位） | your-secret-key-change-this | 是 |
| `DEEPSEEK_API_KEY` | DeepSeek API Key | sk-xxxxx | 是 |

### 环境变量加载说明

项目使用 dotenv-java 库在应用启动时加载 `.env` 文件中的环境变量。环境变量在 `main()` 方法中加载，确保在 Spring 初始化之前就可用。

Docker 部署时，环境变量通过 `docker-compose.yml` 传入容器。

## 常见问题

### Q: 如何修改数据库连接信息？
A: 编辑 `.env` 文件中的数据库相关配置：
- 本地开发：修改 `MYSQL_HOST`、`MYSQL_PORT` 等
- Docker 部署：docker-compose 会自动读取 `.env` 中的 `MYSQL_DATABASE`、`MYSQL_USER`、`MYSQL_PASSWORD` 等变量

### Q: 如何获取 DeepSeek API Key？
A: 访问 [DeepSeek 官网](https://api-docs.deepseek.com) 注册账号并获取 API Key。

### Q: 如何处理中文乱码？
A: 确保数据库 URL 包含 `characterEncoding=utf8&useUnicode=true`，同时检查 Jackson 和 Servlet 的编码配置。项目已配置 UTF-8 编码支持。

### Q: 如何扩展新的 AI 模型支持？
A: 在 `AiService` 中添加新的模型调用方法，并在配置文件中添加相应的配置。

### Q: Docker 部署后如何查看日志？
A: 使用以下命令查看日志：
```bash
# 查看所有日志
docker-compose logs -f

# 只查看后端日志
docker-compose logs -f backend

# 只查看 MySQL 日志
docker-compose logs -f mysql
```

### Q: Docker 部署后数据库数据会丢失吗？
A: 不会。Docker Compose 使用命名卷 `mysql_data` 持久化数据库数据。只有在使用 `docker-compose down -v` 命令时才会删除数据。

### Q: 如何在生产环境部署？
A: 建议使用 Docker 部署，并修改以下配置：
1. 修改 `.env` 文件中的默认密码
2. 使用强密码作为 `JWT_SECRET`
3. 配置反向代理（如 Nginx）
4. 启用 HTTPS
5. 配置防火墙规则
6. 定期备份数据库

## 许可证

MIT License
