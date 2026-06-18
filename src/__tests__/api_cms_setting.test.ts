import { describe, it, expect, vi, beforeEach } from "vite-plus/test";

// Mock request module
const mockRequest = vi.fn();
vi.mock("/@/utils/request", () => ({
  default: mockRequest,
}));

describe("API: cms/setting", () => {
  beforeEach(() => {
    mockRequest.mockReset();
  });

  it("getCmsSetting 应 GET /setting/get", async () => {
    const { getCmsSetting } = await import("/@/api/cms/setting");
    mockRequest.mockResolvedValue({ data: { site: { name: "AICODCMS" } } });
    await getCmsSetting();

    expect(mockRequest).toHaveBeenCalledTimes(1);
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/api/v1/admin/setting/get", method: "get" }),
    );
  });

  it("setCmsSetting 应 POST /setting/set", async () => {
    const { setCmsSetting } = await import("/@/api/cms/setting");
    mockRequest.mockResolvedValue({});
    await setCmsSetting({ site: { name: "NewName" } });

    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        url: "/api/v1/admin/setting/set",
        method: "post",
        data: { site: { name: "NewName" } },
      }),
    );
  });

  it("getCmsSettingFields 应 GET /setting/fields", async () => {
    const { getCmsSettingFields } = await import("/@/api/cms/setting");
    mockRequest.mockResolvedValue({ data: { fields: [] } });
    await getCmsSettingFields();

    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/api/v1/admin/setting/fields", method: "get" }),
    );
  });

  it("saveCmsSettingFields 应 POST /setting/save-fields", async () => {
    const { saveCmsSettingFields } = await import("/@/api/cms/setting");
    mockRequest.mockResolvedValue({});
    await saveCmsSettingFields({ "site.name": "AICODCMS" });

    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        url: "/api/v1/admin/setting/save-fields",
        method: "post",
        data: { values: { "site.name": "AICODCMS" } },
      }),
    );
  });

  it("setLanguage 应 POST /setting/set-language", async () => {
    const { setLanguage } = await import("/@/api/cms/setting");
    mockRequest.mockResolvedValue({});
    await setLanguage("en");

    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        url: "/api/v1/admin/setting/set-language",
        method: "post",
        data: { lang: "en" },
      }),
    );
  });

  it("getDefaultLanguage 从 /setting/get 返回 i18n.default_language", async () => {
    const { getDefaultLanguage } = await import("/@/api/cms/setting");
    mockRequest.mockResolvedValue({ data: { i18n: { default_language: "en" } } });
    const lang = await getDefaultLanguage();
    expect(lang).toBe("en");
  });

  it("getDefaultLanguage 后端无配置时回退 zh-CN", async () => {
    const { getDefaultLanguage } = await import("/@/api/cms/setting");
    mockRequest.mockResolvedValue({ data: {} });
    const lang = await getDefaultLanguage();
    expect(lang).toBe("zh-CN");
  });

  it("getDefaultLanguage 后端不可达时回退 zh-CN", async () => {
    const { getDefaultLanguage } = await import("/@/api/cms/setting");
    mockRequest.mockRejectedValue(new Error("Network Error"));
    const lang = await getDefaultLanguage();
    expect(lang).toBe("zh-CN");
  });

  it("listSettingGroup 应 GET /setting/group/list", async () => {
    const { listSettingGroup } = await import("/@/api/cms/setting");
    mockRequest.mockResolvedValue({ data: { groups: [] } });
    await listSettingGroup();
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/api/v1/admin/setting/group/list", method: "get" }),
    );
  });

  it("addSettingGroup 应 POST /setting/group/add", async () => {
    const { addSettingGroup } = await import("/@/api/cms/setting");
    mockRequest.mockResolvedValue({});
    await addSettingGroup({ name: "新分组" });
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/api/v1/admin/setting/group/add", method: "post" }),
    );
  });

  it("delSettingGroup 应 DELETE /setting/group/del", async () => {
    const { delSettingGroup } = await import("/@/api/cms/setting");
    mockRequest.mockResolvedValue({});
    await delSettingGroup(1);
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        url: "/api/v1/admin/setting/group/del",
        method: "delete",
        data: { id: 1 },
      }),
    );
  });
});
