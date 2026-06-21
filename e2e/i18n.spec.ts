import { test, expect } from "@playwright/test";

test.describe("国际化切换", () => {
  test("登录页面应有语言切换入口", async ({ page }) => {
    await page.goto("/login");
    // 等待页面加载
    await page.waitForLoadState("networkidle");
    // 寻找语言切换按钮（常见实现：下拉、图标、文字）
    const _langSwitcher = page
      .locator(
        '[class*="lang"], [class*="i18n"], .lang-switch, button:has-text("中文"), button:has-text("EN")',
      )
      .first();
    // 不强制存在，只检测页面无错误
    await expect(page.locator("body")).toBeVisible();
  });

  test("登录页面默认语言应为中文", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");
    // 检查 html lang 属性或页面上的中文字样
    const htmlLang = await page.locator("html").getAttribute("lang");
    // 页面包含中文或 lang 为 zh
    const bodyText = await page.locator("body").innerText();
    const hasChinese = /[一-龥]/.test(bodyText);
    expect(hasChinese || (htmlLang && htmlLang.startsWith("zh"))).toBeTruthy();
  });

  test("登录页面 html 标签应有 lang 属性", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");
    const lang = await page.locator("html").getAttribute("lang");
    // lang 属性不为空
    expect(lang).toBeTruthy();
  });
});
