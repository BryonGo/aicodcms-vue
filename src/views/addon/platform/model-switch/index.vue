<template>
  <div class="pf-page">
    <el-breadcrumb separator="→">
      <el-breadcrumb-item :to="{ path: '/' }"
        ><el-icon><HomeFilled /></el-icon> {{ $t("message.sdk.platform.breadcrumbHome") }}</el-breadcrumb-item
      >
      <el-breadcrumb-item>{{ $t("message.sdk.platform.breadcrumbSdk") }}</el-breadcrumb-item>
      <el-breadcrumb-item>{{ $t("message.sdk.platform.modelSwitchTitle") }}</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="pf-header">
      <div>
        <h1 class="pf-title">{{ $t("message.sdk.platform.modelSwitchTitle") }}</h1>
        <p class="pf-subtitle">{{ $t("message.sdk.platform.modelSwitchSubtitle") }}</p>
      </div>
    </div>

    <div class="pf-filter-card">
      <el-form :inline="true" @submit.prevent>
        <el-form-item :label="$t('message.sdk.platform.colKind')">
          <el-select v-model="q.kind" style="width: 160px">
            <el-option :label="$t('message.sdk.platform.kindAll')" value="" />
            <el-option :label="$t('message.sdk.platform.kindImage')" value="image" />
            <el-option :label="$t('message.sdk.platform.kindVideo')" value="video" />
            <el-option :label="$t('message.sdk.platform.kindCloud')" value="cloud" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('message.sdk.platform.colName')">
          <el-input
            v-model="q.query"
            :placeholder="$t('message.sdk.platform.colName')"
            clearable
            style="width: 200px"
            @keyup.enter="onQuery"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onQuery">{{ $t("message.sdk.platform.btnQuery") }}</el-button>
          <el-button @click="onReset">{{ $t("message.sdk.platform.btnReset") }}</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="pf-table-card">
      <el-table
        :data="tableData"
        border
        v-loading="loading"
        class="pf-table"
        :empty-text="$t('message.sdk.platform.noData')"
      >
        <el-table-column prop="kind" :label="$t('message.sdk.platform.colKind')" width="90" align="center" />
        <el-table-column prop="modelId" :label="$t('message.sdk.platform.colModelId')" width="200" show-overflow-tooltip>
          <template #default="{ row }"><span class="pf-mono">{{ row.modelId }}</span></template>
        </el-table-column>
        <el-table-column prop="name" :label="$t('message.sdk.platform.colName')" min-width="180" show-overflow-tooltip />
        <el-table-column prop="type" :label="$t('message.sdk.platform.colType')" width="110" />
        <el-table-column prop="family" :label="$t('message.sdk.platform.colFamily')" width="120" />
        <el-table-column prop="engine" :label="$t('message.sdk.platform.colEngine')" width="120" />
        <el-table-column :label="$t('message.sdk.platform.colStatus')" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="row.enabled ? 'success' : 'info'" size="small" effect="plain" round>
              {{ row.enabled ? $t("message.sdk.platform.enabled") : $t("message.sdk.platform.disabled") }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="reason" :label="$t('message.sdk.platform.colReason')" min-width="160" show-overflow-tooltip />
        <el-table-column :label="$t('message.sdk.platform.colUpdatedAt')" width="180">
          <template #default="{ row }">{{ fmtTime(row.updatedAt) }}</template>
        </el-table-column>
        <el-table-column :label="$t('message.sdk.platform.colOp')" width="110" align="center" fixed="right">
          <template #default="{ row }">
            <el-button v-if="row.enabled" type="danger" link size="small" @click="onDisable(row)">
              {{ $t("message.sdk.platform.btnDisable") }}
            </el-button>
            <el-button v-else type="primary" link size="small" @click="onEnable(row)">
              {{ $t("message.sdk.platform.btnEnable") }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pf-footer">
        <pagination v-model:page="page" v-model:limit="size" :total="total" @change="loadData" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, onMounted, onActivated } from "vue";
import { HomeFilled } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useI18n } from "vue-i18n";
import {
  getPlatformModelSwitches,
  setPlatformModelSwitch,
  AdminModelSwitchItem,
} from "/@/api/addon/platform";

export default defineComponent({
  name: "addonPlatformModelSwitch",
  components: { HomeFilled },
  setup() {
    const { t } = useI18n();
    const tableData = ref<AdminModelSwitchItem[]>([]);
    const loading = ref(false);
    const page = ref(1);
    const size = ref(50);
    const total = ref(0);
    const q = reactive<{ kind: string; query: string }>({ kind: "", query: "" });

    const fmtTime = (ts: number) => (ts ? new Date(ts * 1000).toLocaleString() : "-");

    const loadData = async () => {
      loading.value = true;
      try {
        const res: any = await getPlatformModelSwitches({
          kind: q.kind,
          query: q.query,
          page: page.value,
          pageSize: size.value,
        });
        const d = res.data || res;
        tableData.value = d.items || [];
        total.value = d.total || 0;
      } finally {
        loading.value = false;
      }
    };

    const onQuery = () => {
      page.value = 1;
      loadData();
    };
    const onReset = () => {
      q.kind = "";
      q.query = "";
      page.value = 1;
      loadData();
    };

    // 停用必须填写原因（后端留审计），原因为空直接拦下不发请求
    const onDisable = (row: AdminModelSwitchItem) => {
      ElMessageBox.prompt(t("message.sdk.platform.disableReason"), t("message.sdk.platform.btnDisable"), {
        type: "warning",
        inputPlaceholder: t("message.sdk.platform.disableReason"),
        inputValidator: (value: string) =>
          (value || "").trim() ? true : t("message.sdk.platform.disableReasonRequired"),
      })
        .then(async ({ value }) => {
          const reason = (value || "").trim();
          if (!reason) return;
          const res: any = await setPlatformModelSwitch({
            kind: row.kind,
            modelId: row.modelId,
            enabled: false,
            reason,
          });
          const d = res.data || res;
          if (d && typeof d === "object") Object.assign(row, d);
          ElMessage.success(t("message.sdk.platform.switchOk"));
          await loadData();
        })
        .catch(() => {});
    };

    const onEnable = (row: AdminModelSwitchItem) => {
      ElMessageBox.confirm(`${t("message.sdk.platform.btnEnable")} ${row.name || row.modelId}?`, {
        type: "warning",
      })
        .then(async () => {
          const res: any = await setPlatformModelSwitch({
            kind: row.kind,
            modelId: row.modelId,
            enabled: true,
          });
          const d = res.data || res;
          if (d && typeof d === "object") Object.assign(row, d);
          ElMessage.success(t("message.sdk.platform.switchOk"));
          await loadData();
        })
        .catch(() => {});
    };

    onMounted(() => loadData());
    onActivated(() => loadData());

    return {
      tableData,
      loading,
      page,
      size,
      total,
      q,
      fmtTime,
      loadData,
      onQuery,
      onReset,
      onDisable,
      onEnable,
    };
  },
});
</script>

<style scoped>
.pf-page {
  max-width: 1400px;
  margin: 0 auto;
}
.pf-mono {
  font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-weight: 600;
  color: var(--cc-color-text-2);
}
.pf-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: var(--cc-space-4);
  margin: var(--cc-space-5) 0;
  padding: var(--cc-space-6) var(--cc-space-7);
  background:
    radial-gradient(circle at 8% 0%, var(--cc-color-primary-softer), transparent 32%),
    var(--cc-color-surface);
  border: 1px solid var(--cc-color-border-light);
  border-radius: var(--cc-radius-xl);
  box-shadow: var(--cc-shadow-sm);
}
.pf-title {
  font-family: var(--cc-font-sans);
  font-size: var(--cc-font-24);
  font-weight: 650;
  color: var(--cc-color-text-1);
  margin: 0 0 var(--cc-space-1);
  letter-spacing: -0.02em;
}
.pf-subtitle {
  font-family: var(--cc-font-sans);
  font-size: var(--cc-font-13);
  color: var(--cc-color-text-3);
  margin: 0;
}
.pf-filter-card,
.pf-table-card {
  background: var(--cc-color-surface);
  border: 1px solid var(--cc-color-border-light);
  border-radius: var(--cc-radius-xl);
  padding: var(--cc-space-5) var(--cc-space-6) var(--cc-space-3);
  box-shadow: var(--cc-shadow-sm);
}
.pf-filter-card {
  margin-bottom: var(--cc-space-4);
}
.pf-table {
  font-size: var(--cc-font-14);
}
.pf-table :deep(th.el-table__cell) {
  font-size: var(--cc-font-12);
  font-weight: 650;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--cc-color-text-3);
  background: var(--cc-color-surface-hover);
  border-bottom: 1px solid var(--cc-color-border-light);
}
.pf-table :deep(.el-table__row:hover > td.el-table__cell) {
  background: var(--cc-color-primary-softer);
}
.pf-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: var(--cc-space-3);
  padding-top: var(--cc-space-3);
}
@media (min-width: 1401px) {
  .pf-page {
    max-width: none !important;
    padding: 0 var(--cc-space-8);
  }
}
@media (max-width: 768px) {
  .pf-header {
    padding: var(--cc-space-5);
  }
  .pf-filter-card,
  .pf-table-card {
    padding: var(--cc-space-3) var(--cc-space-2);
    border-radius: var(--cc-radius-lg);
    overflow-x: auto;
  }
}
</style>
