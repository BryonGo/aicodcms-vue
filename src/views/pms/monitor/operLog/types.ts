/** 操作日志记录 */
export interface OperLogRecord {
  oper_id: number;
  title: string;
  business_type: number;
  method: string;
  request_method: string;
  operator_type: number;
  oper_name: string;
  dept_name: string;
  oper_url: string;
  oper_ip: string;
  oper_location: string;
  oper_param: string;
  error_msg: string;
  status: number;
  oper_at: number;
  created_at: number;
  linked_dept?: {
    dept_id: number;
    dept_name: string;
  };
}

/** 列表请求参数 */
export interface OperLogListParams {
  page: number;
  row: number;
  title?: string;
  request_method?: string;
  oper_name?: string;
  dateRange?: string[];
  sort?: "ASC" | "DESC";
}

/** 列表响应 */
export interface OperLogListResult {
  list: OperLogRecord[];
  total: number;
  page: number;
  row: number;
}

/** 详情（与列表同结构） */
export type OperLogDetail = OperLogRecord;

/** 请求方式字典项 */
export interface DictOption {
  label: string;
  value: string;
}

/** 筛选参数（不含分页） */
export interface OperLogFilter {
  title: string;
  request_method: string;
  oper_name: string;
  dateRange: [string, string] | [];
}
