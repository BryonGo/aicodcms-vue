import { describe, it, expect } from "vite-plus/test";
import zhcn from "/@/i18n/lang/zh-cn";
import en from "/@/i18n/lang/en";

/**
 * 递归收集对象中所有 key 的路径（点分隔）
 */
function collectKeys(obj: any, prefix = ""): string[] {
  const keys: string[] = [];
  for (const key of Object.keys(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (obj[key] && typeof obj[key] === "object" && !Array.isArray(obj[key])) {
      keys.push(...collectKeys(obj[key], path));
    } else {
      keys.push(path);
    }
  }
  return keys.sort();
}

describe("i18n 语言文件 keys 一致性", () => {
  const zhKeys = collectKeys(zhcn);
  const enKeys = collectKeys(en);

  it("zh-cn router 应有 home/system/systemMenu", () => {
    const routerKeys = collectKeys(zhcn.router);
    expect(routerKeys).toContain("home");
    expect(routerKeys).toContain("system");
    expect(routerKeys).toContain("systemMenu");
  });

  it("zh-cn user 应有 langSwitchSuccess/logOutTitle", () => {
    const userKeys = collectKeys(zhcn.user);
    expect(userKeys).toContain("langSwitchSuccess");
    expect(userKeys).toContain("logOutTitle");
    expect(userKeys).toContain("dropdown5");
  });

  it("en 应包含 zh-cn 绝大部分 key（允许少量产品特有差异）", () => {
    const essentials = zhKeys.filter(
      (k) =>
        k.startsWith("user.") ||
        k.startsWith("router.") ||
        k.startsWith("tagsView.") ||
        k.startsWith("message."),
    );
    const missing = essentials.filter((k) => !enKeys.includes(k));
    expect(missing).toEqual([]);
  });
});

describe("i18n 翻译值完整性", () => {
  it("zh-cn user.langSwitchSuccess 不应为空", () => {
    expect(zhcn.user?.langSwitchSuccess).toBeTruthy();
  });

  it("en user.langSwitchSuccess 不应为空", () => {
    expect(en.user?.langSwitchSuccess).toBeTruthy();
  });
});
