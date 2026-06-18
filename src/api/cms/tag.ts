import request from "/@/utils/request";
// 查询CMS标签列表
export function listCmsTags(query: object) {
  return request({
    url: "/api/v1/admin/tag/list",
    method: "get",
    params: query,
  });
}
// 查询CMS标签详细
export function getCmsTags(id: number) {
  return request({
    url: "/api/v1/admin/tag/get",
    method: "get",
    params: {
      id: id.toString(),
    },
  });
}
// 新增CMS标签
export function addCmsTags(data: object) {
  return request({
    url: "/api/v1/admin/tag/add",
    method: "post",
    data: data,
  });
}
// 修改CMS标签
export function updateCmsTags(data: object) {
  return request({
    url: "/api/v1/admin/tag/edit",
    method: "put",
    data: data,
  });
}
// 删除CMS标签
export function delCmsTags(ids: number[]) {
  return request({
    url: "/api/v1/admin/tag/del",
    method: "delete",
    data: {
      ids: ids,
    },
  });
}
