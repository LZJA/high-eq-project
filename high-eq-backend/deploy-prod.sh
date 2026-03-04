#!/bin/bash

# 高情商回复助手 - 生产环境 Docker 部署脚本
# 使用方法: ./deploy-prod.sh [deploy|update|rollback|logs|status]

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

# 检查 Docker 是否安装
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker 未安装，请先安装 Docker"
        exit 1
    fi

    if ! docker compose version &> /dev/null; then
        print_error "Docker Compose 版本过低，请升级到 2.0+"
        exit 1
    fi

    print_info "Docker 环境检查通过"
}

# 检查生产环境配置
check_prod_config() {
    if [ ! -f .env ]; then
        print_error ".env 文件不存在"
        echo "请先创建 .env 文件，可以参考 .env.docker.example"
        exit 1
    fi

    # 检查是否使用了默认密码
    if grep -q "change-this" .env; then
        print_error "检测到默认密码，请修改 .env 文件中的默认密码"
        exit 1
    fi

    print_info "生产环境配置检查通过"
}

# 备份当前版本
backup_current_version() {
    BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$BACKUP_DIR"

    print_info "备份当前版本到 $BACKUP_DIR"
    docker-compose -f docker-compose.prod.yml exec -T mysql mysqldump -u${MYSQL_USER} -p${MYSQL_PASSWORD} ${MYSQL_DATABASE} > "$BACKUP_DIR/database.sql" 2>/dev/null || true

    print_info "备份完成"
}

# 部署生产环境
deploy_production() {
    print_step "开始部署生产环境..."

    check_docker
    check_prod_config

    # 构建镜像
    print_step "构建 Docker 镜像..."
    docker-compose -f docker-compose.prod.yml build --no-cache

    # 停止旧服务
    print_step "停止旧服务..."
    docker-compose -f docker-compose.prod.yml down

    # 启动新服务
    print_step "启动新服务..."
    docker-compose -f docker-compose.prod.yml up -d

    # 等待服务启动
    print_step "等待服务启动..."
    sleep 30

    # 健康检查
    print_step "执行健康检查..."
    if docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
        print_info "✓ 生产环境部署成功"
        echo ""
        print_info "服务访问地址:"
        echo "  - 后端 API: http://localhost:${BACKEND_PORT:-8080}"
        echo ""
        print_info "查看日志: ./deploy-prod.sh logs"
        print_info "查看状态: ./deploy-prod.sh status"
    else
        print_error "服务启动失败，请查看日志"
        docker-compose -f docker-compose.prod.yml logs --tail=50
        exit 1
    fi
}

# 更新生产环境（零停机）
update_production() {
    print_step "开始更新生产环境..."

    check_docker
    check_prod_config

    # 备份
    backup_current_version

    # 构建新镜像
    print_step "构建新版本镜像..."
    docker-compose -f docker-compose.prod.yml build --no-cache

    # 滚动更新
    print_step "执行滚动更新..."
    docker-compose -f docker-compose.prod.yml up -d --no-deps --build backend

    print_info "✓ 生产环境更新完成"
}

# 回滚到上一个版本
rollback_version() {
    print_warn "回滚功能需要手动执行"
    echo "1. 查看待回滚版本: ls -la ./backups/"
    echo "2. 恢复数据库: docker-compose -f docker-compose.prod.yml exec -T mysql mysql -u${MYSQL_USER} -p${MYSQL_PASSWORD} ${MYSQL_DATABASE} < ./backups/version/database.sql"
    echo "3. 重新构建并部署: ./deploy-prod.sh deploy"
}

# 查看日志
view_logs() {
    docker-compose -f docker-compose.prod.yml logs -f --tail=100
}

# 查看状态
view_status() {
    docker-compose -f docker-compose.prod.yml ps
    echo ""
    print_info "容器资源使用情况:"
    docker stats --no-stream $(docker-compose -f docker-compose.prod.yml ps -q)
}

# 清理日志文件
clean_logs() {
    print_info "清理容器日志..."
    docker-compose -f docker-compose.prod.yml down
    docker system prune -f
    print_info "日志清理完成"
}

# 显示帮助信息
show_help() {
    echo "生产环境部署脚本"
    echo ""
    echo "使用方法: $0 [deploy|update|rollback|logs|status|clean]"
    echo ""
    echo "命令说明:"
    echo "  deploy  - 部署生产环境（首次部署或完全重新部署）"
    echo "  update  - 更新生产环境（零停机滚动更新）"
    echo "  rollback- 回滚到上一个版本"
    echo "  logs    - 查看服务日志"
    echo "  status  - 查看服务状态和资源使用"
    echo "  clean   - 清理日志和缓存"
    echo ""
    echo "注意事项:"
    echo "  1. 首次部署前请确保 .env 文件配置正确"
    echo "  2. 不要使用默认密码"
    echo "  3. 生产环境建议配置 HTTPS 和反向代理"
    echo "  4. 定期备份数据库"
}

# 主函数
main() {
    case "${1:-help}" in
        deploy)
            deploy_production
            ;;
        update)
            update_production
            ;;
        rollback)
            rollback_version
            ;;
        logs)
            view_logs
            ;;
        status)
            view_status
            ;;
        clean)
            clean_logs
            ;;
        *)
            show_help
            exit 1
            ;;
    esac
}

# 执行主函数
main "$@"
