import { defineStore } from "pinia";
import { Local } from "/@/utils/storage";
import { getMySites } from "/@/api/pms/siteAdmin";

/**
 * 站群：站点选择器状态
 * 持久化当前站点 code 到 LocalStorage（请求拦截器直接读 Local，避免与 api 层循环依赖）。
 */
export interface SiteSummary {
  id: number;
  code: string;
  name: string;
  default_lang: string;
  status: number;
}

export const useSiteInfo = defineStore("siteInfo", {
  state: () => ({
    sites: [] as SiteSummary[],
    currentSiteCode: (Local.get("currentSiteCode") as string) || "",
    loaded: false,
  }),
  getters: {
    currentSite(state): SiteSummary | null {
      return state.sites.find((s) => s.code === state.currentSiteCode) || null;
    },
    enabledSites(state): SiteSummary[] {
      return state.sites.filter((s) => s.status === 1);
    },
  },
  actions: {
    async init() {
      try {
        const res: any = await getMySites();
        const sites: SiteSummary[] = res?.data?.sites || [];
        this.sites = sites;
        // 未选择或当前站点已不在可见范围内时，回退到第一个可见站点
        const exists = sites.some((s) => s.code === this.currentSiteCode);
        if ((!this.currentSiteCode || !exists) && sites.length > 0) {
          this.currentSiteCode = sites[0].code;
          Local.set("currentSiteCode", sites[0].code);
        }
      } catch (e) {
        // 站点接口失败不阻塞主流程
        console.warn("[siteInfo] init failed:", e);
      } finally {
        this.loaded = true;
      }
    },
    setCurrent(code: string) {
      this.currentSiteCode = code;
      Local.set("currentSiteCode", code);
    },
    clear() {
      this.sites = [];
      this.currentSiteCode = "";
      this.loaded = false;
      Local.remove("currentSiteCode");
    },
  },
});
