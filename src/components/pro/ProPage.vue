<template>
  <div class="pro-page" :class="{ 'pro-page--gutter': gutter }">
    <div v-if="$slots.header || title || $slots.actions" class="pro-page__header">
      <div class="pro-page__header-left">
        <slot name="header">
          <div class="pro-page__title-row">
            <h2 v-if="title" class="pro-page__title">{{ title }}</h2>
            <el-tag v-if="badge" size="small" effect="light" round>{{ badge }}</el-tag>
          </div>
          <p v-if="subtitle" class="pro-page__subtitle">{{ subtitle }}</p>
        </slot>
      </div>
      <div v-if="$slots.actions" class="pro-page__header-right">
        <slot name="actions" />
      </div>
    </div>
    <div class="pro-page__body">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  title: { type: String, default: "" },
  subtitle: { type: String, default: "" },
  badge: { type: String, default: "" },
  gutter: { type: Boolean, default: true },
});
</script>

<style scoped>
.pro-page {
  display: flex;
  flex-direction: column;
  gap: var(--cc-space-5);
  width: 100%;
  min-height: 100%;
}
.pro-page--gutter {
  padding: var(--cc-space-page);
}
.pro-page__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--cc-space-4);
  flex-wrap: wrap;
}
.pro-page__header-left {
  min-width: 0;
}
.pro-page__title-row {
  display: flex;
  align-items: center;
  gap: var(--cc-space-3);
}
.pro-page__title {
  font-size: var(--cc-font-20);
  font-weight: 600;
  color: var(--cc-color-text-1);
  margin: 0;
  letter-spacing: -0.01em;
}
.pro-page__subtitle {
  margin: 4px 0 0 0;
  color: var(--cc-color-text-3);
  font-size: var(--cc-font-13);
}
.pro-page__header-right {
  display: flex;
  align-items: center;
  gap: var(--cc-space-2);
  flex-shrink: 0;
}
.pro-page__body {
  display: flex;
  flex-direction: column;
  gap: var(--cc-space-5);
  flex: 1;
  min-height: 0;
}
</style>
