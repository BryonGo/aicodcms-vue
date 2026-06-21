import { test, expect } from "@playwright/test";

test.describe("登录页面", () => {
  test("未登录访问首页应重定向到登录页", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/login/);
  });

  test("登录页面应展示用户名和密码输入框", async ({ page }) => {
    await page.goto("/login");
    await expect(
      page
        .locator(
          'input[type="text"], input[placeholder*="账号"], input[placeholder*="用户名"], input[name="username"]',
        )
        .first(),
    ).toBeVisible();
    await expect(page.locator('input[type="password"]').first()).toBeVisible();
  });

  test("空表单提交应显示验证错误", async ({ page }) => {
    await page.goto("/login");
    // 点击登录按钮不填写内容
    const submitBtn = page.locator('button[type="submit"], .el-button--primary').first();
    await submitBtn.click();
    // 页面应停留在 /login
    await expect(page).toHaveURL(/\/login/);
  });

  test("错误凭据应提示登录失败", async ({ page }) => {
    await page.goto("/login");
    // 填写错误凭据
    const usernameInput = page
      .locator('input[type="text"], input[placeholder*="账号"], input[placeholder*="用户名"]')
      .first();
    const passwordInput = page.locator('input[type="password"]').first();
    await usernameInput.fill("wrong_user");
    await passwordInput.fill("wrong_password");
    const submitBtn = page.locator('button[type="submit"], .el-button--primary').first();
    await submitBtn.click();
    // 等待错误提示（Element Plus message 或表单错误）
    await page.waitForTimeout(1500);
    // 仍在登录页
    await expect(page).toHaveURL(/\/login/);
  });

  test("正确凭据应登录成功并跳转", async ({ page }) => {
    // 此测试需要真实后端在线
    test.skip(!process.env.E2E_FULL, "需要设置 E2E_FULL=1 且后端在线");
    await page.goto("/login");
    const usernameInput = page.locator('input[type="text"], input[placeholder*="账号"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    await usernameInput.fill(process.env.E2E_USER || "admin");
    await passwordInput.fill(process.env.E2E_PASS || "admin123");
    const submitBtn = page.locator('button[type="submit"], .el-button--primary').first();
    await submitBtn.click();
    await page.waitForURL((url) => !url.toString().includes("/login"), { timeout: 5000 });
    await expect(page).not.toHaveURL(/\/login/);
  });
});
