// 标签生成器类型定义

export interface TplFuncParam {
  name: string;
  label_key: string;
  type: string;
  required?: boolean;
  default?: string;
  options_key?: string;
}

export interface TplFuncInfo {
  name: string;
  label_key: string;
  desc_key?: string;
  signature: string;
  has_loop?: boolean;
  loop_type?: string;
  item_methods?: TplFuncInfo[];
  params?: TplFuncParam[];
}

export interface TplFuncCategory {
  id: string;
  label_key: string;
  desc_key?: string;
  functions: TplFuncInfo[];
  item_category?: boolean;
}

export interface DynamicOption {
  label: string;
  value: string;
}

export interface ItemFieldConfig {
  name: string;
  params: Record<string, any>;
}
