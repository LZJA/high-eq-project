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

1. **初始化数据库**
   ```bash
   mysql -u root -p -P 3307 < src/main/resources/db/init.sql
   ```

2. **配置应用**
   编辑 `src/main/resources/application.yml`：
   ```yaml
   spring:
     datasource:
       url: jdbc:mysql://localhost:3307/high_eq_db?characterEncoding=utf8&useUnicode=true
       username: root
       password: your_password

   ai:
     deepseek:
       api-key: your_deepseek_api_key
   ```

3. **编译并运行**
   ```bash
   mvn spring-boot:run
   ```

应用将在 `http://localhost:8080/api` 启动。

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
    "createTime": "2024-03-03 10:00",
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

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `DEEPSEEK_API_KEY` | DeepSeek API Key | sk-xxxxx |
| `MYSQL_HOST` | MySQL 主机 | localhost |
| `MYSQL_PORT` | MySQL 端口 | 3307 |
| `MYSQL_DATABASE` | 数据库名 | high_eq_db |
| `MYSQL_USER` | MySQL 用户 | root |
| `MYSQL_PASSWORD` | MySQL 密码 | password |
| `JWT_SECRET` | JWT 密钥 | your-secret-key |
| `JWT_EXPIRATION` | Token 过期时间（毫秒） | 86400000 |

## 常见问题

### Q: 如何修改数据库连接信息？
A: 编辑 `application.yml` 中的 `spring.datasource` 配置。

### Q: 如何获取 DeepSeek API Key？
A: 访问 [DeepSeek 官网](https://api-docs.deepseek.com) 注册账号并获取 API Key。

### Q: 如何处理中文乱码？
A: 确保数据库 URL 包含 `characterEncoding=utf8&useUnicode=true`，同时检查 Jackson 和 Servlet 的编码配置。

### Q: 如何扩展新的 AI 模型支持？
A: 在 `AiService` 中添加新的模型调用方法，并在配置文件中添加相应的配置。

## 许可证

MIT License
