<template>
  <ProPage :title="$t('message.sdk.gameUserList')" :subtitle="$t('message.sdk.game.breadcrumbSdk')">
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
      <el-table-column prop="app_id" label="AppID" width="90" align="center" />
      <el-table-column prop="uid" label="UID" width="130" align="center" />
      <el-table-column
        prop="game_nickname"
        :label="$t('message.sdk.game.user.gameNickname')"
        min-width="140"
        show-overflow-tooltip
      />
      <el-table-column
        prop="role_id"
        :label="$t('message.sdk.order.roleId')"
        min-width="130"
        show-overflow-tooltip
      />
      <el-table-column
        prop="server_id"
        :label="$t('message.sdk.order.serverId')"
        width="140"
        show-overflow-tooltip
      />
      <el-table-column
        prop="server_name"
        :label="$t('message.sdk.game.user.serverName')"
        width="150"
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
import { getGameUserList, GameUserItem } from "/@/api/addon/sdk";

export default defineComponent({
  name: "addonSdkGameUserList",
  components: { ProPage, ProSearch, ProToolbar, ProTable },
  setup() {
    const searchForm = reactive<any>({ app_id: undefined, uid: undefined });
    const tableData = ref<GameUserItem[]>([]);
    const loading = ref(false);
    const tableSize = ref<"large" | "default" | "small">("default");
    const page = ref(1);
    const size = ref(10);
    const total = ref(0);

    const searchFields = computed<ProSearchField[]>(() => [
      { prop: "app_id", label: "AppID", type: "number", min: 0, width: "150px" },
      { prop: "uid", label: "UID", type: "number", min: 0, width: "180px" },
    ]);

    const loadData = async () => {
      loading.value = true;
      try {
        const params: any = { page: page.value, row: size.value };
        if (
          searchForm.app_id !== undefined &&
          searchForm.app_id !== null &&
          searchForm.app_id !== ""
        )
          params.app_id = searchForm.app_id;
        if (searchForm.uid !== undefined && searchForm.uid !== null && searchForm.uid !== "")
          params.uid = searchForm.uid;
        const res: any = await getGameUserList(params);
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
      Object.assign(searchForm, { app_id: undefined, uid: undefined });
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
