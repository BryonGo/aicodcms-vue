<template>
  <ProPage
    :title="$t('message.pms.monitor.onlineTitle')"
    :subtitle="$t('message.pms.systemManagement') + ' / ' + $t('message.pms.monitor.onlineTitle')"
  >
    <ProSearch v-model="state.params" :fields="searchFields" @search="search" @reset="reset" />

    <div>
      <ProToolbar :size="density" @refresh="query" @update:size="density = $event as any">
        <template #left>
          <el-button
            type="danger"
            :icon="DeleteIcon"
            :disabled="!state.ids.length"
            @click="onForceLogoutBatch"
          >
            {{ $t("message.pms.userOnline.forceLogout")
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
        row-key="id"
        selection
        @selection-change="onSelectionChange"
        @pagination="onPageChange"
      >
        <el-table-column type="index" label="#" width="60" align="center" />
        <el-table-column
          prop="uuid"
          :label="$t('message.pms.userOnline.colSession')"
          min-width="220"
          show-overflow-tooltip
        />
        <el-table-column
          prop="user_name"
          :label="$t('message.pms.loginLog.colLoginName')"
          min-width="120"
          show-overflow-tooltip
        />
        <el-table-column
          prop="ip"
          :label="$t('message.pms.loginLog.colIp')"
          width="140"
          show-overflow-tooltip
        />
        <el-table-column
          prop="explorer"
          :label="$t('message.pms.loginLog.colBrowser')"
          min-width="120"
          show-overflow-tooltip
        />
        <el-table-column
          prop="os"
          :label="$t('message.pms.loginLog.colOs')"
          width="120"
          show-overflow-tooltip
        />
        <el-table-column :label="$t('message.pms.loginLog.colTime')" width="160">
          <template #default="{ row }">
            <span class="text-muted">{{ parseTime(row.created_at, "{y}-{m}-{d} {h}:{i}") }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('message.common.colOperation')" width="120" fixed="right">
          <template #default="{ row }">
            <el-button link size="small" type="danger" @click="onForceLogoutOne(row)">
              {{ $t("message.pms.userOnline.forceLogout") }}
            </el-button>
          </template>
        </el-table-column>
      </ProTable>
    </div>
  </ProPage>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { ElMessage, ElMessageBox } from "element-plus";
import { Delete as DeleteIcon } from "@element-plus/icons-vue";

import ProPage from "/@/components/pro/ProPage.vue";
import ProSearch, { type ProSearchField } from "/@/components/pro/ProSearch.vue";
import ProToolbar from "/@/components/pro/ProToolbar.vue";
import ProTable from "/@/components/pro/ProTable.vue";
import { useProTable } from "/@/composables/useProTable";

import { forceLogout, listSysUserOnline } from "/@/api/pms/monitor/online";
import { parseTime } from "/@/utils/aicodcod";

const { t } = useI18n();

const density = ref<"large" | "default" | "small">("default");

const searchFields: ProSearchField[] = [
  {
    prop: "ipaddr",
    label: t("message.pms.loginLog.labelIp"),
    type: "input",
    placeholder: t("message.pms.loginLog.placeholderIp"),
  },
  {
    prop: "user_name",
    label: t("message.pms.loginLog.labelUserName"),
    type: "input",
    placeholder: t("message.pms.loginLog.placeholderUserName"),
  },
];

const { state, query, search, reset, onPageChange, onSelectionChange } = useProTable({
  api: listSysUserOnline,
  defaults: { ipaddr: "", user_name: "" },
  pageKey: "page",
  sizeKey: "row",
  defaultPageSize: 10,
  transform: (res) => ({
    list: res?.data?.list ?? [],
    total: res?.data?.total ?? 0,
  }),
  rowKey: "id",
});

const onForceLogoutOne = (row: any) => {
  ElMessageBox.confirm(
    t("message.pms.userOnline.forceLogoutConfirm") + ` (${row.user_name})`,
    t("message.common.confirmTitle"),
    {
      confirmButtonText: t("message.common.confirm"),
      cancelButtonText: t("message.common.cancel"),
      type: "warning",
    },
  )
    .then(() => {
      forceLogout([row.id]).then(() => {
        ElMessage.success(t("message.pms.userOnline.forceLogoutOk"));
        query();
      });
    })
    .catch(() => {});
};

const onForceLogoutBatch = () => {
  if (!state.ids.length) {
    ElMessage.warning(t("message.pms.userOnline.selectForceLogout"));
    return;
  }
  ElMessageBox.confirm(
    t("message.pms.userOnline.forceLogoutBatchConfirm"),
    t("message.common.confirmTitle"),
    {
      confirmButtonText: t("message.common.confirm"),
      cancelButtonText: t("message.common.cancel"),
      type: "warning",
    },
  )
    .then(() => {
      forceLogout(state.ids as number[]).then(() => {
        ElMessage.success(t("message.pms.userOnline.forceLogoutOk"));
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
