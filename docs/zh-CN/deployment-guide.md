# OpenClaw 中国版部署指南

本指南将帮助您快速部署OpenClaw中国版。

## 概述

OpenClaw中国版针对中国用户进行了以下优化：

1. **预装所有扩展** - 无需手动安装渠道和技能
2. **Docker镜像加速** - 使用国内镜像源加速下载
3. **中文界面** - 全中文配置向导和操作界面
4. **Web初始化** - 通过Web界面进行配置，无需命令行
5. **内置国内平台支持** - 企业微信、钉钉、飞书开箱即用

## 快速部署

### 方式一：Docker部署（推荐）

#### 1. 使用一键部署脚本

```bash
curl -fsSL https://openclaw.ai/deploy-cn.sh | bash
```

部署脚本会自动：
- 检测并安装Docker
- 配置Docker镜像加速
- 拉取OpenClaw镜像
- 启动容器

#### 2. 手动Docker部署

```bash
# 克隆仓库
git clone https://github.com/NanMengAI/openclaw.git
cd openclaw

# 复制环境变量配置文件
cp .env.cn.example .env

# 编辑.env文件，填入您的配置
nano .env

# 使用docker-compose启动
docker-compose -f docker-compose.cn.yml up -d

# 查看日志
docker-compose -f docker-compose.cn.yml logs -f
```

#### 3. 访问Web界面

部署完成后，访问：
```
http://localhost:18789
```

首次访问会自动打开初始化向导。

### 方式二：npm安装

```bash
# 安装OpenClaw
npm install -g openclaw@latest

# 运行中文初始化向导
openclaw onboard-cn

# 启动网关服务
openclaw gateway --port 18789
```

### 方式三：源码构建

```bash
# 克隆仓库
git clone https://github.com/NanMengAI/openclaw.git
cd openclaw

# 安装依赖
pnpm install

# 构建中国版（包含所有扩展）
pnpm build:cn

# 启动服务
node dist/index.js gateway --port 18789
```

## Web初始化配置

首次访问 `http://localhost:18789` 会看到初始化向导，包含以下步骤：

### 步骤1: AI模型配置

1. 选择AI平台（推荐使用南梦AI）
2. 输入API密钥
3. 设置默认模型

#### 使用南梦AI（推荐）

南梦AI是一个提供500+模型的优质中转平台：

1. 访问 [南梦AI官网](https://www.nanmengai.cn)
2. 注册账号并获取API密钥
3. 在初始化向导中填入API密钥
4. 选择您喜欢的模型（如 gpt-4o、claude-3-5-sonnet等）

### 步骤2: 消息渠道配置

选择并配置您想要使用的消息平台：

#### 企业微信

1. 访问 [企业微信管理后台](https://work.weixin.qq.com/)
2. 创建自建应用
3. 记录：
   - Corp ID
   - Agent ID
   - Corp Secret
4. 在向导中填入这些信息

#### 钉钉

1. 访问 [钉钉开放平台](https://open.dingtalk.com/)
2. 创建企业内部应用
3. 记录：
   - App Key
   - App Secret
4. 在向导中填入这些信息

#### 飞书

1. 访问 [飞书开放平台](https://open.feishu.cn/)
2. 创建应用并启用机器人
3. 记录：
   - App ID
   - App Secret
4. 在向导中填入这些信息

### 步骤3: 网关安全配置

设置访问令牌或密码以保护您的网关：

```bash
# 生成一个安全的随机令牌（推荐）
openssl rand -base64 32
```

### 步骤4: 确认并完成

检查配置摘要，确认无误后点击"完成设置"。

## 环境变量配置

如果您使用Docker部署，可以通过`.env`文件配置：

```bash
# AI模型配置（南梦AI示例）
OPENAI_API_KEY=sk-your-nanmeng-api-key
OPENAI_BASE_URL=https://api.nanmengai.cn/v1

# 企业微信配置
WECOM_CORP_ID=your-corp-id
WECOM_CORP_SECRET=your-corp-secret
WECOM_AGENT_ID=your-agent-id

# 钉钉配置
DINGTALK_APP_KEY=your-app-key
DINGTALK_APP_SECRET=your-app-secret

# 飞书配置
FEISHU_APP_ID=cli_your-app-id
FEISHU_APP_SECRET=your-app-secret

# 网关安全
OPENCLAW_GATEWAY_TOKEN=your-secure-token
```

## Docker镜像加速

中国版默认配置了以下镜像加速源，无需手动配置：

- https://docker.1ms.run
- https://docker.1panel.live
- https://docker.m.daocloud.io
- https://proxy.vvvv.ee
- https://mirror.ccs.tencentyun.com

部署脚本会自动测试并选择最快的镜像源。

## 常见问题

### Q: 如何更新配置？

A: 访问 `http://localhost:18789/settings` 可以修改配置。

### Q: 如何查看日志？

A: Docker部署：
```bash
docker logs -f openclaw
```

npm安装：日志位于 `~/.openclaw/logs`

### Q: 如何重启服务？

A: Docker部署：
```bash
docker restart openclaw
```

npm安装：
```bash
# 停止当前进程，然后重新启动
openclaw gateway --port 18789
```

### Q: 端口被占用怎么办？

A: 修改`.env`文件中的端口：
```bash
OPENCLAW_GATEWAY_PORT=18790
```

### Q: 如何卸载？

A: Docker部署：
```bash
docker stop openclaw
docker rm openclaw
docker rmi openclaw:latest-cn
rm -rf ~/.openclaw
```

npm安装：
```bash
npm uninstall -g openclaw
rm -rf ~/.openclaw
```

## 生产环境建议

1. **使用强密码/令牌** - 设置足够复杂的网关访问凭证
2. **配置HTTPS** - 使用Nginx反向代理并配置SSL证书
3. **定期备份** - 备份 `~/.openclaw` 目录
4. **监控日志** - 定期检查日志以发现潜在问题
5. **保持更新** - 定期更新到最新版本

## 技术支持

- GitHub Issues: https://github.com/NanMengAI/openclaw/issues
- 文档: https://docs.openclaw.ai/zh-CN
- 社区讨论: https://github.com/NanMengAI/openclaw/discussions

## 下一步

- [配置AI模型](./ai-models.md)
- [配置消息渠道](./channels.md)
- [安装技能](./skills.md)
- [高级配置](./advanced-config.md)
