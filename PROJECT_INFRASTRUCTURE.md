# 高情商回复生成助手 - 项目基础设施文档

## 项目概述

这是一个完整的前后端分离项目，用于帮助用户生成高情商的聊天回复。项目包括：

- **前端**: React 18 + Vite + TypeScript + Tailwind CSS
- **后端**: Java 17 + Spring Boot 3 + MyBatis-Plus + MySQL 8
- **AI 服务**: DeepSeek API 集成
- **认证**: JWT Token 认证

## 项目结构

```
/home/ubuntu/
├── high-eq-solution-site/          # 前端项目（展示网站）
│   ├── client/
│   │   ├── src/
│   │   │   ├── pages/              # 页面组件
│   │   │   ├── components/         # 可复用组件
│   │   │   ├── contexts/           # React Context
│   │   │   ├── lib/                # 工具库和 API 客户端
│   │   │   ├── App.tsx             # 应用主组件
│   │   │   └── index.css           # 全局样式
│   │   ├── public/                 # 静态资源
│   │   └── index.html              # HTML 入口
│   ├── package.json
│   └── vite.config.ts
│
└── high-eq-backend/                # 后端项目
    ├── src/
    │   ├── main/
    │   │   ├── java/com/highiq/
    │   │   │   ├── controller/      # REST API 控制器
    │   │   │   ├── service/         # 业务逻辑服务
    │   │   │   ├── entity/          # 数据库实体
    │   │   │   ├── mapper/          # MyBatis Mapper
    │   │   │   ├── dto/             # 数据传输对象
    │   │   │   ├── util/            # 工具类
    │   │   │   ├── exception/       # 异常处理
    │   │   │   └── HighEqApplication.java
    │   │   └── resources/
    │   │       ├── application.yml  # 应用配置
    │   │       └── db/
    │   │           └── init.sql     # 数据库初始化脚本
    │   └── test/                    # 测试代码
    ├── pom.xml                      # Maven 配置
    └── README.md                    # 后端文档
```

## 核心功能模块

### 1. 用户认证模块

**功能**:
- 用户注册（用户名、密码、邮箱、手机号）
- 用户登录（用户名/邮箱 + 密码）
- JWT Token 生成和验证
- Token 刷新机制

**相关文件**:
- 后端: `AuthController`, `UserService`, `JwtUtil`, `PasswordUtil`
- 前端: `AuthContext`, `api.ts` (authAPI)

**API 端点**:
```
POST   /api/auth/register      # 注册
POST   /api/auth/login         # 登录
POST   /api/auth/refresh       # 刷新 Token
GET    /api/auth/me            # 获取当前用户信息
```

### 2. 回复生成模块

**功能**:
- 调用 DeepSeek AI 生成高情商回复
- 保存生成历史到数据库
- 支持多个回复建议
- 支持不同的 AI 模型选择

**相关文件**:
- 后端: `ReplyController`, `ReplyService`, `AiService`
- 前端: `api.ts` (replyAPI)

**API 端点**:
```
POST   /api/reply/generate                    # 生成回复
GET    /api/reply/history                     # 获取历史记录列表
GET    /api/reply/history/{historyId}         # 获取历史记录详情
GET    /api/reply/history/{historyId}/suggestions  # 获取回复建议
DELETE /api/reply/history/{historyId}         # 删除历史记录
POST   /api/reply/history/{historyId}/favorite    # 收藏/取消收藏
GET    /api/reply/history/favorite            # 获取收藏列表
```

### 3. 历史记录管理模块

**功能**:
- 保存用户的聊天记录和 AI 生成的回复
- 支持分页查询
- 支持收藏和删除
- 支持按创建时间排序

**相关文件**:
- 后端: `History`, `HistoryMapper`, `ReplyService`
- 数据库: `history`, `reply_suggestion` 表

### 4. 角色背景管理模块

**功能**:
- 提供预设角色（同事、朋友、家人、领导等）
- 支持用户自定义角色
- 帮助 AI 生成更符合场景的回复

**相关文件**:
- 后端: `PresetRole`, `CustomRole` 实体
- 数据库: `preset_role`, `custom_role` 表

## 数据库设计

### 用户表 (user)

```sql
CREATE TABLE user (
  id VARCHAR(36) PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(100) UNIQUE,
  phone VARCHAR(20) UNIQUE,
  avatar_url VARCHAR(500),
  nickname VARCHAR(100),
  status TINYINT DEFAULT 1,
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 会话历史表 (history)

```sql
CREATE TABLE history (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  chat_content TEXT NOT NULL,
  role_background VARCHAR(100) NOT NULL,
  user_intent TEXT NOT NULL,
  model_used VARCHAR(50) NOT NULL DEFAULT 'deepseek-chat',
  status TINYINT DEFAULT 1,
  is_favorite TINYINT DEFAULT 0,
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);
```

### 回复建议表 (reply_suggestion)

```sql
CREATE TABLE reply_suggestion (
  id VARCHAR(36) PRIMARY KEY,
  history_id VARCHAR(36) NOT NULL,
  suggestion_text TEXT NOT NULL,
  order_index INT NOT NULL,
  is_selected TINYINT DEFAULT 0,
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (history_id) REFERENCES history(id) ON DELETE CASCADE
);
```

## 前端应用架构

### 页面结构

1. **首页 (Home)** - 展示网站信息和技术方案
2. **登录页 (Login)** - 用户登录
3. **注册页 (Register)** - 用户注册
4. **主应用页 (App)** - 核心功能页面
   - 聊天内容输入
   - 角色背景选择
   - 个人意图输入
   - AI 回复展示
5. **历史记录页 (History)** - 查看历史记录
6. **收藏页 (Favorites)** - 查看收藏的回复

### 状态管理

使用 React Context API 管理全局状态：
- `AuthContext` - 用户认证状态
- 可选：使用 Zustand 或 Redux 进行更复杂的状态管理

### API 集成

通过 `api.ts` 文件提供的 API 客户端与后端通信：
- `authAPI` - 认证相关接口
- `replyAPI` - 回复生成相关接口

## 后端应用架构

### 分层设计

1. **Controller 层** - 处理 HTTP 请求和响应
2. **Service 层** - 实现业务逻辑
3. **Mapper 层** - 数据库访问（MyBatis-Plus）
4. **Entity 层** - 数据库实体
5. **DTO 层** - 数据传输对象
6. **Util 层** - 工具类（JWT、密码加密等）

### 关键服务

- `UserService` - 用户管理（注册、登录、信息更新）
- `ReplyService` - 回复生成和历史管理
- `AiService` - AI 模型调用（DeepSeek）

## 部署指南

### 前端部署

1. **开发环境**
   ```bash
   cd /home/ubuntu/high-eq-solution-site
   pnpm install
   pnpm dev
   ```

2. **生产构建**
   ```bash
   pnpm build
   # 输出在 dist 目录
   ```

3. **部署到服务器**
   - 使用 Nginx 作为静态文件服务器
   - 配置反向代理指向后端 API

### 后端部署

1. **开发环境**
   ```bash
   cd /home/ubuntu/high-eq-backend
   mvn clean package
   java -jar target/high-eq-reply-1.0.0.jar
   ```

2. **Docker 部署**
   ```bash
   docker build -t high-eq-backend:1.0.0 .
   docker run -d -p 8080:8080 \
     -e DEEPSEEK_API_KEY=your_key \
     -e MYSQL_HOST=mysql_host \
     high-eq-backend:1.0.0
   ```

3. **云服务器部署**
   - 上传 JAR 文件到服务器
   - 使用 systemd 管理服务
   - 配置 Nginx 反向代理

## 环境变量配置

### 前端环境变量 (.env)

```
REACT_APP_API_URL=http://localhost:8080/api
REACT_APP_ENV=development
```

### 后端环境变量 (application.yml)

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/high_eq_db
    username: root
    password: root

ai:
  deepseek:
    api-key: your_deepseek_api_key
    api-url: https://api.deepseek.com/v1
    model: deepseek-chat
```

## 开发流程

### 1. 本地开发

```bash
# 启动 MySQL
docker run -d -p 3306:3306 -e MYSQL_ROOT_PASSWORD=root mysql:8.0

# 初始化数据库
mysql -u root -p < high-eq-backend/src/main/resources/db/init.sql

# 启动后端
cd high-eq-backend
mvn spring-boot:run

# 启动前端
cd high-eq-solution-site
pnpm dev
```

### 2. API 测试

使用 Postman 或 curl 测试 API：

```bash
# 注册
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123",
    "email": "test@example.com"
  }'

# 登录
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }'

# 生成回复
curl -X POST http://localhost:8080/api/reply/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "chatContent": "你最近怎么样？",
    "roleBackground": "朋友",
    "userIntent": "我想表达歉意"
  }'
```

### 3. 前端集成

在 React 组件中使用 API：

```typescript
import { useAuth } from '@/contexts/AuthContext';
import { replyAPI } from '@/lib/api';

export function ReplyGenerator() {
  const { user } = useAuth();
  
  const handleGenerateReplies = async () => {
    try {
      const response = await replyAPI.generateReplies({
        chatContent: '你最近怎么样？',
        roleBackground: '朋友',
        userIntent: '我想表达歉意',
      });
      console.log(response.data.suggestions);
    } catch (error) {
      console.error('生成回复失败:', error);
    }
  };
  
  return <button onClick={handleGenerateReplies}>生成回复</button>;
}
```

## 安全性考虑

1. **密码加密** - 使用 BCrypt 加密用户密码
2. **JWT Token** - 使用 JWT 进行用户认证
3. **CORS 配置** - 配置允许的跨域请求来源
4. **API 验证** - 所有 API 端点都需要有效的 Token
5. **SQL 注入防护** - 使用 MyBatis-Plus 的参数化查询
6. **敏感信息** - API Key 和数据库密码通过环境变量管理

## 性能优化

1. **数据库索引** - 在常用查询字段上创建索引
2. **缓存策略** - 使用 Redis 缓存热点数据
3. **分页查询** - 历史记录使用分页加载
4. **异步处理** - AI 调用使用异步处理
5. **CDN 加速** - 前端静态资源使用 CDN

## 常见问题

### Q: 如何修改 AI 模型？
A: 编辑 `application.yml` 中的 `ai.deepseek.model` 配置，或在 API 请求中指定 `modelPreference`。

### Q: 如何处理 API 超时？
A: 调整 `application.yml` 中的超时配置，或在 `AiService` 中增加重试逻辑。

### Q: 如何扩展新的功能模块？
A: 按照现有的分层架构（Controller -> Service -> Mapper -> Entity）添加新的功能。

### Q: 如何处理并发请求？
A: 使用 Spring 的 `@Async` 注解进行异步处理，或配置线程池。

## 下一步计划

1. **前端页面完善**
   - 实现登录/注册页面
   - 实现主应用页面
   - 实现历史记录页面

2. **后端功能扩展**
   - 添加用户信息更新接口
   - 添加自定义角色管理接口
   - 添加数据统计接口

3. **测试和优化**
   - 编写单元测试
   - 编写集成测试
   - 性能测试和优化

4. **部署和运维**
   - 配置 CI/CD 流程
   - 设置监控和日志
   - 配置自动备份

## 参考资源

- [Spring Boot 官方文档](https://spring.io/projects/spring-boot)
- [MyBatis-Plus 文档](https://baomidou.com/)
- [React 官方文档](https://react.dev)
- [Vite 官方文档](https://vitejs.dev)
- [DeepSeek API 文档](https://api-docs.deepseek.com)

## 许可证

MIT License

## 联系方式

如有问题或建议，欢迎提交 Issue 或 Pull Request。
