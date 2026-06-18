<template>
  <ProPage
    :title="$t('message.pms.operLog.labelTitle')"
    :subtitle="$t('message.pms.systemManagement') + ' / ' + $t('message.pms.operLog.labelTitle')"
  >
    <ProSearch
      v-model="state.params"
      :fields="searchFields"
      collapsible
      :collapse-threshold="2"
      @search="search"
      @reset="reset"
    />

    <div>
      <ProToolbar :size="density" @refresh="query" @update:size="density = $event as any">
        <template #left>
          <el-button
            type="danger"
            :icon="DeleteIcon"
            :disabled="!state.ids.length"
            v-auth="'api/v1/pms/sysOperLog/delete'"
            @click="onBatchDelete"
          >
            {{ $t("message.common.btnDelete")
            }}<template v-if="state.ids.length"> ({{ state.ids.length }})</template>
          </el-button>
          <el-button type="danger" :icon="DeleteIcon" @click="onClearLog">
            {{ $t("message.pms.operLog.btnClear") }}
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
        row-key="oper_id"
        selection
        @selection-change="onSelectionChange"
        @pagination="onPageChange"
      >
        <el-table-column
          prop="oper_id"
          :label="$t('message.common.colId')"
          width="80"
          align="center"
        />
        <el-table-column
          prop="title"
          :label="$t('message.pms.operLog.labelModule')"
          min-width="120"
          show-overflow-tooltip
        />
        <el-table-column :label="$t('message.pms.operLog.labelMethod')" width="100" align="center">
          <template #default="{ row }">
            <el-tag size="small" :type="methodTagType(row.request_method)" effect="light">
              {{ requestMethodFormat(row) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="oper_name"
          :label="$t('message.pms.operLog.labelOperator')"
          width="120"
          show-overflow-tooltip
        />
        <el-table-column
          prop="dept_name"
          :label="$t('message.pms.operLog.colDept')"
          width="120"
          show-overflow-tooltip
        />
        <el-table-column
          prop="oper_url"
          :label="$t('message.pms.operLog.colUrl')"
          min-width="200"
          show-overflow-tooltip
        />
        <el-table-column
          prop="oper_ip"
          :label="$t('message.pms.operLog.colIp')"
          width="140"
          show-overflow-tooltip
        />
        <el-table-column
          prop="oper_location"
          :label="$t('message.pms.operLog.colLocation')"
          min-width="120"
          show-overflow-tooltip
        />
        <el-table-column :label="$t('message.pms.operLog.labelTime')" width="170">
          <template #default="{ row }">
            <span class="text-muted">{{
              parseTime(row.oper_time, "{y}-{m}-{d} {h}:{i}:{s}")
            }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('message.common.colOperation')" width="160" fixed="right">
          <template #default="{ row }">
            <el-button
              link
              size="small"
              type="primary"
              v-auth="'api/v1/pms/sysOperLog/view'"
              @click="handleView(row)"
            >
              {{ $t("message.common.btnDetail") }}
            </el-button>
            <el-button
              link
              size="small"
              type="danger"
              v-auth="'api/v1/pms/sysOperLog/delete'"
              @click="onRowDel(row)"
            >
              {{ $t("message.common.btnDelete") }}
            </el-button>
          </template>
        </el-table-column>
      </ProTable>
    </div>

    <apiV1SystemSysOperLogDetail
      ref="detailRef"
      :request_methodOptions="sys_oper_log_type"
      :deptNameOptions="deptNameOptions"
      @sysOperLogList="query"
    />
  </ProPage>
</template>

<script setup lang="ts">
import { ref, unref, toRaw, getCurrentInstance } from "vue";
import { useI18n } from "vue-i18n";
import { ElMessage, ElMessageBox } from "element-plus";
import { Delete as DeleteIcon } from "@element-plus/icons-vue";

import ProPage from "/@/components/pro/ProPage.vue";
import ProSearch, { type ProSearchField } from "/@/components/pro/ProSearch.vue";
import ProToolbar from "/@/components/pro/ProToolbar.vue";
import ProTable from "/@/components/pro/ProTable.vue";
import { useProTable } from "/@/composables/useProTable";

import { listSysOperLog, delSysOperLog, clearOperLog } from "/@/api/pms/monitor/operLog";
import type { ItemOptions } from "/@/api/items";
import apiV1SystemSysOperLogDetail from "/@/views/pms/monitor/operLog/component/detail.vue";
import { parseTime } from "/@/utils/aicodcod";

const { t } = useI18n();
const { proxy } = <any>getCurrentInstance();
const { sys_oper_log_type } = proxy.useDict("sys_oper_log_type");

const density = ref<"large" | "default" | "small">("default");
const detailRef = ref();
const deptNameOptions = ref<Array<ItemOptions>>([]);

// 字典转 search options（响应式）
const statusGetter = {
  get options() {
    const arr = unref(sys_oper_log_type);
    if (!arr || !arr.length) return [];
    return arr.map((d: any) => ({ label: d.label, value: d.value }));
  },
};

const searchFields: ProSearchField[] = [
  {
    prop: "title",
    label: t("message.pms.operLog.labelModule"),
    type: "input",
    placeholder: t("message.pms.operLog.placeholderModule"),
  },
  {
    prop: "request_method",
    label: t("message.pms.operLog.labelMethod"),
    type: "select",
    placeholder: t("message.pms.operLog.placeholderMethod"),
    ...(statusGetter as any),
  },
  {
    prop: "oper_name",
    label: t("message.pms.operLog.labelOperator"),
    type: "input",
    placeholder: t("message.pms.operLog.placeholderOperator"),
  },
  {
    prop: "dateRange",
    label: t("message.pms.operLog.labelTime"),
    type: "daterange",
    width: "260px",
  },
];

const { state, query, search, reset, onPageChange, onSelectionChange, remove } = useProTable({
  api: listSysOperLog,
  defaults: { title: undefined, request_method: undefined, oper_name: undefined, dateRange: [] },
  pageKey: "page",
  sizeKey: "row",
  defaultPageSize: 10,
  transform: (res) => ({
    list: res?.data?.list ?? [],
    total: res?.data?.total ?? 0,
  }),
  deleteApi: delSysOperLog,
  rowKey: "oper_id",
});

// 请求方式字典翻译
const requestMethodFormat = (row: any) => {
  return proxy.selectDictLabel(unref(sys_oper_log_type), row.request_method);
};

// 请求方式 tag 配色
const methodTagType = (method: any): "success" | "info" | "warning" | "danger" | "primary" => {
  const m = String(method || "").toUpperCase();
  if (m === "GET" || m === "1") return "success";
  if (m === "POST" || m === "2") return "primary";
  if (m === "PUT" || m === "3") return "warning";
  if (m === "DELETE" || m === "4") return "danger";
  return "info";
};

const handleView = (row: any) => {
  detailRef.value?.openDialog(toRaw(row));
};

const onRowDel = (row: any) => {
  ElMessageBox.confirm(t("message.common.confirmDeleteSingle"), t("message.common.confirmTitle"), {
    confirmButtonText: t("message.common.confirm"),
    cancelButtonText: t("message.common.cancel"),
    type: "warning",
  })
    .then(() => {
      delSysOperLog([row.oper_id]).then(() => {
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

const onClearLog = () => {
  ElMessageBox.confirm(t("message.common.confirmDeleteBatch"), t("message.common.confirmTitle"), {
    confirmButtonText: t("message.common.confirm"),
    cancelButtonText: t("message.common.cancel"),
    type: "warning",
  })
    .then(() => {
      clearOperLog().then(() => {
        ElMessage.success(t("message.common.msgDeleteOk"));
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
