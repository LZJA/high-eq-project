#!/bin/bash
# 后端服务快速重启脚本（不重新构建）

cd "$(dirname "$0")"

# 使用 .env.production 文件重启
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --force-recreate backend

echo "后端服务已重启"
