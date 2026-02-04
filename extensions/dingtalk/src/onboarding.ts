import type {
  ChannelOnboardingAdapter,
  ChannelOnboardingDmPolicy,
  DmPolicy,
  OpenClawConfig,
  WizardPrompter,
} from "openclaw/plugin-sdk";
import {
  addWildcardAllowFrom,
  DEFAULT_ACCOUNT_ID,
  formatDocsLink,
  normalizeAccountId,
  promptAccountId,
} from "openclaw/plugin-sdk";

const channel = "dingtalk" as const;

function listDingTalkAccountIds(cfg: OpenClawConfig): string[] {
  const dingtalkCfg = cfg.channels?.dingtalk;
  const accounts = dingtalkCfg?.accounts;
  const ids = new Set<string>();

  const baseConfigured = Boolean(
    dingtalkCfg?.appKey?.trim() && 
    (dingtalkCfg?.appSecret?.trim() || Boolean(dingtalkCfg?.appSecretFile))
  );
  const envConfigured = Boolean(
    process.env.DINGTALK_APP_KEY?.trim() && 
    process.env.DINGTALK_APP_SECRET?.trim()
  );
  if (baseConfigured || envConfigured) {
    ids.add(DEFAULT_ACCOUNT_ID);
  }

  if (accounts) {
    for (const id of Object.keys(accounts)) {
      ids.add(normalizeAccountId(id));
    }
  }

  return Array.from(ids);
}

function resolveDefaultDingTalkAccountId(cfg: OpenClawConfig): string {
  const ids = listDingTalkAccountIds(cfg);
  if (ids.includes(DEFAULT_ACCOUNT_ID)) {
    return DEFAULT_ACCOUNT_ID;
  }
  return ids[0] ?? DEFAULT_ACCOUNT_ID;
}

function setDingTalkDmPolicy(cfg: OpenClawConfig, policy: DmPolicy): OpenClawConfig {
  const allowFrom =
    policy === "open" ? addWildcardAllowFrom(cfg.channels?.dingtalk?.allowFrom) : undefined;
  return {
    ...cfg,
    channels: {
      ...cfg.channels,
      dingtalk: {
        ...cfg.channels?.dingtalk,
        enabled: true,
        dmPolicy: policy,
        ...(allowFrom ? { allowFrom } : {}),
      },
    },
  };
}

async function noteDingTalkSetup(prompter: WizardPrompter): Promise<void> {
  await prompter.note(
    [
      "创建钉钉应用并配置:",
      "1. 访问钉钉开放平台: open.dingtalk.com",
      "2. 创建企业内部应用或机器人，记录 AppKey 和 AppSecret",
      "3. 配置消息接收地址和回调URL",
      "4. 配置机器人权限和可见范围",
      `文档: ${formatDocsLink("/channels/dingtalk", "channels/dingtalk")}`,
    ].join("\n"),
    "钉钉设置",
  );
}

function normalizeAllowEntry(entry: string): string {
  return entry.replace(/^dingtalk:/i, "").trim();
}

async function promptDingTalkAllowFrom(params: {
  cfg: OpenClawConfig;
  prompter: WizardPrompter;
  accountId?: string | null;
}): Promise<OpenClawConfig> {
  const { cfg, prompter } = params;
  const accountId = normalizeAccountId(params.accountId);
  const isDefault = accountId === DEFAULT_ACCOUNT_ID;
  const existingAllowFrom = isDefault
    ? (cfg.channels?.dingtalk?.allowFrom ?? [])
    : (cfg.channels?.dingtalk?.accounts?.[accountId]?.allowFrom ?? []);

  const entry = await prompter.text({
    message: "钉钉 allowFrom (用户ID或StaffID)",
    placeholder: "StaffID",
    initialValue: existingAllowFrom[0] ? String(existingAllowFrom[0]) : undefined,
    validate: (value) => {
      const raw = String(value ?? "").trim();
      if (!raw) {
        return "必填项";
      }
      return undefined;
    },
  });

  const parsed = String(entry)
    .split(/[\n,;]+/g)
    .map((item) => normalizeAllowEntry(item))
    .filter(Boolean);
  const merged = [
    ...existingAllowFrom.map((item) => normalizeAllowEntry(String(item))),
    ...parsed,
  ].filter(Boolean);
  const unique = Array.from(new Set(merged));

  if (isDefault) {
    return {
      ...cfg,
      channels: {
        ...cfg.channels,
        dingtalk: {
          ...cfg.channels?.dingtalk,
          enabled: true,
          dmPolicy: "allowlist",
          allowFrom: unique,
        },
      },
    };
  }

  return {
    ...cfg,
    channels: {
      ...cfg.channels,
      dingtalk: {
        ...cfg.channels?.dingtalk,
        enabled: true,
        accounts: {
          ...cfg.channels?.dingtalk?.accounts,
          [accountId]: {
            ...cfg.channels?.dingtalk?.accounts?.[accountId],
            enabled: cfg.channels?.dingtalk?.accounts?.[accountId]?.enabled ?? true,
            dmPolicy: "allowlist",
            allowFrom: unique,
          },
        },
      },
    },
  };
}

const dmPolicy: ChannelOnboardingDmPolicy = {
  label: "钉钉",
  channel,
  policyKey: "channels.dingtalk.dmPolicy",
  allowFromKey: "channels.dingtalk.allowFrom",
  getCurrent: (cfg) => cfg.channels?.dingtalk?.dmPolicy ?? "pairing",
  setPolicy: (cfg, policy) => setDingTalkDmPolicy(cfg, policy),
  promptAllowFrom: promptDingTalkAllowFrom,
};

function updateDingTalkConfig(
  cfg: OpenClawConfig,
  accountId: string,
  updates: { appKey?: string; appSecret?: string; robotCode?: string; enabled?: boolean },
): OpenClawConfig {
  const isDefault = accountId === DEFAULT_ACCOUNT_ID;
  const next = { ...cfg } as OpenClawConfig;
  const dingtalk = { ...next.channels?.dingtalk } as Record<string, unknown>;
  const accounts = dingtalk.accounts
    ? { ...(dingtalk.accounts as Record<string, unknown>) }
    : undefined;

  if (isDefault && !accounts) {
    return {
      ...next,
      channels: {
        ...next.channels,
        dingtalk: {
          ...dingtalk,
          ...updates,
          enabled: updates.enabled ?? true,
        },
      },
    };
  }

  const resolvedAccounts = accounts ?? {};
  const existing = (resolvedAccounts[accountId] as Record<string, unknown>) ?? {};
  resolvedAccounts[accountId] = {
    ...existing,
    ...updates,
    enabled: updates.enabled ?? true,
  };

  return {
    ...next,
    channels: {
      ...next.channels,
      dingtalk: {
        ...dingtalk,
        accounts: resolvedAccounts,
      },
    },
  };
}

export const dingtalkOnboardingAdapter: ChannelOnboardingAdapter = {
  channel,
  dmPolicy,
  getStatus: async ({ cfg }) => {
    const configured = listDingTalkAccountIds(cfg).length > 0;
    return {
      channel,
      configured,
      statusLines: [`钉钉: ${configured ? "已配置" : "需要应用凭证"}`],
      selectionHint: configured ? "已配置" : "需要应用凭证",
      quickstartScore: configured ? 1 : 10,
    };
  },
  configure: async ({ cfg, prompter, accountOverrides, shouldPromptAccountIds }) => {
    let next = cfg;
    const override = accountOverrides.dingtalk?.trim();
    const defaultId = resolveDefaultDingTalkAccountId(next);
    let accountId = override ? normalizeAccountId(override) : defaultId;

    if (shouldPromptAccountIds && !override) {
      accountId = await promptAccountId({
        cfg: next,
        prompter,
        label: "钉钉",
        currentId: accountId,
        listAccountIds: listDingTalkAccountIds,
        defaultAccountId: defaultId,
      });
    }

    await noteDingTalkSetup(prompter);

    const isDefault = accountId === DEFAULT_ACCOUNT_ID;
    const envAppKey = process.env.DINGTALK_APP_KEY?.trim();
    const envSecret = process.env.DINGTALK_APP_SECRET?.trim();
    
    if (isDefault && envAppKey && envSecret) {
      const useEnv = await prompter.confirm({
        message: "检测到环境变量 DINGTALK_APP_KEY/DINGTALK_APP_SECRET，是否使用?",
        initialValue: true,
      });
      if (useEnv) {
        next = updateDingTalkConfig(next, accountId, { enabled: true });
        return { cfg: next, accountId };
      }
    }

    const appKey = String(
      await prompter.text({
        message: "钉钉 AppKey",
        initialValue: next.channels?.dingtalk?.appKey?.trim() || undefined,
        validate: (value) => (String(value ?? "").trim() ? undefined : "必填项"),
      }),
    ).trim();

    const appSecret = String(
      await prompter.text({
        message: "钉钉 AppSecret",
        initialValue: next.channels?.dingtalk?.appSecret?.trim() || undefined,
        validate: (value) => (String(value ?? "").trim() ? undefined : "必填项"),
      }),
    ).trim();

    const robotCode = String(
      await prompter.text({
        message: "钉钉 Robot Code (可选)",
        initialValue: next.channels?.dingtalk?.robotCode?.trim() || "",
      }),
    ).trim();

    next = updateDingTalkConfig(next, accountId, { appKey, appSecret, robotCode: robotCode || undefined, enabled: true });

    return { cfg: next, accountId };
  },
};
