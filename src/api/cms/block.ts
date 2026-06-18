import request from "/@/utils/request";

// 查询Block列表
export function listCmsBlock(query: object) {
  return request({
    url: "/api/v1/admin/block/list",
    method: "get",
    params: query,
  });
}

// 查询Block详细
export function getCmsBlock(id: number) {
  return request({
    url: "/api/v1/admin/block/get",
    method: "get",
    params: { id },
  });
}

// 新增Block
export function addCmsBlock(data: object) {
  return request({
    url: "/api/v1/admin/block/add",
    method: "post",
    data: data,
  });
}

// 修改Block
export function updateCmsBlock(data: object) {
  return request({
    url: "/api/v1/admin/block/edit",
    method: "put",
    data: data,
  });
}

// 删除Block
export function delCmsBlock(ids: number[]) {
  return request({
    url: "/api/v1/admin/block/del",
    method: "delete",
    data: { ids },
  });
}

// 更新Block权重
export function updateCmsBlockWeigh(id: number, weigh: number) {
  return request({
    url: "/api/v1/admin/block/weigh",
    method: "put",
    data: { id, weigh },
  });
}
