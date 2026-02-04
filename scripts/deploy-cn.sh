#!/bin/bash
#
# OpenClaw 中国版一键部署脚本
# 针对国内网络环境优化，包含Docker镜像加速配置
#

set -e

echo "=========================================="
echo "OpenClaw 中国版 - 一键部署脚本"
echo "=========================================="
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${GREEN}[信息]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[警告]${NC} $1"
}

log_error() {
    echo -e "${RED}[错误]${NC} $1"
}

# 检查Docker是否已安装
check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker未安装，请先安装Docker"
        echo ""
        echo "安装Docker："
        echo "  Ubuntu/Debian: curl -fsSL https://get.docker.com | bash"
        echo "  或访问: https://docs.docker.com/engine/install/"
        exit 1
    fi
    log_info "Docker已安装: $(docker --version)"
}

# 配置Docker镜像加速
setup_docker_mirrors() {
    log_info "配置Docker镜像加速..."
    
    # Docker镜像加速列表（国内）
    MIRRORS=(
        "https://docker.1ms.run"
        "https://docker.1panel.live"
        "https://docker.m.daocloud.io"
        "https://proxy.vvvv.ee"
        "https://mirror.ccs.tencentyun.com"
    )
    
    # 测试镜像源可用性并选择最快的
    FASTEST_MIRROR=""
    FASTEST_TIME=999999
    
    log_info "测试镜像源速度..."
    for mirror in "${MIRRORS[@]}"; do
        start_time=$(date +%s%N)
        if timeout 3 curl -s "$mirror" > /dev/null 2>&1; then
            end_time=$(date +%s%N)
            elapsed=$((($end_time - $start_time) / 1000000))
            echo "  $mirror: ${elapsed}ms"
            if [ $elapsed -lt $FASTEST_TIME ]; then
                FASTEST_TIME=$elapsed
                FASTEST_MIRROR=$mirror
            fi
        else
            echo "  $mirror: 超时"
        fi
    done
    
    if [ -n "$FASTEST_MIRROR" ]; then
        log_info "最快镜像源: $FASTEST_MIRROR (${FASTEST_TIME}ms)"
        DOCKER_REGISTRY_MIRROR="$FASTEST_MIRROR"
    else
        log_warn "未找到可用的镜像加速源，将使用默认源"
        DOCKER_REGISTRY_MIRROR=""
    fi
    
    # 配置Docker daemon
    if [ -n "$DOCKER_REGISTRY_MIRROR" ]; then
        DAEMON_JSON="/etc/docker/daemon.json"
        if [ -f "$DAEMON_JSON" ]; then
            log_info "备份现有Docker配置..."
            sudo cp "$DAEMON_JSON" "${DAEMON_JSON}.backup.$(date +%s)"
        fi
        
        log_info "写入Docker镜像加速配置..."
        sudo tee "$DAEMON_JSON" > /dev/null <<EOF
{
  "registry-mirrors": [
    "$DOCKER_REGISTRY_MIRROR"
  ]
}
EOF
        
        log_info "重启Docker服务..."
        sudo systemctl restart docker || sudo service docker restart
        sleep 3
        log_info "Docker镜像加速已配置"
    fi
}

# 创建配置目录
setup_directories() {
    log_info "创建配置目录..."
    OPENCLAW_DIR="$HOME/.openclaw"
    mkdir -p "$OPENCLAW_DIR"
    log_info "配置目录: $OPENCLAW_DIR"
}

# 部署OpenClaw容器
deploy_openclaw() {
    log_info "部署OpenClaw容器..."
    
    # 停止并删除旧容器（如果存在）
    if docker ps -a | grep -q openclaw; then
        log_info "停止并删除旧容器..."
        docker stop openclaw || true
        docker rm openclaw || true
    fi
    
    # 拉取镜像
    log_info "拉取OpenClaw镜像..."
    docker pull openclaw/openclaw:latest-cn || docker pull openclaw/openclaw:latest
    
    # 运行容器
    log_info "启动OpenClaw容器..."
    docker run -d \\
        --name openclaw \\
        --restart unless-stopped \\
        -p 18789:18789 \\
        -v "$OPENCLAW_DIR:/root/.openclaw" \\
        -e OPENCLAW_LANG=zh-CN \\
        openclaw/openclaw:latest-cn || openclaw/openclaw:latest
    
    log_info "等待服务启动..."
    sleep 5
    
    # 检查容器状态
    if docker ps | grep -q openclaw; then
        log_info "OpenClaw容器已成功启动"
    else
        log_error "OpenClaw容器启动失败"
        echo ""
        echo "查看日志："
        echo "  docker logs openclaw"
        exit 1
    fi
}

# 显示完成信息
show_completion() {
    echo ""
    echo "=========================================="
    echo -e "${GREEN}✓ 部署完成！${NC}"
    echo "=========================================="
    echo ""
    echo "访问地址:"
    echo "  http://localhost:18789"
    echo ""
    echo "常用命令:"
    echo "  查看日志:     docker logs -f openclaw"
    echo "  停止服务:     docker stop openclaw"
    echo "  启动服务:     docker start openclaw"
    echo "  重启服务:     docker restart openclaw"
    echo "  进入容器:     docker exec -it openclaw bash"
    echo ""
    echo "配置文件位置:"
    echo "  $OPENCLAW_DIR"
    echo ""
    echo "文档: https://docs.openclaw.ai/zh-CN"
    echo "=========================================="
}

# 主流程
main() {
    check_docker
    setup_docker_mirrors
    setup_directories
    deploy_openclaw
    show_completion
}

# 执行主流程
main
