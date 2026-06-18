<template>
  <div class="blk-form-page">
    <el-breadcrumb separator="→">
      <el-breadcrumb-item :to="{ path: '/' }"
        ><el-icon><HomeFilled /></el-icon> {{ $t("message.router.home") }}</el-breadcrumb-item
      >
      <el-breadcrumb-item>CMS</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/cms/block/list' }">{{
        $t("message.cms.blockList.breadcrumbCurrent")
      }}</el-breadcrumb-item>
      <el-breadcrumb-item>{{
        formData.id ? $t("message.router.cmsBlockEdit") : $t("message.router.cmsBlockAdd")
      }}</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- Loading -->
    <div v-if="loading" class="blk-loading">
      <el-icon :size="28" class="blk-spin"><Loading /></el-icon>
      <p>{{ $t("message.cms.blockEdit.loading") }}</p>
    </div>

    <!-- Error -->
    <template v-else-if="loadError">
      <div class="blk-error">
        <el-icon :size="40"><WarningFilled /></el-icon>
        <h3>{{ $t("message.cms.blockEdit.loadError") }}</h3>
        <p>{{ loadError }}</p>
        <el-button type="primary" @click="$router.push('/cms/block/list')">{{
          $t("message.common.backToList")
        }}</el-button>
      </div>
    </template>

    <template v-else>
      <!-- 页头卡片 -->
      <div class="blk-page-header">
        <el-button link class="blk-back-btn" @click="$router.push('/cms/block/list')">
          <el-icon><ArrowLeft /></el-icon> {{ $t("message.common.backToList") }}
        </el-button>
        <div class="blk-header-row">
          <div>
            <h1 class="blk-page-title">
              {{
                formData.name ||
                (formData.id ? $t("message.router.cmsBlockEdit") : $t("message.router.cmsBlockAdd"))
              }}
            </h1>
            <p class="blk-page-subtitle">
              <template v-if="formData.id">
                ID: <span class="blk-id-badge">{{ formData.id }}</span>
                <el-tag
                  :type="formData.status === 1 ? 'success' : 'info'"
                  size="small"
                  effect="light"
                  style="margin-left: 8px"
                >
                  {{
                    formData.status === 1
                      ? $t("message.common.normal")
                      : $t("message.common.hidden")
                  }}
                </el-tag>
              </template>
              <template v-else>
                {{ $t("message.cms.blockEdit.addTitle") }}
              </template>
            </p>
          </div>
          <el-button v-if="formData.id" type="danger" plain size="large" @click="onDelete">
            <el-icon><Delete /></el-icon>{{ $t("message.common.delete") }}</el-button
          >
        </div>
      </div>

      <!-- 表单卡片 -->
      <div class="blk-form-card">
        <el-form ref="formRef" :model="formData" :rules="rules" label-position="top" size="large">
          <el-tabs model-value="base" type="border-card" class="blk-tabs">
            <el-tab-pane :label="$t('message.cms.channelEdit.basicInfo')" name="base">
              <div class="blk-form-grid">
                <el-form-item prop="name">
                  <template #label
                    ><span class="blk-label"
                      >{{ $t("message.common.colName") }} <span class="blk-req">*</span></span
                    ></template
                  >
                  <el-input
                    v-model.trim="formData.name"
                    :placeholder="$t('message.cms.blockEdit.placeholderName')"
                  />
                </el-form-item>
                <el-form-item prop="title">
                  <template #label
                    ><span class="blk-label">{{
                      $t("message.cms.blockEdit.colTitle")
                    }}</span></template
                  >
                  <el-input
                    v-model.trim="formData.title"
                    :placeholder="$t('message.cms.articleEdit.placeholderTitle')"
                  />
                </el-form-item>
                <el-form-item prop="type">
                  <template #label
                    ><span class="blk-label"
                      >{{ $t("message.common.type") }} <span class="blk-req">*</span></span
                    ></template
                  >
                  <el-input
                    v-model.trim="formData.type"
                    :placeholder="$t('message.cms.blockEdit.placeholderType')"
                  />
                </el-form-item>
                <el-form-item prop="image">
                  <template #label
                    ><span class="blk-label">{{
                      $t("message.cms.blockEdit.colImage")
                    }}</span></template
                  >
                  <el-input
                    v-model.trim="formData.image"
                    :placeholder="$t('message.cms.blockEdit.placeholderImage')"
                  />
                </el-form-item>
                <el-form-item prop="url">
                  <template #label
                    ><span class="blk-label">{{
                      $t("message.cms.blockEdit.colUrl")
                    }}</span></template
                  >
                  <el-input
                    v-model.trim="formData.url"
                    :placeholder="$t('message.cms.blockEdit.placeholderUrl')"
                  />
                </el-form-item>
                <el-form-item prop="content" class="blk-full-row">
                  <template #label
                    ><span class="blk-label">{{
                      $t("message.cms.blockEdit.colContent")
                    }}</span></template
                  >
                  <el-input
                    v-model.trim="formData.content"
                    type="textarea"
                    :rows="6"
                    :placeholder="$t('message.cms.articleEdit.placeholderTitle')"
                  />
                </el-form-item>
                <el-form-item prop="parsetpl">
                  <template #label
                    ><span class="blk-label">{{
                      $t("message.cms.blockEdit.colParsetpl")
                    }}</span></template
                  >
                  <el-radio-group v-model="formData.parsetpl">
                    <el-radio :label="1">{{ $t("message.common.yes") }}</el-radio>
                    <el-radio :label="0">{{ $t("message.common.no") }}</el-radio>
                  </el-radio-group>
                </el-form-item>
                <el-form-item prop="weigh">
                  <template #label
                    ><span class="blk-label">{{
                      $t("message.cms.channelEdit.weigh")
                    }}</span></template
                  >
                  <el-input-number
                    v-model="formData.weigh"
                    :min="0"
                    :max="9999"
                    style="width: 100%"
                  />
                </el-form-item>
                <el-form-item prop="status">
                  <template #label
                    ><span class="blk-label">{{ $t("message.common.status") }}</span></template
                  >
                  <el-radio-group v-model="formData.status">
                    <el-radio :label="1">{{ $t("message.common.normal") }}</el-radio>
                    <el-radio :label="0">{{ $t("message.common.hidden") }}</el-radio>
                  </el-radio-group>
                </el-form-item>
              </div>
            </el-tab-pane>
            <el-tab-pane :label="$t('message.cms.channelEdit.multiLang')" name="trans">
              <TranslationEditor v-model="formData.translations" :fields="translationFields" />
            </el-tab-pane>
          </el-tabs>

          <!-- 时间元信息 -->
          <div v-if="formData.id" class="blk-meta-row">
            <span class="blk-meta"
              ><b>{{ $t("message.common.colCreateTime") }}</b>
              {{ fmtTs(formData.created_at) }}</span
            >
            <span class="blk-meta"
              ><b>{{ $t("message.common.colUpdateTime") }}</b>
              {{ fmtTs(formData.updated_at) }}</span
            >
          </div>

          <!-- 操作栏 -->
          <div class="blk-form-actions">
            <el-button size="large" @click="$router.push('/cms/block/list')">{{
              $t("message.common.cancel")
            }}</el-button>
            <el-button
              type="primary"
              size="large"
              :loading="submitting"
              @click="onSubmit"
              class="blk-submit-btn"
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
import { addCmsBlock, getCmsBlock, updateCmsBlock, delCmsBlock } from "/@/api/cms/block";
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
  { key: "title", label: t("message.cms.blockEdit.transTitle"), type: "text" },
  { key: "content", label: t("message.cms.blockEdit.transContent"), type: "textarea", rows: 6 },
];

interface BlockFormData {
  id: number | undefined;
  name: string;
  title: string;
  type: string;
  image: string;
  url: string;
  content: string;
  parsetpl: number;
  weigh: number;
  status: number;
  translations: any[];
  created_at: number;
  updated_at: number;
}

const formData = reactive<BlockFormData>({
  id: undefined,
  name: "",
  title: "",
  type: "",
  image: "",
  url: "",
  content: "",
  parsetpl: 0,
  weigh: 0,
  status: 1,
  translations: [],
  created_at: 0,
  updated_at: 0,
});

const rules = {
  name: [{ required: true, message: t("message.cms.setting.msgNameRequired"), trigger: "blur" }],
  type: [{ required: true, message: t("message.cms.blockEdit.msgTypeRequired"), trigger: "blur" }],
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
    const res = await getCmsBlock(id);
    const data = (res as any).data;
    if (data?.id) {
      formData.id = data.id;
      formData.name = data.name || "";
      formData.title = data.title || "";
      formData.type = data.type || "";
      formData.image = data.image || "";
      formData.url = data.url || "";
      formData.content = data.content || "";
      formData.parsetpl = data.parsetpl ?? 0;
      formData.weigh = data.weigh ?? 0;
      formData.status = data.status ?? 1;
      formData.created_at = data.created_at || 0;
      formData.updated_at = data.updated_at || 0;
      if (data.translations?.length > 0) formData.translations = data.translations;
    } else {
      loadError.value = t("message.cms.blockEdit.notFound");
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
      await updateCmsBlock(submitData);
      ElMessage.success(t("message.editSuccess"));
    } else {
      await addCmsBlock(submitData);
      ElMessage.success(t("message.addSuccess"));
    }
    router.push("/cms/block/list");
  } catch {
    console.error(t("message.common.submitFailed"));
  } finally {
    submitting.value = false;
  }
};

const onDelete = () => {
  ElMessageBox.confirm(
    `Delete block "${formData.name}"? This cannot be undone.`,
    t("message.common.confirmDeleteTitle"),
    {
      type: "warning",
      confirmButtonText: t("message.common.confirmDeleteTitle"),
      cancelButtonText: t("message.common.cancel"),
    },
  )
    .then(async () => {
      await delCmsBlock([formData.id!]);
      ElMessage.success(t("message.common.msgDeleteOk"));
      router.push("/cms/block/list");
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
.blk-form-page {
  max-width: 960px;
  margin: 0 auto;
}

/* Loading / Error */
.blk-loading {
  text-align: center;
  padding: 80px 20px;
  color: var(--cc-color-text-3);
}
.blk-spin {
  animation: blk-spin 1s linear infinite;
}
@keyframes blk-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
.blk-error {
  text-align: center;
  padding: 80px 20px;
  color: var(--cc-color-text-4);
}
.blk-error h3 {
  color: var(--cc-color-text-2);
  margin: 16px 0 8px;
  font-weight: 600;
}

/* Page Header */
.blk-page-header {
  position: relative;
  margin: 28px 0 24px;
  padding: 32px 36px;
  background: var(--cc-color-surface);
  border-radius: 16px;
  border: 1px solid var(--cc-color-border);
  overflow: hidden;
}
.blk-page-header::before {
  content: "";
  position: absolute;
  top: -50px;
  right: -50px;
  width: 180px;
  height: 180px;
  background: radial-gradient(circle, rgba(100, 116, 139, 0.08) 0%, transparent 70%);
  border-radius: 50%;
}
.blk-header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  position: relative;
  z-index: 1;
}
.blk-back-btn {
  font-family: var(--cc-font-sans);
  font-size: 13px;
  font-weight: 500;
  color: var(--cc-color-text-3);
  padding: 0;
  margin-bottom: 10px;
  transition: color 0.2s;
}
.blk-back-btn:hover {
  color: var(--cc-color-text-1);
}
.blk-page-title {
  font-family: var(--cc-font-sans);
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--cc-color-text-1);
  margin: 0 0 4px;
}
.blk-page-subtitle {
  font-family: var(--cc-font-sans);
  font-size: 14px;
  color: var(--cc-color-text-3);
  margin: 0;
}
.blk-id-badge {
  display: inline-block;
  padding: 2px 10px;
  background: var(--cc-color-bg);
  border-radius: 6px;
  font-family: "JetBrains Mono", "SF Mono", monospace;
  font-size: 13px;
  font-weight: 500;
  color: var(--cc-color-text-2);
}

/* Form Card */
.blk-form-card {
  background: #fff;
  border: 1px solid var(--cc-color-border);
  border-radius: 16px;
  padding: 36px 40px;
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.02),
    0 4px 16px rgba(100, 116, 139, 0.04);
}

/* Tabs */
.blk-tabs {
  margin-bottom: 24px;
}
.blk-tabs :deep(.el-tabs__content) {
  padding: 20px 0 0;
}
.blk-tabs :deep(.el-tabs__header) {
  background: transparent;
  border: none;
  margin-bottom: 0;
}
.blk-tabs :deep(.el-tabs__nav) {
  border: none;
}
.blk-tabs :deep(.el-tabs__item) {
  font-family: var(--cc-font-sans);
  font-size: 14px;
  font-weight: 500;
  color: var(--cc-color-text-3);
  padding: 10px 20px;
  border-radius: 8px 8px 0 0;
}
.blk-tabs :deep(.el-tabs__item.is-active) {
  color: var(--cc-color-text-1);
  background: #fff;
  border-color: var(--cc-color-border);
}

/* Form Grid - 双列布局基础 */
.blk-form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 32px;
  align-items: start;
}
.blk-form-grid > * {
  min-width: 0;
}
.blk-full-row {
  grid-column: 1 / -1;
}

/* Label */
.blk-label {
  font-family: var(--cc-font-sans);
  font-size: 13px;
  font-weight: 500;
  color: var(--cc-color-text-2);
  letter-spacing: 0.005em;
}
.blk-req {
  color: #ef4444;
  margin-left: 2px;
}

/* Meta */
.blk-meta-row {
  display: flex;
  gap: 32px;
  flex-wrap: wrap;
  padding-top: 16px;
  margin-bottom: 20px;
  border-top: 1px solid var(--cc-color-border-light);
}
.blk-meta {
  font-family: var(--cc-font-sans);
  font-size: 12px;
  color: var(--cc-color-text-4);
}
.blk-meta b {
  color: var(--cc-color-text-3);
}

/* Form Styling */
.blk-form-card :deep(.el-form-item__label) {
  margin-bottom: 6px;
}
.blk-form-card :deep(.el-input__wrapper),
.blk-form-card :deep(.el-input-number__wrapper),
.blk-form-card :deep(.el-textarea__inner) {
  border-radius: 10px;
  background: var(--cc-color-bg);
  box-shadow: none;
  border: 1px solid var(--cc-color-border);
  transition:
    border-color 0.25s,
    background 0.25s,
    box-shadow 0.25s;
}
.blk-form-card :deep(.el-input__wrapper:hover),
.blk-form-card :deep(.el-input-number__wrapper:hover),
.blk-form-card :deep(.el-textarea__inner:hover) {
  background: #fff;
  border-color: var(--cc-color-text-4);
}
.blk-form-card :deep(.el-input__wrapper.is-focus),
.blk-form-card :deep(.el-input-number__wrapper.is-focus),
.blk-form-card :deep(.el-textarea__inner:focus) {
  background: #fff;
  border-color: var(--cc-color-text-3);
  box-shadow: 0 0 0 3px var(--cc-color-focus-ring);
}
.blk-form-card :deep(.el-input__inner),
.blk-form-card :deep(.el-input-number__inner),
.blk-form-card :deep(.el-textarea__inner) {
  font-family: var(--cc-font-sans);
  font-size: 14px;
  color: var(--cc-color-text-1);
}
.blk-form-card :deep(.el-input__inner::placeholder) {
  color: var(--cc-color-text-4);
}

/* Actions */
.blk-form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 24px;
  border-top: 1px solid var(--cc-color-border-light);
}
.blk-form-actions .el-button {
  font-family: var(--cc-font-sans);
  font-weight: 600;
  letter-spacing: 0.005em;
  border-radius: 10px;
  padding: 12px 28px;
}
.blk-submit-btn {
  background: var(--cc-color-primary) !important;
  border: none !important;
  box-shadow: var(--cc-shadow-card);
  transition: all 0.25s !important;
}
.blk-submit-btn:hover:not(.is-loading) {
  background: var(--cc-color-primary-active) !important;
  box-shadow: var(--cc-shadow-card-hover);
  transform: translateY(-1px);
}

/* =============================================
   >1440px 双列平铺布局
   表单卡片放宽 + section 内容双列排列
   ============================================= */
@media (min-width: 1440px) {
  .blk-form-page {
    max-width: 1320px;
  }
  .blk-page-header {
    padding: 40px 48px;
  }
  .blk-form-card {
    padding: 40px 48px;
  }
  .blk-form-grid {
    gap: 0 48px;
  }
  .blk-form-actions .el-button {
    padding: 14px 36px;
  }
}

/* =============================================
   768px 以下移动端自适应
   ============================================= */
@media (max-width: 768px) {
  .blk-form-grid {
    grid-template-columns: 1fr;
  }
  .blk-page-header {
    padding: 20px;
  }
  .blk-header-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  .blk-form-card {
    padding: 20px 16px;
    border-radius: 12px;
  }
  .blk-page-title {
    font-size: 22px;
  }
  .blk-form-actions {
    flex-direction: column-reverse;
  }
  .blk-form-actions .el-button {
    width: 100%;
  }
  .blk-meta-row {
    flex-direction: column;
    gap: 8px;
  }
}
</style>
