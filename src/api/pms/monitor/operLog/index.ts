import request from "/@/utils/request";
// 查询操作日志列表
export function listSysOperLog(query: object) {
  return request({
    url: "/api/v1/pms/operlog/list",
    method: "get",
    params: query,
  });
}
// 查询操作日志详细
export function getSysOperLog(oper_id: number) {
  return request({
    url: "/api/v1/pms/operlog/get",
    method: "get",
    params: {
      oper_id: oper_id.toString(),
    },
  });
}
// 删除操作日志
export function delSysOperLog(oper_ids: number[]) {
  return request({
    url: "/api/v1/pms/operlog/del",
    method: "delete",
    data: {
      oper_ids: oper_ids,
    },
  });
}

export function clearOperLog() {
  return request({
    url: "/api/v1/pms/operlog/clear",
    method: "delete",
  });
}
