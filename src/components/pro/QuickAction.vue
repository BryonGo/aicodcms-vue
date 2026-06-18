<template>
  <router-link :to="to" class="quick-action" :style="bgStyle">
    <div class="quick-action__icon">
      <i :class="icon" />
    </div>
    <div class="quick-action__text">
      <div class="quick-action__label">{{ label }}</div>
      <div v-if="desc" class="quick-action__desc">{{ desc }}</div>
    </div>
    <i class="fa fa-angle-right quick-action__arrow" />
  </router-link>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps({
  label: { type: String, required: true },
  desc: { type: String, default: "" },
  icon: { type: String, default: "fa fa-th" },
  to: { type: [String, Object], default: "/" },
  color: { type: String, default: "" }, // hex 颜色或 css 变量
});

const bgStyle = computed(() => {
  if (!props.color) return {};
  return { "--qa-color": props.color } as any;
});
</script>

<style scoped>
.quick-action {
  --qa-color: var(--cc-color-primary);
  display: flex;
  align-items: center;
  gap: var(--cc-space-3);
  padding: var(--cc-space-4);
  background: var(--cc-color-surface);
  border: 1px solid var(--cc-color-border-light);
  border-radius: var(--cc-radius-md);
  text-decoration: none;
  color: var(--cc-color-text-1);
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}
.quick-action::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: var(--qa-color);
  opacity: 0;
  transition: opacity 0.2s ease;
}
.quick-action:hover {
  border-color: var(--qa-color);
  transform: translateY(-1px);
  box-shadow: var(--cc-shadow-sm);
}
.quick-action:hover::before {
  opacity: 1;
}
.quick-action:hover .quick-action__icon {
  background: var(--qa-color);
  color: #fff;
}
.quick-action__icon {
  width: 38px;
  height: 38px;
  border-radius: var(--cc-radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  background: color-mix(in srgb, var(--qa-color) 12%, transparent);
  color: var(--qa-color);
  font-size: 16px;
  transition: all 0.2s ease;
  flex-shrink: 0;
}
.quick-action__text {
  flex: 1;
  min-width: 0;
}
.quick-action__label {
  font-size: var(--cc-font-14);
  font-weight: 600;
  color: var(--cc-color-text-1);
  margin-bottom: 2px;
}
.quick-action__desc {
  font-size: var(--cc-font-12);
  color: var(--cc-color-text-3);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.quick-action__arrow {
  color: var(--cc-color-text-4);
  transition:
    transform 0.2s ease,
    color 0.2s ease;
}
.quick-action:hover .quick-action__arrow {
  color: var(--qa-color);
  transform: translateX(2px);
}
</style>
