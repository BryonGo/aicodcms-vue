import request from "/@/utils/request";

export function getTypeList(query: object) {
  return request({
    url: "/api/v1/pms/dict/type/list",
    method: "get",
    params: query,
  });
}

export function getType(dict_id: number) {
  return request({
    url: "/api/v1/pms/dict/type/get",
    method: "get",
    params: { dict_id },
  });
}

export function addType(data: any) {
  return request({
    url: "/api/v1/pms/dict/type/add",
    method: "post",
    data: data,
  });
}

export function editType(data: any) {
  return request({
    url: "/api/v1/pms/dict/type/edit",
    method: "put",
    data: data,
  });
}

export function deleteType(dict_ids: number[]) {
  return request({
    url: "/api/v1/pms/dict/type/del",
    method: "delete",
    data: { dict_ids },
  });
}

// 获取字典选择框列表
export function optionselect() {
  return request({
    url: "/api/v1/pms/dict/type/optionSelect",
    method: "get",
  });
}
