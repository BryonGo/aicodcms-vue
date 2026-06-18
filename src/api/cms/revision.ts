import request from "/@/utils/request";

// 查询文章修订版本列表
export function listCmsRevision(articleId: number | string) {
  return request({
    url: "/api/v1/admin/revision/list",
    method: "get",
    params: { article_id: articleId },
  });
}

// 获取单个修订版本详情
export function getCmsRevision(id: number | string) {
  return request({
    url: "/api/v1/admin/revision/get",
    method: "get",
    params: { id },
  });
}

// 恢复到指定修订版本
export function restoreCmsRevision(id: number | string) {
  return request({
    url: "/api/v1/admin/revision/restore",
    method: "post",
    data: { id },
  });
}
