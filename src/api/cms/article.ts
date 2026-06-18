import request from "/@/utils/request";
// 查询文章列表
export function listCmsArticle(query: object) {
  return request({
    url: "/api/v1/admin/article/list",
    method: "get",
    params: query,
  });
}
// 查询文章详细
export function getCmsArticle(id: number, lang?: string) {
  const params: Record<string, any> = { id: id.toString() };
  if (lang) params.lang = lang;
  return request({
    url: "/api/v1/admin/article/get",
    method: "get",
    params,
  });
}
// 新增文章
export function addCmsArticle(data: object) {
  return request({
    url: "/api/v1/admin/article/add",
    method: "post",
    data: data,
  });
}
// 修改文章
export function updateCmsArticle(data: object) {
  return request({
    url: "/api/v1/admin/article/edit",
    method: "put",
    data: data,
  });
}
// 软删除文章（移至回收站）
export function delCmsArticle(ids: number[]) {
  return request({
    url: "/api/v1/admin/article/del",
    method: "delete",
    data: { ids },
  });
}
// 回收站文章列表
export function listTrashCmsArticle(query: object) {
  return request({
    url: "/api/v1/admin/article/trash-list",
    method: "get",
    params: query,
  });
}
// 从回收站恢复
export function restoreCmsArticle(ids: number[]) {
  return request({
    url: "/api/v1/admin/article/restore",
    method: "put",
    data: { ids },
  });
}
// 彻底删除
export function hardDelCmsArticle(ids: number[]) {
  return request({
    url: "/api/v1/admin/article/hard-del",
    method: "delete",
    data: { ids },
  });
}

export function getChannelTree() {
  return request({
    url: "/api/v1/admin/channel/tree-list",
    method: "get",
  });
}
// 删除文章翻译（指定语言）
export function delArticleTranslation(id: number, lang: string) {
  return request({
    url: "/api/v1/admin/article/translation/del",
    method: "delete",
    params: { id, lang },
  });
}
// 批量移动栏目
export function batchChannel(data: any) {
  return request({ url: "/api/v1/admin/article/batch/channel", method: "put", data });
}
// 批量设置标签
export function batchTags(data: any) {
  return request({ url: "/api/v1/admin/article/batch/tags", method: "put", data });
}
// 批量设置状态
export function batchStatus(data: any) {
  return request({ url: "/api/v1/admin/article/batch/status", method: "put", data });
}

// SEO 检查
export function seoCheck(params: any) {
  return request({ url: "/api/v1/admin/article/seo-check", method: "get", params });
}
