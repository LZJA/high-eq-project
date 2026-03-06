#!/bin/bash
# 后端生产环境启动脚本
# 用途：使用 .env.production 配置文件启动后端服务

cd "$(dirname "$0")"

# 使用 .env.production 文件启动
docker compose -f docker-compose.prod.yml --env-file .env.production down
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build

echo "后端服务已启动"
echo "查看日志: docker compose -f docker-compose.prod.yml --env-file .env.production logs -f backend"
