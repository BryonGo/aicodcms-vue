// versionAlert：「发布自检」那两行该不该出现。
//
// 为什么值得单测：它的分支在本地开发环境下**一个都走不到** ——
// /api/version 在本地返回 version="dev"、/admin/version.json 又被 Vite 兜底成
// index.html，所以本地永远是"正常、隐藏"。只靠肉眼看界面等于没验证。
//
// 两类异常：
//   drift   两侧都拿到具体版本但 commit 对不上 → 只发布了半边
//   failed  接口探测失败 → 无从判断
// 其余（dev 占位、任一侧空值、两侧一致）一律算正常并隐藏。
import { describe, it, expect } from "vite-plus/test";
import { versionAlert } from "/@/composables/useApiVersion";

const ok = (version: string, commit: string) => ({ version, commit });

describe("versionAlert", () => {
  it("两侧一致 → 隐藏", () => {
    expect(
      versionAlert("20260915153531-e693224", ok("20260915153531-e693224", "e693224"), false),
    ).toBe("");
  });

  it("tag 尾段与 commit 互相前缀匹配也算一致", () => {
    // 镜像 tag 是短 sha，接口可能给完整 sha —— 不能因为长度不同就误报
    expect(versionAlert("20260915153531-e693224", ok("0.9.0", "e693224abcdef1234"), false)).toBe(
      "",
    );
  });

  it("commit 对不上 → drift", () => {
    expect(
      versionAlert("20260915153531-e693224", ok("20260915153531-aaaaaaa", "aaaaaaa"), false),
    ).toBe("drift");
  });

  it("接口探测失败 → failed（优先级最高）", () => {
    // 失败时连 info 都没有；此时即便 consoleTag 也空，也要报 failed —— 失败本身就是要提醒的事
    expect(versionAlert("", null, true)).toBe("failed");
    expect(versionAlert("20260915153531-e693224", ok("x", "y"), true)).toBe("failed");
  });

  it("接口 version=dev → 隐藏（本地开发，判定不了 ≠ 出问题）", () => {
    expect(versionAlert("20260915153531-e693224", ok("dev", "e693224"), false)).toBe("");
  });

  it("本地回退版本 dev-<sha>[-dirty] → 隐藏（两侧都算占位）", () => {
    // API 侧：dev 版本现在带短 sha，只判等号会让 consoleTag="dev" 配它算出 drift
    expect(
      versionAlert("20260915153531-e693224", ok("dev-a6f28b3b-dirty", "a6f28b3b"), false),
    ).toBe("");
    expect(versionAlert("20260915153531-e693224", ok("dev-a6f28b3b", "a6f28b3b"), false)).toBe("");
    // 控制台侧：本地 version.json 也可能是 dev 前缀
    expect(versionAlert("dev-8ca7256-dirty", ok("1.0.0", "e693224"), false)).toBe("");
  });

  it("任一侧缺值 → 隐藏", () => {
    expect(versionAlert("", ok("1.0.0", "e693224"), false)).toBe("");
    expect(versionAlert("20260915153531-e693224", null, false)).toBe("");
    expect(versionAlert("20260915153531-e693224", ok("1.0.0", ""), false)).toBe("");
  });

  it("控制台 tag 里没有 `-` 时整串当 sha 用", () => {
    expect(versionAlert("e693224", ok("1.0.0", "e693224"), false)).toBe("");
    expect(versionAlert("aaaaaaa", ok("1.0.0", "e693224"), false)).toBe("drift");
  });

  it("首尾空白不影响判定", () => {
    expect(versionAlert("  20260915153531-e693224 ", ok(" 1.0.0 ", " e693224 "), false)).toBe("");
  });
});
