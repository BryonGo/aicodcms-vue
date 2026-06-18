<template>
  <ProPage
    :title="$t('message.cms.pageList.breadcrumbPage')"
    :subtitle="
      $t('message.cms.pageList.breadcrumbCms') + ' / ' + $t('message.cms.pageList.breadcrumbPage')
    "
  >
    <template #actions>
      <el-button type="primary" :icon="Plus" v-auth="'api/v1/admin/page/add'" @click="handleAdd">
        {{ $t("message.common.btnAdd") }}
      </el-button>
    </template>

    <ProSearch
      v-model="state.tableData.param"
      :fields="searchFields"
      @search="handleQuery"
      @reset="resetQuery"
    />

    <ProToolbar v-model:size="tableSize" @refresh="cmsPageList">
      <template #left>
        <span v-if="state.ids.length" class="sel-count"
          >{{ state.ids.length }}{{ $t("message.cms.articleList.selectedCount") }}</span
        >
        <el-button
          :icon="Delete"
          v-auth="'api/v1/admin/page/del'"
          :disabled="!state.ids.length"
          @click="handleDelete(null)"
        >
          {{ $t("message.common.btnDelete") }}
        </el-button>
      </template>
    </ProToolbar>

    <ProTable
      :data="state.tableData.data"
      :loading="loading"
      :size="tableSize"
      :total="state.tableData.total"
      :page="state.tableData.param.page"
      :page-size="state.tableData.param.row"
      selection
      @selection-change="handleSelectionChange"
      @pagination="onPageChange"
    >
      <el-table-column :label="$t('message.common.colId')" width="70" prop="id" align="center" />
      <el-table-column
        :label="$t('message.common.colName')"
        min-width="180"
        prop="title"
        show-overflow-tooltip
      />
      <el-table-column :label="$t('message.common.type')" width="90" prop="type" align="center" />
      <el-table-column
        :label="$t('message.cms.channelList.colFlag')"
        width="90"
        prop="flag"
        align="center"
      >
        <template #default="{ row }">
          <span v-if="row.flag" class="flag-pill">{{ row.flag }}</span>
          <span v-else class="cell-muted">-</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('message.cms.pageList.colViews')"
        width="80"
        prop="views"
        align="center"
      />
      <el-table-column
        :label="$t('message.cms.pageList.colWeigh')"
        width="80"
        prop="weigh"
        align="center"
      />
      <el-table-column :label="$t('message.common.colStatus')" width="90" align="center">
        <template #default="{ row }">
          <el-tag size="small" effect="plain" :type="row.status ? 'success' : 'info'">
            {{
              row.status
                ? $t("message.cms.pageList.statusEnabled")
                : $t("message.cms.pageList.statusDisabled")
            }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="$t('message.common.colCreateTime')" width="110" align="center">
        <template #default="{ row }">
          <span class="time-text">{{ proxy.parseTime(row.created_at, "{m}-{d}") }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('message.cms.pageList.colPublishTime')"
        width="110"
        align="center"
      >
        <template #default="{ row }">
          <span class="time-text">{{ proxy.parseTime(row.published_at, "{m}-{d}") }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('message.common.colOperation')"
        fixed="right"
        width="130"
        align="center"
      >
        <template #default="{ row }">
          <el-button
            link
            type="primary"
            size="small"
            v-auth="'api/v1/admin/page/edit'"
            @click="handleUpdate(row)"
          >
            <el-icon><Edit /></el-icon> {{ $t("message.common.btnEdit") }}
          </el-button>
          <el-button
            link
            type="danger"
            size="small"
            v-auth="'api/v1/admin/page/del'"
            @click="handleDelete(row)"
          >
            <el-icon><Delete /></el-icon> {{ $t("message.common.btnRemove") }}
          </el-button>
        </template>
      </el-table-column>
    </ProTable>
  </ProPage>
</template>

<script lang="ts">
import { computed, defineComponent, getCurrentInstance, onMounted, reactive, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useI18n } from "vue-i18n";
import { Plus, Delete, Edit } from "@element-plus/icons-vue";
import ProPage from "/@/components/pro/ProPage.vue";
import ProSearch, { type ProSearchField } from "/@/components/pro/ProSearch.vue";
import ProToolbar from "/@/components/pro/ProToolbar.vue";
import ProTable from "/@/components/pro/ProTable.vue";
import { delCmsPage, listCmsPage } from "/@/api/cms/page";
import {
  CmsPageInfoData,
  CmsPageTableColumns,
  CmsPageTableDataState,
} from "/@/views/cms/page/list/component/model";

export default defineComponent({
  name: "apiV1CmsPageList",
  components: { ProPage, ProSearch, ProToolbar, ProTable, Plus, Delete, Edit },
  setup() {
    const { t } = useI18n();
    const { proxy } = <any>getCurrentInstance();
    const loading = ref(false);
    const tableSize = ref<"large" | "default" | "small">("default");

    const state = reactive<CmsPageTableDataState>({
      ids: [],
      tableData: {
        data: [],
        total: 0,
        loading: false,
        param: { row: 10, page: 1, name: undefined },
      },
    });

    const searchFields = computed<ProSearchField[]>(() => [
      {
        prop: "name",
        label: t("message.common.colName"),
        placeholder: t("message.cms.pageList.searchPlaceholderName"),
        width: "240px",
      },
    ]);

    const cmsPageList = () => {
      loading.value = true;
      listCmsPage(state.tableData.param)
        .then((res: any) => {
          state.tableData.data = res.data.list ?? [];
          state.tableData.total = res.data.total ?? 0;
        })
        .finally(() => {
          loading.value = false;
        });
    };

    const handleQuery = () => {
      state.tableData.param.page = 1;
      cmsPageList();
    };

    const resetQuery = () => {
      state.tableData.param.name = undefined;
      state.tableData.param.page = 1;
      cmsPageList();
    };

    const onPageChange = ({ page, limit }: { page: number; limit: number }) => {
      state.tableData.param.page = page;
      state.tableData.param.row = limit;
      cmsPageList();
    };

    const handleSelectionChange = (selection: CmsPageInfoData[]) => {
      state.ids = selection.map((item) => item.id);
    };

    const handleAdd = () => {
      proxy.$router.push("/cms/page/list/add");
    };

    const handleUpdate = (row: CmsPageTableColumns) => {
      proxy.$router.push(`/cms/page/list/edit?id=${row.id}`);
    };

    const handleDelete = (row: CmsPageTableColumns | null) => {
      const ids = row ? [row.id] : state.ids;
      if (!ids.length) {
        ElMessage.error(t("message.common.msgSelectDelete"));
        return;
      }
      const msg = row
        ? t("message.common.confirmDeleteSingle")
        : t("message.common.confirmDeleteBatch");
      ElMessageBox.confirm(msg, t("message.common.confirmTitle"), {
        confirmButtonText: t("message.common.confirm"),
        cancelButtonText: t("message.common.cancel"),
        type: "warning",
      })
        .then(() =>
          delCmsPage(ids).then(() => {
            ElMessage.success(t("message.common.msgDeleteOk"));
            cmsPageList();
          }),
        )
        .catch(() => {});
    };

    onMounted(() => cmsPageList());

    return {
      proxy,
      loading,
      tableSize,
      state,
      searchFields,
      cmsPageList,
      handleQuery,
      resetQuery,
      onPageChange,
      handleSelectionChange,
      handleAdd,
      handleUpdate,
      handleDelete,
      Plus,
      Delete,
      Edit,
    };
  },
});
</script>

<style scoped>
.sel-count,
.time-text,
.cell-muted {
  font-size: var(--cc-font-13);
  color: var(--cc-color-text-3);
}
.flag-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  padding: 1px 8px;
  border: 1px solid var(--cc-color-border-light);
  border-radius: var(--cc-radius-sm);
  background: var(--cc-color-surface-hover);
  color: var(--cc-color-text-2);
  font-size: var(--cc-font-12);
  line-height: 20px;
}
</style>
