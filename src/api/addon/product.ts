// ==================== 商品 ====================
export function getProductList(params: ProductListParams) {
  return request({ url: "/api/v1/addon/product/list", method: "get", params });
}
export function getProductDetail(params: { id: number }) {
  return request({ url: "/api/v1/addon/product/get-edit", method: "get", params });
}
export function addProduct(data: ProductAddParams) {
  return request({ url: "/api/v1/addon/product/add", method: "post", data });
}
export function editProduct(data: ProductEditParams) {
  return request({ url: "/api/v1/addon/product/edit", method: "put", data });
}
export function deleteProduct(data: { ids: number[] }) {
  return request({ url: "/api/v1/addon/product/del", method: "delete", data });
}

// ---------- SKU ----------
export function getSkuList(params: { product_id: number }) {
  return request({ url: "/api/v1/addon/product/skus", method: "get", params });
}
export function addSku(data: {
  product_id: number;
  channel_code: string;
  sku?: string;
  price: number;
  currency?: string;
}) {
  return request({ url: "/api/v1/addon/product/sku/add", method: "post", data });
}
export function editSku(data: {
  id: number;
  channel_code?: string;
  sku?: string;
  price?: number;
  currency?: string;
}) {
  return request({ url: "/api/v1/addon/product/sku/edit", method: "put", data });
}
export function deleteSku(data: { ids: number[] }) {
  return request({ url: "/api/v1/addon/product/sku/del", method: "delete", data });
}

// ---------- 翻译 ----------
export function getTransList(params: { product_id: number }) {
  return request({ url: "/api/v1/addon/product/translations", method: "get", params });
}
export function addTrans(data: {
  product_id: number;
  lang: string;
  name?: string;
  description?: string;
}) {
  return request({ url: "/api/v1/addon/product/translation/add", method: "post", data });
}
export function editTrans(data: { id: number; name?: string; description?: string }) {
  return request({ url: "/api/v1/addon/product/translation/edit", method: "put", data });
}
export function deleteTrans(data: { ids: number[] }) {
  return request({ url: "/api/v1/addon/product/translation/del", method: "delete", data });
}

// ---------- 回收站 ----------
export function getRecycleList(params: { page: number; row: number }) {
  return request({ url: "/api/v1/addon/product/recycle", method: "get", params });
}
export function restoreProduct(data: { ids: number[] }) {
  return request({ url: "/api/v1/addon/product/restore", method: "post", data });
}
export function purgeProduct(data: { ids: number[] }) {
  return request({ url: "/api/v1/addon/product/purge", method: "delete", data });
}

// ---------- SKU 回收站 ----------
export function getSkuRecycleList(params: { page: number; row: number }) {
  return request({ url: "/api/v1/addon/product/sku/recycle", method: "get", params });
}
export function restoreSku(data: { ids: number[] }) {
  return request({ url: "/api/v1/addon/product/sku/restore", method: "post", data });
}
export function purgeSku(data: { ids: number[] }) {
  return request({ url: "/api/v1/addon/product/sku/purge", method: "delete", data });
}

// ---------- 翻译回收站 ----------
export function getTransRecycleList(params: { page: number; row: number }) {
  return request({ url: "/api/v1/addon/product/translation/recycle", method: "get", params });
}
export function restoreTrans(data: { ids: number[] }) {
  return request({ url: "/api/v1/addon/product/translation/restore", method: "post", data });
}
export function purgeTrans(data: { ids: number[] }) {
  return request({ url: "/api/v1/addon/product/translation/purge", method: "delete", data });
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
export interface ProductItem {
  id: number;
  type: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  state: number;
  extra: Record<string, any>;
  created_at: number;
  updated_at: number;
  deleted_at: number;
}

export interface ProductListParams extends PageParams {
  app_id: number;
  keyword?: string;
}

export interface ProductAddParams {
  app_id: number;
  name?: string;
  local_product_id: string;
  price?: number;
  currency?: string;
  status?: number;
}

export interface ProductEditParams extends ProductAddParams {
  id: number;
}

// ---------- 版本 ----------

// ---------- 支付配置 ----------

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
