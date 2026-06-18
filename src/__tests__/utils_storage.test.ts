import { describe, it, expect, beforeEach } from "vite-plus/test";
import { Session, Local } from "/@/utils/storage";

describe("Local Storage utils", () => {
  beforeEach(() => Local.clear());

  it("set/get 字符串", () => {
    Local.set("key", "value");
    expect(Local.get("key")).toBe("value");
  });

  it("set/get 对象", () => {
    const obj = { a: 1, b: "hello" };
    Local.set("obj", obj);
    expect(Local.get("obj")).toEqual(obj);
  });

  it("set/get 数组", () => {
    const arr = [1, { x: 2 }];
    Local.set("arr", arr);
    expect(Local.get("arr")).toEqual(arr);
  });

  it("get 不存在返回 null", () => {
    expect(Local.get("nonexistent")).toBeNull();
  });

  it("remove 删除指定 key", () => {
    Local.set("k1", "v1");
    Local.set("k2", "v2");
    Local.remove("k1");
    expect(Local.get("k1")).toBeNull();
    expect(Local.get("k2")).toBe("v2");
  });

  it("clear 清除全部", () => {
    Local.set("a", "1");
    Local.set("b", "2");
    Local.clear();
    expect(Local.get("a")).toBeNull();
    expect(Local.get("b")).toBeNull();
  });

  it("themeConfig 保存与读取", () => {
    const config = { globalI18n: "en", globalComponentSize: "large" };
    Local.set("themeConfig", config);
    const loaded = Local.get("themeConfig");
    expect(loaded).toEqual(config);
    expect(loaded.globalI18n).toBe("en");
  });
});

describe("Session Storage utils", () => {
  beforeEach(() => Session.clear());

  it("set/get 字符串", () => {
    Session.set("perm", "read");
    expect(Session.get("perm")).toBe("read");
  });

  it("set/get 对象", () => {
    const menus = [{ name: "home", title: "首页" }];
    Session.set("userMenu", menus);
    // token 特殊处理不走 sessionStorage
    expect(Session.get("userMenu")).toEqual(menus);
  });

  it("token 使用 Cookie 存储", () => {
    Session.set("token", "abc123");
    // 验证不是通过 sessionStorage 存储
    expect(window.sessionStorage.getItem("token")).toBeNull();
  });

  it("remove 删除指定 key", () => {
    Session.set("a", "1");
    Session.remove("a");
    expect(Session.get("a")).toBeNull();
  });

  it("clear 清除全部（含 token）", () => {
    Session.set("token", "abc");
    Session.set("userMenu", [{ name: "home" }]);
    Session.clear();
    expect(Session.get("token")).toBeNull();
    expect(Session.get("userMenu")).toBeNull();
  });
});
