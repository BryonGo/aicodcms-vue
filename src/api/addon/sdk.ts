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
export interface GameItem {
  id: number;
  app_id: number;
  app_key: string;
  app_secret: string;
  name: string;
  cp_id: number;
  package_name: string;
  platform_type: number;
  online_type: number;
  category: string;
  icon_path: string;
  status: number;
  login_state: number;
  email_login_state: number;
  social_login_state: number;
  social_login_types: string;
  pay_state: number;
  protocol_state: number;
  privacy_url: string;
  agreement_url: string;
  callback_url: string;
  extra_config: string;
  created_at: number;
  updated_at: number;
  deleted_at: number;
}

export interface GameListParams extends PageParams {
  keyword?: string;
  status?: string;
}

// app_id/app_key/app_secret 由后端自动生成，前端不传
export interface GameAddParams {
  name: string;
  cp_id?: number;
  package_name?: string;
  platform_type?: number;
  online_type?: number;
  category?: string;
  icon_path?: string;
  status?: number;
  login_state?: number;
  email_login_state?: number;
  social_login_state?: number;
  social_login_types?: string;
  pay_state?: number;
  protocol_state?: number;
  privacy_url?: string;
  agreement_url?: string;
  callback_url?: string;
  extra_config?: string;
}

// 编辑不修改 app_key/app_secret，仅需 id 覆盖
export interface GameEditParams extends GameAddParams {
  id: number;
}

// ---------- 商品 ----------
export interface VersionItem {
  id: number;
  app_id: number;
  version_code: number;
  version_name: string;
  version_desc: string;
  url: string;
  force_update: number;
  enabled: number;
  created_at: number;
  updated_at: number;
  deleted_at: number;
}

export interface VersionListParams extends PageParams {
  app_id: number;
  keyword?: string;
}

export interface VersionAddParams {
  app_id: number;
  version_code: number;
  version_name?: string;
  version_desc?: string;
  url?: string;
  force_update?: number;
  enabled?: number;
}

export interface VersionEditParams extends VersionAddParams {
  id: number;
}

// ---------- 支付配置 ----------
export interface DeveloperItem {
  id: number;
  name: string;
  addr: string;
  phone_num: string;
  contact_name: string;
  contact_wx: string;
  contact_email: string;
  created_at: number;
  updated_at: number;
  deleted_at: number;
}

export interface DeveloperListParams extends PageParams {
  keyword?: string;
}

export interface DeveloperAddParams {
  name: string;
  addr?: string;
  phone_num?: string;
  contact_name?: string;
  contact_wx?: string;
  contact_email?: string;
}

export interface DeveloperEditParams extends DeveloperAddParams {
  id: number;
}

// ---------- 用户游戏关联 ----------
export interface GameUserItem {
  id: number;
  uid: number;
  app_id: number;
  game_nickname: string;
  role_id: string;
  server_id: string;
  server_name: string;
  created_at: number;
  updated_at: number;
}

export interface GameUserListParams extends PageParams {
  app_id?: number;
  uid?: number;
  keyword?: string;
}

// ---------- Google 退款 ----------
export interface GoogleVoidedItem {
  id: number;
  uid: number;
  app_id: number;
  product_id: string;
  purchase_token: string;
  voided_time_millis: number;
  created_at: number;
}

export interface GoogleVoidedListParams extends PageParams {
  app_id?: number;
  uid?: number;
  keyword?: string;
}

// ---------- AppStore 退款 ----------
export interface AppstoreRefundItem {
  id: number;
  uid: number;
  app_id: number;
  transaction_id: string;
  cancellation_date: string;
  created_at: number;
}

export interface AppstoreRefundListParams extends PageParams {
  app_id?: number;
  uid?: number;
  keyword?: string;
}

// ---------- 通知日志 ----------
export interface NotifyLogItem {
  id: number;
  order_id: number;
  notify_url: string;
  notify_content: string;
  notify_status: number;
  created_at: number;
}

export interface NotifyLogListParams extends PageParams {
  order_id?: number;
  keyword?: string;
}

// ---------- 封禁 ----------
export interface BanItem {
  id: number;
  app_id: number;
  ban_type: number;
  banned_target: string;
  reason: string;
  begin_time: number;
  end_time: number;
  created_at: number;
  updated_at: number;
  deleted_at: number;
}

export interface BanListParams extends PageParams {
  app_id?: number;
  ban_type?: string;
  keyword?: string;
}

export interface BanAddParams {
  app_id?: number;
  ban_type: number;
  banned_target: string;
  reason?: string;
  begin_time?: number;
  end_time?: number;
}

export interface BanEditParams extends BanAddParams {
  id: number;
}

// ---------- 登录日志 ----------
export interface LoginLogItem {
  id: number;
  user_id: number;
  app_id: number;
  ip: string;
  device_id: string;
  login_type: number;
  created_at: number;
}

export interface LoginLogListParams extends PageParams {
  user_id?: number;
  app_id?: number;
  keyword?: string;
}

// ============================================================
// API 函数
// ============================================================

// ==================== 游戏 ====================
export function getGameList(params: GameListParams) {
  return request({ url: "/api/v1/addon/sdk/game/list", method: "get", params });
}
export function getGameDetail(params: { id: number }) {
  return request({ url: "/api/v1/addon/sdk/game/get-edit", method: "get", params });
}
export function addGame(data: GameAddParams) {
  return request({ url: "/api/v1/addon/sdk/game/add", method: "post", data });
}
export function editGame(data: GameEditParams) {
  return request({ url: "/api/v1/addon/sdk/game/edit", method: "put", data });
}
export function deleteGame(data: { ids: number[] }) {
  return request({ url: "/api/v1/addon/sdk/game/del", method: "delete", data });
}
export function recoverGame(data: { ids: number[] }) {
  return request({ url: "/api/v1/addon/sdk/game/recover", method: "put", data });
}

// ==================== 版本 ====================
export function getVersionList(params: VersionListParams) {
  return request({ url: "/api/v1/addon/sdk/version/list", method: "get", params });
}
export function getVersionDetail(params: { id: number }) {
  return request({ url: "/api/v1/addon/sdk/version/get-edit", method: "get", params });
}
export function addVersion(data: VersionAddParams) {
  return request({ url: "/api/v1/addon/sdk/version/add", method: "post", data });
}
export function editVersion(data: VersionEditParams) {
  return request({ url: "/api/v1/addon/sdk/version/edit", method: "put", data });
}
export function deleteVersion(data: { ids: number[] }) {
  return request({ url: "/api/v1/addon/sdk/version/del", method: "delete", data });
}

// ==================== 开发商 ====================
export function getDeveloperList(params: DeveloperListParams) {
  return request({ url: "/api/v1/addon/sdk/developer/list", method: "get", params });
}
export function getDeveloperDetail(params: { id: number }) {
  return request({ url: "/api/v1/addon/sdk/developer/get-edit", method: "get", params });
}
export function addDeveloper(data: DeveloperAddParams) {
  return request({ url: "/api/v1/addon/sdk/developer/add", method: "post", data });
}
export function editDeveloper(data: DeveloperEditParams) {
  return request({ url: "/api/v1/addon/sdk/developer/edit", method: "put", data });
}
export function deleteDeveloper(data: { ids: number[] }) {
  return request({ url: "/api/v1/addon/sdk/developer/del", method: "delete", data });
}

// ==================== 用户游戏关联 ====================
export function getGameUserList(params: GameUserListParams) {
  return request({ url: "/api/v1/addon/sdk/account/game-users", method: "get", params });
}
export function getGameUserDetail(params: { id: number }) {
  return request({ url: "/api/v1/addon/sdk/account/game-users", method: "get", params });
}

// ==================== Google 退款 ====================
export function getGoogleVoidedList(params: GoogleVoidedListParams) {
  void params;
  return Promise.resolve({ data: { list: [], total: 0 } });
}

// ==================== AppStore 退款 ====================
export function getAppstoreRefundList(params: AppstoreRefundListParams) {
  void params;
  return Promise.resolve({ data: { list: [], total: 0 } });
}

// ==================== 通知日志 ====================
export function getNotifyLogList(params: NotifyLogListParams) {
  return request({ url: "/api/v1/addon/sdk/login-log/list", method: "get", params });
}
export function getNotifyLogDetail(params: { id: number }) {
  return request({ url: "/api/v1/addon/sdk/login-log/list", method: "get", params });
}

// ==================== 封禁 ====================
export function getBanList(params: BanListParams) {
  return request({ url: "/api/v1/addon/sdk/ban/list", method: "get", params });
}
export function getBanDetail(params: { id: number }) {
  return request({ url: "/api/v1/addon/sdk/ban/get-edit", method: "get", params });
}
export function addBan(data: BanAddParams) {
  return request({ url: "/api/v1/addon/sdk/ban/add", method: "post", data });
}
export function editBan(data: BanEditParams) {
  return request({ url: "/api/v1/addon/sdk/ban/edit", method: "put", data });
}
export function deleteBan(data: { ids: number[] }) {
  return request({ url: "/api/v1/addon/sdk/ban/del", method: "delete", data });
}

// ==================== 登录日志 ====================
export function getLoginLogList(params: LoginLogListParams) {
  return request({ url: "/api/v1/addon/sdk/login-log/list", method: "get", params });
}

// ==================== 用户管理 ====================
type SnowflakeId = string | bigint;

export interface UserItem {
  id: SnowflakeId;
  username: string;
  email: string;
  nickname: string;
  avatar: string;
  user_type: number; // 1=email 2=guest 3=google 4=facebook 5=apple
  status: number; // 1=正常 0=禁用
  last_login_time: number;
  last_login_ip: string;
  login_count: number;
  total_pay: number; // 总充值(分)
  order_count: number;
  refund_count: number;
  created_at: number;
  updated_at: number;
  [key: string]: any;
}

// 账号类型辅助函数
export function userTypeLabel(t: number): string {
  const m: Record<number, string> = {
    1: "邮箱",
    2: "游客",
    3: "Google",
    4: "Facebook",
    5: "Apple",
  };
  return m[t] || "未知";
}
export function userTypeTag(t: number): string {
  const m: Record<number, string> = { 1: "", 2: "warning", 3: "danger", 4: "", 5: "success" };
  return m[t] || "info";
}

export interface UserListParams extends PageParams {
  keyword?: string;
  account_type?: string;
  start_time?: number;
  end_time?: number;
  username?: string;
  device_id?: string;
  ip?: string;
}

export function getUserList(params: UserListParams) {
  return request({ url: "/api/v1/addon/sdk/account/list", method: "get", params });
}
export function getUser(params: { id: SnowflakeId }) {
  return request({ url: "/api/v1/addon/sdk/account/get", method: "get", params });
}
export function getUserOrders(params: { uid: SnowflakeId; row?: number }) {
  return request({ url: "/api/v1/addon/sdk/account/orders", method: "get", params });
}

export function editUser(data: { id: SnowflakeId; nickname?: string; avatar?: string }) {
  return request({ url: "/api/v1/addon/sdk/account/edit", method: "post", data });
}

export function addUser(data: {
  username: string;
  email?: string;
  password: string;
  nickname?: string;
}) {
  return request({ url: "/api/v1/addon/sdk/account/add", method: "post", data });
}

export function deleteUser(data: { ids: SnowflakeId[] }) {
  return request({ url: "/api/v1/addon/sdk/account/del", method: "post", data });
}

export function resetPwd(data: { id: SnowflakeId; password: string }) {
  return request({ url: "/api/v1/addon/sdk/account/reset-pwd", method: "post", data });
}

export function setStatus(data: { id: SnowflakeId; status: number }) {
  return request({ url: "/api/v1/addon/sdk/account/status", method: "post", data });
}

export function getGameUsers(params: { uid: SnowflakeId }) {
  return request({ url: "/api/v1/addon/sdk/account/game-users", method: "get", params });
}

export function getLoginHistory(params: { uid: SnowflakeId; row?: number }) {
  return request({ url: "/api/v1/addon/sdk/account/login-history", method: "get", params });
}

export function getAccounts(params: { uid: SnowflakeId }) {
  return request({ url: "/api/v1/addon/sdk/account/accounts", method: "get", params });
}

export function getDevices(params: { uid: SnowflakeId }) {
  return request({ url: "/api/v1/addon/sdk/account/devices", method: "get", params });
}

// Token management
export function getTokenList(params: { uid: SnowflakeId }) {
  return request({ url: "/api/v1/addon/sdk/account/token/list", method: "get", params });
}
export function deleteTokens(data: { ids: number[] }) {
  return request({ url: "/api/v1/addon/sdk/account/token/delete", method: "post", data });
}

// ==================== 货币管理 ====================
export function getCurrencyList(params: PageParams) {
  return request({ url: "/api/v1/addon/sdk/currency/list", method: "get", params });
}
export function getCurrencyDetail(params: { id: number }) {
  return request({ url: "/api/v1/addon/sdk/currency/get-edit", method: "get", params });
}
export function addCurrency(data: any) {
  return request({ url: "/api/v1/addon/sdk/currency/add", method: "post", data });
}
export function editCurrency(data: any) {
  return request({ url: "/api/v1/addon/sdk/currency/edit", method: "put", data });
}
export function deleteCurrency(data: { ids: number[] }) {
  return request({ url: "/api/v1/addon/sdk/currency/del", method: "delete", data });
}
export function syncCurrencyRates() {
  return request({ url: "/api/v1/addon/sdk/currency/sync-rates", method: "post" });
}
export function getCurrencyApiConfig() {
  return request({ url: "/api/v1/addon/sdk/currency/api-config", method: "get" });
}
export function saveCurrencyApiConfig(data: { api_key: string }) {
  return request({ url: "/api/v1/addon/sdk/currency/api-config", method: "put", data });
}
export function initCurrencies() {
  return request({ url: "/api/v1/addon/sdk/currency/init", method: "post" });
}

// ==================== SNS 社交登录 ====================
export function snsVerify(data: { platform: string; token: string }) {
  return request({ url: "/api/v1/addon/sns/verify", method: "post", data });
}

// ==================== Email 邮件服务 ====================
export function emailSend(data: { to: string; subject: string; body: string }) {
  return request({ url: "/api/v1/addon/mail/send", method: "post", data });
}
