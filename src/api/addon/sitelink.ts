import request from "/@/utils/request";

// 站群互链列表
export function listSitelinks(params: object) {
  return request({ url: "/api/v1/addon/sitelink/list", method: "get", params });
}

// 新建/编辑互链
export function saveSitelink(data: object) {
  return request({ url: "/api/v1/addon/sitelink/save", method: "post", data });
}

// 删除互链
export function delSitelink(id: number) {
  return request({ url: "/api/v1/addon/sitelink/del", method: "delete", data: { id } });
}
