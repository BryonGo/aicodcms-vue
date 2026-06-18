import request from "/@/utils/request";

export function listCmsPage(query: object) {
  return request({
    url: "/api/v1/admin/page/list",
    method: "get",
    params: query,
  });
}
export function delCmsPage(ids: number[]) {
  return request({
    url: "/api/v1/admin/page/del",
    method: "delete",
    data: {
      ids: ids,
    },
  });
}
// 查询CMS标签详细
export function getCmsPage(id: number) {
  return request({
    url: "/api/v1/admin/page/get",
    method: "get",
    params: {
      id: id.toString(),
    },
  });
}
// 新增CMS标签
export function addCmsPage(data: object) {
  return request({
    url: "/api/v1/admin/page/add",
    method: "post",
    data: data,
  });
}
// 修改CMS标签
export function updateCmsPage(data: object) {
  return request({
    url: "/api/v1/admin/page/edit",
    method: "put",
    data: data,
  });
}
