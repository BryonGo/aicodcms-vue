import request from "/@/utils/request";

/**
 * 爬虫概况
 */
export function getOverview(params?: object) {
  return request({
    url: "/api/v1/admin/crawler/overview",
    method: "get",
    params,
  });
}

/**
 * 爬虫来访趋势
 */
export function getTrend(params?: object) {
  return request({
    url: "/api/v1/admin/crawler/trend",
    method: "get",
    params,
  });
}

/**
 * Top 被爬文章
 */
export function getTopArticles(params?: object) {
  return request({
    url: "/api/v1/admin/crawler/top-articles",
    method: "get",
    params,
  });
}

/**
 * 爬虫活跃热力图
 */
export function getHeatmap(params?: object) {
  return request({
    url: "/api/v1/admin/crawler/heatmap",
    method: "get",
    params,
  });
}
