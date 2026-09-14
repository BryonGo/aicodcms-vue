import { describe, it, expect, beforeEach, vi } from "vite-plus/test";
import { setActivePinia, createPinia } from "pinia";

import { Local, Session } from "/@/utils/storage";
import { getMySites } from "/@/api/pms/siteAdmin";
import { useSiteInfo } from "/@/stores/siteInfo";

vi.mock("/@/api/pms/siteAdmin", () => ({
  getMySites: vi.fn(),
}));

const SITES = {
  default: { id: 1, code: "default", name: "默认站", default_lang: "zh-cn", status: 1 },
  hougong: { id: 914, code: "hougong", name: "后宫 AI 创作站", default_lang: "zh-cn", status: 1 },
  jiuguan: { id: 902, code: "jiuguan", name: "酒馆 AI", default_lang: "zh-cn", status: 1 },
};

function loginAs(id: number, isSuperAdmin = 1) {
  Session.set("userInfo", { id, user_name: `admin${id}`, is_super_admin: isSuperAdmin });
}

function mockSites(sites: (typeof SITES)[keyof typeof SITES][]) {
  (getMySites as any).mockResolvedValue({ data: { sites } });
}

describe("Store: siteInfo 站点选择器", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    Local.clear();
    Session.clear();
    vi.clearAllMocks();
  });

  // 回归守卫：这里曾经把「本次页面加载（loadedForUserId=0）」误判成「换账号」，
  // 于是每次刷新/切换站点后都把已保存的站点码清掉，表现为「切换站点不生效，
  // 总是回到默认站」。
  it("首次加载信任已保存的当前站点", async () => {
    loginAs(1);
    Local.set("currentSiteCode", "hougong");
    mockSites([SITES.default, SITES.hougong, SITES.jiuguan]);

    const store = useSiteInfo();
    await store.init();

    expect(store.currentSiteCode).toBe("hougong");
    expect(store.currentSiteId).toBe(914);
    expect(Local.get("currentSiteCode")).toBe("hougong");
  });

  it("保存的站点不在可见范围内时回落到第一个站点", async () => {
    loginAs(9002, 0);
    Local.set("currentSiteCode", "hougong");
    // 非超管只绑定了酒馆站，hougong 不可见
    mockSites([SITES.jiuguan]);

    const store = useSiteInfo();
    await store.init();

    expect(store.currentSiteCode).toBe("jiuguan");
    expect(store.currentSiteId).toBe(902);
  });

  it("同账号重复 init 不重复请求", async () => {
    loginAs(1);
    mockSites([SITES.default, SITES.hougong]);

    const store = useSiteInfo();
    await store.init();
    await store.init();

    expect(getMySites).toHaveBeenCalledTimes(1);
  });

  it("换账号时作废上一个账号的站点列表", async () => {
    loginAs(1);
    Local.set("currentSiteCode", "hougong");
    mockSites([SITES.default, SITES.hougong, SITES.jiuguan]);

    const store = useSiteInfo();
    await store.init();
    expect(store.sites).toHaveLength(3);

    // 换成一个只绑定了酒馆站的管理员
    loginAs(9002, 0);
    mockSites([SITES.jiuguan]);
    await store.init();

    expect(store.sites.map((s) => s.code)).toEqual(["jiuguan"]);
    expect(store.currentSiteCode).toBe("jiuguan");
    expect(store.isSuperAdmin).toBe(false);
  });

  it("setCurrent 落盘，clear 清空", async () => {
    loginAs(1);
    mockSites([SITES.default, SITES.jiuguan]);

    const store = useSiteInfo();
    await store.init();
    store.setCurrent("jiuguan");
    expect(Local.get("currentSiteCode")).toBe("jiuguan");

    store.clear();
    expect(store.sites).toEqual([]);
    expect(store.currentSiteCode).toBe("");
    expect(Local.get("currentSiteCode")).toBeNull();
  });
});
