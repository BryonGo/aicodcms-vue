/**
 * 支付通道结构化字段配置 + 通道元数据
 * 供 add.vue / edit.vue 共享，消除重复
 */

export interface ExtraFieldDef {
  key: string;
  label: string;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
  type?: "input" | "select" | "textarea";
  options?: { label: string; value: string }[];
  /** 敏感字段（密钥/证书等），可配合隐藏显示 */
  secret?: boolean;
  /** 可从支付通道 API 实时拉取产品列表的字段 */
  fetchable?: boolean;
  /** fetchable=true 时，是否支持多选产品（逗号分隔 product_ids） */
  multiSelect?: boolean;
  /** fetchable=true 时，指定哪个 extra_config key 存的是 API Key（用于 ListProductsWithKey） */
  fetchApiKeyField?: string;
  /** fetchable=true 时，指定哪个 extra_config key 存的是 test_mode 开关 */
  fetchTestModeField?: string;
  /** fetchable=true 时，test_mode 的 "true" 值对应的字符串 */
  fetchTestModeTrueValue?: string;
  /** 新建时的默认值 */
  defaultValue?: string;
}

export interface ChannelMeta {
  name: string;
  color: string;
  bgColor: string;
}

/** 通道展示元数据（名称、品牌色） */
export const channelMeta: Record<string, ChannelMeta> = {
  alipay_web: { name: "支付宝", color: "#1677ff", bgColor: "#e6f4ff" },
  wechat: { name: "微信支付", color: "#07c160", bgColor: "#e8f8ee" },
  google_pay: { name: "Google Pay", color: "#4285f4", bgColor: "#e8f0fe" },
  apple_pay: { name: "Apple Pay", color: "#555555", bgColor: "#f0f0f0" },
  creem: { name: "Creem", color: "#7c3aed", bgColor: "#f5f3ff" },
  waffo_pancake: { name: "Waffo Pancake", color: "#f59e0b", bgColor: "#fffbeb" },
};

/** 通道结构化字段 Schema */
export const channelExtraSchemas: Record<string, ExtraFieldDef[]> = {
  alipay_web: [
    {
      key: "env",
      label: "环境",
      type: "select",
      options: [
        { label: "沙箱环境", value: "sandbox" },
        { label: "生产环境", value: "production" },
      ],
    },
    { key: "app_id", label: "支付宝 APPID", placeholder: "开放平台应用 APPID" },
    {
      key: "private_key",
      label: "商户私钥 (PEM)",
      multiline: true,
      rows: 4,
      placeholder: "-----BEGIN PRIVATE KEY-----\n...",
      secret: true,
    },
    {
      key: "alipay_public_key",
      label: "支付宝公钥 (PEM)",
      multiline: true,
      rows: 4,
      placeholder: "-----BEGIN PUBLIC KEY-----\n...",
    },
  ],
  google_pay: [
    { key: "package_name", label: "应用包名", placeholder: "com.example.app" },
    {
      key: "service_account",
      label: "服务账号 JSON",
      multiline: true,
      rows: 6,
      placeholder: '{\n  "type": "service_account",\n  "project_id": "...",\n  ...\n}',
      secret: true,
    },
  ],
  apple_pay: [
    {
      key: "shared_secret",
      label: "App Store 共享密钥",
      placeholder: "共享密钥(从App Store Connect获取)",
      secret: true,
    },
    { key: "bundle_id", label: "Bundle ID", placeholder: "com.example.app" },
  ],
  wechat: [
    { key: "mchid", label: "商户号 (mchid)", placeholder: "微信支付商户号" },
    { key: "appid", label: "公众号 APPID", placeholder: "公众平台应用 APPID" },
    { key: "cert_serial_no", label: "API证书序列号", placeholder: "商户API证书序列号" },
    {
      key: "private_key",
      label: "API私钥 (PEM)",
      multiline: true,
      rows: 4,
      placeholder: "-----BEGIN PRIVATE KEY-----\n...",
      secret: true,
    },
    { key: "pub_key_id", label: "微信支付公钥ID", placeholder: "PUB_KEY_ID_xxxx" },
    {
      key: "pub_key",
      label: "微信支付公钥 (PEM)",
      multiline: true,
      rows: 4,
      placeholder: "-----BEGIN PUBLIC KEY-----\n...",
    },
    { key: "api_v3_key", label: "APIv3密钥", placeholder: "32位APIv3密钥", secret: true },
  ],
  creem: [
    {
      key: "test_mode",
      label: "环境",
      type: "select",
      options: [
        { label: "测试模式", value: "true" },
        { label: "生产模式", value: "false" },
      ],
      defaultValue: "true",
    },
    { key: "api_key", label: "API Key", placeholder: "Creem API secret key", secret: true },
    {
      key: "product_ids",
      label: "Product IDs",
      placeholder: "逗号分隔多选，如 PROD_xxx,PROD_yyy",
      fetchable: true,
      multiSelect: true,
      fetchApiKeyField: "api_key",
      fetchTestModeField: "test_mode",
      fetchTestModeTrueValue: "true",
    },
    { key: "base_url", label: "API Base URL", placeholder: "https://test-api.creem.io/v1" },
    {
      key: "webhook_secret",
      label: "Webhook Secret",
      placeholder: "Webhook HMAC verification secret (test_mode 可跳过)",
      secret: true,
    },
  ],
  waffo_pancake: [
    {
      key: "environment",
      label: "环境",
      type: "select",
      options: [
        { label: "测试环境", value: "test" },
        { label: "生产环境", value: "production" },
      ],
      defaultValue: "test",
    },
    { key: "merchant_id", label: "Merchant ID", placeholder: "Waffo merchant ID (MER_xxx)" },
    {
      key: "product_ids",
      label: "Product IDs",
      placeholder: "逗号分隔，如 PROD_xxx,PROD_yyy",
      fetchable: true,
      multiSelect: true,
      fetchApiKeyField: "merchant_id",
      fetchTestModeField: "environment",
      fetchTestModeTrueValue: "test",
    },
    { key: "store_id", label: "Store ID (可选)", placeholder: "Waffo store ID (STO_xxx)" },
    { key: "base_url", label: "API Base URL", placeholder: "https://api.waffo.ai/v1" },
    {
      key: "private_key",
      label: "RSA 私钥 (PEM)",
      multiline: true,
      rows: 5,
      placeholder: "-----BEGIN PRIVATE KEY-----\n...",
      secret: true,
    },
  ],
};

/** 获取通道结构化字段，无匹配返回空数组 */
export function getChannelFields(channelCode: string): ExtraFieldDef[] {
  return channelExtraSchemas[channelCode] || [];
}

/**
 * 从 extra_config JSON 回填结构化字段，所有值归一化为 string。
 * 自动修复常见的未转义控制字符（如 PEM 私钥中的真实换行符导致 JSON.parse 失败）。
 */
export function parseExtraConfig(json: string): Record<string, string> {
  if (!json) return {};

  // 一次 JSON.parse，正常情况直接返回
  try {
    const obj = JSON.parse(json);
    const result: Record<string, string> = {};
    for (const [k, v] of Object.entries(obj)) {
      result[k] = v == null ? "" : String(v);
    }
    return result;
  } catch {
    // ignored — try to repair
  }

  // 修复：把 JSON 字符串值中未转义的控制字符替换为合法的转义序列
  try {
    const repaired = json
      .replace(/\r\n/g, "\\n")
      .replace(/\n/g, "\\n")
      .replace(/\r/g, "\\n")
      .replace(/\t/g, "\\t");
    const obj = JSON.parse(repaired);
    const result: Record<string, string> = {};
    for (const [k, v] of Object.entries(obj)) {
      result[k] = v == null ? "" : String(v);
    }
    return result;
  } catch {
    return {};
  }
}

/** 将结构化字段序列化为 extra_config JSON */
export function serializeExtraFields(
  fields: ExtraFieldDef[],
  values: Record<string, string>,
): string {
  const obj: Record<string, string> = {};
  for (const f of fields) {
    obj[f.key] = values[f.key] || "";
  }
  return JSON.stringify(obj);
}

/** 将字面 \n 转为实际换行 */
export function normalizeNewlines(val: string): string {
  return val.replace(/\\n/g, "\n");
}

/** 从 Schema 提取默认值（新建配置时使用） */
export function getDefaultExtraValues(channelCode: string): Record<string, string> {
  const fields = channelExtraSchemas[channelCode];
  if (!fields) return {};
  const defaults: Record<string, string> = {};
  for (const f of fields) {
    if (f.defaultValue !== undefined) {
      defaults[f.key] = f.defaultValue;
    }
  }
  return defaults;
}
