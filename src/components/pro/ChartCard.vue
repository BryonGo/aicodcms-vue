<template>
  <div class="chart-card" :class="{ 'chart-card--no-pad': noPadding }">
    <div v-if="title || $slots.title || $slots.extra" class="chart-card__head">
      <div class="chart-card__head-left">
        <slot name="title">
          <h3 class="chart-card__title">{{ title }}</h3>
          <span v-if="subtitle" class="chart-card__subtitle">{{ subtitle }}</span>
        </slot>
      </div>
      <div v-if="$slots.extra" class="chart-card__head-right">
        <slot name="extra" />
      </div>
    </div>
    <div
      class="chart-card__body"
      :style="{ height: typeof height === 'number' ? height + 'px' : height }"
    >
      <slot />
    </div>
    <div v-if="$slots.footer" class="chart-card__footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  title: { type: String, default: "" },
  subtitle: { type: String, default: "" },
  height: { type: [String, Number], default: 320 },
  noPadding: { type: Boolean, default: false },
});
</script>

<style scoped>
.chart-card {
  background: var(--cc-color-surface);
  border: 1px solid var(--cc-color-border-light);
  border-radius: var(--cc-radius-lg);
  box-shadow: var(--cc-shadow-card);
  transition:
    box-shadow 0.2s ease,
    transform 0.2s ease;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.chart-card:hover {
  box-shadow: var(--cc-shadow-card-hover);
}
.chart-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--cc-space-3);
  padding: var(--cc-space-4) var(--cc-space-5);
  border-bottom: 1px solid var(--cc-color-border-light);
}
.chart-card__head-left {
  display: flex;
  align-items: baseline;
  gap: var(--cc-space-2);
  min-width: 0;
}
.chart-card__title {
  margin: 0;
  font-size: var(--cc-font-15);
  font-weight: 600;
  color: var(--cc-color-text-1);
  letter-spacing: -0.01em;
}
.chart-card__subtitle {
  font-size: var(--cc-font-12);
  color: var(--cc-color-text-3);
}
.chart-card__body {
  padding: var(--cc-space-4) var(--cc-space-5);
  flex: 1;
  min-height: 0;
}
.chart-card--no-pad .chart-card__body {
  padding: 0;
}
.chart-card__footer {
  padding: var(--cc-space-3) var(--cc-space-5);
  border-top: 1px solid var(--cc-color-border-light);
}
</style>
