import request from "/@/utils/request";

// AI 供应商与模型的配置接口（后台「AI 供应商与模型」页面）。
//
// 对应后端 api/v1/cms/admin/ai_provider.go —— 路径是 /admin/ai/*（不是 /cms/admin）。
// 两条与后端一致的约定，前端不要"顺手优化"掉：
//   1. 读取接口**永远不返回密钥**，只有 has_credential 布尔；表单里的 credential
//      留空或全 `*` 表示"不改"，后端据此保留原值（把 **** 当新密钥提交会丢失真密钥）。
//   2. 供应商名下还有模型时删除会被拒绝，错误信息由后端给出。

export interface AiProviderItem {
  id: number;
  name: string;
  protocol: string;
  base_url: string;
  model_list_path: string;
  enabled: boolean;
  timeout_ms: number;
  remark: string;
  /** 是否已配置密钥（**不是密钥本身**）。 */
  has_credential: boolean;
  last_probe_at: number;
  last_probe_ok: boolean;
  last_probe_msg: string;
  created_at: number;
  updated_at: number;
}

export interface AiModelItem {
  id: number;
  provider_id: number;
  /** 内部模型 ID：下发给前端的 modelId。 */
  model_id: string;
  /** 展示名，可以随便改。 */
  display_name: string;
  /** 归一化家族名：用户看到的官方模型名（如 Seedream 5）；留空=自己占一个入口。 */
  family: string;
  /** 版本标签（如 5.0 Pro）：只给后台与排查用。 */
  version_label: string;
  /** 同家族内是否为当前下发版本。 */
  is_default: boolean;
  /** 上游模型名 / 接入点 ID，前端不可见。 */
  upstream_id: string;
  kind: string;
  state: string;
  /** pulled = 从上游拉取 / manual = 后台手填。 */
  source: string;
  author: string;
  excerpt: string;
  description: string;
  output_format: string;
  sort: number;
  capabilities: Record<string, any> | null;
  billing: Record<string, any> | null;
  last_synced_at: number;
  /** 非 0 表示上游已不再返回该模型（不等于停用，由运营决定）。 */
  missing_since: number;
  created_at: number;
  updated_at: number;
}

export interface AiProviderSaveInput {
  id?: number;
  name: string;
  protocol: string;
  base_url: string;
  model_list_path?: string;
  /** 只写：留空或 `****` 表示不修改已保存的密钥。 */
  credential?: string;
  enabled?: boolean;
  timeout_ms?: number;
  remark?: string;
}

export interface AiModelSaveInput {
  id?: number;
  provider_id: number;
  model_id?: string;
  display_name: string;
  family?: string;
  version_label?: string;
  is_default?: boolean;
  upstream_id: string;
  kind?: string;
  state?: string;
  author?: string;
  excerpt?: string;
  description?: string;
  output_format?: string;
  sort?: number;
  capabilities?: Record<string, any> | null;
  billing?: Record<string, any> | null;
}

export interface AiSyncResult {
  inserted: number;
  existing: number;
  missing: number;
  revived: number;
}

/** 供应商列表（含已实现的协议清单，供下拉，避免前端硬编码一份会过期的）。 */
export function listAiProviders() {
  return request({
    url: "/api/v1/admin/ai/provider/list",
    method: "get",
  });
}

export function saveAiProvider(data: AiProviderSaveInput) {
  return request({
    url: "/api/v1/admin/ai/provider/save",
    method: "post",
    data,
  });
}

export function deleteAiProvider(id: number) {
  return request({
    url: "/api/v1/admin/ai/provider/del",
    method: "post",
    data: { id },
  });
}

/** 测试连接。注意：ARK 协议没有模型列表接口，探测会**消耗一次最小出图额度**。 */
export function probeAiProvider(id: number) {
  return request({
    url: "/api/v1/admin/ai/provider/probe",
    method: "post",
    data: { id },
  });
}

/** 从上游拉取模型并合并（保留已有展示名与计费，只新增与打时间戳）。 */
export function syncAiProvider(id: number) {
  return request({
    url: "/api/v1/admin/ai/provider/sync",
    method: "post",
    data: { id },
  });
}

export function listAiModels(providerId?: number) {
  return request({
    url: "/api/v1/admin/ai/model/list",
    method: "get",
    params: providerId ? { provider_id: providerId } : {},
  });
}

export function saveAiModel(data: AiModelSaveInput) {
  return request({
    url: "/api/v1/admin/ai/model/save",
    method: "post",
    data,
  });
}

export function deleteAiModel(id: number) {
  return request({
    url: "/api/v1/admin/ai/model/del",
    method: "post",
    data: { id },
  });
}
