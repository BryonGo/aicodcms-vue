import request from "/@/utils/request";

// ======== short.io 短链管理 ========

// 短链列表
export function listShortioLinks(params: object) {
  return request({ url: "/api/v1/addon/shortio/list", method: "get", params });
}

// 短链详情
export function getShortioLink(id: string) {
  return request({ url: "/api/v1/addon/shortio/detail", method: "get", params: { id } });
}

// 新增/编辑短链（id 空=新增；code 留空自动生成）
export function saveShortioLink(data: object) {
  return request({ url: "/api/v1/addon/shortio/save", method: "post", data });
}

// 批量删除短链（GoFrame DELETE 不解析 body，id 走 query）
export function delShortioLinks(ids: string[]) {
  return request({ url: "/api/v1/addon/shortio/del", method: "delete", params: { ids } });
}

// 启用/禁用（short.io archived；禁用后链接从列表消失，可在官方后台恢复）
export function enableShortioLink(id: string, status: number) {
  return request({ url: "/api/v1/addon/shortio/enable", method: "post", data: { id, status } });
}

// 点击统计（近 N 天，<=30）
export function shortioStats(id: string, days: number) {
  return request({ url: "/api/v1/addon/shortio/stats", method: "get", params: { id, days } });
}

// 账户域名列表
export function listShortioDomains() {
  return request({ url: "/api/v1/addon/shortio/domains", method: "get" });
}
