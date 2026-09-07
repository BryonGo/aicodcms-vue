<template>
  <div class="pf-page">
    <el-breadcrumb separator="→">
      <el-breadcrumb-item :to="{ path: '/' }"
        ><el-icon><HomeFilled /></el-icon> {{ $t("message.sdk.platform.breadcrumbHome") }}</el-breadcrumb-item
      >
      <el-breadcrumb-item>{{ $t("message.sdk.platform.breadcrumbSdk") }}</el-breadcrumb-item>
      <el-breadcrumb-item>{{ $t("message.sdk.platform.providersTitle") }}</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="pf-header">
      <div>
        <h1 class="pf-title">{{ $t("message.sdk.platform.providersTitle") }}</h1>
        <p class="pf-subtitle">{{ $t("message.sdk.platform.providersSubtitle") }}</p>
      </div>
      <el-button type="primary" size="large" @click="loadData"
        ><el-icon><Refresh /></el-icon> {{ $t("message.sdk.platform.btnQuery") }}</el-button
      >
    </div>

    <div class="pf-table-card">
      <el-table
        :data="tableData"
        border
        v-loading="loading"
        class="pf-table"
        :empty-text="$t('message.sdk.platform.noData')"
      >
        <el-table-column prop="siteId" :label="$t('message.sdk.platform.colSiteId')" width="90" align="center" />
        <el-table-column prop="siteCode" :label="$t('message.sdk.platform.colSiteCode')" min-width="120" />
        <el-table-column prop="provider" :label="$t('message.sdk.platform.colProvider')" width="120" />
        <el-table-column :label="$t('message.sdk.platform.colStatus')" width="110" align="center">
          <template #default="{ row }">
            <el-tag :type="row.healthy ? 'success' : 'danger'" size="small" effect="plain" round>
              {{ row.healthy ? "OK" : "DOWN" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="detail" :label="$t('message.sdk.platform.colDetail')" min-width="260" show-overflow-tooltip />
      </el-table>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from "vue";
import { HomeFilled, Refresh } from "@element-plus/icons-vue";
import { getPlatformProvidersHealth, AdminProviderHealthItem } from "/@/api/addon/platform";

export default defineComponent({
  name: "addonPlatformProviderHealth",
  components: { HomeFilled, Refresh },
  setup() {
    const tableData = ref<AdminProviderHealthItem[]>([]);
    const loading = ref(false);

    const loadData = async () => {
      loading.value = true;
      try {
        const res: any = await getPlatformProvidersHealth();
        const d = res.data || res;
        tableData.value = d.list || [];
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => loadData());

    return { tableData, loading, loadData };
  },
});
</script>

<style scoped>
.pf-page {
  max-width: 1400px;
  margin: 0 auto;
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
.pf-table-card {
  background: var(--cc-color-surface);
  border: 1px solid var(--cc-color-border-light);
  border-radius: var(--cc-radius-xl);
  padding: var(--cc-space-5) var(--cc-space-6) var(--cc-space-3);
  box-shadow: var(--cc-shadow-sm);
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
  .pf-table-card {
    padding: var(--cc-space-3) var(--cc-space-2);
    border-radius: var(--cc-radius-lg);
    overflow-x: auto;
  }
}
</style>
