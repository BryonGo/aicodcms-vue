<template>
  <div class="tge-form-page">
    <el-breadcrumb separator="→">
      <el-breadcrumb-item :to="{ path: '/' }"
        ><el-icon><HomeFilled /></el-icon> {{ $t("message.router.home") }}</el-breadcrumb-item
      >
      <el-breadcrumb-item>CMS</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/cms/tag/list' }">{{
        $t("message.cms.tagList.breadcrumbs.tag")
      }}</el-breadcrumb-item>
      <el-breadcrumb-item>{{
        formData.id ? $t("message.router.cmsTagEdit") : $t("message.minio.addTag")
      }}</el-breadcrumb-item>
    </el-breadcrumb>

    <div v-if="loading" class="tge-loading">
      <el-icon :size="28" class="tge-spin"><Loading /></el-icon>
      <p>{{ $t("message.cms.tagEdit.loading") }}</p>
    </div>

    <template v-else-if="loadError">
      <div class="tge-error">
        <el-icon :size="40"><WarningFilled /></el-icon>
        <h3>{{ $t("message.cms.tagEdit.loadError") }}</h3>
        <p>{{ loadError }}</p>
        <el-button type="primary" @click="$router.push('/cms/tag/list')">{{
          $t("message.common.backToList")
        }}</el-button>
      </div>
    </template>

    <template v-else>
      <div class="tge-page-header">
        <el-button link class="tge-back-btn" @click="$router.push('/cms/tag/list')">
          <el-icon><ArrowLeft /></el-icon> {{ $t("message.common.backToList") }}
        </el-button>
        <div class="tge-header-row">
          <div>
            <h1 class="tge-page-title">
              {{
                formData.name ||
                (formData.id ? $t("message.router.cmsTagEdit") : $t("message.minio.addTag"))
              }}
            </h1>
            <p class="tge-page-subtitle">
              <template v-if="formData.id">
                ID: <span class="tge-id-badge">{{ formData.id }}</span>
              </template>
              <template v-else>{{ $t("message.cms.tagEdit.addTitle") }}</template>
            </p>
          </div>
          <el-button v-if="formData.id" type="danger" plain size="large" @click="onDelete">
            <el-icon><Delete /></el-icon>{{ $t("message.common.delete") }}</el-button
          >
        </div>
      </div>

      <div class="tge-form-card">
        <el-form ref="formRef" :model="formData" :rules="rules" label-position="top" size="large">
          <div class="tge-form-grid">
            <el-form-item prop="name">
              <template #label
                ><span class="tge-label"
                  >{{ $t("message.common.colName") }} <span class="tge-req">*</span></span
                ></template
              >
              <el-input
                v-model.trim="formData.name"
                :placeholder="$t('message.cms.tagList.placeholderName')"
              />
            </el-form-item>
            <el-form-item prop="seotitle">
              <template #label
                ><span class="tge-label">{{ $t("message.cms.tagEdit.seoTitle") }}</span></template
              >
              <el-input v-model.trim="formData.seotitle" placeholder="seotitle" />
            </el-form-item>
            <el-form-item prop="keywords">
              <template #label
                ><span class="tge-label">{{
                  $t("message.cms.articleEdit.colKeywords")
                }}</span></template
              >
              <el-input v-model.trim="formData.keywords" placeholder="keywords" />
            </el-form-item>
            <el-form-item prop="description">
              <template #label
                ><span class="tge-label">{{
                  $t("message.cms.tagList.colDescription")
                }}</span></template
              >
              <el-input
                v-model.trim="formData.description"
                placeholder="description"
                type="textarea"
                :rows="3"
              />
            </el-form-item>
            <el-form-item prop="views">
              <template #label
                ><span class="tge-label">{{
                  $t("message.cms.articleEdit.colViews")
                }}</span></template
              >
              <el-input
                v-model.trim="formData.views"
                type="number"
                :placeholder="$t('message.cms.articleEdit.placeholderViews')"
              />
            </el-form-item>
            <el-form-item prop="autolink">
              <template #label
                ><span class="tge-label">{{
                  $t("message.cms.tagList.colAutolink")
                }}</span></template
              >
              <el-radio-group v-model="formData.autolink">
                <el-radio :label="1">{{ $t("message.common.yes") }}</el-radio>
                <el-radio :label="0">{{ $t("message.common.no") }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </div>

          <div v-if="formData.id" class="tge-meta-row">
            <span class="tge-meta"><b>创建时间:</b> {{ fmtTs(formData.created_at) }}</span>
            <span class="tge-meta"><b>更新时间:</b> {{ fmtTs(formData.updated_at) }}</span>
          </div>

          <div class="tge-form-actions">
            <el-button size="large" @click="$router.push('/cms/tag/list')">{{
              $t("message.common.cancel")
            }}</el-button>
            <el-button
              type="primary"
              size="large"
              :loading="submitting"
              @click="onSubmit"
              class="tge-submit-btn"
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
import { getCmsTags, addCmsTags, updateCmsTags, delCmsTags } from "/@/api/cms/tag";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const formRef = ref<FormInstance>();
const loading = ref(false);
const submitting = ref(false);
const loadError = ref("");

interface TagFormData {
  id: number | undefined;
  name: string;
  seotitle: string;
  keywords: string;
  description: string;
  views: number | undefined;
  autolink: number;
  created_at: number;
  updated_at: number;
}

const formData = reactive<TagFormData>({
  id: undefined,
  name: "",
  seotitle: "",
  keywords: "",
  description: "",
  views: undefined,
  autolink: 0,
  created_at: 0,
  updated_at: 0,
});

const rules = { name: [{ required: true, message: "Tag name is required", trigger: "blur" }] };

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
    const res = await getCmsTags(id);
    const data = (res as any).data;
    if (data?.id) {
      Object.assign(formData, {
        id: data.id,
        name: data.name || "",
        seotitle: data.seotitle || "",
        keywords: data.keywords || "",
        description: data.description || "",
        views: data.views,
        autolink: data.autolink ?? 0,
        created_at: data.created_at || 0,
        updated_at: data.updated_at || 0,
      });
    } else {
      loadError.value = t("message.cms.tagEdit.notFound");
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
    const data = { ...formData };
    if (formData.id) {
      await updateCmsTags(data);
      ElMessage.success(t("message.editSuccess"));
    } else {
      await addCmsTags(data);
      ElMessage.success(t("message.addSuccess"));
    }
    router.push("/cms/tag/list");
  } catch {
    console.error(t("message.common.submitFailed"));
  } finally {
    submitting.value = false;
  }
};

const onDelete = () => {
  ElMessageBox.confirm(
    `Delete tag "${formData.name}"? This cannot be undone.`,
    t("message.common.confirmDeleteTitle"),
    {
      type: "warning",
      confirmButtonText: t("message.common.confirmDeleteTitle"),
      cancelButtonText: t("message.common.cancel"),
    },
  )
    .then(async () => {
      await delCmsTags([formData.id!]);
      ElMessage.success(t("message.common.msgDeleteOk"));
      router.push("/cms/tag/list");
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
.tge-form-page {
  max-width: 960px;
  margin: 0 auto;
}
.tge-loading {
  text-align: center;
  padding: 80px 20px;
  color: var(--cc-color-text-3);
}
.tge-spin {
  animation: tge-spin 1s linear infinite;
}
@keyframes tge-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
.tge-error {
  text-align: center;
  padding: 80px 20px;
  color: var(--cc-color-text-4);
}
.tge-error h3 {
  color: var(--cc-color-text-2);
  margin: 16px 0 8px;
  font-weight: 600;
}

.tge-page-header {
  position: relative;
  margin: 28px 0 24px;
  padding: 32px 36px;
  background: var(--cc-color-surface);
  border-radius: 16px;
  border: 1px solid var(--cc-color-border);
  overflow: hidden;
}
.tge-page-header::before {
  content: "";
  position: absolute;
  top: -50px;
  right: -50px;
  width: 180px;
  height: 180px;
  background: radial-gradient(circle, rgba(100, 116, 139, 0.08) 0%, transparent 70%);
  border-radius: 50%;
}
.tge-header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  position: relative;
  z-index: 1;
}
.tge-back-btn {
  font-family: var(--cc-font-sans);
  font-size: 13px;
  font-weight: 500;
  color: var(--cc-color-text-3);
  padding: 0;
  margin-bottom: 10px;
  transition: color 0.2s;
}
.tge-back-btn:hover {
  color: var(--cc-color-text-1);
}
.tge-page-title {
  font-family: var(--cc-font-sans);
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--cc-color-text-1);
  margin: 0 0 4px;
}
.tge-page-subtitle {
  font-family: var(--cc-font-sans);
  font-size: 14px;
  color: var(--cc-color-text-3);
  margin: 0;
}
.tge-id-badge {
  display: inline-block;
  padding: 2px 10px;
  background: var(--cc-color-bg);
  border-radius: 6px;
  font-family: "JetBrains Mono", monospace;
  font-size: 13px;
  font-weight: 500;
  color: var(--cc-color-text-2);
}

.tge-form-card {
  background: #fff;
  border: 1px solid var(--cc-color-border);
  border-radius: 16px;
  padding: 36px 40px;
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.02),
    0 4px 16px rgba(100, 116, 139, 0.04);
}
.tge-form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 32px;
  align-items: start;
}
.tge-form-grid > * {
  min-width: 0;
}

.tge-label {
  font-family: var(--cc-font-sans);
  font-size: 13px;
  font-weight: 500;
  color: var(--cc-color-text-2);
}
.tge-req {
  color: #ef4444;
  margin-left: 2px;
}

.tge-meta-row {
  display: flex;
  gap: 32px;
  flex-wrap: wrap;
  padding-top: 16px;
  margin-bottom: 20px;
  border-top: 1px solid var(--cc-color-border-light);
}
.tge-meta {
  font-family: var(--cc-font-sans);
  font-size: 12px;
  color: var(--cc-color-text-4);
}
.tge-meta b {
  color: var(--cc-color-text-3);
}

.tge-form-card :deep(.el-form-item__label) {
  margin-bottom: 6px;
}
.tge-form-card :deep(.el-input__wrapper),
.tge-form-card :deep(.el-textarea__inner) {
  border-radius: 10px;
  background: var(--cc-color-bg);
  box-shadow: none;
  border: 1px solid var(--cc-color-border);
  transition:
    border-color 0.25s,
    background 0.25s,
    box-shadow 0.25s;
}
.tge-form-card :deep(.el-input__wrapper:hover),
.tge-form-card :deep(.el-textarea__inner:hover) {
  background: #fff;
  border-color: var(--cc-color-text-4);
}
.tge-form-card :deep(.el-input__wrapper.is-focus),
.tge-form-card :deep(.el-textarea__inner:focus) {
  background: #fff;
  border-color: var(--cc-color-text-3);
  box-shadow: 0 0 0 3px var(--cc-color-focus-ring);
}
.tge-form-card :deep(.el-input__inner),
.tge-form-card :deep(.el-textarea__inner) {
  font-family: var(--cc-font-sans);
  font-size: 14px;
  color: var(--cc-color-text-1);
}

.tge-form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 24px;
  border-top: 1px solid var(--cc-color-border-light);
}
.tge-form-actions .el-button {
  font-family: var(--cc-font-sans);
  font-weight: 600;
  border-radius: 10px;
  padding: 12px 28px;
}
.tge-submit-btn {
  background: var(--cc-color-primary) !important;
  border: none !important;
  box-shadow: var(--cc-shadow-card);
  transition: all 0.25s !important;
}
.tge-submit-btn:hover:not(.is-loading) {
  background: var(--cc-color-primary-active) !important;
  box-shadow: var(--cc-shadow-card-hover);
  transform: translateY(-1px);
}

@media (min-width: 1440px) {
  .tge-form-page {
    max-width: 1320px;
  }
  .tge-page-header {
    padding: 40px 48px;
  }
  .tge-form-card {
    padding: 40px 48px;
  }
  .tge-form-grid {
    gap: 0 48px;
  }
}
@media (max-width: 768px) {
  .tge-form-grid {
    grid-template-columns: 1fr;
  }
  .tge-page-header {
    padding: 20px;
  }
  .tge-header-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  .tge-form-card {
    padding: 20px 16px;
    border-radius: 12px;
  }
  .tge-page-title {
    font-size: 22px;
  }
  .tge-form-actions {
    flex-direction: column-reverse;
  }
  .tge-form-actions .el-button {
    width: 100%;
  }
}
</style>
