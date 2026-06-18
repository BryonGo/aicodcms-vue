import { describe, it, expect, beforeEach } from "vite-plus/test";
import { Session } from "/@/utils/storage";

describe("authFunction", () => {
  beforeEach(() => Session.clear());

  it("checkPerm 超管权限应有 */*/*", () => {
    Session.set("permissions", ["*/*/*"]);
    const perms = Session.get("permissions");
    expect(perms).toContain("*/*/*");
  });

  it("checkPerm 普通权限应精确匹配", () => {
    Session.set("permissions", ["article/list", "article/add"]);
    const perms = Session.get("permissions");
    expect(perms).toContain("article/list");
    expect(perms).not.toContain("article/edit");
  });

  it("无权限时返回空数组", () => {
    Session.set("permissions", []);
    const perms = Session.get("permissions");
    expect(perms).toEqual([]);
  });
});
