import { defineStore } from "pinia";
import { KeepAliveNamesState } from "./interface";

/**
 * 路由缓存列表
 * @methods setCacheKeepAlive 设置要缓存的路由 names（开启 Tagsview）
 * @methods addCachedView 添加要缓存的路由 names（关闭 Tagsview）
 * @methods delCachedView 删除要缓存的路由 names（关闭 Tagsview）
 * @methods delOthersCachedViews 右键菜单`关闭其它`，删除要缓存的路由 names（关闭 Tagsview）
 * @methods delAllCachedViews 右键菜单`全部关闭`，删除要缓存的路由 names（关闭 Tagsview）
 */
export const useKeepALiveNames = defineStore("keepALiveNames", {
  state: (): KeepAliveNamesState => ({
    keepAliveNames: [],
    cachedViews: [],
  }),
  actions: {
    async setCacheKeepAlive(data: Array<string>) {
      this.keepAliveNames = data;
    },
    async addCachedView(view: any, max = 10) {
      if (this.cachedViews.includes(view.name)) return;
      if (!view.meta.is_keep_alive) return;
      // 超过上限时淘汰最旧的缓存
      if (this.cachedViews.length >= max) this.cachedViews.shift();
      this.cachedViews.push(view.name);
    },
    async delCachedView(view: any) {
      const index = this.cachedViews.indexOf(view.name);
      if (index > -1) this.cachedViews.splice(index, 1);
    },
    async delOthersCachedViews(view: any) {
      if (view.meta.is_keep_alive) this.cachedViews = [view.name];
      else this.cachedViews = [];
    },
    async delAllCachedViews() {
      this.cachedViews = [];
    },
  },
});
