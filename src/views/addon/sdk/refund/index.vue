<template>
  <ProPage :title="$t('message.sdk.refundList')" :subtitle="$t('message.sdk.game.breadcrumbSdk')">
    <ProSearch v-model="searchForm" :fields="searchFields" @search="onSearch" @reset="onReset" />

    <div class="sdk-tabs-card">
      <el-tabs v-model="activeTab" @tab-change="onTabChange">
        <el-tab-pane :label="$t('message.sdk.order.refundGoogle')" name="google">
          <ProTable
            :data="googleData"
            :loading="googleLoading"
            :size="tableSize"
            :total="googleTotal"
            :page="googlePage"
            :page-size="googleSize"
            @pagination="onGooglePageChange"
          >
            <el-table-column
              prop="id"
              :label="$t('message.common.colId')"
              width="80"
              align="center"
            />
            <el-table-column prop="app_id" label="AppID" width="90" align="center" />
            <el-table-column prop="uid" label="UID" width="130" align="center" />
            <el-table-column
              prop="product_id"
              :label="$t('message.sdk.order.productId')"
              width="160"
              show-overflow-tooltip
            />
            <el-table-column
              prop="purchase_token"
              :label="$t('message.sdk.order.refundPurchaseToken')"
              min-width="240"
              show-overflow-tooltip
            />
            <el-table-column
              prop="created_at"
              :label="$t('message.common.colCreateTime')"
              width="170"
              align="center"
            >
              <template #default="{ row }">{{
                row.created_at ? new Date(row.created_at * 1000).toLocaleString() : "-"
              }}</template>
            </el-table-column>
          </ProTable>
        </el-tab-pane>

        <el-tab-pane :label="$t('message.sdk.order.refundAppstore')" name="appstore">
          <ProTable
            :data="appleData"
            :loading="appleLoading"
            :size="tableSize"
            :total="appleTotal"
            :page="applePage"
            :page-size="appleSize"
            @pagination="onApplePageChange"
          >
            <el-table-column
              prop="id"
              :label="$t('message.common.colId')"
              width="80"
              align="center"
            />
            <el-table-column prop="app_id" label="AppID" width="90" align="center" />
            <el-table-column prop="uid" label="UID" width="130" align="center" />
            <el-table-column
              prop="transaction_id"
              :label="$t('message.sdk.order.transactionId')"
              min-width="240"
              show-overflow-tooltip
            />
            <el-table-column
              prop="cancellation_date"
              :label="$t('message.sdk.order.refundDate')"
              width="170"
            />
            <el-table-column
              prop="created_at"
              :label="$t('message.common.colCreateTime')"
              width="170"
              align="center"
            >
              <template #default="{ row }">{{
                row.created_at ? new Date(row.created_at * 1000).toLocaleString() : "-"
              }}</template>
            </el-table-column>
          </ProTable>
        </el-tab-pane>
      </el-tabs>
    </div>
  </ProPage>
</template>

<script lang="ts">
import { computed, defineComponent, ref, reactive, onMounted, onActivated } from "vue";
import ProPage from "/@/components/pro/ProPage.vue";
import ProSearch, { type ProSearchField } from "/@/components/pro/ProSearch.vue";
import ProTable from "/@/components/pro/ProTable.vue";
import {
  getGoogleVoidedList,
  getAppstoreRefundList,
  GoogleVoidedItem,
  AppstoreRefundItem,
} from "/@/api/addon/sdk";

export default defineComponent({
  name: "addonSdkRefundList",
  components: { ProPage, ProSearch, ProTable },
  setup() {
    const activeTab = ref("google");
    const tableSize = ref<"large" | "default" | "small">("default");
    const searchForm = reactive<any>({ app_id: undefined, uid: undefined });

    const googleData = ref<GoogleVoidedItem[]>([]);
    const googleLoading = ref(false);
    const googlePage = ref(1);
    const googleSize = ref(10);
    const googleTotal = ref(0);

    const appleData = ref<AppstoreRefundItem[]>([]);
    const appleLoading = ref(false);
    const applePage = ref(1);
    const appleSize = ref(10);
    const appleTotal = ref(0);

    const searchFields = computed<ProSearchField[]>(() => [
      { prop: "app_id", label: "AppID", type: "number", min: 0, width: "150px" },
      { prop: "uid", label: "UID", type: "number", min: 0, width: "180px" },
    ]);

    const buildParams = () => {
      const p: any = {};
      if (searchForm.app_id !== undefined && searchForm.app_id !== null && searchForm.app_id !== "")
        p.app_id = searchForm.app_id;
      if (searchForm.uid !== undefined && searchForm.uid !== null && searchForm.uid !== "")
        p.uid = searchForm.uid;
      return p;
    };

    const loadGoogle = async () => {
      googleLoading.value = true;
      try {
        const res: any = await getGoogleVoidedList({
          ...buildParams(),
          page: googlePage.value,
          row: googleSize.value,
        });
        const d = res.data || res;
        googleData.value = d.list || [];
        googleTotal.value = d.total || 0;
      } finally {
        googleLoading.value = false;
      }
    };
    const loadApple = async () => {
      appleLoading.value = true;
      try {
        const res: any = await getAppstoreRefundList({
          ...buildParams(),
          page: applePage.value,
          row: appleSize.value,
        });
        const d = res.data || res;
        appleData.value = d.list || [];
        appleTotal.value = d.total || 0;
      } finally {
        appleLoading.value = false;
      }
    };
    const onSearch = () => {
      googlePage.value = 1;
      applePage.value = 1;
      if (activeTab.value === "google") loadGoogle();
      else loadApple();
    };
    const onReset = () => {
      searchForm.app_id = undefined;
      searchForm.uid = undefined;
      onSearch();
    };
    const onTabChange = (tab: any) => {
      if (tab === "google") loadGoogle();
      else loadApple();
    };
    const onGooglePageChange = ({ page, limit }: { page: number; limit: number }) => {
      googlePage.value = page;
      googleSize.value = limit;
      loadGoogle();
    };
    const onApplePageChange = ({ page, limit }: { page: number; limit: number }) => {
      applePage.value = page;
      appleSize.value = limit;
      loadApple();
    };

    onMounted(() => loadGoogle());
    onActivated(() => {
      if (activeTab.value === "google") loadGoogle();
      else loadApple();
    });
    return {
      activeTab,
      tableSize,
      searchForm,
      searchFields,
      googleData,
      googleLoading,
      googlePage,
      googleSize,
      googleTotal,
      appleData,
      appleLoading,
      applePage,
      appleSize,
      appleTotal,
      onSearch,
      onReset,
      onTabChange,
      loadGoogle,
      loadApple,
      onGooglePageChange,
      onApplePageChange,
    };
  },
});
</script>

<style scoped>
.sdk-tabs-card {
  padding: var(--cc-space-4) var(--cc-space-5) var(--cc-space-5);
  background: var(--cc-color-surface);
  border: 1px solid var(--cc-color-border-light);
  border-radius: var(--cc-radius-lg);
  box-shadow: var(--cc-shadow-card);
}
.sdk-tabs-card :deep(.el-tabs__header) {
  margin-bottom: var(--cc-space-4);
}
</style>
