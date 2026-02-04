# OpenClaw 中国版

> 个人AI助手 - 为中国用户优化

OpenClaw 是一个功能强大的个人AI助手框架，可以在您自己的设备上运行。中国版针对国内用户进行了专门优化，提供更好的使用体验。

## ✨ 特性

- **多渠道集成** - 支持企业微信、钉钉、飞书、WhatsApp、Telegram等多个消息平台
- **AI模型支持** - 内置南梦AI支持，提供500+优质模型选择
- **Docker部署** - 针对国内网络优化，内置镜像加速
- **中文界面** - 全中文配置向导和操作界面
- **开箱即用** - 预装所有渠道和技能扩展，无需额外安装

## 🚀 快速开始

### Docker部署（推荐）

使用优化的Docker镜像快速部署：

\`\`\`bash
# 使用部署脚本（推荐）
curl -fsSL https://openclaw.ai/deploy-cn.sh | bash

# 或者手动运行
docker run -d \\
  --name openclaw \\
  -p 18789:18789 \\
  -v ~/openclaw:/root/.openclaw \\
  openclaw/openclaw:latest-cn
\`\`\`

部署完成后，访问 http://localhost:18789 进行初始化配置。

### npm安装

\`\`\`bash
npm install -g openclaw@latest
openclaw onboard-cn  # 中文初始化向导
openclaw gateway --port 18789
\`\`\`

## 📋 支持的渠道

### 国内平台
- ✅ **企业微信** (WeCom/WeChat Work)
- ✅ **钉钉** (DingTalk)
- ✅ **飞书** (Feishu/Lark)

### 国际平台
- ✅ WhatsApp
- ✅ Telegram
- ✅ Slack
- ✅ Discord
- ✅ Signal
- ✅ iMessage
- ✅ Matrix
- ✅ Google Chat
- ✅ Microsoft Teams

## 🤖 AI模型配置

### 使用南梦AI（推荐）

南梦AI是一个提供500+模型的优质中转平台，能满足您的所有AI需求。

1. 访问 [https://api.nanmeng.work](https://api.nanmeng.work) 注册账号
2. 获取API密钥
3. 在配置中填入API密钥和模型名称

\`\`\`yaml
# config.yaml
agents:
  defaults:
    model: "gpt-4o"  # 或其他南梦AI支持的模型
    providers:
      - type: openai
        apiKey: "your-nanmeng-api-key"
        baseURL: "https://api.nanmeng.work/v1"
\`\`\`

### 其他OpenAI兼容平台

OpenClaw支持所有OpenAI兼容接口的AI平台：

- OpenAI
- Anthropic
- 阿里云通义
- 讯飞星火
- 文心一言
- 等等...

## 🔧 配置

### 企业微信配置

1. 访问 [企业微信管理后台](https://work.weixin.qq.com/)
2. 创建自建应用
3. 记录 Corp ID、Agent ID 和 Corp Secret
4. 配置回调URL和可信域名
5. 在OpenClaw中填入相关信息

\`\`\`yaml
channels:
  wecom:
    enabled: true
    corpId: "your-corp-id"
    corpSecret: "your-corp-secret"
    agentId: "your-agent-id"
\`\`\`

### 钉钉配置

1. 访问 [钉钉开放平台](https://open.dingtalk.com/)
2. 创建企业内部应用或机器人
3. 记录 AppKey 和 AppSecret
4. 配置消息接收地址
5. 在OpenClaw中填入相关信息

\`\`\`yaml
channels:
  dingtalk:
    enabled: true
    appKey: "your-app-key"
    appSecret: "your-app-secret"
\`\`\`

### 飞书配置

1. 访问 [飞书开放平台](https://open.feishu.cn/)
2. 创建应用并启用机器人
3. 记录 App ID 和 App Secret
4. 启用事件订阅(WebSocket模式)
5. 在OpenClaw中填入相关信息

\`\`\`yaml
channels:
  feishu:
    enabled: true
    appId: "cli_xxx"
    appSecret: "your-app-secret"
    domain: "feishu"  # 中国区用 "feishu"，国际版用 "lark"
\`\`\`

## 🐳 Docker加速镜像

中国版默认配置了以下Docker镜像加速源：

- https://docker.1ms.run
- https://docker.1panel.live
- https://docker.m.daocloud.io
- https://proxy.vvvv.ee
- https://mirror.ccs.tencentyun.com

您无需手动配置，部署脚本会自动选择最快的镜像源。

## 📚 文档

- [完整文档](https://docs.openclaw.ai/zh-CN)
- [快速开始](https://docs.openclaw.ai/zh-CN/getting-started)
- [渠道配置](https://docs.openclaw.ai/zh-CN/channels)
- [Docker部署](https://docs.openclaw.ai/zh-CN/deployment/docker)
- [常见问题](https://docs.openclaw.ai/zh-CN/faq)

## 🆘 支持

- 问题反馈：[GitHub Issues](https://github.com/NanMengAI/openclaw/issues)
- 社区讨论：[GitHub Discussions](https://github.com/NanMengAI/openclaw/discussions)
- 官方网站：[https://openclaw.ai](https://openclaw.ai)

## 📄 许可证

本项目基于OpenClaw开源项目，遵循其原有许可证。中国版的优化和扩展同样开源。

## 🙏 致谢

感谢OpenClaw社区的所有贡献者，以及为中国版提供支持的开发者们。
