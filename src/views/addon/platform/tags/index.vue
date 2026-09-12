<template>
  <div class="pf-page">
    <el-breadcrumb separator="→">
      <el-breadcrumb-item :to="{ path: '/' }"
        ><el-icon><HomeFilled /></el-icon>
        {{ $t("message.sdk.platform.breadcrumbHome") }}</el-breadcrumb-item
      >
      <el-breadcrumb-item>{{
        $t("message.sdk.platform.breadcrumbSdk")
      }}</el-breadcrumb-item>
      <el-breadcrumb-item>{{
        $t("message.sdk.platform.tagsTitle")
      }}</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="pf-header">
      <div>
        <h1 class="pf-title">{{ $t("message.sdk.platform.tagsTitle") }}</h1>
        <p class="pf-subtitle">{{ $t("message.sdk.platform.tagsSubtitle") }}</p>
      </div>
      <div class="pf-header-actions">
        <el-button type="primary" @click="openDialog()">{{
          $t("message.sdk.platform.btnCreateTag")
        }}</el-button>
      </div>
    </div>

    <div class="pf-filter-card">
      <el-form :inline="true" @submit.prevent>
        <el-form-item :label="$t('message.sdk.platform.filterKeyword')">
          <el-input
            v-model="q.query"
            placeholder="name / key / alias"
            clearable
            style="width: 220px"
            @keyup.enter="onQuery"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onQuery">{{
            $t("message.sdk.platform.btnQuery")
          }}</el-button>
          <el-button @click="onReset">{{
            $t("message.sdk.platform.btnReset")
          }}</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="pf-table-card">
      <el-table
        :data="tableData"
        border
        v-loading="loading"
        class="pf-table"
        :empty-text="$t('message.sdk.platform.noData')"
      >
        <el-table-column
          prop="key"
          :label="$t('message.sdk.platform.colKey')"
          width="160"
          show-overflow-tooltip
        />
        <el-table-column
          prop="name"
          :label="$t('message.sdk.platform.colName')"
          min-width="160"
          show-overflow-tooltip
        />
        <el-table-column
          :label="$t('message.sdk.platform.colAliases')"
          min-width="200"
          show-overflow-tooltip
        >
          <template #default="{ row }">{{
            (row.aliases || []).join(", ")
          }}</template>
        </el-table-column>
        <el-table-column
          :label="$t('message.sdk.platform.colActive')"
          width="100"
          align="center"
        >
          <template #default="{ row }">
            <el-tag
              :type="row.active ? 'success' : 'info'"
              size="small"
              effect="plain"
              round
            >
              {{
                row.active
                  ? $t("message.sdk.platform.enabled")
                  : $t("message.sdk.platform.disabled")
              }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="priority"
          :label="$t('message.sdk.platform.colPriority')"
          width="100"
          align="center"
        />
        <el-table-column
          prop="posts"
          :label="$t('message.sdk.platform.colPosts')"
          width="100"
          align="right"
        >
          <template #default="{ row }"
            ><span class="pf-mono">{{ row.posts }}</span></template
          >
        </el-table-column>
        <el-table-column
          prop="works"
          :label="$t('message.sdk.platform.colWorks')"
          width="100"
          align="right"
        >
          <template #default="{ row }"
            ><span class="pf-mono">{{ row.works }}</span></template
          >
        </el-table-column>
        <el-table-column
          prop="updatedAt"
          :label="$t('message.sdk.platform.colUpdatedAt')"
          width="180"
          show-overflow-tooltip
        />
        <el-table-column
          :label="$t('message.sdk.platform.colAction')"
          width="90"
          align="center"
          fixed="right"
        >
          <template #default="{ row }">
            <el-button link type="primary" @click="openDialog(row)">{{
              $t("message.common.btnEdit")
            }}</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pf-footer">
        <pagination
          v-model:page="page"
          v-model:limit="size"
          :total="total"
          @change="loadData"
        />
      </div>
    </div>

    <!-- 新建 / 编辑标签 -->
    <ProDrawer
      v-model="dialog.visible"
      :title="$t('message.sdk.platform.tagDialogTitle')"
      size="md"
      :close-on-click-modal="false"
    >
      <el-form :model="dialog.form" label-width="140px">
        <el-form-item :label="$t('message.sdk.platform.fieldTagName')">
          <el-input v-model="dialog.form.name" clearable style="width: 220px" />
        </el-form-item>
        <el-form-item :label="$t('message.sdk.platform.fieldTagAliases')">
          <el-input
            v-model="dialog.form.aliases"
            placeholder="a, b, c"
            clearable
            style="width: 320px"
          />
        </el-form-item>
        <el-form-item :label="$t('message.sdk.platform.fieldTagPriority')">
          <el-input-number
            v-model="dialog.form.priority"
            controls-position="right"
            style="width: 160px"
          />
        </el-form-item>
        <el-form-item
          v-if="dialog.id"
          :label="$t('message.sdk.platform.fieldTagActive')"
        >
          <el-switch v-model="dialog.form.active" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialog.visible = false">{{
          $t("message.common.btnCancel")
        }}</el-button>
        <el-button
          type="primary"
          :loading="dialog.saving"
          @click="submitDialog"
        >
          {{ $t("message.common.btnSave") }}
        </el-button>
      </template>
    </ProDrawer>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, onMounted, onActivated } from "vue";
import { HomeFilled } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { useI18n } from "vue-i18n";
import ProDrawer from "/@/components/pro/ProDrawer.vue";
import {
  getPlatformTags,
  createPlatformTag,
  updatePlatformTag,
  AdminTag,
} from "/@/api/addon/platform";

export default defineComponent({
  name: "addonPlatformTags",
  components: { HomeFilled, ProDrawer },
  setup() {
    const { t } = useI18n();
    const tableData = ref<AdminTag[]>([]);
    const loading = ref(false);
    const page = ref(1);
    const size = ref(20);
    const total = ref(0);
    const q = reactive<{ query?: string }>({ query: undefined });

    // 表单里的 aliases 是逗号分隔字符串，表格里是数组；打开时 join、提交时 split。
    const dialog = reactive({
      visible: false,
      saving: false,
      id: "",
      form: { name: "", aliases: "", priority: 0, active: true },
    });

    const loadData = async () => {
      loading.value = true;
      try {
        const res: any = await getPlatformTags({
          query: q.query,
          page: page.value,
          pageSize: size.value,
        });
        const d = res.data || res;
        tableData.value = d.items || [];
        total.value = d.total || 0;
      } finally {
        loading.value = false;
      }
    };

    const onQuery = () => {
      page.value = 1;
      loadData();
    };
    const onReset = () => {
      q.query = undefined;
      page.value = 1;
      loadData();
    };

    const openDialog = (row?: AdminTag) => {
      if (row) {
        dialog.id = row.id;
        dialog.form = {
          name: row.name,
          aliases: (row.aliases || []).join(", "),
          priority: row.priority,
          active: row.active,
        };
      } else {
        dialog.id = "";
        dialog.form = { name: "", aliases: "", priority: 0, active: true };
      }
      dialog.visible = true;
    };

    const parseAliases = (raw: string): string[] =>
      raw
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

    const submitDialog = async () => {
      const name = dialog.form.name.trim();
      if (!name) {
        ElMessage.warning(t("message.sdk.platform.fieldTagName"));
        return;
      }
      dialog.saving = true;
      try {
        const aliases = parseAliases(dialog.form.aliases);
        if (dialog.id) {
          await updatePlatformTag({
            id: dialog.id,
            name,
            aliases,
            priority: dialog.form.priority,
            active: dialog.form.active,
          });
        } else {
          await createPlatformTag({
            name,
            aliases,
            priority: dialog.form.priority,
          });
        }
        ElMessage.success(t("message.sdk.platform.saveOk"));
        dialog.visible = false;
        await loadData();
      } finally {
        dialog.saving = false;
      }
    };

    onMounted(() => loadData());
    onActivated(() => loadData());

    return {
      tableData,
      loading,
      page,
      size,
      total,
      q,
      dialog,
      loadData,
      onQuery,
      onReset,
      openDialog,
      submitDialog,
    };
  },
});
</script>

<style scoped>
.pf-page {
  max-width: 1400px;
  margin: 0 auto;
}
.pf-mono {
  font-family:
    "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
    monospace;
  font-weight: 600;
  color: var(--cc-color-text-2);
}
.pf-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: var(--cc-space-4);
  margin: var(--cc-space-5) 0;
  padding: var(--cc-space-6) var(--cc-space-7);
  background:
    radial-gradient(
      circle at 8% 0%,
      var(--cc-color-primary-softer),
      transparent 32%
    ),
    var(--cc-color-surface);
  border: 1px solid var(--cc-color-border-light);
  border-radius: var(--cc-radius-xl);
  box-shadow: var(--cc-shadow-sm);
}
.pf-header-actions {
  display: flex;
  align-items: center;
  gap: var(--cc-space-2);
}
.pf-title {
  font-family: var(--cc-font-sans);
  font-size: var(--cc-font-24);
  font-weight: 650;
  color: var(--cc-color-text-1);
  margin: 0 0 var(--cc-space-1);
  letter-spacing: -0.02em;
}
.pf-subtitle {
  font-family: var(--cc-font-sans);
  font-size: var(--cc-font-13);
  color: var(--cc-color-text-3);
  margin: 0;
}
.pf-filter-card,
.pf-table-card {
  background: var(--cc-color-surface);
  border: 1px solid var(--cc-color-border-light);
  border-radius: var(--cc-radius-xl);
  padding: var(--cc-space-5) var(--cc-space-6) var(--cc-space-3);
  box-shadow: var(--cc-shadow-sm);
}
.pf-filter-card {
  margin-bottom: var(--cc-space-4);
}
.pf-table {
  font-size: var(--cc-font-14);
}
.pf-table :deep(th.el-table__cell) {
  font-size: var(--cc-font-12);
  font-weight: 650;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--cc-color-text-3);
  background: var(--cc-color-surface-hover);
  border-bottom: 1px solid var(--cc-color-border-light);
}
.pf-table :deep(.el-table__row:hover > td.el-table__cell) {
  background: var(--cc-color-primary-softer);
}
.pf-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: var(--cc-space-3);
  padding-top: var(--cc-space-3);
}
@media (min-width: 1401px) {
  .pf-page {
    max-width: none !important;
    padding: 0 var(--cc-space-8);
  }
}
@media (max-width: 768px) {
  .pf-header {
    padding: var(--cc-space-5);
  }
  .pf-filter-card,
  .pf-table-card {
    padding: var(--cc-space-3) var(--cc-space-2);
    border-radius: var(--cc-radius-lg);
    overflow-x: auto;
  }
}
</style>
