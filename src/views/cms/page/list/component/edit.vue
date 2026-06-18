<template>
  <div class="pg-form-page">
    <el-breadcrumb separator="→">
      <el-breadcrumb-item :to="{ path: '/' }"
        ><el-icon><HomeFilled /></el-icon> {{ $t("message.router.home") }}</el-breadcrumb-item
      >
      <el-breadcrumb-item>CMS</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/cms/page/list' }">{{
        $t("message.cms.pageList.breadcrumbPage")
      }}</el-breadcrumb-item>
      <el-breadcrumb-item>{{
        formData.id ? $t("message.common.edit") : $t("message.common.add")
      }}</el-breadcrumb-item>
    </el-breadcrumb>

    <div v-if="loading" class="pg-loading">
      <el-icon :size="28" class="pg-spin"><Loading /></el-icon>
      <p>{{ $t("message.cms.pageEdit.loading") }}</p>
    </div>

    <template v-else-if="loadError">
      <div class="pg-error">
        <el-icon :size="40"><WarningFilled /></el-icon>
        <h3>{{ $t("message.cms.pageEdit.loadError") }}</h3>
        <p>{{ loadError }}</p>
        <el-button type="primary" @click="$router.push('/cms/page/list')">{{
          $t("message.common.backToList")
        }}</el-button>
      </div>
    </template>

    <template v-else>
      <div class="pg-page-header">
        <el-button link class="pg-back-btn" @click="$router.push('/cms/page/list')">
          <el-icon><ArrowLeft /></el-icon> {{ $t("message.common.backToList") }}
        </el-button>
        <div class="pg-header-row">
          <div>
            <h1 class="pg-page-title">
              {{
                formData.title ||
                (formData.id ? $t("message.common.edit") : $t("message.common.add"))
              }}
            </h1>
            <p class="pg-page-subtitle">
              <template v-if="formData.id">
                ID: <span class="pg-id-badge">{{ formData.id }}</span>
                <el-tag
                  :type="formData.status === 1 ? 'success' : 'info'"
                  size="small"
                  effect="light"
                  style="margin-left: 8px"
                >
                  {{
                    formData.status === 1
                      ? $t("message.cms.pageList.statusEnabled")
                      : $t("message.cms.pageList.statusDisabled")
                  }}
                </el-tag>
              </template>
              <template v-else>{{ $t("message.cms.pageEdit.addTitle") }}</template>
            </p>
          </div>
          <el-button v-if="formData.id" type="danger" plain size="large" @click="onDelete">
            <el-icon><Delete /></el-icon>{{ $t("message.common.delete") }}</el-button
          >
        </div>
      </div>

      <div class="pg-form-card">
        <el-form ref="formRef" :model="formData" :rules="rules" label-position="top" size="large">
          <el-tabs model-value="base" type="border-card" class="pg-tabs">
            <el-tab-pane :label="$t('message.cms.channelEdit.basicInfo')" name="base">
              <div class="pg-form-grid">
                <el-form-item prop="title">
                  <template #label
                    ><span class="pg-label"
                      >{{ $t("message.cms.blockEdit.colTitle") }}
                      <span class="pg-req">*</span></span
                    ></template
                  >
                  <el-input
                    v-model.trim="formData.title"
                    :placeholder="$t('message.cms.articleEdit.placeholderTitle')"
                  />
                </el-form-item>
                <el-form-item prop="type">
                  <template #label
                    ><span class="pg-label">{{ $t("message.common.type") }}</span></template
                  >
                  <el-input
                    v-model.trim="formData.type"
                    :placeholder="$t('message.cms.pageEdit.placeholderType')"
                  />
                </el-form-item>
                <el-form-item prop="diyname">
                  <template #label
                    ><span class="pg-label">{{
                      $t("message.cms.pageEdit.colDiyname")
                    }}</span></template
                  >
                  <el-input
                    v-model.trim="formData.diyname"
                    :placeholder="$t('message.cms.pageEdit.placeholderDiyname')"
                  />
                </el-form-item>
                <el-form-item prop="showtpl">
                  <template #label
                    ><span class="pg-label">{{
                      $t("message.cms.pageEdit.colShowtpl")
                    }}</span></template
                  >
                  <el-input
                    v-model.trim="formData.showtpl"
                    :placeholder="$t('message.cms.pageEdit.placeholderShowtpl')"
                  />
                </el-form-item>
                <el-form-item prop="seotitle">
                  <template #label
                    ><span class="pg-label">{{
                      $t("message.cms.articleEdit.colSeotitle")
                    }}</span></template
                  >
                  <el-input
                    v-model.trim="formData.seotitle"
                    :placeholder="$t('message.cms.articleEdit.placeholderSeotitle')"
                  />
                </el-form-item>
                <el-form-item prop="keywords">
                  <template #label
                    ><span class="pg-label">{{
                      $t("message.cms.pageEdit.colKeywords")
                    }}</span></template
                  >
                  <el-input
                    v-model.trim="formData.keywords"
                    :placeholder="$t('message.cms.articleEdit.placeholderKeywords')"
                  />
                </el-form-item>
                <el-form-item prop="description" class="pg-full-row">
                  <template #label
                    ><span class="pg-label">{{
                      $t("message.cms.articleEdit.colDescription")
                    }}</span></template
                  >
                  <el-input
                    v-model.trim="formData.description"
                    type="textarea"
                    :rows="3"
                    :placeholder="$t('message.cms.articleEdit.placeholderDescription')"
                  />
                </el-form-item>
                <el-form-item prop="views">
                  <template #label
                    ><span class="pg-label">{{
                      $t("message.cms.articleEdit.colViews")
                    }}</span></template
                  >
                  <el-input
                    v-model.trim="formData.views"
                    :placeholder="$t('message.cms.pageEdit.placeholderViews')"
                  />
                </el-form-item>
                <el-form-item prop="status">
                  <template #label
                    ><span class="pg-label">{{ $t("message.common.colStatus") }}</span></template
                  >
                  <el-radio-group v-model="formData.status">
                    <el-radio :label="1">{{ $t("message.cms.pageEdit.statusEnabled") }}</el-radio>
                    <el-radio :label="0">{{ $t("message.cms.pageEdit.statusDisabled") }}</el-radio>
                  </el-radio-group>
                </el-form-item>
                <el-form-item prop="content" class="pg-full-row">
                  <template #label
                    ><span class="pg-label">{{
                      $t("message.cms.articleEdit.colContent")
                    }}</span></template
                  >
                  <GfTiptap
                    v-model="formData.content"
                    toolbar="full"
                    :placeholder="$t('message.cms.pageEdit.placeholderContent')"
                  />
                </el-form-item>
              </div>
            </el-tab-pane>
            <el-tab-pane :label="$t('message.cms.channelEdit.multiLang')" name="trans">
              <TranslationEditor v-model="formData.translations" :fields="translationFields" />
            </el-tab-pane>
          </el-tabs>

          <div v-if="formData.id" class="pg-meta-row">
            <span class="pg-meta"><b>创建时间:</b> {{ fmtTs(formData.created_at) }}</span>
            <span class="pg-meta"><b>更新时间:</b> {{ fmtTs(formData.updated_at) }}</span>
          </div>

          <div class="pg-form-actions">
            <el-button size="large" @click="$router.push('/cms/page/list')">{{
              $t("message.common.cancel")
            }}</el-button>
            <el-button
              type="primary"
              size="large"
              :loading="submitting"
              @click="onSubmit"
              class="pg-submit-btn"
            >
              <template v-if="!submitting"
                ><el-icon style="margin-right: 4px"><Check /></el-icon
                >{{ $t("message.common.save") }}</template
              >
              <template v-else>{{ $t("message.common.saving") }}</template>
            </el-button>
          </div>
        </el-form>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage, ElMessageBox, FormInstance } from "element-plus";
import { useI18n } from "vue-i18n";
import {
  HomeFilled,
  ArrowLeft,
  Check,
  Delete,
  Loading,
  WarningFilled,
} from "@element-plus/icons-vue";
import { getCmsPage, addCmsPage, updateCmsPage, delCmsPage } from "/@/api/cms/page";
import GfTiptap from "/@/components/tiptap/index.vue";
import TranslationEditor, {
  type TranslationField,
} from "/@/components/translation/TranslationEditor.vue";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const formRef = ref<FormInstance>();
const loading = ref(false);
const submitting = ref(false);
const loadError = ref("");

const translationFields: TranslationField[] = [
  { key: "title", label: t("message.cms.pageEdit.transTitle"), type: "text" },
  { key: "seotitle", label: t("message.cms.pageEdit.transSeotitle"), type: "text" },
  { key: "keywords", label: t("message.cms.pageEdit.transKeywords"), type: "text" },
  {
    key: "description",
    label: t("message.cms.pageEdit.transDescription"),
    type: "textarea",
    rows: 2,
  },
  {
    key: "showtpl",
    label: t("message.cms.pageEdit.transTemplate"),
    type: "templateInput",
    placeholder: "e.g. page_en.html",
  },
  { key: "content", label: t("message.cms.pageEdit.transContent"), type: "richtext", rows: 6 },
];

interface PageFormData {
  id: number | undefined;
  title: string;
  type: string;
  seotitle: string;
  keywords: string;
  description: string;
  content: string;
  diyname: string;
  showtpl: string;
  views: string;
  status: number;
  translations: any[];
  created_at: number;
  updated_at: number;
}

const formData = reactive<PageFormData>({
  id: undefined,
  title: "",
  type: "",
  seotitle: "",
  keywords: "",
  description: "",
  content: "",
  diyname: "",
  showtpl: "",
  views: "",
  status: 1,
  translations: [],
  created_at: 0,
  updated_at: 0,
});

const rules = {
  title: [{ required: true, message: t("message.cms.pageEdit.msgTitleRequired"), trigger: "blur" }],
};

const fmtTs = (ts: number) => {
  if (!ts || ts <= 0) return "—";
  return new Date(ts * 1000).toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const loadData = async () => {
  const id = Number(route.query.id);
  if (!id) {
    loading.value = false;
    return;
  }
  loading.value = true;
  loadError.value = "";
  try {
    const res = await getCmsPage(id);
    const data = (res as any).data;
    if (data?.id) {
      Object.assign(formData, {
        id: data.id,
        title: data.title || "",
        type: data.type || "",
        seotitle: data.seotitle || "",
        keywords: data.keywords || "",
        description: data.description || "",
        content: data.content || "",
        diyname: data.diyname || "",
        showtpl: data.showtpl || "",
        views: data.views || "",
        status: data.status ?? 1,
        translations: data.translations?.length > 0 ? data.translations : [],
        created_at: data.created_at || 0,
        updated_at: data.updated_at || 0,
      });
    } else {
      loadError.value = t("message.cms.pageEdit.notFound");
    }
  } catch {
    loadError.value = t("message.common.msgNetworkErrorRetry");
  } finally {
    loading.value = false;
  }
};

const onSubmit = async () => {
  try {
    await formRef.value?.validate();
  } catch {
    return;
  }
  submitting.value = true;
  try {
    const submitData = { ...formData } as any;
    const transList = submitData.translations || [];
    delete submitData.translations;
    if (transList.length > 0) {
      submitData.translations = transList.filter((item: any) => item.lang && item.lang !== "zh-CN");
    }
    if (formData.id) {
      await updateCmsPage(submitData);
      ElMessage.success(t("message.common.msgEditOk"));
    } else {
      await addCmsPage(submitData);
      ElMessage.success(t("message.common.msgAddOk"));
    }
    router.push("/cms/page/list");
  } catch {
    console.error(t("message.common.submitFailed"));
  } finally {
    submitting.value = false;
  }
};

const onDelete = () => {
  ElMessageBox.confirm(
    `Delete page "${formData.title}"? This cannot be undone.`,
    t("message.common.confirmDeleteTitle"),
    {
      type: "warning",
      confirmButtonText: t("message.common.confirmDeleteTitle"),
      cancelButtonText: t("message.common.cancel"),
    },
  )
    .then(async () => {
      await delCmsPage([formData.id!]);
      ElMessage.success(t("message.common.msgDeleteOk"));
      router.push("/cms/page/list");
    })
    .catch(() => {});
};

onMounted(() => loadData());
watch(
  () => route.query.id,
  () => {
    if (route.query.id) loadData();
  },
);
</script>

<style scoped>
.pg-form-page {
  max-width: 960px;
  margin: 0 auto;
}
.pg-loading {
  text-align: center;
  padding: 80px 20px;
  color: var(--cc-color-text-3);
}
.pg-spin {
  animation: pg-spin 1s linear infinite;
}
@keyframes pg-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
.pg-error {
  text-align: center;
  padding: 80px 20px;
  color: var(--cc-color-text-4);
}
.pg-error h3 {
  color: var(--cc-color-text-2);
  margin: 16px 0 8px;
  font-weight: 600;
}

.pg-page-header {
  position: relative;
  margin: 28px 0 24px;
  padding: 32px 36px;
  background: var(--cc-color-surface);
  border-radius: 16px;
  border: 1px solid var(--cc-color-border);
  overflow: hidden;
}
.pg-page-header::before {
  content: "";
  position: absolute;
  top: -50px;
  right: -50px;
  width: 180px;
  height: 180px;
  background: radial-gradient(circle, rgba(100, 116, 139, 0.08) 0%, transparent 70%);
  border-radius: 50%;
}
.pg-header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  position: relative;
  z-index: 1;
}
.pg-back-btn {
  font-family: var(--cc-font-sans);
  font-size: 13px;
  font-weight: 500;
  color: var(--cc-color-text-3);
  padding: 0;
  margin-bottom: 10px;
  transition: color 0.2s;
}
.pg-back-btn:hover {
  color: var(--cc-color-text-1);
}
.pg-page-title {
  font-family: var(--cc-font-sans);
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--cc-color-text-1);
  margin: 0 0 4px;
}
.pg-page-subtitle {
  font-family: var(--cc-font-sans);
  font-size: 14px;
  color: var(--cc-color-text-3);
  margin: 0;
}
.pg-id-badge {
  display: inline-block;
  padding: 2px 10px;
  background: var(--cc-color-bg);
  border-radius: 6px;
  font-family: "JetBrains Mono", monospace;
  font-size: 13px;
  font-weight: 500;
  color: var(--cc-color-text-2);
}

.pg-form-card {
  background: var(--cc-color-surface);
  border: 1px solid var(--cc-color-border);
  border-radius: 16px;
  padding: 36px 40px;
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.02),
    0 4px 16px rgba(100, 116, 139, 0.04);
}
.pg-form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 32px;
  align-items: start;
}
.pg-form-grid > * {
  min-width: 0;
}
.pg-full-row {
  grid-column: 1 / -1;
}

.pg-label {
  font-family: var(--cc-font-sans);
  font-size: 13px;
  font-weight: 500;
  color: var(--cc-color-text-2);
}
.pg-req {
  color: var(--cc-color-danger);
  margin-left: 2px;
}

.pg-meta-row {
  display: flex;
  gap: 32px;
  flex-wrap: wrap;
  padding-top: 16px;
  margin-bottom: 20px;
  border-top: 1px solid var(--cc-color-border-light);
}
.pg-meta {
  font-family: var(--cc-font-sans);
  font-size: 12px;
  color: var(--cc-color-text-4);
}
.pg-meta b {
  color: var(--cc-color-text-3);
}

.pg-form-card :deep(.el-form-item__label) {
  margin-bottom: 6px;
}
.pg-form-card :deep(.el-input__wrapper),
.pg-form-card :deep(.el-textarea__inner) {
  border-radius: 10px;
  background: var(--cc-color-bg);
  box-shadow: none;
  border: 1px solid var(--cc-color-border);
  transition:
    border-color 0.25s,
    background 0.25s,
    box-shadow 0.25s;
}
.pg-form-card :deep(.el-input__wrapper:hover),
.pg-form-card :deep(.el-textarea__inner:hover) {
  background: var(--cc-color-surface);
  border-color: var(--cc-color-text-4);
}
.pg-form-card :deep(.el-input__wrapper.is-focus),
.pg-form-card :deep(.el-textarea__inner:focus) {
  background: var(--cc-color-surface);
  border-color: var(--cc-color-text-3);
  box-shadow: 0 0 0 3px var(--cc-color-focus-ring);
}
.pg-form-card :deep(.el-input__inner),
.pg-form-card :deep(.el-textarea__inner) {
  font-family: var(--cc-font-sans);
  font-size: 14px;
  color: var(--cc-color-text-1);
}

.pg-form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 24px;
  border-top: 1px solid var(--cc-color-border-light);
}
.pg-form-actions .el-button {
  font-family: var(--cc-font-sans);
  font-weight: 600;
  border-radius: 10px;
  padding: 12px 28px;
}
.pg-submit-btn {
  background: var(--cc-color-primary) !important;
  border: none !important;
  box-shadow: var(--cc-shadow-card);
  transition: all 0.25s !important;
}
.pg-submit-btn:hover:not(.is-loading) {
  background: var(--cc-color-primary-active) !important;
  box-shadow: var(--cc-shadow-card-hover);
  transform: translateY(-1px);
}

@media (min-width: 1440px) {
  .pg-form-page {
    max-width: 1320px;
  }
  .pg-page-header {
    padding: 40px 48px;
  }
  .pg-form-card {
    padding: 40px 48px;
  }
  .pg-form-grid {
    gap: 0 48px;
  }
}
@media (max-width: 768px) {
  .pg-form-grid {
    grid-template-columns: 1fr;
  }
  .pg-page-header {
    padding: 20px;
  }
  .pg-header-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  .pg-form-card {
    padding: 20px 16px;
    border-radius: 12px;
  }
  .pg-page-title {
    font-size: 22px;
  }
  .pg-form-actions {
    flex-direction: column-reverse;
  }
  .pg-form-actions .el-button {
    width: 100%;
  }
}
</style>
