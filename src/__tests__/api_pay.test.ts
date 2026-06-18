import { describe, it, expect, vi, beforeEach } from "vite-plus/test";

const mockRequest = vi.fn();
vi.mock("/@/utils/request", () => ({ default: mockRequest }));

beforeEach(() => mockRequest.mockClear());

// ======== pay/channel ========

describe("pay/channel", () => {
  it("CRUD with URL and method", async () => {
    const mod = await import("/@/api/addon/pay");

    await mod.getPayChannelList({});
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/api/v1/addon/pay/channel/list", method: "get" }),
    );

    await mod.getPayChannelDetail({ id: 1 });
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/api/v1/addon/pay/channel/get-edit", method: "get" }),
    );

    await mod.addPayChannel({
      channel_code: "alipay",
      name: "支付宝",
      platform_type: "alipay",
      state: 1,
    });
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/api/v1/addon/pay/channel/add", method: "post" }),
    );

    await mod.editPayChannel({ id: 1, name: "支付宝-新版" });
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/api/v1/addon/pay/channel/edit", method: "put" }),
    );

    await mod.deletePayChannel({ ids: [1, 2] });
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/api/v1/addon/pay/channel/del", method: "delete" }),
    );
  });

  it("passes query params to getPayChannelList", async () => {
    const mod = await import("/@/api/addon/pay");
    await mod.getPayChannelList({ page: 1, row: 20 });

    const call = mockRequest.mock.lastCall[0];
    expect(call.params).toEqual({ page: 1, row: 20 });
    expect(call.method).toBe("get");
  });

  it("passes id param to getPayChannelDetail", async () => {
    const mod = await import("/@/api/addon/pay");
    await mod.getPayChannelDetail({ id: 99 });

    const call = mockRequest.mock.lastCall[0];
    expect(call.params).toEqual({ id: 99 });
    expect(call.method).toBe("get");
  });

  it("passes data body to addPayChannel", async () => {
    const mod = await import("/@/api/addon/pay");
    const payload = { channel_code: "wxpay", name: "微信支付", platform_type: "wechat", state: 0 };
    await mod.addPayChannel(payload);

    const call = mockRequest.mock.lastCall[0];
    expect(call.data).toEqual(payload);
    expect(call.method).toBe("post");
  });

  it("passes ids array to deletePayChannel", async () => {
    const mod = await import("/@/api/addon/pay");
    await mod.deletePayChannel({ ids: [999] });

    const call = mockRequest.mock.lastCall[0];
    expect(call.data).toEqual({ ids: [999] });
    expect(call.method).toBe("delete");
  });
});

// ======== pay/config ========

describe("pay/config", () => {
  it("CRUD with URL and method", async () => {
    const mod = await import("/@/api/addon/pay");

    await mod.getPayConfigList({});
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/api/v1/addon/pay/config/list", method: "get" }),
    );

    await mod.getPayConfigDetail({ id: 1 });
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/api/v1/addon/pay/config/get-edit", method: "get" }),
    );

    await mod.addPayConfig({ module: "game", app_id: 100, channel_code: "alipay", state: 1 });
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/api/v1/addon/pay/config/add", method: "post" }),
    );

    await mod.editPayConfig({ id: 1, module: "cms", app_id: 1, channel_code: "wxpay" });
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/api/v1/addon/pay/config/edit", method: "put" }),
    );

    await mod.deletePayConfig({ ids: [3] });
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/api/v1/addon/pay/config/del", method: "delete" }),
    );
  });

  it("passes filter params to getPayConfigList", async () => {
    const mod = await import("/@/api/addon/pay");
    await mod.getPayConfigList({ module: "game", app_id: 100, channel_code: "alipay" });

    const call = mockRequest.mock.lastCall[0];
    expect(call.params).toEqual({ module: "game", app_id: 100, channel_code: "alipay" });
    expect(call.method).toBe("get");
  });

  it("passes module + app_id + channel_code in addPayConfig", async () => {
    const mod = await import("/@/api/addon/pay");
    const payload = {
      module: "game",
      app_id: 200,
      channel_code: "wxpay",
      state: 1,
      extra_config: '{"key":"val"}',
    };
    await mod.addPayConfig(payload);

    const call = mockRequest.mock.lastCall[0];
    expect(call.data).toEqual(payload);
    expect(call.method).toBe("post");
  });

  it("passes id in editPayConfig", async () => {
    const mod = await import("/@/api/addon/pay");
    await mod.editPayConfig({ id: 5, module: "cms", app_id: 1, channel_code: "paypal" });

    const call = mockRequest.mock.lastCall[0];
    expect(call.data).toEqual({ id: 5, module: "cms", app_id: 1, channel_code: "paypal" });
    expect(call.method).toBe("put");
  });
});

// ======== pay/payment ========

describe("pay/payment", () => {
  it("paymentVerify URL and method", async () => {
    const mod = await import("/@/api/addon/pay");
    await mod.paymentVerify({ channel: "google_pay", payload: "token123" });

    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/api/v1/addon/pay/payment/verify", method: "post" }),
    );
  });

  it("paymentVerify passes all optional fields", async () => {
    const mod = await import("/@/api/addon/pay");
    const payload = {
      channel: "apple_pay",
      payload: "receipt_data_abc",
      product_id: "com.example.product1",
      price: 699,
      currency: "CNY",
    };
    await mod.paymentVerify(payload);

    const call = mockRequest.mock.lastCall[0];
    expect(call.data).toEqual(payload);
  });

  it("paymentVerify with minimal params", async () => {
    const mod = await import("/@/api/addon/pay");
    await mod.paymentVerify({ channel: "paypal", payload: "order_456" });

    const call = mockRequest.mock.lastCall[0];
    expect(call.data).toEqual({ channel: "paypal", payload: "order_456" });
  });

  it("paymentVerify supports empty optional fields", async () => {
    const mod = await import("/@/api/addon/pay");
    await mod.paymentVerify({
      channel: "google_pay",
      payload: "",
      product_id: "",
      price: 0,
      currency: "",
    });

    const call = mockRequest.mock.lastCall[0];
    expect(call.data).toEqual({
      channel: "google_pay",
      payload: "",
      product_id: "",
      price: 0,
      currency: "",
    });
  });
});

// ======== pay Parameter serialization ========

describe("pay params serialization", () => {
  it("payChannel getPayChannelDetail with bigint SnowflakeId string", async () => {
    const mod = await import("/@/api/addon/pay");
    const snowflake = "17325944815535260672";
    await mod.getPayChannelDetail({ id: snowflake });

    const call = mockRequest.mock.lastCall[0];
    expect(call.params.id).toBe(snowflake);
    expect(typeof call.params.id).toBe("string");
  });

  it("payConfig deletePayConfig with SnowflakeId string array", async () => {
    const mod = await import("/@/api/addon/pay");
    const snowflakeIds = ["17325944815535260672", "17325944815535260673"];
    await mod.deletePayConfig({ ids: snowflakeIds } as any);

    const call = mockRequest.mock.lastCall[0];
    expect(call.data.ids).toEqual(snowflakeIds);
    expect(typeof call.data.ids[0]).toBe("string");
  });
});
