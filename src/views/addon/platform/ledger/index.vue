<template>
  <div class="pf-page">
    <el-breadcrumb separator="→">
      <el-breadcrumb-item :to="{ path: '/' }"
        ><el-icon><HomeFilled /></el-icon> {{ $t("message.sdk.platform.breadcrumbHome") }}</el-breadcrumb-item
      >
      <el-breadcrumb-item>{{ $t("message.sdk.platform.breadcrumbSdk") }}</el-breadcrumb-item>
      <el-breadcrumb-item>{{ $t("message.sdk.platform.ledgerTitle") }}</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="pf-header">
      <div>
        <h1 class="pf-title">{{ $t("message.sdk.platform.ledgerTitle") }}</h1>
        <p class="pf-subtitle">{{ $t("message.sdk.platform.ledgerSubtitle") }}</p>
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
        <el-form-item :label="$t('message.sdk.platform.filterAccount')">
          <el-input
            v-model="q.accountId"
            placeholder="accountId"
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
        <el-table-column :label="$t('message.sdk.platform.colOp')" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="opTagType(row.op)" size="small" effect="plain" round>
              {{ row.op }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="$t('message.sdk.platform.colAmount')" width="120" align="right">
          <template #default="{ row }">
            <span :class="row.amount >= 0 ? 'pf-positive' : 'pf-negative'" class="pf-num">
              {{ row.amount > 0 ? "+" : "" }}{{ row.amount }}
            </span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('message.sdk.platform.colBalanceAfter')" width="140" align="right">
          <template #default="{ row }">
            <span class="pf-mono">{{ row.balanceAfter }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="taskId" :label="$t('message.sdk.platform.colTaskId')" width="100" align="center" />
        <el-table-column prop="orderId" :label="$t('message.sdk.platform.colOrderId')" width="100" align="center" />
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
import { getPlatformLedger, AdminLedgerItem } from "/@/api/addon/platform";

export default defineComponent({
  name: "addonPlatformLedgerList",
  components: { HomeFilled },
  setup() {
    const tableData = ref<AdminLedgerItem[]>([]);
    const loading = ref(false);
    const page = ref(1);
    const size = ref(20);
    const total = ref(0);
    const q = reactive<{ siteId?: number; accountId?: number }>({
      siteId: undefined,
      accountId: undefined,
    });

    const opTagType = (op: string) => {
      switch (op) {
        case "grant":
          return "success";
        case "reserve":
          return "warning";
        case "capture":
        case "refund":
        case "release":
          return "info";
        case "expire":
        case "adjust":
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
        const res: any = await getPlatformLedger({
          siteId: q.siteId,
          accountId: q.accountId,
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
      q.accountId = undefined;
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
      opTagType,
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
.pf-num {
  font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-weight: 600;
}
.pf-positive {
  color: var(--el-color-success);
}
.pf-negative {
  color: var(--el-color-danger);
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
