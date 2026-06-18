import request from "/@/utils/request";

export function listComments(params: any) {
  return request({ url: "/api/v1/addon/comment/admin/list", method: "get", params });
}
export function approveComments(ids: number[]) {
  return request({ url: "/api/v1/addon/comment/admin/approve", method: "post", data: { ids } });
}
export function rejectComments(ids: number[]) {
  return request({ url: "/api/v1/addon/comment/admin/reject", method: "post", data: { ids } });
}
export function recycleComments(ids: number[]) {
  return request({ url: "/api/v1/addon/comment/admin/recycle", method: "delete", data: { ids } });
}
export function restoreComments(ids: number[]) {
  return request({ url: "/api/v1/addon/comment/admin/restore", method: "post", data: { ids } });
}
export function destroyComments(ids: number[]) {
  return request({ url: "/api/v1/addon/comment/admin/destroy", method: "delete", data: { ids } });
}
