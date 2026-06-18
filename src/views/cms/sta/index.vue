<template>
  <div class="pms-card-container fa-page">
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">{{
        $t("message.cms.sta.breadcrumbHome")
      }}</el-breadcrumb-item>
      <el-breadcrumb-item>{{ $t("message.cms.sta.breadcrumbCms") }}</el-breadcrumb-item>
      <el-breadcrumb-item>{{ $t("message.cms.sta.breadcrumbCurrent") }}</el-breadcrumb-item>
    </el-breadcrumb>

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
              <el-statistic
                :title="$t('message.cms.sta.statSpeed')"
                :value="formatSpeed(article.speed_per_sec)"
              />
            </el-col>
            <el-col :span="6">
              <el-statistic
                :title="$t('message.cms.sta.statRemaining')"
                :value="formatTime(article.remaining_sec)"
              />
            </el-col>
            <el-col :span="6">
              <el-statistic :title="$t('message.cms.sta.statErrors')" :value="article.errors">
                <template #suffix>
                  <el-tag v-if="article.errors > 0" type="danger" size="small">{{
                    article.errors
                  }}</el-tag>
                </template>
              </el-statistic>
            </el-col>
          </el-row>

          <el-row :gutter="16" style="margin-top: 12px">
            <el-col :span="8">
              <el-statistic
                :title="$t('message.cms.sta.statElapsed')"
                :value="formatTime(article.elapsed_sec)"
              />
            </el-col>
            <el-col :span="8">
              <el-statistic
                :title="$t('message.cms.sta.statCurrentLang')"
                :value="article.current_lang || '--'"
              />
            </el-col>
            <el-col :span="8">
              <el-statistic
                :title="$t('message.cms.sta.statCurrentId')"
                :value="article.current_id || '--'"
              />
            </el-col>
          </el-row>

          <div v-if="article.last_error" style="margin-top: 12px; color: #f56c6c">
            {{ $t("message.cms.sta.lastError") }}: {{ article.last_error }}
          </div>

          <div style="margin-top: 20px">
            <el-button
              type="primary"
              @click="handleGenerate('article')"
              :loading="article.status === 'running'"
            >
              {{ $t("message.cms.sta.btnGenerateArticle") }}
            </el-button>
            <el-button @click="handleStop" :disabled="article.status !== 'running'">
              {{ $t("message.cms.sta.btnStop") }}
            </el-button>
          </div>

          <!-- 历史记录 -->
          <div v-if="articleHistory.length" style="margin-top: 20px">
            <el-divider content-position="left">{{
              $t("message.cms.sta.generateHistory")
            }}</el-divider>
            <div
              class="sta-history"
              v-for="h in [...articleHistory].reverse().slice(0, 5)"
              :key="h.started_at"
            >
              <span>{{ formatDate(h.started_at) }}</span>
              <span>{{ h.done }}/{{ h.total }}</span>
              <span>{{ formatTime(h.elapsed_sec) }}</span>
              <el-tag :type="h.errors > 0 ? 'danger' : 'success'" size="small"
                >{{ h.errors }} err</el-tag
              >
            </div>
          </div>
        </el-card>
      </el-tab-pane>

      <!-- ======== 栏目列表 ======== -->
      <el-tab-pane :label="$t('message.cms.sta.tabList')" name="list">
        <el-card shadow="never">
          <div class="sta-status-bar">
            <el-tag :type="statusTag(list.status)" size="large">
              {{ statusText(list.status) }}
            </el-tag>
          </div>

          <el-progress
            :percentage="list.percentage"
            :status="
              list.status === 'completed' ? 'success' : list.status === 'failed' ? 'exception' : ''
            "
            :text-inside="true"
            :stroke-width="24"
            style="margin: 20px 0"
          />

          <el-row :gutter="16" style="margin-top: 16px">
            <el-col :span="8">
              <el-statistic
                :title="$t('message.cms.sta.statGenerated')"
                :value="list.done + ' / ' + list.total"
              />
            </el-col>
            <el-col :span="8">
              <el-statistic
                :title="$t('message.cms.sta.statSpeed')"
                :value="formatSpeed(list.speed_per_sec)"
              />
            </el-col>
            <el-col :span="8">
              <el-statistic :title="$t('message.cms.sta.statErrors')" :value="list.errors" />
            </el-col>
          </el-row>

          <div style="margin-top: 20px">
            <el-button
              type="primary"
              @click="handleGenerate('list')"
              :loading="list.status === 'running'"
            >
              {{ $t("message.cms.sta.btnGenerateList") }}
            </el-button>
            <el-button @click="handleStop" :disabled="list.status !== 'running'">
              {{ $t("message.cms.sta.btnStop") }}
            </el-button>
          </div>

          <div v-if="listHistory.length" style="margin-top: 20px">
            <el-divider content-position="left">{{
              $t("message.cms.sta.generateHistory")
            }}</el-divider>
            <div
              class="sta-history"
              v-for="h in [...listHistory].reverse().slice(0, 5)"
              :key="h.started_at"
            >
              <span>{{ formatDate(h.started_at) }}</span>
              <span>{{ h.done }}/{{ h.total }}</span>
              <span>{{ formatTime(h.elapsed_sec) }}</span>
              <el-tag :type="h.errors > 0 ? 'danger' : 'success'" size="small"
                >{{ h.errors }} err</el-tag
              >
            </div>
          </div>
        </el-card>
      </el-tab-pane>

      <!-- ======== Tag列表 ======== -->
      <el-tab-pane :label="$t('message.cms.sta.tabTag')" name="tag">
        <el-card shadow="never">
          <div class="sta-status-bar">
            <el-tag :type="statusTag(tag.status)" size="large">
              {{ statusText(tag.status) }}
            </el-tag>
          </div>

          <el-progress
            :percentage="tag.percentage"
            :status="
              tag.status === 'completed' ? 'success' : tag.status === 'failed' ? 'exception' : ''
            "
            :text-inside="true"
            :stroke-width="24"
            style="margin: 20px 0"
          />

          <el-row :gutter="16" style="margin-top: 16px">
            <el-col :span="8">
              <el-statistic
                :title="$t('message.cms.sta.statGenerated')"
                :value="tag.done + ' / ' + tag.total"
              />
            </el-col>
            <el-col :span="8">
              <el-statistic
                :title="$t('message.cms.sta.statSpeed')"
                :value="formatSpeed(tag.speed_per_sec)"
              />
            </el-col>
            <el-col :span="8">
              <el-statistic :title="$t('message.cms.sta.statErrors')" :value="tag.errors" />
            </el-col>
          </el-row>

          <div style="margin-top: 20px">
            <el-button
              type="primary"
              @click="handleGenerate('tag')"
              :loading="tag.status === 'running'"
            >
              {{ $t("message.cms.sta.btnGenerateTag") }}
            </el-button>
            <el-button @click="handleStop" :disabled="tag.status !== 'running'">
              {{ $t("message.cms.sta.btnStop") }}
            </el-button>
          </div>

          <div v-if="tagHistory.length" style="margin-top: 20px">
            <el-divider content-position="left">{{
              $t("message.cms.sta.generateHistory")
            }}</el-divider>
            <div
              class="sta-history"
              v-for="h in [...tagHistory].reverse().slice(0, 5)"
              :key="h.started_at"
            >
              <span>{{ formatDate(h.started_at) }}</span>
              <span>{{ h.done }}/{{ h.total }}</span>
              <span>{{ formatTime(h.elapsed_sec) }}</span>
              <el-tag :type="h.errors > 0 ? 'danger' : 'success'" size="small"
                >{{ h.errors }} err</el-tag
              >
            </div>
          </div>
        </el-card>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";
import { ElMessage } from "element-plus";
import { Loading } from "@element-plus/icons-vue";

const { t } = useI18n();
import {
  getStaProgress,
  getStaHistory,
  generateArticles,
  generateLists,
  generateTags,
  stopGenerate,
} from "/@/api/cms/sta";

interface Snapshot {
  status: string;
  total: number;
  done: number;
  percentage: number;
  current_lang: string;
  current_id: number;
  errors: number;
  last_error: string;
  started_at: number;
  updated_at: number;
  elapsed_sec: number;
  remaining_sec: number;
  speed_per_sec: number;
}

const emptySnap = (): Snapshot => ({
  status: "idle",
  total: 0,
  done: 0,
  percentage: 0,
  current_lang: "",
  current_id: 0,
  errors: 0,
  last_error: "",
  started_at: 0,
  updated_at: 0,
  elapsed_sec: 0,
  remaining_sec: 0,
  speed_per_sec: 0,
});

const activeTab = ref("article");

// 使用 ref() 替代 reactive()，确保 .value = 赋值触发视图更新
const article = ref<Snapshot>(emptySnap());
const list = ref<Snapshot>(emptySnap());
const tag = ref<Snapshot>(emptySnap());

// 历史列表
const articleHistory = ref<Snapshot[]>([]);
const listHistory = ref<Snapshot[]>([]);
const tagHistory = ref<Snapshot[]>([]);

let pollTimer: ReturnType<typeof setInterval> | null = null;

const statusTag = (status: string) => {
  const map: Record<string, string> = {
    idle: "info",
    running: "success",
    stopping: "warning",
    completed: "",
    failed: "danger",
  };
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
  if (h > 0) return t("message.cms.sta.fmtHours", { h, m });
  return t("message.cms.sta.fmtMinutes", { m });
};

const formatSpeed = (s: number) => {
  if (s <= 0) return "--";
  return s >= 1
    ? t("message.cms.sta.fmtPerSecond", { s: s.toFixed(1) })
    : t("message.cms.sta.fmtPerMinute", { s: (s * 60).toFixed(1) });
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
  } catch {
    // 轮询中忽略错误
  }
};

const fetchHistory = async () => {
  try {
    const res = await getStaHistory();
    if (res?.data?.article) articleHistory.value = res.data.article;
    if (res?.data?.list) listHistory.value = res.data.list;
    if (res?.data?.tag) tagHistory.value = res.data.tag;
  } catch {
    // 忽略
  }
};

const startPolling = () => {
  if (pollTimer) return;
  fetchProgress();
  fetchHistory();
  pollTimer = setInterval(fetchProgress, 1000);
};

const stopPolling = () => {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
};

const handleGenerate = async (type: string) => {
  try {
    if (type === "article") {
      await generateArticles();
    } else if (type === "list") {
      await generateLists();
    } else if (type === "tag") {
      await generateTags();
    }
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

const onTabChange = () => {
  fetchProgress();
};

onMounted(() => {
  startPolling();
});

onUnmounted(() => {
  stopPolling();
});
</script>

<style scoped>
.sta-status-bar {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}
.pms-card-container {
  max-width: 1400px;
  margin: 0 auto;
}
@media (min-width: 1441px) {
  .pms-card-container {
    max-width: none !important;
    padding: 0 40px;
  }
}
.sta-history {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 6px 0;
  font-size: var(--cc-font-13);
  color: var(--cc-color-text-2);
  border-bottom: 1px solid var(--cc-color-border-light);
}
.sta-history:last-child {
  border-bottom: none;
}
</style>
