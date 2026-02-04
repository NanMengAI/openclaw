/**
 * Web初始化API端点
 * 提供Web界面配置功能的后端支持
 */

import type { GatewayRequestHandler } from "./types.js";
import { writeConfig, readConfigFileSnapshot } from "../../config/config.js";
import { resolveUserPath } from "../../utils.js";
import fs from "node:fs";
import path from "node:path";

/**
 * 检查配置状态
 */
export const setupCheckStatus: GatewayRequestHandler = async ({ respond }) => {
  try {
    const snapshot = await readConfigFileSnapshot();
    const configured = snapshot.valid && snapshot.config.agents?.defaults?.model;

    respond({
      ok: true,
      configured: Boolean(configured),
      hasChannels: Boolean(snapshot.config.channels && Object.keys(snapshot.config.channels).length > 0),
    });
  } catch (error) {
    respond({
      ok: false,
      error: String(error),
    });
  }
};

/**
 * 初始化配置
 */
export const setupInitialize: GatewayRequestHandler = async ({ request, respond }) => {
  try {
    const configData = request.config;

    if (!configData) {
      respond({
        ok: false,
        error: "Missing configuration data",
      });
      return;
    }

    // 验证必要的配置
    if (!configData.agents?.defaults?.model) {
      respond({
        ok: false,
        error: "Missing AI model configuration",
      });
      return;
    }

    if (!configData.agents?.defaults?.providers || configData.agents.defaults.providers.length === 0) {
      respond({
        ok: false,
        error: "Missing AI provider configuration",
      });
      return;
    }

    // 读取现有配置（如果有）
    const snapshot = await readConfigFileSnapshot();
    const existingConfig = snapshot.valid ? snapshot.config : {};

    // 合并配置
    const mergedConfig = {
      ...existingConfig,
      agents: {
        ...existingConfig.agents,
        defaults: {
          ...existingConfig.agents?.defaults,
          ...configData.agents.defaults,
        },
      },
      channels: {
        ...existingConfig.channels,
        ...configData.channels,
      },
      gateway: {
        ...existingConfig.gateway,
        ...configData.gateway,
      },
    };

    // 写入配置文件
    await writeConfig(mergedConfig);

    // 创建必要的目录
    const configHome = resolveUserPath("~/.openclaw");
    const workspaceDir = path.join(configHome, "workspace");
    const sessionsDir = path.join(configHome, "sessions");

    if (!fs.existsSync(workspaceDir)) {
      fs.mkdirSync(workspaceDir, { recursive: true });
    }

    if (!fs.existsSync(sessionsDir)) {
      fs.mkdirSync(sessionsDir, { recursive: true });
    }

    respond({
      ok: true,
      message: "Configuration initialized successfully",
    });
  } catch (error) {
    respond({
      ok: false,
      error: String(error),
    });
  }
};

/**
 * 获取当前配置
 */
export const setupGetConfig: GatewayRequestHandler = async ({ respond }) => {
  try {
    const snapshot = await readConfigFileSnapshot();
    
    if (!snapshot.valid) {
      respond({
        ok: false,
        error: "No valid configuration found",
      });
      return;
    }

    // 不返回敏感信息（密钥等）
    const sanitizedConfig = {
      agents: {
        defaults: {
          model: snapshot.config.agents?.defaults?.model,
          providers: snapshot.config.agents?.defaults?.providers?.map(p => ({
            type: p.type,
            baseURL: p.baseURL,
          })),
        },
      },
      channels: Object.keys(snapshot.config.channels || {}).reduce((acc, key) => {
        const channel = snapshot.config.channels?.[key];
        acc[key] = {
          enabled: channel?.enabled,
        };
        return acc;
      }, {} as Record<string, any>),
      gateway: {
        auth: {
          mode: snapshot.config.gateway?.auth?.mode || "none",
        },
      },
    };

    respond({
      ok: true,
      config: sanitizedConfig,
    });
  } catch (error) {
    respond({
      ok: false,
      error: String(error),
    });
  }
};

/**
 * 测试AI模型连接
 */
export const setupTestAIConnection: GatewayRequestHandler = async ({ request, respond }) => {
  try {
    const { apiKey, baseURL, model } = request;

    if (!apiKey || !baseURL) {
      respond({
        ok: false,
        error: "Missing API key or base URL",
      });
      return;
    }

    // 简单的健康检查请求
    const testResponse = await fetch(`${baseURL}/models`, {
      headers: {
        "Authorization": `Bearer ${apiKey}`,
      },
    });

    if (!testResponse.ok) {
      respond({
        ok: false,
        error: `API request failed: ${testResponse.statusText}`,
      });
      return;
    }

    respond({
      ok: true,
      message: "Connection successful",
    });
  } catch (error) {
    respond({
      ok: false,
      error: String(error),
    });
  }
};
