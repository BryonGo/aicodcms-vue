import { describe, it, expect } from "vite-plus/test";
import { i18n } from "/@/i18n";

describe("addon i18n runtime resolution", () => {
  it("shortlink keys translate in zh-cn and en", () => {
    i18n.global.locale.value = "zh-cn";
    expect(i18n.global.t("message.addon_shortlink.title")).toBe("短链管理");
    expect(i18n.global.t("message.addon_shortlink.add")).toBe("新增短链");
    expect(i18n.global.t("message.addon_shortio.title")).toBe("Short.io 短链");
    expect(i18n.global.t("message.addon_shortio.setCta")).toBe("设为CTA");
    expect(i18n.global.t("message.router.addonShortlink")).toBe("短链管理");
    expect(i18n.global.t("message.router.addonShortio")).toBe("Short.io 短链");
    i18n.global.locale.value = "en";
    expect(i18n.global.t("message.addon_shortlink.title")).toBe("Short Links");
    expect(i18n.global.t("message.addon_shortio.title")).toBe("Short.io Links");
    i18n.global.locale.value = "zh-cn";
  });
});
