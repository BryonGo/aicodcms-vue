<template>
  <ProPage
    :title="$t('message.pms.role.breadcrumbCurrent')"
    :subtitle="
      $t('message.pms.systemManagement') + ' / ' + $t('message.pms.role.breadcrumbCurrent')
    "
  >
    <ProSearch v-model="state.params" :fields="searchFields" @search="search" @reset="reset" />

    <div>
      <ProToolbar :size="density" @refresh="query" @update:size="density = $event as any">
        <template #left>
          <el-button type="primary" :icon="PlusIcon" @click="onOpenAddRole">
            {{ $t("message.common.add") }}
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
        row-key="id"
        @pagination="onPageChange"
      >
        <el-table-column
          type="index"
          :label="$t('message.common.colSort')"
          width="60"
          align="center"
        />
        <el-table-column
          prop="name"
          :label="$t('message.common.colName')"
          min-width="120"
          show-overflow-tooltip
        />
        <el-table-column
          prop="list_order"
          :label="$t('message.common.colSort')"
          width="80"
          align="center"
        />
        <el-table-column :label="$t('message.pms.role.labelRoleStatus')" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'" effect="light" size="small">
              {{
                row.status === 1
                  ? $t("message.pms.role.statusEnabled")
                  : $t("message.pms.role.statusDisabled")
              }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="remark"
          :label="$t('message.pms.role.labelRoleDesc')"
          min-width="180"
          show-overflow-tooltip
        />
        <el-table-column :label="$t('message.common.colCreateTime')" width="160">
          <template #default="{ row }">
            <span class="text-muted">{{ parseTime(row.created_at, "{y}-{m}-{d} {h}:{i}") }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('message.common.colOperation')" width="160" fixed="right">
          <template #default="{ row }">
            <el-button link size="small" type="primary" @click="onOpenEditRole(row)">
              {{ $t("message.common.btnEdit") }}
            </el-button>
            <el-button link size="small" type="danger" @click="onRowDel(row)">
              {{ $t("message.common.btnRemove") }}
            </el-button>
          </template>
        </el-table-column>
      </ProTable>
    </div>

    <EditRole ref="editRoleRef" @getRoleList="query" />
  </ProPage>
</template>

<script setup lang="ts">
import { ref, toRaw } from "vue";
import { useI18n } from "vue-i18n";
import { ElMessage, ElMessageBox } from "element-plus";
import { Plus as PlusIcon } from "@element-plus/icons-vue";

import ProPage from "/@/components/pro/ProPage.vue";
import ProSearch, { type ProSearchField } from "/@/components/pro/ProSearch.vue";
import ProToolbar from "/@/components/pro/ProToolbar.vue";
import ProTable from "/@/components/pro/ProTable.vue";
import { useProTable } from "/@/composables/useProTable";

import EditRole from "/@/views/pms/role/component/editRole.vue";
import { deleteRole, getRoleList } from "/@/api/pms/role";
import { parseTime } from "/@/utils/aicodcod";

const { t } = useI18n();

const density = ref<"large" | "default" | "small">("default");
const editRoleRef = ref();

const searchFields: ProSearchField[] = [
  {
    prop: "name",
    label: t("message.common.colName"),
    type: "input",
    placeholder: t("message.pms.role.placeholderName"),
  },
  {
    prop: "status",
    label: t("message.common.colStatus"),
    type: "select",
    placeholder: t("message.pms.role.placeholderStatus"),
    options: [
      { label: t("message.pms.role.statusEnabled"), value: "1" },
      { label: t("message.pms.role.statusDisabled"), value: "0" },
    ],
  },
];

const { state, query, search, reset, onPageChange } = useProTable({
  api: getRoleList,
  defaults: { name: "", status: "" },
  pageKey: "page",
  sizeKey: "row",
  defaultPageSize: 10,
  transform: (res) => ({
    list: res?.data?.list ?? [],
    total: res?.data?.total ?? 0,
  }),
  rowKey: "id",
});

const onOpenAddRole = () => editRoleRef.value?.openDialog();
const onOpenEditRole = (row: any) => editRoleRef.value?.openDialog(toRaw(row));

const onRowDel = (row: any) => {
  ElMessageBox.confirm(
    t("message.common.confirmDeleteSingle") + ` (${row.name})`,
    t("message.common.confirmTitle"),
    {
      confirmButtonText: t("message.common.confirm"),
      cancelButtonText: t("message.common.cancel"),
      type: "warning",
    },
  )
    .then(() => {
      deleteRole(row.id).then(() => {
        ElMessage.success(t("message.common.msgDeleteOk"));
        editRoleRef.value?.resetMenuSession?.();
        query();
      });
    })
    .catch(() => {});
};
</script>

<style scoped>
.text-muted {
  color: var(--cc-color-text-3);
}
</style>
