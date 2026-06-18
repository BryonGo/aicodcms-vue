import request from "/@/utils/request";

export function getDeptList(query?: object) {
  return request({
    url: "/api/v1/pms/dept/list",
    method: "get",
    params: query,
  });
}

export function addDept(data: object) {
  return request({
    url: "/api/v1/pms/dept/add",
    method: "post",
    data: data,
  });
}

export function editDept(data: object) {
  return request({
    url: "/api/v1/pms/dept/edit",
    method: "put",
    data: data,
  });
}

export function deleteDept(id: number) {
  return request({
    url: "/api/v1/pms/dept/del",
    method: "delete",
    data: { id },
  });
}

export function getDept(id: number) {
  return request({
    url: "/api/v1/pms/dept/get",
    method: "get",
    params: { id },
  });
}

export function getDeptTree() {
  return request({
    url: "/api/v1/pms/dept/tree-select",
    method: "get",
  });
}
