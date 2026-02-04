# 文档清理指南

## 为什么要清理文档？

OpenClaw原项目包含大量英文文档（700+个MD文件），这些文档对于中国用户来说：
- 占用磁盘空间
- 可能造成混淆
- 不符合中文使用习惯

中国版已经提供了完整的中文文档，因此可以安全地删除大部分英文文档。

## 执行清理

### 自动清理（推荐）

运行清理脚本：

```bash
cd openclaw
chmod +x scripts/cleanup-docs.sh
./scripts/cleanup-docs.sh
```

### 清理内容

脚本会删除：
- `docs/` 目录中的所有英文子目录（保留 `docs/zh-CN/`）
- 不必要的根目录MD文件
- Swabble文档（语音组件文档）
- apps相关的英文README

脚本会保留：
- `README.zh-CN.md` - 中文主文档
- `DEPLOY-VPS.md` - VPS部署指南
- `docs/zh-CN/` - 所有中文文档
- `README.md` - 原项目README（供参考）
- `CHANGELOG.md` - 项目更新日志
- `CONTRIBUTING.md` - 贡献指南
- `SECURITY.md` - 安全说明

## 清理后的文档结构

```
openclaw/
├── README.zh-CN.md          # 中文主文档
├── DEPLOY-VPS.md            # VPS部署指南
├── README.md                # 原项目README
├── CHANGELOG.md             # 更新日志
├── CONTRIBUTING.md          # 贡献指南
├── SECURITY.md              # 安全说明
└── docs/
    └── zh-CN/               # 所有中文文档
        ├── deployment-guide.md
        ├── quick-start.md
        ├── vps-deployment.md
        ├── ui-enhancements.md
        ├── cleanup-guide.md
        └── CHANGELOG-CN.md
```

## 手动清理

如果您想手动清理，可以执行：

```bash
# 删除英文docs目录（保留zh-CN）
cd docs
find . -mindepth 1 -maxdepth 1 ! -name 'zh-CN' -exec rm -rf {} +
cd ..

# 删除不需要的根目录文件
rm -f AGENTS.md docs.acp.md

# 删除Swabble文档
rm -rf Swabble/docs
rm -f Swabble/README.md Swabble/CHANGELOG.md

# 删除apps文档
rm -f apps/android/README.md
rm -f apps/ios/README.md
rm -f apps/macos/README.md
```

## 清理后的好处

1. **磁盘空间节省**：减少100MB+的文档文件
2. **更清晰的结构**：只保留中文文档，避免混淆
3. **更快的查找**：文档数量从700+减少到不到20个
4. **更好的用户体验**：专注于中文用户需要的内容

## 恢复文档

如果您需要恢复原英文文档，可以：

```bash
# 从原仓库拉取
git checkout origin/main -- docs/
```

或者查看原项目：https://github.com/OpenClaw/openclaw

## 注意事项

- 清理是不可逆的（除非从git恢复）
- 清理前建议先备份（如果需要）
- 如果您要给原项目提PR，请不要清理文档
- 清理只影响文档，不影响代码功能

## 建议

对于中国用户的生产部署，**建议执行清理**，可以：
- 减少仓库体积
- 提高部署速度
- 简化文档结构
- 专注中文内容
