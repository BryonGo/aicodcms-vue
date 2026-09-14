<template>
  <div class="pms-card-container">
    <el-breadcrumb separator="→" class="mb15">
      <el-breadcrumb-item :to="{ path: '/' }">{{ $t('message.cms.site.breadcrumbHome') }}</el-breadcrumb-item>
      <el-breadcrumb-item>{{ $t('message.cms.site.breadcrumbContent') }}</el-breadcrumb-item>
      <el-breadcrumb-item>{{ $t('message.cms.site.title') }}</el-breadcrumb-item>
    </el-breadcrumb>
    <div class="pms-card-header">
      <div>
        <h1 class="pms-card-title">{{ $t('message.cms.site.title') }}</h1>
        <p class="pms-card-sub">{{ $t('message.cms.site.subtitle') }}</p>
      </div>
      <div class="pms-card-actions">
        <el-button size="large" type="success" class="pms-card-add" @click="onOpenAdd">
          <el-icon><ele-FolderAdd /></el-icon> {{ $t('message.cms.site.btnAdd') }}
        </el-button>
      </div>
    </div>
    <div class="pms-card-table">
      <el-table :data="tableData.data" stripe border size="small" style="width: 100%">
        <el-table-column type="index" label="#" width="55" align="center" />
        <el-table-column prop="code" :label="$t('message.cms.site.colCode')" width="140" show-overflow-tooltip />
        <el-table-column prop="name" :label="$t('message.cms.site.colName')" min-width="140" show-overflow-tooltip />
        <el-table-column :label="$t('message.cms.site.colDomains')" min-width="200" show-overflow-tooltip>
          <template #default="scope">
            <el-tag v-for="d in scope.row.domains || []" :key="d" size="small" class="mr5" effect="plain">
              {{ d }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="default_lang" :label="$t('message.cms.site.colDefaultLang')" width="90" align="center" />
        <el-table-column :label="$t('message.cms.site.colLangs')" min-width="160" show-overflow-tooltip>
          <template #default="scope">
            <el-tag v-for="l in scope.row.langs || []" :key="l" size="small" class="mr5" effect="plain">
              {{ l }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="theme" :label="$t('message.cms.site.colTheme')" width="90" show-overflow-tooltip />
        <el-table-column :label="$t('message.cms.site.colStatus')" width="90" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'info'" size="small" effect="light" round>
              {{ scope.row.status === 1 ? $t('message.cms.site.statusOn') : $t('message.cms.site.statusOff') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="sort" :label="$t('message.cms.site.colSort')" width="70" align="center" />
        <el-table-column :label="$t('message.cms.site.colFrontMode')" width="100" align="center">
          <template #default="scope">
            <el-tag
              :type="scope.row.frontend_mode === 'api_only' ? 'warning' : 'success'"
              size="small"
              effect="plain"
            >
              {{ scope.row.frontend_mode === "api_only" ? $t('message.cms.site.frontApiOnly') : $t('message.cms.site.frontFull') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="$t('message.common.colOperation')" width="160" align="center" fixed="right">
          <template #default="scope">
            <el-button link size="small" type="primary" @click="onOpenEdit(scope.row)">
              <el-icon><ele-Edit /></el-icon> {{ $t('message.common.btnEdit') }}
            </el-button>
            <el-button
              link
              size="small"
              type="danger"
              :disabled="scope.row.code === 'default'"
              @click="onDel(scope.row)"
            >
              <el-icon><ele-Delete /></el-icon> {{ $t('message.common.btnDelete') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 编辑弹窗 -->
    <el-dialog
      v-model="dialog.visible"
      :title="dialog.isEdit ? $t('message.cms.site.dialogEdit') : $t('message.cms.site.dialogAdd')"
      width="720px"
      destroy-on-close
      :close-on-click-modal="false"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="110px">
            <el-form-item :label="$t('message.cms.site.colCode')" prop="code">
              <el-input v-model="form.code" :placeholder="$t('message.cms.site.phCode')" :disabled="dialog.isEdit" />
            </el-form-item>
            <el-form-item :label="$t('message.cms.site.colName')" prop="name">
              <el-input v-model="form.name" :placeholder="$t('message.cms.site.phName')" />
            </el-form-item>
            <el-form-item :label="$t('message.cms.site.colDomains')" prop="domains">
              <el-input v-model="form.domainsText" :placeholder="$t('message.cms.site.phDomains')" />
            </el-form-item>
            <el-form-item :label="$t('message.cms.site.colDefaultLang')" prop="default_lang">
              <el-select v-model="form.default_lang" :placeholder="$t('message.cms.site.phDefaultLang')" style="width: 100%">
                <el-option v-for="l in langOptions" :key="l" :label="l" :value="l" />
              </el-select>
            </el-form-item>
            <el-form-item :label="$t('message.cms.site.colLangs')">
              <el-select
                v-model="form.langs"
                multiple
                filterable
                :placeholder="$t('message.cms.site.phLangs')"
                style="width: 100%"
              >
                <el-option v-for="l in langOptions" :key="l" :label="l" :value="l" />
              </el-select>
            </el-form-item>
            <el-form-item :label="$t('message.cms.site.colTheme')">
              <el-input v-model="form.theme" :placeholder="$t('message.cms.site.phTheme')" />
            </el-form-item>
            <el-form-item :label="$t('message.cms.site.colFrontMode')">
              <el-select v-model="form.frontend_mode" style="width: 100%">
                <el-option :label="$t('message.cms.site.frontFull')" value="full" />
                <el-option :label="$t('message.cms.site.frontApiOnly')" value="api_only" />
              </el-select>
              <div class="pms-form-tip">
                {{ $t('message.cms.site.frontApiOnlyHint') }}
              </div>
            </el-form-item>
            <el-form-item :label="$t('message.cms.site.colStatus')">
              <el-switch v-model="form.status" :active-value="1" :inactive-value="0" />
            </el-form-item>
            <el-form-item :label="$t('message.cms.site.colSort')">
              <el-input-number v-model="form.sort" :min="0" />
            </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialog.visible = false">{{ $t('message.common.btnCancel') }}</el-button>
        <el-button type="primary" :loading="dialog.saving" @click="onSubmit">{{ $t('message.common.btnSave') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { reactive, ref, defineComponent } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useI18n } from "vue-i18n";
import { listSites, saveSite, delSite } from "/@/api/cms/site";

const langOptions = [
  "zh-CN",
  "zh-TW",
  "en-US",
  "ja-JP",
  "ko-KR",
  "th-TH",
  "vi-VN",
  "ru-RU",
  "de-DE",
  "fr-FR",
  "es-ES",
  "pt-PT",
  "ar-SA",
  "id-ID",
  "ms-MY",
];

export default defineComponent({
  name: "apiV1CmsAdminSiteList",
  setup() {
    const { t } = useI18n();
    const formRef = ref();
    const tableData = reactive<{ data: any[] }>({ data: [] });
    const dialog = reactive({
      visible: false,
      isEdit: false,
      saving: false,
    });

    const emptyForm = () => ({
      id: 0,
      code: "",
      name: "",
      domainsText: "",
      default_lang: "zh-CN",
      langs: [] as string[],
      theme: "",
      status: 1,
      sort: 0,
      frontend_mode: "full",
    });
    const form = reactive(emptyForm());

    const rules = {
      code: [{ required: true, message: t("message.cms.site.ruleCode"), trigger: "blur" }],
      name: [{ required: true, message: t("message.cms.site.ruleName"), trigger: "blur" }],
      default_lang: [{ required: true, message: t("message.cms.site.ruleDefaultLang"), trigger: "change" }],
    };

    const load = () => {
      listSites().then((res: any) => {
        tableData.data = res?.data?.list || [];
      });
    };

    const fillForm = (row: any) => {
      form.id = row.id || 0;
      form.code = row.code || "";
      form.name = row.name || "";
      form.domainsText = (row.domains || []).join(",");
      form.default_lang = row.default_lang || "zh-CN";
      form.langs = row.langs || [];
      form.theme = row.theme || "";
      form.status = row.status ?? 1;
      form.sort = row.sort ?? 0;
      // 前台模式来自 cms_site_config.config（后端在列表里补出），未配置时按 full 展示
      form.frontend_mode = row.frontend_mode === "api_only" ? "api_only" : "full";
    };

    const onOpenAdd = () => {
      Object.assign(form, emptyForm());
      dialog.isEdit = false;
      dialog.visible = true;
    };

    const onOpenEdit = (row: any) => {
      fillForm(row);
      dialog.isEdit = true;
      dialog.visible = true;
    };

    const onDel = (row: any) => {
      ElMessageBox.confirm(t("message.cms.site.delConfirm", { name: row.name }), t("message.common.confirmTitle"), { type: "warning" })
        .then(() => {
          delSite(row.id).then(() => {
            ElMessage.success(t("message.common.msgDeleteOk"));
            load();
          });
        })
        .catch(() => {});
    };

    const onSubmit = () => {
      formRef.value?.validate((valid: boolean) => {
        if (!valid) return;
        const payload = {
          id: form.id,
          code: form.code,
          name: form.name,
          domains: form.domainsText
            .split(",")
            .map((d) => d.trim())
            .filter(Boolean),
          default_lang: form.default_lang,
          langs: form.langs,
          theme: form.theme,
          status: form.status,
          sort: form.sort,
          // 写进站点配置 site.frontend.mode，与「系统设置 → 基础设置 → 前台模式」同一个键
          frontend_mode: form.frontend_mode,
        };
        dialog.saving = true;
        saveSite(payload)
          .then(() => {
            ElMessage.success(t("message.common.msgSaveOk"));
            dialog.visible = false;
            load();
          })
          .finally(() => {
            dialog.saving = false;
          });
      });
    };

    load();

    return {
      formRef,
      tableData,
      dialog,
      form,
      rules,
      langOptions,
      onOpenAdd,
      onOpenEdit,
      onDel,
      onSubmit,
    };
  },
});
</script>

<style scoped>
.pms-card-container {
  max-width: 1400px;
  margin: 0 auto;
}
.pms-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin: 24px 0 20px;
  padding: 24px 28px;
  background: var(--cc-color-surface);
  border-radius: var(--cc-radius-lg);
  border: 1px solid var(--cc-color-border-light);
}
.pms-card-title {
  font-size: var(--cc-font-20);
  font-weight: 600;
  color: var(--cc-color-text-1);
  margin: 0 0 4px;
}
.pms-card-sub {
  font-size: var(--cc-font-13);
  color: var(--cc-color-text-3);
  margin: 0;
}
.pms-card-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}
.pms-card-table {
  background: var(--cc-color-surface);
  border: 1px solid var(--cc-color-border-light);
  border-radius: var(--cc-radius-lg);
  padding: var(--cc-space-5) var(--cc-space-6) var(--cc-space-3);
}
.mr5 {
  margin-right: 5px;
}
.pms-form-tip {
  font-size: var(--cc-font-12);
  color: var(--cc-color-text-3);
  line-height: 1.5;
  margin-top: 2px;
}
</style>
