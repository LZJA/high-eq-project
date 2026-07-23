#!/bin/bash

# 高情商回复助手 - 前端构建和部署脚本
# 将前端构建产物部署到 Nginx 目录

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 函数：打印带颜色的消息
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# 检查是否为 root 用户
if [ "$EUID" -ne 0 ]; then
    print_error "请使用 root 用户或 sudo 运行此脚本"
    exit 1
fi

# 配置
PROJECT_DIR="/opt/high-eq-project"
FRONTEND_DIR="$PROJECT_DIR/high-eq-front"
NGINX_WEB_ROOT="/var/www/high-eq-front"
BUILD_CACHE_DIR="$FRONTEND_DIR/.cache"

print_step "开始部署前端..."
echo ""
print_info "项目目录: $PROJECT_DIR"
print_info "前端目录: $FRONTEND_DIR"
print_info "Nginx 目录: $NGINX_WEB_ROOT"
echo ""

# 1. 检查 Node.js 和 pnpm
print_step "检查构建环境..."

if ! command -v node &> /dev/null; then
    print_error "Node.js 未安装"
    echo "请先安装 Node.js: curl -fsSL https://deb.nodesource.com/setup_lts.x | bash - && apt install -y nodejs"
    exit 1
fi

print_info "Node.js 版本: $(node -v)"

if ! command -v pnpm &> /dev/null; then
    print_warn "pnpm 未安装，正在安装..."
    npm install -g pnpm
fi

print_info "pnpm 版本: $(pnpm -v)"
echo ""

# 2. 进入前端目录
cd "$FRONTEND_DIR"

# 3. 安装依赖（如果需要）
if [ ! -d "node_modules" ] || [ "package.json" -nt "node_modules/.pnpm/lockfile" ]; then
    print_step "安装依赖..."
    pnpm install --frozen-lockfile
    echo ""
fi

# 4. 构建前端
print_step "构建前端..."
pnpm build
echo ""

# 检查构建产物
if [ ! -d "dist" ]; then
    print_error "构建失败，dist 目录不存在"
    exit 1
fi

print_info "构建产物大小: $(du -sh dist | cut -f1)"
echo ""

# 5. 创建 Nginx 目录
print_step "配置 Nginx 目录..."
mkdir -p "$NGINX_WEB_ROOT"
chown -R www-data:www-data "$NGINX_WEB_ROOT" 2>/dev/null || chown -R nginx:nginx "$NGINX_WEB_ROOT"
echo ""

# 6. 备份现有文件（如果存在）
if [ -d "$NGINX_WEB_ROOT" ] && [ "$(ls -A $NGINX_WEB_ROOT)" ]; then
    print_step "备份现有文件..."
    BACKUP_DIR="$NGINX_WEB_ROOT.backup.$(date +%Y%m%d_%H%M%S)"
    cp -r "$NGINX_WEB_ROOT" "$BACKUP_DIR"
    print_info "备份到: $BACKUP_DIR"
    echo ""
fi

# 7. 部署新文件
print_step "部署构建产物..."
# 清空目标目录但保留 .gitkeep 等文件
find "$NGINX_WEB_ROOT" -mindepth 1 -delete

# 复制构建产物
cp -r dist/* "$NGINX_WEB_ROOT/"

# 设置权限
chown -R www-data:www-data "$NGINX_WEB_ROOT" 2>/dev/null || chown -R nginx:nginx "$NGINX_WEB_ROOT"
chmod -R 755 "$NGINX_WEB_ROOT"

print_info "文件已部署到: $NGINX_WEB_ROOT"
echo ""

# 8. 配置 Nginx（如果需要）
if [ ! -f "/etc/nginx/sites-available/high-eq-front" ]; then
    print_step "配置 Nginx..."

    if [ -f "$PROJECT_DIR/deployment/nginx-front.conf" ]; then
        cp "$PROJECT_DIR/deployment/nginx-front.conf" /etc/nginx/sites-available/high-eq-front
        print_info "Nginx 配置文件已复制"
    else
        print_warn "Nginx 配置文件不存在: $PROJECT_DIR/deployment/nginx-front.conf"
    fi

    # 启用配置
    ln -sf /etc/nginx/sites-available/high-eq-front /etc/nginx/sites-enabled/

    # 测试配置
    nginx -t
    echo ""
fi

# 9. 重载 Nginx
print_step "重载 Nginx..."
nginx -s reload
print_info "Nginx 已重载"
echo ""

# 10. 清理构建缓存（可选）
print_step "清理构建缓存..."
if [ -d "$BUILD_CACHE_DIR" ]; then
    rm -rf "$BUILD_CACHE_DIR"
    print_info "缓存已清理"
fi

# 11. 显示部署结果
print_step "部署完成！"
echo ""
print_info "访问地址:"
echo "  - HTTP:  http://higheq.top"
echo "  - HTTPS: https://higheq.top"
echo ""
print_info "管理命令:"
echo "  - 查看日志: tail -f /var/log/nginx/high-eq-front-*.log"
echo "  - 重启 Nginx: systemctl reload nginx"
echo "  - 查看状态: systemctl status nginx"
echo ""

# 显示文件列表
print_info "部署的文件:"
ls -lh "$NGINX_WEB_ROOT" | head -20
