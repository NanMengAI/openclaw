# OpenClaw 中国版快速开始

本指南将帮助您在5分钟内部署并开始使用OpenClaw中国版。

## 前置要求

- Docker和Docker Compose（推荐）
- 或 Node.js 22+ 和 pnpm

## 方式一: Docker一键部署（推荐）

### 1. 运行部署脚本

```bash
curl -fsSL https://openclaw.ai/deploy-cn.sh | bash
```

脚本会自动：
- 检测并安装Docker
- 配置Docker镜像加速
- 拉取OpenClaw镜像
- 创建并启动容器
- 显示访问地址

### 2. 访问Web界面

部署完成后，浏览器访问：

```
http://localhost:18789
```

### 3. 完成初始化

按照Web向导完成配置：

#### 步骤1: 配置AI模型

**推荐使用南梦AI**：

1. 访问 [南梦AI官网](https://www.nanmengai.cn)
2. 注册账号并获取API密钥
3. 在向导中选择"南梦AI"
4. 输入API密钥
5. 选择模型（如 `gpt-4o`）

**可选择的模型平台**：
- 南梦AI（推荐）- 500+模型
- OpenAI - 官方模型
- 自定义平台 - 任何OpenAI兼容接口

#### 步骤2: 配置消息渠道

选择您需要的消息平台：

##### 企业微信

1. 访问 [企业微信管理后台](https://work.weixin.qq.com/)
2. 创建自建应用
3. 记录以下信息：
   - Corp ID: 企业信息 → Corp ID
   - Agent ID: 应用管理 → 应用ID
   - Corp Secret: 应用管理 → Secret
4. 在向导中填入这些信息

##### 钉钉

1. 访问 [钉钉开放平台](https://open.dingtalk.com/)
2. 创建企业内部应用
3. 记录以下信息：
   - App Key
   - App Secret
4. 在向导中填入这些信息

##### 飞书

1. 访问 [飞书开放平台](https://open.feishu.cn/)
2. 创建应用并启用机器人
3. 记录以下信息：
   - App ID: 以 `cli_` 开头
   - App Secret
4. 在向导中填入这些信息

**提示**: 您可以稍后在设置中添加更多渠道。

#### 步骤3: 配置网关安全

设置访问令牌以保护您的网关：

```bash
# 生成安全令牌（推荐）
openssl rand -base64 32
```

或设置一个强密码。

#### 步骤4: 完成设置

检查配置摘要，确认无误后点击"完成设置"。

### 4. 开始使用

配置完成后，您可以：

1. 在配置的消息平台上与AI助手对话
2. 访问 `http://localhost:18789` 管理配置
3. 查看日志：`docker logs -f openclaw`

---

## 方式二: 手动Docker部署

### 1. 克隆仓库

```bash
git clone https://github.com/NanMengAI/openclaw.git
cd openclaw
```

### 2. 配置环境变量

```bash
# 复制环境变量模板
cp .env.cn.example .env

# 编辑配置文件
nano .env
```

**最小配置示例**:

```bash
# AI模型配置（南梦AI）
OPENAI_API_KEY=sk-your-nanmeng-api-key
OPENAI_BASE_URL=https://api.nanmengai.cn/v1

# 网关安全
OPENCLAW_GATEWAY_TOKEN=your-secure-token-here

# 企业微信（可选）
WECOM_CORP_ID=your-corp-id
WECOM_CORP_SECRET=your-corp-secret
WECOM_AGENT_ID=your-agent-id
```

### 3. 启动服务

```bash
docker-compose -f docker-compose.cn.yml up -d
```

### 4. 查看日志

```bash
docker-compose -f docker-compose.cn.yml logs -f
```

---

## 方式三: npm安装

### 1. 安装OpenClaw

```bash
npm install -g openclaw@latest
```

### 2. 运行中文初始化向导

```bash
openclaw onboard-cn
```

按照提示完成配置。

### 3. 启动网关

```bash
openclaw gateway --port 18789
```

### 4. 访问Web界面

```
http://localhost:18789
```

---

## 常见问题

### Q: 如何更新配置？

**A**: 访问 `http://localhost:18789/settings` 可以修改所有配置。

### Q: 端口被占用怎么办？

**A**: 编辑 `.env` 文件，修改端口：

```bash
OPENCLAW_GATEWAY_PORT=18790
```

然后重启服务：

```bash
docker-compose -f docker-compose.cn.yml restart
```

### Q: 如何查看日志？

**A**: 

Docker部署：
```bash
docker logs -f openclaw
```

npm安装：
```bash
tail -f ~/.openclaw/logs/gateway.log
```

### Q: 如何添加更多渠道？

**A**: 

1. 访问 `http://localhost:18789/settings`
2. 点击"添加渠道"
3. 选择平台并填入配置
4. 保存并测试连接

### Q: 南梦AI有哪些推荐的模型？

**A**: 南梦AI提供500+模型，推荐：

- `gpt-4o` - OpenAI最新模型，平衡性能
- `gpt-4o-mini` - 更快速，成本更低
- `claude-3-5-sonnet` - Anthropic最强模型
- `gemini-2.0-flash-exp` - Google最新模型
- `deepseek-v3` - 中文优化模型

访问 [南梦AI官网](https://www.nanmengai.cn) 查看完整模型列表。

### Q: 如何重启服务？

**A**:

Docker部署：
```bash
docker restart openclaw
```

npm安装：
```bash
# 停止当前进程（Ctrl+C），然后重新启动
openclaw gateway --port 18789
```

### Q: 如何备份配置？

**A**:

所有配置存储在 `~/.openclaw` 目录：

```bash
# 备份
tar -czf openclaw-backup-$(date +%Y%m%d).tar.gz ~/.openclaw

# 恢复
tar -xzf openclaw-backup-20240101.tar.gz -C ~
```

### Q: 如何卸载？

**A**:

Docker部署：
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

---

## 测试AI助手

部署完成后，您可以通过以下方式测试：

### 1. 企业微信

在企业微信中找到您的应用，发送消息：

```
你好
```

AI助手会回复您。

### 2. 钉钉

在钉钉中找到您的机器人，发送消息：

```
你是谁？
```

### 3. 飞书

在飞书中找到您的应用，发送消息：

```
帮我写一封邮件
```

---

## 下一步

- [配置更多渠道](./channels.md)
- [安装技能插件](./skills.md)
- [高级配置](./advanced-config.md)
- [API文档](./api-reference.md)

---

## 获取帮助

- GitHub Issues: https://github.com/NanMengAI/openclaw/issues
- 文档: https://docs.openclaw.ai/zh-CN
- 社区: https://github.com/NanMengAI/openclaw/discussions
- 南梦AI支持: https://www.nanmengai.cn

---

**祝您使用愉快！** 🎉
