<template>
  <ProPage title="Webhooks" :subtitle="$t('message.webhook.addWebhook')">
    <template #actions>
      <el-button type="primary" :icon="Plus" @click="onAdd">
        {{ $t("message.webhook.addWebhook") }}
      </el-button>
    </template>

    <ProToolbar v-model:size="tableSize" @refresh="load" />

    <ProTable :data="list" :loading="loading" :size="tableSize" :show-pagination="false">
      <el-table-column
        prop="name"
        :label="$t('message.webhook.name')"
        min-width="150"
        show-overflow-tooltip
      />
      <el-table-column
        prop="url"
        :label="$t('message.webhook.targetUrl')"
        min-width="240"
        show-overflow-tooltip
      >
        <template #default="{ row }">
          <a :href="row.url" target="_blank" class="webhook-link">{{ row.url }}</a>
        </template>
      </el-table-column>
      <el-table-column :label="$t('message.webhook.event')" min-width="180" show-overflow-tooltip>
        <template #default="{ row }">{{ formatEvents(row.events) }}</template>
      </el-table-column>
      <el-table-column :label="$t('message.webhook.status')" width="90" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status ? 'success' : 'info'" size="small" effect="plain">
            {{ row.status ? "启用" : "停用" }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="$t('message.webhook.lastStatus')" width="100" align="center">
        <template #default="{ row }">
          <el-tag
            :type="row.last_status === 1 ? 'success' : row.last_status === 2 ? 'danger' : 'info'"
            size="small"
            effect="plain"
          >
            {{ { 0: "未触发", 1: "成功", 2: "失败" }[row.last_status] || "-" }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="last_response"
        :label="$t('message.webhook.lastResponse')"
        min-width="180"
        show-overflow-tooltip
      />
      <el-table-column prop="created_at" :label="$t('message.webhook.createTime')" width="170" />
      <el-table-column
        :label="$t('message.webhook.action')"
        width="150"
        fixed="right"
        align="center"
      >
        <template #default="{ row }">
          <el-button link size="small" type="primary" @click="onEdit(row)">{{
            $t("message.common.edit")
          }}</el-button>
          <el-button link size="small" type="danger" @click="onDel(row.id)">{{
            $t("message.webhook.delete")
          }}</el-button>
        </template>
      </el-table-column>
    </ProTable>

    <el-drawer
      :title="editId ? $t('message.webhook.editWebhook') : $t('message.webhook.addWebhook')"
      v-model="dialogVisible"
      width="550px"
    >
      <el-form :model="form" label-width="100px">
        <el-form-item :label="$t('message.webhook.name')"
          ><el-input v-model="form.name"
        /></el-form-item>
        <el-form-item :label="$t('message.webhook.targetUrl')"
          ><el-input v-model="form.url" placeholder="https://example.com/webhook"
        /></el-form-item>
        <el-form-item :label="$t('message.webhook.event')">
          <el-checkbox-group v-model="form.events" class="webhook-events">
            <el-checkbox label="article.published">{{
              $t("message.webhook.articlePublished")
            }}</el-checkbox>
            <el-checkbox label="article.updated">{{
              $t("message.webhook.articleUpdated")
            }}</el-checkbox>
            <el-checkbox label="article.deleted">{{
              $t("message.webhook.articleDeleted")
            }}</el-checkbox>
            <el-checkbox label="comment.created">{{
              $t("message.webhook.commentCreated")
            }}</el-checkbox>
            <el-checkbox label="comment.approved">{{
              $t("message.webhook.commentApproved")
            }}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item :label="$t('message.webhook.signSecret')"
          ><el-input v-model="form.secret" :placeholder="$t('message.webhook.signSecretHint')"
        /></el-form-item>
        <el-form-item :label="$t('message.webhook.timeoutSec')"
          ><el-input-number v-model="form.timeout" :min="3" :max="60"
        /></el-form-item>
        <el-form-item :label="$t('message.webhook.retryCount')"
          ><el-input-number v-model="form.retry_count" :min="0" :max="10"
        /></el-form-item>
        <el-form-item :label="$t('message.webhook.status')">
          <el-switch v-model="form.status" :active-value="1" :inactive-value="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">{{ $t("message.webhook.cancel") }}</el-button>
        <el-button type="primary" @click="onSave">{{ editId ? "保存" : "创建" }}</el-button>
      </template>
    </el-drawer>
  </ProPage>
</template>

<script lang="ts">
import { useI18n } from "vue-i18n";
import { defineComponent, onMounted, reactive, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Plus } from "@element-plus/icons-vue";
import ProPage from "/@/components/pro/ProPage.vue";
import ProToolbar from "/@/components/pro/ProToolbar.vue";
import ProTable from "/@/components/pro/ProTable.vue";
import { listWebhooks, addWebhook, editWebhook, delWebhook } from "/@/api/addon/webhook/index";

export default defineComponent({
  name: "WebhookList",
  components: { ProPage, ProToolbar, ProTable, Plus },
  setup() {
    const { t } = useI18n();
    const list = ref<any[]>([]);
    const loading = ref(false);
    const tableSize = ref<"large" | "default" | "small">("default");
    const dialogVisible = ref(false);
    const editId = ref(0);
    const form = reactive({
      name: "",
      url: "",
      events: [] as string[],
      secret: "",
      timeout: 10,
      retry_count: 3,
      status: 1,
    });

    const load = () => {
      loading.value = true;
      listWebhooks()
        .then((r: any) => {
          list.value = r?.data?.list || [];
        })
        .finally(() => {
          loading.value = false;
        });
    };

    const formatEvents = (s: string) => {
      try {
        return JSON.parse(s).join(", ");
      } catch {
        return s;
      }
    };

    const onAdd = () => {
      editId.value = 0;
      form.name = "";
      form.url = "";
      form.events = [];
      form.secret = "";
      form.timeout = 10;
      form.retry_count = 3;
      form.status = 1;
      dialogVisible.value = true;
    };

    const onEdit = (row: any) => {
      editId.value = row.id;
      form.name = row.name;
      form.url = row.url;
      form.secret = "";
      form.timeout = 10;
      form.retry_count = 3;
      form.status = row.status;
      try {
        form.events = JSON.parse(row.events);
      } catch {
        form.events = [];
      }
      dialogVisible.value = true;
    };

    const onSave = () => {
      if (!form.name || !form.url) {
        ElMessage.warning(t("message.webhook.pleaseFillNameUrl"));
        return;
      }
      const fn = editId.value ? editWebhook({ id: editId.value, ...form }) : addWebhook(form);
      fn.then(() => {
        ElMessage.success(editId.value ? t("message.webhook.saved") : t("message.webhook.created"));
        dialogVisible.value = false;
        load();
      });
    };

    const onDel = (id: number) => {
      ElMessageBox.confirm(t("message.webhook.confirmDelete"), t("message.webhook.confirm"), {
        type: "warning",
      }).then(() => {
        delWebhook(id).then(() => {
          ElMessage.success(t("message.webhook.deleted"));
          load();
        });
      });
    };

    onMounted(load);
    return {
      list,
      loading,
      tableSize,
      dialogVisible,
      editId,
      form,
      load,
      formatEvents,
      onAdd,
      onEdit,
      onSave,
      onDel,
      Plus,
    };
  },
});
</script>

<style scoped>
.webhook-link {
  color: var(--cc-color-primary);
  text-decoration: none;
}
.webhook-link:hover {
  text-decoration: underline;
}
.webhook-events {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--cc-space-1) var(--cc-space-3);
}
@media (max-width: 640px) {
  .webhook-events {
    grid-template-columns: 1fr;
  }
}
</style>
