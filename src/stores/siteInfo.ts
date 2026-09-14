import { defineStore } from "pinia";
import { Local, Session } from "/@/utils/storage";
import { getMySites } from "/@/api/pms/siteAdmin";
import { resolveSiteReady, resetSiteReady } from "/@/utils/siteReady";

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

/** 当前登录管理员的 id（未登录返回 0）。用于判断站点列表是否属于当前账号。 */
function currentAdminId(): number {
  const info = Session.get("userInfo");
  return Number(info?.id || 0);
}

/** 当前登录管理员是否超级管理员（取后端登录响应里的 is_super_admin）。 */
function currentIsSuperAdmin(): boolean {
  const info = Session.get("userInfo");
  return Number(info?.is_super_admin || 0) === 1;
}

/**
 * 同账号并发 init（路由守卫 + 登录成功回调）共用一次请求。
 * 放在模块级而不是 state：它是"进行中的请求"，不是需要渲染的数据。
 */
let inflight: Promise<void> | null = null;

export const useSiteInfo = defineStore("siteInfo", {
  state: () => ({
    sites: [] as SiteSummary[],
    currentSiteCode: (Local.get("currentSiteCode") as string) || "",
    loaded: false,
    isSuperAdmin: currentIsSuperAdmin(),
    /**
     * 站点列表所属的管理员 id。
     * 换账号（含不退出登录直接重新登录）时该值会变，init() 据此重新拉取 ——
     * 否则会把上一个账号的可见站点留在切换器里（超管退出、站点管理员登录最典型）。
     */
    loadedForUserId: 0,
  }),
  getters: {
    currentSite(state): SiteSummary | null {
      return state.sites.find((s) => s.code === state.currentSiteCode) || null;
    },
    enabledSites(state): SiteSummary[] {
      return state.sites.filter((s) => s.status === 1);
    },
    /** 当前站点的站点 id；未就绪时为 0，调用方需自行判断。 */
    currentSiteId(): number {
      return this.currentSite?.id || 0;
    },
    /** 可见站点多于一个时才值得显示切换器。 */
    canSwitchSite(): boolean {
      return this.enabledSites.length > 1;
    },
  },
  actions: {
    /**
     * 加载当前账号可见的站点并确定 currentSiteCode。
     *
     * 幂等口径是「同一个管理员 + 已加载」，不是「本页面生命周期内调用过」：
     * 换账号后必须重新拉取，否则切换器会残留上一个账号的站点列表。
     *
     * @param force 忽略幂等判断（含进行中请求），强制重新拉取。
     */
    async init(force = false) {
      const userId = currentAdminId();
      // 未登录时不发请求（该接口本身要求鉴权）。
      if (userId === 0) {
        return;
      }
      if (!force && this.loaded && this.loadedForUserId === userId) {
        return;
      }
      if (inflight && !force) {
        await inflight;
        return;
      }
      if (this.loadedForUserId !== 0 && this.loadedForUserId !== userId) {
        // 真正的换账号（本页面已经为**另一个**管理员加载过站点）：上一个账号的可见
        // 站点与当前站点一律作废，避免越权展示。
        //
        // 注意 loadedForUserId===0 是「本次页面加载还没拉过」，不是换账号：
        // 这时必须信任 LocalStorage 里已保存的 currentSiteCode，否则每次刷新/切换
        // 站点后都会被清空并回落到第一个站点（表现为"切换站点不生效，总是回到默认站"）。
        // 所选站点不在新账号可见范围内的情况由下面的 exists 检查兜底。
        this.sites = [];
        this.currentSiteCode = "";
        Local.remove("currentSiteCode");
        resetSiteReady();
      }
      const run = async () => {
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
          this.loadedForUserId = userId;
          this.isSuperAdmin = currentIsSuperAdmin();
          // 无论成功失败都放行（无站点码时请求不带 X-Site-Code，交由后端决定）
          resolveSiteReady();
        }
      };
      inflight = run();
      try {
        await inflight;
      } finally {
        inflight = null;
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
      this.isSuperAdmin = false;
      this.loadedForUserId = 0;
      inflight = null;
      resetSiteReady();
      Local.remove("currentSiteCode");
    },
  },
});
