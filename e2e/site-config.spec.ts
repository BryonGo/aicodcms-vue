import { test, expect } from "@playwright/test";

async function loginAsAdmin(page: any) {
  await page.goto("/login");
  await page
    .locator('input[type="text"], input[placeholder*="账号"], input[placeholder*="用户名"]')
    .first()
    .fill(process.env.E2E_USER || "admin");
  await page.locator('input[type="password"]').first().fill(process.env.E2E_PASS || "admin123");
  // 登录按钮是自定义 .submit-btn（不是 el-button--primary）
  await page.locator(".submit-btn").first().click();
  // 应用是 hash 路由（/login#/home），按 hash 判断登录成功而非 path
  await page.waitForURL((url: URL) => url.hash.length > 0 && !url.hash.includes("login"), {
    timeout: 10000,
  });
}

// gotoHash 在 SPA 内切换 hash 路由（避免整页 reload 触发应用重新引导）
async function gotoHash(page: any, route: string) {
  await page.evaluate((h: string) => {
    window.location.hash = h;
  }, route);
  await page.waitForTimeout(600);
}

test.describe("站点配置作用域", () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!process.env.E2E_FULL, "需要设置 E2E_FULL=1 且后端在线");
    await loginAsAdmin(page);
  });

  test("站点管理只包含入口属性", async ({ page }) => {
    await gotoHash(page, "/cms/site");
    // 断言页面标题（侧边栏中同名字菜单可能因折叠而 hidden）
    await expect(page.locator(".pms-card-title").first()).toBeVisible({ timeout: 8000 });
    await expect(page.locator(".pms-card-title").first()).toHaveText(/站点管理/);
    await page.getByRole("button", { name: /新增站点/ }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByText("站点配置", { exact: true })).toHaveCount(0);
    await expect(page.getByText("MinIO 对象存储", { exact: true })).toHaveCount(0);
  });

  test("系统设置明确显示当前站点", async ({ page }) => {
    await gotoHash(page, "/cms/setting");
    await expect(page.getByText(/当前配置站点|Configuration scope/)).toBeVisible({ timeout: 8000 });
    await expect(page.locator(".site-scope code")).not.toBeEmpty();
  });

  test("MinIO 站点存储面板显示私有存储状态且 AK 打码", async ({ page }) => {
    await gotoHash(page, "/addon/minio/list");
    await expect(page.locator(".minio-app")).toBeVisible({ timeout: 10000 });
    await page.getByRole("button", { name: /站点存储|Site Storage/ }).click();
    await expect(page.getByRole("dialog")).toBeVisible({ timeout: 8000 });
    // 默认站（default → gamelor 桶）应为就绪状态
    await expect(page.getByText("gamelor", { exact: true }).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/已就绪|Ready/).first()).toBeVisible();
    // AK 必须打码（svc-****xx），且不得出现完整 AK
    const masked = await page.getByText(/svc-\*\*\*\*[a-z0-9]{2}/).count();
    expect(masked).toBeGreaterThan(0);
    // 无删除桶按钮（危险操作边界）
    await expect(page.getByRole("button", { name: /删除桶|Delete Bucket/i })).toHaveCount(0);
  });
});
