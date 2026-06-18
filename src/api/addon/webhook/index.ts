import request from "/@/utils/request";

export function listWebhooks() {
  return request({ url: "/api/v1/addon/webhook/list", method: "get" });
}
export function addWebhook(data: any) {
  return request({ url: "/api/v1/addon/webhook/add", method: "post", data });
}
export function editWebhook(data: any) {
  return request({ url: "/api/v1/addon/webhook/edit", method: "put", data });
}
export function delWebhook(id: number) {
  return request({ url: "/api/v1/addon/webhook/del", method: "delete", data: { id } });
}
