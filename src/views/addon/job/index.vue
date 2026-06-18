<template>
  <ProPage
    :title="$t('message.pms.job.listBreadcrumbCurrent')"
    :subtitle="$t('message.pms.job.pageSubtitle')"
  >
    <template #actions>
      <el-button type="primary" :icon="Plus" @click="onOpenAdd">
        {{ $t("message.pms.job.addJob") }}
      </el-button>
    </template>

    <ProSearch
      v-model="query"
      :fields="searchFields"
      :search-text="$t('message.common.search')"
      :reset-text="$t('message.common.reset')"
      @search="onSearch"
      @reset="resetQuery"
    />

    <ProToolbar v-model:size="tableSize" @refresh="fetchList" />

    <ProTable
      :data="tableData"
      :loading="loading"
      :size="tableSize"
      :total="total"
      :page="query.page"
      :page-size="query.pageSize"
      @pagination="onPageChange"
    >
      <el-table-column
        :label="$t('message.pms.job.colJobId')"
        prop="job_id"
        width="80"
        align="center"
      />
      <el-table-column
        :label="$t('message.pms.job.labelJobName')"
        prop="job_name"
        min-width="150"
        show-overflow-tooltip
      />
      <el-table-column
        :label="$t('message.pms.job.labelJobGroup')"
        prop="job_group"
        width="110"
        align="center"
      >
        <template #default="{ row }">
          <el-tag size="small" effect="plain">{{ row.job_group }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('message.pms.job.colInvokeTarget')"
        prop="invoke_target"
        min-width="220"
        show-overflow-tooltip
      >
        <template #default="{ row }">
          <span class="mono-text">{{ row.invoke_target }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('message.pms.job.colCronExpr')"
        prop="cron_expression"
        min-width="160"
      >
        <template #default="{ row }">
          <span class="mono-text">{{ row.cron_expression }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('message.pms.job.labelStatus')" width="90" align="center">
        <template #default="scope">
          <el-tag :type="scope.row.status === 0 ? 'success' : 'info'" effect="plain">
            {{
              scope.row.status === 0
                ? $t("message.pms.job.statusNormal")
                : $t("message.pms.job.statusStop")
            }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('message.common.colOperation')"
        width="290"
        fixed="right"
        align="center"
      >
        <template #default="scope">
          <el-button link size="small" type="primary" @click="onOpenEdit(scope.row)">
            <el-icon><Edit /></el-icon>{{ $t("message.common.edit") }}
          </el-button>
          <el-button
            v-if="scope.row.status === 0"
            link
            size="small"
            type="warning"
            @click="handleStop(scope.row)"
          >
            <el-icon><VideoPause /></el-icon>{{ $t("message.common.disabled") }}
          </el-button>
          <el-button v-else link size="small" type="success" @click="handleStart(scope.row)">
            <el-icon><VideoPlay /></el-icon>{{ $t("message.common.enabled") }}
          </el-button>
          <el-button link size="small" type="primary" @click="handleRun(scope.row)">
            <el-icon><RefreshRight /></el-icon>{{ $t("message.common.submit") }}
          </el-button>
          <el-button link size="small" type="danger" @click="handleDelete(scope.row)">
            <el-icon><Delete /></el-icon>{{ $t("message.common.delete") }}
          </el-button>
        </template>
      </el-table-column>
    </ProTable>
  </ProPage>
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs, onMounted, computed, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { Plus, Edit, VideoPause, VideoPlay, RefreshRight, Delete } from "@element-plus/icons-vue";
import ProPage from "/@/components/pro/ProPage.vue";
import ProSearch, { type ProSearchField } from "/@/components/pro/ProSearch.vue";
import ProToolbar from "/@/components/pro/ProToolbar.vue";
import ProTable from "/@/components/pro/ProTable.vue";
import { listJob, deleteJob, startJob, stopJob, runJob } from "/@/api/addon/job";

export default defineComponent({
  name: "addonJobList",
  components: {
    ProPage,
    ProSearch,
    ProToolbar,
    ProTable,
    Plus,
    Edit,
    VideoPause,
    VideoPlay,
    RefreshRight,
    Delete,
  },
  setup() {
    const { t } = useI18n();
    const router = useRouter();
    const tableSize = ref<"large" | "default" | "small">("default");

    const state = reactive({
      loading: false,
      tableData: [] as any[],
      total: 0,
      query: {
        job_name: "",
        job_group: "",
        status: -1,
        page: 1,
        pageSize: 10,
      },
    });

    const searchFields = computed<ProSearchField[]>(() => [
      {
        prop: "job_name",
        label: t("message.pms.job.labelJobName"),
        placeholder: t("message.pms.job.placeholderJobName"),
        width: "220px",
      },
      {
        prop: "job_group",
        label: t("message.pms.job.labelJobGroup"),
        type: "select",
        placeholder: t("message.pms.job.placeholderAll"),
        width: "160px",
        options: [
          { label: t("message.pms.job.groupDefault"), value: "DEFAULT" },
          { label: t("message.pms.job.groupSystem"), value: "SYSTEM" },
        ],
      },
      {
        prop: "status",
        label: t("message.pms.job.labelStatus"),
        type: "select",
        placeholder: t("message.pms.job.placeholderAll"),
        width: "140px",
        options: [
          { label: t("message.pms.job.placeholderAll"), value: -1 },
          { label: t("message.common.normal"), value: 0 },
          { label: t("message.common.disabled"), value: 1 },
        ],
      },
    ]);

    const fetchList = () => {
      state.loading = true;
      listJob(state.query)
        .then((res: any) => {
          state.tableData = res.data?.list || [];
          state.total = res.data?.total || 0;
        })
        .finally(() => {
          state.loading = false;
        });
    };

    const onSearch = () => {
      state.query.page = 1;
      fetchList();
    };

    const resetQuery = () => {
      state.query.job_name = "";
      state.query.job_group = "";
      state.query.status = -1;
      state.query.page = 1;
      fetchList();
    };

    const onPageChange = ({ page, limit }: { page: number; limit: number }) => {
      state.query.page = page;
      state.query.pageSize = limit;
      fetchList();
    };

    const onOpenAdd = () => router.push("/addon/job/list/add");
    const onOpenEdit = (row: any) => router.push(`/addon/job/list/edit?id=${row.job_id}`);

    const handleStart = (row: any) => {
      startJob(row.job_id).then(() => {
        ElMessage.success(t("message.pms.job.msgStartOk"));
        fetchList();
      });
    };
    const handleStop = (row: any) => {
      stopJob(row.job_id).then(() => {
        ElMessage.success(t("message.pms.job.msgPauseOk"));
        fetchList();
      });
    };
    const handleRun = (row: any) => {
      runJob(row.job_id).then(() => {
        ElMessage.success(t("message.pms.job.msgRunOk"));
        fetchList();
      });
    };
    const handleDelete = (row: any) => {
      ElMessageBox.confirm(`确认删除任务「${row.job_name}」？`, t("message.common.confirmTitle"), {
        type: "warning",
      })
        .then(() =>
          deleteJob([row.job_id]).then(() => {
            ElMessage.success(t("message.common.msgDeleteOk"));
            fetchList();
          }),
        )
        .catch(() => {});
    };

    onMounted(() => fetchList());

    return {
      ...toRefs(state),
      tableSize,
      searchFields,
      fetchList,
      onSearch,
      resetQuery,
      onPageChange,
      onOpenAdd,
      onOpenEdit,
      handleStart,
      handleStop,
      handleRun,
      handleDelete,
      Plus,
      Edit,
      VideoPause,
      VideoPlay,
      RefreshRight,
      Delete,
    };
  },
});
</script>

<style scoped>
.mono-text {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: var(--cc-font-13);
  color: var(--cc-color-text-2);
}
</style>
