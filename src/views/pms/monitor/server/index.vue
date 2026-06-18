<template>
  <ProPage
    :title="$t('message.pms.monitor.serverTitle')"
    :subtitle="$t('message.pms.server.runResource')"
  >
    <template #actions>
      <el-button :icon="RefreshIcon" :loading="loading" @click="loadOnce">
        {{ $t("message.common.refresh") }}
      </el-button>
    </template>

    <!-- KPI 行 -->
    <div class="kpi-row">
      <KpiCard
        :label="$t('message.pms.server.cpuUsage')"
        :value="fmtNum(sysInfo.cpuUsed)"
        unit="%"
        tone="aurora"
        icon="fa fa-microchip"
        :hint="cpuCoresHint"
      />
      <KpiCard
        :label="$t('message.pms.server.memUsed')"
        :value="fmtNum(sysInfo.memUsage)"
        unit="%"
        tone="ocean"
        icon="fa fa-server"
        :hint="memHint"
      />
      <KpiCard
        :label="$t('message.pms.server.memAppUsed')"
        :value="goUsedFmt"
        tone="mint"
        icon="fa fa-cogs"
        :hint="goVersionHint"
      />
      <KpiCard
        :label="$t('message.pms.server.runtime')"
        :value="runtimeFmt"
        tone="violet"
        icon="fa fa-clock-o"
        :hint="sysInfo.goStartTime || '—'"
      />
    </div>

    <!-- 图表行 -->
    <div class="chart-row">
      <ChartCard :title="$t('message.pms.server.cpuResource')" :height="300">
        <div ref="cpuChartRef" class="chart-container" />
      </ChartCard>
      <ChartCard :title="$t('message.pms.server.memResource')" :height="300">
        <div ref="memChartRef" class="chart-container" />
      </ChartCard>
    </div>

    <!-- 磁盘信息 -->
    <ChartCard :title="$t('message.pms.server.diskResource')" height="auto">
      <el-table :data="sysInfo.diskList || []" stripe style="width: 100%">
        <el-table-column
          prop="path"
          :label="$t('message.pms.server.diskPath')"
          min-width="140"
          show-overflow-tooltip
        />
        <el-table-column prop="fstype" :label="$t('message.pms.server.diskFs')" width="120" />
        <el-table-column :label="$t('message.pms.server.diskTotal')" width="140">
          <template #default="{ row }">{{ memorySizeFormat(row.total) }}</template>
        </el-table-column>
        <el-table-column :label="$t('message.pms.server.diskFree')" width="140">
          <template #default="{ row }">{{ memorySizeFormat(row.free) }}</template>
        </el-table-column>
        <el-table-column :label="$t('message.pms.server.diskUsed')" width="140">
          <template #default="{ row }">{{ memorySizeFormat(row.used) }}</template>
        </el-table-column>
        <el-table-column :label="$t('message.pms.server.diskPercent')" min-width="200">
          <template #default="{ row }">
            <div class="disk-cell">
              <el-progress
                :percentage="Number(row.usedPercent ?? 0)"
                :status="diskStatus(row.usedPercent)"
                :stroke-width="10"
                :show-text="false"
              />
              <span class="disk-cell__val">{{ Number(row.usedPercent ?? 0).toFixed(1) }}%</span>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </ChartCard>

    <!-- 服务器信息墙 -->
    <ChartCard :title="$t('message.pms.server.runResource')" height="auto">
      <div class="info-wall">
        <div class="info-item" v-for="(it, i) in infoItems" :key="i">
          <div class="info-item__label">{{ it.label }}</div>
          <div class="info-item__value">{{ it.value || "—" }}</div>
        </div>
      </div>
    </ChartCard>
  </ProPage>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, nextTick, watch } from "vue";
import { useI18n } from "vue-i18n";
import { RefreshRight as RefreshIcon } from "@element-plus/icons-vue";

import ProPage from "/@/components/pro/ProPage.vue";
import KpiCard from "/@/components/pro/KpiCard.vue";
import ChartCard from "/@/components/pro/ChartCard.vue";

import { getSysInfo } from "/@/api/pms/monitor/server";
import { useThemeConfig } from "/@/stores/themeConfig";
import { storeToRefs } from "pinia";

const { t } = useI18n();
const sysInfo = reactive<any>({});
const loading = ref(false);

const cpuChartRef = ref<HTMLElement>();
const memChartRef = ref<HTMLElement>();
let cpuChart: any = null;
let memChart: any = null;
let echarts: any = null;
let pollTimer: any = null;

// ---- 工具函数 ----
const fmtNum = (v: any) => {
  if (v == null || isNaN(Number(v))) return "0.0";
  return Number(v).toFixed(1);
};

const memorySizeFormat = (size: any) => {
  let s = parseFloat(size);
  if (isNaN(s) || s === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let r = 0;
  while (s > 1024 && r < units.length - 1) {
    s = s / 1024;
    r++;
  }
  return s.toFixed(2) + " " + units[r];
};

const timeFormat = (second: any) => {
  let s = parseFloat(second);
  if (isNaN(s)) return "—";
  const units = [
    t("message.common.second"),
    t("message.common.minute"),
    t("message.common.hour"),
    t("message.common.day"),
  ];
  const limits = [60, 60, 24];
  let r = 0;
  while (r < limits.length && s > limits[r]) {
    s = s / limits[r];
    r++;
  }
  return s.toFixed(2) + " " + units[r];
};

// ---- 派生显示 ----
const cpuCoresHint = computed(() =>
  sysInfo.cpuNum ? `${sysInfo.cpuNum} ${t("message.pms.server.cpuCores")}` : "—",
);
const memHint = computed(() => {
  if (!sysInfo.memTotal) return "—";
  return `${memorySizeFormat(sysInfo.memUsed)} / ${memorySizeFormat(sysInfo.memTotal)}`;
});
const goUsedFmt = computed(() => memorySizeFormat(sysInfo.goUsed || 0));
const runtimeFmt = computed(() => timeFormat(sysInfo.goRunTime || 0));
const goVersionHint = computed(
  () => `${t("message.pms.server.goVersion")}  ${sysInfo.goVersion || "—"}`,
);

const infoItems = computed(() => [
  { label: t("message.pms.server.os"), value: sysInfo.sysOsName },
  { label: t("message.pms.server.arch"), value: sysInfo.sysOsArch },
  { label: t("message.pms.server.serverName"), value: sysInfo.sysComputerName },
  { label: t("message.pms.server.serverIp"), value: sysInfo.sysComputerIp },
  { label: t("message.pms.server.goVersion"), value: sysInfo.goVersion },
  { label: t("message.pms.server.startup"), value: sysInfo.goStartTime },
  { label: t("message.pms.server.loadAvg5"), value: (sysInfo.cpuAvg5 ?? 0) + "%" },
  { label: t("message.pms.server.loadAvg15"), value: (sysInfo.cpuAvg15 ?? 0) + "%" },
]);

const diskStatus = (percent: any): any => {
  const p = Number(percent ?? 0);
  if (p >= 90) return "exception";
  if (p >= 75) return "warning";
  return "success";
};

// ---- 仪表盘配置 ----
const getGaugeOption = (name: string, value: number) => {
  const isDark = document.documentElement.classList.contains("dark");
  const textColor = isDark ? "#e6e8ec" : "#374151";
  return {
    tooltip: { formatter: "{a} <br/>{b}: {c}%" },
    series: [
      {
        type: "gauge",
        name,
        radius: "85%",
        progress: { show: true, width: 14 },
        axisLine: {
          lineStyle: {
            width: 14,
            color: [
              [0.3, "#16BAAA"],
              [0.6, "#3B82F6"],
              [0.8, "#F59E0B"],
              [1, "#EF4444"],
            ],
          },
        },
        axisTick: { show: false },
        splitLine: { length: 10, lineStyle: { color: "auto", width: 2 } },
        axisLabel: { color: textColor, fontSize: 10, distance: 20 },
        pointer: { itemStyle: { color: "auto" } },
        title: {
          show: true,
          fontSize: 13,
          color: textColor,
          offsetCenter: [0, "70%"],
        },
        detail: {
          valueAnimation: true,
          formatter: "{value}%",
          fontSize: 28,
          fontWeight: 600,
          color: "auto",
          offsetCenter: [0, "40%"],
        },
        data: [{ value, name }],
      },
    ],
  };
};

const initCharts = async () => {
  try {
    // 动态导入 echarts 避免初始化时的同步阻塞
    if (!echarts) {
      echarts = await import("echarts");
    }
    await nextTick();
    if (cpuChartRef.value && !cpuChart) {
      cpuChart = echarts.init(cpuChartRef.value);
      cpuChart.setOption(getGaugeOption(t("message.pms.server.cpuUsage"), 0));
    }
    if (memChartRef.value && !memChart) {
      memChart = echarts.init(memChartRef.value);
      memChart.setOption(getGaugeOption(t("message.pms.server.memUsed"), 0));
    }
  } catch (e) {
    console.warn("[monitor/server] echarts init failed", e);
  }
};

const updateCharts = () => {
  try {
    cpuChart?.setOption({
      series: [
        {
          data: [
            { value: Number(fmtNum(sysInfo.cpuUsed)), name: t("message.pms.server.cpuUsage") },
          ],
        },
      ],
    });
    memChart?.setOption({
      series: [
        {
          data: [
            { value: Number(fmtNum(sysInfo.memUsage)), name: t("message.pms.server.memUsed") },
          ],
        },
      ],
    });
  } catch (e) {
    console.warn("[monitor/server] chart update failed", e);
  }
};

// ---- 数据拉取 ----
const loadOnce = async () => {
  loading.value = true;
  try {
    const res: any = await getSysInfo();
    if (res?.code === 0 && res.data) {
      Object.assign(sysInfo, res.data);
      updateCharts();
    }
  } catch (e) {
    // 接口失败由 request 拦截器统一提示
  } finally {
    loading.value = false;
  }
};

// ---- 暗色切换重渲 ----
const storesThemeConfig = useThemeConfig();
const { themeConfig } = storeToRefs(storesThemeConfig);
watch(
  () => themeConfig.value.isIsDark,
  () => {
    try {
      const cpuVal = Number(fmtNum(sysInfo.cpuUsed));
      const memVal = Number(fmtNum(sysInfo.memUsage));
      cpuChart?.setOption(getGaugeOption(t("message.pms.server.cpuUsage"), cpuVal));
      memChart?.setOption(getGaugeOption(t("message.pms.server.memUsed"), memVal));
    } catch {}
  },
);

// ---- 响应式重绘 ----
const handleResize = () => {
  try {
    cpuChart?.resize();
    memChart?.resize();
  } catch {}
};

onMounted(async () => {
  // 先拉数据（确保接口失败不会阻塞图表渲染）
  loadOnce();
  // 异步初始化 echarts（动态 import 避免同步阻塞）
  await initCharts();
  if (Object.keys(sysInfo).length > 0) updateCharts();
  pollTimer = setInterval(loadOnce, 5000);
  window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer);
  cpuChart?.dispose();
  memChart?.dispose();
  cpuChart = null;
  memChart = null;
  window.removeEventListener("resize", handleResize);
});
</script>

<style scoped>
.kpi-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--cc-space-4);
}
.chart-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--cc-space-4);
}
.chart-container {
  width: 100%;
  height: 100%;
  min-height: 280px;
}

.disk-cell {
  display: flex;
  align-items: center;
  gap: var(--cc-space-3);
}
.disk-cell :deep(.el-progress) {
  flex: 1;
  min-width: 0;
}
.disk-cell__val {
  font-variant-numeric: tabular-nums;
  color: var(--cc-color-text-2);
  font-size: var(--cc-font-13);
  min-width: 50px;
  text-align: right;
}

.info-wall {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--cc-space-4);
}
.info-item {
  background: var(--cc-color-bg);
  border: 1px solid var(--cc-color-border-light);
  border-radius: var(--cc-radius-md);
  padding: var(--cc-space-3) var(--cc-space-4);
  min-width: 0;
}
.info-item__label {
  color: var(--cc-color-text-3);
  font-size: var(--cc-font-12);
  margin-bottom: 4px;
}
.info-item__value {
  color: var(--cc-color-text-1);
  font-size: var(--cc-font-14);
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 1200px) {
  .kpi-row {
    grid-template-columns: repeat(2, 1fr);
  }
  .info-wall {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 768px) {
  .chart-row {
    grid-template-columns: 1fr;
  }
}
</style>
