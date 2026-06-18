import { describe, it, expect } from "vitest";
import { backendToFrontendLang } from "/@/i18n";

describe("i18n 辅助函数", () => {
  it("backendToFrontendLang zh-CN → zh-cn", () => {
    expect(backendToFrontendLang("zh-CN")).toBe("zh-cn");
  });

  it("backendToFrontendLang zh-cn → zh-cn", () => {
    expect(backendToFrontendLang("zh-cn")).toBe("zh-cn");
  });

  it("backendToFrontendLang en-US → en", () => {
    expect(backendToFrontendLang("en-US")).toBe("en");
  });

  it("backendToFrontendLang en → en", () => {
    expect(backendToFrontendLang("en")).toBe("en");
  });

  it("backendToFrontendLang 未知语言 → zh-cn（回退默认）", () => {
    expect(backendToFrontendLang("ja-JP")).toBe("zh-cn");
  });

  it("backendToFrontendLang 空字符串 → zh-cn（回退默认）", () => {
    expect(backendToFrontendLang("")).toBe("zh-cn");
  });
});
