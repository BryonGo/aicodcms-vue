import request from "/@/utils/request";

export function getParamList(query: object) {
  return request({
    url: "/api/v1/pms/param/list",
    method: "get",
    params: query,
  });
}

export function getParam(id: number) {
  return request({
    url: "/api/v1/pms/param/get",
    method: "get",
    params: { id },
  });
}

export function addParam(data: any) {
  return request({
    url: "/api/v1/pms/param/add",
    method: "post",
    data: data,
  });
}

export function editParam(data: any) {
  return request({
    url: "/api/v1/pms/param/edit",
    method: "put",
    data: data,
  });
}

export function deleteParam(ids: number[]) {
  return request({
    url: "/api/v1/pms/param/del",
    method: "delete",
    data: { ids },
  });
}
