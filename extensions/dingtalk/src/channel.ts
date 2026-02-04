import {
  buildChannelConfigSchema,
  DEFAULT_ACCOUNT_ID,
  formatPairingApproveHint,
  PAIRING_APPROVED_MESSAGE,
  type ChannelAccountSnapshot,
  type ChannelPlugin,
  type ChannelStatusIssue,
} from "openclaw/plugin-sdk";
import { DingTalkConfigSchema } from "./config-schema.js";
import { dingtalkOnboardingAdapter } from "./onboarding.js";

const meta = {
  id: "dingtalk",
  label: "钉钉",
  selectionLabel: "钉钉 (DingTalk)",
  detailLabel: "钉钉机器人",
  docsPath: "/channels/dingtalk",
  docsLabel: "dingtalk",
  blurb: "钉钉企业机器人.",
  aliases: ["dd"],
  order: 37,
  quickstartAllowFrom: true,
};

const normalizeAllowEntry = (entry: string) => entry.replace(/^dingtalk:/i, "").trim();

// 占位函数，需要实际实现
const dingtalkOutbound = {
  sendText: async (params: any) => {
    console.log("[v0] DingTalk sendText placeholder:", params);
    // TODO: 实际的钉钉消息发送实现
  },
  sendPayload: async (params: any) => {
    console.log("[v0] DingTalk sendPayload placeholder:", params);
    // TODO: 实际的钉钉消息发送实现
  },
};

const normalizeDingTalkTarget = (target: string) => {
  return target.replace(/^dingtalk:/i, "").trim();
};

const monitorDingTalkProvider = async (opts: any) => {
  console.log("[v0] DingTalk monitor placeholder:", opts);
  // TODO: 实际的钉钉消息监听实现
  await new Promise(() => {}); // Keep running
};

const probeDingTalk = async (appKey: string, appSecret: string, timeoutMs?: number) => {
  console.log("[v0] DingTalk probe placeholder:", { appKey, timeoutMs });
  // TODO: 实际的钉钉连接测试实现
  return { ok: true, bot: { appName: "钉钉机器人" } };
};

export const dingtalkPlugin: ChannelPlugin<any> = {
  id: "dingtalk",
  meta,
  onboarding: dingtalkOnboardingAdapter,
  pairing: {
    idLabel: "dingtalkStaffId",
    normalizeAllowEntry: normalizeAllowEntry,
    notifyApproval: async ({ cfg, id }) => {
      console.log("[v0] DingTalk notify approval:", { id });
      await dingtalkOutbound.sendText({ cfg, to: id, text: PAIRING_APPROVED_MESSAGE });
    },
  },
  capabilities: {
    chatTypes: ["direct", "group"],
    media: true,
    reactions: false,
    threads: false,
    polls: false,
    nativeCommands: false,
    blockStreaming: true,
  },
  reload: { configPrefixes: ["channels.dingtalk"] },
  outbound: dingtalkOutbound,
  messaging: {
    normalizeTarget: normalizeDingTalkTarget,
    targetResolver: {
      looksLikeId: (raw, normalized) => {
        const value = (normalized ?? raw).trim();
        if (!value) {
          return false;
        }
        // 钉钉的 StaffID 或 ChatID
        return Boolean(value);
      },
      hint: "<StaffID|ChatID>",
    },
  },
  configSchema: buildChannelConfigSchema(DingTalkConfigSchema),
  config: {
    listAccountIds: (cfg) => {
      const dingtalkCfg = cfg.channels?.dingtalk;
      const accounts = dingtalkCfg?.accounts;
      const ids = new Set<string>();
      
      if (dingtalkCfg?.appKey && dingtalkCfg?.appSecret) {
        ids.add(DEFAULT_ACCOUNT_ID);
      }
      
      if (accounts) {
        for (const id of Object.keys(accounts)) {
          ids.add(id);
        }
      }
      
      return Array.from(ids);
    },
    resolveAccount: (cfg, accountId) => {
      const id = accountId ?? DEFAULT_ACCOUNT_ID;
      const dingtalkCfg = cfg.channels?.dingtalk;
      const account = dingtalkCfg?.accounts?.[id] ?? dingtalkCfg;
      
      return {
        accountId: id,
        config: account,
        tokenSource: account?.appSecret ? "config" : "none",
        name: account?.name,
        enabled: account?.enabled !== false,
      };
    },
    defaultAccountId: (cfg) => DEFAULT_ACCOUNT_ID,
    setAccountEnabled: ({ cfg, accountId, enabled }) => {
      const id = accountId ?? DEFAULT_ACCOUNT_ID;
      return {
        ...cfg,
        channels: {
          ...cfg.channels,
          dingtalk: {
            ...cfg.channels?.dingtalk,
            accounts: {
              ...cfg.channels?.dingtalk?.accounts,
              [id]: {
                ...cfg.channels?.dingtalk?.accounts?.[id],
                enabled,
              },
            },
          },
        },
      };
    },
    deleteAccount: ({ cfg, accountId }) => {
      const id = accountId ?? DEFAULT_ACCOUNT_ID;
      const accounts = { ...cfg.channels?.dingtalk?.accounts };
      delete accounts[id];
      return {
        ...cfg,
        channels: {
          ...cfg.channels,
          dingtalk: {
            ...cfg.channels?.dingtalk,
            accounts,
          },
        },
      };
    },
    isConfigured: (account) => account.tokenSource !== "none",
    describeAccount: (account): ChannelAccountSnapshot => ({
      accountId: account.accountId,
      name: account.name,
      enabled: account.enabled,
      configured: account.tokenSource !== "none",
      tokenSource: account.tokenSource,
    }),
    resolveAllowFrom: ({ cfg, accountId }) => {
      const id = accountId ?? DEFAULT_ACCOUNT_ID;
      const account = cfg.channels?.dingtalk?.accounts?.[id] ?? cfg.channels?.dingtalk;
      return (account?.allowFrom ?? []).map((entry) => String(entry));
    },
    formatAllowFrom: ({ allowFrom }) =>
      allowFrom
        .map((entry) => String(entry).trim())
        .filter(Boolean)
        .map((entry) => (entry === "*" ? entry : normalizeAllowEntry(entry))),
  },
  security: {
    resolveDmPolicy: ({ cfg, accountId, account }) => {
      const resolvedAccountId = accountId ?? account.accountId ?? DEFAULT_ACCOUNT_ID;
      const useAccountPath = Boolean(cfg.channels?.dingtalk?.accounts?.[resolvedAccountId]);
      const basePath = useAccountPath
        ? `channels.dingtalk.accounts.${resolvedAccountId}.`
        : "channels.dingtalk.";
      return {
        policy: account.config.dmPolicy ?? "pairing",
        allowFrom: account.config.allowFrom ?? [],
        policyPath: `${basePath}dmPolicy`,
        allowFromPath: basePath,
        approveHint: formatPairingApproveHint("dingtalk"),
        normalizeEntry: normalizeAllowEntry,
      };
    },
  },
  groups: {
    resolveRequireMention: ({ cfg, accountId, groupId }) => {
      if (!groupId) {
        return true;
      }
      const id = accountId ?? DEFAULT_ACCOUNT_ID;
      const account = cfg.channels?.dingtalk?.accounts?.[id] ?? cfg.channels?.dingtalk;
      const group = account?.groups?.[groupId];
      return group?.requireMention ?? true;
    },
  },
  directory: {
    self: async () => null,
    listPeers: async ({ cfg, accountId, query, limit }) => {
      const id = accountId ?? DEFAULT_ACCOUNT_ID;
      const account = cfg.channels?.dingtalk?.accounts?.[id] ?? cfg.channels?.dingtalk;
      const normalizedQuery = query?.trim().toLowerCase() ?? "";
      const peers = (account?.allowFrom ?? [])
        .map((entry) => String(entry).trim())
        .filter((entry) => Boolean(entry) && entry !== "*")
        .filter((entry) => (normalizedQuery ? entry.toLowerCase().includes(normalizedQuery) : true))
        .slice(0, limit && limit > 0 ? limit : undefined)
        .map((id) => ({ kind: "user", id }) as const);
      return peers;
    },
    listGroups: async ({ cfg, accountId, query, limit }) => {
      const id = accountId ?? DEFAULT_ACCOUNT_ID;
      const account = cfg.channels?.dingtalk?.accounts?.[id] ?? cfg.channels?.dingtalk;
      const normalizedQuery = query?.trim().toLowerCase() ?? "";
      const groups = Object.keys(account?.groups ?? {})
        .filter((id) => (normalizedQuery ? id.toLowerCase().includes(normalizedQuery) : true))
        .slice(0, limit && limit > 0 ? limit : undefined)
        .map((id) => ({ kind: "group", id }) as const);
      return groups;
    },
  },
  status: {
    defaultRuntime: {
      accountId: DEFAULT_ACCOUNT_ID,
      running: false,
      lastStartAt: null,
      lastStopAt: null,
      lastError: null,
    },
    collectStatusIssues: (accounts) => {
      const issues: ChannelStatusIssue[] = [];
      for (const account of accounts) {
        if (!account.configured) {
          issues.push({
            channel: "dingtalk",
            accountId: account.accountId ?? DEFAULT_ACCOUNT_ID,
            kind: "config",
            message: "钉钉 AppKey/AppSecret 未配置",
          });
        }
      }
      return issues;
    },
    buildChannelSummary: async ({ snapshot }) => ({
      configured: snapshot.configured ?? false,
      tokenSource: snapshot.tokenSource ?? "none",
      running: snapshot.running ?? false,
      lastStartAt: snapshot.lastStartAt ?? null,
      lastStopAt: snapshot.lastStopAt ?? null,
      lastError: snapshot.lastError ?? null,
      probe: snapshot.probe,
      lastProbeAt: snapshot.lastProbeAt ?? null,
    }),
    probeAccount: async ({ account, timeoutMs }) =>
      probeDingTalk(account.config.appKey, account.config.appSecret, timeoutMs),
    buildAccountSnapshot: ({ account, runtime, probe }) => {
      const configured = account.tokenSource !== "none";
      return {
        accountId: account.accountId,
        name: account.name,
        enabled: account.enabled,
        configured,
        tokenSource: account.tokenSource,
        running: runtime?.running ?? false,
        lastStartAt: runtime?.lastStartAt ?? null,
        lastStopAt: runtime?.lastStopAt ?? null,
        lastError: runtime?.lastError ?? null,
        probe,
        lastInboundAt: runtime?.lastInboundAt ?? null,
        lastOutboundAt: runtime?.lastOutboundAt ?? null,
      };
    },
    logSelfId: ({ account, runtime }) => {
      const appKey = account.config.appKey;
      if (appKey) {
        runtime.log?.(`dingtalk:${appKey}`);
      }
    },
  },
  gateway: {
    startAccount: async (ctx) => {
      const { account, log, setStatus, abortSignal, cfg, runtime } = ctx;
      const { appKey, appSecret } = account.config;
      if (!appKey || !appSecret) {
        throw new Error("钉钉 AppKey/AppSecret 未配置");
      }

      try {
        const probe = await probeDingTalk(appKey, appSecret, 5000);
        if (probe.ok && probe.bot) {
          setStatus({ accountId: account.accountId, bot: probe.bot });
        }
      } catch (err) {
        log?.debug?.(`[${account.accountId}] 机器人探测失败: ${String(err)}`);
      }

      log?.info(`[${account.accountId}] 启动钉钉服务`);
      setStatus({
        accountId: account.accountId,
        running: true,
        lastStartAt: Date.now(),
      });

      try {
        await monitorDingTalkProvider({
          appKey,
          appSecret,
          robotCode: account.config.robotCode,
          accountId: account.accountId,
          config: cfg,
          runtime,
          abortSignal,
        });
      } catch (err) {
        setStatus({
          accountId: account.accountId,
          running: false,
          lastError: err instanceof Error ? err.message : String(err),
        });
        throw err;
      }
    },
  },
};
