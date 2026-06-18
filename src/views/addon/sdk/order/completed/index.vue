<template>
  <ProPage
    :title="$t('message.sdk.order.dedupTitle')"
    :subtitle="$t('message.sdk.order.publicOrder')"
  >
    <ProSearch v-model="searchForm" :fields="searchFields" @search="onSearch" @reset="onReset" />

    <ProToolbar v-model:size="tableSize" @refresh="loadData" />

    <ProTable
      :data="tableData"
      :loading="loading"
      :size="tableSize"
      :total="total"
      :page="page"
      :page-size="size"
      @pagination="onPageChange"
    >
      <el-table-column prop="uid" label="UID" width="130" align="center" />
      <el-table-column
        prop="transaction_id"
        :label="$t('message.sdk.order.transactionId')"
        min-width="220"
        show-overflow-tooltip
      />
      <el-table-column
        prop="product_id"
        :label="$t('message.sdk.order.productId')"
        width="170"
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
  </ProPage>
</template>

<script lang="ts">
import { computed, defineComponent, ref, reactive, onMounted, onActivated } from "vue";
import ProPage from "/@/components/pro/ProPage.vue";
import ProSearch, { type ProSearchField } from "/@/components/pro/ProSearch.vue";
import ProToolbar from "/@/components/pro/ProToolbar.vue";
import ProTable from "/@/components/pro/ProTable.vue";
import { getCompletedOrderList, CompletedOrderItem } from "/@/api/addon/order";

export default defineComponent({
  name: "addonSdkCompletedOrderList",
  components: { ProPage, ProSearch, ProToolbar, ProTable },
  setup() {
    const searchForm = reactive<any>({ uid: undefined });
    const tableData = ref<CompletedOrderItem[]>([]);
    const loading = ref(false);
    const tableSize = ref<"large" | "default" | "small">("default");
    const page = ref(1);
    const size = ref(10);
    const total = ref(0);

    const searchFields = computed<ProSearchField[]>(() => [
      { prop: "uid", label: "UID", type: "number", min: 0, width: "180px" },
    ]);

    const loadData = async () => {
      loading.value = true;
      try {
        const params: any = { page: page.value, row: size.value };
        if (searchForm.uid !== undefined && searchForm.uid !== null && searchForm.uid !== "")
          params.uid = searchForm.uid;
        const res: any = await getCompletedOrderList(params);
        const d = res.data || res;
        tableData.value = d.list || [];
        total.value = d.total || 0;
      } finally {
        loading.value = false;
      }
    };
    const onSearch = () => {
      page.value = 1;
      loadData();
    };
    const onReset = () => {
      searchForm.uid = undefined;
      onSearch();
    };
    const onPageChange = ({ page: nextPage, limit }: { page: number; limit: number }) => {
      page.value = nextPage;
      size.value = limit;
      loadData();
    };
    onMounted(() => loadData());
    onActivated(() => loadData());
    return {
      searchForm,
      searchFields,
      tableData,
      loading,
      tableSize,
      page,
      size,
      total,
      loadData,
      onSearch,
      onReset,
      onPageChange,
    };
  },
});
</script>
