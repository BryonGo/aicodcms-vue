<template>
  <ProPage
    :title="$t('message.pms.dict.breadcrumbCurrent')"
    :subtitle="
      $t('message.pms.systemManagement') + ' / ' + $t('message.pms.dict.breadcrumbCurrent')
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
        row-key="dict_id"
        selection
        @selection-change="onSelectionChange"
        @pagination="onPageChange"
      >
        <el-table-column
          prop="dict_id"
          :label="$t('message.common.colId')"
          width="80"
          align="center"
        />
        <el-table-column
          prop="dict_name"
          :label="$t('message.common.colName')"
          min-width="140"
          show-overflow-tooltip
        />
        <el-table-column :label="$t('message.common.type')" min-width="140">
          <template #default="{ row }">
            <router-link :to="'/pms/dict/data/list/' + row.dict_type" class="link-type">{{
              row.dict_type
            }}</router-link>
          </template>
        </el-table-column>
        <el-table-column :label="$t('message.common.colStatus')" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status ? 'success' : 'info'" effect="light" size="small">
              {{
                row.status
                  ? $t("message.pms.dict.statusEnabled")
                  : $t("message.pms.dict.statusDisabled")
              }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="remark"
          :label="$t('message.common.colRemark')"
          min-width="180"
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
import { ref, getCurrentInstance } from "vue";
import { useI18n } from "vue-i18n";
import { ElMessage, ElMessageBox } from "element-plus";
import { Plus as PlusIcon, Delete as DeleteIcon } from "@element-plus/icons-vue";

import ProPage from "/@/components/pro/ProPage.vue";
import ProSearch, { type ProSearchField } from "/@/components/pro/ProSearch.vue";
import ProToolbar from "/@/components/pro/ProToolbar.vue";
import ProTable from "/@/components/pro/ProTable.vue";
import { useProTable } from "/@/composables/useProTable";

import { deleteType, getTypeList } from "/@/api/pms/dict/type";
import { parseTime } from "/@/utils/aicodcod";

const { t } = useI18n();
const { proxy } = <any>getCurrentInstance();

const density = ref<"large" | "default" | "small">("default");

const searchFields: ProSearchField[] = [
  {
    prop: "dict_name",
    label: t("message.common.colName"),
    type: "input",
    placeholder: t("message.pms.dict.placeholderName"),
  },
  {
    prop: "dict_type",
    label: t("message.common.type"),
    type: "input",
    placeholder: t("message.pms.dict.placeholderType"),
  },
  {
    prop: "status",
    label: t("message.pms.dict.labelStatus"),
    type: "select",
    placeholder: t("message.pms.dict.placeholderStatus"),
    options: [
      { label: t("message.pms.dict.statusEnabled"), value: 1 },
      { label: t("message.pms.dict.statusDisabled"), value: 0 },
    ],
  },
  {
    prop: "dateRange",
    label: t("message.common.colCreateTime"),
    type: "daterange",
    width: "260px",
  },
];

const { state, query, search, reset, onPageChange, onSelectionChange, remove } = useProTable({
  api: getTypeList,
  defaults: { dict_name: "", dict_type: "", status: "", dateRange: [] },
  pageKey: "page",
  sizeKey: "row",
  defaultPageSize: 10,
  transform: (res) => ({
    list: res?.data?.list ?? [],
    total: res?.data?.total ?? 0,
  }),
  deleteApi: deleteType,
  rowKey: "dict_id",
});

const onOpenAddDic = () => proxy.$router.push("/pms/dict/list/add");
const onOpenEditDic = (row: any) => proxy.$router.push(`/pms/dict/list/edit?id=${row.dict_id}`);

const onRowDel = (row: any) => {
  ElMessageBox.confirm(
    t("message.pms.dict.confirmDelete").replace("{name}", row.dict_name),
    t("message.common.confirmTitle"),
    {
      confirmButtonText: t("message.common.confirm"),
      cancelButtonText: t("message.common.cancel"),
      type: "warning",
    },
  )
    .then(() => {
      deleteType([row.dict_id]).then(() => {
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
.link-type {
  color: var(--cc-color-primary);
  cursor: pointer;
  text-decoration: none;
}
.link-type:hover {
  text-decoration: underline;
}
</style>
