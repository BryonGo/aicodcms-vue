<template>
  <ProPage
    :title="$t('message.addon_mail.breadcrumbCurrent')"
    :subtitle="$t('message.addon_mail.breadcrumbModule')"
  >
    <!-- SendCloud 账户信息卡片 -->
    <el-card v-if="userInfo" shadow="never" class="mail-account-card">
      <div class="mail-account">
        <div class="mail-account-title">
          {{ $t("message.addon_mail.balanceTitle") }}
          <el-tag size="small" effect="plain" type="info">{{ userInfo.account_type }}</el-tag>
        </div>
        <div class="mail-account-metrics">
          <div class="mail-account-item">
            <span class="label">{{ $t("message.addon_mail.balance") }}</span>
            <span class="value" :class="{ warn: userInfo.balance < 10 }">¥{{ userInfo.balance.toFixed(2) }}</span>
          </div>
          <div class="mail-account-item">
            <span class="label">{{ $t("message.addon_mail.avaliableBalance") }}</span>
            <span class="value">{{ userInfo.avaliable_balance.toFixed(2) }}</span>
          </div>
          <div class="mail-account-item">
            <span class="label">{{ $t("message.addon_mail.quota") }}</span>
            <span class="value">{{ userInfo.today_used_quota }} / {{ userInfo.quota }}</span>
          </div>
          <div class="mail-account-item">
            <span class="label">{{ $t("message.addon_mail.reputation") }}</span>
            <span class="value">{{ userInfo.reputation.toFixed(1) }}</span>
          </div>
        </div>
      </div>
    </el-card>

    <ProSearch
      v-model="filters"
      :fields="searchFields"
      @search="loadList(1)"
      @reset="resetFilters"
    />

    <ProToolbar v-model:size="tableSize" @refresh="loadList()">
      <template #actions>
        <el-button type="primary" :icon="Promotion" @click="openSendDialog">
          {{ $t("message.addon_mail.btnSendTest") }}
        </el-button>
        <el-button :icon="Setting" @click="openWebhookDialog">
          {{ $t("message.addon_mail.btnWebhook") }}
        </el-button>
      </template>
    </ProToolbar>

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
        width="110"
        prop="driver"
        align="center"
      >
        <template #default="{ row }">
          <el-tag size="small" effect="plain">{{ row.driver }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="$t('message.addon_mail.colStatus')" width="90" align="center">
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
      <el-table-column :label="$t('message.addon_mail.colDeliver')" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="deliverTagType(row.deliver_status)" size="small" effect="plain">
            {{ deliverStatusText(row.deliver_status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('message.addon_mail.colError')"
        min-width="200"
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

    <!-- 发送测试邮件对话框 -->
    <el-dialog
      v-model="sendDialogVisible"
      :title="$t('message.addon_mail.sendTestTitle')"
      width="520px"
      destroy-on-close
    >
      <el-form :model="sendForm" label-width="110px">
        <el-form-item :label="$t('message.addon_mail.sendTestTo')">
          <el-input v-model="sendForm.to" :placeholder="$t('message.addon_mail.sendTestToPlaceholder')" />
        </el-form-item>
        <el-form-item :label="$t('message.addon_mail.sendTestSubject')">
          <el-input v-model="sendForm.subject" />
        </el-form-item>
        <el-form-item :label="$t('message.addon_mail.sendTestBody')">
          <el-input
            v-model="sendForm.body"
            type="textarea"
            :rows="4"
            placeholder="<p>Hello</p>"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="sendDialogVisible = false">
          {{ $t("message.common.cancel") }}
        </el-button>
        <el-button type="primary" :loading="sending" @click="handleSendTest">
          {{ $t("message.common.confirm") }}
        </el-button>
      </template>
    </el-dialog>

    <!-- Webhook 配置对话框 -->
    <el-dialog
      v-model="webhookDialogVisible"
      :title="$t('message.addon_mail.webhookTitle')"
      width="680px"
      destroy-on-close
      @open="loadWebhooks"
    >
      <el-alert
        v-if="webhooks.length === 0"
        :title="$t('message.addon_mail.webhookEmpty')"
        type="warning"
        :closable="false"
        class="mail-webhook-alert"
      />
      <el-table v-if="webhooks.length > 0" :data="webhooks" size="small" border>
        <el-table-column
          prop="webhook_url"
          :label="$t('message.addon_mail.webhookUrl')"
          min-width="240"
          show-overflow-tooltip
        />
        <el-table-column
          prop="category_name"
          :label="$t('message.addon_mail.categoryName')"
          width="120"
        />
        <el-table-column :label="$t('message.addon_mail.events')" min-width="180">
          <template #default="{ row }">
            <span>{{ eventText(row.event_type_map) }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('message.common.colOperation')" width="90" align="center">
          <template #default="{ row }">
            <el-button type="danger" link size="small" @click="handleDeleteWebhook(row)">
              {{ $t("message.addon_mail.deleteWebhook") }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-divider />
      <el-form :model="webhookForm" label-width="110px">
        <el-form-item :label="$t('message.addon_mail.webhookUrl')">
          <el-input
            v-model="webhookForm.url"
            :placeholder="$t('message.addon_mail.webhookUrlPlaceholder')"
          />
        </el-form-item>
        <el-form-item :label="$t('message.addon_mail.categoryName')">
          <el-input v-model="webhookForm.category_name" placeholder="all" />
        </el-form-item>
        <el-form-item :label="$t('message.addon_mail.events')">
          <el-input v-model="webhookForm.events" :placeholder="$t('message.addon_mail.eventsExample')" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="webhookDialogVisible = false">
          {{ $t("message.common.cancel") }}
        </el-button>
        <el-button type="primary" :loading="webhookSaving" @click="handleAddWebhook">
          {{ $t("message.addon_mail.addWebhook") }}
        </el-button>
      </template>
    </el-dialog>
  </ProPage>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { RefreshRight, Promotion, Setting } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import ProPage from "/@/components/pro/ProPage.vue";
import ProSearch, { type ProSearchField } from "/@/components/pro/ProSearch.vue";
import ProToolbar from "/@/components/pro/ProToolbar.vue";
import ProTable from "/@/components/pro/ProTable.vue";
import {
  getMailLogList,
  resendMail,
  sendTestMail,
  getSendCloudUserInfo,
  getSendCloudWebhooks,
  addSendCloudWebhook,
  deleteSendCloudWebhook,
  type MailLogItem,
  type SendCloudUserInfo,
  type SendCloudWebhookItem,
} from "/@/api/addon/mail";

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

// ---- SendCloud 账户 ----
const userInfo = ref<SendCloudUserInfo | null>(null);

const loadUserInfo = async () => {
  try {
    const res: any = await getSendCloudUserInfo();
    userInfo.value = res.data || res;
  } catch {
    // 非 SendCloud 驱动或未配置时静默（不打扰日志页）
  }
};

// ---- 投递状态 ----
const DELIVER_LABELS: Record<number, string> = {
  0: "deliverUnknown",
  1: "deliverDelivered",
  2: "deliverBounce",
  3: "deliverInvalid",
  4: "deliverOpened",
  5: "deliverClicked",
  6: "deliverSpam",
  7: "deliverUnsub",
};
const deliverStatusText = (s: number) => {
  const key = DELIVER_LABELS[s] || "deliverUnknown";
  return t(`message.addon_mail.${key}`);
};
const deliverTagType = (s: number) => {
  switch (s) {
    case 1:
    case 4:
    case 5:
      return "success";
    case 2:
    case 3:
      return "danger";
    case 6:
      return "warning";
    default:
      return "info";
  }
};

// ---- 发送测试邮件 ----
const sendDialogVisible = ref(false);
const sending = ref(false);
const sendForm = reactive({ to: "", subject: "", body: "" });

const openSendDialog = () => {
  sendForm.to = "";
  sendForm.subject = "";
  sendForm.body = "";
  sendDialogVisible.value = true;
};

const handleSendTest = async () => {
  if (!sendForm.to) {
    ElMessage.warning(t("message.addon_mail.sendTestToPlaceholder"));
    return;
  }
  sending.value = true;
  try {
    await sendTestMail({
      to: sendForm.to,
      subject: sendForm.subject || "aicodcms test mail",
      body: sendForm.body || "<p>aicodcms test mail</p>",
    });
    ElMessage.success(t("message.addon_mail.sendTestSuccess"));
    sendDialogVisible.value = false;
    loadList();
  } catch (e: any) {
    ElMessage.error(e?.message || "send failed");
  } finally {
    sending.value = false;
  }
};

// ---- Webhook 配置 ----
const webhookDialogVisible = ref(false);
const webhookSaving = ref(false);
const webhooks = ref<SendCloudWebhookItem[]>([]);
const webhookForm = reactive({ url: "", category_name: "all", events: "" });

const loadWebhooks = async () => {
  try {
    const res: any = await getSendCloudWebhooks();
    webhooks.value = res?.data?.list || res?.list || [];
  } catch (e: any) {
    ElMessage.error(e?.message || "load webhook failed");
  }
};

const eventText = (eventMap: Record<string, string>) =>
  Object.entries(eventMap || {})
    .map(([, v]) => v)
    .join(", ");

const handleAddWebhook = async () => {
  if (!webhookForm.url) {
    ElMessage.warning(t("message.addon_mail.webhookUrlPlaceholder"));
    return;
  }
  webhookSaving.value = true;
  try {
    await addSendCloudWebhook({
      url: webhookForm.url,
      category_name: webhookForm.category_name || "all",
      events: webhookForm.events || "",
    });
    ElMessage.success(t("message.common.saveSuccess"));
    webhookForm.url = "";
    webhookForm.events = "";
    loadWebhooks();
  } catch (e: any) {
    ElMessage.error(e?.message || "add webhook failed");
  } finally {
    webhookSaving.value = false;
  }
};

const handleDeleteWebhook = async (row: SendCloudWebhookItem) => {
  try {
    await ElMessageBox.confirm(
      t("message.addon_mail.confirmDeleteWebhook"),
      t("message.common.confirmTitle"),
      { type: "warning" },
    );
    const events = Object.keys(row.event_type_map || {}).join(",");
    await deleteSendCloudWebhook({
      url: row.webhook_url,
      category_name: row.category_name,
      events: events || "1",
    });
    ElMessage.success(t("message.common.deleteSuccess"));
    loadWebhooks();
  } catch {
    // cancelled
  }
};

const openWebhookDialog = () => {
  webhookDialogVisible.value = true;
};

// ---- 日志列表 ----
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
    await ElMessageBox.confirm(
      t("message.addon_mail.confirmResend", { to: row.to }),
      t("message.common.confirmTitle"),
      { type: "info" },
    );
    await resendMail(row.id);
    ElMessage.success(t("message.addon_mail.resendSuccess"));
    loadList();
  } catch {
    // cancelled
  }
};

onMounted(() => {
  loadList();
  loadUserInfo();
});
</script>

<style scoped>
.mail-account-card {
  margin-bottom: 14px;
}
.mail-account-title {
  font-weight: 600;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.mail-account-metrics {
  display: flex;
  gap: 32px;
  flex-wrap: wrap;
}
.mail-account-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.mail-account-item .label {
  font-size: var(--cc-font-13);
  color: var(--cc-color-text-3);
}
.mail-account-item .value {
  font-size: 18px;
  font-weight: 600;
}
.mail-account-item .value.warn {
  color: var(--el-color-danger);
}
.mail-webhook-alert {
  margin-bottom: 12px;
}
.mail-time {
  font-size: var(--cc-font-13);
  color: var(--cc-color-text-3);
}
</style>
