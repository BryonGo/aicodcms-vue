<template>
  <div class="pro-editor" :class="{ 'pro-editor--bordered': bordered }">
    <div v-if="title || subtitle" class="pro-editor__header">
      <h3 v-if="title" class="pro-editor__title">{{ title }}</h3>
      <p v-if="subtitle" class="pro-editor__subtitle">{{ subtitle }}</p>
    </div>
    <GfTiptap
      v-model="content"
      :toolbar="toolbar"
      :placeholder="placeholder"
      :show-count="showCount"
      :editor-id="editorId"
      @setEditContent="(v: any) => $emit('setEditContent', v)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import GfTiptap from "/@/components/tiptap/index.vue";

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    title?: string;
    subtitle?: string;
    /** tiptap 工具栏模式：full / mini / minimal */
    toolbar?: "full" | "mini" | "minimal";
    placeholder?: string;
    showCount?: boolean;
    bordered?: boolean;
    editorId?: string;
  }>(),
  {
    modelValue: "",
    toolbar: "full",
    showCount: true,
    bordered: true,
    editorId: "pro-editor",
  },
);

const emit = defineEmits<{
  (e: "update:modelValue", val: string): void;
  (e: "setEditContent", val: any): void;
}>();

const content = computed({
  get: () => props.modelValue,
  set: (v) => emit("update:modelValue", v),
});
</script>

<style scoped>
.pro-editor {
  background: var(--cc-color-surface);
  border-radius: var(--cc-radius-lg);
  overflow: hidden;
}
.pro-editor--bordered {
  border: 1px solid var(--cc-color-border-light);
  box-shadow: var(--cc-shadow-card);
}
.pro-editor__header {
  padding: var(--cc-space-4) var(--cc-space-5);
  border-bottom: 1px solid var(--cc-color-border-light);
}
.pro-editor__title {
  margin: 0;
  font-size: var(--cc-font-16);
  font-weight: 600;
  color: var(--cc-color-text-1);
}
.pro-editor__subtitle {
  margin: 4px 0 0;
  color: var(--cc-color-text-3);
  font-size: var(--cc-font-13);
}
.pro-editor :deep(.gf-tiptap) {
  border: none;
  border-radius: 0;
}
</style>
