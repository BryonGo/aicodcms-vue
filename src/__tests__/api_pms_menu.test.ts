import { describe, it, expect, vi, beforeEach } from "vite-plus/test";

const mockRequest = vi.fn();
vi.mock("/@/utils/request", () => ({
  default: mockRequest,
}));

describe("API: pms/menu", () => {
  beforeEach(() => {
    mockRequest.mockReset();
  });

  it("getMenuList 应 GET /menu/list", async () => {
    const { getMenuList } = await import("/@/api/pms/menu");
    mockRequest.mockResolvedValue({ data: { rules: [] } });
    await getMenuList({ title: "文章" });

    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        url: "/api/v1/pms/menu/list",
        method: "get",
        params: { title: "文章" },
      }),
    );
  });

  it("getMenuList 无参数应正常调用", async () => {
    const { getMenuList } = await import("/@/api/pms/menu");
    mockRequest.mockResolvedValue({ data: { rules: [] } });
    await getMenuList({});

    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/api/v1/pms/menu/list", method: "get", params: {} }),
    );
  });

  it("getUserMenus 应 GET /user/menus", async () => {
    const { getUserMenus } = await import("/@/api/pms/menu");
    mockRequest.mockResolvedValue({ data: { menu_list: [], permissions: [] } });
    await getUserMenus();

    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/api/v1/pms/user/menus", method: "get" }),
    );
  });

  it("getMenuParams 应 GET /menu/get-params", async () => {
    const { getMenuParams } = await import("/@/api/pms/menu");
    mockRequest.mockResolvedValue({ data: { roles: [], menus: [] } });
    await getMenuParams();

    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/api/v1/pms/menu/get-params", method: "get" }),
    );
  });

  it("addMenu 应 POST /menu/add", async () => {
    const { addMenu } = await import("/@/api/pms/menu");
    mockRequest.mockResolvedValue({});
    await addMenu({ name: "newMenu", title: "新菜单", pid: 0 });

    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/api/v1/pms/menu/add", method: "post" }),
    );
    expect(mockRequest.mock.calls[0][0].data).toMatchObject({ name: "newMenu" });
  });

  it("getMenuInfo 应 GET /menu/get 带 id 参数", async () => {
    const { getMenuInfo } = await import("/@/api/pms/menu");
    mockRequest.mockResolvedValue({ data: { rule: {} } });
    await getMenuInfo(60);

    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/api/v1/pms/menu/get", method: "get", params: { id: 60 } }),
    );
  });

  it("updateMenu 应 PUT /menu/edit", async () => {
    const { updateMenu } = await import("/@/api/pms/menu");
    mockRequest.mockResolvedValue({});
    await updateMenu({ id: 60, title: "menu_60" });

    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/api/v1/pms/menu/edit", method: "put" }),
    );
  });

  it("delMenu 应 DELETE /menu/del 带 ids 数组", async () => {
    const { delMenu } = await import("/@/api/pms/menu");
    mockRequest.mockResolvedValue({});
    await delMenu(60);

    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        url: "/api/v1/pms/menu/del",
        method: "delete",
        data: { ids: [60] },
      }),
    );
  });
});
