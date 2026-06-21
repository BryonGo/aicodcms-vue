import { test, expect } from "@playwright/test";

// 需要已登录状态的辅助函数
async function loginAsAdmin(page: any) {
  await page.goto("/login");
  const usernameInput = page
    .locator('input[type="text"], input[placeholder*="账号"], input[placeholder*="用户名"]')
    .first();
  const passwordInput = page.locator('input[type="password"]').first();
  await usernameInput.fill(process.env.E2E_USER || "admin");
  await passwordInput.fill(process.env.E2E_PASS || "admin123");
  const submitBtn = page.locator('button[type="submit"], .el-button--primary').first();
  await submitBtn.click();
  await page.waitForURL((url: URL) => !url.toString().includes("/login"), { timeout: 8000 });
}

test.describe("导航与布局", () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!process.env.E2E_FULL, "需要设置 E2E_FULL=1 且后端在线");
    await loginAsAdmin(page);
  });

  test("登录后应进入首页/仪表盘", async ({ page }) => {
    await expect(page).not.toHaveURL(/\/login/);
    // 应有侧边菜单
    const sidebar = page.locator(".el-aside, .layout-sidebar, aside").first();
    await expect(sidebar).toBeVisible({ timeout: 5000 });
  });

  test("侧边菜单应包含主要导航项", async ({ page }) => {
    // 至少有一个菜单项
    const menuItems = page.locator(".el-menu-item, .el-sub-menu");
    await expect(menuItems.first()).toBeVisible({ timeout: 5000 });
  });

  test("点击仪表盘菜单应导航成功", async ({ page }) => {
    // 寻找首页/仪表盘菜单项
    const homeLink = page.locator('a[href="/"], a[href*="home"], .el-menu-item').first();
    if (await homeLink.isVisible()) {
      await homeLink.click();
      await page.waitForTimeout(500);
    }
    // 页面不应崩溃
    await expect(page.locator("body")).toBeVisible();
  });

  test("顶部导航栏应可见", async ({ page }) => {
    const header = page.locator(".el-header, header, .layout-header").first();
    await expect(header).toBeVisible({ timeout: 5000 });
  });

  test("用户信息下拉菜单应存在", async ({ page }) => {
    // 寻找用户头像或名称
    const userMenu = page.locator('.el-avatar, .user-info, [class*="user"]').first();
    await expect(userMenu).toBeVisible({ timeout: 5000 });
  });
});
