import { MarkdownConfigSchema, ToolPolicySchema } from "openclaw/plugin-sdk";
import { z } from "zod";

const allowFromEntry = z.union([z.string(), z.number()]);
const toolsBySenderSchema = z.record(z.string(), ToolPolicySchema).optional();

const WeComGroupSchema = z
  .object({
    enabled: z.boolean().optional(),
    requireMention: z.boolean().optional(),
    allowFrom: z.array(allowFromEntry).optional(),
    tools: ToolPolicySchema,
    toolsBySender: toolsBySenderSchema,
    systemPrompt: z.string().optional(),
    skills: z.array(z.string()).optional(),
  })
  .strict();

const WeComAccountSchema = z
  .object({
    name: z.string().optional(),
    enabled: z.boolean().optional(),
    corpId: z.string().optional(),
    corpSecret: z.string().optional(),
    corpSecretFile: z.string().optional(),
    agentId: z.string().optional(),
    token: z.string().optional(),
    encodingAESKey: z.string().optional(),
    botName: z.string().optional(),
    markdown: MarkdownConfigSchema,
    dmPolicy: z.enum(["pairing", "allowlist", "open", "disabled"]).optional(),
    groupPolicy: z.enum(["open", "allowlist", "disabled"]).optional(),
    allowFrom: z.array(allowFromEntry).optional(),
    groupAllowFrom: z.array(allowFromEntry).optional(),
    historyLimit: z.number().optional(),
    dmHistoryLimit: z.number().optional(),
    textChunkLimit: z.number().optional(),
    chunkMode: z.enum(["length", "newline"]).optional(),
    blockStreaming: z.boolean().optional(),
    streaming: z.boolean().optional(),
    mediaMaxMb: z.number().optional(),
    groups: z.record(z.string(), WeComGroupSchema.optional()).optional(),
  })
  .strict();

export const WeComConfigSchema = WeComAccountSchema.extend({
  accounts: z.object({}).catchall(WeComAccountSchema).optional(),
});
