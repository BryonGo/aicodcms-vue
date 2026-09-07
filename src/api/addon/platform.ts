import request from "/@/utils/request";

// ==================== Types ====================

// 字段命名与后端 api/v1/platform/admin.go 的 json tag 严格对齐（camelCase）

export interface AdminTaskItem {
  id: number;
  siteId: number;
  accountId: number;
  product: string;
  type: string;
  status: string;
  progress: number;
  errorCode: string;
  reservedCredits: number;
  billedCredits: number;
  createdAt: number;
}

export interface AdminLedgerItem {
  id: number;
  siteId: number;
  accountId: number;
  op: string;
  amount: number;
  balanceAfter: number;
  taskId: number;
  orderId: number;
  createdAt: number;
}

export interface AdminTasksParams {
  siteId?: number;
  status?: string;
  product?: string;
  page?: number;
  pageSize?: number;
}

export interface AdminLedgerParams {
  siteId?: number;
  accountId?: number;
  page?: number;
  pageSize?: number;
}

export interface AdminTasksRes {
  list: AdminTaskItem[];
  total: number;
}

export interface AdminLedgerRes {
  list: AdminLedgerItem[];
  total: number;
}

export interface AdminProviderHealthItem {
  siteId: number;
  siteCode: string;
  provider: string;
  healthy: boolean;
  detail: string;
}

export interface AdminProvidersHealthRes {
  list: AdminProviderHealthItem[];
}

export interface AdminBillingRateItem {
  id: number;
  siteId: number;
  product: string;
  dimKey: string;
  credits: number;
  providerCostCents: number;
  revision: number;
  status: number;
  createdAt: number;
}

export interface AdminBillingRatesParams {
  siteId?: number;
  product?: string;
  page?: number;
  pageSize?: number;
}

export interface AdminBillingRatesRes {
  list: AdminBillingRateItem[];
  total: number;
}

// ==================== API ====================

/** 任务排查 */
export function getPlatformTasks(params: AdminTasksParams) {
  return request<AdminTasksRes>({
    url: "/api/v1/addon/admin/platform/tasks",
    method: "get",
    params,
  });
}

/** 账本查询 */
export function getPlatformLedger(params: AdminLedgerParams) {
  return request<AdminLedgerRes>({
    url: "/api/v1/addon/admin/platform/ledger",
    method: "get",
    params,
  });
}

/** 供应商健康检查 */
export function getPlatformProvidersHealth() {
  return request<AdminProvidersHealthRes>({
    url: "/api/v1/addon/admin/platform/providers/health",
    method: "get",
  });
}

/** 报价套餐列表 */
export function getPlatformBillingRates(params: AdminBillingRatesParams) {
  return request<AdminBillingRatesRes>({
    url: "/api/v1/addon/admin/platform/billing-rates",
    method: "get",
    params,
  });
}
