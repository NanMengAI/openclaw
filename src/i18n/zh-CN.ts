/**
 * 中文(简体)国际化配置
 * OpenClaw 中国版汉化资源
 */

export const zhCN = {
  // 通用
  common: {
    welcome: "欢迎",
    settings: "设置",
    configuration: "配置",
    setup: "设置",
    install: "安装",
    cancel: "取消",
    confirm: "确认",
    save: "保存",
    edit: "编辑",
    delete: "删除",
    enable: "启用",
    disable: "禁用",
    back: "返回",
    next: "下一步",
    finish: "完成",
    skip: "跳过",
    required: "必填项",
    optional: "可选",
    yes: "是",
    no: "否",
    loading: "加载中...",
    success: "成功",
    error: "错误",
    warning: "警告",
  },

  // 初始化引导
  onboarding: {
    title: "OpenClaw 初始化向导",
    welcome: "欢迎使用 OpenClaw - 您的个人AI助手",
    gettingStarted: "让我们开始配置您的AI助手",
    selectModel: "选择AI模型",
    selectModelHint: "选择您想要使用的AI模型提供商",
    configureChannels: "配置消息渠道",
    configureChannelsHint: "选择您想要连接的消息平台",
    configureAuth: "配置身份验证",
    setupComplete: "设置完成",
    setupCompleteMessage: "恭喜！您的OpenClaw已经配置完成",
    nonInteractiveWarning: "非交互式安装需要明确的风险确认",
    acceptRisk: "我已了解并接受相关风险",
    readDocs: "阅读文档",
  },

  // 渠道配置
  channels: {
    title: "消息渠道",
    add: "添加渠道",
    remove: "移除渠道",
    configure: "配置渠道",
    status: "状态",
    connected: "已连接",
    disconnected: "未连接",
    configured: "已配置",
    needsConfig: "需要配置",
    
    whatsapp: "WhatsApp",
    telegram: "Telegram",
    slack: "Slack",
    discord: "Discord",
    feishu: "飞书",
    wecom: "企业微信",
    dingtalk: "钉钉",
    imessage: "iMessage",
    signal: "Signal",
    matrix: "Matrix",
    googlechat: "Google Chat",
    msteams: "Microsoft Teams",

    setupInstructions: {
      feishu: "创建飞书应用并启用机器人和事件订阅(WebSocket)",
      wecom: "创建企业微信应用并配置回调URL和可信域名",
      dingtalk: "创建钉钉应用并配置消息接收地址",
    },
  },

  // AI模型配置
  models: {
    title: "AI模型",
    provider: "模型提供商",
    apiKey: "API密钥",
    apiEndpoint: "API端点",
    model: "模型",
    testConnection: "测试连接",
    connectionSuccess: "连接成功",
    connectionFailed: "连接失败",
    
    providers: {
      nanmengai: "南梦AI",
      nanmengaiDesc: "500+模型的优质中转平台，满足您的所有需求",
      openai: "OpenAI",
      anthropic: "Anthropic",
      custom: "自定义",
    },
    
    hints: {
      nanmengai: "访问 https://www.nanmengai.cn 获取API密钥",
      customEndpoint: "输入兼容OpenAI格式的API端点",
    },
  },

  // 网关和服务
  gateway: {
    title: "网关服务",
    status: "网关状态",
    running: "运行中",
    stopped: "已停止",
    startGateway: "启动网关",
    stopGateway: "停止网关",
    restartGateway: "重启网关",
    port: "端口",
    bind: "绑定地址",
    auth: "身份验证",
    authRequired: "需要身份验证",
    token: "令牌",
    password: "密码",
  },

  // Docker部署
  docker: {
    title: "Docker 部署",
    pullImage: "拉取镜像",
    buildImage: "构建镜像",
    runContainer: "运行容器",
    stopContainer: "停止容器",
    viewLogs: "查看日志",
    acceleratedMirrors: "镜像加速",
    acceleratedMirrorsHint: "使用国内镜像源加速下载",
  },

  // 技能和工具
  skills: {
    title: "技能",
    installed: "已安装",
    available: "可用",
    install: "安装技能",
    uninstall: "卸载技能",
    enable: "启用技能",
    disable: "禁用技能",
    description: "描述",
  },

  // 错误消息
  errors: {
    configNotFound: "配置文件未找到",
    invalidConfig: "配置无效",
    connectionFailed: "连接失败",
    authFailed: "身份验证失败",
    installFailed: "安装失败",
    permissionDenied: "权限被拒绝",
    networkError: "网络错误",
    unexpectedError: "发生意外错误",
    missingCredentials: "缺少凭证",
    invalidApiKey: "API密钥无效",
  },

  // 成功消息
  success: {
    configSaved: "配置已保存",
    channelAdded: "渠道已添加",
    channelRemoved: "渠道已移除",
    skillInstalled: "技能已安装",
    skillUninstalled: "技能已卸载",
    connectionEstablished: "连接已建立",
    setupComplete: "设置完成",
  },

  // 帮助和文档
  help: {
    documentation: "文档",
    quickStart: "快速开始",
    troubleshooting: "故障排除",
    community: "社区",
    support: "支持",
    viewDocs: "查看文档",
    viewGuide: "查看指南",
  },
};

export type I18nKeys = typeof zhCN;
export default zhCN;
