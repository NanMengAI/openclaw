#!/bin/bash

# OpenClaw 中国版文档清理脚本
# 删除不需要的英文文档，保留核心文档和中文文档

set -e

echo "🧹 开始清理不需要的文档..."

# 保留的核心文档（不删除）
KEEP_DOCS=(
    "README.md"
    "README.zh-CN.md"
    "DEPLOY-VPS.md"
    "CHANGELOG.md"
    "CONTRIBUTING.md"
    "SECURITY.md"
    "LICENSE"
)

# 删除docs目录中的英文文档（保留zh-CN目录）
echo "📁 清理docs目录..."
if [ -d "docs" ]; then
    # 保留zh-CN目录
    find docs -mindepth 1 -maxdepth 1 ! -name 'zh-CN' -exec rm -rf {} + 2>/dev/null || true
    echo "✅ docs目录清理完成（保留了docs/zh-CN）"
fi

# 删除不需要的根目录文档
echo "📄 清理根目录文档..."
for file in *.md; do
    if [ -f "$file" ]; then
        should_keep=false
        for keep in "${KEEP_DOCS[@]}"; do
            if [ "$file" = "$keep" ]; then
                should_keep=true
                break
            fi
        done
        
        if [ "$should_keep" = false ]; then
            rm -f "$file"
            echo "  🗑️  删除: $file"
        fi
    fi
done

# 删除Swabble文档（语音相关，对中国用户可能不太需要）
if [ -d "Swabble/docs" ]; then
    rm -rf Swabble/docs
    echo "✅ 删除Swabble文档"
fi

# 删除apps相关的英文README（如果不需要）
echo "📱 清理apps文档..."
rm -f apps/android/README.md 2>/dev/null || true
rm -f apps/ios/README.md 2>/dev/null || true
rm -f apps/macos/README.md 2>/dev/null || true
rm -f apps/ios/fastlane/SETUP.md 2>/dev/null || true

# 删除assets文档
if [ -d "assets/chrome-extension" ]; then
    rm -f assets/chrome-extension/README.md 2>/dev/null || true
fi

echo ""
echo "✨ 文档清理完成！"
echo ""
echo "保留的文档："
echo "  - README.zh-CN.md (中文主文档)"
echo "  - DEPLOY-VPS.md (VPS部署指南)"
echo "  - docs/zh-CN/ (所有中文文档)"
echo "  - README.md, CHANGELOG.md, CONTRIBUTING.md, SECURITY.md (核心项目文档)"
echo ""
echo "删除的内容："
echo "  - docs/ 中的所有英文文档目录"
echo "  - 其他不必要的MD文件"
echo ""
