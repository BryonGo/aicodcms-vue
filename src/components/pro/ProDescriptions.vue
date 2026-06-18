<template>
  <div
    class="pro-descriptions"
    :class="[`pro-descriptions--${size}`, { 'pro-descriptions--bordered': bordered }]"
  >
    <!-- 头部 -->
    <div v-if="title || subtitle || $slots.extra" class="pro-descriptions__header">
      <div class="pro-descriptions__header-left">
        <h3 v-if="title" class="pro-descriptions__title">{{ title }}</h3>
        <p v-if="subtitle" class="pro-descriptions__subtitle">{{ subtitle }}</p>
      </div>
      <div v-if="$slots.extra" class="pro-descriptions__header-right">
        <slot name="extra" />
      </div>
    </div>

    <!-- 内容（schema 驱动 + 默认槽兜底） -->
    <div class="pro-descriptions__body" :style="gridStyle">
      <template v-for="(item, idx) in visibleItems" :key="item.prop || idx">
        <div
          class="pro-descriptions__item"
          :style="{ gridColumn: `span ${Math.min(item.span || 1, column)}` }"
        >
          <div class="pro-descriptions__label" :style="labelStyle">
            <slot :name="`label-${item.prop}`" :item="item">{{ item.label }}</slot>
            <el-tooltip v-if="item.help" :content="item.help" placement="top">
              <el-icon class="pro-descriptions__help"><InfoFilled /></el-icon>
            </el-tooltip>
          </div>
          <div class="pro-descriptions__value">
            <slot :name="item.prop" :value="getValue(item)" :item="item" :source="source">
              <component v-if="item.render" :is="renderValue(item)" />
              <span v-else-if="formatValue(item) === '—'" class="pro-descriptions__empty">—</span>
              <span v-else>{{ formatValue(item) }}</span>
            </slot>
          </div>
        </div>
      </template>

      <!-- 自由槽：用 <template #default> 追加任意 row -->
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, h, type Component } from "vue";
import { InfoFilled } from "@element-plus/icons-vue";

export interface ProDescriptionsItem {
  prop: string;
  label: string;
  /** 跨列数 1-4 */
  span?: number;
  /** 提示气泡 */
  help?: string;
  /** 直接给值（不走 source） */
  value?: any;
  /** 渲染函数：(value, item, source) => VNode */
  render?: (value: any, item: ProDescriptionsItem, source: any) => any;
  /** 格式化字符串：date / datetime / boolean / money / bytes */
  type?: "text" | "date" | "datetime" | "boolean" | "money" | "bytes" | "tag";
  /** 字典 options（type='tag' 或自动 lookup） */
  options?: { label: string; value: any; tagType?: string }[];
  /** 占位（空值时显示） */
  placeholder?: string;
  /** 显示条件：false 时不渲染该项 */
  if?: boolean;
}

const props = defineProps<{
  /** 数据源对象 */
  source?: Record<string, any>;
  /** schema 驱动 */
  items?: ProDescriptionsItem[];
  /** 列数（响应式自适应可外部接管） */
  column?: number;
  /** 标签宽度 */
  labelWidth?: string;
  /** 标签对齐 */
  labelAlign?: "left" | "right";
  /** 标题/副标题 */
  title?: string;
  subtitle?: string;
  /** 尺寸 */
  size?: "small" | "default" | "large";
  /** 带边框 */
  bordered?: boolean;
  /** label 与 value 横向（false）还是纵向堆叠（true） */
  stacked?: boolean;
}>();

const column = computed(() => props.column ?? 2);
const items = computed<ProDescriptionsItem[]>(() => props.items ?? []);
const visibleItems = computed(() => items.value.filter((it) => it.if !== false));
const source = computed(() => props.source ?? {});

const labelStyle = computed(() => {
  if (props.stacked) return {};
  return { width: props.labelWidth || "120px", textAlign: (props.labelAlign || "right") as any };
});

const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${column.value}, minmax(0, 1fr))`,
}));

const getValue = (item: ProDescriptionsItem) => {
  if (Object.prototype.hasOwnProperty.call(item, "value")) return item.value;
  // 支持 a.b.c 嵌套
  return item.prop.split(".").reduce((o: any, k) => (o == null ? undefined : o[k]), source.value);
};

const renderValue = (item: ProDescriptionsItem) => {
  const v = getValue(item);
  const node = item.render?.(v, item, source.value);
  return {
    render: () => node,
  } as Component;
};

const formatValue = (item: ProDescriptionsItem): string => {
  const v = getValue(item);
  if (v === null || v === undefined || v === "") return item.placeholder ?? "—";
  switch (item.type) {
    case "date":
      return formatDate(v, false);
    case "datetime":
      return formatDate(v, true);
    case "boolean":
      return v ? "Yes" : "No";
    case "money":
      return (
        "¥ " +
        Number(v).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      );
    case "bytes":
      return formatBytes(Number(v));
    case "tag":
      if (item.options) {
        const opt = item.options.find((o) => o.value === v);
        return opt?.label ?? String(v);
      }
      return String(v);
    default:
      return String(v);
  }
};

const formatDate = (input: any, withTime: boolean): string => {
  if (!input) return "—";
  let d: Date;
  if (typeof input === "number") {
    // 后端时间戳可能为秒，> 1e12 视为毫秒
    d = new Date(input > 1e12 ? input : input * 1000);
  } else {
    d = new Date(input);
  }
  if (isNaN(d.getTime())) return String(input);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  if (!withTime) return `${y}-${m}-${dd}`;
  const h = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${dd} ${h}:${mi}`;
};

const formatBytes = (size: number): string => {
  if (!size || isNaN(size)) return "0 B";
  let s = size;
  const units = ["B", "KB", "MB", "GB", "TB"];
  let r = 0;
  while (s > 1024 && r < units.length - 1) {
    s = s / 1024;
    r++;
  }
  return s.toFixed(2) + " " + units[r];
};

// 给外部访问：可手动跑 render
defineExpose({ getValue, formatValue });
</script>

<style scoped>
.pro-descriptions {
  background: var(--cc-color-surface);
  border-radius: var(--cc-radius-lg);
  overflow: hidden;
}
.pro-descriptions--bordered {
  border: 1px solid var(--cc-color-border-light);
  box-shadow: var(--cc-shadow-card);
}

/* ---- 头部 ---- */
.pro-descriptions__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--cc-space-4);
  padding: var(--cc-space-4) var(--cc-space-5);
  border-bottom: 1px solid var(--cc-color-border-light);
}
.pro-descriptions__title {
  margin: 0;
  font-size: var(--cc-font-16);
  font-weight: 600;
  color: var(--cc-color-text-1);
}
.pro-descriptions__subtitle {
  margin: 4px 0 0;
  color: var(--cc-color-text-3);
  font-size: var(--cc-font-13);
}
.pro-descriptions__header-right {
  display: flex;
  gap: var(--cc-space-2);
}

/* ---- 主体（CSS grid） ---- */
.pro-descriptions__body {
  display: grid;
  gap: 0;
  padding: 0;
}
.pro-descriptions__item {
  display: flex;
  align-items: flex-start;
  min-height: 44px;
  padding: var(--cc-space-3) var(--cc-space-5);
  border-bottom: 1px solid var(--cc-color-border-light);
  background: transparent;
}
/* 最后一行去底边 */
.pro-descriptions--bordered .pro-descriptions__item:nth-last-child(-n + 1) {
  border-bottom: none;
}
.pro-descriptions__label {
  flex-shrink: 0;
  color: var(--cc-color-text-3);
  font-size: var(--cc-font-13);
  font-weight: 500;
  padding-right: var(--cc-space-3);
  display: flex;
  align-items: center;
  gap: 4px;
}
.pro-descriptions__help {
  font-size: 12px;
  color: var(--cc-color-text-4);
  cursor: help;
}
.pro-descriptions__value {
  flex: 1;
  min-width: 0;
  color: var(--cc-color-text-1);
  font-size: var(--cc-font-13);
  word-break: break-word;
}
.pro-descriptions__empty {
  color: var(--cc-color-text-4);
}

/* ---- 尺寸 ---- */
.pro-descriptions--small .pro-descriptions__item {
  min-height: 36px;
  padding: var(--cc-space-2) var(--cc-space-4);
}
.pro-descriptions--large .pro-descriptions__item {
  min-height: 52px;
  padding: var(--cc-space-4) var(--cc-space-6);
}
</style>
