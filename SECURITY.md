# 安全配置指南

本文档说明如何安全地配置项目，避免敏感信息泄露。

## 🚨 重要安全提示

**切勿将以下文件提交到 Git 仓库：**
- `application.yml` - 包含数据库密码、JWT 密钥、API Key
- `.env` - 包含环境变量
- 任何包含 `.key` 或 `.pem` 扩展名的文件

## 配置步骤

### 1. 后端配置

#### 方式一：环境变量（推荐 - 生产环境）

创建环境变量文件（不提交到 Git）：

**Linux/Mac (`~/.bashrc` 或 `~/.zshrc`)：**
```bash
export MYSQL_USER=root
export MYSQL_PASSWORD=your_password
export JWT_SECRET=your-secret-key-at-least-32-characters-long
export DEEPSEEK_API_KEY=sk-your-actual-api-key
```

**Windows (系统环境变量)：**
```
MYSQL_USER=root
MYSQL_PASSWORD=your_password
JWT_SECRET=your-secret-key-at-least-32-characters-long
DEEPSEEK_API_KEY=sk-your-actual-api-key
```

#### 方式二：本地配置文件

1. 复制示例配置文件：
```bash
cp high-eq-backend/application.yml.example high-eq-backend/src/main/resources/application.yml
```

2. 编辑 `application.yml`，填入真实配置值：
```yaml
spring:
  datasource:
    username: root
    password: your_mysql_password

jwt:
  secret: your-secret-key-at-least-32-characters-long

ai:
  deepseek:
    api-key: sk-your-actual-deepseek-api-key
```

### 2. 前端配置

1. 复制示例环境文件：
```bash
cp high-eq-front/.env.example high-eq-front/.env
```

2. 如需自定义后端地址，编辑 `.env`：
```bash
VITE_API_URL=http://localhost:8080/api
```

## .gitignore 说明

项目已在以下位置配置 .gitignore：

### 项目根目录 `.gitignore`
忽略后端配置文件和构建产物

### 后端 `.gitignore` (`high-eq-backend/.gitignore`)
- `application.yml` - 敏感配置
- `target/` - 构建输出
- `logs/` - 日志文件

### 前端 `.gitignore` (`high-eq-front/.gitignore`)
- `.env*` - 环境变量（除了 `.env.example`）
- `node_modules/` - 依赖包
- `dist/` - 构建输出

## 安全最佳实践

### 1. JWT Secret 生成

生成强随机密钥：

```bash
# Linux/Mac
openssl rand -base64 32

# 或使用 Python
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

### 2. API Key 管理

- ✅ 使用环境变量存储 API Key
- ✅ 定期轮换 API Key
- ❌ 不要在代码中硬编码 API Key
- ❌ 不要将 API Key 提交到版本控制
- ❌ 不要在客户端代码中暴露 API Key

### 3. 数据库密码

- ✅ 使用强密码（包含大小写字母、数字、特殊字符）
- ✅ 生产环境使用独立数据库用户，不要使用 root
- ✅ 限制数据库用户权限

### 4. 生产环境部署

#### Docker 部署
使用 Docker Secrets 或环境变量：

```yaml
# docker-compose.yml
services:
  backend:
    environment:
      - DEEPSEEK_API_KEY=${DEEPSEEK_API_KEY}
      - JWT_SECRET=${JWT_SECRET}
    env_file:
      - .env
```

#### 云服务部署
使用云平台提供的密钥管理服务：
- AWS Secrets Manager
- Azure Key Vault
- Google Secret Manager

## 检查敏感信息泄露

在提交代码前，检查是否包含敏感信息：

```bash
# 搜索可能包含敏感信息的文件
grep -r "sk-" . --exclude-dir=node_modules --exclude-dir=target
grep -r "password" . --exclude-dir=node_modules --exclude-dir=target
grep -r "secret" . --exclude-dir=node_modules --exclude-dir=target
```

## 已提交敏感信息怎么办？

如果已将敏感信息提交到 Git：

1. **立即修改**：更改所有泄露的密码和 API Key
2. **清理历史**：使用 git-filter-repo 或 BFG Repo-Cleaner
3. **强制推送**：清理后强制推送（谨慎操作）

```bash
# 更改所有泄露的密钥后，从 Git 历史中移除
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch src/main/resources/application.yml" \
  --prune-empty --tag-name-filter cat -- --all

# 强制推送（谨慎！）
git push origin --force --all
```

## 常见问题

### Q: 为什么 application.yml 变更一直显示？
A: 该文件已被 .gitignore 忽略，但可能之前已添加到暂存区。运行：
```bash
git rm --cached high-eq-backend/src/main/resources/application.yml
```

### Q: 如何在不同环境使用不同配置？
A: 使用 Spring Profile：
```bash
# 开发环境
java -jar app.jar --spring.profiles.active=dev

# 生产环境
java -jar app.jar --spring.profiles.active=prod
```

### Q: 团队协作如何同步配置模板？
A: 提交 `application.yml.example` 或 `application.yml.template`，不提交实际配置。

## 联系方式

如有安全问题，请通过 Issue 联系项目维护者。
