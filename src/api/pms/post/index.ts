import request from "/@/utils/request";

export function getPostList(query: object) {
  return request({
    url: "/api/v1/pms/section/list",
    method: "get",
    params: query,
  });
}

export function addPost(data: object) {
  return request({
    url: "/api/v1/pms/section/add",
    method: "post",
    data: data,
  });
}

export function editPost(data: object) {
  return request({
    url: "/api/v1/pms/section/edit",
    method: "put",
    data: data,
  });
}

export function deletePost(ids: number[]) {
  return request({
    url: "/api/v1/pms/section/del",
    method: "delete",
    data: { ids },
  });
}
