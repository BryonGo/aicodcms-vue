import request from "/@/utils/request";

// Re-export for editUser.vue compatibility
export { getRoleList } from "/@/api/pms/role";
export { getPostList } from "/@/api/pms/post";
export { getDeptList } from "/@/api/pms/dept";

export function getUserList(query: object) {
  return request({
    url: "/api/v1/pms/user/list",
    method: "get",
    params: query,
  });
}

export function getDeptTree() {
  return request({
    url: "/api/v1/pms/dept/tree-select",
    method: "get",
  });
}

export function getParams() {
  return request({
    url: "/api/v1/pms/user/params",
    method: "get",
  });
}

export function getEditUser(id: number) {
  return request({
    url: "/api/v1/pms/user/get-edit",
    method: "get",
    params: { id },
  });
}

export function addUser(data: object) {
  return request({
    url: "/api/v1/pms/user/add",
    method: "post",
    data: data,
  });
}

export function editUser(data: object) {
  return request({
    url: "/api/v1/pms/user/edit",
    method: "put",
    data: data,
  });
}

export function resetUserPwd(userId: number, password: string) {
  return request({
    url: "/api/v1/pms/user/reset-pwd",
    method: "put",
    data: { user_id: userId, password },
  });
}

export function changeUserStatus(userId: number, status: number) {
  return request({
    url: "/api/v1/pms/user/status",
    method: "put",
    data: { user_id: userId, status },
  });
}

export function deleteUser(ids: number[]) {
  return request({
    url: "/api/v1/pms/user/del",
    method: "delete",
    data: { ids },
  });
}
