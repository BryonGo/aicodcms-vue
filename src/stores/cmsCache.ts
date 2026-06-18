import { defineStore } from "pinia";
import { Session } from "/@/utils/storage";

/**
 * CMS 业务数据缓存 Pinia Store
 * 参考数据（全量缓存）: channelTree, tagList, blockMap
 * 列表数据（sessionStorage）: 按 key 存取，含时间戳 TTL
 */

export interface CmsCacheState {
  channelTree: any[]; // 栏目树（全量，增删改时失效）
  tagList: any[]; // 标签列表（全量，增删改时失效）
  blockMap: Record<string, any[]>; // 区块按 type 分组
  cacheStats: {
    // 后端缓存统计
    size: number;
    redis_mode: boolean;
    redis_alive: boolean;
  } | null;
}

// TTL 配置（秒）
const SESSION_PREFIX = "cms_cache_";

// Session Storage 列表缓存工具
interface CacheEntry {
  data: any;
  timestamp: number;
}

export const useCmsCache = defineStore("cmsCache", {
  state: (): CmsCacheState => ({
    channelTree: [],
    tagList: [],
    blockMap: {},
    cacheStats: null,
  }),

  getters: {
    hasChannelTree: (state): boolean => state.channelTree.length > 0,
    hasTagList: (state): boolean => state.tagList.length > 0,
  },

  actions: {
    // ====== 参考数据缓存 ======

    setChannelTree(tree: any[]) {
      this.channelTree = tree;
    },
    setTagList(list: any[]) {
      this.tagList = list;
    },
    setBlockMap(type: string, blocks: any[]) {
      this.blockMap[type] = blocks;
    },
    getBlockByType(type: string): any[] {
      return this.blockMap[type] || [];
    },

    // ====== 列表数据缓存（Session Storage） ======

    getListCache(key: string, ttl: number): any | null {
      try {
        const raw = Session.get(SESSION_PREFIX + key);
        if (!raw) return null;
        const entry: CacheEntry = JSON.parse(raw);
        const now = Math.floor(Date.now() / 1000);
        if (ttl > 0 && now - entry.timestamp > ttl) {
          Session.remove(SESSION_PREFIX + key);
          return null;
        }
        return entry.data;
      } catch {
        return null;
      }
    },

    setListCache(key: string, data: any) {
      const entry: CacheEntry = { data, timestamp: Math.floor(Date.now() / 1000) };
      Session.set(SESSION_PREFIX + key, JSON.stringify(entry));
    },

    // 按前缀失效（清空内存 + sessionStorage）
    invalidateByPrefix(_prefix: string) {
      this.channelTree = [];
      this.tagList = [];
      this.blockMap = {};
      // 清空所有 sessionStorage 列表缓存（按前缀遍历删除）
      const keysToRemove: string[] = [];
      for (let i = 0; i < window.sessionStorage.length; i++) {
        const key = window.sessionStorage.key(i);
        if (key && key.startsWith(SESSION_PREFIX)) {
          keysToRemove.push(key.replace(SESSION_PREFIX, ""));
        }
      }
      keysToRemove.forEach((k) => Session.remove(k));
    },

    // ====== 缓存统计 ======
    setCacheStats(stats: { size: number; redis_mode: boolean; redis_alive: boolean }) {
      this.cacheStats = stats;
    },
  },
});
