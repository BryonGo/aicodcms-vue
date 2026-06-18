<template>
  <ProPage
    :title="$t('message.sdk.loginLogList')"
    :subtitle="$t('message.sdk.game.loginLogSubtitle')"
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
        prop="user_id"
        :label="$t('message.sdk.game.loginLogUserId')"
        width="130"
        align="center"
      />
      <el-table-column
        prop="app_id"
        :label="$t('message.sdk.game.loginLogAppId')"
        width="90"
        align="center"
      />
      <el-table-column prop="ip" :label="$t('message.sdk.game.loginLogIp')" width="150" />
      <el-table-column
        prop="device_id"
        :label="$t('message.sdk.game.loginLogDevice')"
        min-width="200"
        show-overflow-tooltip
      />
      <el-table-column :label="$t('message.sdk.game.loginLogType')" width="110" align="center">
        <template #default="{ row }">
          <el-tag :type="loginTypeTag(row.login_type)" size="small" effect="plain">{{
            loginTypeText(row.login_type)
          }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="created_at"
        :label="$t('message.sdk.game.loginLogTime')"
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
import { getLoginLogList, LoginLogItem } from "/@/api/addon/sdk";

export default defineComponent({
  name: "addonSdkLoginLogList",
  components: { ProPage, ProSearch, ProToolbar, ProTable },
  setup() {
    const { t } = useI18n();
    const searchForm = reactive<any>({ user_id: undefined, app_id: undefined, keyword: "" });
    const tableData = ref<LoginLogItem[]>([]);
    const loading = ref(false);
    const tableSize = ref<"large" | "default" | "small">("default");
    const page = ref(1);
    const size = ref(10);
    const total = ref(0);

    const searchFields = computed<ProSearchField[]>(() => [
      {
        prop: "user_id",
        label: t("message.sdk.game.loginLogUserId"),
        type: "number",
        min: 0,
        width: "180px",
      },
      {
        prop: "app_id",
        label: t("message.sdk.game.loginLogAppId"),
        type: "number",
        min: 0,
        width: "150px",
      },
      {
        prop: "keyword",
        label: t("message.sdk.game.loginLogIpDevice"),
        placeholder: t("message.sdk.game.loginLogIpDeviceHint"),
        width: "220px",
      },
    ]);

    const loginTypeText = (type: number) =>
      (
        ({ 1: "Email", 2: "Guest", 3: "Google", 4: "Facebook", 5: "Apple" }) as Record<
          number,
          string
        >
      )[type] || "Unknown";
    const loginTypeTag = (type: number) =>
      (({ 1: "primary", 2: "info", 3: "danger", 4: "", 5: "success" }) as Record<number, string>)[
        type
      ] || "info";

    const loadData = async () => {
      loading.value = true;
      try {
        const params: any = { page: page.value, row: size.value };
        if (
          searchForm.user_id !== undefined &&
          searchForm.user_id !== null &&
          searchForm.user_id !== ""
        )
          params.user_id = searchForm.user_id;
        if (
          searchForm.app_id !== undefined &&
          searchForm.app_id !== null &&
          searchForm.app_id !== ""
        )
          params.app_id = searchForm.app_id;
        if (searchForm.keyword) params.keyword = searchForm.keyword;
        const res: any = await getLoginLogList(params);
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
      Object.assign(searchForm, { user_id: undefined, app_id: undefined, keyword: "" });
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
      loginTypeText,
      loginTypeTag,
      loadData,
      onSearch,
      onReset,
      onPageChange,
    };
  },
});
</script>
