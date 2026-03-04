#!/bin/bash

# ========================================
# HighEQ 前端启动脚本
# ========================================

echo "🚀 启动 HighEQ 前端服务..."

# 进入前端目录
cd "$(dirname "$0")"

# 检查 node_modules 是否存在
if [ ! -d "node_modules" ]; then
    echo "📦 首次运行，正在安装依赖..."
    pnpm install
fi

# 检查 .env 文件是否存在
if [ ! -f .env ]; then
    echo "⚠️  警告: .env 文件不存在，使用默认配置"
    echo "   如需自定义配置，请复制 .env.example 并修改"
fi

echo "✅ 准备就绪"
echo ""
echo "🌐 启动开发服务器..."
echo ""

# 启动 Vite 开发服务器
pnpm dev
