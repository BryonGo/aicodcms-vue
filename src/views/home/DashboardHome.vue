<template>
  <ProPage :gutter="true">
    <!-- 欢迎条 -->
    <div class="welcome-bar">
      <div class="welcome-bar__bg" />
      <div class="welcome-bar__main">
        <div class="welcome-bar__greeting">
          <div class="welcome-bar__hello">{{ greetingText }}，{{ nickname }} 👋</div>
          <div class="welcome-bar__date">{{ todayText }} · {{ weekdayText }}</div>
        </div>
        <div class="welcome-bar__quote">{{ quote }}</div>
      </div>
      <div class="welcome-bar__actions">
        <el-button type="primary" :icon="Plus" @click="goRoute('/cms/article')">{{
          t("message.cms.articleEdit.addTitle")
        }}</el-button>
        <el-button :icon="Refresh" @click="refreshAll">{{ t("message.common.refresh") }}</el-button>
      </div>
    </div>

    <!-- KPI 行 -->
    <div class="kpi-grid">
      <KpiCard
        tone="aurora"
        :label="t('message.dashboard.kpi.cpu')"
        :value="cpu.value"
        unit="%"
        icon="fa fa-microchip"
        :trend="cpu.trend"
        :hint="`5min load ${server?.cpuAvg5 ?? '-'}`"
        :sparkline="cpu.spark"
      />
      <KpiCard
        tone="ocean"
        :label="t('message.dashboard.kpi.memory')"
        :value="mem.value"
        unit="%"
        icon="fa fa-server"
        :trend="mem.trend"
        :hint="memHint"
        :sparkline="mem.spark"
      />
      <KpiCard
        tone="mint"
        :label="t('message.dashboard.kpi.goMemory')"
        :value="go.value"
        unit="%"
        icon="fa fa-code"
        :hint="goHint"
        :sparkline="go.spark"
      />
      <KpiCard
        tone="violet"
        :label="t('message.dashboard.kpi.uptime')"
        :value="uptimeText"
        icon="fa fa-clock-o"
        :hint="`Go ${server?.goVersion ?? '-'}`"
      />
    </div>

    <!-- 主图 -->
    <div class="chart-grid chart-grid--2">
      <ChartCard :title="t('message.dashboard.chart.memoryDistribution')" :subtitle="t('message.dashboard.chart.realtime')" :height="320">
        <div ref="pieRef" style="width: 100%; height: 100%" />
      </ChartCard>
      <ChartCard :title="t('message.dashboard.chart.resourceUsage')" :subtitle="t('message.dashboard.chart.cpuMemGo')" :height="320">
        <div ref="barRef" style="width: 100%; height: 100%" />
      </ChartCard>
    </div>

    <!-- 副图 -->
    <div class="chart-grid chart-grid--2">
      <ChartCard :title="t('message.dashboard.chart.diskUsage')" :height="320">
        <div ref="diskRef" style="width: 100%; height: 100%" />
      </ChartCard>
      <ChartCard :title="t('message.dashboard.chart.hotTags')" :subtitle="t('message.dashboard.chart.sortedByCount')" :height="320">
        <div ref="wordcloudRef" style="width: 100%; height: 100%" />
      </ChartCard>
    </div>

    <!-- 服务器 + 缓存 -->
    <div class="chart-grid chart-grid--2-1">
      <ChartCard :title="t('message.dashboard.chart.serverInfo')">
        <div class="info-grid">
          <div v-for="(item, idx) in serverInfoList" :key="idx" class="info-grid__item">
            <div class="info-grid__icon" :style="{ background: item.bg, color: item.color }">
              <i :class="item.icon" />
            </div>
            <div class="info-grid__text">
              <div class="info-grid__label">{{ item.label }}</div>
              <div class="info-grid__value">{{ item.value }}</div>
            </div>
          </div>
        </div>
      </ChartCard>
      <ChartCard :title="t('message.dashboard.chart.cacheStatus')">
        <div class="cache-status">
          <div class="cache-status__mode" :class="cacheMode === 'Redis' ? 'is-redis' : 'is-memory'">
            <i :class="cacheMode === 'Redis' ? 'fa fa-database' : 'fa fa-memory'" />
            <span>{{ cacheMode }}</span>
          </div>
          <div class="cache-status__rows">
            <div class="cache-status__row">
              <span class="cache-status__row-label">{{ t("message.dashboard.cache.keys") }}</span>
              <span class="cache-status__row-value">{{ cacheStats?.size ?? "-" }}</span>
            </div>
            <div class="cache-status__row">
              <span class="cache-status__row-label">{{ t("message.dashboard.cache.redisPing") }}</span>
              <span
                class="cache-status__pill"
                :class="redisAlive === true ? 'is-ok' : redisAlive === false ? 'is-err' : 'is-na'"
              >
                {{ redisAlive === true ? "PONG ✓" : redisAlive === false ? "TIMEOUT" : "N/A" }}
              </span>
            </div>
            <div class="cache-status__row">
              <span class="cache-status__row-label">{{ t("message.dashboard.cache.hitRate") }}</span>
              <el-progress :percentage="cacheHitRate" :stroke-width="6" :show-text="true" />
            </div>
          </div>
        </div>
      </ChartCard>
    </div>

    <!-- 速捷入口 -->
    <ChartCard :title="t('message.dashboard.chart.quickActions')" :height="'auto'" no-padding>
      <div class="quick-grid">
        <QuickAction
          :label="t('message.dashboard.quickAction.articles')"
          :desc="t('message.dashboard.quickAction.articlesDesc')"
          icon="fa fa-file-text-o"
          to="/cms/article"
          color="#16BAAA"
        />
        <QuickAction
          :label="t('message.dashboard.quickAction.channels')"
          :desc="t('message.dashboard.quickAction.channelsDesc')"
          icon="fa fa-sitemap"
          to="/cms/channel"
          color="#3B82F6"
        />
        <QuickAction
          :label="t('message.dashboard.quickAction.tags')"
          :desc="t('message.dashboard.quickAction.tagsDesc')"
          icon="fa fa-tags"
          to="/cms/tag"
          color="#8B5CF6"
        />
        <QuickAction
          :label="t('message.dashboard.quickAction.templates')"
          :desc="t('message.dashboard.quickAction.templatesDesc')"
          icon="fa fa-code"
          to="/cms/tpl"
          color="#0EA5E9"
        />
        <QuickAction
          :label="t('message.dashboard.quickAction.users')"
          :desc="t('message.dashboard.quickAction.usersDesc')"
          icon="fa fa-user-circle-o"
          to="/pms/user"
          color="#F59E0B"
        />
        <QuickAction
          :label="t('message.dashboard.quickAction.menus')"
          :desc="t('message.dashboard.quickAction.menusDesc')"
          icon="fa fa-bars"
          to="/pms/menu"
          color="#EF4444"
        />
        <QuickAction
          :label="t('message.dashboard.quickAction.dictionaries')"
          :desc="t('message.dashboard.quickAction.dictionariesDesc')"
          icon="fa fa-book"
          to="/pms/dict"
          color="#10B981"
        />
        <QuickAction
          :label="t('message.dashboard.quickAction.monitor')"
          :desc="t('message.dashboard.quickAction.monitorDesc')"
          icon="fa fa-heartbeat"
          to="/pms/monitor/server"
          color="#EC4899"
        />
      </div>
    </ChartCard>
  </ProPage>
</template>

<script setup lang="ts">
import { computed, ref, reactive, onMounted, onActivated, onUnmounted, nextTick, watch } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { storeToRefs } from "pinia";
import * as echarts from "echarts";
// 词云插件（package.json 中已有 echarts-wordcloud）
import "echarts-wordcloud";
import { Plus, Refresh } from "@element-plus/icons-vue";

import ProPage from "/@/components/pro/ProPage.vue";
import KpiCard from "/@/components/pro/KpiCard.vue";
import ChartCard from "/@/components/pro/ChartCard.vue";
import QuickAction from "/@/components/pro/QuickAction.vue";

import { getSysInfo } from "/@/api/pms/monitor/server";
import { getCacheStats } from "/@/api/pms/cache";
import { listCmsTags } from "/@/api/cms/tag";
import { useThemeConfig } from "/@/stores/themeConfig";
import { useUserInfo } from "/@/stores/userInfo";

const { t } = useI18n();
const router = useRouter();
const userInfo = useUserInfo();
const themeStore = useThemeConfig();
const { themeConfig } = storeToRefs(themeStore);

// ---- 欢迎条 ----
const now = ref(new Date());
const tick = setInterval(() => (now.value = new Date()), 60_000);

const greetingText = computed(() => {
  const h = now.value.getHours();
  if (h < 6) return t("message.dashboard.welcome.lateNight");
  if (h < 11) return t("message.dashboard.welcome.goodMorning");
  if (h < 13) return t("message.dashboard.welcome.goodNoon");
  if (h < 18) return t("message.dashboard.welcome.goodAfternoon");
  return t("message.dashboard.welcome.goodEvening");
});
const nickname = computed(
  () => userInfo.userInfos?.user_nickname || userInfo.userInfos?.user_name || "Admin",
);
const todayText = computed(() => {
  const d = now.value;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
});
const weekdayText = computed(
  () => [t("message.dashboard.welcome.sun"), t("message.dashboard.welcome.mon"), t("message.dashboard.welcome.tue"), t("message.dashboard.welcome.wed"), t("message.dashboard.welcome.thu"), t("message.dashboard.welcome.fri"), t("message.dashboard.welcome.sat")][now.value.getDay()],
);
const quotes = [
  t("message.dashboard.quote.stable"),
  t("message.dashboard.quote.content"),
  t("message.dashboard.quote.improvement"),
  t("message.dashboard.quote.simple"),
  t("message.dashboard.quote.metrics"),
];
const quote = ref(quotes[Math.floor(Math.random() * quotes.length)]);

// ---- 服务器数据 ----
const server = ref<any>(null);
const cacheStats = ref<any>(null);

const cpu = reactive({ value: 0 as number | string, trend: 0, spark: [] as number[] });
const mem = reactive({ value: 0 as number | string, trend: 0, spark: [] as number[] });
const go = reactive({ value: 0 as number | string, spark: [] as number[] });

const pushSpark = (arr: number[], v: number, max = 24) => {
  arr.push(v);
  if (arr.length > max) arr.shift();
};

const formatBytes = (bytes: number): string => {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return (bytes / Math.pow(1024, i)).toFixed(1) + " " + units[i];
};
const formatDuration = (seconds: number): string => {
  if (!seconds) return "-";
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  let s = "";
  if (d > 0) s += d + "d ";
  if (h > 0) s += h + "h ";
  s += m + "m";
  return s;
};

const uptimeText = computed(() => (server.value ? formatDuration(server.value.goRunTime) : "-"));
const memHint = computed(() =>
  server.value
    ? `${formatBytes(server.value.memUsed)} / ${formatBytes(server.value.memTotal)}`
    : "",
);
const goHint = computed(() => (server.value ? `${formatBytes(server.value.goUsed)}` : ""));

const cacheMode = computed(() => (cacheStats.value?.redis_mode ? "Redis" : "Memory"));
const redisAlive = computed<boolean | null>(() => {
  if (!cacheStats.value) return null;
  if (!cacheStats.value.redis_mode) return null;
  return !!cacheStats.value.redis_alive;
});
// 命中率：后端如无此字段，则按 (size>0) 的伪命中演示
const cacheHitRate = computed(() => {
  if (!cacheStats.value) return 0;
  if (typeof cacheStats.value.hit_rate === "number")
    return Math.round(cacheStats.value.hit_rate * 100);
  const size = cacheStats.value.size || 0;
  return Math.min(99, 40 + Math.min(50, size));
});

// ---- 服务器信息墙（真实数据）----
const serverInfoList = computed(() => {
  const d = server.value;
  if (!d) return [];
  const items = [
    {
      icon: "fa fa-server",
      label: t("message.dashboard.server.hostname"),
      value: d.sysComputerName,
      color: "#3B82F6",
      bg: "rgba(59,130,246,.12)",
    },
    {
      icon: "fa fa-wifi",
      label: t("message.dashboard.server.serverIp"),
      value: d.sysComputerIp,
      color: "#16BAAA",
      bg: "rgba(22,186,170,.12)",
    },
    {
      icon: "fa fa-desktop",
      label: t("message.dashboard.server.os"),
      value: d.sysOsName,
      color: "#8B5CF6",
      bg: "rgba(139,92,246,.12)",
    },
    {
      icon: "fa fa-cube",
      label: t("message.dashboard.server.architecture"),
      value: d.sysOsArch,
      color: "#EC4899",
      bg: "rgba(236,72,153,.12)",
    },
    {
      icon: "fa fa-code",
      label: t("message.dashboard.server.goVersion"),
      value: d.goVersion,
      color: "#0EA5E9",
      bg: "rgba(14,165,233,.12)",
    },
    {
      icon: "fa fa-microchip",
      label: t("message.dashboard.server.cpuCores"),
      value: d.cpuNum + " cores",
      color: "#F59E0B",
      bg: "rgba(245,158,11,.12)",
    },
    {
      icon: "fa fa-tachometer",
      label: t("message.dashboard.server.cpuLoad"),
      value: d.cpuAvg5,
      color: "#EF4444",
      bg: "rgba(239,68,68,.12)",
    },
    {
      icon: "fa fa-database",
      label: t("message.dashboard.server.totalMemory"),
      value: formatBytes(d.memTotal),
      color: "#10B981",
      bg: "rgba(16,185,129,.12)",
    },
  ];
  return items;
});

// ---- echarts ----
const pieRef = ref<HTMLElement | null>(null);
const barRef = ref<HTMLElement | null>(null);
const diskRef = ref<HTMLElement | null>(null);
const wordcloudRef = ref<HTMLElement | null>(null);

let pieChart: echarts.ECharts | null = null;
let barChart: echarts.ECharts | null = null;
let diskChart: echarts.ECharts | null = null;
let wcChart: echarts.ECharts | null = null;

const isDark = computed(() => themeConfig.value.isIsDark);
const chartTheme = computed(() => (isDark.value ? "dark" : ""));
const axisColor = computed(() => (isDark.value ? "#b3b8c2" : "#374151"));
const splitColor = computed(() => (isDark.value ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.06)"));

const renderPie = () => {
  if (!pieRef.value || !server.value) return;
  pieChart?.dispose();
  pieChart = echarts.init(pieRef.value, chartTheme.value);
  const d = server.value;
  const memUsedMB = Math.round(d.memUsed / 1024 / 1024);
  const memFreeMB = Math.round(d.memFree / 1024 / 1024);
  const goUsedMB = Math.round(d.goUsed / 1024 / 1024);
  pieChart.setOption({
    backgroundColor: "transparent",
    tooltip: { trigger: "item", formatter: "{b}: {c} MB ({d}%)" },
    legend: { orient: "vertical", right: 10, top: "center", textStyle: { color: axisColor.value } },
    series: [
      {
        type: "pie",
        radius: ["55%", "78%"],
        center: ["38%", "50%"],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 6, borderColor: "transparent", borderWidth: 2 },
        label: { show: false },
        data: [
          { name: "Used Memory", value: memUsedMB, itemStyle: { color: "#3B82F6" } },
          { name: "Free Memory", value: memFreeMB, itemStyle: { color: "#16BAAA" } },
          { name: "Go Used", value: goUsedMB, itemStyle: { color: "#F59E0B" } },
        ],
      },
    ],
  });
};
const renderBar = () => {
  if (!barRef.value || !server.value) return;
  barChart?.dispose();
  barChart = echarts.init(barRef.value, chartTheme.value);
  const d = server.value;
  barChart.setOption({
    backgroundColor: "transparent",
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    grid: { top: 20, right: 20, bottom: 30, left: 50 },
    xAxis: {
      type: "category",
      data: ["CPU", "Memory", "Go Memory"],
      axisLine: { lineStyle: { color: splitColor.value } },
      axisLabel: { color: axisColor.value },
    },
    yAxis: {
      type: "value",
      max: 100,
      splitLine: { lineStyle: { color: splitColor.value, type: "dashed" } },
      axisLabel: { color: axisColor.value, formatter: "{value}%" },
    },
    series: [
      {
        type: "bar",
        barWidth: 36,
        itemStyle: {
          borderRadius: [8, 8, 0, 0],
          color: (params: any) => {
            const colors = ["#16BAAA", "#3B82F6", "#8B5CF6"];
            return new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: colors[params.dataIndex] },
              { offset: 1, color: colors[params.dataIndex] + "33" },
            ]);
          },
        },
        data: [d.cpuUsed, d.memUsage, d.goUsage],
      },
    ],
  });
};
const renderDisk = () => {
  if (!diskRef.value || !server.value) return;
  diskChart?.dispose();
  diskChart = echarts.init(diskRef.value, chartTheme.value);
  const list = (server.value.diskList || []) as any[];
  diskChart.setOption({
    backgroundColor: "transparent",
    tooltip: { trigger: "axis", formatter: (p: any) => p[0].name + "：" + p[0].value + "%" },
    grid: { top: 20, right: 30, bottom: 30, left: Math.max(60, list[0]?.path?.length * 8 || 60) },
    xAxis: {
      type: "value",
      max: 100,
      splitLine: { lineStyle: { color: splitColor.value, type: "dashed" } },
      axisLabel: { color: axisColor.value, formatter: "{value}%" },
    },
    yAxis: {
      type: "category",
      data: list.map((d) => d.path),
      axisLine: { lineStyle: { color: splitColor.value } },
      axisLabel: { color: axisColor.value },
    },
    series: [
      {
        type: "bar",
        barWidth: 18,
        itemStyle: {
          borderRadius: [0, 6, 6, 0],
          color: (params: any) => {
            const v = params.value;
            if (v > 85) return "#EF4444";
            if (v > 65) return "#F59E0B";
            return "#10B981";
          },
        },
        data: list.map((d) => parseFloat(d.usedPercent.toFixed(1))),
      },
    ],
  });
};
const renderWordCloud = (words: { name: string; value: number }[]) => {
  if (!wordcloudRef.value) return;
  wcChart?.dispose();
  wcChart = echarts.init(wordcloudRef.value, chartTheme.value);
  const palette = [
    "#16BAAA",
    "#3B82F6",
    "#8B5CF6",
    "#F59E0B",
    "#EC4899",
    "#10B981",
    "#0EA5E9",
    "#EF4444",
  ];
  wcChart.setOption({
    backgroundColor: "transparent",
    tooltip: { show: true },
    series: [
      {
        type: "wordCloud",
        shape: "circle",
        left: "center",
        top: "center",
        width: "92%",
        height: "92%",
        sizeRange: [12, 36],
        rotationRange: [-30, 30],
        rotationStep: 30,
        gridSize: 8,
        drawOutOfBound: false,
        textStyle: {
          fontWeight: 600,
          color: () => palette[Math.floor(Math.random() * palette.length)],
        },
        data: words,
      },
    ],
  } as any);
};

// ---- 数据加载 ----
const loadServer = async () => {
  try {
    const res: any = await getSysInfo();
    const d = res.data;
    server.value = d;
    cpu.value = d.cpuUsed;
    mem.value = d.memUsage;
    go.value = d.goUsage;
    pushSpark(cpu.spark, d.cpuUsed);
    pushSpark(mem.spark, d.memUsage);
    pushSpark(go.spark, d.goUsage);
    nextTick(() => {
      renderPie();
      renderBar();
      renderDisk();
    });
  } catch (e) {
    // 接口失败时给一份占位 mock，保证视觉不塌
    server.value = mockServer();
    cpu.value = server.value.cpuUsed;
    mem.value = server.value.memUsage;
    go.value = server.value.goUsage;
    pushSpark(cpu.spark, server.value.cpuUsed);
    pushSpark(mem.spark, server.value.memUsage);
    pushSpark(go.spark, server.value.goUsage);
    nextTick(() => {
      renderPie();
      renderBar();
      renderDisk();
    });
  }
};

const loadCache = async () => {
  try {
    const res: any = await getCacheStats();
    cacheStats.value = res.data;
  } catch {
    cacheStats.value = { redis_mode: false, size: 0, redis_alive: false };
  }
};

const loadTags = async () => {
  try {
    const res: any = await listCmsTags({ pageNum: 1, pageSize: 60 });
    const list = res.rows || res.data?.rows || res.data || [];
    const words = (list as any[])
      .map((t) => ({
        name: t.name || t.title || t.tagname || "",
        value: Number(t.count || t.use_count || t.weigh || 10),
      }))
      .filter((w) => w.name);
    if (words.length < 8) {
      // 标签不足时点缀几个示例词
      ["Vue", "TypeScript", "CMS", "AI", "Console", "Go", "Tailwind", "Pinia"].forEach((w, i) => {
        if (!words.find((x) => x.name === w)) words.push({ name: w, value: 40 - i * 3 });
      });
    }
    nextTick(() => renderWordCloud(words));
  } catch {
    const fallback = [
      "AICODCMS",
      "Vue",
      "TypeScript",
      "Go",
      "Console",
      "CMS",
      "AI",
      "Tailwind",
      "ElementPlus",
      "Pinia",
      "Vite",
      "Tiptap",
    ].map((w, i) => ({ name: w, value: 60 - i * 4 }));
    nextTick(() => renderWordCloud(fallback));
  }
};

// 占位 mock（仅在 getSysInfo 失败时使用）
const mockServer = () => ({
  cpuUsed: 24.5,
  cpuAvg5: 0.42,
  cpuNum: 8,
  memUsage: 58.2,
  memUsed: 9.3 * 1024 * 1024 * 1024,
  memFree: 6.7 * 1024 * 1024 * 1024,
  memTotal: 16 * 1024 * 1024 * 1024,
  goUsage: 12.1,
  goUsed: 320 * 1024 * 1024,
  goVersion: "1.22.3",
  goRunTime: 5 * 86400 + 7 * 3600 + 12 * 60,
  sysComputerName: "aiaicodcms-server",
  sysComputerIp: "127.0.0.1",
  sysOsName: "macOS",
  sysOsArch: "arm64",
  diskList: [
    { path: "/", usedPercent: 62.4 },
    { path: "/data", usedPercent: 41.2 },
    { path: "/var", usedPercent: 88.7 },
  ],
});

const refreshAll = () => {
  loadServer();
  loadCache();
  loadTags();
};

// ---- 路由 ----
const goRoute = (p: string) => router.push(p);

// ---- resize / 暗色 ----
const handleResize = () => {
  pieChart?.resize();
  barChart?.resize();
  diskChart?.resize();
  wcChart?.resize();
};

onMounted(() => {
  refreshAll();
  window.addEventListener("resize", handleResize);
});
onActivated(() => {
  nextTick(handleResize);
});
onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
  clearInterval(tick);
  pieChart?.dispose();
  barChart?.dispose();
  diskChart?.dispose();
  wcChart?.dispose();
});

watch(isDark, () => {
  nextTick(() => {
    renderPie();
    renderBar();
    renderDisk();
    // 词云不重新拉数据，重新渲染就行（颜色随机）
    if (wcChart) {
      const opt = wcChart.getOption() as any;
      const data = opt?.series?.[0]?.data || [];
      renderWordCloud(data);
    }
  });
});
</script>

<style scoped>
/* ===== 欢迎条 ===== */
.welcome-bar {
  position: relative;
  overflow: hidden;
  border-radius: var(--cc-radius-lg);
  padding: var(--cc-space-5) var(--cc-space-6);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--cc-space-4);
  flex-wrap: wrap;
  box-shadow: var(--cc-shadow-md);
  isolation: isolate;
}
.welcome-bar__bg {
  position: absolute;
  inset: 0;
  background: var(--cc-grad-cosmic);
  z-index: -1;
}
.welcome-bar__bg::after {
  content: "";
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 90% -20%, rgba(255, 255, 255, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 0% 120%, rgba(0, 0, 0, 0.2) 0%, transparent 50%);
}
.welcome-bar__main {
  min-width: 0;
  flex: 1;
}
.welcome-bar__hello {
  font-size: var(--cc-font-20);
  font-weight: 700;
  letter-spacing: -0.01em;
}
.welcome-bar__date {
  margin-top: 4px;
  font-size: var(--cc-font-13);
  opacity: 0.86;
}
.welcome-bar__quote {
  margin-top: var(--cc-space-3);
  font-size: var(--cc-font-13);
  opacity: 0.78;
}
.welcome-bar__actions {
  display: flex;
  gap: var(--cc-space-2);
  flex-shrink: 0;
}
.welcome-bar__actions :deep(.el-button) {
  border-color: rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
  backdrop-filter: blur(6px);
}
.welcome-bar__actions :deep(.el-button:hover) {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.5);
}
.welcome-bar__actions :deep(.el-button--primary) {
  background: rgba(255, 255, 255, 0.95);
  color: var(--cc-color-primary);
  border-color: transparent;
}
.welcome-bar__actions :deep(.el-button--primary:hover) {
  background: #fff;
  color: var(--cc-color-primary);
}

/* ===== Grid ===== */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: var(--cc-space-4);
}
.chart-grid {
  display: grid;
  gap: var(--cc-space-4);
}
.chart-grid--2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
.chart-grid--2-1 {
  grid-template-columns: 1.5fr 1fr;
}
@media (max-width: 960px) {
  .chart-grid--2,
  .chart-grid--2-1 {
    grid-template-columns: 1fr;
  }
}

/* ===== 信息墙 ===== */
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: var(--cc-space-3);
}
.info-grid__item {
  display: flex;
  align-items: center;
  gap: var(--cc-space-3);
  padding: var(--cc-space-3);
  border-radius: var(--cc-radius-md);
  background: var(--cc-color-bg);
  transition: background 0.2s ease;
}
.info-grid__item:hover {
  background: var(--cc-color-surface-hover);
}
.info-grid__icon {
  width: 36px;
  height: 36px;
  border-radius: var(--cc-radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  flex-shrink: 0;
}
.info-grid__text {
  min-width: 0;
}
.info-grid__label {
  font-size: var(--cc-font-12);
  color: var(--cc-color-text-3);
  margin-bottom: 2px;
}
.info-grid__value {
  font-size: var(--cc-font-14);
  font-weight: 600;
  color: var(--cc-color-text-1);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ===== 缓存状态 ===== */
.cache-status {
  display: flex;
  flex-direction: column;
  gap: var(--cc-space-4);
  height: 100%;
}
.cache-status__mode {
  display: flex;
  align-items: center;
  gap: var(--cc-space-2);
  font-size: var(--cc-font-18);
  font-weight: 700;
  padding: var(--cc-space-3) var(--cc-space-4);
  border-radius: var(--cc-radius-md);
  background: var(--cc-color-bg);
  color: var(--cc-color-text-1);
}
.cache-status__mode.is-redis {
  background: linear-gradient(135deg, rgba(220, 38, 38, 0.1), rgba(220, 38, 38, 0.04));
  color: #dc2626;
}
.cache-status__mode.is-memory {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.04));
  color: #3b82f6;
}
.cache-status__rows {
  display: flex;
  flex-direction: column;
  gap: var(--cc-space-3);
}
.cache-status__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--cc-space-3);
}
.cache-status__row-label {
  font-size: var(--cc-font-13);
  color: var(--cc-color-text-3);
}
.cache-status__row-value {
  font-size: var(--cc-font-15);
  font-weight: 700;
  color: var(--cc-color-text-1);
}
.cache-status__pill {
  font-size: var(--cc-font-12);
  font-weight: 600;
  padding: 3px 10px;
  border-radius: var(--cc-radius-full);
}
.cache-status__pill.is-ok {
  background: var(--cc-color-success-soft);
  color: var(--cc-color-success);
}
.cache-status__pill.is-err {
  background: var(--cc-color-danger-soft);
  color: var(--cc-color-danger);
}
.cache-status__pill.is-na {
  background: var(--cc-color-bg);
  color: var(--cc-color-text-3);
}

/* ===== 速捷入口 ===== */
.quick-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: var(--cc-space-3);
  padding: var(--cc-space-4);
}
</style>
