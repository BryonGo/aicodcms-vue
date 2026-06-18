<template>
  <div class="mq-dashboard">
    <!-- ====== Header ====== -->
    <header class="mq-header">
      <div class="mq-header-left">
        <div class="mq-logo">
          <span class="mq-logo-icon">◈</span>
          <h1 class="mq-logo-text">Message Queue</h1>
        </div>
        <div class="mq-status" :class="{ online: healthy, offline: healthy === false }">
          <span class="mq-status-dot"></span>
          <span class="mq-status-text">
            {{
              healthy === null
                ? "--"
                : healthy
                  ? $t("message.addon_mq.healthPass")
                  : $t("message.addon_mq.healthFail")
            }}
          </span>
        </div>
      </div>
      <div class="mq-header-right">
        <button class="mq-btn mq-btn-ghost" @click="checkHealth">
          <span class="mq-btn-icon">⚕</span>
          {{ $t("message.addon_mq.healthCheck") }}
        </button>
        <button class="mq-btn mq-btn-accent" :disabled="loading" @click="fetchData">
          <span class="mq-btn-icon" :class="{ spin: loading }">⟳</span>
          {{ $t("message.common.refresh") }}
        </button>
      </div>
    </header>

    <!-- ====== Stats Grid ====== -->
    <section class="mq-stats">
      <div class="mq-stat-card">
        <div class="mq-stat-icon adapter">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="2" width="20" height="8" rx="2" />
            <rect x="2" y="14" width="20" height="8" rx="2" />
            <circle cx="6" cy="6" r="1" fill="currentColor" />
            <circle cx="6" cy="18" r="1" fill="currentColor" />
          </svg>
        </div>
        <div class="mq-stat-body">
          <span class="mq-stat-label">{{ $t("message.addon_mq.adapter") }}</span>
          <span class="mq-stat-value adapter-color">{{ stats.adapter || "--" }}</span>
        </div>
      </div>

      <div class="mq-stat-card">
        <div class="mq-stat-icon pending">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>
        <div class="mq-stat-body">
          <span class="mq-stat-label">{{ $t("message.addon_mq.pending") }}</span>
          <span class="mq-stat-value pending-color">{{ stats.total }}</span>
        </div>
      </div>

      <div class="mq-stat-card">
        <div class="mq-stat-icon topics">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
        </div>
        <div class="mq-stat-body">
          <span class="mq-stat-label">Topics</span>
          <span class="mq-stat-value topics-color">{{ Object.keys(stats.topics).length }}</span>
        </div>
      </div>

      <div class="mq-stat-card">
        <div class="mq-stat-icon consumers">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </div>
        <div class="mq-stat-body">
          <span class="mq-stat-label">{{ $t("message.addon_mq.consumer") }}</span>
          <span class="mq-stat-value consumers-color">{{ stats.consumers }}</span>
        </div>
      </div>
    </section>

    <!-- ====== Topic Table ====== -->
    <section class="mq-panel" v-if="topics.length > 0">
      <div class="mq-panel-header">
        <h2 class="mq-panel-title">Topic Registry</h2>
        <span class="mq-panel-badge">{{ topics.length }} active</span>
      </div>
      <div class="mq-table-wrap">
        <table class="mq-table">
          <thead>
            <tr>
              <th class="col-topic">Topic</th>
              <th class="col-len">Queue Depth</th>
              <th class="col-status">Status</th>
              <th class="col-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="topic in topics" :key="topic.name" class="mq-table-row">
              <td class="col-topic">
                <div class="topic-cell">
                  <span class="topic-dot" :class="topic.len > 0 ? 'hot' : 'cold'"></span>
                  <code class="topic-name">{{ topic.name }}</code>
                </div>
              </td>
              <td class="col-len">
                <div class="len-cell">
                  <div class="len-bar-track">
                    <div
                      class="len-bar-fill"
                      :class="lenBarClass(topic.len)"
                      :style="{ width: lenBarWidth(topic.len) }"
                    ></div>
                  </div>
                  <span class="len-value" :class="lenBarClass(topic.len)">{{ topic.len }}</span>
                </div>
              </td>
              <td class="col-status">
                <span class="status-tag" :class="topic.len > 0 ? 'busy' : 'idle'">
                  {{ topic.len > 0 ? "Active" : "Idle" }}
                </span>
              </td>
              <td class="col-actions">
                <button class="mq-btn mq-btn-sm mq-btn-primary" @click="goToMessages(topic.name)">
                  <span class="mq-btn-icon">⊞</span>
                  {{ $t("message.addon_mq.peekMessages") }}
                </button>
                <button
                  class="mq-btn mq-btn-sm mq-btn-danger"
                  :disabled="topic.len === 0"
                  @click="handleClear(topic.name)"
                >
                  {{ $t("message.addon_mq.clearTopic") }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- ====== Empty State ====== -->
    <section class="mq-empty" v-else-if="!loading">
      <div class="mq-empty-icon">∅</div>
      <p class="mq-empty-text">{{ $t("message.addon_mq.noTopic") }}</p>
    </section>

    <!-- ====== Footer Info ====== -->
    <footer class="mq-footer">
      <span>Adaptive Peek · Real-time Queue Monitoring</span>
      <span class="mq-footer-dot">·</span>
      <span>Count capped at 500 per topic</span>
    </footer>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, onMounted, computed } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  getMQStats,
  getMQTopics,
  clearMQTopic,
  checkMQHealth,
  type MQStats,
  type MQTopic,
} from "/@/api/addon/mq";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";

export default defineComponent({
  name: "mqIndex",
  setup() {
    const { t } = useI18n();
    const router = useRouter();
    const loading = ref(false);
    const healthy = ref<boolean | null>(null);
    const stats = reactive<MQStats>({ adapter: "", topics: {}, total: 0, consumers: 0 });
    const topics = ref<MQTopic[]>([]);

    // Max len across all topics for progress bar scaling
    const maxLen = computed(() => {
      let m = 1;
      for (const t of topics.value) {
        if (t.len > m) m = t.len;
      }
      return m;
    });

    const lenBarWidth = (len: number) => {
      if (maxLen.value === 0) return "0%";
      return `${Math.round((len / maxLen.value) * 100)}%`;
    };

    const lenBarClass = (len: number) => {
      if (len === 0) return "idle";
      if (len < 10) return "low";
      if (len < 100) return "mid";
      return "high";
    };

    const fetchData = async () => {
      loading.value = true;
      try {
        const [statsRes, topicsRes] = await Promise.all([getMQStats(), getMQTopics()]);
        if (statsRes?.data) {
          Object.assign(stats, statsRes.data);
        }
        if (topicsRes?.data) {
          topics.value = topicsRes.data.list || [];
        }
      } catch {
        ElMessage.error(t("message.addon_mq.dataError"));
      } finally {
        loading.value = false;
      }
    };

    const checkHealth = async () => {
      try {
        const res = await checkMQHealth();
        healthy.value = !!res?.data?.ok;
        ElMessage[healthy.value ? "success" : "error"](
          healthy.value ? t("message.addon_mq.healthPass") : t("message.addon_mq.healthFail"),
        );
      } catch {
        healthy.value = false;
        ElMessage.error(t("message.addon_mq.healthFail"));
      }
    };

    const handleClear = async (name: string) => {
      try {
        await ElMessageBox.confirm(
          t("message.addon_mq.clearConfirm", { name }),
          t("message.addon_mq.clearTopic"),
          {
            type: "warning",
            confirmButtonText: "OK",
            cancelButtonText: t("message.common.cancel"),
          },
        );
        await clearMQTopic(name);
        ElMessage.success(t("message.addon_mq.clearSuccess", { name }));
        fetchData();
      } catch {
        // cancelled or failed
        if (typeof arguments[0] !== "string") {
          ElMessage.error(t("message.addon_mq.clearFailed"));
        }
      }
    };

    const goToMessages = (topic: string) => {
      router.push({ path: "/addon/mq/messages", query: { topic } });
    };

    onMounted(() => {
      checkHealth();
      fetchData();
    });

    return {
      stats,
      topics,
      loading,
      healthy,
      maxLen,
      lenBarWidth,
      lenBarClass,
      fetchData,
      checkHealth,
      handleClear,
      goToMessages,
    };
  },
});
</script>

<style scoped>
/* ==================== Variables ==================== */
.mq-dashboard {
  --mq-bg: #090d13;
  --mq-surface: #11161d;
  --mq-surface-hover: #161c26;
  --mq-border: #1c2330;
  --mq-border-light: #252d3a;
  --mq-text: #c4cdd8;
  --mq-text-dim: #5a6474;
  --mq-text-bright: #e8edf3;
  --mq-accent: #00d4aa;
  --mq-accent-dim: rgba(0, 212, 170, 0.12);
  --mq-amber: #f0a040;
  --mq-amber-dim: rgba(240, 160, 64, 0.12);
  --mq-rose: #e0556a;
  --mq-rose-dim: rgba(224, 85, 106, 0.12);
  --mq-blue: #60a5fa;
  --mq-blue-dim: rgba(96, 165, 250, 0.12);
  --mq-adapter: #a78bfa;
  --mq-radius: 10px;
  --mq-radius-sm: 6px;
  --mq-font-mono: "JetBrains Mono", "Fira Code", "SF Mono", "Cascadia Code", monospace;

  min-height: calc(100vh - 100px);
  padding: 28px 32px;
  background: var(--mq-bg);
  color: var(--mq-text);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

/* ==================== Header ==================== */
.mq-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28px;
}

.mq-header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.mq-logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.mq-logo-icon {
  font-size: 22px;
  color: var(--mq-accent);
  filter: drop-shadow(0 0 8px rgba(0, 212, 170, 0.35));
}

.mq-logo-text {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--mq-text-bright);
  letter-spacing: -0.3px;
}

/* Status indicator */
.mq-status {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 4px 12px 4px 8px;
  border-radius: 20px;
  background: var(--mq-surface);
  border: 1px solid var(--mq-border);
  font-size: 12px;
  font-weight: 500;
  color: var(--mq-text-dim);
}

.mq-status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--mq-text-dim);
}

.mq-status.online .mq-status-dot {
  background: var(--mq-accent);
  box-shadow: 0 0 6px var(--mq-accent);
  animation: statusPulse 2s ease-in-out infinite;
}

.mq-status.offline .mq-status-dot {
  background: var(--mq-rose);
  box-shadow: 0 0 6px var(--mq-rose);
}

.mq-status.online .mq-status-text {
  color: var(--mq-accent);
}
.mq-status.offline .mq-status-text {
  color: var(--mq-rose);
}

@keyframes statusPulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
}

/* Header buttons */
.mq-header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.mq-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: 1px solid var(--mq-border);
  border-radius: var(--mq-radius-sm);
  background: var(--mq-surface);
  color: var(--mq-text);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}
.mq-btn:hover {
  background: var(--mq-surface-hover);
  border-color: var(--mq-border-light);
  color: var(--mq-text-bright);
}
.mq-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.mq-btn-accent {
  border-color: var(--mq-accent);
  color: var(--mq-accent);
}
.mq-btn-accent:hover {
  background: var(--mq-accent-dim);
}
.mq-btn-ghost {
  border-color: transparent;
  background: transparent;
}
.mq-btn-ghost:hover {
  background: var(--mq-surface);
}
.mq-btn-sm {
  padding: 5px 10px;
  font-size: 12px;
  border-radius: 5px;
}
.mq-btn-primary {
  border-color: var(--mq-accent);
  color: var(--mq-accent);
}
.mq-btn-primary:hover {
  background: var(--mq-accent-dim);
}
.mq-btn-danger {
  color: var(--mq-rose);
}
.mq-btn-danger:hover {
  border-color: var(--mq-rose);
  background: var(--mq-rose-dim);
}
.mq-btn-icon {
  font-size: 14px;
  line-height: 1;
}
.mq-btn-icon.spin {
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ==================== Stats Grid ==================== */
.mq-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

@media (max-width: 1200px) {
  .mq-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 640px) {
  .mq-stats {
    grid-template-columns: 1fr;
  }
}

.mq-stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 22px;
  background: var(--mq-surface);
  border: 1px solid var(--mq-border);
  border-radius: var(--mq-radius);
  transition:
    border-color 0.2s,
    transform 0.2s;
}
.mq-stat-card:hover {
  border-color: var(--mq-border-light);
  transform: translateY(-1px);
}

.mq-stat-icon {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--mq-radius-sm);
  flex-shrink: 0;
}
.mq-stat-icon svg {
  width: 22px;
  height: 22px;
}
.mq-stat-icon.adapter {
  background: rgba(167, 139, 250, 0.12);
  color: var(--mq-adapter);
}
.mq-stat-icon.pending {
  background: var(--mq-amber-dim);
  color: var(--mq-amber);
}
.mq-stat-icon.topics {
  background: var(--mq-blue-dim);
  color: var(--mq-blue);
}
.mq-stat-icon.consumers {
  background: rgba(168, 216, 144, 0.12);
  color: #a8d890;
}

.mq-stat-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.mq-stat-label {
  font-size: 12px;
  color: var(--mq-text-dim);
  text-transform: uppercase;
  letter-spacing: 0.6px;
  font-weight: 500;
}

.mq-stat-value {
  font-family: var(--mq-font-mono);
  font-size: 22px;
  font-weight: 700;
  color: var(--mq-text-bright);
  line-height: 1.2;
}

.mq-stat-value.adapter-color {
  color: var(--mq-adapter);
  font-size: 16px;
  text-transform: uppercase;
}
.mq-stat-value.pending-color {
  color: var(--mq-amber);
}
.mq-stat-value.topics-color {
  color: var(--mq-blue);
}
.mq-stat-value.consumers-color {
  color: #a8d890;
}

/* ==================== Panel / Table ==================== */
.mq-panel {
  background: var(--mq-surface);
  border: 1px solid var(--mq-border);
  border-radius: var(--mq-radius);
  overflow: hidden;
}

.mq-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 22px;
  border-bottom: 1px solid var(--mq-border);
}

.mq-panel-title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--mq-text-bright);
  letter-spacing: 0.2px;
}

.mq-panel-badge {
  font-size: 11px;
  padding: 3px 10px;
  border-radius: 12px;
  background: var(--mq-accent-dim);
  color: var(--mq-accent);
  font-weight: 500;
  font-family: var(--mq-font-mono);
}

.mq-table-wrap {
  overflow-x: auto;
}

.mq-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.mq-table thead th {
  padding: 12px 22px;
  text-align: left;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.7px;
  color: var(--mq-text-dim);
  border-bottom: 1px solid var(--mq-border);
  white-space: nowrap;
}
.mq-table thead th.col-len,
.mq-table thead th.col-status {
  text-align: center;
}
.mq-table thead th.col-actions {
  text-align: right;
}

.mq-table-row {
  transition: background 0.15s;
}
.mq-table-row:hover {
  background: var(--mq-surface-hover);
}
.mq-table-row:not(:last-child) td {
  border-bottom: 1px solid var(--mq-border);
}

.mq-table td {
  padding: 14px 22px;
  vertical-align: middle;
}

/* Topic cell */
.topic-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.topic-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  transition: box-shadow 0.3s;
}
.topic-dot.hot {
  background: var(--mq-amber);
  box-shadow: 0 0 6px var(--mq-amber);
}
.topic-dot.cold {
  background: var(--mq-text-dim);
}

.topic-name {
  font-family: var(--mq-font-mono);
  font-size: 13px;
  color: var(--mq-text-bright);
  background: rgba(255, 255, 255, 0.03);
  padding: 3px 8px;
  border-radius: 4px;
  word-break: break-all;
}

/* Len cell with progress bar */
.len-cell {
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: center;
}

.len-bar-track {
  width: 80px;
  height: 5px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 3px;
  overflow: hidden;
}

.len-bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.5s ease;
}
.len-bar-fill.idle {
  background: var(--mq-text-dim);
}
.len-bar-fill.low {
  background: var(--mq-accent);
}
.len-bar-fill.mid {
  background: var(--mq-amber);
}
.len-bar-fill.high {
  background: var(--mq-rose);
}

.len-value {
  font-family: var(--mq-font-mono);
  font-size: 14px;
  font-weight: 600;
  min-width: 30px;
  text-align: right;
}
.len-value.idle {
  color: var(--mq-text-dim);
}
.len-value.low {
  color: var(--mq-accent);
}
.len-value.mid {
  color: var(--mq-amber);
}
.len-value.high {
  color: var(--mq-rose);
}

/* Status tag */
.col-status {
  text-align: center;
}

.status-tag {
  display: inline-block;
  padding: 3px 12px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.4px;
  text-transform: uppercase;
}
.status-tag.idle {
  background: rgba(255, 255, 255, 0.04);
  color: var(--mq-text-dim);
}
.status-tag.busy {
  background: var(--mq-amber-dim);
  color: var(--mq-amber);
}

/* Actions */
.col-actions {
  text-align: right;
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

/* ==================== Empty ==================== */
.mq-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
  color: var(--mq-text-dim);
}

.mq-empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.3;
}

.mq-empty-text {
  font-size: 14px;
}

/* ==================== Footer ==================== */
.mq-footer {
  margin-top: 24px;
  text-align: center;
  font-size: 11px;
  color: var(--mq-text-dim);
  opacity: 0.6;
}

.mq-footer-dot {
  margin: 0 6px;
}
</style>
