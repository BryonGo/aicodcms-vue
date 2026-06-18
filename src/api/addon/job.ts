import request from "/@/utils/request";

export function listJob(query: object) {
  return request({ url: "/api/v1/addon/job/list", method: "get", params: query });
}
export function getJob(id: number) {
  return request({ url: "/api/v1/addon/job/get", method: "get", params: { id } });
}
export function addJob(data: any) {
  return request({ url: "/api/v1/addon/job/add", method: "post", data });
}
export function editJob(data: any) {
  return request({ url: "/api/v1/addon/job/edit", method: "put", data });
}
export function deleteJob(ids: number[]) {
  return request({ url: "/api/v1/addon/job/del", method: "delete", data: { ids } });
}
export function startJob(id: number) {
  return request({ url: "/api/v1/addon/job/start", method: "get", params: { id } });
}
export function stopJob(id: number) {
  return request({ url: "/api/v1/addon/job/stop", method: "get", params: { id } });
}
export function runJob(id: number) {
  return request({ url: "/api/v1/addon/job/run", method: "get", params: { id } });
}
