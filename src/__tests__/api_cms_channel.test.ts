import { describe, it, expect, vi, beforeEach } from "vite-plus/test";

// Mock request module
const mockRequest = vi.fn();
vi.mock("/@/utils/request", () => ({
  default: mockRequest,
}));

describe("API: cms/channel", () => {
  beforeEach(() => {
    mockRequest.mockReset();
  });

  it("listCmsChannel 应 GET /channel/list", async () => {
    const { listCmsChannel } = await import("/@/api/cms/channel");
    mockRequest.mockResolvedValue({ data: { list: [], total: 0 } });
    await listCmsChannel({ name: "test" });

    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        url: "/api/v1/admin/channel/list",
        method: "get",
        params: { name: "test" },
      }),
    );
  });

  it("getCmsChannel 应 GET /channel/", async () => {
    const { getCmsChannel } = await import("/@/api/cms/channel");
    mockRequest.mockResolvedValue({ data: { info: { id: 1, name: "test" } } });
    const res = await getCmsChannel(1);
    expect(res.data.info.id).toBe(1);

    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        url: "/api/v1/admin/channel/",
        method: "get",
        params: { id: "1" },
      }),
    );
  });

  it("addCmsChannel 应 POST /channel/add", async () => {
    const { addCmsChannel } = await import("/@/api/cms/channel");
    mockRequest.mockResolvedValue({ data: { id: 1 } });
    await addCmsChannel({ name: "新栏目", type: "list" });

    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        url: "/api/v1/admin/channel/add",
        method: "post",
        data: { name: "新栏目", type: "list" },
      }),
    );
  });

  it("updateCmsChannel 应 PUT /channel/edit", async () => {
    const { updateCmsChannel } = await import("/@/api/cms/channel");
    mockRequest.mockResolvedValue({});
    await updateCmsChannel({ id: 1, name: "改名" });

    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        url: "/api/v1/admin/channel/edit",
        method: "put",
        data: { id: 1, name: "改名" },
      }),
    );
  });

  it("delCmsChannel 应 DELETE /channel/del", async () => {
    const { delCmsChannel } = await import("/@/api/cms/channel");
    mockRequest.mockResolvedValue({});
    await delCmsChannel([1, 2, 3]);

    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        url: "/api/v1/admin/channel/del",
        method: "delete",
        data: { ids: [1, 2, 3] },
      }),
    );
  });

  it("updateCmsChannelWeigh 应 PUT /channel/weigh", async () => {
    const { updateCmsChannelWeigh } = await import("/@/api/cms/channel");
    mockRequest.mockResolvedValue({});
    await updateCmsChannelWeigh(1, 99);

    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        url: "/api/v1/admin/channel/weigh",
        method: "put",
        data: { id: 1, weigh: 99 },
      }),
    );
  });

  // 新增：清空栏目文章
  it("clearChannelArticles 应 DELETE /channel/clear_articles", async () => {
    const { clearChannelArticles } = await import("/@/api/cms/channel");
    mockRequest.mockResolvedValue({ data: { deleted_count: 5 } });
    const res = await clearChannelArticles([1, 2]);
    expect(res.data.deleted_count).toBe(5);

    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        url: "/api/v1/admin/channel/clear_articles",
        method: "delete",
        data: { channel_ids: [1, 2] },
      }),
    );
  });

  it("clearChannelArticles 空数组应正常发送请求", async () => {
    const { clearChannelArticles } = await import("/@/api/cms/channel");
    mockRequest.mockResolvedValue({ data: { deleted_count: 0 } });
    const res = await clearChannelArticles([]);
    expect(res.data.deleted_count).toBe(0);

    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({ data: { channel_ids: [] } }),
    );
  });
});
