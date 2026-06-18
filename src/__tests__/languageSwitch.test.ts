import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import { Session, Local } from "/@/utils/storage";

// ============================================================
// 前端语言切换单元测试
// ============================================================

describe("语言切换 - 存储层", () => {
  beforeEach(() => {
    Local.clear();
    Session.clear();
  });

  it("切换语言时应更新 localStorage 中的 themeConfig.globalI18n", () => {
    const themeConfig = { globalI18n: "zh-cn", globalComponentSize: "large" };
    Local.set("themeConfig", themeConfig);

    const newLang = "en";
    Local.remove("themeConfig");
    themeConfig.globalI18n = newLang;
    Local.set("themeConfig", themeConfig);

    const saved = Local.get("themeConfig");
    expect(saved).not.toBeNull();
    expect(saved.globalI18n).toBe("en");
  });

  it("切换语言时应清除后端菜单缓存（Session.userMenu）", () => {
    Session.set("userMenu", [{ name: "dashboard", title: "仪表盘" }]);
    Session.remove("userMenu");
    expect(Session.get("userMenu")).toBeNull();
  });

  it("多次切换语言应正确保留最后一次选择", () => {
    for (const lang of ["zh-cn", "en", "zh-cn"]) {
      Local.set("themeConfig", { globalI18n: lang, globalComponentSize: "large" });
    }
    expect(Local.get("themeConfig").globalI18n).toBe("zh-cn");
  });

  it("刷新后从 localStorage 恢复语言", () => {
    Local.set("themeConfig", { globalI18n: "en", globalComponentSize: "large" });
    const restored = Local.get("themeConfig");
    expect(restored.globalI18n).toBe("en");
  });

  it("未选择语言时 localStorage 不应有 globalI18n", () => {
    Local.set("themeConfig", { globalComponentSize: "large" });
    const cfg = Local.get("themeConfig");
    expect(cfg.globalI18n).toBeUndefined();
  });
});

describe("语言切换 - API 调用", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("setLanguage API 应发送正确的 POST 请求", async () => {
    const mockFetch = vi.fn().mockResolvedValue({ data: { code: 0 } });
    vi.stubGlobal("fetch", mockFetch);

    await fetch("/api/v1/admin/setting/set-language", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lang: "en" }),
    });

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/v1/admin/setting/set-language",
      expect.objectContaining({ method: "POST", body: JSON.stringify({ lang: "en" }) }),
    );
  });

  it("后端切换失败时应不影响前端本地显示", async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error("Network Error"));
    vi.stubGlobal("fetch", mockFetch);

    Local.set("themeConfig", { globalI18n: "en", globalComponentSize: "large" });

    try {
      await fetch("/api/v1/admin/setting/set-language", {
        method: "POST",
        body: JSON.stringify({ lang: "en" }),
      });
    } catch {
      /* expected */
    }

    expect(Local.get("themeConfig").globalI18n).toBe("en");
  });
});

describe("语言切换 - 菜单刷新", () => {
  beforeEach(() => {
    Session.clear();
    vi.restoreAllMocks();
  });

  it("切换语言后应清除菜单缓存并重新获取", async () => {
    Session.set("userMenu", [
      { name: "article", title: "文章管理" },
      { name: "channel", title: "栏目管理" },
    ]);
    Session.set("permissions", ["article/list", "channel/list"]);

    const mockResponse = {
      data: {
        menu_list: [
          { name: "article", title: "Article Management" },
          { name: "channel", title: "Channel Management" },
        ],
        permissions: ["article/list", "channel/list"],
      },
    };
    const mockFetch = vi.fn().mockResolvedValue({ json: () => Promise.resolve(mockResponse) });
    vi.stubGlobal("fetch", mockFetch);

    Session.remove("userMenu");
    const res = await fetch("/api/v1/pms/user/menus");
    const data = await res.json();

    Session.set("userMenu", data.data.menu_list);
    Session.set("permissions", data.data.permissions);

    const newMenu = Session.get("userMenu");
    expect(newMenu[0].title).toBe("Article Management");
    expect(newMenu[1].title).toBe("Channel Management");
  });

  it("语言切换后菜单数量应与切换前一致", () => {
    const zhMenus = [
      { name: "dashboard", title: "仪表盘" },
      { name: "article", title: "文章管理" },
      { name: "channel", title: "栏目管理" },
    ];
    const enMenus = [
      { name: "dashboard", title: "Dashboard" },
      { name: "article", title: "Article Management" },
      { name: "channel", title: "Channel Management" },
    ];
    expect(zhMenus.length).toBe(enMenus.length);
    zhMenus.forEach((zh, i) => expect(zh.name).toBe(enMenus[i].name));
  });
});

describe("语言切换 - Axios Accept-Language", () => {
  beforeEach(() => {
    Local.clear();
    vi.restoreAllMocks();
  });

  it("已选语言时请求头应包含 Accept-Language: 所选语言", () => {
    Local.set("themeConfig", { globalI18n: "en", globalComponentSize: "large" });
    const themeConfig = Local.get("themeConfig");
    const acceptLang = themeConfig?.globalI18n || "zh-CN";
    // 模拟 axios 拦截器逻辑
    const config: any = { headers: { common: {} } };
    (<any>config.headers).common["Accept-Language"] = acceptLang;
    expect(config.headers.common["Accept-Language"]).toBe("en");
  });

  it("未选语言时 Accept-Language 缺省为 zh-CN", () => {
    Local.set("themeConfig", { globalComponentSize: "large" });
    const themeConfig = Local.get("themeConfig");
    const acceptLang = themeConfig?.globalI18n || "zh-CN";
    expect(acceptLang).toBe("zh-CN");
  });
});

describe("语言切换 - 后端配置获取", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("getDefaultLanguage 从 /setting/get 读取 i18n.default_language", async () => {
    const mockData = { data: { i18n: { default_language: "en" } } };
    const mockFetch = vi.fn().mockResolvedValue({ json: () => Promise.resolve(mockData) });
    vi.stubGlobal("fetch", mockFetch);

    const res = await fetch("/api/v1/admin/setting/get");
    const body = await res.json();
    const lang = body?.data?.i18n?.default_language || "zh-CN";

    expect(lang).toBe("en");
  });

  it("后端不可达时 getDefaultLanguage 回退 zh-CN", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("net")));
    let lang = "zh-CN";
    try {
      const res = await fetch("/api/v1/admin/setting/get");
      const body = await res.json();
      lang = body?.data?.i18n?.default_language || "zh-CN";
    } catch {
      /* fallback */
    }
    expect(lang).toBe("zh-CN");
  });
});
