import request from "/@/utils/request";
// 查询模型字段列表
export function listModulesField(query: object) {
  return request({
    url: "/api/v1/admin/modules/field/list",
    method: "get",
    params: query,
  });
}
// 查询模型字段详细
export function getModulesField(id: number) {
  return request({
    url: "/api/v1/admin/modules/field",
    method: "get",
    params: {
      id: id,
    },
  });
}
// 新增模型字段
export function addModulesField(data: object) {
  return request({
    url: "/api/v1/admin/modules/field/add",
    method: "post",
    data: data,
  });
}
// 修改模型字段
export function updateModulesField(data: object) {
  return request({
    url: "/api/v1/admin/modules/field/edit",
    method: "put",
    data: data,
  });
}
// 删除模型字段
export function delModulesField(ids: number[]) {
  return request({
    url: "/api/v1/admin/modules/field/del",
    method: "delete",
    data: {
      ids: ids,
    },
  });
}

// 更新字段排序
export function updateModulesFieldSort(data: object[]) {
  return request({
    url: "/api/v1/admin/modules/field/updateSort",
    method: "put",
    data: {
      data,
    },
  });
}
