import request from "/@/utils/request";

export function getRoleList(query: object) {
  return request({
    url: "/api/v1/pms/role/list",
    method: "get",
    params: query,
  });
}

export function getRoleParams() {
  return request({
    url: "/api/v1/pms/role/get-params",
    method: "get",
  });
}

export function addRole(data: object) {
  return request({
    url: "/api/v1/pms/role/add",
    method: "post",
    data: data,
  });
}

export function getRole(id: number) {
  return request({
    url: "/api/v1/pms/role/get",
    method: "get",
    params: { id },
  });
}

export function editRole(data: object) {
  return request({
    url: "/api/v1/pms/role/edit",
    method: "put",
    data: data,
  });
}

export function deleteRole(id: number) {
  return request({
    url: "/api/v1/pms/role/del",
    method: "delete",
    data: { ids: [id] },
  });
}

export function dataScope(data: any) {
  return request({
    url: "/api/v1/pms/role/dataScope",
    method: "put",
    data: data,
  });
}

// 根据角色ID查询部门树结构
export function roleDeptTreeSelect(roleId: number) {
  return request({
    url: "/api/v1/pms/role/deptTreeSelect",
    method: "get",
    params: { roleId },
  });
}
