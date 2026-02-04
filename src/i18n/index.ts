/**
 * 国际化(i18n)工具函数
 * 支持中英双语切换
 */

import { zhCN, type I18nKeys } from "./zh-CN.js";

type Language = "zh-CN" | "en";

// 默认语言：通过环境变量或系统语言设置
const getDefaultLanguage = (): Language => {
  const env = process.env.OPENCLAW_LANG || process.env.LANG || "";
  if (env.toLowerCase().includes("zh") || env.toLowerCase().includes("cn")) {
    return "zh-CN";
  }
  return "en";
};

let currentLanguage: Language = getDefaultLanguage();

/**
 * 设置当前语言
 */
export function setLanguage(lang: Language): void {
  currentLanguage = lang;
}

/**
 * 获取当前语言
 */
export function getLanguage(): Language {
  return currentLanguage;
}

/**
 * 翻译函数 - 支持嵌套路径访问
 * @param key 翻译键，支持点号分隔的路径，如 "common.welcome"
 * @param fallback 可选的备用文本
 * @returns 翻译后的文本
 */
export function t(key: string, fallback?: string): string {
  if (currentLanguage === "en") {
    // 英文直接返回fallback或key
    return fallback || key;
  }

  // 中文从zhCN对象中获取
  const keys = key.split(".");
  let value: any = zhCN;

  for (const k of keys) {
    if (value && typeof value === "object" && k in value) {
      value = value[k];
    } else {
      // 如果找不到翻译，返回fallback或原始key
      return fallback || key;
    }
  }

  return typeof value === "string" ? value : fallback || key;
}

/**
 * 便捷的翻译函数，用于模板字符串
 * 示例: i18n`common.welcome`
 */
export function i18n(strings: TemplateStringsArray, ...values: any[]): string {
  const key = strings[0];
  return t(key, values[0]);
}

/**
 * 判断是否为中文环境
 */
export function isChinese(): boolean {
  return currentLanguage === "zh-CN";
}

/**
 * 多语言选择器
 * @param zh 中文文本
 * @param en 英文文本
 * @returns 根据当前语言返回对应文本
 */
export function locale(zh: string, en: string): string {
  return currentLanguage === "zh-CN" ? zh : en;
}

// 导出中文翻译对象，供类型检查使用
export { zhCN };
export type { I18nKeys };
