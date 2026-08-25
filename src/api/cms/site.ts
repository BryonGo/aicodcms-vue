import request from "/@/utils/request";

// 站点列表
export function listSites() {
  return request({ url: "/api/v1/admin/site/list", method: "get" });
}

// 新建/编辑站点
export function saveSite(data: object) {
  return request({ url: "/api/v1/admin/site/save", method: "post", data });
}

// 删除站点
export function delSite(id: number) {
  return request({ url: "/api/v1/admin/site/del", method: "post", data: { id } });
}

// 当前站点上下文（X-Site-Code 选择）
export function currentSite() {
  return request({ url: "/api/v1/admin/site/current", method: "get" });
}
