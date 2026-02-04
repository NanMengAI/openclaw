# 文档清理说明

OpenClaw中国版提供了文档清理功能，用于删除大量不需要的英文文档。

## 为什么要清理？

- 原项目包含700+个英文MD文档
- 中国版已提供完整中文文档
- 删除英文文档可节省100MB+空间
- 简化项目结构，避免混淆

## 快速清理

```bash
chmod +x scripts/cleanup-docs.sh
./scripts/cleanup-docs.sh
```

## 详细说明

查看完整清理指南：[docs/zh-CN/cleanup-guide.md](docs/zh-CN/cleanup-guide.md)

## 保留的文档

- `README.zh-CN.md` - 中文主文档
- `DEPLOY-VPS.md` - VPS部署指南  
- `docs/zh-CN/` - 所有中文文档
- 核心项目文档（README, CHANGELOG, CONTRIBUTING, SECURITY）

## 删除的内容

- `docs/` 中的所有英文文档目录
- 不必要的其他MD文件

清理后，文档数量从700+减少到不到20个，全部为中文。
