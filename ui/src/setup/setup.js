/**
 * OpenClaw Web初始化向导
 * 提供友好的Web界面替代命令行onboard流程
 */

let currentStep = 1;
const totalSteps = 4;

// 配置数据
const config = {
    aiProvider: 'nanmengai',
    apiKey: '',
    apiEndpoint: '',
    defaultModel: 'gpt-4o',
    channels: {
        wecom: { enabled: false, corpId: '', corpSecret: '', agentId: '' },
        dingtalk: { enabled: false, appKey: '', appSecret: '' },
        feishu: { enabled: false, appId: '', appSecret: '' },
    },
    gateway: {
        token: '',
        password: '',
    },
};

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    checkExistingConfig();
});

// 设置事件监听
function setupEventListeners() {
    // AI平台选择
    document.getElementById('aiProvider').addEventListener('change', (e) => {
        const provider = e.target.value;
        const customEndpointGroup = document.getElementById('customEndpointGroup');
        const apiKeyHint = document.getElementById('apiKeyHint');
        
        if (provider === 'nanmengai') {
            customEndpointGroup.style.display = 'none';
            apiKeyHint.textContent = '访问 https://www.nanmengai.cn 获取API密钥';
        } else if (provider === 'openai') {
            customEndpointGroup.style.display = 'none';
            apiKeyHint.textContent = '访问 https://platform.openai.com 获取API密钥';
        } else {
            customEndpointGroup.style.display = 'block';
            apiKeyHint.textContent = '输入自定义API端点和密钥';
        }
    });

    // 渠道启用/禁用
    document.getElementById('enableWecom').addEventListener('change', (e) => {
        document.getElementById('wecomConfig').style.display = e.target.checked ? 'block' : 'none';
    });
    
    document.getElementById('enableDingtalk').addEventListener('change', (e) => {
        document.getElementById('dingtalkConfig').style.display = e.target.checked ? 'block' : 'none';
    });
    
    document.getElementById('enableFeishu').addEventListener('change', (e) => {
        document.getElementById('feishuConfig').style.display = e.target.checked ? 'block' : 'none';
    });
}

// 检查是否已有配置
async function checkExistingConfig() {
    try {
        const response = await fetch('/api/config/status');
        if (response.ok) {
            const data = await response.json();
            if (data.configured) {
                // 如果已配置，直接跳转到控制面板
                if (confirm('检测到已有配置，是否直接进入控制面板？')) {
                    goToDashboard();
                }
            }
        }
    } catch (error) {
        console.log('检查配置状态失败:', error);
    }
}

// 下一步
function nextStep(current) {
    // 验证当前步骤
    if (!validateStep(current)) {
        return;
    }

    // 保存当前步骤数据
    saveStepData(current);

    // 如果是倒数第二步，生成配置摘要
    if (current === 3) {
        generateConfigSummary();
    }

    // 更新步骤
    if (current < totalSteps) {
        currentStep = current + 1;
        updateStepDisplay();
    }
}

// 上一步
function prevStep(current) {
    if (current > 1) {
        currentStep = current - 1;
        updateStepDisplay();
    }
}

// 验证步骤
function validateStep(step) {
    clearError();

    if (step === 1) {
        const apiKey = document.getElementById('apiKey').value.trim();
        const customEndpoint = document.getElementById('apiEndpoint').value.trim();
        const provider = document.getElementById('aiProvider').value;

        if (!apiKey) {
            showError('请输入API密钥');
            return false;
        }

        if (provider === 'custom' && !customEndpoint) {
            showError('请输入自定义API端点');
            return false;
        }
    }

    return true;
}

// 保存步骤数据
function saveStepData(step) {
    if (step === 1) {
        config.aiProvider = document.getElementById('aiProvider').value;
        config.apiKey = document.getElementById('apiKey').value.trim();
        config.apiEndpoint = document.getElementById('apiEndpoint').value.trim();
        config.defaultModel = document.getElementById('defaultModel').value.trim();
    } else if (step === 2) {
        // 企业微信
        config.channels.wecom.enabled = document.getElementById('enableWecom').checked;
        if (config.channels.wecom.enabled) {
            config.channels.wecom.corpId = document.getElementById('wecomCorpId').value.trim();
            config.channels.wecom.corpSecret = document.getElementById('wecomCorpSecret').value.trim();
            config.channels.wecom.agentId = document.getElementById('wecomAgentId').value.trim();
        }

        // 钉钉
        config.channels.dingtalk.enabled = document.getElementById('enableDingtalk').checked;
        if (config.channels.dingtalk.enabled) {
            config.channels.dingtalk.appKey = document.getElementById('dingtalkAppKey').value.trim();
            config.channels.dingtalk.appSecret = document.getElementById('dingtalkAppSecret').value.trim();
        }

        // 飞书
        config.channels.feishu.enabled = document.getElementById('enableFeishu').checked;
        if (config.channels.feishu.enabled) {
            config.channels.feishu.appId = document.getElementById('feishuAppId').value.trim();
            config.channels.feishu.appSecret = document.getElementById('feishuAppSecret').value.trim();
        }
    } else if (step === 3) {
        config.gateway.token = document.getElementById('gatewayToken').value.trim();
        config.gateway.password = document.getElementById('gatewayPassword').value.trim();
    }
}

// 生成配置摘要
function generateConfigSummary() {
    const summary = document.getElementById('configSummary');
    let html = '<div style="background: #f5f5f5; padding: 20px; border-radius: 8px;">';
    
    html += '<h3>AI模型配置</h3>';
    html += `<p>平台: ${getProviderName(config.aiProvider)}</p>`;
    html += `<p>模型: ${config.defaultModel}</p>`;
    
    html += '<h3 style="margin-top: 20px;">消息渠道</h3>';
    const enabledChannels = [];
    if (config.channels.wecom.enabled) enabledChannels.push('企业微信');
    if (config.channels.dingtalk.enabled) enabledChannels.push('钉钉');
    if (config.channels.feishu.enabled) enabledChannels.push('飞书');
    html += `<p>${enabledChannels.length > 0 ? enabledChannels.join(', ') : '未配置渠道'}</p>`;
    
    html += '<h3 style="margin-top: 20px;">安全配置</h3>';
    html += `<p>${config.gateway.token ? '已设置访问令牌' : (config.gateway.password ? '已设置密码' : '未设置安全凭证')}</p>`;
    
    html += '</div>';
    summary.innerHTML = html;
}

// 获取平台名称
function getProviderName(provider) {
    const names = {
        'nanmengai': '南梦AI',
        'openai': 'OpenAI',
        'custom': '自定义平台',
    };
    return names[provider] || provider;
}

// 完成设置
async function finishSetup() {
    // 显示加载动画
    document.getElementById('loadingSpinner').style.display = 'block';
    document.getElementById('confirmButtons').style.display = 'none';

    try {
        // 构建配置对象
        const configData = buildConfigData();

        // 发送到后端
        const response = await fetch('/api/setup/initialize', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(configData),
        });

        if (!response.ok) {
            throw new Error('配置保存失败');
        }

        // 显示成功页面
        document.getElementById('step4').style.display = 'none';
        document.getElementById('stepSuccess').style.display = 'block';
    } catch (error) {
        // 隐藏加载动画
        document.getElementById('loadingSpinner').style.display = 'none';
        document.getElementById('confirmButtons').style.display = 'flex';
        
        showError('配置保存失败: ' + error.message);
    }
}

// 构建配置数据
function buildConfigData() {
    const data = {
        agents: {
            defaults: {
                model: config.defaultModel,
                providers: [],
            },
        },
        channels: {},
        gateway: {},
    };

    // AI Provider配置
    let baseURL = '';
    if (config.aiProvider === 'nanmengai') {
        baseURL = 'https://api.nanmengai.cn/v1';
    } else if (config.aiProvider === 'openai') {
        baseURL = 'https://api.openai.com/v1';
    } else {
        baseURL = config.apiEndpoint;
    }

    data.agents.defaults.providers.push({
        type: 'openai',
        apiKey: config.apiKey,
        baseURL: baseURL,
    });

    // 渠道配置
    if (config.channels.wecom.enabled) {
        data.channels.wecom = {
            enabled: true,
            corpId: config.channels.wecom.corpId,
            corpSecret: config.channels.wecom.corpSecret,
            agentId: config.channels.wecom.agentId,
        };
    }

    if (config.channels.dingtalk.enabled) {
        data.channels.dingtalk = {
            enabled: true,
            appKey: config.channels.dingtalk.appKey,
            appSecret: config.channels.dingtalk.appSecret,
        };
    }

    if (config.channels.feishu.enabled) {
        data.channels.feishu = {
            enabled: true,
            appId: config.channels.feishu.appId,
            appSecret: config.channels.feishu.appSecret,
            domain: 'feishu',
        };
    }

    // 网关配置
    if (config.gateway.token) {
        data.gateway.auth = {
            mode: 'token',
            token: config.gateway.token,
        };
    } else if (config.gateway.password) {
        data.gateway.auth = {
            mode: 'password',
            password: config.gateway.password,
        };
    }

    return data;
}

// 更新步骤显示
function updateStepDisplay() {
    // 更新步骤内容
    document.querySelectorAll('.step').forEach(step => {
        step.classList.remove('active');
    });
    document.getElementById(`step${currentStep}`).classList.add('active');

    // 更新指示器
    document.querySelectorAll('.step-dot').forEach((dot, index) => {
        dot.classList.remove('active', 'completed');
        if (index + 1 < currentStep) {
            dot.classList.add('completed');
        } else if (index + 1 === currentStep) {
            dot.classList.add('active');
        }
    });
}

// 显示错误
function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}

// 清除错误
function clearError() {
    document.getElementById('errorMessage').style.display = 'none';
}

// 进入控制面板
function goToDashboard() {
    window.location.href = '/';
}
