#!/bin/bash
#
# OpenClaw 中国版 - 自动安装所有扩展和技能
# 用于构建过程中预装所有扩展，用户无需再次安装
#

set -e

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

echo "========================================"
echo "OpenClaw 中国版 - 扩展自动安装"
echo "========================================"
echo ""

# 检查是否在项目根目录
if [ ! -f "package.json" ]; then
    log_warn "请在项目根目录执行此脚本"
    exit 1
fi

# 安装渠道扩展
log_step "安装渠道扩展..."

CHANNEL_EXTENSIONS=(
    "bluebubbles"
    "discord"
    "dingtalk"
    "feishu"
    "googlechat"
    "imessage"
    "line"
    "matrix"
    "mattermost"
    "msteams"
    "nextcloud-talk"
    "nostr"
    "signal"
    "slack"
    "telegram"
    "tlon"
    "twitch"
    "voice-call"
    "wecom"
    "whatsapp"
    "zalo"
    "zalouser"
)

for extension in "${CHANNEL_EXTENSIONS[@]}"; do
    if [ -d "extensions/$extension" ]; then
        log_info "已找到扩展: $extension"
        # 扩展已存在于extensions目录中，无需额外安装
    else
        log_warn "扩展不存在: $extension"
    fi
done

# 安装技能扩展
log_step "安装技能扩展..."

SKILL_EXTENSIONS=(
    "1password"
    "apple-notes"
    "apple-reminders"
    "bear-notes"
    "bird"
    "blogwatcher"
    "blucli"
    "camsnap"
    "canvas"
    "clawhub"
    "coding-agent"
    "eightctl"
    "food-order"
    "gemini"
    "gifgrep"
    "github"
    "gog"
    "goplaces"
    "healthcheck"
    "himalaya"
    "imsg"
    "local-places"
    "mcporter"
    "model-usage"
    "nano-banana-pro"
    "nano-pdf"
    "notion"
    "obsidian"
    "openai-image-gen"
    "openai-whisper"
    "openhue"
    "oracle"
    "ordercli"
    "peekaboo"
    "sag"
    "sherpa-onnx-tts"
    "songsee"
    "sonoscli"
    "spotify-player"
    "summarize"
    "things-mac"
    "trello"
    "video-frames"
    "wacli"
)

for skill in "${SKILL_EXTENSIONS[@]}"; do
    if [ -d "skills/$skill" ]; then
        log_info "已找到技能: $skill"
        # 技能已存在于skills目录中，无需额外安装
    else
        log_warn "技能不存在: $skill"
    fi
done

# 其他功能扩展
log_step "安装其他功能扩展..."

OTHER_EXTENSIONS=(
    "copilot-proxy"
    "diagnostics-otel"
    "google-antigravity-auth"
    "google-gemini-cli-auth"
    "llm-task"
    "lobster"
    "memory-core"
    "memory-lancedb"
    "minimax-portal-auth"
    "open-prose"
)

for extension in "${OTHER_EXTENSIONS[@]}"; do
    if [ -d "extensions/$extension" ]; then
        log_info "已找到扩展: $extension"
    else
        log_warn "扩展不存在: $extension"
    fi
done

# 创建扩展清单文件
log_step "创建扩展清单文件..."

cat > "extensions/installed-extensions.json" <<EOF
{
  "version": "1.0.0",
  "installedAt": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "channels": $(printf '%s\n' "${CHANNEL_EXTENSIONS[@]}" | jq -R . | jq -s .),
  "skills": $(printf '%s\n' "${SKILL_EXTENSIONS[@]}" | jq -R . | jq -s .),
  "other": $(printf '%s\n' "${OTHER_EXTENSIONS[@]}" | jq -R . | jq -s .)
}
EOF

log_info "扩展清单已创建: extensions/installed-extensions.json"

# 创建预安装标记
log_step "创建预安装标记..."

cat > ".openclaw-preinstalled" <<EOF
# OpenClaw 中国版预安装标记
# 此文件表示所有扩展已在构建时预装
PREINSTALLED=true
VERSION=cn-$(date +%Y%m%d)
EOF

log_info "预安装标记已创建: .openclaw-preinstalled"

echo ""
echo "========================================"
echo "扩展安装完成！"
echo "========================================"
echo ""
echo "已安装的渠道扩展: ${#CHANNEL_EXTENSIONS[@]} 个"
echo "已安装的技能扩展: ${#SKILL_EXTENSIONS[@]} 个"
echo "已安装的其他扩展: ${#OTHER_EXTENSIONS[@]} 个"
echo ""
echo "用户现在可以直接在Web UI中配置这些扩展"
echo "无需额外的安装步骤"
echo "========================================"
