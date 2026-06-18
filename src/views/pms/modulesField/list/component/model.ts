export interface ModulesFieldTableColumns {
  id: number; // ID
  label: string; // 字段名称
  name: string; // 调用名称
  type: string; // 类型
  description: string; // 描述
  default: string; // 默认值
  sort: number; // 排序
  options: string; // 选项数据
  module_id: number; // 模型ID
  field_length: number;
}

export interface ModulesFieldInfoData {
  id: number | undefined; // ID
  label: string | undefined; // 字段名称
  name: string; // 调用名称
  type: string | undefined; // 类型
  description: string | undefined; // 描述
  default: string | undefined; // 默认值
  sort: number | undefined; // 排序
  options: string | undefined; // 选项数据
  moduleId: number | undefined; // 模型ID
  field_length: number | undefined; // 字段长度
  is_translatable: number | undefined; // 是否可翻译 0否 1是
  content: string | undefined; // 内容
}

export interface ModulesFieldTableDataState {
  ids: any[];
  tableData: {
    data: Array<ModulesFieldTableColumns>;
    total: number;
    loading: boolean;
    param: {
      module_id: number;
      page: number;
      row: number;
    };
  };
}

export interface ModulesFieldEditState {
  loading: boolean;
  isShowDialog: boolean;
  formData: ModulesFieldInfoData;
  rules: object;
}

export const modulesInfoFieldOptions = [
  { label: "单行文本", value: "text" },
  { label: "多行文本", value: "textarea" },
  { label: "数字", value: "number" },
  { label: "密码", value: "password" },
  { label: "邮箱", value: "email" },
  { label: "链接", value: "url" },
  { label: "下拉选择", value: "select" },
  { label: "单选框", value: "radio" },
  { label: "多选框", value: "checkbox" },
  { label: "开关", value: "switch" },
  { label: "评分", value: "rate" },
  { label: "滑块", value: "slider" },
  { label: "标签输入", value: "tags" },
  { label: "日期", value: "date" },
  { label: "时间", value: "time" },
  { label: "日期时间", value: "datetime" },
  { label: "颜色选择器", value: "color" },
  { label: "富文本", value: "richtext" },
  { label: "JSON 编辑", value: "json" },
  { label: "代码片段", value: "code" },
  { label: "单图片", value: "image" },
  { label: "多图片", value: "images" },
  { label: "单文件", value: "file" },
  { label: "多文件", value: "files" },
];
