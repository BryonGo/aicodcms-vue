<template>
  <div class="pro-code-editor" :class="{ 'pro-code-editor--bordered': bordered }">
    <div v-if="title || $slots.extra" class="pro-code-editor__header">
      <div class="pro-code-editor__header-left">
        <h3 v-if="title" class="pro-code-editor__title">{{ title }}</h3>
        <span v-if="lang" class="pro-code-editor__lang">{{ lang }}</span>
      </div>
      <div v-if="$slots.extra" class="pro-code-editor__header-right">
        <slot name="extra" />
      </div>
    </div>
    <textarea
      ref="textareaRef"
      class="pro-code-editor__textarea"
      :class="`pro-code-editor__textarea--${theme}`"
      :style="{ height: typeof height === 'number' ? height + 'px' : height }"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :spellcheck="false"
      @input="onInput"
    />
    <div class="pro-code-editor__footer">
      <span class="pro-code-editor__count">{{ charCount }} 字符 · {{ lineCount }} 行</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useThemeConfig } from "/@/stores/themeConfig";
import { storeToRefs } from "pinia";

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    title?: string;
    lang?: string;
    placeholder?: string;
    height?: string | number;
    disabled?: boolean;
    readonly?: boolean;
    bordered?: boolean;
  }>(),
  {
    modelValue: "",
    placeholder: "Enter code here...",
    height: 300,
    bordered: true,
  },
);

const emit = defineEmits<{
  (e: "update:modelValue", val: string): void;
  (e: "change", val: string): void;
}>();

const textareaRef = ref<HTMLTextAreaElement>();

// 主题跟随暗色
const storesThemeConfig = useThemeConfig();
const { themeConfig } = storeToRefs(storesThemeConfig);
const theme = computed(() => (themeConfig.value.isIsDark ? "dark" : "light"));

const charCount = computed(() => props.modelValue.length);
const lineCount = computed(() => props.modelValue.split("\n").length);

const onInput = (e: Event) => {
  const v = (e.target as HTMLTextAreaElement).value;
  emit("update:modelValue", v);
  emit("change", v);
};

defineExpose({ textareaRef });
</script>

<style scoped>
.pro-code-editor {
  background: var(--cc-color-surface);
  border-radius: var(--cc-radius-lg);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.pro-code-editor--bordered {
  border: 1px solid var(--cc-color-border-light);
  box-shadow: var(--cc-shadow-card);
}

.pro-code-editor__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--cc-space-3) var(--cc-space-4);
  background: var(--cc-color-bg);
  border-bottom: 1px solid var(--cc-color-border-light);
}
.pro-code-editor__header-left {
  display: flex;
  align-items: center;
  gap: var(--cc-space-2);
}
.pro-code-editor__title {
  margin: 0;
  font-size: var(--cc-font-13);
  font-weight: 600;
  color: var(--cc-color-text-1);
}
.pro-code-editor__lang {
  display: inline-block;
  padding: 2px 8px;
  border-radius: var(--cc-radius-sm);
  background: var(--cc-color-primary-softer);
  color: var(--cc-color-primary);
  font-size: var(--cc-font-12);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.pro-code-editor__header-right {
  display: flex;
  gap: var(--cc-space-2);
}

.pro-code-editor__textarea {
  width: 100%;
  border: none;
  outline: none;
  padding: var(--cc-space-3) var(--cc-space-4);
  font-family: var(--cc-font-mono);
  font-size: var(--cc-font-13);
  line-height: 1.5;
  resize: vertical;
  min-height: 200px;
  transition:
    background 0.18s ease,
    color 0.18s ease;
}
.pro-code-editor__textarea--light {
  background: var(--cc-color-surface);
  color: var(--cc-color-text-1);
}
.pro-code-editor__textarea--dark {
  background: #0d1117;
  color: #c9d1d9;
}
.pro-code-editor__textarea::placeholder {
  color: var(--cc-color-text-4);
}

.pro-code-editor__footer {
  padding: var(--cc-space-2) var(--cc-space-4);
  border-top: 1px solid var(--cc-color-border-light);
  background: var(--cc-color-bg);
  font-size: var(--cc-font-12);
  color: var(--cc-color-text-3);
  text-align: right;
}
</style>
