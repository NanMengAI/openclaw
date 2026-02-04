import {
  buildChannelConfigSchema,
  DEFAULT_ACCOUNT_ID,
  formatPairingApproveHint,
  PAIRING_APPROVED_MESSAGE,
  type ChannelAccountSnapshot,
  type ChannelPlugin,
  type ChannelStatusIssue,
} from "openclaw/plugin-sdk";
import { WeComConfigSchema } from "./config-schema.js";
import { wecomOnboardingAdapter } from "./onboarding.js";

const meta = {
  id: "wecom",
  label: "企业微信",
  selectionLabel: "企业微信 (WeCom/WeChat Work)",
  detailLabel: "企业微信机器人",
  docsPath: "/channels/wecom",
  docsLabel: "wecom",
  blurb: "企业微信应用机器人.",
  aliases: ["wechat-work", "wxwork"],
  order: 36,
  quickstartAllowFrom: true,
};

const normalizeAllowEntry = (entry: string) => entry.replace(/^wecom:/i, "").trim();

// 占位函数，需要实际实现
const wecomOutbound = {
  sendText: async (params: any) => {
    console.log("[v0] WeCom sendText placeholder:", params);
    // TODO: 实际的企业微信消息发送实现
  },
  sendPayload: async (params: any) => {
    console.log("[v0] WeCom sendPayload placeholder:", params);
    // TODO: 实际的企业微信消息发送实现
  },
};

const normalizeWeComTarget = (target: string) => {
  return target.replace(/^wecom:/i, "").trim();
};

const monitorWeComProvider = async (opts: any) => {
  console.log("[v0] WeCom monitor placeholder:", opts);
  // TODO: 实际的企业微信消息监听实现
  await new Promise(() => {}); // Keep running
};

const probeWeCom = async (corpId: string, corpSecret: string, timeoutMs?: number) => {
  console.log("[v0] WeCom probe placeholder:", { corpId, timeoutMs });
  // TODO: 实际的企业微信连接测试实现
  return { ok: true, bot: { appName: "企业微信机器人" } };
};

export const wecomPlugin: ChannelPlugin<any> = {
  id: "wecom",
  meta,
  onboarding: wecomOnboardingAdapter,
  pairing: {
    idLabel: "wecomUserId",
    normalizeAllowEntry: normalizeAllowEntry,
    notifyApproval: async ({ cfg, id }) => {
      console.log("[v0] WeCom notify approval:", { id });
      await wecomOutbound.sendText({ cfg, to: id, text: PAIRING_APPROVED_MESSAGE });
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
  reload: { configPrefixes: ["channels.wecom"] },
  outbound: wecomOutbound,
  messaging: {
    normalizeTarget: normalizeWeComTarget,
    targetResolver: {
      looksLikeId: (raw, normalized) => {
        const value = (normalized ?? raw).trim();
        if (!value) {
          return false;
        }
        // 企业微信的 UserID 或者 ChatID
        return Boolean(value);
      },
      hint: "<UserID|ChatID>",
    },
  },
  configSchema: buildChannelConfigSchema(WeComConfigSchema),
  config: {
    listAccountIds: (cfg) => {
      const wecomCfg = cfg.channels?.wecom;
      const accounts = wecomCfg?.accounts;
      const ids = new Set<string>();
      
      if (wecomCfg?.corpId && wecomCfg?.corpSecret && wecomCfg?.agentId) {
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
      const wecomCfg = cfg.channels?.wecom;
      const account = wecomCfg?.accounts?.[id] ?? wecomCfg;
      
      return {
        accountId: id,
        config: account,
        tokenSource: account?.corpSecret ? "config" : "none",
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
          wecom: {
            ...cfg.channels?.wecom,
            accounts: {
              ...cfg.channels?.wecom?.accounts,
              [id]: {
                ...cfg.channels?.wecom?.accounts?.[id],
                enabled,
              },
            },
          },
        },
      };
    },
    deleteAccount: ({ cfg, accountId }) => {
      const id = accountId ?? DEFAULT_ACCOUNT_ID;
      const accounts = { ...cfg.channels?.wecom?.accounts };
      delete accounts[id];
      return {
        ...cfg,
        channels: {
          ...cfg.channels,
          wecom: {
            ...cfg.channels?.wecom,
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
      const account = cfg.channels?.wecom?.accounts?.[id] ?? cfg.channels?.wecom;
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
      const useAccountPath = Boolean(cfg.channels?.wecom?.accounts?.[resolvedAccountId]);
      const basePath = useAccountPath
        ? `channels.wecom.accounts.${resolvedAccountId}.`
        : "channels.wecom.";
      return {
        policy: account.config.dmPolicy ?? "pairing",
        allowFrom: account.config.allowFrom ?? [],
        policyPath: `${basePath}dmPolicy`,
        allowFromPath: basePath,
        approveHint: formatPairingApproveHint("wecom"),
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
      const account = cfg.channels?.wecom?.accounts?.[id] ?? cfg.channels?.wecom;
      const group = account?.groups?.[groupId];
      return group?.requireMention ?? true;
    },
  },
  directory: {
    self: async () => null,
    listPeers: async ({ cfg, accountId, query, limit }) => {
      const id = accountId ?? DEFAULT_ACCOUNT_ID;
      const account = cfg.channels?.wecom?.accounts?.[id] ?? cfg.channels?.wecom;
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
      const account = cfg.channels?.wecom?.accounts?.[id] ?? cfg.channels?.wecom;
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
            channel: "wecom",
            accountId: account.accountId ?? DEFAULT_ACCOUNT_ID,
            kind: "config",
            message: "企业微信 Corp ID/Secret/Agent ID 未配置",
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
      probeWeCom(account.config.corpId, account.config.corpSecret, timeoutMs),
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
      const corpId = account.config.corpId;
      if (corpId) {
        runtime.log?.(`wecom:${corpId}`);
      }
    },
  },
  gateway: {
    startAccount: async (ctx) => {
      const { account, log, setStatus, abortSignal, cfg, runtime } = ctx;
      const { corpId, corpSecret, agentId } = account.config;
      if (!corpId || !corpSecret || !agentId) {
        throw new Error("企业微信 Corp ID/Secret/Agent ID 未配置");
      }

      try {
        const probe = await probeWeCom(corpId, corpSecret, 5000);
        if (probe.ok && probe.bot) {
          setStatus({ accountId: account.accountId, bot: probe.bot });
        }
      } catch (err) {
        log?.debug?.(`[${account.accountId}] 机器人探测失败: ${String(err)}`);
      }

      log?.info(`[${account.accountId}] 启动企业微信服务`);
      setStatus({
        accountId: account.accountId,
        running: true,
        lastStartAt: Date.now(),
      });

      try {
        await monitorWeComProvider({
          corpId,
          corpSecret,
          agentId,
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
