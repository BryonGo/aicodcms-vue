<template>
  <div class="pro-search" :class="{ 'pro-search--collapsed': collapsed }">
    <el-form
      ref="formRef"
      :model="modelValue"
      :inline="true"
      label-position="right"
      :label-width="labelWidth"
      class="pro-search__form"
      @submit.prevent
    >
      <!-- schema 驱动渲染 -->
      <template v-for="field in visibleFields" :key="field.prop">
        <el-form-item :label="field.label" :prop="field.prop">
          <!-- input / 默认 -->
          <el-input
            v-if="!field.type || field.type === 'input'"
            v-model="modelValue[field.prop]"
            :placeholder="field.placeholder || field.label"
            clearable
            :style="{ width: field.width || '220px' }"
            @keyup.enter="onSearch"
          />
          <!-- select -->
          <el-select
            v-else-if="field.type === 'select'"
            v-model="modelValue[field.prop]"
            :placeholder="field.placeholder || field.label"
            clearable
            :multiple="field.multiple"
            :style="{ width: field.width || '220px' }"
          >
            <el-option
              v-for="opt in field.options"
              :key="String(opt.value)"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
          <!-- daterange -->
          <el-date-picker
            v-else-if="field.type === 'daterange'"
            v-model="modelValue[field.prop]"
            type="daterange"
            range-separator="—"
            value-format="YYYY-MM-DD"
            :start-placeholder="field.startPlaceholder || field.label"
            :end-placeholder="field.endPlaceholder || field.label"
            :style="{ width: field.width || '260px' }"
          />
          <el-date-picker
            v-else-if="field.type === 'date'"
            v-model="modelValue[field.prop]"
            type="date"
            value-format="YYYY-MM-DD"
            :placeholder="field.placeholder || field.label"
            :style="{ width: field.width || '180px' }"
          />
          <!-- number -->
          <el-input-number
            v-else-if="field.type === 'number'"
            v-model="modelValue[field.prop]"
            :min="field.min"
            :max="field.max"
            :style="{ width: field.width || '160px' }"
          />
          <!-- 自定义插槽：<template #field-keyword>...</template> -->
          <slot
            v-else-if="field.type === 'slot'"
            :name="`field-${field.prop}`"
            :field="field"
            :model="modelValue"
          />
        </el-form-item>
      </template>

      <!-- 自由扩展：用户可以直接传 default slot 追加任意 form-item -->
      <slot />

      <!-- 操作区 -->
      <el-form-item class="pro-search__actions">
        <el-button type="primary" :icon="SearchIcon" @click="onSearch">{{ searchText }}</el-button>
        <el-button :icon="RefreshIcon" @click="onReset">{{ resetText }}</el-button>
        <button
          v-if="collapsible && fields.length > collapseThreshold"
          type="button"
          class="pro-search__toggle"
          @click="collapsed = !collapsed"
        >
          {{ collapsed ? expandText : collapseText }}
          <el-icon class="pro-search__toggle-icon" :class="{ 'is-collapsed': collapsed }">
            <ArrowUp />
          </el-icon>
        </button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject } from "vue";
import { useI18n } from "vue-i18n";
import {
  Search as SearchIcon,
  RefreshRight as RefreshIcon,
  ArrowUp,
} from "@element-plus/icons-vue";
import type { FormInstance } from "element-plus";

export interface ProSearchField {
  prop: string;
  label: string;
  type?: "input" | "select" | "date" | "daterange" | "number" | "slot";
  placeholder?: string;
  startPlaceholder?: string;
  endPlaceholder?: string;
  width?: string;
  options?: { label: string; value: any }[];
  multiple?: boolean;
  min?: number;
  max?: number;
}

const props = defineProps<{
  modelValue: Record<string, any>;
  fields: ProSearchField[];
  labelWidth?: string;
  searchText?: string;
  resetText?: string;
  expandText?: string;
  collapseText?: string;
  collapsible?: boolean;
  collapseThreshold?: number;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", val: Record<string, any>): void;
  (e: "search"): void;
  (e: "reset"): void;
}>();

const { t } = useI18n();
const formRef = ref<FormInstance>();
const collapsed = ref(false);

const labelWidth = computed(() => props.labelWidth || "78px");
const searchText = computed(() => props.searchText || t("message.common.search"));
const resetText = computed(() => props.resetText || t("message.common.reset"));
const expandText = computed(() => props.expandText || t("message.common.expand"));
const collapseText = computed(() => props.collapseText || t("message.common.collapse"));
const collapsible = computed(() => props.collapsible !== false);
const collapseThreshold = computed(() => props.collapseThreshold ?? 3);

// 折叠：超过阈值的字段隐藏
const visibleFields = computed(() => {
  if (!collapsible.value || !collapsed.value) return props.fields;
  return props.fields.slice(0, collapseThreshold.value);
});

const onSearch = () => emit("search");
const onReset = () => {
  formRef.value?.resetFields();
  emit("reset");
};

defineExpose({ formRef });
</script>

<style scoped>
.pro-search {
  background: var(--cc-color-surface);
  border: 1px solid var(--cc-color-border-light);
  border-radius: var(--cc-radius-lg);
  padding: var(--cc-space-4) var(--cc-space-5);
  box-shadow: var(--cc-shadow-xs);
  transition: padding 0.2s ease;
}
.pro-search__form {
  display: flex;
  flex-wrap: wrap;
  gap: 0;
  row-gap: 4px;
}
.pro-search__form :deep(.el-form-item) {
  margin-right: var(--cc-space-3);
  margin-bottom: var(--cc-space-2);
}
.pro-search__actions :deep(.el-form-item__content) {
  display: flex;
  align-items: center;
  gap: var(--cc-space-2);
}
.pro-search__toggle {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 32px;
  padding: 0 10px;
  margin-left: 4px;
  background: transparent;
  border: none;
  border-radius: var(--cc-radius-sm);
  color: var(--cc-color-text-3);
  font-size: var(--cc-font-13);
  cursor: pointer;
  transition:
    background 0.18s ease,
    color 0.18s ease;
}
.pro-search__toggle:hover {
  background: var(--cc-color-surface-hover);
  color: var(--cc-color-text-2);
}
.pro-search__toggle-icon {
  transition: transform 0.2s ease;
  font-size: 12px;
}
.pro-search__toggle-icon.is-collapsed {
  transform: rotate(180deg);
}

/* 按钮配色由 element-plus/components.css 全局接管（A 方案 · 柔色 plain 统一） */
</style>
