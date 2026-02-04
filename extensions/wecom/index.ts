import type { OpenClawPluginApi } from "openclaw/plugin-sdk";
import { emptyPluginConfigSchema } from "openclaw/plugin-sdk";
import { wecomPlugin } from "./src/channel.js";

const plugin = {
  id: "wecom",
  name: "WeCom (企业微信)",
  description: "WeCom (企业微信/WeChat Work) channel plugin",
  configSchema: emptyPluginConfigSchema(),
  register(api: OpenClawPluginApi) {
    api.registerChannel({ plugin: wecomPlugin });
  },
};

export default plugin;
