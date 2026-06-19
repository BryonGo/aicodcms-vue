<template>
  <div class="pms-card-container fa-page">
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">{{
        $t("message.cms.sta.breadcrumbHome")
      }}</el-breadcrumb-item>
      <el-breadcrumb-item>{{ $t("message.cms.sta.breadcrumbCms") }}</el-breadcrumb-item>
      <el-breadcrumb-item>{{ $t("message.cms.sta.breadcrumbCurrent") }}</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- ======== 顶部状态栏 ======== -->
    <el-card shadow="never" style="margin-bottom: 12px">
      <el-row :gutter="16" align="middle">
        <el-col :span="5">
          <span style="color: var(--cc-color-text-2)">磁盘：</span>
          <span :style="{ color: health.disk_ok ? '#67c23a' : '#f56c6c' }">
            {{ health.disk_free_mb > 0 ? (health.disk_free_mb / 1024).toFixed(1) + ' GB' : '--' }}
          </span>
          <span style="color: var(--cc-color-text-3); font-size: 11px">
            / {{ (health.disk_total_mb / 1024).toFixed(0) }} GB
          </span>
        </el-col>
        <el-col :span="4">
          <span style="color: var(--cc-color-text-2)">脏数据：</span>
          <el-tag v-if="health.dirty_articles > 0 || health.dirty_lists > 0 || health.dirty_tags > 0" type="warning" size="small">
            文章{{ health.dirty_articles }} 列表{{ health.dirty_lists }} 标签{{ health.dirty_tags }}
          </el-tag>
          <span v-else style="color: var(--cc-color-text-3)">无</span>
        </el-col>
        <el-col :span="4">
          <template v-if="health.article_running || health.list_running || health.tag_running">
            <span style="color: #67c23a">
              <el-icon class="is-loading"><Loading /></el-icon>
              {{ health.article_running ? '文章' : '' }}
              {{ health.list_running ? '列表' : '' }}
              {{ health.tag_running ? '标签' : '' }}
            </span>
          </template>
          <span v-else style="color: var(--cc-color-text-3)">空闲</span>
        </el-col>
        <el-col :span="3">
          <span v-if="!health.can_start" style="color: #f56c6c; font-weight: 500">🚫 {{ health.block_reason }}</span>
        </el-col>
        <el-col :span="8" style="text-align: right">
          <el-button size="small" @click="refreshHealth" :loading="healthLoading">
            <el-icon><Refresh /></el-icon> 刷新
          </el-button>
        </el-col>
      </el-row>
    </el-card>

    <el-tabs v-model="activeTab" @tab-change="onTabChange">
      <!-- ======== 文章详情 ======== -->
      <el-tab-pane :label="$t('message.cms.sta.tabArticle')" name="article">
        <el-card shadow="never">
          <div class="sta-status-bar">
            <el-tag :type="statusTag(article.status)" size="large">
              {{ statusText(article.status) }}
            </el-tag>
            <span v-if="article.status === 'running'" style="margin-left: 12px; color: #67c23a">
              <el-icon class="is-loading"><Loading /></el-icon>
              {{ $t("message.cms.sta.statusGenerating") }}
            </span>
            <span v-if="article.status === 'running' && article.error_rate > 0.3" style="margin-left: 12px; color: #e6a23c">
              ⚠️ 错误率 {{ (article.error_rate * 100).toFixed(0) }}%
            </span>
          </div>

          <el-progress
            :percentage="article.percentage"
            :status="
              article.status === 'completed'
                ? 'success'
                : article.status === 'failed'
                  ? 'exception'
                  : ''
            "
            :text-inside="true"
            :stroke-width="24"
            style="margin: 20px 0"
          />

          <el-row :gutter="16" style="margin-top: 16px">
            <el-col :span="6">
              <el-statistic
                :title="$t('message.cms.sta.statGenerated')"
                :value="article.done + ' / ' + article.total"
              />
            </el-col>
            <el-col :span="6">
              <el-statistic :title="$t('message.cms.sta.statSpeed')" :value="formatSpeed(article.speed_per_sec)" />
            </el-col>
            <el-col :span="6">
              <el-statistic :title="$t('message.cms.sta.statRemaining')" :value="formatTime(article.remaining_sec)" />
            </el-col>
            <el-col :span="6">
              <el-statistic :title="$t('message.cms.sta.statErrors')" :value="article.errors">
                <template #suffix>
                  <el-tag v-if="article.errors > 0" type="danger" size="small">{{ article.errors }}</el-tag>
                </template>
              </el-statistic>
            </el-col>
          </el-row>

          <el-row :gutter="16" style="margin-top: 12px">
            <el-col :span="8">
              <el-statistic :title="$t('message.cms.sta.statElapsed')" :value="formatTime(article.elapsed_sec)" />
            </el-col>
            <el-col :span="8">
              <el-statistic :title="$t('message.cms.sta.statCurrentLang')" :value="article.current_lang || '--'" />
            </el-col>
            <el-col :span="8">
              <el-statistic :title="$t('message.cms.sta.statCurrentId')" :value="article.current_id || '--'" />
            </el-col>
          </el-row>

          <div style="margin-top: 20px">
            <el-button type="primary" @click="handleGenerate('article')" :loading="article.status === 'running'" :disabled="!health.can_start">
              {{ $t("message.cms.sta.btnGenerateArticle") }}
            </el-button>
            <el-button @click="handleStop" :disabled="article.status !== 'running'">
              {{ $t("message.cms.sta.btnStop") }}
            </el-button>
          </div>

          <!-- 错误清单 -->
          <div v-if="article.error_samples && article.error_samples.length" style="margin-top: 16px">
            <el-collapse>
              <el-collapse-item :title="`错误清单 (${article.error_samples.length})`">
                <el-table :data="article.error_samples" size="small" max-height="360" stripe>
                  <el-table-column prop="article_id" label="ID" width="90" />
                  <el-table-column prop="lang" label="语言" width="60" />
                  <el-table-column prop="error" label="错误信息" show-overflow-tooltip />
                  <el-table-column label="操作" width="100">
                    <template #default="{ row }">
                      <el-button size="small" @click="retryArticle(row)">重试</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </el-collapse-item>
            </el-collapse>
          </div>

          <!-- 历史记录 -->
          <div v-if="articleHistory.length" style="margin-top: 20px">
            <el-divider content-position="left">{{ $t("message.cms.sta.generateHistory") }}</el-divider>
            <div class="sta-history" v-for="h in [...articleHistory].reverse().slice(0, 5)" :key="h.started_at">
              <span>{{ formatDate(h.started_at) }}</span>
              <span>{{ h.done }}/{{ h.total }}</span>
              <span>{{ formatTime(h.elapsed_sec) }}</span>
              <el-tag :type="h.errors > 0 ? 'danger' : 'success'" size="small">{{ h.errors }} err</el-tag>
            </div>
          </div>
        </el-card>
      </el-tab-pane>

      <!-- ======== 栏目列表 ======== -->
      <el-tab-pane :label="$t('message.cms.sta.tabList')" name="list">
        <el-card shadow="never">
          <div class="sta-status-bar">
            <el-tag :type="statusTag(list.status)" size="large">{{ statusText(list.status) }}</el-tag>
          </div>
          <el-progress :percentage="list.percentage" :text-inside="true" :stroke-width="24" style="margin: 20px 0" />
          <el-row :gutter="16"><el-col :span="8"><el-statistic :title="$t('message.cms.sta.statGenerated')" :value="list.done + ' / ' + list.total" /></el-col><el-col :span="8"><el-statistic :title="$t('message.cms.sta.statSpeed')" :value="formatSpeed(list.speed_per_sec)" /></el-col><el-col :span="8"><el-statistic :title="$t('message.cms.sta.statErrors')" :value="list.errors" /></el-col></el-row>
          <div style="margin-top: 20px">
            <el-button type="primary" @click="handleGenerate('list')" :loading="list.status === 'running'" :disabled="!health.can_start">{{ $t("message.cms.sta.btnGenerateList") }}</el-button>
            <el-button @click="handleStop" :disabled="list.status !== 'running'">{{ $t("message.cms.sta.btnStop") }}</el-button>
          </div>
        </el-card>
      </el-tab-pane>

      <!-- ======== Tag列表 ======== -->
      <el-tab-pane :label="$t('message.cms.sta.tabTag')" name="tag">
        <el-card shadow="never">
          <div class="sta-status-bar"><el-tag :type="statusTag(tag.status)" size="large">{{ statusText(tag.status) }}</el-tag></div>
          <el-progress :percentage="tag.percentage" :text-inside="true" :stroke-width="24" style="margin: 20px 0" />
          <el-row :gutter="16"><el-col :span="8"><el-statistic :title="$t('message.cms.sta.statGenerated')" :value="tag.done + ' / ' + tag.total" /></el-col><el-col :span="8"><el-statistic :title="$t('message.cms.sta.statSpeed')" :value="formatSpeed(tag.speed_per_sec)" /></el-col><el-col :span="8"><el-statistic :title="$t('message.cms.sta.statErrors')" :value="tag.errors" /></el-col></el-row>
          <div style="margin-top: 20px">
            <el-button type="primary" @click="handleGenerate('tag')" :loading="tag.status === 'running'" :disabled="!health.can_start">{{ $t("message.cms.sta.btnGenerateTag") }}</el-button>
            <el-button @click="handleStop" :disabled="tag.status !== 'running'">{{ $t("message.cms.sta.btnStop") }}</el-button>
          </div>
        </el-card>
      </el-tab-pane>

      <!-- ======== 维护 ======== -->
      <el-tab-pane label="维护" name="maintenance">
        <el-card shadow="never">
          <template v-if="diskInfo">
            <el-descriptions :column="2" border size="small">
              <el-descriptions-item label="输出目录">{{ diskInfo.root_dir }}</el-descriptions-item>
              <el-descriptions-item label="文件数">{{ diskInfo.total_files?.toLocaleString() }}</el-descriptions-item>
              <el-descriptions-item label="占用空间">{{ diskInfo.total_size_mb?.toFixed(1) }} MB</el-descriptions-item>
              <el-descriptions-item label="磁盘剩余">{{ (diskInfo.free_mb / 1024).toFixed(1) }} GB</el-descriptions-item>
              <el-descriptions-item label="孤文件">{{ diskInfo.orphan_files }} 个 ({{ diskInfo.orphan_size_mb?.toFixed(1) }} MB)</el-descriptions-item>
              <el-descriptions-item label="磁盘使用率">{{ diskInfo.usage_percent?.toFixed(1) }}%</el-descriptions-item>
            </el-descriptions>

            <div style="margin-top: 16px">
              <el-button @click="fetchDiskInfo" :loading="diskLoading">重新扫描</el-button>
              <el-button v-if="diskInfo.orphan_files > 0" type="danger" @click="handleCleanOrphans" :loading="cleaning">
                清理 {{ diskInfo.orphan_files }} 个孤文件
              </el-button>
            </div>
          </template>
          <div v-else style="text-align: center; padding: 40px; color: var(--cc-color-text-3)">
            点击"重新扫描"查看磁盘统计
          </div>
        </el-card>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";
import { ElMessage, ElMessageBox } from "element-plus";
import { Loading, Refresh } from "@element-plus/icons-vue";

const { t } = useI18n();
import {
  getStaProgress,
  getStaHistory,
  getStaHealth,
  getDirtyCount,
  getDiskInfo,
  cleanOrphans,
  generateArticles,
  generateLists,
  generateTags,
  stopGenerate,
  regenerateArticle,
} from "/@/api/cms/sta";

interface ErrorSample {
  article_id: number;
  lang: string;
  error: string;
}

interface Snapshot {
  status: string;
  total: number;
  done: number;
  percentage: number;
  current_lang: string;
  current_id: number;
  errors: number;
  last_error: string;
  error_samples?: ErrorSample[];
  error_rate?: number;
  started_at: number;
  updated_at: number;
  elapsed_sec: number;
  remaining_sec: number;
  speed_per_sec: number;
}

interface HealthData {
  disk_free_mb: number;
  disk_total_mb: number;
  disk_usage_percent: number;
  disk_ok: boolean;
  article_running: boolean;
  list_running: boolean;
  tag_running: boolean;
  dirty_articles: number;
  dirty_lists: number;
  dirty_tags: number;
  article_error_rate: number;
  list_error_rate: number;
  tag_error_rate: number;
  can_start: boolean;
  block_reason: string;
}

interface DiskInfoData {
  root_dir: string;
  total_files: number;
  total_size_mb: number;
  free_mb: number;
  total_mb: number;
  usage_percent: number;
  orphan_files: number;
  orphan_size_mb: number;
}

const emptySnap = (): Snapshot => ({
  status: "idle", total: 0, done: 0, percentage: 0,
  current_lang: "", current_id: 0, errors: 0, last_error: "",
  error_samples: [], error_rate: 0,
  started_at: 0, updated_at: 0, elapsed_sec: 0, remaining_sec: 0, speed_per_sec: 0,
});

const emptyHealth = (): HealthData => ({
  disk_free_mb: 0, disk_total_mb: 0, disk_usage_percent: 0, disk_ok: true,
  article_running: false, list_running: false, tag_running: false,
  dirty_articles: 0, dirty_lists: 0, dirty_tags: 0,
  article_error_rate: 0, list_error_rate: 0, tag_error_rate: 0,
  can_start: true, block_reason: "",
});

const activeTab = ref("article");
const article = ref<Snapshot>(emptySnap());
const list = ref<Snapshot>(emptySnap());
const tag = ref<Snapshot>(emptySnap());
const health = ref<HealthData>(emptyHealth());
const diskInfo = ref<DiskInfoData | null>(null);

const articleHistory = ref<Snapshot[]>([]);
const listHistory = ref<Snapshot[]>([]);
const tagHistory = ref<Snapshot[]>([]);

const healthLoading = ref(false);
const diskLoading = ref(false);
const cleaning = ref(false);

let pollTimer: ReturnType<typeof setInterval> | null = null;

const statusTag = (status: string) => {
  const map: Record<string, string> = { idle: "info", running: "success", stopping: "warning", completed: "", failed: "danger" };
  return map[status] || "info";
};

const statusText = (status: string) => {
  const map: Record<string, string> = {
    idle: t("message.cms.sta.statusIdle"),
    running: t("message.cms.sta.statusRunning"),
    stopping: t("message.cms.sta.statusStopping"),
    completed: t("message.cms.sta.statusCompleted"),
    failed: t("message.cms.sta.statusFailed"),
  };
  return map[status] || status;
};

const formatTime = (sec: number) => {
  if (sec <= 0) return "--";
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
};

const formatSpeed = (s: number) => {
  if (s <= 0) return "--";
  return s >= 1 ? `${s.toFixed(1)}/s` : `${(s * 60).toFixed(1)}/min`;
};

const formatDate = (ts: number) => {
  if (!ts) return "--";
  return new Date(ts * 1000).toLocaleString();
};

const fetchProgress = async () => {
  try {
    const res = await getStaProgress();
    if (res?.data?.article) article.value = res.data.article;
    if (res?.data?.list) list.value = res.data.list;
    if (res?.data?.tag) tag.value = res.data.tag;
  } catch { /* ignore poll errors */ }
};

const fetchHistory = async () => {
  try {
    const res = await getStaHistory();
    if (res?.data?.article) articleHistory.value = res.data.article;
    if (res?.data?.list) listHistory.value = res.data.list;
    if (res?.data?.tag) tagHistory.value = res.data.tag;
  } catch { /* ignore */ }
};

const fetchHealth = async () => {
  try {
    const res = await getStaHealth();
    if (res?.data) health.value = res.data;
  } catch { /* ignore */ }
};

const fetchDiskInfo = async () => {
  diskLoading.value = true;
  try {
    const res = await getDiskInfo();
    if (res?.data) diskInfo.value = res.data;
  } catch {
    ElMessage.error("获取磁盘信息失败");
  } finally {
    diskLoading.value = false;
  }
};

const refreshHealth = async () => {
  healthLoading.value = true;
  await fetchHealth();
  await fetchDirtyCount();
  healthLoading.value = false;
};

const fetchDirtyCount = async () => {
  try {
    const res = await getDirtyCount();
    if (res?.data) {
      health.value.dirty_articles = res.data.articles;
      health.value.dirty_lists = res.data.lists;
      health.value.dirty_tags = res.data.tags;
    }
  } catch { /* ignore */ }
};

const handleCleanOrphans = async () => {
  try {
    await ElMessageBox.confirm(`确定要删除 ${diskInfo.value?.orphan_files} 个孤文件吗？`, "确认清理", { type: "warning" });
  } catch {
    return;
  }
  cleaning.value = true;
  try {
    const res = await cleanOrphans();
    ElMessage.success(`清理完成：${res.data.removed} 个文件已删除，${res.data.errors} 个失败`);
    fetchDiskInfo();
  } catch {
    ElMessage.error("清理失败");
  } finally {
    cleaning.value = false;
  }
};

const retryArticle = async (row: ErrorSample) => {
  try {
    await regenerateArticle(row.article_id, row.lang);
    ElMessage.success(`文章 ${row.article_id} (${row.lang}) 重生成已触发`);
  } catch (err: any) {
    ElMessage.error(err?.msg || "重生成失败");
  }
};

const startPolling = () => {
  if (pollTimer) return;
  fetchProgress();
  fetchHistory();
  fetchHealth();
  fetchDirtyCount();
  pollTimer = setInterval(() => {
    fetchProgress();
    fetchHealth();
  }, 1000);
};

const stopPolling = () => {
  if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
};

const handleGenerate = async (type: string) => {
  try {
    if (type === "article") await generateArticles();
    else if (type === "list") await generateLists();
    else if (type === "tag") await generateTags();
    ElMessage.success(t("message.cms.sta.msgStarted"));
  } catch (err: any) {
    ElMessage.error(err?.msg || t("message.cms.sta.msgStartFailed"));
  }
};

const handleStop = async () => {
  try {
    await stopGenerate();
    ElMessage.success(t("message.cms.sta.mstopSignal"));
  } catch (err: any) {
    ElMessage.error(err?.msg || t("message.cms.sta.msgStopFailed"));
  }
};

const onTabChange = (name: string) => {
  fetchProgress();
  if (name === "maintenance") fetchDiskInfo();
};

onMounted(() => startPolling());
onUnmounted(() => stopPolling());
</script>

<style scoped>
.sta-status-bar { display: flex; align-items: center; margin-bottom: 8px; }
.pms-card-container { max-width: 1400px; margin: 0 auto; }
@media (min-width: 1441px) { .pms-card-container { max-width: none !important; padding: 0 40px; } }
.sta-history { display: flex; align-items: center; gap: 16px; padding: 6px 0; font-size: var(--cc-font-13); color: var(--cc-color-text-2); border-bottom: 1px solid var(--cc-color-border-light); }
.sta-history:last-child { border-bottom: none; }
</style>
