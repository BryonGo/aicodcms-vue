<template>
  <ProPage
    :title="$t('message.pms.loginLog.labelTitle')"
    :subtitle="$t('message.pms.systemManagement') + ' / ' + $t('message.pms.loginLog.labelTitle')"
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
          <el-button
            type="danger"
            :icon="DeleteIcon"
            :disabled="!state.ids.length"
            @click="onBatchDelete"
          >
            {{ $t("message.pms.loginLog.btnDeleteLog")
            }}<template v-if="state.ids.length"> ({{ state.ids.length }})</template>
          </el-button>
          <el-button type="danger" :icon="DeleteIcon" @click="onClearLog">
            {{ $t("message.pms.loginLog.btnClearLog") }}
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
        row-key="info_id"
        selection
        @selection-change="onSelectionChange"
        @pagination="onPageChange"
      >
        <el-table-column prop="info_id" label="ID" width="72" align="center" />
        <el-table-column
          prop="login_name"
          :label="$t('message.pms.loginLog.colLoginName')"
          min-width="120"
          show-overflow-tooltip
        />
        <el-table-column
          prop="ipaddr"
          :label="$t('message.pms.loginLog.colIp')"
          width="140"
          show-overflow-tooltip
        />
        <el-table-column
          prop="login_location"
          :label="$t('message.pms.loginLog.labelLocation')"
          min-width="140"
          show-overflow-tooltip
        />
        <el-table-column
          prop="browser"
          :label="$t('message.pms.loginLog.colBrowser')"
          min-width="120"
          show-overflow-tooltip
        />
        <el-table-column
          prop="os"
          :label="$t('message.pms.loginLog.colOs')"
          min-width="120"
          show-overflow-tooltip
        />
        <el-table-column :label="$t('message.common.colStatus')" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status == 0 ? 'success' : 'danger'" effect="light" size="small">
              {{ statusFormat(row) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="msg"
          :label="$t('message.pms.loginLog.colMsg')"
          min-width="160"
          show-overflow-tooltip
        />
        <el-table-column :label="$t('message.pms.loginLog.colTime')" width="160">
          <template #default="{ row }">
            <span class="text-muted">{{ parseTime(row.login_time, "{y}-{m}-{d} {h}:{i}") }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="module"
          :label="$t('message.pms.loginLog.colModule')"
          min-width="100"
          show-overflow-tooltip
        />
      </ProTable>
    </div>
  </ProPage>
</template>

<script setup lang="ts">
import { ref, unref, getCurrentInstance } from "vue";
import { useI18n } from "vue-i18n";
import { ElMessage, ElMessageBox } from "element-plus";
import { Delete as DeleteIcon } from "@element-plus/icons-vue";

import ProPage from "/@/components/pro/ProPage.vue";
import ProSearch, { type ProSearchField } from "/@/components/pro/ProSearch.vue";
import ProToolbar from "/@/components/pro/ProToolbar.vue";
import ProTable from "/@/components/pro/ProTable.vue";
import { useProTable } from "/@/composables/useProTable";

import { logList, deleteLog, clearLog } from "/@/api/pms/monitor/loginLog";
import { parseTime } from "/@/utils/aicodcod";

const { t } = useI18n();
const { proxy } = <any>getCurrentInstance();
const { admin_login_status } = proxy.useDict("admin_login_status");

const density = ref<"large" | "default" | "small">("default");

const statusOptions = ref<{ label: string; value: any }[]>([]);

// 字典 → ProSearch options（响应式延迟载入）
const buildStatusOptions = () => {
  const arr = unref(admin_login_status);
  if (!arr || !arr.length) return [];
  return arr.map((d: any) => ({ label: d.label, value: d.value }));
};

const searchFields: ProSearchField[] = [
  {
    prop: "ipaddr",
    label: t("message.pms.loginLog.labelIp"),
    type: "input",
    placeholder: t("message.pms.loginLog.placeholderIp"),
  },
  {
    prop: "login_location",
    label: t("message.pms.loginLog.labelLocation"),
    type: "input",
    placeholder: t("message.pms.loginLog.placeholderLocation"),
  },
  {
    prop: "user_name",
    label: t("message.pms.loginLog.labelUserName"),
    type: "input",
    placeholder: t("message.pms.loginLog.placeholderUserName"),
  },
  {
    prop: "status",
    label: t("message.pms.loginLog.labelStatus"),
    type: "select",
    placeholder: t("message.pms.loginLog.placeholderStatus"),
    get options() {
      const opts = buildStatusOptions();
      return opts.length ? opts : statusOptions.value;
    },
  } as any,
  {
    prop: "dateRange",
    label: t("message.pms.loginLog.labelTime"),
    type: "daterange",
    width: "260px",
  },
];

const { state, query, search, reset, onPageChange, onSelectionChange, remove } = useProTable({
  api: logList,
  defaults: { ipaddr: "", login_location: "", user_name: "", status: "", dateRange: [] },
  pageKey: "page",
  sizeKey: "row",
  defaultPageSize: 10,
  transform: (res) => ({
    list: res?.data?.list ?? [],
    total: res?.data?.total ?? 0,
  }),
  deleteApi: deleteLog,
  rowKey: "info_id",
});

// 字典查 label
const statusFormat = (row: any) => {
  return proxy.selectDictLabel(unref(admin_login_status), row.status);
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
      clearLog().then(() => {
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
