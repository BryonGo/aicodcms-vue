import request from "/@/utils/request";

// 统一 CDN 管理接口（多提供商：cloudflare/tencent/qiniu/aliyun）

// 查询提供商状态（provider 空=cloudflare）
export function getCdnStatus(provider = "cloudflare") {
  return request({
    url: "/api/v1/addon/cdn/status",
    method: "get",
    params: { provider },
  });
}

// 清除 CDN 缓存（urls 或整站）
export function cdnPurge(params: { provider?: string; urls?: string[]; purge_all?: boolean }) {
  return request({
    url: "/api/v1/addon/cdn/purge",
    method: "post",
    data: params,
  });
}
