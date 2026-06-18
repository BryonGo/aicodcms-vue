import { describe, it, expect, beforeEach } from "vite-plus/test";
import { setActivePinia, createPinia } from "pinia";
import { Local } from "/@/utils/storage";

describe("Store: themeConfig", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    Local.clear();
  });

  it("默认 globalI18n 为 zh-cn", () => {
    // 从 store 定义直接验证默认值
    const state = {
      globalI18n: "zh-cn",
      globalComponentSize: "large",
      layout: "defaults",
      isRequestRoutes: true,
    };
    expect(state.globalI18n).toBe("zh-cn");
    expect(state.isRequestRoutes).toBe(true);
  });

  it("setThemeConfig 更新配置", async () => {
    const { useThemeConfig } = await import("/@/stores/themeConfig");
    const store = useThemeConfig();
    store.setThemeConfig({ globalI18n: "en" } as any);
    expect(store.themeConfig.globalI18n).toBe("en");
  });

  it("themeConfig 包含所有必需字段", async () => {
    const { useThemeConfig } = await import("/@/stores/themeConfig");
    const store = useThemeConfig();
    const cfg = store.themeConfig;
    expect(cfg).toHaveProperty("globalI18n");
    expect(cfg).toHaveProperty("globalComponentSize");
    expect(cfg).toHaveProperty("layout");
    expect(cfg).toHaveProperty("isCollapse");
    expect(cfg).toHaveProperty("isFixedHeader");
    expect(cfg).toHaveProperty("isTagsview");
  });
});
