<template>
  <el-drawer
    v-model="visible"
    :size="sizePx"
    :direction="direction"
    :close-on-click-modal="closeOnClickModal"
    :close-on-press-escape="closeOnPressEscape"
    :destroy-on-close="destroyOnClose"
    :before-close="onBeforeClose"
    :append-to-body="appendToBody"
    :modal="modal"
    :show-close="false"
    class="pro-drawer"
    @open="$emit('open')"
    @opened="$emit('opened')"
    @close="$emit('close')"
    @closed="$emit('closed')"
  >
    <!-- 头 -->
    <template #header>
      <div class="pro-drawer__header">
        <div class="pro-drawer__header-left">
          <slot name="title">
            <h3 v-if="title" class="pro-drawer__title">{{ title }}</h3>
            <p v-if="subtitle" class="pro-drawer__subtitle">{{ subtitle }}</p>
          </slot>
        </div>
        <div class="pro-drawer__header-right">
          <slot name="actions" />
          <el-button :icon="CloseIcon" circle text @click="onClose" />
        </div>
      </div>
    </template>

    <!-- 主体 -->
    <div class="pro-drawer__body" :class="{ 'pro-drawer__body--no-pad': noPadding }">
      <slot />
    </div>

    <!-- 底（确认/取消按钮区） -->
    <template v-if="$slots.footer || showFooter" #footer>
      <div class="pro-drawer__footer">
        <slot name="footer">
          <el-button @click="onClose">{{ cancelText }}</el-button>
          <el-button type="primary" :loading="confirmLoading" @click="onConfirm">{{
            confirmText
          }}</el-button>
        </slot>
      </div>
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Close as CloseIcon } from "@element-plus/icons-vue";

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    title?: string;
    subtitle?: string;
    /** 宽度：'sm' | 'md' | 'lg' | 'xl' | 数字 px | 百分比字符串 */
    size?: "sm" | "md" | "lg" | "xl" | number | string;
    direction?: "rtl" | "ltr" | "ttb" | "btt";
    closeOnClickModal?: boolean;
    closeOnPressEscape?: boolean;
    destroyOnClose?: boolean;
    appendToBody?: boolean;
    modal?: boolean;
    noPadding?: boolean;
    /** 显示底部确认/取消按钮（即使没传 footer slot） */
    showFooter?: boolean;
    confirmText?: string;
    cancelText?: string;
    confirmLoading?: boolean;
    /** 关闭前回调，返回 false / Promise.reject 可阻止关闭 */
    beforeClose?: (done: () => void) => Promise<boolean | void> | boolean | void;
  }>(),
  {
    size: "md",
    direction: "rtl",
    closeOnClickModal: true,
    closeOnPressEscape: true,
    destroyOnClose: false,
    appendToBody: false,
    modal: true,
    noPadding: false,
    showFooter: false,
    confirmText: "Confirm",
    cancelText: "Cancel",
    confirmLoading: false,
  },
);

const emit = defineEmits<{
  (e: "update:modelValue", val: boolean): void;
  (e: "open"): void;
  (e: "opened"): void;
  (e: "close"): void;
  (e: "closed"): void;
  (e: "confirm"): void;
  (e: "cancel"): void;
}>();

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit("update:modelValue", v),
});

// 尺寸 token 映射
const sizePx = computed(() => {
  if (typeof props.size === "number") return `${props.size}px`;
  if (typeof props.size === "string" && props.size.endsWith("%")) return props.size;
  const map: Record<string, string> = { sm: "360px", md: "520px", lg: "720px", xl: "960px" };
  return map[props.size as string] ?? props.size;
});

const onClose = () => {
  emit("cancel");
  visible.value = false;
};

const onConfirm = () => {
  emit("confirm");
};

const onBeforeClose = (done: () => void) => {
  if (!props.beforeClose) return done();
  const r = props.beforeClose(done);
  if (r && typeof (r as Promise<any>).then === "function") {
    (r as Promise<boolean | void>).then((ok) => {
      if (ok !== false) done();
    });
  } else if (r !== false) {
    done();
  }
};
</script>

<style scoped>
:deep(.pro-drawer .el-drawer__header) {
  margin-bottom: 0 !important;
  padding: 0 !important;
  border-bottom: 1px solid var(--cc-color-border-light);
}
:deep(.pro-drawer .el-drawer__body) {
  padding: 0 !important;
}
:deep(.pro-drawer .el-drawer__footer) {
  padding: var(--cc-space-3) var(--cc-space-5);
  border-top: 1px solid var(--cc-color-border-light);
  display: flex;
  justify-content: flex-end;
  gap: var(--cc-space-2);
}

.pro-drawer__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--cc-space-3);
  padding: var(--cc-space-4) var(--cc-space-5);
  min-height: 56px;
}
.pro-drawer__header-left {
  flex: 1;
  min-width: 0;
}
.pro-drawer__title {
  margin: 0;
  font-size: var(--cc-font-16);
  font-weight: 600;
  color: var(--cc-color-text-1);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.pro-drawer__subtitle {
  margin: 4px 0 0;
  font-size: var(--cc-font-12);
  color: var(--cc-color-text-3);
}
.pro-drawer__header-right {
  display: flex;
  align-items: center;
  gap: var(--cc-space-2);
}

.pro-drawer__body {
  padding: var(--cc-space-5);
}
.pro-drawer__body--no-pad {
  padding: 0;
}

.pro-drawer__footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--cc-space-2);
}
</style>
