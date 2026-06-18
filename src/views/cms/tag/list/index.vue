<template>
  <ProPage
    :title="$t('message.cms.tagList.breadcrumbs.tag')"
    :subtitle="
      $t('message.cms.tagList.breadcrumbs.cms') + ' / ' + $t('message.cms.tagList.breadcrumbs.tag')
    "
  >
    <template #actions>
      <el-button type="primary" :icon="Plus" v-auth="'api/v1/cms/tag/add'" @click="handleAdd">
        {{ $t("message.common.btnAdd") }}
      </el-button>
    </template>

    <ProSearch
      v-model="tableData.param"
      :fields="searchFields"
      @search="handleQuery"
      @reset="resetQuery"
    />

    <ProToolbar v-model:size="tableSize" @refresh="cmsTagsList">
      <template #left>
        <span v-if="ids.length" class="sel-count"
          >{{ ids.length }}{{ $t("message.cms.articleList.selectedCount") }}</span
        >
        <el-button
          :icon="Delete"
          v-auth="'api/v1/cms/tag/delete'"
          :disabled="multiple"
          @click="handleDelete(null)"
        >
          {{ $t("message.common.btnDelete") }}
        </el-button>
      </template>
    </ProToolbar>

    <ProTable
      :data="tableData.data"
      :loading="loading"
      :size="tableSize"
      :total="tableData.total"
      :page="tableData.param.page"
      :page-size="tableData.param.row"
      selection
      @selection-change="handleSelectionChange"
      @pagination="onPageChange"
    >
      <el-table-column align="center" :label="$t('message.common.colId')" prop="id" width="80" />
      <el-table-column
        align="center"
        :label="$t('message.common.colName')"
        prop="name"
        min-width="130"
        show-overflow-tooltip
      />
      <el-table-column
        align="center"
        :label="$t('message.cms.articleEdit.colSeotitle')"
        prop="seotitle"
        min-width="160"
        show-overflow-tooltip
      />
      <el-table-column
        align="center"
        :label="$t('message.cms.articleEdit.colKeywords')"
        prop="keywords"
        min-width="140"
        show-overflow-tooltip
      />
      <el-table-column
        align="center"
        :label="$t('message.cms.tagList.colDescription')"
        prop="description"
        min-width="200"
        show-overflow-tooltip
      />
      <el-table-column
        align="center"
        :label="$t('message.cms.tagList.colViews')"
        prop="views"
        width="90"
      />
      <el-table-column
        align="center"
        :label="$t('message.cms.tagList.colAutolink')"
        prop="autolink"
        width="100"
      >
        <template #default="{ row }">
          <el-tag size="small" effect="plain" :type="row.autolink == 1 ? 'success' : 'info'">
            {{
              row.autolink == 1
                ? $t("message.cms.tagList.autolinkOn")
                : $t("message.cms.tagList.autolinkOff")
            }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        fixed="right"
        :label="$t('message.common.colOperation')"
        width="150"
      >
        <template #default="{ row }">
          <el-button
            link
            size="small"
            type="primary"
            v-auth="'api/v1/cms/tag/edit'"
            @click="handleUpdate(row)"
          >
            {{ $t("message.common.btnEdit") }}
          </el-button>
          <el-button
            link
            size="small"
            type="danger"
            v-auth="'api/v1/cms/tag/del'"
            @click="handleDelete(row)"
          >
            {{ $t("message.common.btnRemove") }}
          </el-button>
        </template>
      </el-table-column>
    </ProTable>
  </ProPage>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  getCurrentInstance,
  onMounted,
  reactive,
  ref,
  toRefs,
} from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useI18n } from "vue-i18n";
import { Plus, Delete } from "@element-plus/icons-vue";
import ProPage from "/@/components/pro/ProPage.vue";
import ProSearch, { type ProSearchField } from "/@/components/pro/ProSearch.vue";
import ProToolbar from "/@/components/pro/ProToolbar.vue";
import ProTable from "/@/components/pro/ProTable.vue";
import { delCmsTags, listCmsTags } from "/@/api/cms/tag";
import {
  CmsTagsInfoData,
  CmsTagsTableColumns,
  CmsTagsTableDataState,
} from "/@/views/cms/tag/list/component/model";

export default defineComponent({
  name: "apiV1CmsTagsList",
  components: { ProPage, ProSearch, ProToolbar, ProTable, Plus, Delete },
  setup() {
    const { t } = useI18n();
    const { proxy } = <any>getCurrentInstance();
    const loading = ref(false);
    const multiple = ref(true);
    const tableSize = ref<"large" | "default" | "small">("default");

    const state = reactive<CmsTagsTableDataState>({
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
        placeholder: t("message.cms.tagList.searchPlaceholderName"),
        width: "240px",
      },
    ]);

    const cmsTagsList = () => {
      loading.value = true;
      listCmsTags(state.tableData.param)
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
      cmsTagsList();
    };

    const resetQuery = () => {
      state.tableData.param.name = undefined;
      state.tableData.param.page = 1;
      cmsTagsList();
    };

    const onPageChange = ({ page, limit }: { page: number; limit: number }) => {
      state.tableData.param.page = page;
      state.tableData.param.row = limit;
      cmsTagsList();
    };

    const handleSelectionChange = (selection: Array<CmsTagsInfoData>) => {
      state.ids = selection.map((item) => item.id);
      multiple.value = !selection.length;
    };

    const handleAdd = () => {
      proxy.$router.push("/cms/tag/list/add");
    };

    const handleUpdate = (row: CmsTagsTableColumns) => {
      proxy.$router.push(`/cms/tag/list/edit?id=${row.id}`);
    };

    const handleDelete = (row: CmsTagsTableColumns | null) => {
      let msg = t("message.common.confirmDeleteBatch");
      let id: number[] = [];
      if (row) {
        msg = t("message.common.confirmDeleteSingle");
        id = [row.id];
      } else {
        id = state.ids;
      }
      if (id.length === 0) {
        ElMessage.error(t("message.common.msgSelectDelete"));
        return;
      }
      ElMessageBox.confirm(msg, t("message.common.confirmTitle"), {
        confirmButtonText: t("message.common.confirm"),
        cancelButtonText: t("message.common.cancel"),
        type: "warning",
      })
        .then(() =>
          delCmsTags(id).then(() => {
            ElMessage.success(t("message.common.msgDeleteOk"));
            cmsTagsList();
          }),
        )
        .catch(() => {});
    };

    onMounted(() => cmsTagsList());

    return {
      proxy,
      loading,
      multiple,
      tableSize,
      searchFields,
      cmsTagsList,
      handleQuery,
      resetQuery,
      onPageChange,
      handleSelectionChange,
      handleAdd,
      handleUpdate,
      handleDelete,
      Plus,
      Delete,
      ...toRefs(state),
    };
  },
});
</script>

<style scoped>
.sel-count {
  font-size: var(--cc-font-13);
  color: var(--cc-color-text-3);
}
</style>
