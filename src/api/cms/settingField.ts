import request from "/@/utils/request";

// 字段定义列表
export function listSettingField(query: object) {
  return request({
    url: "/api/v1/admin/setting/field/list",
    method: "get",
    params: query,
  });
}

// 字段定义详情
export function getSettingField(id: number) {
  return request({
    url: "/api/v1/admin/setting/field/get",
    method: "get",
    params: { id },
  });
}

// 新增字段定义
export function addSettingField(data: object) {
  return request({
    url: "/api/v1/admin/setting/field/add",
    method: "post",
    data,
  });
}

// 编辑字段定义
export function editSettingField(data: object) {
  return request({
    url: "/api/v1/admin/setting/field/edit",
    method: "put",
    data,
  });
}

// 删除字段定义
export function delSettingField(ids: number[]) {
  return request({
    url: "/api/v1/admin/setting/field/del",
    method: "delete",
    data: { ids },
  });
}

// 获取支持的字段类型
export function getSettingFieldTypes() {
  return request({
    url: "/api/v1/admin/setting/field/types",
    method: "get",
  });
}
