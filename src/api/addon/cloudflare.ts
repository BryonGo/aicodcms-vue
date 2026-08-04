import request from "/@/utils/request";

// Cloudflare 插件管理接口（状态 / Purge / 配图生成）

// 查询插件状态（凭据连通性 + Zone/Turnstile/Purge 开关）
export function getCloudflareStatus() {
  return request({
    url: "/api/v1/addon/cloudflare/status",
    method: "get",
  });
}

// 手动清除 CDN 缓存（urls 或整站）
export function cloudflarePurge(params: { urls?: string[]; purge_all?: boolean }) {
  return request({
    url: "/api/v1/addon/cloudflare/purge",
    method: "post",
    data: params,
  });
}

// Workers AI 生成文章配图
export function cloudflareImageGen(prompt: string) {
  return request({
    url: "/api/v1/addon/cloudflare/image-gen",
    method: "post",
    data: { prompt },
  });
}
