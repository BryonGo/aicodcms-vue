import request from "/@/utils/request";

// 查询生成进度
export function getStaProgress() {
  return request({
    url: "/api/v1/admin/sta/progress",
    method: "get",
  });
}

// 启动文章全量生成
export function generateArticles() {
  return request({
    url: "/api/v1/admin/sta/generate/article",
    method: "post",
  });
}

// 启动列表生成
export function generateLists() {
  return request({
    url: "/api/v1/admin/sta/generate/list",
    method: "post",
  });
}

// 启动Tag生成
export function generateTags() {
  return request({
    url: "/api/v1/admin/sta/generate/tag",
    method: "post",
  });
}

// 停止生成
export function stopGenerate() {
  return request({
    url: "/api/v1/admin/sta/stop",
    method: "post",
  });
}

// 手动重生成指定文章
export function regenerateArticle(id: number, lang?: string) {
  return request({
    url: "/api/v1/admin/sta/regenerate",
    method: "post",
    data: { id, lang: lang || "" },
  });
}

// 查询生成历史
export function getStaHistory() {
  return request({
    url: "/api/v1/admin/sta/history",
    method: "get",
  });
}
