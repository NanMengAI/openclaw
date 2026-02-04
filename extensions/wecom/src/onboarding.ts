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

const channel = "wecom" as const;

function listWeComAccountIds(cfg: OpenClawConfig): string[] {
  const wecomCfg = cfg.channels?.wecom;
  const accounts = wecomCfg?.accounts;
  const ids = new Set<string>();

  const baseConfigured = Boolean(
    wecomCfg?.corpId?.trim() && 
    (wecomCfg?.corpSecret?.trim() || Boolean(wecomCfg?.corpSecretFile)) &&
    wecomCfg?.agentId?.trim()
  );
  const envConfigured = Boolean(
    process.env.WECOM_CORP_ID?.trim() && 
    process.env.WECOM_CORP_SECRET?.trim() &&
    process.env.WECOM_AGENT_ID?.trim()
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

function resolveDefaultWeComAccountId(cfg: OpenClawConfig): string {
  const ids = listWeComAccountIds(cfg);
  if (ids.includes(DEFAULT_ACCOUNT_ID)) {
    return DEFAULT_ACCOUNT_ID;
  }
  return ids[0] ?? DEFAULT_ACCOUNT_ID;
}

function setWeComDmPolicy(cfg: OpenClawConfig, policy: DmPolicy): OpenClawConfig {
  const allowFrom =
    policy === "open" ? addWildcardAllowFrom(cfg.channels?.wecom?.allowFrom) : undefined;
  return {
    ...cfg,
    channels: {
      ...cfg.channels,
      wecom: {
        ...cfg.channels?.wecom,
        enabled: true,
        dmPolicy: policy,
        ...(allowFrom ? { allowFrom } : {}),
      },
    },
  };
}

async function noteWeComSetup(prompter: WizardPrompter): Promise<void> {
  await prompter.note(
    [
      "创建企业微信应用并配置:",
      "1. 访问企业微信管理后台: work.weixin.qq.com",
      "2. 创建自建应用，记录 Corp ID、Agent ID 和 Corp Secret",
      "3. 配置应用回调 URL 和可信域名",
      "4. 设置应用可见范围",
      `文档: ${formatDocsLink("/channels/wecom", "channels/wecom")}`,
    ].join("\n"),
    "企业微信设置",
  );
}

function normalizeAllowEntry(entry: string): string {
  return entry.replace(/^wecom:/i, "").trim();
}

async function promptWeComAllowFrom(params: {
  cfg: OpenClawConfig;
  prompter: WizardPrompter;
  accountId?: string | null;
}): Promise<OpenClawConfig> {
  const { cfg, prompter } = params;
  const accountId = normalizeAccountId(params.accountId);
  const isDefault = accountId === DEFAULT_ACCOUNT_ID;
  const existingAllowFrom = isDefault
    ? (cfg.channels?.wecom?.allowFrom ?? [])
    : (cfg.channels?.wecom?.accounts?.[accountId]?.allowFrom ?? []);

  const entry = await prompter.text({
    message: "企业微信 allowFrom (用户ID)",
    placeholder: "UserID",
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
        wecom: {
          ...cfg.channels?.wecom,
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
      wecom: {
        ...cfg.channels?.wecom,
        enabled: true,
        accounts: {
          ...cfg.channels?.wecom?.accounts,
          [accountId]: {
            ...cfg.channels?.wecom?.accounts?.[accountId],
            enabled: cfg.channels?.wecom?.accounts?.[accountId]?.enabled ?? true,
            dmPolicy: "allowlist",
            allowFrom: unique,
          },
        },
      },
    },
  };
}

const dmPolicy: ChannelOnboardingDmPolicy = {
  label: "企业微信",
  channel,
  policyKey: "channels.wecom.dmPolicy",
  allowFromKey: "channels.wecom.allowFrom",
  getCurrent: (cfg) => cfg.channels?.wecom?.dmPolicy ?? "pairing",
  setPolicy: (cfg, policy) => setWeComDmPolicy(cfg, policy),
  promptAllowFrom: promptWeComAllowFrom,
};

function updateWeComConfig(
  cfg: OpenClawConfig,
  accountId: string,
  updates: { corpId?: string; corpSecret?: string; agentId?: string; enabled?: boolean },
): OpenClawConfig {
  const isDefault = accountId === DEFAULT_ACCOUNT_ID;
  const next = { ...cfg } as OpenClawConfig;
  const wecom = { ...next.channels?.wecom } as Record<string, unknown>;
  const accounts = wecom.accounts
    ? { ...(wecom.accounts as Record<string, unknown>) }
    : undefined;

  if (isDefault && !accounts) {
    return {
      ...next,
      channels: {
        ...next.channels,
        wecom: {
          ...wecom,
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
      wecom: {
        ...wecom,
        accounts: resolvedAccounts,
      },
    },
  };
}

export const wecomOnboardingAdapter: ChannelOnboardingAdapter = {
  channel,
  dmPolicy,
  getStatus: async ({ cfg }) => {
    const configured = listWeComAccountIds(cfg).length > 0;
    return {
      channel,
      configured,
      statusLines: [`企业微信: ${configured ? "已配置" : "需要应用凭证"}`],
      selectionHint: configured ? "已配置" : "需要应用凭证",
      quickstartScore: configured ? 1 : 10,
    };
  },
  configure: async ({ cfg, prompter, accountOverrides, shouldPromptAccountIds }) => {
    let next = cfg;
    const override = accountOverrides.wecom?.trim();
    const defaultId = resolveDefaultWeComAccountId(next);
    let accountId = override ? normalizeAccountId(override) : defaultId;

    if (shouldPromptAccountIds && !override) {
      accountId = await promptAccountId({
        cfg: next,
        prompter,
        label: "企业微信",
        currentId: accountId,
        listAccountIds: listWeComAccountIds,
        defaultAccountId: defaultId,
      });
    }

    await noteWeComSetup(prompter);

    const isDefault = accountId === DEFAULT_ACCOUNT_ID;
    const envCorpId = process.env.WECOM_CORP_ID?.trim();
    const envSecret = process.env.WECOM_CORP_SECRET?.trim();
    const envAgentId = process.env.WECOM_AGENT_ID?.trim();
    
    if (isDefault && envCorpId && envSecret && envAgentId) {
      const useEnv = await prompter.confirm({
        message: "检测到环境变量 WECOM_CORP_ID/WECOM_CORP_SECRET/WECOM_AGENT_ID，是否使用?",
        initialValue: true,
      });
      if (useEnv) {
        next = updateWeComConfig(next, accountId, { enabled: true });
        return { cfg: next, accountId };
      }
    }

    const corpId = String(
      await prompter.text({
        message: "企业微信 Corp ID",
        initialValue: next.channels?.wecom?.corpId?.trim() || undefined,
        validate: (value) => (String(value ?? "").trim() ? undefined : "必填项"),
      }),
    ).trim();

    const corpSecret = String(
      await prompter.text({
        message: "企业微信 Corp Secret",
        initialValue: next.channels?.wecom?.corpSecret?.trim() || undefined,
        validate: (value) => (String(value ?? "").trim() ? undefined : "必填项"),
      }),
    ).trim();

    const agentId = String(
      await prompter.text({
        message: "企业微信 Agent ID",
        initialValue: next.channels?.wecom?.agentId?.trim() || undefined,
        validate: (value) => (String(value ?? "").trim() ? undefined : "必填项"),
      }),
    ).trim();

    next = updateWeComConfig(next, accountId, { corpId, corpSecret, agentId, enabled: true });

    return { cfg: next, accountId };
  },
};
