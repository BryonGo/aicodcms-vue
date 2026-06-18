<template>
  <ProPage
    :title="$t('message.addon_mail.breadcrumbCurrent')"
    :subtitle="$t('message.addon_mail.breadcrumbModule')"
  >
    <ProSearch
      v-model="filters"
      :fields="searchFields"
      @search="loadList(1)"
      @reset="resetFilters"
    />

    <ProToolbar v-model:size="tableSize" @refresh="loadList()" />

    <ProTable
      :data="list"
      :loading="loading"
      :size="tableSize"
      :total="total"
      :page="page"
      :page-size="pageSize"
      @pagination="onPageChange"
    >
      <el-table-column prop="id" :label="$t('message.common.colId')" width="80" align="center" />
      <el-table-column
        :label="$t('message.addon_mail.colRecipient')"
        min-width="170"
        prop="to"
        show-overflow-tooltip
      />
      <el-table-column
        :label="$t('message.addon_mail.colSubject')"
        min-width="220"
        prop="subject"
        show-overflow-tooltip
      />
      <el-table-column
        :label="$t('message.addon_mail.colDriver')"
        width="120"
        prop="driver"
        align="center"
      >
        <template #default="{ row }">
          <el-tag size="small" effect="plain">{{ row.driver }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="$t('message.addon_mail.colStatus')" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small" effect="plain">
            {{
              row.status === 1
                ? $t("message.addon_mail.statusSuccess")
                : $t("message.addon_mail.statusFail")
            }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('message.addon_mail.colError')"
        min-width="220"
        prop="error_msg"
        show-overflow-tooltip
      />
      <el-table-column :label="$t('message.addon_mail.colTime')" width="170" align="center">
        <template #default="{ row }">
          <span class="mail-time">{{ formatTime(row.created_at) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('message.common.colOperation')"
        width="110"
        fixed="right"
        align="center"
      >
        <template #default="{ row }">
          <el-button
            type="primary"
            link
            size="small"
            :icon="RefreshRight"
            @click="handleResend(row)"
          >
            {{ $t("message.addon_mail.btnResend") }}
          </el-button>
        </template>
      </el-table-column>
    </ProTable>
  </ProPage>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from "vue";
import { useI18n } from "vue-i18n";
import { RefreshRight } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import ProPage from "/@/components/pro/ProPage.vue";
import ProSearch, { type ProSearchField } from "/@/components/pro/ProSearch.vue";
import ProToolbar from "/@/components/pro/ProToolbar.vue";
import ProTable from "/@/components/pro/ProTable.vue";
import { getMailLogList, resendMail, type MailLogItem } from "/@/api/addon/mail";

const { t } = useI18n();
const list = ref<MailLogItem[]>([]);
const loading = ref(false);
const tableSize = ref<"large" | "default" | "small">("default");
const page = ref(1);
const pageSize = ref(20);
const total = ref(0);

const filters = reactive({
  to: "",
  status: undefined as number | undefined,
  driver: "",
});

const searchFields = computed<ProSearchField[]>(() => [
  {
    prop: "to",
    label: t("message.addon_mail.filterRecipient"),
    placeholder: t("message.addon_mail.placeholderRecipient"),
    width: "220px",
  },
  {
    prop: "status",
    label: t("message.addon_mail.filterStatus"),
    type: "select",
    placeholder: t("message.addon_mail.placeholderStatus"),
    width: "160px",
    options: [
      { label: t("message.addon_mail.statusSuccess"), value: 1 },
      { label: t("message.addon_mail.statusFail"), value: 0 },
    ],
  },
  {
    prop: "driver",
    label: t("message.addon_mail.filterDriver"),
    type: "select",
    placeholder: t("message.addon_mail.placeholderDriver"),
    width: "170px",
    options: [
      { label: "SMTP", value: "smtp" },
      { label: "SendCloud", value: "sendcloud" },
    ],
  },
]);

const formatTime = (ts: number) => {
  if (!ts) return "-";
  const d = new Date(ts * 1000);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

const loadList = async (p?: number) => {
  loading.value = true;
  try {
    const params: any = { page: p || page.value, page_size: pageSize.value };
    if (filters.to) params.to = filters.to;
    if (filters.status !== undefined) params.status = filters.status;
    if (filters.driver) params.driver = filters.driver;
    const res: any = await getMailLogList(params);
    const data = res.data || res;
    list.value = data.list || [];
    total.value = data.total || 0;
    page.value = data.page || params.page;
  } catch (e: any) {
    ElMessage.error(e?.message || "load failed");
  } finally {
    loading.value = false;
  }
};

const onPageChange = ({ page: nextPage, limit }: { page: number; limit: number }) => {
  page.value = nextPage;
  pageSize.value = limit;
  loadList();
};

const resetFilters = () => {
  filters.to = "";
  filters.status = undefined;
  filters.driver = "";
  loadList(1);
};

const handleResend = async (row: MailLogItem) => {
  try {
    await ElMessageBox.confirm(t("message.addon_mail.confirmResend", { to: row.to }), t("message.common.confirmTitle"), { type: "info" });
    await resendMail(row.id);
    ElMessage.success(t("message.addon_mail.resendSuccess"));
    loadList();
  } catch {
    // cancelled
  }
};

onMounted(() => loadList());
</script>

<style scoped>
.mail-time {
  font-size: var(--cc-font-13);
  color: var(--cc-color-text-3);
}
</style>
