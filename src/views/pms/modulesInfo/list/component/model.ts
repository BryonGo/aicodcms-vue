export interface ModulesInfoTableColumns {
  id: number; // ID
  name: string; // 模型名称
  sort: number; // 排序
  table_name: string; // 数据表名
  created_at: string; // 创建日期
  status: number; //
  fields: string; // 字段信息
}

export interface ModulesInfoInfoData {
  id: number | undefined; // ID
  name: string | undefined; // 模型名称
  sort: number | undefined; // 排序
  table_name: string | undefined; // 数据表名
  created_at: string | undefined; // 创建日期
  updated_at: string | undefined; // 更新日期
  status: boolean; //
  fields: string | undefined; // 字段信息
}

export interface ModulesInfoTableDataState {
  ids: any[];
  tableData: {
    data: Array<ModulesInfoTableColumns>;
    total: number;
    loading: boolean;
    param: {
      page: number;
      row: number;
      id: number | undefined;
      name: string | undefined;
      sort: number | undefined;
      table_name: string | undefined;
      created_at: string | undefined;
      status: number | undefined;
      fields: string | undefined;
    };
  };
}

export interface ModulesInfoEditState {
  loading: boolean;
  isShowDialog: boolean;
  formData: ModulesInfoInfoData;
  rules: object;
}
