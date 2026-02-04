#!/bin/bash
#
# OpenClaw 中国版 Docker镜像构建脚本
# 使用国内镜像加速构建
#

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

log_step() {
    echo -e "${BLUE}[步骤]${NC} $1"
}

# 默认配置
IMAGE_NAME="openclaw"
IMAGE_TAG="latest-cn"
DOCKERFILE="Dockerfile.cn"
PLATFORM="linux/amd64,linux/arm64"
PUSH=false
BUILD_ARGS=""

# 解析命令行参数
while [[ $# -gt 0 ]]; do
    case $1 in
        --push)
            PUSH=true
            shift
            ;;
        --tag)
            IMAGE_TAG="$2"
            shift 2
            ;;
        --name)
            IMAGE_NAME="$2"
            shift 2
            ;;
        --platform)
            PLATFORM="$2"
            shift 2
            ;;
        --build-arg)
            BUILD_ARGS="$BUILD_ARGS --build-arg $2"
            shift 2
            ;;
        --help)
            echo "用法: $0 [选项]"
            echo ""
            echo "选项:"
            echo "  --push              构建后推送到镜像仓库"
            echo "  --tag TAG           设置镜像标签（默认: latest-cn）"
            echo "  --name NAME         设置镜像名称（默认: openclaw）"
            echo "  --platform PLATFORM 设置目标平台（默认: linux/amd64,linux/arm64）"
            echo "  --build-arg ARG     传递构建参数"
            echo "  --help              显示此帮助信息"
            echo ""
            echo "示例:"
            echo "  $0 --push --tag v1.0.0-cn"
            echo "  $0 --platform linux/amd64"
            exit 0
            ;;
        *)
            log_error "未知参数: $1"
            echo "使用 --help 查看帮助"
            exit 1
            ;;
    esac
done

# 检查Docker是否已安装
if ! command -v docker &> /dev/null; then
    log_error "Docker未安装"
    exit 1
fi

# 检查Dockerfile是否存在
if [ ! -f "$DOCKERFILE" ]; then
    log_error "Dockerfile未找到: $DOCKERFILE"
    exit 1
fi

# 显示构建信息
echo ""
echo "========================================"
echo "OpenClaw 中国版镜像构建"
echo "========================================"
log_info "镜像名称: $IMAGE_NAME"
log_info "镜像标签: $IMAGE_TAG"
log_info "Dockerfile: $DOCKERFILE"
log_info "目标平台: $PLATFORM"
log_info "推送镜像: $([ "$PUSH" = true ] && echo '是' || echo '否')"
echo "========================================"
echo ""

# 构建镜像
log_step "开始构建Docker镜像..."
BUILD_CMD="docker build"

# 如果需要多平台构建，使用buildx
if [[ "$PLATFORM" == *","* ]]; then
    log_info "检测到多平台构建，使用docker buildx"
    
    # 检查buildx是否可用
    if ! docker buildx version &> /dev/null; then
        log_error "docker buildx不可用"
        exit 1
    fi
    
    # 创建并使用buildx builder
    BUILDER_NAME="openclaw-builder"
    if ! docker buildx inspect "$BUILDER_NAME" &> /dev/null; then
        log_info "创建buildx builder: $BUILDER_NAME"
        docker buildx create --name "$BUILDER_NAME" --use
    else
        log_info "使用已存在的builder: $BUILDER_NAME"
        docker buildx use "$BUILDER_NAME"
    fi
    
    BUILD_CMD="docker buildx build --platform $PLATFORM"
    
    if [ "$PUSH" = true ]; then
        BUILD_CMD="$BUILD_CMD --push"
    else
        BUILD_CMD="$BUILD_CMD --load"
    fi
else
    # 单平台构建
    BUILD_CMD="docker build --platform $PLATFORM"
fi

# 添加构建参数
BUILD_CMD="$BUILD_CMD -f $DOCKERFILE -t $IMAGE_NAME:$IMAGE_TAG $BUILD_ARGS ."

# 执行构建
log_info "执行命令: $BUILD_CMD"
if eval "$BUILD_CMD"; then
    log_info "镜像构建成功: $IMAGE_NAME:$IMAGE_TAG"
else
    log_error "镜像构建失败"
    exit 1
fi

# 推送镜像（如果是单平台构建且需要推送）
if [ "$PUSH" = true ] && [[ "$PLATFORM" != *","* ]]; then
    log_step "推送镜像到仓库..."
    if docker push "$IMAGE_NAME:$IMAGE_TAG"; then
        log_info "镜像推送成功"
    else
        log_error "镜像推送失败"
        exit 1
    fi
fi

# 显示完成信息
echo ""
echo "========================================"
echo -e "${GREEN}✓ 构建完成！${NC}"
echo "========================================"
echo ""
echo "镜像信息:"
echo "  名称: $IMAGE_NAME:$IMAGE_TAG"
echo "  大小: $(docker images $IMAGE_NAME:$IMAGE_TAG --format '{{.Size}}')"
echo ""
echo "运行容器:"
echo "  docker run -d -p 18789:18789 $IMAGE_NAME:$IMAGE_TAG"
echo ""
echo "使用docker-compose:"
echo "  OPENCLAW_IMAGE=$IMAGE_NAME:$IMAGE_TAG docker-compose -f docker-compose.cn.yml up -d"
echo "========================================"
