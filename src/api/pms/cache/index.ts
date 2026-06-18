import request from "/@/utils/request";

// 清除缓存（支持按标签）
export function removeCache(tag: string) {
  return request({
    url: "/api/v1/pms/cache/remove",
    method: "delete",
    params: { tag },
  });
}

// 缓存统计
export function getCacheStats() {
  return request({
    url: "/api/v1/pms/cache/stats",
    method: "get",
  });
}

export interface CacheStats {
  size: number;
  redis_mode: boolean;
  redis_alive: boolean;
  i18n_cached: Record<string, boolean>;
}

export interface CacheRemoveRes {
  tags_flushed: string[];
  keys_removed: number;
}
