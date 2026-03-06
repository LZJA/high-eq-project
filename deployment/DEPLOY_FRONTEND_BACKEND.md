# 📦 前后端一体部署指南

> 本指南适用于前端和后端在同一目录下的项目部署。

## 📁 项目目录结构

```
high-eq-project/              # 项目根目录
├── high-eq-backend/          # 后端目录
│   ├── src/                 # 源代码
│   ├── .env.production      # 生产环境配置
│   ├── Dockerfile           # Docker 镜像
│   └── docker-compose.prod.yml  # Docker 编排
├── high-eq-front/           # 前端目录
│   ├── client/              # 源代码
│   ├── .env.production      # 生产环境配置
│   └── dist/                # 构建产物（生成）
└── deployment/             # 部署脚本
    ├── deploy-all.sh        # ⭐ 一键部署（前端+后端）
    ├── deploy-frontend.sh   # 前端单独部署
    ├── deploy-production.sh # 后端单独部署
    └── nginx-*.conf         # Nginx 配置
```

## 🚀 部署方式对比

### 方式一：一键部署（推荐）

**适用场景**：第一次部署或完整重新部署

```bash
# 部署前端和后端
sudo ./deployment/deploy-all.sh higheq.top api.higheq.top your@email.com
```

**自动完成**：
- ✅ 检查环境
- ✅ 配置防火墙
- ✅ 获取 SSL 证书（两个域名）
- ✅ 配置 Nginx（两个站点）
- ✅ 构建前端
- ✅ 部署前端到 Nginx
- ✅ 启动后端 Docker 服务
- ✅ 配置自动备份

### 方式二：分别部署

**适用场景**：只更新前端或只更新后端

#### 只更新前端
```bash
# 1. 本地构建前端
cd high-eq-front
pnpm build

# 2. 上传到服务器
scp -r dist/* root@your-server:/var/www/high-eq-front/

# 或使用部署脚本
sudo ./deployment/deploy-frontend.sh
```

#### 只更新后端
```bash
# 1. 上传代码到服务器
# 2. 在服务器上使用启动脚本（推荐）
cd /opt/high-eq-project/high-eq-backend
./start-prod.sh

# 或使用快速重启脚本（不重新构建）
./restart-prod.sh

# 或手动启动（指定环境文件）
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

> **重要**: 后端启动必须使用 `--env-file .env.production` 参数，否则不会加载生产环境配置（如CORS_ALLOWED_ORIGINS）。

## 📋 服务器目录结构

部署后的服务器目录：

```
服务器
├── /opt/high-eq-project/          # 项目代码
│   ├── high-eq-backend/           # 后端
│   │   ├── .env.production        # 后端配置
│   │   ├── docker-compose.prod.yml
│   │   └── target/                # JAR 包
│   └── high-eq-front/             # 前端源码
│       ├── .env.production        # 前端配置
│       ├── node_modules/          # 依赖
│       └── dist/                  # 构建产物
│
├── /var/www/high-eq-front/        # Nginx 托管的前端文件
│   ├── index.html
│   ├── assets/
│   └── ...
│
├── /etc/nginx/sites-available/    # Nginx 配置
│   ├── high-eq-front             # 前端配置
│   └── high-eq-backend            # 后端配置
│
└── /opt/backups/                  # 数据库备份
    └── db_*.sql.gz
```

## 🔧 部署脚本说明

### deploy-all.sh - 完整部署脚本

```bash
# 使用方法
sudo ./deployment/deploy-all.sh <前端域名> <后端域名> <邮箱> [Git仓库]

# 示例
sudo ./deployment/deploy-all.sh higheq.top api.higheq.top admin@example.com
sudo ./deployment/deploy-all.sh higheq.top api.higheq.top admin@example.com https://github.com/user/repo.git
```

**功能**：
1. 检查系统环境（Docker、Node.js、Nginx）
2. 配置防火墙规则
3. 克隆/更新代码
4. 配置后端环境变量
5. 配置前端环境变量
6. 为两个域名申请 SSL 证书
7. 配置两个 Nginx 虚拟主机
8. 构建前端
9. 部署前端到 Nginx
10. 启动后端 Docker 服务
11. 配置数据库自动备份

### deploy-frontend.sh - 前端部署脚本

```bash
# 使用方法
sudo ./deployment/deploy-frontend.sh
```

**功能**：
1. 检查 Node.js 和 pnpm
2. 安装前端依赖
3. 构建前端生产版本
4. 部署到 Nginx 目录
5. 配置 Nginx（如果需要）
6. 重载 Nginx

### deploy-production.sh - 后端部署脚本

```bash
# 使用方法
sudo ./deployment/deploy-production.sh <后端域名> <邮箱> [Git仓库]

# 示例
sudo ./deployment/deploy-production.sh api.higheq.top admin@example.com
```

**功能**：
1. 检查 Docker 环境
2. 配置后端环境变量
3. 获取 SSL 证书
4. 配置 Nginx 反向代理
5. 启动 Docker 服务
6. 配置自动备份

## ⚙️ 配置文件说明

### 前端配置：high-eq-front/.env.production

```bash
# API 地址（指向后端域名）
VITE_API_URL=https://api.higheq.top/api
```

### 后端配置：high-eq-backend/.env.production

```bash
# 数据库配置
MYSQL_USER=higheq
MYSQL_PASSWORD=生成的密码
MYSQL_ROOT_PASSWORD=生成的密码
MYSQL_DATABASE=higheq

# JWT 配置
JWT_SECRET=生成的密钥

# AI 配置
DEEPSEEK_API_KEY=你的API密钥

# CORS 配置（允许的前端域名）
# 包含域名和IP地址（备案前临时使用IP）
CORS_ALLOWED_ORIGINS=https://higheq.top,https://www.higheq.top,https://api.higheq.top,http://8.136.193.199,https://8.136.193.199
```

> **注意**: 启动后端时必须使用 `--env-file .env.production` 参数，否则CORS配置不会生效。

## 🔄 部署流程

### 第一次部署

```bash
# 1. 上传代码到服务器
scp -r high-eq-project root@your-server:/opt/

# 2. 连接服务器
ssh root@your-server

# 3. 进入项目目录
cd /opt/high-eq-project

# 4. 运行一键部署
sudo ./deployment/deploy-all.sh higheq.top api.higheq.top your@email.com
```

### 更新部署

```bash
# 方式 A：使用 Git 更新
cd /opt/high-eq-project
sudo git pull
sudo ./deployment/deploy-all.sh higheq.top api.higheq.top your@email.com

# 方式 B：手动更新代码后重新部署
# 1. 本地构建前端
cd high-eq-front
pnpm build

# 2. 上传前端构建产物
scp -r high-eq-front/dist/* root@your-server:/var/www/high-eq-front/

# 3. 重启后端（如果需要）
ssh root@your-server "cd /opt/high-eq-project/high-eq-backend && sudo docker-compose -f docker-compose.prod.yml restart"
```

## 📊 网络架构

```
用户浏览器
    │
    ├─ https://higheq.top (前端页面)
    │         ↓
    │    Nginx (静态文件)
    │    /var/www/high-eq-front/
    │
    └─ https://api.higheq.top/api/* (API 请求)
              ↓
         Nginx (反向代理)
              ↓
        后端服务 (Docker)
        localhost:8080
```

## 🔍 故障排查

### 前端无法访问

```bash
# 检查 Nginx 配置
sudo nginx -t

# 检查前端文件
ls -la /var/www/high-eq-front/

# 查看 Nginx 日志
sudo tail -f /var/log/nginx/high-eq-front-error.log
```

### 后端 API 无法访问

```bash
# 检查 Docker 服务
cd /opt/high-eq-project/high-eq-backend
sudo docker-compose -f docker-compose.prod.yml ps

# 查看后端日志
sudo docker-compose -f docker-compose.prod.yml logs -f backend

# 测试本地连接
curl http://localhost:8080/api/actuator/health
```

### SSL 证书问题

```bash
# 检查证书状态
sudo certbot certificates

# 手动续期
sudo certbot renew

# 重新获取证书
sudo certbot certonly --webroot -w /var/www/certbot -d higheq.top
```

## 📞 获取帮助

- 查看 [BEGINNER_GUIDE.md](BEGINNER_GUIDE.md) - 完整部署指南
- 查看 [COMMANDS.md](COMMANDS.md) - 常用命令
- 查看 [CONFIG_CHECKLIST.md](CONFIG_CHECKLIST.md) - 配置清单
