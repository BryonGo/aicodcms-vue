<template>
  <ProPage
    :title="$t('message.sdk.notifyLogList')"
    :subtitle="$t('message.sdk.game.breadcrumbSdk')"
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
      <el-table-column prop="id" :label="$t('message.common.colId')" width="80" align="center" />
      <el-table-column
        prop="order_id"
        :label="$t('message.sdk.order.colOrderIdFull')"
        width="130"
        align="center"
      />
      <el-table-column
        prop="notify_url"
        :label="$t('message.sdk.order.notifyUrlLabel')"
        min-width="220"
        show-overflow-tooltip
      />
      <el-table-column :label="$t('message.common.colStatus')" width="100" align="center">
        <template #default="{ row }">
          <el-tag
            :type="row.notify_status === 1 ? 'success' : 'danger'"
            size="small"
            effect="plain"
          >
            {{
              row.notify_status === 1
                ? $t("message.sdk.order.notifySuccess")
                : $t("message.pms_upload.failed")
            }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="notify_content"
        :label="$t('message.sdk.order.notifyResponse')"
        min-width="220"
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
import { useI18n } from "vue-i18n";
import ProPage from "/@/components/pro/ProPage.vue";
import ProSearch, { type ProSearchField } from "/@/components/pro/ProSearch.vue";
import ProToolbar from "/@/components/pro/ProToolbar.vue";
import ProTable from "/@/components/pro/ProTable.vue";
import { getNotifyLogList, NotifyLogItem } from "/@/api/addon/sdk";

export default defineComponent({
  name: "addonSdkNotifyLogList",
  components: { ProPage, ProSearch, ProToolbar, ProTable },
  setup() {
    const { t } = useI18n();
    const searchForm = reactive<any>({ order_id: undefined });
    const tableData = ref<NotifyLogItem[]>([]);
    const loading = ref(false);
    const tableSize = ref<"large" | "default" | "small">("default");
    const page = ref(1);
    const size = ref(10);
    const total = ref(0);

    const searchFields = computed<ProSearchField[]>(() => [
      {
        prop: "order_id",
        label: t("message.sdk.order.colOrderIdFull"),
        type: "number",
        min: 0,
        width: "180px",
      },
    ]);

    const loadData = async () => {
      loading.value = true;
      try {
        const params: any = { page: page.value, row: size.value };
        if (
          searchForm.order_id !== undefined &&
          searchForm.order_id !== null &&
          searchForm.order_id !== ""
        )
          params.order_id = searchForm.order_id;
        const res: any = await getNotifyLogList(params);
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
      searchForm.order_id = undefined;
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
