#!/bin/bash

# 高情商回复助手 - 完整部署脚本（前端 + 后端）
# 使用方法: ./deploy-all.sh <前端域名> <后端域名> <邮箱> [Git仓库地址]

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

# 显示使用说明
show_usage() {
    echo "高情商回复助手 - 完整部署脚本"
    echo ""
    echo "使用方法: $0 <前端域名> <后端域名> <邮箱> [Git仓库地址]"
    echo ""
    echo "参数说明:"
    echo "  前端域名   - 前端访问域名（如: higheq.top）"
    echo "  后端域名   - 后端 API 域名（如: api.higheq.top）"
    echo "  邮箱       - 用于 SSL 证书的邮箱"
    echo "  Git仓库地址 - 可选，代码仓库地址"
    echo ""
    echo "示例:"
    echo "  $0 higheq.top api.higheq.top admin@example.com"
    echo "  $0 higheq.top api.higheq.top admin@example.com https://github.com/user/repo.git"
    exit 1
}

# 检查参数
if [ $# -lt 3 ]; then
    show_usage
fi

FRONTEND_DOMAIN=$1
BACKEND_DOMAIN=$2
EMAIL=$3
GIT_REPO=${4:-""}
PROJECT_DIR="/opt/high-eq-project"
BACKEND_DIR="$PROJECT_DIR/high-eq-backend"
FRONTEND_DIR="$PROJECT_DIR/high-eq-front"

print_step "开始完整部署高情商回复助手..."
echo ""
print_info "配置信息:"
echo "  前端域名: $FRONTEND_DOMAIN"
echo "  后端域名: $BACKEND_DOMAIN"
echo "  邮箱: $EMAIL"
echo "  项目目录: $PROJECT_DIR"
if [ -n "$GIT_REPO" ]; then
    echo "  Git 仓库: $GIT_REPO"
fi
echo ""

# 检查是否为 root 用户
check_root() {
    if [ "$EUID" -ne 0 ]; then
        print_error "请使用 root 用户或 sudo 运行此脚本"
        exit 1
    fi
}

# 检查系统环境
check_system() {
    print_step "检查系统环境..."

    # 检测操作系统
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        print_info "操作系统: $PRETTY_NAME"
    elif [ -f /etc/redhat-release ]; then
        print_info "操作系统: $(cat /etc/redhat-release)"
    elif [ -f /etc/lsb-release ]; then
        print_info "操作系统: $(lsb_release -d | cut -f2)"
    else
        print_warn "无法检测操作系统类型，继续尝试..."
    fi

    # 检查是否为 Linux
    if [ "$(uname)" != "Linux" ]; then
        print_warn "此脚本设计用于 Linux 服务器"
        print_warn "当前系统: $(uname -s)"
        print_warn "如果在非 Linux 系统上运行，可能会出现问题"
        read -p "是否继续？(yes/no): " confirm
        if [ "$confirm" != "yes" ]; then
            exit 1
        fi
    fi

    # 检查 Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker 未安装，请先安装 Docker"
        echo "安装命令: curl -fsSL https://get.docker.com | sh"
        exit 1
    fi

    # 检查 Docker Compose
    if ! docker compose version &> /dev/null && ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose 未安装，请先安装 Docker Compose"
        exit 1
    fi

    # 检查 Nginx
    if ! command -v nginx &> /dev/null; then
        print_warn "Nginx 未安装，正在安装..."
        apt update && apt install -y nginx
    fi

    # 检查 Node.js
    if ! command -v node &> /dev/null; then
        print_warn "Node.js 未安装，正在安装..."
        curl -fsSL https://deb.nodesource.com/setup_lts.x | bash -
        apt install -y nodejs
    fi

    # 检查 pnpm
    if ! command -v pnpm &> /dev/null; then
        print_warn "pnpm 未安装，正在安装..."
        npm install -g pnpm
    fi

    # 检查 Git
    if ! command -v git &> /dev/null; then
        print_warn "Git 未安装，正在安装..."
        apt update && apt install -y git
    fi

    print_info "系统环境检查完成"
}

# 配置防火墙
configure_firewall() {
    print_step "配置防火墙..."

    if command -v ufw &> /dev/null; then
        print_info "配置 UFW 防火墙..."
        ufw allow 22/tcp
        ufw allow 80/tcp
        ufw allow 443/tcp
        # ufw --force enable  # 不自动启用，让用户手动决定
        print_info "防火墙规则已添加，请手动运行: ufw enable"
    elif command -v firewall-cmd &> /dev/null; then
        print_info "配置 firewalld 防火墙..."
        firewall-cmd --permanent --add-service=ssh
        firewall-cmd --permanent --add-service=http
        firewall-cmd --permanent --add-service=https
        firewall-cmd --reload
        print_info "防火墙规则已配置"
    else
        print_warn "未检测到防火墙，请手动配置端口开放"
    fi
}

# 克隆或更新代码
setup_code() {
    print_step "准备代码..."

    if [ -n "$GIT_REPO" ]; then
        # 从 Git 仓库克隆
        if [ -d "$PROJECT_DIR" ]; then
            print_info "更新代码..."
            cd "$PROJECT_DIR"
            git pull
        else
            print_info "克隆代码仓库..."
            mkdir -p "$PROJECT_DIR"
            git clone "$GIT_REPO" "$PROJECT_DIR"
        fi
    else
        # 使用本地代码
        if [ ! -d "$BACKEND_DIR" ]; then
            print_error "后端目录不存在: $BACKEND_DIR"
            print_info "请提供 Git 仓库地址或手动上传代码"
            exit 1
        fi
        if [ ! -d "$FRONTEND_DIR" ]; then
            print_error "前端目录不存在: $FRONTEND_DIR"
            print_info "请提供 Git 仓库地址或手动上传代码"
            exit 1
        fi
        print_info "使用本地代码..."
    fi

    print_info "代码准备完成"
}

# 配置后端环境变量
setup_backend_env() {
    print_step "配置后端环境变量..."

    cd "$BACKEND_DIR"

    # 生产环境使用 .env.production
    if [ ! -f .env.production ]; then
        if [ -f .env.production.example ]; then
            cp .env.production.example .env.production
        elif [ -f .env.example ]; then
            cp .env.example .env.production
        else
            print_error ".env.production.example 或 .env.example 文件不存在"
            exit 1
        fi
    fi

    # 生成随机密码
    MYSQL_PASSWORD=$(openssl rand -base64 16 | tr -d "=+/" | cut -c1-16)
    MYSQL_ROOT_PASSWORD=$(openssl rand -base64 16 | tr -d "=+/" | cut -c1-16)
    JWT_SECRET=$(openssl rand -base64 32 | tr -d "=+/")

    # 更新 .env.production 文件
    sed -i "s/MYSQL_PASSWORD=.*/MYSQL_PASSWORD=$MYSQL_PASSWORD/" .env.production
    sed -i "s/MYSQL_ROOT_PASSWORD=.*/MYSQL_ROOT_PASSWORD=$MYSQL_ROOT_PASSWORD/" .env.production
    sed -i "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" .env.production

    # 更新 CORS 配置
    if grep -q "CORS_ALLOWED_ORIGINS" .env.production; then
        sed -i "s|CORS_ALLOWED_ORIGINS=.*|CORS_ALLOWED_ORIGINS=https://$FRONTEND_DOMAIN,https://www.$FRONTEND_DOMAIN,https://$BACKEND_DOMAIN|" .env.production
    fi

    # 检查 DEEPSEEK_API_KEY
    if grep -q "DEEPSEEK_API_KEY=CHANGE_THIS" .env.production || grep -q "DEEPSEEK_API_KEY=sk-CHANGE_THIS" .env.production; then
        print_error "请在 .env.production 文件中配置 DEEPSEEK_API_KEY"
        print_info "你可以编辑文件: nano $BACKEND_DIR/.env.production"
        exit 1
    fi

    print_info "后端环境变量配置完成"
    print_warn "请保存以下信息:"
    echo "  MySQL 密码: $MYSQL_PASSWORD"
    echo "  MySQL Root 密码: $MYSQL_ROOT_PASSWORD"
    echo "  JWT 密钥: $JWT_SECRET"
    echo ""

    # 保存密码到文件（仅 root 可读）
    cat > /root/high-eq-credentials.txt << EOF
# 高情商回复助手 - 生产环境凭据
生成时间: $(date)

MySQL 密码: $MYSQL_PASSWORD
MySQL Root 密码: $MYSQL_ROOT_PASSWORD
JWT 密钥: $JWT_SECRET

⚠️  请妥善保管此文件，建议删除或移至安全位置
EOF
    chmod 600 /root/high-eq-credentials.txt
    print_info "凭据已保存到: /root/high-eq-credentials.txt"
    echo ""
}

# 配置前端环境变量
setup_frontend_env() {
    print_step "配置前端环境变量..."

    cd "$FRONTEND_DIR"

    # 创建或更新 .env.production
    if [ ! -f .env.production ]; then
        if [ -f .env.example ]; then
            cp .env.example .env.production
        fi
    fi

    # 更新 API 地址
    sed -i "s|VITE_API_URL=.*|VITE_API_URL=https://$BACKEND_DOMAIN/api|" .env.production

    print_info "前端环境变量配置完成"
    print_info "API 地址: https://$BACKEND_DOMAIN/api"
    echo ""
}

# 配置 SSL 证书
setup_ssl() {
    print_step "配置 SSL 证书..."

    # 安装 Certbot
    if ! command -v certbot &> /dev/null; then
        print_info "安装 Certbot..."
        apt update && apt install -y certbot
    fi

    # 创建验证目录
    mkdir -p /var/www/certbot
    chown -R www-data:www-data /var/www/certbot 2>/dev/null || chown -R nginx:nginx /var/www/certbot 2>/dev/null

    # 为前端域名申请证书
    print_info "为前端域名申请 SSL 证书: $FRONTEND_DOMAIN"
    certbot certonly --webroot \
        --webroot-path=/var/www/certbot \
        --email $EMAIL \
        --agree-tos \
        --no-eff-email \
        -d $FRONTEND_DOMAIN \
        -d www.$FRONTEND_DOMAIN || true

    # 为后端域名申请证书
    print_info "为后端域名申请 SSL 证书: $BACKEND_DOMAIN"
    certbot certonly --webroot \
        --webroot-path=/var/www/certbot \
        --email $EMAIL \
        --agree-tos \
        --no-eff-email \
        -d $BACKEND_DOMAIN || true

    # 配置自动续期
    cat > /usr/local/bin/renew-ssl.sh << 'EOF'
#!/bin/bash
certbot renew --quiet --no-self-upgrade
nginx -t && systemctl reload nginx
EOF
    chmod +x /usr/local/bin/renew-ssl.sh
    (crontab -l 2>/dev/null || true; echo "0 3 * * * /usr/local/bin/renew-ssl.sh >> /var/log/certbot-renew.log 2>&1") | crontab -

    print_info "SSL 证书配置完成"
}

# 配置 Nginx
setup_nginx() {
    print_step "配置 Nginx..."

    # 复制并配置前端 Nginx 配置
    if [ -f "$PROJECT_DIR/deployment/nginx-front.conf" ]; then
        sed "s/higheq.top/$FRONTEND_DOMAIN/g" "$PROJECT_DIR/deployment/nginx-front.conf" > /etc/nginx/sites-available/high-eq-front
    else
        # 创建基本配置
        cat > /etc/nginx/sites-available/high-eq-front << EOF
server {
    listen 80;
    server_name $FRONTEND_DOMAIN www.$FRONTEND_DOMAIN;
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $FRONTEND_DOMAIN www.$FRONTEND_DOMAIN;

    ssl_certificate /etc/letsencrypt/live/$FRONTEND_DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$FRONTEND_DOMAIN/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    root /var/www/high-eq-front;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF
    fi

    # 复制并配置后端 Nginx 配置
    if [ -f "$PROJECT_DIR/deployment/nginx.conf" ]; then
        sed "s/api.higheq.top/$BACKEND_DOMAIN/g" "$PROJECT_DIR/deployment/nginx.conf" > /etc/nginx/sites-available/high-eq-backend
    else
        # 创建基本配置
        cat > /etc/nginx/sites-available/high-eq-backend << EOF
server {
    listen 80;
    server_name $BACKEND_DOMAIN;
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $BACKEND_DOMAIN;

    ssl_certificate /etc/letsencrypt/live/$BACKEND_DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$BACKEND_DOMAIN/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    location /api/ {
        proxy_pass http://127.0.0.1:8080/api/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF
    fi

    # 启用配置
    ln -sf /etc/nginx/sites-available/high-eq-front /etc/nginx/sites-enabled/
    ln -sf /etc/nginx/sites-available/high-eq-backend /etc/nginx/sites-enabled/

    # 测试并重载
    nginx -t
    systemctl reload nginx

    print_info "Nginx 配置完成"
}

# 构建并部署前端
deploy_frontend() {
    print_step "构建并部署前端..."

    cd "$FRONTEND_DIR"

    # 安装依赖
    print_info "安装前端依赖..."
    pnpm install --frozen-lockfile

    # 构建前端
    print_info "构建前端..."
    pnpm build

    # 检查构建产物
    if [ ! -d "dist" ]; then
        print_error "前端构建失败，dist 目录不存在"
        exit 1
    fi

    # 创建 Nginx 目录
    mkdir -p /var/www/high-eq-front
    chown -R www-data:www-data /var/www/high-eq-front 2>/dev/null || chown -R nginx:nginx /var/www/high-eq-front

    # 部署文件
    print_info "部署前端文件到 Nginx..."
    cp -r dist/* /var/www/high-eq-front/
    chown -R www-data:www-data /var/www/high-eq-front 2>/dev/null || chown -R nginx:nginx /var/www/high-eq-front
    chmod -R 755 /var/www/high-eq-front

    print_info "前端部署完成"
}

# 启动后端服务
start_backend() {
    print_step "启动后端服务..."

    cd "$BACKEND_DIR"

    # 停止旧服务
    docker-compose -f docker-compose.prod.yml down 2>/dev/null || true

    # 启动新服务
    docker-compose -f docker-compose.prod.yml up -d

    # 等待服务启动
    print_info "等待后端服务启动..."
    sleep 30

    # 检查服务状态
    if docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
        print_info "后端服务启动成功"
    else
        print_error "后端服务启动失败，请查看日志"
        docker-compose -f docker-compose.prod.yml logs --tail=50
        exit 1
    fi
}

# 配置备份
setup_backup() {
    print_step "配置自动备份..."

    mkdir -p /opt/backups

    cat > /usr/local/bin/backup-high-eq.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/backups"
DATE=$(date +%Y%m%d_%H%M%S)
cd /opt/high-eq-project/high-eq-backend

# 备份数据库
docker-compose -f docker-compose.prod.yml exec -T mysql mysqldump \
    -u${MYSQL_USER:-root} -p${MYSQL_PASSWORD} ${MYSQL_DATABASE:-higheq} \
    > $BACKUP_DIR/db_$DATE.sql 2>/dev/null

if [ -f $BACKUP_DIR/db_$DATE.sql ]; then
    gzip $BACKUP_DIR/db_$DATE.sql
    find $BACKUP_DIR -name "db_*.sql.gz" -mtime +30 -delete
fi
EOF

    chmod +x /usr/local/bin/backup-high-eq.sh
    (crontab -l 2>/dev/null | grep -v "backup-high-eq"; echo "0 2 * * * /usr/local/bin/backup-high-eq.sh") | crontab -

    print_info "自动备份配置完成"
}

# 显示部署结果
show_result() {
    print_step "部署完成！"
    echo ""
    print_info "服务访问地址:"
    echo "  - 前端: https://$FRONTEND_DOMAIN"
    echo "  - 后端 API: https://$BACKEND_DOMAIN/api"
    echo ""
    print_info "管理命令:"
    echo "  - 前端日志: tail -f /var/log/nginx/high-eq-front-*.log"
    echo "  - 后端日志: cd $BACKEND_DIR && docker-compose -f docker-compose.prod.yml logs -f"
    echo "  - 重启后端: cd $BACKEND_DIR && docker-compose -f docker-compose.prod.yml restart"
    echo "  - 重启 Nginx: systemctl reload nginx"
    echo ""
    print_info "备份位置: /opt/backups"
    print_warn "凭据文件: /root/high-eq-credentials.txt (请妥善保管或删除)"
}

# 主流程
main() {
    check_root
    check_system
    configure_firewall
    setup_code
    setup_backend_env
    setup_frontend_env
    setup_ssl
    setup_nginx
    deploy_frontend
    start_backend
    setup_backup
    show_result
}

# 执行主流程
main
