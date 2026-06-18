<template>
  <div class="kpi-card" :class="[`kpi-card--${tone}`]">
    <div class="kpi-card__bg" />
    <div class="kpi-card__head">
      <div class="kpi-card__label">{{ label }}</div>
      <div class="kpi-card__icon">
        <i v-if="icon" :class="icon" />
      </div>
    </div>
    <div class="kpi-card__value-row">
      <div class="kpi-card__value">
        {{ value }}<span v-if="unit" class="kpi-card__unit">{{ unit }}</span>
      </div>
      <div v-if="trend !== undefined && trend !== null" class="kpi-card__trend" :class="trendClass">
        <i :class="trendIcon" /> {{ trendText }}
      </div>
    </div>
    <div v-if="hint" class="kpi-card__hint">{{ hint }}</div>
    <div v-if="sparkline && sparkline.length > 0" ref="sparkRef" class="kpi-card__spark" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref, watch, nextTick } from "vue";
import * as echarts from "echarts";

const props = defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], required: true },
  unit: { type: String, default: "" },
  icon: { type: String, default: "" },
  tone: { type: String, default: "aurora" }, // aurora / sunset / violet / ocean / mint / cosmic
  trend: { type: Number, default: null as any }, // 正数=上涨 负数=下跌
  trendUnit: { type: String, default: "%" },
  hint: { type: String, default: "" },
  sparkline: { type: Array, default: () => [] as number[] },
});

const trendClass = computed(() => {
  if (props.trend === null || props.trend === undefined) return "";
  if (props.trend > 0) return "is-up";
  if (props.trend < 0) return "is-down";
  return "is-flat";
});
const trendIcon = computed(() => {
  if (props.trend > 0) return "fa fa-arrow-up";
  if (props.trend < 0) return "fa fa-arrow-down";
  return "fa fa-minus";
});
const trendText = computed(() => {
  if (props.trend === null || props.trend === undefined) return "";
  return Math.abs(props.trend) + props.trendUnit;
});

const sparkRef = ref<HTMLElement | null>(null);
let chart: echarts.ECharts | null = null;

const renderSpark = () => {
  if (!sparkRef.value || !props.sparkline.length) return;
  if (chart) chart.dispose();
  chart = echarts.init(sparkRef.value);
  chart.setOption({
    grid: { top: 0, right: 0, bottom: 0, left: 0 },
    xAxis: { type: "category", show: false, data: props.sparkline.map((_, i) => i) },
    yAxis: { type: "value", show: false, scale: true },
    series: [
      {
        type: "line",
        smooth: true,
        symbol: "none",
        lineStyle: { width: 2, color: "rgba(255,255,255,0.95)" },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "rgba(255,255,255,0.35)" },
            { offset: 1, color: "rgba(255,255,255,0)" },
          ]),
        },
        data: props.sparkline,
      },
    ],
  });
};

const onResize = () => chart?.resize();

onMounted(() => {
  nextTick(renderSpark);
  window.addEventListener("resize", onResize);
});
onBeforeUnmount(() => {
  window.removeEventListener("resize", onResize);
  chart?.dispose();
});
watch(
  () => props.sparkline,
  () => nextTick(renderSpark),
  { deep: true },
);
</script>

<style scoped>
.kpi-card {
  position: relative;
  overflow: hidden;
  border-radius: var(--cc-radius-lg);
  padding: var(--cc-space-5);
  color: #fff;
  min-height: 140px;
  box-shadow: var(--cc-shadow-md);
  transition:
    transform 0.25s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.25s ease;
  isolation: isolate;
}
.kpi-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--cc-shadow-lg);
}
.kpi-card__bg {
  position: absolute;
  inset: 0;
  z-index: -1;
}
.kpi-card--aurora .kpi-card__bg {
  background: var(--cc-grad-aurora);
}
.kpi-card--sunset .kpi-card__bg {
  background: var(--cc-grad-sunset);
}
.kpi-card--violet .kpi-card__bg {
  background: var(--cc-grad-violet);
}
.kpi-card--ocean .kpi-card__bg {
  background: var(--cc-grad-ocean);
}
.kpi-card--mint .kpi-card__bg {
  background: var(--cc-grad-mint);
}
.kpi-card--cosmic .kpi-card__bg {
  background: var(--cc-grad-cosmic);
}
.kpi-card__bg::after {
  content: "";
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 100% 0%, rgba(255, 255, 255, 0.25) 0%, transparent 50%),
    radial-gradient(circle at 0% 100%, rgba(0, 0, 0, 0.18) 0%, transparent 50%);
  pointer-events: none;
}
.kpi-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--cc-space-3);
}
.kpi-card__label {
  font-size: var(--cc-font-13);
  font-weight: 500;
  opacity: 0.92;
  letter-spacing: 0.02em;
}
.kpi-card__icon {
  width: 36px;
  height: 36px;
  border-radius: var(--cc-radius-md);
  background: rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}
.kpi-card__value-row {
  display: flex;
  align-items: baseline;
  gap: var(--cc-space-3);
}
.kpi-card__value {
  font-size: var(--cc-font-28);
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.1;
  font-feature-settings: "tnum";
}
.kpi-card__unit {
  font-size: var(--cc-font-15);
  font-weight: 500;
  margin-left: 4px;
  opacity: 0.85;
}
.kpi-card__trend {
  font-size: var(--cc-font-12);
  padding: 2px 8px;
  border-radius: var(--cc-radius-full);
  background: rgba(255, 255, 255, 0.18);
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.kpi-card__trend.is-up {
  background: rgba(255, 255, 255, 0.22);
}
.kpi-card__trend.is-down {
  background: rgba(0, 0, 0, 0.18);
}
.kpi-card__hint {
  margin-top: var(--cc-space-2);
  font-size: var(--cc-font-12);
  opacity: 0.78;
}
.kpi-card__spark {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 56px;
  opacity: 0.7;
  pointer-events: none;
}
</style>
