/**
 * 中文版初始化命令
 * 为中国用户提供友好的中文引导体验
 */

import type { RuntimeEnv } from "../runtime.js";
import type { OnboardOptions } from "./onboard-types.js";
import { setLanguage, t, locale } from "../i18n/index.js";
import { onboardCommand } from "./onboard.js";

/**
 * 中文初始化命令包装器
 * 自动设置为中文环境并执行初始化
 */
export async function onboardCommandCN(
  opts: OnboardOptions,
  runtime: RuntimeEnv
): Promise<void> {
  // 设置为中文环境
  setLanguage("zh-CN");

  // 显示中文欢迎信息
  runtime.log("\n");
  runtime.log("=".repeat(60));
  runtime.log(t("onboarding.title"));
  runtime.log(t("onboarding.welcome"));
  runtime.log("=".repeat(60));
  runtime.log("\n");

  // 针对Windows用户的中文提示
  if (process.platform === "win32") {
    runtime.log(
      [
        locale(
          "检测到Windows系统 — OpenClaw在WSL2上运行最佳！",
          "Windows detected — OpenClaw runs great on WSL2!"
        ),
        locale(
          "原生Windows支持可能存在一些问题。",
          "Native Windows might be trickier."
        ),
        locale(
          "快速设置WSL2：wsl --install (一条命令，重启一次)",
          "Quick setup: wsl --install (one command, one reboot)"
        ),
        locale("指南：https://docs.openclaw.ai/zh-CN/windows", "Guide: https://docs.openclaw.ai/windows"),
      ].join("\n")
    );
    runtime.log("\n");
  }

  // 执行原始的onboard命令
  await onboardCommand(opts, runtime);

  // 显示完成信息
  runtime.log("\n");
  runtime.log("=".repeat(60));
  runtime.log(t("onboarding.setupComplete"));
  runtime.log(t("onboarding.setupCompleteMessage"));
  runtime.log(locale(
    "接下来，您可以通过 'openclaw gateway' 启动网关服务",
    "Next, start the gateway with 'openclaw gateway'"
  ));
  runtime.log("=".repeat(60));
  runtime.log("\n");
}

export type { OnboardOptions } from "./onboard-types.js";
