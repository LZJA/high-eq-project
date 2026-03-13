# 后端启动修复说明

## 问题描述

Docker Compose 默认读取 `.env` 文件，而不是 `.env.production` 文件。
导致生产环境配置（特别是 `CORS_ALLOWED_ORIGINS`）无法被加载，引起跨域请求失败。

## 解决方案

使用 `--env-file` 参数指定环境文件：

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production up -d
```

## 新增脚本

### start-prod.sh - 完整启动脚本
```bash
cd /opt/high-eq-project/high-eq-backend
./start-prod.sh
```

功能：
- 停止旧容器
- 重新构建镜像
- 使用 `.env.production` 启动服务
- 显示日志

### restart-prod.sh - 快速重启脚本
```bash
cd /opt/high-eq-project/high-eq-backend
./restart-prod.sh
```

功能：
- 强制重新创建容器
- 使用 `.env.production` 配置
- 不重新构建镜像（更快）

## 使用方式

### 首次部署
```bash
./start-prod.sh
```

### 配置更新后重启
```bash
./restart-prod.sh
```

### 手动操作
```bash
cd /opt/high-eq-project/high-eq-backend

# 查看服务状态
docker compose -f docker-compose.prod.yml --env-file .env.production ps

# 查看日志
docker compose -f docker-compose.prod.yml --env-file .env.production logs -f backend

# 停止服务
docker compose -f docker-compose.prod.yml --env-file .env.production down
```

## 配置文件位置

- 本地: `high-eq-backend/.env.production`
- 服务器: `/opt/high-eq-project/high-eq-backend/.env.production`

## 备案前后配置切换

备案前（使用IP）:
```bash
CORS_ALLOWED_ORIGINS=https://higheq.top,https://www.higheq.top,http://8.136.193.199,https://8.136.193.199
```

备案后（使用域名）:
```bash
CORS_ALLOWED_ORIGINS=https://higheq.top,https://www.higheq.top
```

修改配置后执行 `./restart-prod.sh` 即可。
