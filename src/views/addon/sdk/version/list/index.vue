<template>
  <ProPage
    :title="$t('message.sdk.version.headerTitle')"
    :subtitle="
      gameName
        ? $t('message.sdk.version.gameLabel', { name: gameName, id: appId })
        : $t('message.sdk.version.breadcrumbVersion')
    "
  >
    <template #actions>
      <el-button @click="$router.push('/addon/sdk/game/list')">{{
        $t("message.sdk.version.backToGame")
      }}</el-button>
      <el-button type="primary" :icon="Plus" @click="onAdd">{{
        $t("message.common.add")
      }}</el-button>
    </template>

    <ProSearch v-model="searchForm" :fields="searchFields" @search="onSearch" @reset="onReset" />
    <ProToolbar v-model:size="tableSize" @refresh="loadData">
      <template #left>
        <el-button
          v-if="selectedIds.length"
          type="danger"
          plain
          size="small"
          @click="onBatchDelete"
          >{{ $t("message.sdk.version.batchDelete", { count: selectedIds.length }) }}</el-button
        >
      </template>
    </ProToolbar>

    <ProTable
      :data="tableData"
      :loading="loading"
      :size="tableSize"
      :total="total"
      :page="page"
      :page-size="size"
      selection
      @selection-change="onSelectionChange"
      @pagination="onPageChange"
    >
      <el-table-column prop="id" :label="$t('message.common.colId')" width="70" align="center" />
      <el-table-column
        prop="version_code"
        :label="$t('message.sdk.version.colVersionCode')"
        width="120"
        align="center"
        ><template #default="{ row }"
          ><span class="mono-primary">v{{ row.version_code }}</span></template
        ></el-table-column
      >
      <el-table-column
        prop="version_name"
        :label="$t('message.sdk.version.colVersionName')"
        min-width="150"
        show-overflow-tooltip
        ><template #default="{ row }"
          ><router-link :to="editLink(row)" class="link-primary">{{
            row.version_name || $t("message.sdk.version.unnamed")
          }}</router-link></template
        ></el-table-column
      >
      <el-table-column
        prop="version_desc"
        :label="$t('message.sdk.version.colVersionDesc')"
        min-width="220"
        show-overflow-tooltip
      />
      <el-table-column :label="$t('message.sdk.version.colForceUpdate')" width="110" align="center"
        ><template #default="{ row }"
          ><el-tag
            :type="row.force_update === 1 ? 'danger' : 'info'"
            size="small"
            effect="plain"
            round
            >{{
              row.force_update === 1
                ? $t("message.sdk.version.forceYes")
                : $t("message.sdk.version.forceNo")
            }}</el-tag
          ></template
        ></el-table-column
      >
      <el-table-column :label="$t('message.common.colStatus')" width="100" align="center"
        ><template #default="{ row }"
          ><el-tag
            :type="row.enabled === 1 ? 'warning' : 'info'"
            size="small"
            effect="plain"
            round
            >{{
              row.enabled === 1
                ? $t("message.sdk.version.activeYes")
                : $t("message.sdk.version.activeNo")
            }}</el-tag
          ></template
        ></el-table-column
      >
      <el-table-column
        :label="$t('message.common.colOperation')"
        width="210"
        fixed="right"
        align="center"
        ><template #default="{ row }"
          ><el-button link type="primary" size="small" @click="onEdit(row)">{{
            $t("message.common.edit")
          }}</el-button
          ><el-button
            link
            :type="row.enabled === 1 ? 'warning' : 'success'"
            size="small"
            @click="onToggleActive(row)"
            >{{
              row.enabled === 1
                ? $t("message.sdk.version.btnDeactivate")
                : $t("message.sdk.version.btnActivate")
            }}</el-button
          ><el-button link type="danger" size="small" @click="onDelete(row)">{{
            $t("message.common.delete")
          }}</el-button></template
        ></el-table-column
      >
    </ProTable>
  </ProPage>
</template>

<script lang="ts">
import { computed, defineComponent, ref, reactive, onMounted, onActivated } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { Plus } from "@element-plus/icons-vue";
import { useI18n } from "vue-i18n";
import ProPage from "/@/components/pro/ProPage.vue";
import ProSearch, { type ProSearchField } from "/@/components/pro/ProSearch.vue";
import ProToolbar from "/@/components/pro/ProToolbar.vue";
import ProTable from "/@/components/pro/ProTable.vue";
import { getVersionList, deleteVersion, editVersion, VersionItem } from "/@/api/addon/sdk";

export default defineComponent({
  name: "addonSdkVersionList",
  components: { ProPage, ProSearch, ProToolbar, ProTable, Plus },
  setup() {
    const { t } = useI18n();
    const router = useRouter();
    const route = useRoute();
    const appId = Number(route.query.app_id) || 0;
    const gameName = decodeURIComponent((route.query.name as string) || "");
    const searchForm = reactive({ keyword: "" });
    const tableData = ref<VersionItem[]>([]);
    const loading = ref(false);
    const tableSize = ref<"large" | "default" | "small">("default");
    const page = ref(1);
    const size = ref(10);
    const total = ref(0);
    const selectedIds = ref<number[]>([]);
    const searchFields = computed<ProSearchField[]>(() => [
      {
        prop: "keyword",
        label: t("message.common.search"),
        placeholder: t("message.sdk.version.searchPlaceholder"),
        width: "260px",
      },
    ]);

    const loadData = async () => {
      if (!appId) return;
      loading.value = true;
      try {
        const params: any = { app_id: appId, page: page.value, row: size.value };
        if (searchForm.keyword) params.keyword = searchForm.keyword;
        const res: any = await getVersionList(params);
        const data = res.data || res;
        tableData.value = data.list || [];
        total.value = data.total || 0;
      } finally {
        loading.value = false;
      }
    };
    const onSearch = () => {
      page.value = 1;
      loadData();
    };
    const onReset = () => {
      searchForm.keyword = "";
      onSearch();
    };
    const onPageChange = ({ page: nextPage, limit }: { page: number; limit: number }) => {
      page.value = nextPage;
      size.value = limit;
      loadData();
    };
    const onSelectionChange = (rows: VersionItem[]) => {
      selectedIds.value = rows.map((row) => row.id);
    };
    const editLink = (row: VersionItem) =>
      `/addon/sdk/version/edit?id=${row.id}&app_id=${appId}&name=${encodeURIComponent(gameName)}`;
    const onAdd = () =>
      router.push(`/addon/sdk/version/add?app_id=${appId}&name=${encodeURIComponent(gameName)}`);
    const onEdit = (row: VersionItem) => router.push(editLink(row));
    const onToggleActive = (row: VersionItem) => {
      const action =
        row.enabled === 1
          ? t("message.sdk.version.btnDeactivate")
          : t("message.sdk.version.btnActivate");
      ElMessageBox.confirm(
        t("message.sdk.version.toggleActiveConfirm", { action, code: row.version_code }),
        t("message.sdk.version.toggleActiveTitle"),
        { type: "warning" },
      )
        .then(async () => {
          await editVersion({
            id: row.id,
            app_id: row.app_id,
            version_code: row.version_code,
            enabled: row.enabled === 1 ? 0 : 1,
            version_name: row.version_name,
            version_desc: row.version_desc,
            url: row.url,
            force_update: row.force_update,
          });
          ElMessage.success(t("message.sdk.version.toggleActiveOk"));
          loadData();
        })
        .catch(() => {});
    };
    const onDelete = (row: VersionItem) => {
      ElMessageBox.confirm(
        t("message.sdk.version.deleteConfirm", { code: row.version_code }),
        t("message.sdk.version.deleteTitle"),
        { type: "warning" },
      )
        .then(async () => {
          await deleteVersion({ ids: [row.id] });
          ElMessage.success(t("message.common.msgDeleteOk"));
          loadData();
        })
        .catch(() => {});
    };
    const onBatchDelete = () => {
      if (!selectedIds.value.length) return;
      ElMessageBox.confirm(
        t("message.sdk.version.batchDeleteConfirm", { count: selectedIds.value.length }),
        t("message.sdk.version.deleteTitle"),
        { type: "warning" },
      )
        .then(async () => {
          await deleteVersion({ ids: selectedIds.value });
          ElMessage.success(t("message.sdk.version.batchDeleteOk"));
          selectedIds.value = [];
          loadData();
        })
        .catch(() => {});
    };
    onMounted(() => loadData());
    onActivated(() => loadData());
    return {
      appId,
      gameName,
      searchForm,
      searchFields,
      tableData,
      loading,
      tableSize,
      page,
      size,
      total,
      selectedIds,
      loadData,
      onSearch,
      onReset,
      onPageChange,
      onSelectionChange,
      editLink,
      onAdd,
      onEdit,
      onToggleActive,
      onDelete,
      onBatchDelete,
      Plus,
    };
  },
});
</script>

<style scoped>
.link-primary {
  color: var(--cc-color-primary);
  font-weight: 600;
  text-decoration: none;
}
.link-primary:hover {
  text-decoration: underline;
}
.mono-primary {
  color: var(--cc-color-primary);
  font-weight: 700;
}
</style>
