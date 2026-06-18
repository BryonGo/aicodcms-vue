import { describe, it, expect, beforeEach } from "vite-plus/test";
import { setActivePinia, createPinia } from "pinia";

describe("Store: routesList", () => {
  beforeEach(() => setActivePinia(createPinia()));

  it("初始路由列表为空", async () => {
    const { useRoutesList } = await import("/@/stores/routesList");
    const store = useRoutesList();
    expect(store.routesList).toEqual([]);
  });

  it("setRoutesList 更新路由", async () => {
    const { useRoutesList } = await import("/@/stores/routesList");
    const store = useRoutesList();
    store.setRoutesList([{ path: "/home", name: "home" }]);
    expect(store.routesList).toHaveLength(1);
  });
});

describe("Store: tagsViewRoutes", () => {
  beforeEach(() => setActivePinia(createPinia()));

  it("初始 tagsViewRoutes 为空", async () => {
    const { useTagsViewRoutes } = await import("/@/stores/tagsViewRoutes");
    const store = useTagsViewRoutes();
    expect(store.tagsViewRoutes).toEqual([]);
  });

  it("setTagsViewRoutes 更新", async () => {
    const { useTagsViewRoutes } = await import("/@/stores/tagsViewRoutes");
    const store = useTagsViewRoutes();
    store.setTagsViewRoutes([{ path: "/home" }]);
    expect(store.tagsViewRoutes).toHaveLength(1);
  });
});

describe("Store: keepALiveNames", () => {
  beforeEach(() => setActivePinia(createPinia()));

  it("初始 keepAliveNames 为空", async () => {
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

describe("Store: requestOldRoutes", () => {
  beforeEach(() => setActivePinia(createPinia()));

  it("初始 requestOldRoutes 为空", async () => {
    const { useRequestOldRoutes } = await import("/@/stores/requestOldRoutes");
    const store = useRequestOldRoutes();
    expect(store.requestOldRoutes).toEqual([]);
  });

  it("setRequestOldRoutes 更新", async () => {
    const { useRequestOldRoutes } = await import("/@/stores/requestOldRoutes");
    const store = useRequestOldRoutes();
    store.setRequestOldRoutes([{ path: "/test" }]);
    expect(store.requestOldRoutes).toHaveLength(1);
  });
});
