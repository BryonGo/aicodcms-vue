<template>
  <div class="pf-page">
    <el-breadcrumb separator="→">
      <el-breadcrumb-item :to="{ path: '/' }"
        ><el-icon><HomeFilled /></el-icon> {{ $t("message.sdk.platform.breadcrumbHome") }}</el-breadcrumb-item
      >
      <el-breadcrumb-item>{{ $t("message.sdk.platform.breadcrumbSdk") }}</el-breadcrumb-item>
      <el-breadcrumb-item>{{ $t("message.sdk.platform.loraTitle") }}</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="pf-header">
      <div>
        <h1 class="pf-title">{{ $t("message.sdk.platform.loraTitle") }}</h1>
        <p class="pf-subtitle">{{ $t("message.sdk.platform.loraSubtitle") }}</p>
      </div>
      <div class="pf-header-actions">
        <el-button type="primary" :loading="importing" @click="onImport">
          {{ $t("message.sdk.platform.btnImportLora") }}
        </el-button>
      </div>
    </div>

    <div class="pf-filter-card">
      <el-form :inline="true" @submit.prevent>
        <el-form-item :label="$t('message.sdk.platform.colSafety')">
          <el-select v-model="q.safety" style="width: 160px">
            <el-option :label="$t('message.sdk.platform.safetyAll')" value="" />
            <el-option :label="$t('message.sdk.platform.safetySafe')" value="safe" />
            <el-option :label="$t('message.sdk.platform.safetyAdult')" value="adult" />
          </el-select>
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
        <el-table-column prop="id" :label="$t('message.sdk.platform.colId')" width="190" show-overflow-tooltip />
        <el-table-column prop="name" :label="$t('message.sdk.platform.colName')" min-width="180" show-overflow-tooltip />
        <el-table-column
          prop="fileName"
          :label="$t('message.sdk.platform.colFileName')"
          min-width="240"
          show-overflow-tooltip
        />
        <el-table-column prop="family" :label="$t('message.sdk.platform.colFamily')" width="120" />
        <el-table-column :label="$t('message.sdk.platform.colSafety')" width="110" align="center">
          <template #default="{ row }">
            <el-tag :type="row.safety === 'adult' ? 'danger' : 'success'" size="small" effect="plain" round>
              {{ row.safety === "adult" ? $t("message.sdk.platform.safetyAdult") : $t("message.sdk.platform.safetySafe") }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="state" :label="$t('message.sdk.platform.colState')" width="120" />
        <el-table-column :label="$t('message.sdk.platform.colAction')" width="180" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" :disabled="row.safety === 'safe'" @click="onMark(row, 'safe')">
              {{ $t("message.sdk.platform.btnMarkSafe") }}
            </el-button>
            <el-button link type="primary" :disabled="row.safety === 'adult'" @click="onMark(row, 'adult')">
              {{ $t("message.sdk.platform.btnMarkAdult") }}
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
import { getPlatformLoras, importPlatformLoras, setPlatformLoraSafety, AdminLoraItem } from "/@/api/addon/platform";

export default defineComponent({
  name: "addonPlatformLora",
  components: { HomeFilled },
  setup() {
    const { t } = useI18n();
    const tableData = ref<AdminLoraItem[]>([]);
    const loading = ref(false);
    const importing = ref(false);
    const page = ref(1);
    const size = ref(50);
    const total = ref(0);
    // safety 为 "" 表示不过滤（全部）
    const q = reactive<{ safety: string }>({ safety: "" });

    const loadData = async () => {
      loading.value = true;
      try {
        const res: any = await getPlatformLoras({
          safety: q.safety,
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
      q.safety = "";
      page.value = 1;
      loadData();
    };

    // 从站点 ComfyUI 一键导入全部 LoRA：落库并按 NSFW 黑名单自动标记成人。
    const onImport = async () => {
      try {
        await ElMessageBox.confirm(t("message.sdk.platform.importConfirm"), t("message.common.confirmTitle"), {
          type: "warning",
        });
      } catch {
        return; // 用户取消
      }
      importing.value = true;
      try {
        const res: any = await importPlatformLoras();
        const d = res.data || res;
        ElMessage.success(
          t("message.sdk.platform.importDone", {
            total: d.total || 0,
            imported: d.imported || 0,
            updated: d.updated || 0,
            skipped: d.skipped || 0,
            adult: d.markedAdult || 0,
          })
        );
        await loadData();
      } finally {
        importing.value = false;
      }
    };

    // 人工调整安全标记（safe / adult）
    const onMark = async (row: AdminLoraItem, safety: "safe" | "adult") => {
      await setPlatformLoraSafety({ id: row.id, safety });
      ElMessage.success(t("message.sdk.platform.switchOk"));
      await loadData();
    };

    onMounted(() => loadData());
    onActivated(() => loadData());

    return {
      tableData,
      loading,
      importing,
      page,
      size,
      total,
      q,
      loadData,
      onQuery,
      onReset,
      onImport,
      onMark,
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
.pf-header-actions {
  display: flex;
  align-items: center;
  gap: var(--cc-space-2);
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
