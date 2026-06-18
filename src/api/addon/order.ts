import request from "/@/utils/request";

// ============================================================
// Admin 通用订单管理 API
// ============================================================

// ---------- 通用分页 ----------
export interface PageParams {
  page?: number;
  row?: number;
}

// ---------- 订单 ----------
export interface OrderItem {
  id: number;
  uid: number;
  app_id: number;
  product_id: string;
  price: number;
  currency: string;
  cp_order_id: string;
  status: number;
  notify_status: number;
  notify_content: string;
  pay_notify_url: string;
  role_id: string;
  server_id: string;
  created_at: number;
  updated_at: number;
  deleted_at: number;
  [key: string]: any;
}

export interface OrderListParams extends PageParams {
  app_id?: number;
  uid?: number;
  status?: string;
  cp_order_id?: string;
  keyword?: string;
}

// ---------- 支付防重 ----------
export interface CompletedOrderItem {
  id: number;
  uid: number;
  app_id: number;
  transaction_id: string;
  product_id: string;
  created_at: number;
  deleted_at: number;
}

export interface CompletedOrderListParams extends PageParams {
  app_id?: number;
  uid?: number;
  keyword?: string;
}

// ==================== 订单 ====================
export function getOrderList(params: OrderListParams) {
  return request({ url: "/api/v1/addon/order/list", method: "get", params });
}
export function queryPayOrder(params: { order_id: number }) {
  return request({ url: "/api/v1/addon/pay/payment/query", method: "get", params });
}

export function resendOrder(data: { order_id: number }) {
  return request({ url: "/api/v1/addon/order/notify-resend", method: "post", data });
}

export function getOrderDetail(params: { id: string | number }) {
  return request({ url: "/api/v1/addon/order/get-edit", method: "get", params });
}

// ==================== 支付防重 ====================
export function getCompletedOrderList(params: CompletedOrderListParams) {
  return request({ url: "/api/v1/addon/order/completed/list", method: "get", params });
}

// ==================== 操作 ====================
export function closeOrder(data: { order_id: number }) {
  return request({ url: "/api/v1/addon/order/close", method: "post", data });
}

export function refundOrder(data: { order_id: number }) {
  return request({ url: "/api/v1/addon/order/refund/manual", method: "post", data });
}
