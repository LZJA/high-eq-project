#!/bin/bash

# 高情商回复助手 - Docker 部署脚本
# 使用方法: ./deploy-docker.sh [build|up|down|restart|logs]

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

# 检查 Docker 是否安装
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker 未安装，请先安装 Docker"
        echo "安装指南: https://docs.docker.com/get-docker/"
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        print_error "Docker Compose 未安装，请先安装 Docker Compose"
        echo "安装指南: https://docs.docker.com/compose/install/"
        exit 1
    fi

    print_info "Docker 环境检查通过"
}

# 检查 .env 文件
check_env_file() {
    if [ ! -f .env ]; then
        print_error ".env 文件不存在"
        echo "请先创建 .env 文件，可以参考 .env.example"
        echo ""
        echo "创建命令: cp .env.example .env"
        echo "然后编辑 .env 文件，填入正确的配置"
        exit 1
    fi
    print_info ".env 文件检查通过"
}

# 构建镜像
build_images() {
    print_info "开始构建 Docker 镜像..."
    docker-compose build --no-cache
    print_info "镜像构建完成"
}

# 启动服务
start_services() {
    print_info "启动服务..."
    docker-compose up -d
    print_info "服务启动完成"

    echo ""
    print_info "服务访问地址:"
    echo "  - 后端 API: http://localhost:8080"
    echo "  - MySQL: localhost:3306"
    echo ""
    print_info "查看日志: docker-compose logs -f"
    print_info "查看状态: docker-compose ps"
}

# 停止服务
stop_services() {
    print_info "停止服务..."
    docker-compose down
    print_info "服务已停止"
}

# 重启服务
restart_services() {
    print_info "重启服务..."
    docker-compose restart
    print_info "服务已重启"
}

# 查看日志
view_logs() {
    docker-compose logs -f --tail=100
}

# 查看状态
view_status() {
    docker-compose ps
}

# 清理数据（危险操作）
clean_data() {
    print_warn "⚠️  此操作将删除所有数据，包括数据库数据！"
    read -p "确定要继续吗？(yes/no): " confirm
    if [ "$confirm" = "yes" ]; then
        print_info "停止服务并删除数据..."
        docker-compose down -v
        print_info "数据已清理"
    else
        print_info "操作已取消"
    fi
}

# 主函数
main() {
    check_docker
    check_env_file

    case "${1:-up}" in
        build)
            build_images
            ;;
        up|start)
            build_images
            start_services
            ;;
        down|stop)
            stop_services
            ;;
        restart)
            restart_services
            ;;
        logs)
            view_logs
            ;;
        status)
            view_status
            ;;
        clean)
            clean_data
            ;;
        *)
            echo "使用方法: $0 [build|up|down|restart|logs|status|clean]"
            echo ""
            echo "命令说明:"
            echo "  build   - 构建 Docker 镜像"
            echo "  up      - 构建并启动服务（默认）"
            echo "  down    - 停止并删除服务"
            echo "  restart - 重启服务"
            echo "  logs    - 查看服务日志"
            echo "  status  - 查看服务状态"
            echo "  clean   - 清理所有数据（危险）"
            exit 1
            ;;
    esac
}

# 执行主函数
main "$@"
