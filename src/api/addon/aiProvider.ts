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
  /**
   * 乐观并发版本号：保存时必须**原样回传**。
   *
   * 后端要求更新供应商时带上它（不带直接拒绝）—— 两个标签页同编一行时，
   * 后保存的会被判成版本过期而不是静默覆盖前一个人的改动。
   */
  revision: number;
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
  /** 运营备注：只给后台看（上游内容限制、能否做成人向…），不下发前台。 */
  remark: string;
  sort: number;
  capabilities: Record<string, any> | null;
  billing: Record<string, any> | null;
  last_synced_at: number;
  /** 非 0 表示上游已不再返回该模型；超过宽限期系统会自动下线。 */
  missing_since: number;
  /** 是否由系统**自动下线**（上游不再提供）。与运营手工下线区分：上游恢复会自动放回来。 */
  auto_hidden: boolean;
  /** 自动下线的原因（运营手工下线时为空）。 */
  hidden_reason: string;
  /** 配置缺口：能力/计费没配齐时前台不显示该模型，这里列出具体缺什么（图像模型才计算）。 */
  config_gaps: { kind: string; detail: string }[];
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
  /**
   * 更新（id>0）时**必填**：编辑时从列表接口拿到的 revision 原样回传。
   * 新建时不用传。少了它后端会拒绝（"缺少 revision"）—— 这是刻意的，
   * 否则"带期望值保存"就成了一句空话。
   */
  revision?: number;
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
  /** 运营备注（只给后台看，不下发前台）。 */
  remark?: string;
  sort?: number;
  capabilities?: Record<string, any> | null;
  billing?: Record<string, any> | null;
}

export interface AiSyncResult {
  inserted: number;
  existing: number;
  missing: number;
  revived: number;
  /** 因"上游已不再提供"被系统自动下线的条数。 */
  auto_hidden: number;
  /** 上游恢复后自动放回来的条数。 */
  auto_restored: number;
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

/**
 * 从上游拉取模型**候选**（不落库）。
 *
 * 与下面的 syncAiProvider 的区别是这条流程的全部意义：
 * sync 拉多少写多少，运营没勾的也会被灌进库；pull 只返回候选，
 * 由运营搜索、勾选，再调 importAiProviderModels 写入选中的那些。
 */
export function pullAiProviderModels(id: number) {
  return request({
    url: "/api/v1/admin/ai/provider/pull",
    method: "post",
    data: { id },
  });
}

/** 一个候选模型（拉取结果里的一项，也是写入时的入参）。 */
export interface AiPullItem {
  /** 上游模型名：写入时的唯一标识。 */
  upstream_id: string;
  /** 上游给的展示名。 */
  label: string;
  /** 上下文窗口（token），0 = 上游未披露，由运营在模型表单里补。 */
  context_window: number;
  /** 单次最大输出（token），0 = 上游未披露。 */
  max_output: number;
  /** 本站点是否已有该模型：已有的写入时只打同步时间戳，不覆盖人工配置。 */
  exists: boolean;
}

/** 把勾选的候选写入本站点（只补不覆盖，**不标记缺失**）。 */
export function importAiProviderModels(id: number, items: AiPullItem[]) {
  return request({
    url: "/api/v1/admin/ai/provider/models",
    method: "post",
    data: { id, items },
  });
}

/**
 * 全量同步：拉取上游清单并合并，**会把上游不再返回的模型标记为"已消失"**。
 *
 * 与「拉取 → 勾选 → 写入」的差别只有这一条：未勾选 ≠ 上游不再提供，
 * 所以只有这条全量路径才允许标记缺失（标记后超过宽限期会被自动下线）。
 * 后台把它放在拉取对话框里的次要位置，避免误点。
 */
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

/** 前台的一个"条目"：一个家族，或一个没有家族的独立模型。 */
export interface AiModelEntry {
  /** 条目标识：家族名，或独立模型的 model_id。调整顺序时原样传回。 */
  key: string;
  /** 前台显示名（家族条目就是家族名）。 */
  name: string;
  kind: string;
  /** 该条目下有几个可用版本。 */
  versions: number;
  sort: number;
  model_ids: string[];
}

/** 列出前台条目顺序（按"一家族一个入口"的口径，而不是按行）。 */
export function listAiModelOrder(kind: string) {
  return request({
    url: "/api/v1/admin/ai/model/order",
    method: "get",
    params: { kind },
  });
}

/**
 * 上移/下移一个条目。
 *
 * 按**条目**而不是按行：前台是"一家族一个入口"，调家族里某个非当前版本的行不会有
 * 任何可见变化 —— 运营会以为按钮坏了。服务端会重排排序值，前端不用自己算数字。
 */
export function moveAiModelOrder(kind: string, key: string, dir: "up" | "down") {
  return request({
    url: "/api/v1/admin/ai/model/order/move",
    method: "post",
    data: { kind, key, dir },
  });
}
