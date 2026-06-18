import request from "@/utils/request";

export function getLinkList(params: any) {
  return request.get("/api/v1/admin/link/list", { params });
}
export function getLink(id: number) {
  return request.get("/api/v1/admin/link/get", { params: { id } });
}
export function addLink(data: any) {
  return request.post("/api/v1/admin/link/add", data);
}
export function editLink(data: any) {
  return request.put("/api/v1/admin/link/edit", data);
}
export function delLink(ids: number[]) {
  return request.delete("/api/v1/admin/link/del", { data: { ids } });
}
export function weighLink(id: number, weigh: number) {
  return request.put("/api/v1/admin/link/weigh", { id, weigh });
}
