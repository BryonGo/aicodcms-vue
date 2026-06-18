import request from "/@/utils/request";
import { reactive } from "vue";

// ============================================================
// 类型定义
// ============================================================

/** 字典数据（用于列表） */
export interface DictDataItem {
  dict_code: number;
  dict_sort: number;
  dict_label: string;
  dict_value: string;
  dict_type: string;
  css_class: string;
  list_class: string;
  is_default: number;
  status: number;
  remark: string;
  created_at: number;
  updated_at: number;
}

/** 字典选项（用于下拉框） */
export interface DictOption {
  label: string;
  value: string;
  isDefault?: number;
}

/** 字典数据响应 */
export interface DictDataResponse {
  values?: DictOption[];
  info?: {
    name: string;
    remark: string;
  };
}

/** 列表查询参数 */
export interface ListQueryParams {
  row?: number;
  page?: number;
  dict_type?: string;
  dict_label?: string;
  status?: number;
}

/** 列表响应 */
export interface ListResponse {
  list: DictDataItem[];
  total: number;
  page: number;
  row: number;
}

/** API 统一响应 */
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

// ============================================================
// 全局字典缓存（单例模式）
// ============================================================

const dictCache: Record<string, any[]> = reactive({});

/**
 * 根据字典类型查询字典数据信息
 * @param dictType 字典类型，如 'sys_user_sex'
 * @param defaultValue 默认值
 */
export function getDicts(
  dictType: string,
  defaultValue?: string,
): Promise<ApiResponse<DictDataResponse>> {
  const params: Record<string, string> = { dict_type: dictType };
  if (defaultValue) {
    params.default_value = defaultValue;
  }
  return request({
    url: "/api/v1/pms/dict/data/getDictData",
    method: "get",
    params,
  });
}

/**
 * 获取字典数据（组合式 API）
 * @param args 字典类型列表，如 'sys_user_sex', 'sys_yes_no'
 * @returns 包含指定字典类型的 reactive 对象
 */
export function useDict(...args: string[]): Record<string, any[]> {
  args.forEach((dictType: string) => {
    // 如果没有缓存，初始化空数组
    if (!dictCache[dictType]) {
      dictCache[dictType] = [];
    }
    // 如果缓存为空，发起请求
    if (dictCache[dictType].length === 0) {
      getDicts(dictType)
        .then((resp) => {
          // 后端字段映射: DictValue → json:"key" → 前端 value
          //                 DictLabel → json:"value" → 前端 label
          const values = resp.data?.values || [];
          // 必须 splice 替换数组内容，而不是替换引用
          // 否则组件持有的旧引用看不到更新后的数据
          const mapped = values.map((p: any) => ({
            label: p.value,
            value: p.key,
            isDefault: p.is_default,
          }));
          dictCache[dictType].splice(0, dictCache[dictType].length, ...mapped);
        })
        .catch(() => {
          dictCache[dictType].splice(0, dictCache[dictType].length);
        });
    }
  });
  return dictCache;
}

/**
 * 获取字典数据列表
 */
export function getDataList(query: ListQueryParams): Promise<ApiResponse<ListResponse>> {
  return request({
    url: "/api/v1/pms/dict/data/list",
    method: "get",
    params: query,
  });
}

/**
 * 获取单个字典数据
 */
export function getData(dictCode: number): Promise<ApiResponse<{ dict: DictDataItem }>> {
  return request({
    url: "/api/v1/pms/dict/data/get",
    method: "get",
    params: { dict_code: dictCode },
  });
}

/**
 * 新增字典数据
 */
export function addData(data: Partial<DictDataItem>): Promise<ApiResponse> {
  return request({
    url: "/api/v1/pms/dict/data/add",
    method: "post",
    data,
  });
}

/**
 * 修改字典数据
 */
export function editData(
  data: Partial<DictDataItem> & { dict_code: number },
): Promise<ApiResponse> {
  return request({
    url: "/api/v1/pms/dict/data/edit",
    method: "put",
    data,
  });
}

/**
 * 删除字典数据
 */
export function deleteData(ids: number[]): Promise<ApiResponse> {
  return request({
    url: "/api/v1/pms/dict/data/del",
    method: "delete",
    data: { ids },
  });
}
