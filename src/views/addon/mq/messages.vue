<template>
  <div class="mq-messages">
    <!-- ====== Toolbar ====== -->
    <header class="mq-toolbar">
      <div class="mq-toolbar-left">
        <button class="mq-btn mq-btn-ghost" @click="goBack">
          <span class="mq-btn-icon">←</span>
          Back
        </button>
        <div class="mq-divider"></div>
        <div class="mq-field">
          <label class="mq-field-label">Topic</label>
          <select v-model="selectedTopic" class="mq-select" @change="onTopicChange">
            <option value="" disabled>Select a topic...</option>
            <option v-for="t in topics" :key="t.name" :value="t.name">
              {{ t.name }} ({{ t.len }})
            </option>
          </select>
        </div>
        <div class="mq-divider"></div>
        <div class="mq-field">
          <label class="mq-field-label">Count</label>
          <div class="mq-slider-wrap">
            <input
              type="range"
              v-model.number="peekCount"
              min="10"
              max="500"
              step="10"
              class="mq-slider"
              @change="fetchMessages"
            />
            <span class="mq-slider-value">{{ peekCount }}</span>
          </div>
        </div>
      </div>
      <div class="mq-toolbar-right">
        <span class="mq-result-count" v-if="messages.length > 0">
          {{ messages.length }} / {{ peekCount }} shown
        </span>
        <button
          class="mq-btn mq-btn-accent"
          :disabled="!selectedTopic || loading"
          @click="fetchMessages"
        >
          <span class="mq-btn-icon" :class="{ spin: loading }">⟳</span>
          Refresh
        </button>
      </div>
    </header>

    <!-- ====== Message List ====== -->
    <section class="mq-msg-list" v-if="messages.length > 0">
      <div
        v-for="(msg, idx) in messages"
        :key="msg.id"
        class="mq-msg-card"
        :class="{ expanded: expandedId === msg.id }"
      >
        <!-- Card Header -->
        <div class="mq-msg-header" @click="toggleExpand(msg.id)">
          <div class="mq-msg-meta">
            <span class="mq-msg-index">#{{ idx + 1 }}</span>
            <code class="mq-msg-id">{{ truncateId(msg.id) }}</code>
            <span class="mq-msg-size">{{ formatSize(msg.payload_size) }}</span>
            <span class="mq-msg-time">{{ formatTime(msg.created_at) }}</span>
          </div>
          <div class="mq-msg-actions" @click.stop>
            <button class="mq-btn mq-btn-sm mq-btn-ghost" @click="copyPayload(msg.payload)">
              <span class="mq-btn-icon">⧉</span>
              Copy
            </button>
            <span class="mq-expand-icon" :class="{ rotated: expandedId === msg.id }">▾</span>
          </div>
        </div>

        <!-- Card Body (expandable) -->
        <div class="mq-msg-body" v-if="expandedId === msg.id">
          <div class="mq-msg-tabs">
            <button
              class="mq-tab"
              :class="{ active: viewMode === 'formatted' }"
              @click="viewMode = 'formatted'"
            >
              Formatted
            </button>
            <button
              class="mq-tab"
              :class="{ active: viewMode === 'raw' }"
              @click="viewMode = 'raw'"
            >
              Raw
            </button>
          </div>
          <div class="mq-msg-content">
            <pre v-if="viewMode === 'formatted'" class="mq-code formatted">{{
              formatJson(msg.payload)
            }}</pre>
            <pre v-else class="mq-code raw">{{ msg.payload }}</pre>
          </div>
        </div>
      </div>
    </section>

    <!-- ====== Empty ====== -->
    <section class="mq-msg-empty" v-else-if="!loading && selectedTopic">
      <div class="mq-msg-empty-icon">∅</div>
      <p class="mq-msg-empty-text">{{ $t("message.addon_mq.noMessages") }}</p>
    </section>

    <!-- ====== Initial State ====== -->
    <section class="mq-msg-empty" v-else-if="!loading && !selectedTopic">
      <div class="mq-msg-empty-icon">⊡</div>
      <p class="mq-msg-empty-text">Select a topic to browse messages</p>
    </section>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, watch } from "vue";
import { ElMessage } from "element-plus";
import { useRouter, useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { getMQTopics, peekMQMessages, type MQTopic, type PeekMessageItem } from "/@/api/addon/mq";

export default defineComponent({
  name: "mqMessages",
  setup() {
    const { t } = useI18n();
    const router = useRouter();
    const route = useRoute();
    const loading = ref(false);
    const topics = ref<MQTopic[]>([]);
    const selectedTopic = ref("");
    const peekCount = ref(50);
    const messages = ref<PeekMessageItem[]>([]);
    const expandedId = ref("");
    const viewMode = ref<"formatted" | "raw">("formatted");

    const fetchTopics = async () => {
      try {
        const res = await getMQTopics();
        if (res?.data) {
          topics.value = res.data.list || [];
        }
      } catch {
        // silent
      }
    };

    const fetchMessages = async () => {
      if (!selectedTopic.value) return;
      loading.value = true;
      try {
        const res = await peekMQMessages(selectedTopic.value, peekCount.value);
        if (res?.data) {
          messages.value = res.data.messages || [];
          expandedId.value = "";
        }
      } catch {
        ElMessage.error(t("message.addon_mq.dataError"));
      } finally {
        loading.value = false;
      }
    };

    const onTopicChange = () => {
      messages.value = [];
      expandedId.value = "";
      fetchMessages();
    };

    const toggleExpand = (id: string) => {
      expandedId.value = expandedId.value === id ? "" : id;
    };

    const goBack = () => {
      router.push({ path: "/addon/mq" });
    };

    // Init: load topics, then select from route query
    onMounted(async () => {
      await fetchTopics();
      if (route.query.topic && typeof route.query.topic === "string") {
        selectedTopic.value = route.query.topic;
        fetchMessages();
      }
    });

    // Utils
    const truncateId = (id: string) => {
      if (id.length <= 16) return id;
      return id.slice(0, 8) + "…" + id.slice(-8);
    };

    const formatSize = (bytes: number) => {
      if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
      return `${bytes} B`;
    };

    const formatTime = (ts: number) => {
      if (!ts) return "--";
      const d = new Date(ts * 1000);
      const pad = (n: number) => String(n).padStart(2, "0");
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    };

    const formatJson = (raw: string) => {
      try {
        return JSON.stringify(JSON.parse(raw), null, 2);
      } catch {
        return raw;
      }
    };

    const copyPayload = async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        ElMessage.success(t("message.addon_mq.copySuccess"));
      } catch {
        // fallback
        const ta = document.createElement("textarea");
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        ElMessage.success(t("message.addon_mq.copySuccess"));
      }
    };

    return {
      loading,
      topics,
      selectedTopic,
      peekCount,
      messages,
      expandedId,
      viewMode,
      fetchMessages,
      onTopicChange,
      toggleExpand,
      goBack,
      truncateId,
      formatSize,
      formatTime,
      formatJson,
      copyPayload,
    };
  },
});
</script>

<style scoped>
/* ==================== Variables ==================== */
.mq-messages {
  --mq-bg: #090d13;
  --mq-surface: #11161d;
  --mq-surface-hover: #161c26;
  --mq-card: #141a23;
  --mq-card-hover: #191f2a;
  --mq-border: #1c2330;
  --mq-border-light: #252d3a;
  --mq-text: #c4cdd8;
  --mq-text-dim: #5a6474;
  --mq-text-bright: #e8edf3;
  --mq-accent: #00d4aa;
  --mq-accent-dim: rgba(0, 212, 170, 0.1);
  --mq-amber: #f0a040;
  --mq-amber-dim: rgba(240, 160, 64, 0.12);
  --mq-blue: #60a5fa;
  --mq-radius: 10px;
  --mq-radius-sm: 6px;
  --mq-font-mono: "JetBrains Mono", "Fira Code", "SF Mono", "Cascadia Code", monospace;

  min-height: calc(100vh - 100px);
  padding: 28px 32px;
  background: var(--mq-bg);
  color: var(--mq-text);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

/* ==================== Toolbar ==================== */
.mq-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: var(--mq-surface);
  border: 1px solid var(--mq-border);
  border-radius: var(--mq-radius);
  margin-bottom: 20px;
}

.mq-toolbar-left,
.mq-toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.mq-divider {
  width: 1px;
  height: 28px;
  background: var(--mq-border);
}

/* Field */
.mq-field {
  display: flex;
  align-items: center;
  gap: 8px;
}
.mq-field-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: var(--mq-text-dim);
  white-space: nowrap;
}

/* Select */
.mq-select {
  appearance: none;
  -webkit-appearance: none;
  padding: 6px 32px 6px 12px;
  background: var(--mq-bg);
  border: 1px solid var(--mq-border);
  border-radius: 5px;
  color: var(--mq-text-bright);
  font-size: 13px;
  font-family: var(--mq-font-mono);
  cursor: pointer;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='5'%3E%3Cpath d='M0 0l4 5 4-5z' fill='%235a6474'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  min-width: 220px;
  outline: none;
  transition: border-color 0.2s;
}
.mq-select:hover {
  border-color: var(--mq-border-light);
}
.mq-select:focus {
  border-color: var(--mq-accent);
}

/* Slider */
.mq-slider-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}

.mq-slider {
  -webkit-appearance: none;
  appearance: none;
  width: 120px;
  height: 4px;
  background: var(--mq-border);
  border-radius: 2px;
  outline: none;
  cursor: pointer;
}
.mq-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--mq-accent);
  cursor: pointer;
  border: 2px solid var(--mq-bg);
  transition: transform 0.15s;
}
.mq-slider::-webkit-slider-thumb:hover {
  transform: scale(1.15);
}

.mq-slider-value {
  font-family: var(--mq-font-mono);
  font-size: 14px;
  font-weight: 600;
  color: var(--mq-accent);
  min-width: 30px;
}

.mq-result-count {
  font-family: var(--mq-font-mono);
  font-size: 12px;
  color: var(--mq-text-dim);
}

/* Buttons (reuse from dashboard) */
.mq-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 7px 14px;
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
  background: rgba(255, 255, 255, 0.04);
}
.mq-btn-sm {
  padding: 4px 9px;
  font-size: 11px;
  border-radius: 4px;
}
.mq-btn-icon {
  font-size: 13px;
  line-height: 1;
}
.mq-btn-icon.spin {
  animation: mqSpin 0.8s linear infinite;
}
@keyframes mqSpin {
  to {
    transform: rotate(360deg);
  }
}

/* ==================== Message Cards ==================== */
.mq-msg-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.mq-msg-card {
  background: var(--mq-card);
  border: 1px solid var(--mq-border);
  border-radius: var(--mq-radius-sm);
  overflow: hidden;
  transition:
    border-color 0.2s,
    background 0.2s;
}
.mq-msg-card:hover {
  border-color: var(--mq-border-light);
  background: var(--mq-card-hover);
}
.mq-msg-card.expanded {
  border-color: var(--mq-accent);
  border-left: 3px solid var(--mq-accent);
}

/* Card Header */
.mq-msg-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  cursor: pointer;
  user-select: none;
}

.mq-msg-meta {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
}

.mq-msg-index {
  font-family: var(--mq-font-mono);
  font-size: 11px;
  color: var(--mq-text-dim);
  min-width: 28px;
}

.mq-msg-id {
  font-family: var(--mq-font-mono);
  font-size: 12px;
  color: var(--mq-text-bright);
  background: rgba(255, 255, 255, 0.03);
  padding: 2px 8px;
  border-radius: 3px;
}

.mq-msg-size {
  font-family: var(--mq-font-mono);
  font-size: 11px;
  color: var(--mq-blue);
  background: rgba(96, 165, 250, 0.08);
  padding: 2px 8px;
  border-radius: 3px;
}

.mq-msg-time {
  font-family: var(--mq-font-mono);
  font-size: 11px;
  color: var(--mq-text-dim);
}

.mq-msg-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.mq-expand-icon {
  font-size: 12px;
  color: var(--mq-text-dim);
  transition: transform 0.25s ease;
}
.mq-expand-icon.rotated {
  transform: rotate(180deg);
  color: var(--mq-accent);
}

/* Card Body */
.mq-msg-body {
  border-top: 1px solid var(--mq-border);
  animation: mqSlideDown 0.2s ease;
}

@keyframes mqSlideDown {
  from {
    opacity: 0;
    max-height: 0;
  }
  to {
    opacity: 1;
    max-height: 600px;
  }
}

.mq-msg-tabs {
  display: flex;
  gap: 1px;
  padding: 8px 16px 0;
  background: rgba(0, 0, 0, 0.15);
}

.mq-tab {
  padding: 6px 14px;
  background: transparent;
  border: none;
  color: var(--mq-text-dim);
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.15s;
}
.mq-tab:hover {
  color: var(--mq-text);
}
.mq-tab.active {
  color: var(--mq-accent);
  border-bottom-color: var(--mq-accent);
}

.mq-msg-content {
  padding: 14px 16px;
  max-height: 500px;
  overflow: auto;
}

.mq-code {
  margin: 0;
  font-family: var(--mq-font-mono);
  font-size: 12px;
  line-height: 1.55;
  white-space: pre-wrap;
  word-break: break-all;
  tab-size: 2;
  -moz-tab-size: 2;
}
.mq-code.formatted {
  color: var(--mq-text);
}
.mq-code.raw {
  color: var(--mq-text-dim);
}

/* Scrollbar */
.mq-msg-content::-webkit-scrollbar {
  width: 5px;
}
.mq-msg-content::-webkit-scrollbar-track {
  background: transparent;
}
.mq-msg-content::-webkit-scrollbar-thumb {
  background: var(--mq-border);
  border-radius: 3px;
}
.mq-msg-content::-webkit-scrollbar-thumb:hover {
  background: var(--mq-border-light);
}

/* ==================== Empty ==================== */
.mq-msg-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px 0;
  color: var(--mq-text-dim);
}
.mq-msg-empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.25;
}
.mq-msg-empty-text {
  font-size: 14px;
}
</style>
