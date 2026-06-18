import { describe, it, expect, vi, beforeEach } from "vite-plus/test";

const mockRequest = vi.fn();
vi.mock("/@/utils/request", () => ({ default: mockRequest }));

beforeEach(() => mockRequest.mockClear());

// ======== cms ========

describe("cms/article", () => {
  it("list", async () => {
    const { listCmsArticle } = await import("/@/api/cms/article");
    await listCmsArticle({});
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/api/v1/admin/article/list", method: "get" }),
    );
  });
  it("get/add/del", async () => {
    const mod = await import("/@/api/cms/article");
    await mod.getCmsArticle(1);
    await mod.addCmsArticle({ title: "t" });
    await mod.delCmsArticle([1]);
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/api/v1/admin/article/get", method: "get" }),
    );
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/api/v1/admin/article/add", method: "post" }),
    );
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/api/v1/admin/article/del", method: "delete" }),
    );
  });
  it("edit/restore/hardDel/trash/tree", async () => {
    const mod = await import("/@/api/cms/article");
    await mod.updateCmsArticle({ id: 1 });
    await mod.restoreCmsArticle([1]);
    await mod.hardDelCmsArticle([1]);
    await mod.listTrashCmsArticle({});
    await mod.getChannelTree();
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/api/v1/admin/article/edit", method: "put" }),
    );
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/api/v1/admin/article/restore", method: "put" }),
    );
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/api/v1/admin/channel/tree-list", method: "get" }),
    );
  });
});

describe("cms/channel", () => {
  it("CRUD", async () => {
    const mod = await import("/@/api/cms/channel");
    await mod.listCmsChannel({});
    await mod.addCmsChannel({ name: "n" });
    await mod.delCmsChannel([1]);
    await mod.updateCmsChannelWeigh(1, 10);
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/api/v1/admin/channel/list", method: "get" }),
    );
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/api/v1/admin/channel/add", method: "post" }),
    );
  });
});

describe("cms/block", () => {
  it("CRUD", async () => {
    const mod = await import("/@/api/cms/block");
    await mod.listCmsBlock({});
    await mod.addCmsBlock({ type: "b" });
    await mod.delCmsBlock([1]);
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/api/v1/admin/block/list", method: "get" }),
    );
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/api/v1/admin/block/add", method: "post" }),
    );
  });
});

describe("cms/page", () => {
  it("CRUD", async () => {
    const mod = await import("/@/api/cms/page");
    await mod.listCmsPage({});
    await mod.addCmsPage({ title: "t" });
    await mod.delCmsPage([1]);
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/api/v1/admin/page/list", method: "get" }),
    );
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/api/v1/admin/page/add", method: "post" }),
    );
  });
});

describe("cms/tag", () => {
  it("CRUD", async () => {
    const mod = await import("/@/api/cms/tag");
    await mod.listCmsTags({});
    await mod.addCmsTags({ name: "n" });
    await mod.delCmsTags([1]);
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/api/v1/admin/tag/list", method: "get" }),
    );
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/api/v1/admin/tag/add", method: "post" }),
    );
  });
});

describe("cms/tpl", () => {
  it("files", async () => {
    const mod = await import("/@/api/cms/tpl");
    await mod.listTemplateFiles();
    await mod.saveTemplateFile("f", "c");
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/api/v1/admin/tpl/files/list", method: "get" }),
    );
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/api/v1/admin/tpl/files/save", method: "put" }),
    );
  });
});

describe("cms/settingField", () => {
  it("CRUD", async () => {
    const mod = await import("/@/api/cms/settingField");
    await mod.listSettingField({});
    await mod.addSettingField({ name: "n", label: "l" });
    await mod.getSettingFieldTypes();
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/api/v1/admin/setting/field/list", method: "get" }),
    );
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/api/v1/admin/setting/field/add", method: "post" }),
    );
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/api/v1/admin/setting/field/types", method: "get" }),
    );
  });
});

// ======== pms (import-verify only) ========

describe("pms - 模块可导入", () => {
  it("user", async () => {
    const m = await import("/@/api/pms/user");
    expect(m).toBeDefined();
  });
  it("role", async () => {
    const m = await import("/@/api/pms/role");
    expect(m).toBeDefined();
  });
  it("dept", async () => {
    const m = await import("/@/api/pms/dept");
    expect(m).toBeDefined();
  });
  it("param", async () => {
    const m = await import("/@/api/pms/param");
    expect(m).toBeDefined();
  });
  it("post", async () => {
    const m = await import("/@/api/pms/post");
    expect(m).toBeDefined();
  });
  it("dict/type", async () => {
    const m = await import("/@/api/pms/dict/type");
    expect(m).toBeDefined();
  });
  it("dict/data", async () => {
    const m = await import("/@/api/pms/dict/data");
    expect(m).toBeDefined();
  });
  it("cache", async () => {
    const m = await import("/@/api/pms/cache");
    expect(m).toBeDefined();
  });
  it("monitor/loginLog", async () => {
    const m = await import("/@/api/pms/monitor/loginLog");
    expect(m).toBeDefined();
  });
  it("monitor/operLog", async () => {
    const m = await import("/@/api/pms/monitor/operLog");
    expect(m).toBeDefined();
  });
  it("monitor/online", async () => {
    const m = await import("/@/api/pms/monitor/online");
    expect(m).toBeDefined();
  });
  it("monitor/server", async () => {
    const m = await import("/@/api/pms/monitor/server");
    expect(m).toBeDefined();
  });
  it("modulesField", async () => {
    const m = await import("/@/api/pms/modulesField");
    expect(m).toBeDefined();
  });
  it("modulesInfo", async () => {
    const m = await import("/@/api/pms/modulesInfo");
    expect(m).toBeDefined();
  });
  it("upload", async () => {
    const m = await import("/@/api/pms/upload");
    expect(m).toBeDefined();
  });
  it("tiptap", async () => {
    const m = await import("/@/api/pms/tiptap");
    expect(m).toBeDefined();
  });
});

// ======== login + addon ========

describe("login", () => {
  it("login/captcha/logout", async () => {
    const mod = await import("/@/api/login");
    await mod.login({ username: "admin", password: "123" });
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/api/v1/pms/login", method: "post" }),
    );
    await mod.captcha();
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/api/v1/pub/captcha/get", method: "get" }),
    );
    await mod.logout();
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/api/v1/pms/login-out", method: "get" }),
    );
  });
});

describe("addon/sitemap", () => {
  it("get/update/generate/push", async () => {
    const mod = await import("/@/api/addon/sitemap");
    await mod.getSitemapConfig();
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/api/v1/addon/sitemap/config", method: "get" }),
    );
    await mod.generateSitemap("example.com");
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/api/v1/addon/sitemap/generate", method: "post" }),
    );
    await mod.pushSitemap("baidu", "example.com");
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/api/v1/addon/sitemap/push", method: "post" }),
    );
  });
});
