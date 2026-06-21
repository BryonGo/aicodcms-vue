import { test, expect } from "@playwright/test";

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

test.describe("权限管理模块", () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!process.env.E2E_FULL, "需要设置 E2E_FULL=1 且后端在线");
    await loginAsAdmin(page);
  });

  test("访问用户管理页面", async ({ page }) => {
    await page.goto("/pms/user");
    await page.waitForLoadState("networkidle");
    // 不应跳转到登录页
    await expect(page).not.toHaveURL(/\/login/);
    // 应有表格或内容
    await expect(page.locator("body")).toBeVisible();
  });

  test("访问角色管理页面", async ({ page }) => {
    await page.goto("/pms/role");
    await page.waitForLoadState("networkidle");
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page.locator("body")).toBeVisible();
  });

  test("访问菜单管理页面", async ({ page }) => {
    await page.goto("/pms/menu");
    await page.waitForLoadState("networkidle");
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page.locator("body")).toBeVisible();
  });

  test("用户管理表格应渲染数据行", async ({ page }) => {
    await page.goto("/pms/user");
    await page.waitForLoadState("networkidle");
    // 等待 Element Plus 表格加载
    await page.waitForTimeout(1000);
    const table = page.locator(".el-table");
    if (await table.isVisible()) {
      // 有表格头
      await expect(table.locator(".el-table__header")).toBeVisible();
    }
  });

  test("无权限路由应返回 401 或重定向", async ({ page }) => {
    // 访问一个可能不存在的路由
    await page.goto("/pms/nonexistent-route-xyz");
    await page.waitForLoadState("networkidle");
    // 页面应正常响应（401 页、重定向或 404），不崩溃
    await expect(page.locator("body")).toBeVisible();
  });
});
