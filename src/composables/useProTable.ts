import { reactive, toRefs, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";

/**
 * ProTable 列表页通用 composable
 *
 *  统一封装：search params / loading / data / total / pagination /
 *  selection / refresh / reset / batch delete 等列表页通用逻辑。
 *
 *  完全可配，不绑死后端返回结构。
 *
 *  典型用法：
 *  ```ts
 *  const t = useProTable({
 *      api: getUserList,
 *      defaults: { keyWords: '', mobile: '', status: '', dept_id: '' },
 *      pageKey: 'page', sizeKey: 'row',
 *      transform: (res) => ({ list: res.data.list ?? [], total: res.data.total ?? 0 }),
 *      deleteApi: deleteUser,
 *      rowKey: 'id',
 *      immediate: true,
 *  });
 *  ```
 */
export interface UseProTableOptions<Q extends Record<string, any> = any> {
  /** 列表 API：(params) => Promise<any>，params 自动拼接分页字段 */
  api: (params: Record<string, any>) => Promise<any>;
  /** 搜索参数默认值（不含分页字段） */
  defaults?: Q;
  /** 后端分页字段名（默认 page / row，与 PMS 兼容） */
  pageKey?: string;
  sizeKey?: string;
  /** 默认分页大小 */
  defaultPageSize?: number;
  /** 把响应转换为 { list, total } */
  transform?: (res: any) => { list: any[]; total: number };
  /** 删除 API：(ids[]) => Promise<any>，提供后 ProTable 的批量删除会自动可用 */
  deleteApi?: (ids: (number | string)[]) => Promise<any>;
  /** 行主键字段，默认 'id' */
  rowKey?: string;
  /** 删除确认文案 */
  deleteConfirmText?: string;
  /** 是否在 mounted 时立即拉取 */
  immediate?: boolean;
}

const defaultTransform = (res: any) => {
  if (!res) return { list: [], total: 0 };
  // 常见三种返回：
  //   { data: { list, total } }    PMS 风格
  //   { rows, total }              ruoyi 风格
  //   { data: { rows, total } }
  //   { data: any[] }              简单数组
  const d = res.data ?? res;
  const list = d.list ?? d.rows ?? (Array.isArray(d) ? d : []);
  const total = d.total ?? res.total ?? 0;
  return { list, total };
};

export function useProTable<Q extends Record<string, any> = any>(opts: UseProTableOptions<Q>) {
  const {
    api,
    defaults = {} as Q,
    pageKey = "page",
    sizeKey = "row",
    defaultPageSize = 10,
    transform = defaultTransform,
    deleteApi,
    rowKey = "id",
    deleteConfirmText = "确认删除选中的记录？删除后不可恢复",
    immediate = true,
  } = opts;

  const state = reactive({
    loading: false,
    data: [] as any[],
    total: 0,
    page: 1,
    size: defaultPageSize,
    // 搜索参数（不含分页），用 JSON 拷贝避免 defaults 被污染
    params: JSON.parse(JSON.stringify(defaults)),
    selected: [] as any[],
    ids: [] as (number | string)[],
  });

  let isActive = true;

  const buildQuery = () => ({
    ...state.params,
    [pageKey]: state.page,
    [sizeKey]: state.size,
  });

  const query = async () => {
    state.loading = true;
    try {
      const res = await api(buildQuery());
      if (!isActive) return;
      const { list, total } = transform(res);
      state.data = list || [];
      state.total = total || 0;
    } catch {
      if (!isActive) return;
      state.data = [];
      state.total = 0;
    } finally {
      if (isActive) state.loading = false;
    }
  };

  /** 搜索按钮：重置到第 1 页 */
  const search = () => {
    state.page = 1;
    query();
  };

  /** 重置：恢复 defaults 并搜索 */
  const reset = () => {
    state.params = JSON.parse(JSON.stringify(defaults));
    state.page = 1;
    query();
  };

  /** 分页变化（pageNum 或 pageSize 任一） */
  const onPageChange = (p: { page: number; limit: number }) => {
    state.page = p.page;
    state.size = p.limit;
    query();
  };

  /** el-table @selection-change */
  const onSelectionChange = (rows: any[]) => {
    state.selected = rows;
    state.ids = rows.map((r) => r[rowKey]);
  };

  /** 删除单行或批量 */
  const remove = async (row?: any) => {
    const ids = row ? [row[rowKey]] : state.ids;
    if (!ids.length) {
      ElMessage.warning("请先选择要删除的记录");
      return;
    }
    if (!deleteApi) {
      ElMessage.warning("未配置删除 API");
      return;
    }
    try {
      await ElMessageBox.confirm(deleteConfirmText, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      });
    } catch {
      return;
    }
    try {
      await deleteApi(ids);
      ElMessage.success("删除成功");
      query();
    } catch {
      // 接口失败：消息由请求拦截器处理
    }
  };

  if (immediate) {
    onMounted(() => query());
  }

  // 清理标记
  const dispose = () => {
    isActive = false;
  };

  return {
    state,
    ...toRefs(state),
    query,
    search,
    reset,
    onPageChange,
    onSelectionChange,
    remove,
    dispose,
    pageKey,
    sizeKey,
    rowKey,
  };
}

export type UseProTableReturn<Q extends Record<string, any> = any> = ReturnType<
  typeof useProTable<Q>
>;
