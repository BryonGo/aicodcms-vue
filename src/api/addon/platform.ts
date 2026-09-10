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

// ==================== 模型开关（admin.modelSwitch） ====================

export interface AdminModelSwitchItem {
  kind: string;
  modelId: string;
  name: string;
  type: string;
  family: string;
  engine: string;
  enabled: boolean;
  reason: string;
  updatedAt: number;
}

export interface AdminModelSwitchListParams {
  kind?: string;
  query?: string;
  page?: number;
  pageSize?: number;
}

export interface AdminModelSwitchListRes {
  items: AdminModelSwitchItem[];
  total: number;
}

export interface AdminModelSwitchSetParams {
  kind: string;
  modelId: string;
  enabled: boolean;
  reason?: string;
}

/** 模型开关列表（含未设置记录的模型，enabled 默认 true） */
export function getPlatformModelSwitches(params: AdminModelSwitchListParams) {
  return request<AdminModelSwitchListRes>({
    url: "/api/v1/addon/admin/platform/model/switch/list",
    method: "get",
    params,
  });
}

/** 设置模型开关（upsert；停用后前台不可见、创建任务被拒） */
export function setPlatformModelSwitch(data: AdminModelSwitchSetParams) {
  return request<AdminModelSwitchItem>({
    url: "/api/v1/addon/admin/platform/model/switch",
    method: "post",
    data,
  });
}

// ==================== 视频生成选项（admin.videoOption） ====================

export interface AdminVideoOption {
  mysticLora: boolean;
  lora: string;
  nsfwLora: string;
  steps: number;
  shiftVideo: number;
  shiftAudio: number;
  minSeconds: number;
  maxSeconds: number;
}

/** 读取视频生成选项（成人 LoRA 开关 + 当前工作流关键参数） */
export function getPlatformVideoOption() {
  return request<AdminVideoOption>({
    url: "/api/v1/addon/admin/platform/video/option",
    method: "get",
  });
}

/** 设置成人 LoRA 开关（缺省开启，用于 LoRA 效果对照测试） */
export function setPlatformVideoOption(data: { mysticLora: boolean }) {
  return request<{ mysticLora: boolean }>({
    url: "/api/v1/addon/admin/platform/video/option",
    method: "post",
    data,
  });
}

// ==================== 报价写入（运营改价 / 配按时长计价） ====================

export interface AdminBillingRateUpsertParams {
  siteId: number;
  product: string;
  dimKey: string;
  credits: number;
  providerCostCents?: number;
}

/**
 * 写入/改价：同 dimKey 且价格不同时，旧行下线、revision+1；价格相同则幂等返回。
 * 按时长计价用 dimKey = i2v:<画幅>:<秒>（如 i2v:16:9:10），不配则回落 i2v:<画幅>。
 */
export function upsertPlatformBillingRate(data: AdminBillingRateUpsertParams) {
  return request<AdminBillingRateItem>({
    url: "/api/v1/addon/admin/platform/billing-rates",
    method: "post",
    data,
  });
}

// ==================== LoRA 目录（admin.lora） ====================

export interface AdminLoraItem {
  id: string;
  name: string;
  fileName: string;
  family: string;
  safety: string;
  state: string;
}

export interface AdminLoraListParams {
  safety?: string;
  page?: number;
  pageSize?: number;
}

export interface AdminLoraListRes {
  items: AdminLoraItem[];
  total: number;
}

export interface AdminLoraImportRes {
  total: number;
  imported: number;
  updated: number;
  skipped: number;
  markedAdult: number;
  adultNames: string[];
  comfyEndpoint: string;
}

/** LoRA 目录列表 */
export function getPlatformLoras(params: AdminLoraListParams) {
  return request<AdminLoraListRes>({
    url: "/api/v1/addon/admin/platform/lora/list",
    method: "get",
    params,
  });
}

/** 从站点 comfyui 一键导入全部 LoRA（按 NSFW 黑名单自动标记） */
export function importPlatformLoras() {
  return request<AdminLoraImportRes>({
    url: "/api/v1/addon/admin/platform/lora/import",
    method: "post",
  });
}

/** 人工调整 LoRA 安全标记 */
export function setPlatformLoraSafety(data: { id: string; safety: "safe" | "adult" }) {
  return request<{ ok: boolean }>({
    url: "/api/v1/addon/admin/platform/lora/safety",
    method: "post",
    data,
  });
}

// ==================== 用户与积分（admin.user） ====================

export interface AdminUserListItem {
  id: string;
  displayName: string;
  avatarUrl: string;
  state: string;
  createdAt: string;
  lastSeenAt: string;
  bio: string;
  stats: { works: number; posts: number };
}

export interface AdminUserWallet {
  credits: number;
  holds: number;
  available: number;
  balanceCents: number;
}

export interface AdminUserDetail {
  id: string;
  displayName: string;
  avatarUrl: string;
  state: string;
  createdAt: string;
  lastSeenAt: string;
  bio: string;
  stats: { works: number; posts: number; comments: number; reports: number };
  wallet: AdminUserWallet;
  recentWorks: unknown[];
  recentPosts: unknown[];
}

export interface AdminUserListParams {
  query?: string;
  state?: string;
  page?: number;
  pageSize?: number;
}

export interface AdminUserListRes {
  items: AdminUserListItem[];
  total: number;
}

export interface AdminWalletLedgerItem {
  id: string;
  asset: string;
  amount: number;
  balanceAfter: number;
  reason: string;
  createdAt: string;
}

export interface AdminUserLedgerRes {
  items: AdminWalletLedgerItem[];
  total: number;
}

/** 用户列表 */
export function getPlatformUsers(params: AdminUserListParams) {
  return request<AdminUserListRes>({
    url: "/api/v1/addon/admin/platform/user/list",
    method: "get",
    params,
  });
}

/** 用户详情（含钱包与统计） */
export function getPlatformUser(id: string) {
  return request<AdminUserDetail>({
    url: "/api/v1/addon/admin/platform/user/get",
    method: "get",
    params: { id },
  });
}

/** 余额调整（credit=积分 / balance=余额分），必填原因，留审计 */
export function adjustPlatformUser(data: { id: string; asset: "credit" | "balance"; amount: number; reason: string }) {
  return request<AdminUserDetail>({
    url: "/api/v1/addon/admin/platform/user/adjust",
    method: "post",
    data,
  });
}

/** 用户暂停/恢复 */
export function actPlatformUser(data: { id: string; action: "suspend" | "restore"; reason: string }) {
  return request<AdminUserDetail>({
    url: "/api/v1/addon/admin/platform/user/action",
    method: "post",
    data,
  });
}

/** 用户钱包流水 */
export function getPlatformUserLedger(params: { id: string; asset?: string; page?: number; pageSize?: number }) {
  return request<AdminUserLedgerRes>({
    url: "/api/v1/addon/admin/platform/user/ledger/list",
    method: "get",
    params,
  });
}

// ==================== 标签（admin.tag） ====================

export interface AdminTag {
  id: string;
  key: string;
  name: string;
  aliases: string[];
  active: boolean;
  priority: number;
  posts: number;
  works: number;
  updatedAt: string;
}

export interface AdminTagListParams {
  query?: string;
  active?: boolean;
  page?: number;
  pageSize?: number;
}

export interface AdminTagListRes {
  items: AdminTag[];
  total: number;
}

/** 标签列表 */
export function getPlatformTags(params: AdminTagListParams) {
  return request<AdminTagListRes>({
    url: "/api/v1/addon/admin/platform/tag/list",
    method: "get",
    params,
  });
}

/** 创建标签 */
export function createPlatformTag(data: { name: string; aliases?: string[]; priority?: number }) {
  return request<AdminTag>({
    url: "/api/v1/addon/admin/platform/tag/create",
    method: "post",
    data,
  });
}

/** 更新标签 */
export function updatePlatformTag(data: {
  id: string;
  name?: string;
  aliases?: string[];
  priority?: number;
  active?: boolean;
}) {
  return request<AdminTag>({
    url: "/api/v1/addon/admin/platform/tag/update",
    method: "post",
    data,
  });
}
