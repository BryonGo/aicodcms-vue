import request from "/@/utils/request";

export function getSysInfo() {
  return request({
    url: "/api/v1/pms/monitor/server",
    method: "get",
  });
}
