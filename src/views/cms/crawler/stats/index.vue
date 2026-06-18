<template>
  <div class="crawler-stats-page">
    <el-breadcrumb separator="→" class="mb15">
      <el-breadcrumb-item :to="{ path: '/' }"
        ><el-icon><HomeFilled /></el-icon> {{ $t("message.router.home") }}</el-breadcrumb-item
      >
      <el-breadcrumb-item>{{ $t("message.cms.tplList.breadcrumbCms") }}</el-breadcrumb-item>
      <el-breadcrumb-item>{{ $t("message.cms.crawlerStats") }}</el-breadcrumb-item>
    </el-breadcrumb>
    <header class="page-header">
      <h1 class="page-title">{{ $t("message.cms.crawlerStats") }}</h1>
    </header>

    <!-- 数字卡片 -->
    <el-row :gutter="12" class="mb15">
      <el-col :span="6" v-for="card in statCards" :key="card.label">
        <el-card shadow="never">
          <div class="stat-num" :style="{ color: card.color }">{{ card.count ?? "—" }}</div>
          <div class="stat-label">{{ card.label }}</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 上排: 爬虫占比环形图 + 来访趋势折线图 -->
    <el-row :gutter="12" class="mb15">
      <el-col :span="10">
        <el-card shadow="never">
          <div class="chart-header">{{ $t("message.cms.crawlerOverview") }}</div>
          <div ref="pieRef" style="height: 280px"></div>
        </el-card>
      </el-col>
      <el-col :span="14">
        <el-card shadow="never">
          <div class="chart-header">{{ $t("message.cms.crawlerTrend") }}</div>
          <div ref="trendRef" style="height: 280px"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 下排: Top 被爬文章条形图 + 热力表 -->
    <el-row :gutter="12">
      <el-col :span="14">
        <el-card shadow="never">
          <div class="chart-header">{{ $t("message.cms.crawlerTopArticles") }}</div>
          <div ref="topRef" style="height: 280px"></div>
        </el-card>
      </el-col>
      <el-col :span="10">
        <el-card shadow="never">
          <div class="chart-header">{{ $t("message.cms.crawlerHeatmap") }}</div>
          <div class="heatmap-body">
            <table class="heatmap-table" v-if="heatmapRows.length">
              <thead>
                <tr>
                  <th></th>
                  <th v-for="day in heatmapDays" :key="day">{{ day }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in heatmapRows" :key="row.bot_name">
                  <td class="heatmap-bot">{{ row.bot_name }}</td>
                  <td
                    v-for="cell in row.cells"
                    :key="cell.crawl_day"
                    class="heatmap-cell"
                    :style="{ backgroundColor: heatmapColor(cell.article_count) }"
                    :title="`${row.bot_name} ${cell.crawl_day}: ${cell.article_count} ${t('message.cms.crawler.articles')}`"
                  ></td>
                </tr>
              </tbody>
            </table>
            <div v-else class="heatmap-empty">{{ $t("message.cms.crawlerNoVisit") }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, onMounted, onUnmounted, nextTick } from "vue";
import { useI18n } from "vue-i18n";
import * as echarts from "echarts";
import { getOverview, getTrend, getTopArticles, getHeatmap } from "/@/api/cms/crawler";

export default defineComponent({
  name: "crawlerStats",
  setup() {
    const { t } = useI18n();
    const pieRef = ref<HTMLElement>();
    const trendRef = ref<HTMLElement>();
    const topRef = ref<HTMLElement>();

    const statCards = reactive([
      { label: "", count: null as number | null, key: "zeroSpider", color: "#409eff" },
      { label: "", count: null as number | null, key: "baiduMissing", color: "#DE2910" },
      { label: "", count: null as number | null, key: "googleMissing", color: "#4285F4" },
      { label: "", count: null as number | null, key: "bingMissing", color: "#008373" },
    ]);
    const heatmapRows = ref<any[]>([]);
    const heatmapDays = ref<number[]>([]);

    const BOT_COLORS: Record<string, string> = {
      google: "#4285F4",
      baidu: "#DE2910",
      bing: "#008373",
      bytespider: "#FF0050",
      sogou: "#FF4A00",
      yandexbot: "#FFCC00",
      "360spider": "#00B13E",
    };
    const BOT_LABELS: Record<string, string> = {
      google: "G",
      baidu: "Bd",
      bing: "Bi",
      bytespider: "By",
      sogou: "So",
      yandexbot: "Y",
    };

    let pieChart: any = null;
    let trendChart: any = null;
    let topChart: any = null;

    const heatmapColor = (v: number) => {
      if (v <= 0) return "#f5f5f5";
      if (v < 10) return "#dbeafe";
      if (v < 50) return "#93c5fd";
      if (v < 200) return "#3b82f6";
      return "#1d4ed8";
    };

    const loadData = async () => {
      try {
        // 概况
        const ov = await getOverview();
        if (ov?.code === 0 && ov.data) {
          const d = ov.data;
          statCards[0].label = t("message.cms.crawlerZeroSpider");
          statCards[1].label = t("message.cms.crawlerBaiduMissing");
          statCards[2].label = t("message.cms.crawlerGoogleMissing");
          statCards[3].label = t("message.cms.crawlerBingMissing");
          statCards[0].count = d.zero_spider;
          statCards[1].count = d.baidu_missing;
          statCards[2].count = d.google_missing;
          statCards[3].count = d.bing_missing;

          // 环形图
          if (d.pie_data?.length && pieRef.value) {
            const data = d.pie_data.map((p: any) => ({
              name: BOT_LABELS[p.bot_name] || p.bot_name,
              value: p.count,
              itemStyle: { color: BOT_COLORS[p.bot_name] || "#999" },
            }));
            nextTick(() => {
              if (!pieChart) pieChart = echarts.init(pieRef.value);
              pieChart.setOption({
                backgroundColor: "transparent",
                tooltip: {
                  trigger: "item",
                  formatter: `{b}: {c} ${t("message.cms.crawler.times")} ({d}%)`,
                },
                legend: { orient: "vertical", right: "5%", top: "center" },
                series: [
                  {
                    type: "pie",
                    radius: ["45%", "70%"],
                    center: ["40%", "50%"],
                    label: { show: false },
                    data,
                  },
                ],
              });
            });
          }
        }
      } catch (_) {}

      try {
        // 趋势
        const tr = await getTrend({ days: 30 });
        if (tr?.code === 0 && tr.data?.daily?.length && trendRef.value) {
          const daily = tr.data.daily;
          const xData = daily.map((d: any) => String(d.crawl_day).slice(4));
          const botMap: Record<string, number[]> = {};
          daily.forEach((d: any) => {
            d.bots.forEach((b: any) => {
              if (!botMap[b.bot_name]) botMap[b.bot_name] = Array(xData.length).fill(0);
            });
          });
          daily.forEach((d: any) => {
            const idx = xData.indexOf(String(d.crawl_day).slice(4));
            d.bots.forEach((b: any) => {
              if (botMap[b.bot_name])
                botMap[b.bot_name][idx] = (botMap[b.bot_name][idx] || 0) + b.article_count;
            });
          });
          const series = Object.entries(botMap).map(([name, data]) => ({
            name,
            type: "line",
            smooth: true,
            data,
            itemStyle: { color: BOT_COLORS[name] || "#999" },
          }));
          nextTick(() => {
            if (!trendChart) trendChart = echarts.init(trendRef.value);
            trendChart.setOption({
              backgroundColor: "transparent",
              tooltip: { trigger: "axis" },
              legend: { data: Object.keys(botMap) },
              grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
              xAxis: { type: "category", data: xData },
              yAxis: { type: "value" },
              series,
            });
          });
        }
      } catch (_) {}

      try {
        // Top 文章
        const tp = await getTopArticles({ limit: 20 });
        if (tp?.code === 0 && tp.data?.articles?.length && topRef.value) {
          const articles = tp.data.articles.slice(0, 10);
          nextTick(() => {
            if (!topChart) topChart = echarts.init(topRef.value);
            topChart.setOption({
              backgroundColor: "transparent",
              tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
              grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
              xAxis: { type: "value" },
              yAxis: { type: "category", data: articles.map((a: any) => a.title) },
              series: [
                {
                  type: "bar",
                  data: articles.map((a: any, i: number) => ({
                    value: a.count,
                    itemStyle: {
                      color: ["#4285F4", "#DE2910", "#008373", "#FF0050", "#FF6A00"][i % 5],
                    },
                  })),
                },
              ],
            });
          });
        }
      } catch (_) {}

      try {
        // 热力表
        const hm = await getHeatmap({ days: 7 });
        if (hm?.code === 0 && hm.data?.rows?.length) {
          heatmapRows.value = hm.data.rows;
          heatmapDays.value =
            hm.data.rows[0]?.cells?.map((c: any) => String(c.crawl_day).slice(4)) || [];
        }
      } catch (_) {}
    };

    onMounted(() => {
      loadData();
    });
    onUnmounted(() => {
      pieChart?.dispose();
      trendChart?.dispose();
      topChart?.dispose();
    });

    return { pieRef, trendRef, topRef, statCards, heatmapRows, heatmapDays, heatmapColor };
  },
});
</script>

<style scoped>
.crawler-stats-page {
  padding: 20px;
}
.page-header {
  margin-bottom: 16px;
}
.page-title {
  font-size: 20px;
  font-weight: 600;
}
.mb15 {
  margin-bottom: 15px;
}
.stat-num {
  font-size: 28px;
  font-weight: 700;
  color: var(--cc-color-primary);
  text-align: center;
}
.stat-label {
  font-size: 13px;
  color: #666;
  text-align: center;
  margin-top: 4px;
}
.chart-header {
  font-size: 14px;
  font-weight: 600;
}
.heatmap-body {
  min-height: 200px;
  overflow-x: auto;
}
.heatmap-table {
  border-collapse: collapse;
  width: 100%;
}
.heatmap-table th,
.heatmap-table td {
  border: 1px solid #e8e8e8;
  padding: 3px 6px;
  text-align: center;
  font-size: 11px;
}
.heatmap-table th {
  background: #fafafa;
  font-weight: 500;
}
.heatmap-bot {
  font-weight: 600;
  white-space: nowrap;
}
.heatmap-cell {
  min-width: 24px;
  height: 24px;
}
.heatmap-empty {
  color: #999;
  padding: 40px;
  text-align: center;
}
</style>
