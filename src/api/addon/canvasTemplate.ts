import request from "/@/utils/request";

/**
 * 后台「画布模板」接口（`/api/v1/admin/canvas/template/*`）。
 *
 * 模板是**运营资产**：一站一套、用户只能看与套用（用户面只有两个 GET）。
 * 推荐做法是"在画布上把产线调好 → 复制图 id → 这里从图另存"，
 * 直接给结构 JSON 是高级入口（从别处导入或手工微调）。
 */

export interface CanvasTemplateItem {
  id: string;
  name: string;
  summary: string;
  /** enabled 才下发前台；hidden 只留在后台。 */
  state: string;
  sort: number;
  nodeCount: number;
  updatedAt: string;
}

export interface CanvasTemplateSaveInput {
  id?: string;
  name: string;
  summary?: string;
  state?: string;
  sort?: number;
  /** 从哪张图另存（与 graph 二选一）。 */
  graphId?: string;
  /** 直接给结构 JSON（高级入口）。 */
  graph?: string;
}

export function canvasTemplateList() {
  return request<{ list: CanvasTemplateItem[] }>({
    url: "/api/v1/admin/canvas/template/list",
    method: "get",
  });
}

export function canvasTemplateDetail(id: string) {
  return request<{ template: unknown }>({
    url: "/api/v1/admin/canvas/template/detail",
    method: "get",
    params: { id },
  });
}

export function canvasTemplateSave(data: CanvasTemplateSaveInput) {
  return request<{ id: string }>({
    url: "/api/v1/admin/canvas/template/save",
    method: "post",
    data,
  });
}

export function canvasTemplateDel(id: string) {
  return request<unknown>({
    url: "/api/v1/admin/canvas/template/del",
    method: "post",
    data: { id },
  });
}
