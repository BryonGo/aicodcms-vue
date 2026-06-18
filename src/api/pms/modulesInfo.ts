import request from "/@/utils/request";
// 查询模型信息列表
export function listModulesInfo(query: object) {
  return request({
    url: "/api/v1/admin/modules/info/list",
    method: "get",
    params: query,
  });
}

export function ListModulesInfoField(query: object) {
  return request({
    url: "/api/v1/admin/modules/field/list",
    method: "get",
    params: query,
  });
}

// 查询模型信息详细
export function getModulesInfo(id: number) {
  return request({
    url: "/api/v1/admin/modules/info",
    method: "get",
    params: {
      id: id,
    },
  });
}
// 新增模型信息
export function addModulesInfo(data: object) {
  return request({
    url: "/api/v1/admin/modules/info/add",
    method: "post",
    data: data,
  });
}
// 修改模型信息
export function updateModulesInfo(data: object) {
  return request({
    url: "/api/v1/admin/modules/info/edit",
    method: "put",
    data: data,
  });
}
// 删除模型信息
export function delModulesInfo(ids: number[]) {
  return request({
    url: "/api/v1/admin/modules/info/del",
    method: "delete",
    data: {
      ids: ids,
    },
  });
}

// 生成模型
export function createModule(id: number) {
  return request({
    url: "/api/v1/admin/modules/info/create",
    method: "put",
    data: { id },
  });
}
