import request from "/@/utils/request";

export interface SitemapConfig {
  id: number;
  engine: string;
  token: string;
  api_url: string;
  is_enabled: number;
}

/** 获取搜索引擎配置 */
export function getSitemapConfig() {
  return request({ url: "/api/v1/addon/sitemap/config", method: "get" });
}

/** 更新搜索引擎配置 */
export function updateSitemapConfig(list: SitemapConfig[]) {
  return request({ url: "/api/v1/addon/sitemap/config/edit", method: "put", data: { list } });
}

/** 生成 Sitemap */
export function generateSitemap(domain: string) {
  return request({ url: "/api/v1/addon/sitemap/generate", method: "post", data: { domain } });
}

/** 推送URL */
export function pushSitemap(engine: string, domain: string, count?: number) {
  return request({
    url: "/api/v1/addon/sitemap/push",
    method: "post",
    data: { engine, domain, count },
  });
}
