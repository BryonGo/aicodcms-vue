import request from "/@/utils/request";

// 查询列表
export function listSysUserOnline(query: object) {
  return request({
    url: "/api/v1/pms/online/list",
    method: "get",
    params: query,
  });
}

export function forceLogout(ids: number[]) {
  return request({
    url: "/api/v1/pms/online/forceLogout",
    method: "delete",
    data: { ids },
  });
}
