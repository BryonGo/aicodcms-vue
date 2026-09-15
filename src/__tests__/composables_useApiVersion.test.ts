// useApiVersion：控制台里「接口版本」这个数据源。
//
// 它有两个容易写错、又不容易在界面上看出来的地方，所以在这里钉死：
//   1) 探测失败必须**静默降级**（failed=true，不抛异常）—— 它是背景行为，
//      不能因为线上还没部署带 /api/version 的 API 就让控制台报错；
//   2) 模块级节流：多处读它时不能各打一次接口，但用户主动刷新必须穿透节流。
import { describe, it, expect, beforeEach, afterEach, vi } from "vite-plus/test";

const originalFetch = globalThis.fetch;

/** 每个用例都拿一份全新的模块实例：composable 的状态是模块级的 */
async function loadModule() {
  vi.resetModules();
  return await import("/@/composables/useApiVersion");
}

function mockJson(body: unknown, ok = true, status = 200) {
  const fn = vi.fn().mockResolvedValue({ ok, status, json: async () => body });
  globalThis.fetch = fn as unknown as typeof fetch;
  return fn;
}

describe("useApiVersion 接口版本探测", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("探测成功：填充字段并清除失败标记", async () => {
    mockJson({
      service: "aicodcms-api",
      version: "20260915162958-f783da6d",
      commit: "f783da6d",
      buildTime: "2026-09-15T09:29:58Z",
      startedAt: "2026-09-15T09:30:37Z",
      goVersion: "go1.25.8",
    });
    const mod = await loadModule();
    const { info, failed, loading } = mod.useApiVersion();
    await mod.refreshApiVersion();

    expect(failed.value).toBe(false);
    expect(loading.value).toBe(false);
    expect(info.value?.version).toBe("20260915162958-f783da6d");
    expect(info.value?.commit).toBe("f783da6d");
  });

  it("请求路径与缓存策略：打 /api/version 且显式 no-store", async () => {
    const fetchMock = mockJson({ version: "v1" });
    const mod = await loadModule();
    await mod.refreshApiVersion();

    const [url, options] = fetchMock.mock.calls[0];
    expect(String(url)).toContain("/api/version");
    expect(options.cache).toBe("no-store");
  });

  // 回归守卫：这是最常见的真实场景 —— 这个环境还没部署带 /api/version 的 API（例如
  // 老二进制），或本机 dev 指向的线上 API 还是旧版。此时必须安静显示「未知」。
  it("端点不存在（404）：静默降级，不抛异常", async () => {
    mockJson({}, false, 404);
    const mod = await loadModule();
    const { info, failed } = mod.useApiVersion();
    await mod.refreshApiVersion();

    expect(failed.value).toBe(true);
    expect(info.value).toBeNull();
  });

  it("网络异常：静默降级，不抛异常", async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error("network down")) as unknown as typeof fetch;
    const mod = await loadModule();
    const { failed } = mod.useApiVersion();
    await expect(mod.refreshApiVersion()).resolves.toBeUndefined();
    expect(failed.value).toBe(true);
  });

  it("恢复：先失败后成功，failed 要回到 false", async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error("boom")) as unknown as typeof fetch;
    const mod = await loadModule();
    const { info, failed } = mod.useApiVersion();
    await mod.refreshApiVersion();
    expect(failed.value).toBe(true);

    mockJson({ version: "v2" });
    await mod.refreshApiVersion();
    expect(failed.value).toBe(false);
    expect(info.value?.version).toBe("v2");
  });

  // 节流是为了省请求（菜单、以后的「关于」页都会读它）
  it("节流：短时间内重复调用只打一次接口", async () => {
    const fetchMock = mockJson({ version: "v1" });
    const mod = await loadModule();
    mod.useApiVersion();
    mod.useApiVersion();
    mod.useApiVersion();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  // 但用户主动展开菜单时必须拿到此刻的值，不能被 30s 节流挡住
  it("主动刷新：穿透节流；但并发时合并成一次请求", async () => {
    const fetchMock = mockJson({ version: "v1" });
    const mod = await loadModule();
    mod.useApiVersion();
    // 上面那次还在飞：此时强制刷新应当**合并**进同一个请求，而不是再打一次
    await mod.refreshApiVersion();
    expect(fetchMock).toHaveBeenCalledTimes(1);

    // 前一次已结束，后面每次强制刷新都是真实请求
    await mod.refreshApiVersion();
    await mod.refreshApiVersion();
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
});
