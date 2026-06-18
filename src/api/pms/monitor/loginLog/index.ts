import request from "/@/utils/request";

export function logList(query: object) {
  return request({
    url: "/api/v1/pms/loginLog/list",
    method: "get",
    params: query,
  });
}

export function deleteLog(ids: number[]) {
  return request({
    url: "/api/v1/pms/loginLog/del",
    method: "delete",
    data: { ids },
  });
}

export function clearLog() {
  return request({
    url: "/api/v1/pms/loginLog/clear",
    method: "delete",
  });
}
