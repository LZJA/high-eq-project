#!/bin/bash

# ========================================
# HighEQ 后端启动脚本
# ========================================

echo "🚀 启动 HighEQ 后端服务..."

# 检查 .env 文件是否存在
if [ ! -f .env ]; then
    echo "⚠️  警告: .env 文件不存在！"
    echo ""
    echo "请先创建 .env 文件："
    echo "  cp .env.example .env"
    echo "  然后编辑 .env 文件，填入真实的配置值"
    echo ""
    exit 1
fi

echo "✅ 配置文件检查通过"
echo ""

# 检查 Java 版本
echo "📋 检查 Java 版本..."
java -version

echo ""
echo "🔧 使用 Maven 启动服务..."
echo ""

# 使用 Spring Boot Maven 插件启动
mvn spring-boot:run
