import request from "/@/utils/request";

// ==================== 后宫创作工具 ====================
//
// 与「模型开关」（src/api/addon/platform.ts 里的 AdminModelSwitch*）是两套独立的东西：
// 那套管平台公共的底模/LoRA/云端模型/快捷词；这套管后宫自己的创作工具与模板，
// 数据按站点隔离（后端按 X-Site-Code 落 site_id），GameLora 站下没有这些行。
//
// 字段命名与后端 api/v1/hougong/tool.go 的 json tag 严格对齐。

/** 预置参数：只放会真正传给生成链路的字段 */
export interface ToolParams {
  denoise?: number;
  steps?: number;
  cfg?: number;
  sampler?: string;
  scheduler?: string;
  scale?: number;
  durationSeconds?: number;
}

export interface HougongTool {
  id: number;
  code: string;
  name: string;
  category: "image" | "video" | "enhance" | string;
  summary: string;
  icon: string;
  /** 封面图 URL（效果卡缩略图）；留空用图标兜底。 */
  cover: string;
  /** 角标文案（热门/新品/精选…）；留空不显示。 */
  badge: string;
  engine: string;
  workflow: string;
  promptPreset?: string;
  negativePreset?: string;
  loraCodes?: string[];
  params?: ToolParams;
  sort: number;
  status: number;
  createdAt: number;
  updatedAt: number;
  templateCount?: number;
}

export interface HougongToolTemplate {
  id: number;
  toolId: number;
  code: string;
  name: string;
  summary: string;
  prompt?: string;
  negativePrompt?: string;
  params?: ToolParams;
  sort: number;
  status: number;
  createdAt: number;
  updatedAt: number;
}

export interface ToolListQuery {
  category?: string;
  status?: number;
  query?: string;
}

export interface ToolInput {
  code: string;
  name: string;
  category: string;
  /** 输入形态：决定前台渲染哪个面板（text/image/image_pair/image_mask/video_pair/character）。 */
  input: string;
  summary: string;
  icon: string;
  /** 封面图 URL（效果卡缩略图）；留空用图标兜底。 */
  cover: string;
  /** 角标文案（热门/新品/精选…）；留空不显示。 */
  badge: string;
  engine: string;
  workflow: string;
  promptPreset: string;
  negativePreset: string;
  loraCodes: string[];
  params: ToolParams;
  sort: number;
  status: number;
}

export interface TemplateInput {
  code: string;
  name: string;
  summary: string;
  prompt: string;
  negativePrompt: string;
  params: ToolParams;
  sort: number;
  status: number;
}

const BASE = "/api/v1/addon/admin/hougong/tools";

/** 工具列表（含模板数量） */
export function getHougongTools(params: ToolListQuery = {}) {
  return request({
    url: `${BASE}`,
    method: "get",
    params,
  });
}

/** 新增工具 */
export function createHougongTool(data: ToolInput) {
  return request({ url: `${BASE}`, method: "post", data });
}

/** 编辑工具 */
export function updateHougongTool(id: number, data: ToolInput) {
  return request({ url: `${BASE}/${id}`, method: "put", data });
}

/** 删除工具（连同其模板） */
export function deleteHougongTool(id: number) {
  return request({ url: `${BASE}/${id}`, method: "delete" });
}

/** 批量启停（工具开关） */
export function setHougongToolStatus(ids: number[], enabled: boolean) {
  return request({
    url: `${BASE}/status`,
    method: "post",
    data: { ids, enabled },
  });
}

/** 某工具下的模板列表 */
export function getHougongTemplates(toolId: number) {
  return request({ url: `${BASE}/${toolId}/templates`, method: "get" });
}

/** 新增模板 */
export function createHougongTemplate(toolId: number, data: TemplateInput) {
  return request({ url: `${BASE}/${toolId}/templates`, method: "post", data });
}

/** 编辑模板 */
export function updateHougongTemplate(
  toolId: number,
  id: number,
  data: TemplateInput
) {
  return request({
    url: `${BASE}/${toolId}/templates/${id}`,
    method: "put",
    data,
  });
}

/** 删除模板 */
export function deleteHougongTemplate(toolId: number, id: number) {
  return request({ url: `${BASE}/${toolId}/templates/${id}`, method: "delete" });
}

/** 批量启停模板 */
export function setHougongTemplateStatus(
  toolId: number,
  ids: number[],
  enabled: boolean
) {
  return request({
    url: `${BASE}/${toolId}/templates/status`,
    method: "post",
    data: { ids, enabled },
  });
}
