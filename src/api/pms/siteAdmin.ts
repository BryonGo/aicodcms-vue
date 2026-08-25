import request from "/@/utils/request";

// 绑定到某站点的管理员列表
export function listSiteAdmins(siteId: number) {
  return request({ url: "/api/v1/pms/site-admin/list", method: "get", params: { site_id: siteId } });
}

// 绑定管理员到站点
export function bindSiteAdmin(userId: number, siteId: number) {
  return request({
    url: "/api/v1/pms/site-admin/bind",
    method: "post",
    data: { user_id: userId, site_id: siteId },
  });
}

// 解绑管理员与站点
export function unbindSiteAdmin(userId: number, siteId: number) {
  return request({
    url: "/api/v1/pms/site-admin/unbind",
    method: "post",
    data: { user_id: userId, site_id: siteId },
  });
}

// 当前登录管理员可见的站点（超管=全部，站点管理员=绑定）
export function getMySites() {
  return request({ url: "/api/v1/pms/site-admin/mine", method: "get" });
}
