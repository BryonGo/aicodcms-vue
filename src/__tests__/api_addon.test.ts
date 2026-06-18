import { describe, it, expect, vi, beforeEach } from "vite-plus/test";

const mockRequest = vi.fn();
vi.mock("/@/utils/request", () => ({ default: mockRequest }));

beforeEach(() => mockRequest.mockClear());

// ======== addon/movie ========

describe("addon/movie", () => {
  it("player group list/save", async () => {
    const mod = await import("/@/api/addon/movie");
    await mod.getPlayerGroups(1);
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/api/v1/addon/movie/player/group/list", method: "get" }),
    );
    await mod.savePlayerGroups(1, [{ article_id: 1, group_name: "线路1", sort: 1 }]);
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/api/v1/addon/movie/player/group/save", method: "post" }),
    );
  });
  it("play url list/save", async () => {
    const mod = await import("/@/api/addon/movie");
    await mod.getPlayUrls(1);
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/api/v1/addon/movie/play-url/list", method: "get" }),
    );
    await mod.savePlayUrls(1, [
      { article_id: 1, group_id: 1, episode_num: 1, episode_title: "EP1", play_url: "https://..." },
    ]);
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/api/v1/addon/movie/play-url/save", method: "post" }),
    );
  });
});

// ======== addon/job ========

describe("addon/job", () => {
  it("list/add/edit/del", async () => {
    const mod = await import("/@/api/addon/job");
    await mod.listJob({});
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/api/v1/addon/job/list", method: "get" }),
    );
    await mod.getJob(1);
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/api/v1/addon/job/get", method: "get" }),
    );
    await mod.addJob({ job_name: "test" });
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/api/v1/addon/job/add", method: "post" }),
    );
    await mod.editJob({ id: 1 });
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/api/v1/addon/job/edit", method: "put" }),
    );
    await mod.deleteJob([1]);
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/api/v1/addon/job/del", method: "delete" }),
    );
  });
});

// ======== addon/sdk/game ========

describe("addon/sdk/game", () => {
  it("CRUD", async () => {
    const mod = await import("/@/api/addon/sdk");
    await mod.getGameList({});
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/api/v1/addon/sdk/game/list", method: "get" }),
    );
    await mod.addGame({ app_key: "test", app_secret: "test" });
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/api/v1/addon/sdk/game/add", method: "post" }),
    );
    await mod.editGame({ id: 1 });
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/api/v1/addon/sdk/game/edit", method: "put" }),
    );
    await mod.deleteGame({ ids: [1] });
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/api/v1/addon/sdk/game/del", method: "delete" }),
    );
    await mod.getGameDetail({ id: 1 });
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/api/v1/addon/sdk/game/get-edit", method: "get" }),
    );
  });
});

// ======== pay/config ========

describe("pay/config", () => {
  it("CRUD", async () => {
    const mod = await import("/@/api/addon/pay");
    await mod.getPayConfigList({});
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/api/v1/addon/pay/config/list", method: "get" }),
    );
    await mod.addPayConfig({ module: "game", app_id: 1, channel_code: "alipay" });
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/api/v1/addon/pay/config/add", method: "post" }),
    );
    await mod.editPayConfig({ id: 1 });
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/api/v1/addon/pay/config/edit", method: "put" }),
    );
    await mod.deletePayConfig({ ids: [1] });
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/api/v1/addon/pay/config/del", method: "delete" }),
    );
  });
});

// ======== addon/order ========

describe("addon/order", () => {
  it("list/detail/completed", async () => {
    const mod = await import("/@/api/addon/order");
    await mod.getOrderList({});
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/api/v1/addon/order/list", method: "get" }),
    );
    await mod.getOrderDetail({ id: 1 });
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/api/v1/addon/order/get-edit", method: "get" }),
    );
    await mod.getCompletedOrderList({});
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/api/v1/addon/order/completed/list", method: "get" }),
    );
  });
});

// ======== pay/channel ========

describe("pay/channel", () => {
  it("CRUD", async () => {
    const mod = await import("/@/api/addon/pay");
    await mod.getPayChannelList({});
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/api/v1/addon/pay/channel/list", method: "get" }),
    );
    await mod.addPayChannel({ name: "支付宝", code: "alipay", sign_type: "rsa2" });
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/api/v1/addon/pay/channel/add", method: "post" }),
    );
    await mod.editPayChannel({ id: 1, status: 1 });
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/api/v1/addon/pay/channel/edit", method: "put" }),
    );
    await mod.deletePayChannel({ ids: [1] });
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/api/v1/addon/pay/channel/del", method: "delete" }),
    );
  });
});

// ======== addon/sdk/currency ========

describe("addon/sdk/currency", () => {
  it("list/add/edit/del", async () => {
    const mod = await import("/@/api/addon/sdk");
    await mod.getCurrencyList({});
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/api/v1/addon/sdk/currency/list", method: "get" }),
    );
    await mod.getCurrencyDetail({ id: 1 });
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/api/v1/addon/sdk/currency/get-edit", method: "get" }),
    );
    await mod.addCurrency({ currency_code: "USD", currency_name: "美元", symbol: "$" });
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/api/v1/addon/sdk/currency/add", method: "post" }),
    );
    await mod.editCurrency({ id: 1, exchange_rate: 7.24 });
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/api/v1/addon/sdk/currency/edit", method: "put" }),
    );
    await mod.deleteCurrency({ ids: [1] });
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/api/v1/addon/sdk/currency/del", method: "delete" }),
    );
  });
});

// ======== addon/sdk/ban ========

describe("addon/sdk/ban", () => {
  it("list/detail/add/edit/del", async () => {
    const mod = await import("/@/api/addon/sdk");
    await mod.getBanList({});
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/api/v1/addon/sdk/ban/list", method: "get" }),
    );
    await mod.addBan({ ban_type: 1, ban_value: "test" });
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/api/v1/addon/sdk/ban/add", method: "post" }),
    );
    await mod.editBan({ id: 1, reason: "违规" });
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/api/v1/addon/sdk/ban/edit", method: "put" }),
    );
    await mod.deleteBan({ ids: [1] });
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/api/v1/addon/sdk/ban/del", method: "delete" }),
    );
  });
});

// ======== addon/sdk/user ========

describe("addon/sdk/user", () => {
  it("list/detail", async () => {
    const mod = await import("/@/api/addon/sdk");
    await mod.getUserList({});
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/api/v1/addon/sdk/account/list", method: "get" }),
    );
    await mod.getUser({ id: 1 });
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/api/v1/addon/sdk/account/get", method: "get" }),
    );
  });
  it("params serialization — string/bigint SnowflakeId", async () => {
    const mod = await import("/@/api/addon/sdk");
    const snowflake = "17325944815535260672";
    await mod.getUser({ id: snowflake });
    const call1 = mockRequest.mock.lastCall[0];
    expect(call1.params.id).toBe(snowflake);
    await mod.deleteUser({ ids: [snowflake] });
    const call2 = mockRequest.mock.lastCall[0];
    expect(call2.data.ids).toEqual([snowflake]);
    await mod.resetPwd({ id: snowflake, password: "NewPwd123" });
    const call3 = mockRequest.mock.lastCall[0];
    expect(call3.data.id).toBe(snowflake);
    expect(call3.data.password).toBe("NewPwd123");
  });
});
