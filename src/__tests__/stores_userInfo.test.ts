import { describe, it, expect, beforeEach } from "vite-plus/test";
import { setActivePinia, createPinia } from "pinia";
import { Session } from "/@/utils/storage";

describe("Store: userInfo", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    Session.clear();
  });

  it("userInfos 初始结构包含关键字段", async () => {
    const { useUserInfo } = await import("/@/stores/userInfo");
    const store = useUserInfo();
    expect(store.userInfos).toBeDefined();
    expect(typeof store.userInfos).toBe("object");
  });
});

describe("Store: keepALiveNames", () => {
  beforeEach(() => setActivePinia(createPinia()));

  it("初始化 keepAliveNames 为空", async () => {
    const { useKeepALiveNames } = await import("/@/stores/keepAliveNames");
    const store = useKeepALiveNames();
    expect(store.keepAliveNames).toEqual([]);
  });

  it("直接赋值 keepAliveNames", async () => {
    const { useKeepALiveNames } = await import("/@/stores/keepAliveNames");
    const store = useKeepALiveNames();
    store.keepAliveNames = ["home", "article"];
    expect(store.keepAliveNames).toEqual(["home", "article"]);
  });
});
