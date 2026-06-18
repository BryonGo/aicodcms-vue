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
};

/** 获取通道结构化字段，无匹配返回空数组 */
export function getChannelFields(channelCode: string): ExtraFieldDef[] {
  return channelExtraSchemas[channelCode] || [];
}

/** 从 extra_config JSON 回填结构化字段 */
export function parseExtraConfig(json: string): Record<string, string> {
  if (!json) return {};
  try {
    return JSON.parse(json);
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
