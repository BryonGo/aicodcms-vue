import request from "/@/utils/request";

// ======== 短链（shortlink）addon 管理 ========

// 短链列表（站点作用域由 X-Site-Code 请求头决定）
export function listShortlinks(params: object) {
  return request({ url: "/api/v1/addon/shortlink/list", method: "get", params });
}

// 短链详情
export function getShortlink(id: number) {
  return request({ url: "/api/v1/addon/shortlink/detail", method: "get", params: { id } });
}

// 新增/编辑短链（id=0 新增；code 留空自动生成）
export function saveShortlink(data: object) {
  return request({ url: "/api/v1/addon/shortlink/save", method: "post", data });
}

// 批量删除短链
export function delShortlinks(ids: number[]) {
  return request({ url: "/api/v1/addon/shortlink/del", method: "delete", data: { ids } });
}

// 启用/禁用
export function enableShortlink(id: number, status: number) {
  return request({ url: "/api/v1/addon/shortlink/enable", method: "post", data: { id, status } });
}

// 设置/取消站点主 CTA
export function setDefaultShortlink(id: number, enable: number) {
  return request({ url: "/api/v1/addon/shortlink/set-default", method: "post", data: { id, enable } });
}

// 点击统计（近 N 天，<=30）
export function shortlinkStats(id: number, days: number) {
  return request({ url: "/api/v1/addon/shortlink/stats", method: "get", params: { id, days } });
}
