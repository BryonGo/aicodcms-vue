import request from "/@/utils/request";

export interface MailLogItem {
  id: number;
  to: string;
  subject: string;
  driver: string;
  status: number;
  error_msg: string;
  sendcloud_email_id: string;
  deliver_status: number;
  delivered_at: number;
  created_at: number;
}

export interface MailLogListInput {
  page: number;
  page_size?: number;
  to?: string;
  status?: number;
  driver?: string;
}

export interface MailLogListOutput {
  list: MailLogItem[];
  total: number;
  page: number;
}

export interface SendCloudUserInfo {
  avaliable_balance: number;
  balance: number;
  quota: number;
  today_used_quota: number;
  reputation: number;
  user_name: string;
  email: string;
  account_type: string;
  website_auth_status: boolean;
  business_auth_status: boolean;
}

export interface SendCloudWebhookItem {
  webhook_url: string;
  category_name: string;
  event_type_map: Record<string, string>;
}

/** Get mail send log list */
export function getMailLogList(params: MailLogListInput) {
  return request<MailLogListOutput>({ url: "/api/v1/addon/mail/log", method: "get", params });
}

/** Resend a mail by log ID */
export function resendMail(id: number) {
  return request({ url: "/api/v1/addon/mail/resend", method: "post", data: { id } });
}

/** Send a test email via the configured driver */
export function sendTestMail(data: { to: string; subject: string; body: string }) {
  return request({ url: "/api/v1/addon/mail/send", method: "post", data });
}

/** Query SendCloud account balance / quota */
export function getSendCloudUserInfo() {
  return request<SendCloudUserInfo>({
    url: "/api/v1/addon/mail/sendcloud/userinfo",
    method: "get",
  });
}

/** List SendCloud webhook configs */
export function getSendCloudWebhooks() {
  return request<{ list: SendCloudWebhookItem[] }>({
    url: "/api/v1/addon/mail/sendcloud/webhook",
    method: "get",
  });
}

/** Add a SendCloud webhook config */
export function addSendCloudWebhook(data: {
  url: string;
  category_name: string;
  events?: string;
}) {
  return request({ url: "/api/v1/addon/mail/sendcloud/webhook", method: "post", data });
}

/** Delete a SendCloud webhook config */
export function deleteSendCloudWebhook(data: {
  url: string;
  category_name: string;
  events: string;
}) {
  return request({ url: "/api/v1/addon/mail/sendcloud/webhook", method: "delete", data });
}

export interface MailDailyStat {
  date: string;
  count: number;
  delivered: number;
  failed: number;
}

export interface MailTotalStat {
  total: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounce: number;
  invalid: number;
  failed: number;
}

export interface MailStats {
  daily: MailDailyStat[];
  total: MailTotalStat;
}

/** Get mail send stats (last 7 days) */
export function getMailStats() {
  return request<MailStats>({ url: "/api/v1/addon/mail/stats", method: "get" });
}
