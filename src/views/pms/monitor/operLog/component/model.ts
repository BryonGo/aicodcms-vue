export interface SysOperLogTableColumns {
  oper_id: number; // 日志编号
  title: string; // 系统模块
  request_method: string; // 请求方式
  oper_name: string; // 操作人员
  dept_name: string; // 部门名称
  oper_url: string; // 请求URL
  oper_ip: string; // 主机地址
  oper_location: string; // 操作地点
  oper_param: string; // 请求参数
  status: number; // 操作状态（0正常 1异常）
  oper_time: string; // 操作时间
  linkedSysOperLogSysDept: LinkedSysOperLogSysDept;
}

export interface SysOperLogInfoData {
  oper_id: number | undefined; // 日志编号
  title: string | undefined; // 系统模块
  business_type: number | undefined; // 操作类型
  method: string | undefined; // 操作方法
  request_method: string | undefined; // 请求方式
  operator_type: number | undefined; // 操作类别
  oper_name: string | undefined; // 操作人员
  dept_name: string | undefined; // 部门名称
  oper_url: string | undefined; // 请求URL
  oper_ip: string | undefined; // 主机地址
  oper_location: string | undefined; // 操作地点
  oper_param: string | undefined; // 请求参数
  json_result: string | undefined; // 返回参数
  status: boolean; // 操作状态（0正常 1异常）
  error_msg: string | undefined; // 错误消息
  oper_time: string | undefined; // 操作时间
  linkedSysOperLogSysDept: LinkedSysOperLogSysDept;
}

export interface LinkedSysOperLogSysDept {
  dept_id: number | undefined; // 部门id
  dept_name: string | undefined; // 部门名称
}

export interface SysOperLogTableDataState {
  oper_ids: any[];
  tableData: {
    data: Array<SysOperLogTableColumns>;
    total: number;
    loading: boolean;
    param: {
      row: number;
      page: number;
      title: string | undefined;
      request_method: string | undefined;
      oper_name: string | undefined;
      status: number | undefined;
      dateRange: string[];
    };
  };
}

export interface SysOperLogEditState {
  loading: boolean;
  isShowDialog: boolean;
  formData: SysOperLogInfoData;
  rules: object;
}
