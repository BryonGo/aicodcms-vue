<template>
  <div class="pf-page">
    <el-breadcrumb separator="→">
      <el-breadcrumb-item :to="{ path: '/' }"
        ><el-icon><HomeFilled /></el-icon> {{ $t("message.sdk.platform.breadcrumbHome") }}</el-breadcrumb-item
      >
      <el-breadcrumb-item>{{ $t("message.sdk.platform.breadcrumbSdk") }}</el-breadcrumb-item>
      <el-breadcrumb-item>{{ $t("message.sdk.platform.tasksTitle") }}</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="pf-header">
      <div>
        <h1 class="pf-title">{{ $t("message.sdk.platform.tasksTitle") }}</h1>
        <p class="pf-subtitle">{{ $t("message.sdk.platform.tasksSubtitle") }}</p>
      </div>
    </div>

    <div class="pf-filter-card">
      <el-form :inline="true" @submit.prevent>
        <el-form-item :label="$t('message.sdk.platform.filterSite')">
          <el-input
            v-model="q.siteId"
            placeholder="siteId"
            clearable
            style="width: 160px"
            @keyup.enter="onQuery"
          />
        </el-form-item>
        <el-form-item :label="$t('message.sdk.platform.filterStatus')">
          <el-select
            v-model="q.status"
            :placeholder="$t('message.sdk.platform.statusAll')"
            clearable
            style="width: 160px"
          >
            <el-option
              v-for="s in statusOptions"
              :key="s"
              :label="s"
              :value="s"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('message.sdk.platform.filterProduct')">
          <el-input
            v-model="q.product"
            placeholder="hougong / gamelora"
            clearable
            style="width: 160px"
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
        <el-table-column prop="id" :label="$t('message.sdk.platform.colId')" width="80" align="center" />
        <el-table-column prop="siteId" :label="$t('message.sdk.platform.colSiteId')" width="80" align="center" />
        <el-table-column prop="accountId" :label="$t('message.sdk.platform.colAccountId')" width="100" align="center" />
        <el-table-column prop="product" :label="$t('message.sdk.platform.colProduct')" width="110" />
        <el-table-column prop="type" :label="$t('message.sdk.platform.colType')" width="140" show-overflow-tooltip />
        <el-table-column :label="$t('message.sdk.platform.colStatus')" width="130" align="center">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)" size="small" effect="plain" round>
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="$t('message.sdk.platform.colProgress')" width="90" align="center">
          <template #default="{ row }">
            <span class="pf-mono">{{ row.progress }}%</span>
          </template>
        </el-table-column>
        <el-table-column prop="errorCode" :label="$t('message.sdk.platform.colErrorCode')" width="110" show-overflow-tooltip />
        <el-table-column :label="$t('message.sdk.platform.colReservedCredits')" width="110" align="right">
          <template #default="{ row }">
            <span class="pf-mono">{{ row.reservedCredits }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('message.sdk.platform.colBilledCredits')" width="110" align="right">
          <template #default="{ row }">
            <span class="pf-mono">{{ row.billedCredits }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('message.sdk.platform.colCreatedAt')" width="180">
          <template #default="{ row }">{{ fmtTime(row.createdAt) }}</template>
        </el-table-column>
      </el-table>
      <div class="pf-footer">
        <pagination
          v-model:page="page"
          v-model:size="size"
          :total="total"
          @change="loadData"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, onMounted, onActivated } from "vue";
import { HomeFilled } from "@element-plus/icons-vue";
import { getPlatformTasks, AdminTaskItem } from "/@/api/addon/platform";

const statusOptions = [
  "queued",
  "submitting",
  "running",
  "saving",
  "succeeded",
  "cancelled",
  "cancel_requested",
  "failed",
  "reconciling",
];

export default defineComponent({
  name: "addonPlatformTaskList",
  components: { HomeFilled },
  setup() {
    const tableData = ref<AdminTaskItem[]>([]);
    const loading = ref(false);
    const page = ref(1);
    const size = ref(20);
    const total = ref(0);
    const q = reactive<{ siteId?: number; status?: string; product?: string }>({
      siteId: undefined,
      status: undefined,
      product: undefined,
    });

    const statusTagType = (s: string) => {
      switch (s) {
        case "succeeded":
          return "success";
        case "failed":
        case "cancelled":
          return "danger";
        case "running":
        case "saving":
        case "submitting":
          return "warning";
        case "cancel_requested":
        case "reconciling":
          return "info";
        default:
          return "";
      }
    };

    const fmtTime = (ts: number) => {
      if (!ts) return "-";
      return new Date(ts * 1000).toLocaleString();
    };

    const loadData = async () => {
      loading.value = true;
      try {
        const res: any = await getPlatformTasks({
          siteId: q.siteId,
          status: q.status,
          product: q.product,
          page: page.value,
          pageSize: size.value,
        });
        const d = res.data || res;
        tableData.value = d.list || [];
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
      q.siteId = undefined;
      q.status = undefined;
      q.product = undefined;
      page.value = 1;
      loadData();
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
      statusOptions,
      statusTagType,
      fmtTime,
      loadData,
      onQuery,
      onReset,
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
