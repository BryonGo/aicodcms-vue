import request from "/@/utils/request";

export interface MailLogItem {
  id: number;
  to: string;
  subject: string;
  driver: string;
  status: number;
  error_msg: string;
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

/** Get mail send log list */
export function getMailLogList(params: MailLogListInput) {
  return request<MailLogListOutput>({ url: "/api/v1/addon/mail/log", method: "get", params });
}

/** Resend a mail by log ID */
export function resendMail(id: number) {
  return request({ url: "/api/v1/addon/mail/resend", method: "post", data: { id } });
}
