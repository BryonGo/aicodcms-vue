<template>
  <ProPage
    :title="$t('message.pms.param.breadcrumbCurrent')"
    :subtitle="
      $t('message.pms.systemManagement') + ' / ' + $t('message.pms.param.breadcrumbCurrent')
    "
  >
    <ProSearch
      v-model="state.params"
      :fields="searchFields"
      collapsible
      :collapse-threshold="3"
      @search="search"
      @reset="reset"
    />

    <div>
      <ProToolbar :size="density" @refresh="query" @update:size="density = $event as any">
        <template #left>
          <el-button type="primary" :icon="PlusIcon" @click="onOpenAddDic">{{
            $t("message.common.add")
          }}</el-button>
          <el-button
            type="danger"
            :icon="DeleteIcon"
            :disabled="!state.ids.length"
            @click="onBatchDelete"
          >
            {{ $t("message.common.btnDelete")
            }}<template v-if="state.ids.length"> ({{ state.ids.length }})</template>
          </el-button>
        </template>
      </ProToolbar>

      <ProTable
        :data="state.data"
        :loading="state.loading"
        :total="state.total"
        :page="state.page"
        :page-size="state.size"
        :size="density"
        row-key="param_id"
        selection
        @selection-change="onSelectionChange"
        @pagination="onPageChange"
      >
        <el-table-column
          prop="param_id"
          :label="$t('message.common.colId')"
          width="80"
          align="center"
        />
        <el-table-column
          prop="param_name"
          :label="$t('message.common.colName')"
          min-width="120"
          show-overflow-tooltip
        />
        <el-table-column
          prop="param_key"
          :label="$t('message.pms.param.colKey')"
          min-width="120"
          show-overflow-tooltip
        />
        <el-table-column
          prop="param_value"
          :label="$t('message.pms.param.colValue')"
          min-width="120"
          show-overflow-tooltip
        />
        <el-table-column :label="$t('message.common.type')" width="100" align="center">
          <template #default="{ row }">{{ typeFormat(row) }}</template>
        </el-table-column>
        <el-table-column
          prop="remark"
          :label="$t('message.common.colRemark')"
          min-width="160"
          show-overflow-tooltip
        />
        <el-table-column :label="$t('message.common.colCreateTime')" width="160">
          <template #default="{ row }">
            <span class="text-muted">{{ parseTime(row.created_at, "{y}-{m}-{d} {h}:{i}") }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('message.common.colOperation')" width="170" fixed="right">
          <template #default="{ row }">
            <el-button link size="small" type="primary" @click="onOpenEditDic(row)">{{
              $t("message.common.btnEdit")
            }}</el-button>
            <el-button link size="small" type="danger" @click="onRowDel(row)">{{
              $t("message.common.btnRemove")
            }}</el-button>
          </template>
        </el-table-column>
      </ProTable>
    </div>
  </ProPage>
</template>

<script setup lang="ts">
import { ref, unref, getCurrentInstance } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { ElMessage, ElMessageBox } from "element-plus";
import { Plus as PlusIcon, Delete as DeleteIcon } from "@element-plus/icons-vue";

import ProPage from "/@/components/pro/ProPage.vue";
import ProSearch, { type ProSearchField } from "/@/components/pro/ProSearch.vue";
import ProToolbar from "/@/components/pro/ProToolbar.vue";
import ProTable from "/@/components/pro/ProTable.vue";
import { useProTable } from "/@/composables/useProTable";

import { deleteParam, getParamList } from "/@/api/pms/param";
import { parseTime } from "/@/utils/aicodcod";

const { t } = useI18n();
const router = useRouter();
const { proxy } = <any>getCurrentInstance();
const { sys_yes_no } = proxy.useDict("sys_yes_no");

const density = ref<"large" | "default" | "small">("default");

const searchFields: ProSearchField[] = [
  {
    prop: "param_name",
    label: t("message.common.colName"),
    type: "input",
    placeholder: t("message.pms.param.placeholderName"),
  },
  {
    prop: "param_key",
    label: t("message.pms.param.colKey"),
    type: "input",
    placeholder: t("message.pms.param.placeholderKey"),
  },
  {
    prop: "param_type",
    label: t("message.common.type"),
    type: "select",
    placeholder: t("message.common.type"),
    get options() {
      const arr = unref(sys_yes_no);
      if (!arr || !arr.length) return [];
      return arr.map((d: any) => ({ label: d.label, value: d.value }));
    },
  } as any,
  {
    prop: "dateRange",
    label: t("message.common.colCreateTime"),
    type: "daterange",
    width: "260px",
  },
];

const { state, query, search, reset, onPageChange, onSelectionChange, remove } = useProTable({
  api: getParamList,
  defaults: { param_name: "", param_key: "", param_type: "", dateRange: [] },
  pageKey: "page",
  sizeKey: "row",
  defaultPageSize: 10,
  transform: (res) => ({
    list: res?.data?.list ?? [],
    total: res?.data?.total ?? 0,
  }),
  deleteApi: deleteParam,
  rowKey: "param_id",
});

const typeFormat = (row: any) => proxy.selectDictLabel(unref(sys_yes_no), row.param_type);

const onOpenAddDic = () => router.push("/pms/param/list/add");
const onOpenEditDic = (row: any) => router.push(`/pms/param/list/edit?id=${row.param_id}`);

const onRowDel = (row: any) => {
  ElMessageBox.confirm(
    t("message.common.confirmDeleteSingle") + ` (${row.param_name})`,
    t("message.common.confirmTitle"),
    {
      confirmButtonText: t("message.common.confirm"),
      cancelButtonText: t("message.common.cancel"),
      type: "warning",
    },
  )
    .then(() => {
      deleteParam([row.param_id]).then(() => {
        ElMessage.success(t("message.common.msgDeleteOk"));
        query();
      });
    })
    .catch(() => {});
};

const onBatchDelete = () => {
  if (!state.ids.length) {
    ElMessage.warning(t("message.common.msgSelectDelete"));
    return;
  }
  ElMessageBox.confirm(t("message.common.confirmDeleteBatch"), t("message.common.confirmTitle"), {
    confirmButtonText: t("message.common.confirm"),
    cancelButtonText: t("message.common.cancel"),
    type: "warning",
  })
    .then(() => remove())
    .catch(() => {});
};
</script>

<style scoped>
.text-muted {
  color: var(--cc-color-text-3);
}
</style>
