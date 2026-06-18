// ==================== 全局支付通道 ====================
export interface PayChannelItem {
  id: number;
  channel_code: string;
  name: string;
  platform_type: string;
  dev_link: string;
  description: string;
  state: number;
}
export function getPayChannelList(params: PageParams) {
  return request({ url: "/api/v1/addon/pay/channel/list", method: "get", params });
}
export function getPayChannelDetail(params: { id: number }) {
  return request({ url: "/api/v1/addon/pay/channel/get-edit", method: "get", params });
}
export function addPayChannel(data: any) {
  return request({ url: "/api/v1/addon/pay/channel/add", method: "post", data });
}
export function editPayChannel(data: any) {
  return request({ url: "/api/v1/addon/pay/channel/edit", method: "put", data });
}
export function deletePayChannel(data: { ids: number[] }) {
  return request({ url: "/api/v1/addon/pay/channel/del", method: "delete", data });
}

import request from "/@/utils/request";

// ============================================================
// TypeScript 类型定义
// ============================================================

/** 通用分页参数 */
export interface PageParams {
  page?: number;
  row?: number;
}

/** 通用分页响应 */
export interface PageData<T = any> {
  list: T[];
  total: number;
  page: number;
  row: number;
}

// ---------- 游戏 ----------

// app_id/app_key/app_secret 由后端自动生成，前端不传

// 编辑不修改 app_key/app_secret，仅需 id 覆盖

// ---------- 商品 ----------

// ---------- 版本 ----------

// ---------- 支付配置 ----------
export interface PayConfigItem {
  id: number;
  module: string;
  app_id: number;
  channel_code: string;
  state: number;
  extra_config: string;
  created_at: number;
  updated_at: number;
  deleted_at: number;
}

export interface PayConfigListParams extends PageParams {
  module?: string;
  app_id?: number;
  channel_code?: string;
}

export interface PayConfigAddParams {
  module: string;
  platform: string;
  app_id: number;
  channel_code: string;
  state?: number;
  extra_config?: string;
}

export interface PayConfigEditParams extends PayConfigAddParams {
  id: number;
}

// ---------- 开发商 ----------

// ---------- 订单 ----------

// ---------- 支付防重 ----------

// ---------- 用户游戏关联 ----------

// ---------- Google 退款 ----------

// ---------- AppStore 退款 ----------

// ---------- 通知日志 ----------

// ---------- 封禁 ----------

// ---------- 登录日志 ----------

// ============================================================
// API 函数
// ============================================================

// ==================== Payment 支付验证 ====================
export function paymentVerify(data: {
  channel: string;
  payload: string;
  product_id?: string;
  price?: number;
  currency?: string;
}) {
  return request({ url: "/api/v1/addon/pay/payment/verify", method: "post", data });
}

// ==================== 支付配置 ====================
export function getPayConfigList(params: PayConfigListParams) {
  return request({ url: "/api/v1/addon/pay/config/list", method: "get", params });
}
export function getPayConfigDetail(params: { id: number }) {
  return request({ url: "/api/v1/addon/pay/config/get-edit", method: "get", params });
}
export function addPayConfig(data: PayConfigAddParams) {
  return request({ url: "/api/v1/addon/pay/config/add", method: "post", data });
}
export function editPayConfig(data: PayConfigEditParams) {
  return request({ url: "/api/v1/addon/pay/config/edit", method: "put", data });
}
export function deletePayConfig(data: { ids: number[] }) {
  return request({ url: "/api/v1/addon/pay/config/del", method: "delete", data });
}
