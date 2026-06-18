<template>
  <ProPage
    :title="$t('message.cms.blockList.breadcrumbs.block')"
    :subtitle="
      $t('message.cms.blockList.breadcrumbs.cms') +
      ' / ' +
      $t('message.cms.blockList.breadcrumbs.block')
    "
  >
    <template #actions>
      <el-button type="primary" :icon="Plus" @click="handleAdd">
        {{ $t("message.common.btnAdd") }}
      </el-button>
    </template>

    <ProSearch
      v-model="tableData.param"
      :fields="searchFields"
      @search="handleQuery"
      @reset="resetQuery"
    />

    <ProToolbar v-model:size="tableSize" @refresh="getList">
      <template #left>
        <span v-if="ids.length" class="sel-count"
          >{{ ids.length }}{{ $t("message.cms.articleList.selectedCount") }}</span
        >
        <el-button :icon="Delete" :disabled="multiple" @click="handleDelete(null)">
          {{ $t("message.common.btnDelete") }}
        </el-button>
      </template>
    </ProToolbar>

    <ProTable
      ref="tableRef"
      :data="tableData.data"
      :loading="loading"
      :size="tableSize"
      :total="tableData.total"
      :page="tableData.param.page"
      :page-size="tableData.param.row"
      :max-height="tableHeight"
      selection
      @selection-change="handleSelectionChange"
      @sort-change="handleSortChange"
      @pagination="onPageChange"
    >
      <el-table-column
        :label="$t('message.common.colId')"
        width="70"
        prop="id"
        align="center"
        sortable="custom"
      />
      <el-table-column
        :label="$t('message.common.colName')"
        min-width="130"
        prop="name"
        show-overflow-tooltip
      />
      <el-table-column
        :label="$t('message.cms.blockEdit.colTitle')"
        min-width="170"
        prop="title"
        show-overflow-tooltip
      />
      <el-table-column
        :label="$t('message.common.type')"
        min-width="90"
        prop="type"
        align="center"
      />
      <el-table-column
        :label="$t('message.cms.channelEdit.colWeigh')"
        width="100"
        prop="weigh"
        align="center"
        sortable="custom"
      >
        <template #default="{ row }">
          <el-input-number
            v-model="row.weigh"
            :min="0"
            :max="9999"
            size="small"
            controls-position="right"
            class="weigh-input"
            @change="(val: number) => handleWeighChange(row.id, val)"
          />
        </template>
      </el-table-column>
      <el-table-column :label="$t('message.common.colStatus')" min-width="90" align="center">
        <template #default="{ row }">
          <el-tag effect="plain" :type="row.status == 1 ? 'success' : 'info'">
            {{
              row.status == 1
                ? $t("message.cms.blockList.statusNormal")
                : $t("message.cms.blockList.statusHidden")
            }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('message.common.colCreateTime')"
        min-width="140"
        prop="created_at"
        align="center"
      >
        <template #default="scope">
          <span class="time-text">{{
            proxy.parseTime(scope.row.created_at, "{m}/{d} {h}:{i}")
          }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('message.common.colOperation')"
        fixed="right"
        width="150"
        align="center"
      >
        <template #default="scope">
          <el-button link size="small" type="primary" @click="handleUpdate(scope.row)">
            <el-icon><EditPen /></el-icon> {{ $t("message.common.btnEdit") }}
          </el-button>
          <el-button link size="small" type="danger" @click="handleDelete(scope.row)">
            <el-icon><Delete /></el-icon> {{ $t("message.common.btnDelete") }}
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
import { Plus, Delete, EditPen } from "@element-plus/icons-vue";
import ProPage from "/@/components/pro/ProPage.vue";
import ProSearch, { type ProSearchField } from "/@/components/pro/ProSearch.vue";
import ProToolbar from "/@/components/pro/ProToolbar.vue";
import ProTable from "/@/components/pro/ProTable.vue";
import { listCmsBlock, delCmsBlock, updateCmsBlockWeigh } from "/@/api/cms/block";

export default defineComponent({
  name: "apiCmsBlockList",
  components: { ProPage, ProSearch, ProToolbar, ProTable, Plus, Delete, EditPen },
  setup() {
    const { t } = useI18n();
    const { proxy } = <any>getCurrentInstance();
    const loading = ref(false);
    const tableRef = ref();
    const tableSize = ref<"large" | "default" | "small">("default");
    const tableHeight = ref("calc(100vh - 300px)");
    const multiple = ref(true);

    const state = reactive({
      ids: [] as number[],
      tableData: {
        data: [] as any[],
        total: 0,
        loading: false,
        param: {
          page: 1,
          row: 10,
          name: undefined as string | undefined,
          status: undefined as string | undefined,
          order: "weigh" as string,
          sort: "DESC" as string,
        },
      },
    });

    const searchFields = computed<ProSearchField[]>(() => [
      {
        prop: "name",
        label: t("message.common.colName"),
        placeholder: t("message.cms.blockList.searchPlaceholderName"),
        width: "220px",
      },
      {
        prop: "status",
        label: t("message.common.colStatus"),
        type: "select",
        placeholder: t("message.cms.blockList.searchPlaceholderStatus"),
        width: "160px",
        options: [
          { label: t("message.cms.blockList.statusNormal"), value: "1" },
          { label: t("message.cms.blockList.statusHidden"), value: "0" },
        ],
      },
    ]);

    const getList = () => {
      loading.value = true;
      listCmsBlock(state.tableData.param)
        .then((res: any) => {
          const d = res.data;
          state.tableData.data = d.list ?? [];
          state.tableData.total = d.total ?? 0;
        })
        .finally(() => {
          loading.value = false;
        });
    };

    const handleQuery = () => {
      state.tableData.param.page = 1;
      getList();
    };

    const resetQuery = () => {
      state.tableData.param.name = undefined;
      state.tableData.param.status = undefined;
      state.tableData.param.page = 1;
      getList();
    };

    const onPageChange = ({ page, limit }: { page: number; limit: number }) => {
      state.tableData.param.page = page;
      state.tableData.param.row = limit;
      getList();
    };

    const handleSelectionChange = (selection: any[]) => {
      state.ids = selection.map((item) => item.id);
      multiple.value = !selection.length;
    };

    const handleAdd = () => {
      proxy.$router.push("/cms/block/list/add");
    };
    const handleUpdate = (row: any) => {
      proxy.$router.push(`/cms/block/list/edit?id=${row.id}`);
    };

    const handleSortChange = ({ prop, order }: { prop: string; order: string }) => {
      state.tableData.param.order = prop || "weigh";
      state.tableData.param.sort = order === "ascending" ? "ASC" : "DESC";
      getList();
    };

    const handleWeighChange = (id: number, weigh: number) => {
      updateCmsBlockWeigh(id, weigh)
        .then(() => {
          ElMessage.success(t("message.weightUpdated"));
        })
        .catch(() => {
          getList();
        });
    };

    const handleDelete = (row: any) => {
      const ids = row ? [row.id] : state.ids;
      if (!ids.length) {
        ElMessage.error(t("message.common.msgSelectDelete"));
        return;
      }
      ElMessageBox.confirm(
        t("message.cms.blockList.confirmDelete"),
        t("message.common.confirmTitle"),
        {
          confirmButtonText: t("message.common.confirm"),
          cancelButtonText: t("message.common.cancel"),
          type: "warning",
        },
      )
        .then(() =>
          delCmsBlock(ids).then(() => {
            ElMessage.success(t("message.common.msgDeleteOk"));
            getList();
          }),
        )
        .catch(() => {});
    };

    onMounted(() => getList());

    return {
      proxy,
      loading,
      multiple,
      tableRef,
      tableSize,
      tableHeight,
      searchFields,
      resetQuery,
      getList,
      handleQuery,
      onPageChange,
      handleSelectionChange,
      handleDelete,
      handleAdd,
      handleUpdate,
      handleSortChange,
      handleWeighChange,
      Plus,
      Delete,
      EditPen,
      ...toRefs(state),
    };
  },
});
</script>

<style scoped>
.sel-count,
.time-text {
  font-size: var(--cc-font-13);
  color: var(--cc-color-text-3);
}
.weigh-input {
  width: 82px;
}
</style>
