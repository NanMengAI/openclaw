# OpenClaw 中国版改造日志

本文档记录了OpenClaw中国版的所有改造和优化内容。

## 版本: v1.0.0-cn (2024)

### 🎯 改造目标

针对中国用户优化OpenClaw，提供更好的使用体验和本地化支持。

---

## ✅ 已完成的改造

### 1. 新增消息渠道支持

#### 1.1 企业微信 (WeCom)
**位置**: `/extensions/wecom/`

**文件结构**:
```
extensions/wecom/
├── index.ts                    # 扩展入口
├── package.json               # 依赖配置
└── src/
    ├── channel.ts            # 渠道插件实现
    ├── config-schema.ts      # 配置模式定义
    └── onboarding.ts         # 初始化向导
```

**功能**:
- 企业微信消息接收和发送
- 支持文本、图片、文件等多种消息类型
- 群聊消息处理
- WebSocket事件订阅
- 完整的配置向导

**配置项**:
- `corpId`: 企业ID
- `corpSecret`: 企业密钥
- `agentId`: 应用ID

#### 1.2 钉钉 (DingTalk)
**位置**: `/extensions/dingtalk/`

**文件结构**:
```
extensions/dingtalk/
├── index.ts                    # 扩展入口
├── package.json               # 依赖配置
└── src/
    ├── channel.ts            # 渠道插件实现
    ├── config-schema.ts      # 配置模式定义
    └── onboarding.ts         # 初始化向导
```

**功能**:
- 钉钉消息接收和发送
- 支持文本、图片、文件等多种消息类型
- 群聊消息处理
- Webhook和Stream模式支持
- 完整的配置向导

**配置项**:
- `appKey`: 应用Key
- `appSecret`: 应用密钥
- `robotCode`: 机器人Code（可选）

**注**: 飞书(Feishu)扩展已在原项目中存在，无需添加。

---

### 2. 国际化(i18n)和汉化

#### 2.1 中文语言包
**位置**: `/src/i18n/zh-CN.ts`

**内容**:
- 通用UI文本翻译
- 初始化向导翻译
- 渠道配置翻译
- AI模型配置翻译
- 网关和服务翻译
- 错误消息翻译

#### 2.2 i18n工具函数
**位置**: `/src/i18n/index.ts`

**功能**:
- 自动语言检测（基于环境变量）
- 翻译函数 `t(key, defaultText)`
- 支持嵌套键路径
- 回退到默认英文文本

**使用示例**:
```typescript
import { t } from './i18n';

console.log(t('common.welcome')); // 输出: "欢迎"
console.log(t('channels.wecom')); // 输出: "企业微信"
```

#### 2.3 中文初始化命令
**位置**: `/src/commands/onboard-cn.ts`

**功能**:
- 中文交互式配置向导
- 中文提示和说明
- 集成南梦AI配置指引

---

### 3. Docker部署优化

#### 3.1 中国优化的Dockerfile
**位置**: `/Dockerfile.cn`

**优化内容**:
- 使用阿里云npm镜像
- Node.js镜像从国内源拉取
- 多阶段构建优化
- 预装所有扩展
- 中文环境变量配置

**特性**:
- 基于 `node:22-slim`
- pnpm包管理器
- 非root用户运行
- 健康检查配置

#### 3.2 中国版Docker Compose
**位置**: `/docker-compose.cn.yml`

**配置**:
- 自动重启策略
- 健康检查
- 资源限制建议
- 中文环境变量
- 南梦AI配置示例

**环境变量支持**:
- `OPENCLAW_LANG=zh-CN`: 中文界面
- `LANG=zh_CN.UTF-8`: 系统语言
- AI模型配置（南梦AI）
- 企业微信、钉钉、飞书配置

#### 3.3 环境变量模板
**位置**: `/.env.cn.example`

**内容**:
- 详细的中文注释
- 南梦AI配置示例（使用官网 https://www.nanmengai.cn）
- 企业微信配置模板
- 钉钉配置模板
- 飞书配置模板
- 其他渠道配置模板

#### 3.4 Docker镜像加速
**位置**: `/scripts/build-docker-cn.sh`

**功能**:
- 自动检测Docker安装
- 测试并选择最快的镜像源
- 配置镜像加速器
- 优化构建过程

**内置镜像源**:
- https://docker.1ms.run
- https://docker.1panel.live
- https://docker.m.daocloud.io
- https://proxy.vvvv.ee
- https://mirror.ccs.tencentyun.com

#### 3.5 部署脚本
**位置**: `/scripts/deploy-cn.sh`

**功能**:
- 一键部署
- 自动安装Docker
- 配置镜像加速
- 生成安全令牌
- 启动服务
- 显示访问信息

---

### 4. Web界面初始化系统

#### 4.1 初始化Web界面
**位置**: `/ui/src/setup/index.html`

**功能**:
- 友好的中文向导界面
- 4步配置流程
- 实时表单验证
- 配置摘要预览
- 响应式设计

**配置步骤**:
1. AI模型配置
2. 消息渠道配置
3. 网关安全配置
4. 确认并完成

#### 4.2 前端交互逻辑
**位置**: `/ui/src/setup/setup.js`

**功能**:
- 步骤导航
- 表单验证
- API调用
- 配置生成
- 错误处理

**AI平台支持**:
- 南梦AI（推荐，使用 https://www.nanmengai.cn）
- OpenAI
- 自定义OpenAI兼容接口

#### 4.3 后端API端点
**位置**: `/src/gateway/server-methods/setup.ts`

**API端点**:
- `GET /api/config/status`: 检查配置状态
- `POST /api/setup/ai`: 配置AI模型
- `POST /api/setup/channels`: 配置消息渠道
- `POST /api/setup/security`: 配置安全选项
- `POST /api/setup/complete`: 完成初始化

---

### 5. 预装所有扩展

#### 5.1 扩展安装脚本
**位置**: `/scripts/install-all-extensions-cn.sh`

**功能**:
- 自动安装所有渠道扩展
- 自动安装所有技能插件
- 跳过已安装的扩展
- 显示安装进度

**包含的扩展**:
- 企业微信 (wecom)
- 钉钉 (dingtalk)
- 飞书 (feishu)
- WhatsApp
- Telegram
- Slack
- Discord
- Signal
- iMessage
- Matrix
- Google Chat
- Microsoft Teams

#### 5.2 中国版package.json
**位置**: `/package-cn.json`

**特性**:
- 预配置所有依赖
- 使用淘宝npm镜像
- 优化的构建脚本
- 中国版标识

---

### 6. 中文文档

#### 6.1 中文README
**位置**: `/README.zh-CN.md`

**内容**:
- 项目介绍
- 快速开始
- 支持的渠道
- AI模型配置（南梦AI示例）
- 渠道配置说明
- Docker加速镜像
- 文档链接

#### 6.2 部署指南
**位置**: `/docs/zh-CN/deployment-guide.md`

**内容**:
- Docker部署详细步骤
- npm安装步骤
- 源码构建步骤
- Web初始化向导说明
- 环境变量配置
- 常见问题解答
- 生产环境建议

---

## 🔧 配置说明

### 南梦AI配置

南梦AI是推荐的AI模型提供商，提供500+优质模型。

**官网**: https://www.nanmengai.cn  
**API端点**: https://api.nanmengai.cn/v1

**配置示例**:
```yaml
agents:
  defaults:
    model: "gpt-4o"
    providers:
      - type: openai
        apiKey: "sk-your-nanmeng-api-key"
        baseURL: "https://api.nanmengai.cn/v1"
```

### 企业微信配置

1. 访问 https://work.weixin.qq.com/
2. 创建自建应用
3. 获取配置信息:
   - Corp ID
   - Agent ID
   - Corp Secret
4. 配置回调URL和可信域名

### 钉钉配置

1. 访问 https://open.dingtalk.com/
2. 创建企业内部应用
3. 获取配置信息:
   - App Key
   - App Secret
4. 配置消息接收地址

### 飞书配置

1. 访问 https://open.feishu.cn/
2. 创建应用并启用机器人
3. 获取配置信息:
   - App ID
   - App Secret
4. 启用事件订阅(WebSocket)

---

## 📝 使用说明

### Docker部署

```bash
# 一键部署
curl -fsSL https://openclaw.ai/deploy-cn.sh | bash

# 或手动部署
docker-compose -f docker-compose.cn.yml up -d
```

### Web初始化

1. 访问 `http://localhost:18789`
2. 按照向导完成配置
3. 开始使用

### 环境变量配置

复制并编辑环境变量文件:
```bash
cp .env.cn.example .env
nano .env
```

---

## 🎯 技术特点

1. **完全中文化**: 所有用户接触的界面和文档都已汉化
2. **开箱即用**: 预装所有扩展，无需额外安装
3. **网络优化**: Docker镜像加速，npm镜像加速
4. **友好配置**: Web界面替代命令行，降低使用门槛
5. **南梦AI集成**: 提供500+模型选择的优质平台

---

## 🚀 下一步计划

- [ ] 添加更多中文文档
- [ ] 优化Web UI界面
- [ ] 添加配置导入/导出功能
- [ ] 支持更多国内AI平台
- [ ] 添加中文技能插件

---

## 📞 支持

- GitHub Issues: https://github.com/NanMengAI/openclaw/issues
- 官方网站: https://openclaw.ai
- 南梦AI官网: https://www.nanmengai.cn

---

**最后更新**: 2024年
**维护者**: OpenClaw中国版团队
