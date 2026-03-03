# 高情商回复生成助手 - 后端服务

## 项目简介

这是"高情商回复生成助手"的后端服务，采用 Java + Spring Boot 3 + MyBatis-Plus + MySQL 的技术栈。该服务提供用户认证、聊天内容处理、AI 模型调用和历史记录管理等核心功能。

## 技术栈

- **Java 17+** - 编程语言
- **Spring Boot 3.2** - Web 框架
- **Spring Security** - 安全框架
- **MyBatis-Plus 3.5** - ORM 框架
- **MySQL 8** - 数据库
- **JWT** - 用户认证
- **DeepSeek API** - AI 模型服务

## 项目结构

```
high-eq-backend/
├── src/
│   ├── main/
│   │   ├── java/com/highiq/
│   │   │   ├── controller/          # 控制器层
│   │   │   ├── service/             # 业务逻辑层
│   │   │   ├── entity/              # 数据库实体
│   │   │   ├── mapper/              # MyBatis Mapper
│   │   │   ├── dto/                 # 数据传输对象
│   │   │   ├── util/                # 工具类
│   │   │   ├── exception/           # 异常处理
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
- MySQL 8.0 或更高版本
- DeepSeek API Key（可选，用于 AI 功能）

### 安装步骤

1. **克隆项目**
   ```bash
   cd /home/ubuntu/high-eq-backend
   ```

2. **创建数据库**
   ```bash
   mysql -u root -p < src/main/resources/db/init.sql
   ```

3. **配置应用**
   编辑 `src/main/resources/application.yml`，修改以下配置：
   ```yaml
   spring:
     datasource:
       url: jdbc:mysql://localhost:3306/high_eq_db
       username: root
       password: your_password
   
   ai:
     deepseek:
       api-key: your_deepseek_api_key
   ```

4. **编译项目**
   ```bash
   mvn clean package
   ```

5. **运行应用**
   ```bash
   mvn spring-boot:run
   ```

   或者直接运行 JAR 文件：
   ```bash
   java -jar target/high-eq-reply-1.0.0.jar
   ```

应用将在 `http://localhost:8080` 启动。

## API 文档

### 认证相关

#### 用户注册
```
POST /api/auth/register
Content-Type: application/json

{
  "username": "user123",
  "password": "password123",
  "email": "user@example.com",
  "phone": "13800138000"
}

Response:
{
  "code": 200,
  "message": "注册成功",
  "data": {
    "id": "uuid",
    "username": "user123",
    "email": "user@example.com",
    "phone": "13800138000",
    "createTime": "2024-03-03T10:00:00"
  }
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

Response:
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "username": "user123",
      "email": "user@example.com"
    },
    "expiresIn": 86400
  }
}
```

#### 刷新 Token
```
POST /api/auth/refresh
Authorization: Bearer {refreshToken}

Response:
{
  "code": 200,
  "message": "Token 刷新成功",
  "data": {
    "token": "new_token",
    "refreshToken": "new_refresh_token",
    "expiresIn": 86400
  }
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
  "replyCount": 3
}

Response:
{
  "code": 200,
  "message": "回复生成成功",
  "data": {
    "historyId": "uuid",
    "suggestions": [
      "我最近工作特别忙，一直想找你聊天，真的很抱歉！等我这段时间过去了，咱们好好聚一聚。",
      "哈哈，我也想你了！最近确实有点忙，但我们很快就能见面了，到时候有说不完的话。",
      "是啊，这段时间确实被工作缠身了，但我一直记得你。等我稍微闲一点，咱们约起来！"
    ],
    "modelUsed": "deepseek-chat",
    "generatedTime": 1234
  }
}
```

#### 获取历史记录
```
GET /api/reply/history?page=1&size=10
Authorization: Bearer {token}

Response:
{
  "code": 200,
  "message": "获取成功",
  "data": [
    {
      "id": "uuid",
      "userId": "user_uuid",
      "chatContent": "你最近怎么样？",
      "roleBackground": "朋友",
      "userIntent": "我想表达歉意",
      "modelUsed": "deepseek-chat",
      "isFavorite": 0,
      "createTime": "2024-03-03T10:00:00"
    }
  ]
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
    "userId": "user_uuid",
    "chatContent": "你最近怎么样？",
    "roleBackground": "朋友",
    "userIntent": "我想表达歉意",
    "modelUsed": "deepseek-chat",
    "isFavorite": 0,
    "createTime": "2024-03-03T10:00:00"
  }
}
```

#### 获取历史记录的回复建议
```
GET /api/reply/history/{historyId}/suggestions
Authorization: Bearer {token}

Response:
{
  "code": 200,
  "message": "获取成功",
  "data": [
    "我最近工作特别忙...",
    "哈哈，我也想你了！...",
    "是啊，这段时间确实被工作缠身了..."
  ]
}
```

#### 删除历史记录
```
DELETE /api/reply/history/{historyId}
Authorization: Bearer {token}

Response:
{
  "code": 200,
  "message": "删除成功",
  "data": null
}
```

#### 收藏/取消收藏历史记录
```
POST /api/reply/history/{historyId}/favorite
Authorization: Bearer {token}

Response:
{
  "code": 200,
  "message": "操作成功",
  "data": null
}
```

#### 获取收藏的历史记录
```
GET /api/reply/history/favorite
Authorization: Bearer {token}

Response:
{
  "code": 200,
  "message": "获取成功",
  "data": [
    {
      "id": "uuid",
      "userId": "user_uuid",
      "chatContent": "你最近怎么样？",
      "roleBackground": "朋友",
      "userIntent": "我想表达歉意",
      "modelUsed": "deepseek-chat",
      "isFavorite": 1,
      "createTime": "2024-03-03T10:00:00"
    }
  ]
}
```

## 数据库设计

### 用户表 (user)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | VARCHAR(36) | 用户唯一标识符 |
| username | VARCHAR(50) | 用户名 |
| password | VARCHAR(255) | 加密密码 |
| email | VARCHAR(100) | 邮箱 |
| phone | VARCHAR(20) | 手机号 |
| avatar_url | VARCHAR(500) | 头像 URL |
| nickname | VARCHAR(100) | 昵称 |
| status | TINYINT | 状态 (1-正常, 0-禁用) |
| create_time | DATETIME | 创建时间 |
| update_time | DATETIME | 更新时间 |

### 会话历史表 (history)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | VARCHAR(36) | 会话唯一标识符 |
| user_id | VARCHAR(36) | 用户 ID |
| chat_content | TEXT | 对方聊天内容 |
| role_background | VARCHAR(100) | 角色背景 |
| user_intent | TEXT | 用户真实意图 |
| model_used | VARCHAR(50) | 使用的 AI 模型 |
| status | TINYINT | 状态 (1-正常, 0-已删除) |
| is_favorite | TINYINT | 是否收藏 |
| create_time | DATETIME | 创建时间 |
| update_time | DATETIME | 更新时间 |

### 回复建议表 (reply_suggestion)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | VARCHAR(36) | 回复建议唯一标识符 |
| history_id | VARCHAR(36) | 关联的会话历史 ID |
| suggestion_text | TEXT | AI 生成的回复文本 |
| order_index | INT | 排序索引 |
| is_selected | TINYINT | 是否被选中 |
| create_time | DATETIME | 创建时间 |

## 环境变量配置

| 变量名 | 说明 | 示例 |
|--------|------|------|
| DEEPSEEK_API_KEY | DeepSeek API Key | sk-xxxxx |
| MYSQL_HOST | MySQL 主机 | localhost |
| MYSQL_PORT | MySQL 端口 | 3306 |
| MYSQL_DATABASE | 数据库名 | high_eq_db |
| MYSQL_USER | MySQL 用户 | root |
| MYSQL_PASSWORD | MySQL 密码 | password |
| JWT_SECRET | JWT 密钥 | your-secret-key |
| JWT_EXPIRATION | Token 过期时间（毫秒） | 86400000 |

## 部署指南

### Docker 部署

1. **创建 Dockerfile**
   ```dockerfile
   FROM openjdk:17-jdk-slim
   COPY target/high-eq-reply-1.0.0.jar app.jar
   ENTRYPOINT ["java", "-jar", "/app.jar"]
   ```

2. **构建镜像**
   ```bash
   docker build -t high-eq-backend:1.0.0 .
   ```

3. **运行容器**
   ```bash
   docker run -d \
     -p 8080:8080 \
     -e DEEPSEEK_API_KEY=your_api_key \
     -e MYSQL_HOST=mysql_host \
     -e MYSQL_USER=root \
     -e MYSQL_PASSWORD=password \
     high-eq-backend:1.0.0
   ```

### 云服务器部署

1. **上传 JAR 文件到服务器**
   ```bash
   scp target/high-eq-reply-1.0.0.jar user@server:/path/to/app/
   ```

2. **在服务器上运行**
   ```bash
   java -jar /path/to/app/high-eq-reply-1.0.0.jar
   ```

3. **使用 systemd 管理服务**
   创建 `/etc/systemd/system/high-eq-backend.service`：
   ```ini
   [Unit]
   Description=HighEQ Backend Service
   After=network.target
   
   [Service]
   Type=simple
   User=app
   WorkingDirectory=/path/to/app
   ExecStart=/usr/bin/java -jar /path/to/app/high-eq-reply-1.0.0.jar
   Restart=always
   RestartSec=10
   
   [Install]
   WantedBy=multi-user.target
   ```

   启动服务：
   ```bash
   sudo systemctl start high-eq-backend
   sudo systemctl enable high-eq-backend
   ```

## 常见问题

### Q: 如何修改数据库连接信息？
A: 编辑 `application.yml` 中的 `spring.datasource` 配置，或者通过环境变量覆盖。

### Q: 如何获取 DeepSeek API Key？
A: 访问 [DeepSeek 官网](https://api-docs.deepseek.com) 注册账号并获取 API Key。

### Q: 如何处理 CORS 问题？
A: 在控制器上添加 `@CrossOrigin` 注解，或者在 Spring Security 配置中配置 CORS。

### Q: 如何扩展新的 AI 模型支持？
A: 在 `AiService` 中添加新的模型调用方法，并在配置文件中添加相应的配置。

## 许可证

MIT License

## 联系方式

如有问题或建议，欢迎提交 Issue 或 Pull Request。
