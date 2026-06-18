<template>
  <ProPage :title="$t('message.sdk.payConfig.headerTitle')" :subtitle="pageSubtitle">
    <template #actions>
      <el-button v-if="gameName" @click="router.push('/addon/sdk/game/list')">
        ← {{ $t("message.sdk.payConfig.backToGame") }}
      </el-button>
      <el-button type="primary" :icon="Plus" @click="onAdd">
        {{ $t("message.sdk.payConfig.btnAdd") || "新增配置" }}
      </el-button>
    </template>

    <div class="pay-list">
      <!-- 搜索栏 -->
      <div class="pay-list__search">
        <div class="pay-list__search-inner">
          <el-select
            v-model="searchForm.module"
            :placeholder="$t('message.sdk.payConfig.placeholderModule')"
            clearable
            class="pay-list__filter"
            @change="onSearch"
          >
            <el-option :label="$t('message.sdk.payConfig.optionGame')" value="game" />
            <el-option :label="$t('message.sdk.payConfig.optionCms')" value="cms" />
            <el-option :label="$t('message.sdk.payConfig.optionRecharge')" value="recharge" />
          </el-select>
          <el-input-number
            v-model="searchForm.app_id"
            :min="0"
            :placeholder="$t('message.sdk.game.colAppId')"
            controls-position="right"
            class="pay-list__filter"
            @change="onSearch"
          />
          <el-select
            v-model="searchForm.channel_code"
            :placeholder="$t('message.sdk.payConfig.placeholderChannelCode')"
            clearable
            filterable
            class="pay-list__filter pay-list__filter--wide"
            @change="onSearch"
          >
            <el-option
              v-for="ch in channelOptions"
              :key="ch.channel_code"
              :label="`${ch.name} (${ch.channel_code})`"
              :value="ch.channel_code"
            />
          </el-select>
          <div class="pay-list__search-actions">
            <el-button type="primary" @click="onSearch">{{
              $t("message.common.search")
            }}</el-button>
            <el-button @click="onReset">{{ $t("message.common.reset") }}</el-button>
          </div>
        </div>
      </div>

      <!-- 表格卡片 -->
      <div class="pay-list__table-card">
        <el-table
          :data="tableData"
          v-loading="loading"
          class="pay-list__table"
          @selection-change="onSelectionChange"
          :empty-text="$t('message.sdk.payConfig.emptyText')"
        >
          <el-table-column type="selection" width="44" />
          <el-table-column prop="id" :label="$t('message.common.colId')" width="68" align="center">
            <template #default="{ row }">
              <span class="pay-list__id">{{ row.id }}</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="module"
            :label="$t('message.sdk.payConfig.colModule')"
            width="96"
            align="center"
          >
            <template #default="{ row }">
              <span class="pay-list__module" :class="`pay-list__module--${row.module}`">{{
                row.module
              }}</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="platform"
            :label="$t('message.sdk.payConfig.colPlatform')"
            width="90"
            align="center"
          >
            <template #default="{ row }">
              <span v-if="row.platform" class="pay-list__platform">{{ row.platform }}</span>
              <span v-else class="pay-list__dash">—</span>
            </template>
          </el-table-column>
          <el-table-column prop="app_id" label="App ID" width="80" align="center">
            <template #default="{ row }">
              <span class="pay-list__id">{{ row.app_id || "—" }}</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="channel_code"
            :label="$t('message.sdk.payConfig.colCode')"
            min-width="180"
          >
            <template #default="{ row }">
              <router-link :to="editLink(row)" class="pay-list__channel">
                <span
                  class="pay-list__channel-dot"
                  :style="{ background: getChannelColor(row.channel_code) }"
                />
                <span class="pay-list__channel-name">{{ getChannelName(row.channel_code) }}</span>
                <span class="pay-list__channel-code">{{ row.channel_code }}</span>
              </router-link>
            </template>
          </el-table-column>
          <el-table-column :label="$t('message.sdk.payConfig.colConfig')" min-width="200">
            <template #default="{ row }">
              <template v-if="row.extra_config">
                <div class="pay-list__config-preview" @click="togglePreview(row.id)">
                  <span class="pay-list__config-text">{{
                    formatExtraConfig(row.extra_config)
                  }}</span>
                  <el-icon size="12" class="pay-list__config-toggle"><ArrowDown /></el-icon>
                </div>
                <div v-if="previewId === row.id" class="pay-list__config-full">
                  <pre class="pay-list__config-pre">{{
                    formatExtraConfigFull(row.extra_config)
                  }}</pre>
                </div>
              </template>
              <span v-else class="pay-list__dash">—</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('message.common.colStatus')" width="80" align="center">
            <template #default="{ row }">
              <span
                class="pay-list__status"
                :class="row.state === 1 ? 'pay-list__status--on' : 'pay-list__status--off'"
              >
                {{
                  row.state === 1
                    ? $t("message.common.enabled")
                    : $t("message.cms.language.btnDeactivate")
                }}
              </span>
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('message.common.colOperation')"
            width="120"
            fixed="right"
            align="center"
          >
            <template #default="{ row }">
              <el-button link type="primary" size="small" @click="onEdit(row)">{{
                $t("message.common.edit")
              }}</el-button>
              <el-button link type="danger" size="small" @click="onDelete(row)">{{
                $t("message.common.delete")
              }}</el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="pay-list__footer">
          <el-button
            v-if="selectedIds.length"
            type="danger"
            plain
            size="small"
            @click="onBatchDelete"
          >
            {{ $t("message.sdk.payConfig.batchDelete") }} ({{ selectedIds.length }})
          </el-button>
          <span v-else />
          <pagination v-model:page="page" v-model:size="size" :total="total" @change="loadData" />
        </div>
      </div>
    </div>
  </ProPage>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onActivated, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { Plus, ArrowDown } from "@element-plus/icons-vue";
import ProPage from "/@/components/pro/ProPage.vue";
import {
  getPayConfigList,
  deletePayConfig,
  getPayChannelList,
  PayConfigItem,
  PayChannelItem,
} from "/@/api/addon/pay";
import { channelMeta } from "../channelSchema";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const router = useRouter();
const route = useRoute();

const appId = Number(route.query.app_id) || 0;
const gameName = decodeURIComponent((route.query.name as string) || "");
const pageSubtitle = computed(() => (gameName ? `${gameName} (AppID: ${appId})` : ""));
const channelOptions = ref<PayChannelItem[]>([]);
const searchForm = reactive({
  module: (route.query.module as string) || "",
  app_id: appId || (undefined as number | undefined),
  channel_code: "",
});
const tableData = ref<PayConfigItem[]>([]);
const loading = ref(false);
const page = ref(1);
const size = ref(10);
const total = ref(0);
const selectedIds = ref<number[]>([]);
const previewId = ref<number | null>(null);

// 通道元数据
function getChannelColor(code: string): string {
  return channelMeta[code]?.color || "var(--cc-color-text-3)";
}
function getChannelName(code: string): string {
  return channelMeta[code]?.name || code;
}

// 配置预览
function formatExtraConfig(json: string): string {
  try {
    const obj = JSON.parse(json);
    const keys = Object.keys(obj);
    if (keys.length <= 2) return json;
    return (
      keys
        .slice(0, 2)
        .map(
          (k) =>
            `${k}: ${typeof obj[k] === "string" && obj[k].length > 20 ? obj[k].slice(0, 20) + "…" : obj[k]}`,
        )
        .join(", ") + ` …+${keys.length - 2}`
    );
  } catch {
    return json.length > 60 ? json.slice(0, 60) + "…" : json;
  }
}
function formatExtraConfigFull(json: string): string {
  try {
    return JSON.stringify(JSON.parse(json), null, 2);
  } catch {
    return json;
  }
}
function togglePreview(id: number) {
  previewId.value = previewId.value === id ? null : id;
}

// 数据加载
async function loadChannels() {
  try {
    const res: any = await getPayChannelList({ page: 1, row: 200 });
    const d = res.data || res;
    channelOptions.value = (d.list || []).filter((ch: PayChannelItem) => ch.state === 1);
  } catch {
    channelOptions.value = [];
  }
}

async function loadData() {
  loading.value = true;
  try {
    const p: any = { page: page.value, row: size.value };
    if (searchForm.module) p.module = searchForm.module;
    if (searchForm.app_id) p.app_id = searchForm.app_id;
    if (searchForm.channel_code) p.channel_code = searchForm.channel_code;
    const res: any = await getPayConfigList(p);
    const d = res.data || res;
    tableData.value = d.list || [];
    total.value = d.total || 0;
  } finally {
    loading.value = false;
  }
}

function onSearch() {
  page.value = 1;
  loadData();
}
function onReset() {
  searchForm.module = "";
  searchForm.app_id = undefined;
  searchForm.channel_code = "";
  onSearch();
}
function onSelectionChange(rows: PayConfigItem[]) {
  selectedIds.value = rows.map((r) => r.id);
}
function editLink(row: PayConfigItem) {
  return `/addon/pay/config/edit?id=${row.id}&app_id=${row.app_id}&module=${row.module}&name=${encodeURIComponent(gameName)}`;
}
function onAdd() {
  router.push(
    `/addon/pay/config/add?app_id=${searchForm.app_id || appId}&module=${searchForm.module || "game"}&name=${encodeURIComponent(gameName)}`,
  );
}
function onEdit(row: PayConfigItem) {
  router.push(editLink(row));
}
function onDelete(row: PayConfigItem) {
  ElMessageBox.confirm(
    t("message.sdk.payConfig.deleteConfirm", { code: row.channel_code }),
    t("message.common.confirmDeleteTitle"),
    { type: "warning" },
  )
    .then(async () => {
      await deletePayConfig({ ids: [row.id] });
      ElMessage.success(t("message.common.msgDeleteOk"));
      loadData();
    })
    .catch(() => {});
}
function onBatchDelete() {
  if (!selectedIds.value.length) return;
  ElMessageBox.confirm(
    t("message.sdk.payConfig.batchDeleteConfirm", { count: selectedIds.value.length }),
    t("message.common.confirmDeleteTitle"),
    { type: "warning" },
  )
    .then(async () => {
      await deletePayConfig({ ids: selectedIds.value });
      ElMessage.success(t("message.common.msgDeleteOk"));
      selectedIds.value = [];
      loadData();
    })
    .catch(() => {});
}

onMounted(() => {
  loadChannels();
  loadData();
});
onActivated(() => loadData());
</script>

<style scoped>
/* ═══════════════════════════════════════════
   Carbon & Gold — Payment Config List
   ═══════════════════════════════════════════ */

.pay-list {
  --gold: var(--cc-color-primary);
  --gold-light: var(--cc-color-primary-hover);
  --gold-bg: var(--cc-color-primary-softer);
  --gold-border: var(--cc-color-primary-soft);
  --slate: var(--cc-color-text-1);
  --slate-light: var(--cc-color-text-2);
  --surface: var(--cc-color-surface);
  --surface-raised: var(--cc-color-surface-hover);
  --border: var(--cc-color-border-light);
  --text: var(--cc-color-text-1);
  --text-secondary: var(--cc-color-text-3);
  --text-muted: var(--cc-color-text-4);
  --radius: var(--cc-radius-lg);
  --radius-sm: var(--cc-radius-md);
  max-width: 1400px;
  margin: 0 auto;
}

/* ── Search ── */
.pay-list__search {
  margin-bottom: 16px;
  padding: 16px 20px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
}

.pay-list__search-inner {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

.pay-list__filter {
  width: 150px;
}
.pay-list__filter--wide {
  width: 180px;
}

.pay-list__search-actions {
  display: flex;
  gap: 8px;
  margin-left: auto;
}

.pay-list__search :deep(.el-input__wrapper),
.pay-list__search :deep(.el-select .el-input__wrapper) {
  border-radius: var(--radius-sm);
  box-shadow: none;
  border: 1px solid var(--border);
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}
.pay-list__search :deep(.el-input__wrapper.is-focus),
.pay-list__search :deep(.el-select .el-input__wrapper.is-focus) {
  border-color: var(--gold);
  box-shadow: 0 0 0 3px var(--cc-color-primary-softer);
}

/* ── Table Card ── */
.pay-list__table-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 20px 24px 12px;
}

/* ── Table ── */
.pay-list__table {
  font-size: 14px;
}
.pay-list__table :deep(th.el-table__cell) {
  font-family: var(--cc-font-sans);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-secondary);
  background: var(--surface-raised);
  border-bottom: 2px solid var(--gold-border);
}
.pay-list__table :deep(.el-table__row:hover > td.el-table__cell) {
  background: var(--gold-bg);
}
.pay-list__table :deep(.el-table__row) {
  transition: background 0.15s;
}

/* ── Cell Styles ── */
.pay-list__id {
  font-family: "JetBrains Mono", "Fira Code", monospace;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
}

.pay-list__module {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.pay-list__module--game {
  background: var(--cc-color-info-soft);
  color: var(--cc-color-info);
}
.pay-list__module--cms {
  background: var(--cc-color-success-soft);
  color: var(--cc-color-success);
}
.pay-list__module--recharge {
  background: var(--cc-color-warning-soft);
  color: var(--cc-color-warning);
}

.pay-list__platform {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);
}

.pay-list__dash {
  color: var(--text-muted);
}

/* ── Channel Cell ── */
.pay-list__channel {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  padding: 4px 0;
  transition: opacity 0.2s;
}
.pay-list__channel:hover {
  opacity: 0.75;
}

.pay-list__channel-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.pay-list__channel-name {
  font-family: var(--cc-font-sans);
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
}

.pay-list__channel-code {
  font-family: "JetBrains Mono", "Fira Code", monospace;
  font-size: 11px;
  font-weight: 500;
  color: var(--text-muted);
  background: var(--surface-raised);
  padding: 1px 6px;
  border-radius: 4px;
}

/* ── Config Preview ── */
.pay-list__config-preview {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  padding: 2px 0;
}
.pay-list__config-text {
  font-family: "JetBrains Mono", "Fira Code", monospace;
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.4;
}
.pay-list__config-toggle {
  color: var(--text-muted);
  transition: transform 0.2s;
}
.pay-list__config-preview:hover .pay-list__config-text {
  color: var(--gold);
}

.pay-list__config-full {
  margin-top: 8px;
  padding: 12px;
  background: var(--cc-color-code-bg, var(--cc-color-text-1));
  border-radius: var(--radius-sm);
  animation: slideDown 0.2s ease;
}
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.pay-list__config-pre {
  margin: 0;
  font-family: "JetBrains Mono", "Fira Code", monospace;
  font-size: 12px;
  line-height: 1.6;
  color: var(--cc-color-code-text, var(--cc-color-bg));
  white-space: pre-wrap;
  word-break: break-all;
}

/* ── Status ── */
.pay-list__status {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}
.pay-list__status--on {
  background: var(--cc-color-success-soft);
  color: var(--cc-color-success);
}
.pay-list__status--off {
  background: var(--cc-color-surface-hover);
  color: var(--cc-color-text-4);
}

/* ── Footer ── */
.pay-list__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
}

/* ── Global button overrides ── */
.pay-list__search-actions :deep(.el-button--primary) {
  background: var(--gold);
  border-color: var(--gold);
}
.pay-list__search-actions :deep(.el-button--primary:hover) {
  background: var(--cc-color-primary-hover);
  border-color: var(--cc-color-primary-hover);
}

/* ── Responsive ── */
@media (min-width: 1401px) {
  .pay-list {
    max-width: none;
    padding: 0 40px;
  }
}
@media (max-width: 768px) {
  .pay-list__search-inner {
    flex-direction: column;
    align-items: stretch;
  }
  .pay-list__filter,
  .pay-list__filter--wide {
    width: 100% !important;
  }
  .pay-list__search-actions {
    margin-left: 0;
  }
  .pay-list__table-card {
    padding: 12px 8px;
    border-radius: 10px;
    overflow-x: auto;
  }
}
</style>
