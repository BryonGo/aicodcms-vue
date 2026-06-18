<template>
  <div class="pro-table" :class="{ 'pro-table--bordered': bordered }">
    <el-table
      ref="tableRef"
      v-loading="loading"
      :data="data"
      :size="size as any"
      :border="bordered"
      :row-key="rowKey"
      :stripe="stripe"
      :height="height"
      :max-height="maxHeight"
      :tree-props="treeProps"
      :default-expand-all="defaultExpandAll"
      :expand-row-keys="expandRowKeys"
      class="pro-table__table"
      @selection-change="$emit('selection-change', $event)"
      @row-click="(row: any) => $emit('row-click', row)"
      @sort-change="(p: any) => $emit('sort-change', p)"
    >
      <el-table-column v-if="selection" type="selection" width="48" align="center" />
      <el-table-column
        v-if="showIndex"
        type="index"
        :label="indexLabel"
        width="60"
        align="center"
      />
      <slot />

      <template #empty>
        <div class="pro-table__empty">
          <svg
            width="120"
            height="100"
            viewBox="0 0 120 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <ellipse cx="60" cy="86" rx="48" ry="6" fill="currentColor" opacity="0.06" />
            <path
              d="M28 30 L92 30 L86 74 C85.6 76 84 78 82 78 L38 78 C36 78 34.4 76 34 74 Z"
              stroke="currentColor"
              stroke-width="1.5"
              fill="currentColor"
              fill-opacity="0.04"
            />
            <path
              d="M48 30 L48 22 C48 18 52 16 56 16 L64 16 C68 16 72 18 72 22 L72 30"
              stroke="currentColor"
              stroke-width="1.5"
            />
            <circle cx="50" cy="52" r="3" fill="currentColor" opacity="0.4" />
            <circle cx="70" cy="52" r="3" fill="currentColor" opacity="0.4" />
            <path d="M52 64 Q60 70 68 64" stroke="currentColor" stroke-width="1.5" fill="none" />
          </svg>
          <div class="pro-table__empty-text">{{ emptyText }}</div>
        </div>
      </template>
    </el-table>

    <div v-if="showPagination && total > 0" class="pro-table__pagination">
      <el-pagination
        :background="true"
        :current-page="page"
        :page-size="size_"
        :page-sizes="pageSizes"
        :total="total"
        :layout="paginationLayout"
        :pager-count="pagerCount"
        @current-change="onPageChange"
        @size-change="onSizeChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";

const props = withDefaults(
  defineProps<{
    data: any[];
    loading?: boolean;
    bordered?: boolean;
    stripe?: boolean;
    selection?: boolean;
    showIndex?: boolean;
    indexLabel?: string;
    rowKey?: string;
    size?: "large" | "default" | "small";
    height?: string | number;
    maxHeight?: string | number;
    treeProps?: Record<string, any>;
    defaultExpandAll?: boolean;
    expandRowKeys?: any[];
    // 分页
    showPagination?: boolean;
    page?: number;
    pageSize?: number;
    total?: number;
    pageSizes?: number[];
    paginationLayout?: string;
    pagerCount?: number;
    emptyText?: string;
  }>(),
  {
    loading: false,
    bordered: false,
    stripe: false,
    selection: false,
    showIndex: false,
    indexLabel: "#",
    rowKey: "id",
    size: "default",
    showPagination: true,
    page: 1,
    pageSize: 10,
    total: 0,
    pageSizes: () => [10, 20, 30, 50, 100],
    paginationLayout: "total, sizes, prev, pager, next, jumper",
    pagerCount: document.body.clientWidth < 992 ? 5 : 7,
    treeProps: () => ({ children: "children", hasChildren: "hasChildren" }),
    defaultExpandAll: false,
    expandRowKeys: () => [],
    emptyText: "No data",
  },
);

const emit = defineEmits<{
  (e: "selection-change", rows: any[]): void;
  (e: "row-click", row: any): void;
  (e: "sort-change", payload: any): void;
  (e: "update:page", page: number): void;
  (e: "update:pageSize", size: number): void;
  (e: "pagination", payload: { page: number; limit: number }): void;
}>();

const tableRef = ref();

// 用 size_ 避免与 prop 的 `size` 冲突
const size_ = computed(() => props.pageSize);

const onPageChange = (p: number) => {
  emit("update:page", p);
  emit("pagination", { page: p, limit: props.pageSize });
};
const onSizeChange = (s: number) => {
  emit("update:pageSize", s);
  emit("pagination", { page: props.page, limit: s });
};

defineExpose({ tableRef });
</script>

<style scoped>
.pro-table {
  background: var(--cc-color-surface);
  border: 1px solid var(--cc-color-border-light);
  border-radius: var(--cc-radius-lg);
  box-shadow: var(--cc-shadow-card);
  overflow: hidden;
}
.pro-table__table {
  width: 100%;
  border-radius: 0;
}
.pro-table__pagination {
  display: flex;
  justify-content: flex-end;
  padding: var(--cc-space-3) var(--cc-space-4);
  border-top: 1px solid var(--cc-color-border-light);
  background: var(--cc-color-surface);
}
.pro-table__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--cc-space-3);
  padding: var(--cc-space-7) 0;
  color: var(--cc-color-text-3);
}
.pro-table__empty-text {
  font-size: var(--cc-font-13);
}

/* el-table 内部细节修饰 */
.pro-table :deep(.el-table__inner-wrapper::before) {
  display: none;
}
.pro-table :deep(.el-table__cell) {
  padding: 10px 0;
}
</style>
