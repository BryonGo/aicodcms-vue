<template>
  <div class="minf-form-page">
    <el-breadcrumb separator="→">
      <el-breadcrumb-item :to="{ path: '/' }"
        ><el-icon><HomeFilled /></el-icon> {{ $t("message.router.home") }}</el-breadcrumb-item
      >
      <el-breadcrumb-item>{{ $t("message.pms.systemManagement") }}</el-breadcrumb-item>
      <el-breadcrumb-item>{{
        $t("message.pms.modulesInfoList.breadcrumbCurrent")
      }}</el-breadcrumb-item>
      <el-breadcrumb-item>{{
        formData.id
          ? $t("message.router.pmsModulesInfoEdit")
          : $t("message.router.pmsModulesInfoAdd")
      }}</el-breadcrumb-item>
    </el-breadcrumb>

    <div v-if="loading" class="minf-loading">
      <el-icon :size="28" class="minf-spin"><Loading /></el-icon>
      <p>{{ $t("message.pms.modulesInfoEdit.loading") }}</p>
    </div>

    <template v-else-if="loadError">
      <div class="minf-error">
        <el-icon :size="40"><WarningFilled /></el-icon>
        <h3>{{ $t("message.pms.modulesInfoEdit.loadError") }}</h3>
        <p>{{ loadError }}</p>
        <el-button type="primary" @click="$router.back()">{{
          $t("message.common.backToList")
        }}</el-button>
      </div>
    </template>

    <template v-else>
      <div class="minf-page-header">
        <el-button link class="minf-back-btn" @click="$router.back()">
          <el-icon><ArrowLeft /></el-icon> {{ $t("message.common.backToList") }}
        </el-button>
        <div class="minf-header-row">
          <div>
            <h1 class="minf-page-title">
              {{
                formData.name ||
                (formData.id
                  ? $t("message.router.pmsModulesInfoEdit")
                  : $t("message.router.pmsModulesInfoAdd"))
              }}
            </h1>
            <p class="minf-page-subtitle">
              <template v-if="formData.id">
                ID: <span class="minf-id-badge">{{ formData.id }}</span>
              </template>
              <template v-else>{{ $t("message.pms.modulesInfoEdit.addTitle") }}</template>
            </p>
          </div>
        </div>
      </div>

      <div class="minf-form-card">
        <el-form ref="formRef" :model="formData" :rules="rules" label-position="top" size="large">
          <div class="minf-form-grid">
            <el-form-item prop="name">
              <template #label
                ><span class="minf-label"
                  >{{ $t("message.common.colName") }} <span class="minf-req">*</span></span
                ></template
              >
              <el-input
                v-model="formData.name"
                :placeholder="$t('message.pms.modulesInfoList.placeholderName')"
              />
            </el-form-item>
            <el-form-item prop="table_name">
              <template #label
                ><span class="minf-label"
                  >{{ $t("message.pms.modulesInfoList.colTable") }}
                  <span class="minf-req">*</span></span
                ></template
              >
              <el-input
                v-model="formData.table_name"
                :placeholder="$t('message.pms.modulesInfoList.placeholderTableName')"
              />
            </el-form-item>
          </div>

          <div v-if="formData.id" class="minf-meta-row">
            <span class="minf-meta"><b>创建时间:</b> {{ fmtTs(formData.created_at) }}</span>
            <span class="minf-meta"><b>更新时间:</b> {{ fmtTs(formData.updated_at) }}</span>
          </div>

          <div class="minf-form-actions">
            <el-button size="large" @click="$router.back()">{{
              $t("message.common.cancel")
            }}</el-button>
            <el-button
              type="primary"
              size="large"
              :loading="submitting"
              @click="onSubmit"
              class="minf-submit-btn"
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
import { ElMessage, FormInstance } from "element-plus";
import { HomeFilled, ArrowLeft, Check, Loading, WarningFilled } from "@element-plus/icons-vue";
import { addModulesInfo, getModulesInfo, updateModulesInfo } from "/@/api/pms/modulesInfo";
import { useI18n } from "vue-i18n";
const { t } = useI18n();

const route = useRoute();
const router = useRouter();
const formRef = ref<FormInstance>();
const loading = ref(false);
const submitting = ref(false);
const loadError = ref("");

interface ModuleFormData {
  id: number | undefined;
  name: string;
  table_name: string;
  created_at: number;
  updated_at: number;
}

const formData = reactive<ModuleFormData>({
  id: undefined,
  name: "",
  table_name: "",
  created_at: 0,
  updated_at: 0,
});

const rules = {
  name: [{ required: true, message: "Model name is required", trigger: "blur" }],
  table_name: [{ required: true, message: "Table name is required", trigger: "blur" }],
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
    const res = await getModulesInfo(id);
    const data = (res as any).data;
    if (data?.id) {
      formData.id = data.id;
      formData.name = data.name || "";
      formData.table_name = data.table_name || "";
      formData.created_at = data.created_at || 0;
      formData.updated_at = data.updated_at || 0;
    } else {
      loadError.value = t("message.pms.modulesInfoEdit.notFound");
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
    if (formData.id) {
      await updateModulesInfo(formData);
      ElMessage.success(t("message.common.msgEditOk"));
    } else {
      await addModulesInfo(formData);
      ElMessage.success(t("message.common.msgAddOk"));
    }
    router.back();
  } catch {
    console.error(t("message.common.submitFailed"));
  } finally {
    submitting.value = false;
  }
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
.minf-form-page {
  max-width: 960px;
  margin: 0 auto;
}
.minf-loading {
  text-align: center;
  padding: 80px 20px;
  color: var(--cc-color-text-3);
}
.minf-spin {
  animation: minf-spin 1s linear infinite;
}
@keyframes minf-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
.minf-error {
  text-align: center;
  padding: 80px 20px;
  color: var(--cc-color-text-4);
}
.minf-error h3 {
  color: var(--cc-color-text-2);
  margin: 16px 0 8px;
  font-weight: 600;
}

.minf-page-header {
  position: relative;
  margin: 28px 0 24px;
  padding: 32px 36px;
  background: var(--cc-color-surface);
  border-radius: 16px;
  border: 1px solid var(--cc-color-border-light);
  overflow: hidden;
}
.minf-page-header::before {
  content: "";
  position: absolute;
  top: -50px;
  right: -50px;
  width: 180px;
  height: 180px;
  background: radial-gradient(circle, rgba(14, 165, 233, 0.08) 0%, transparent 70%);
  border-radius: 50%;
}
.minf-header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  position: relative;
  z-index: 1;
}
.minf-back-btn {
  font-family: var(--cc-font-sans);
  font-size: 13px;
  font-weight: 500;
  color: var(--cc-color-primary);
  padding: 0;
  margin-bottom: 10px;
  transition: color 0.2s;
}
.minf-back-btn:hover {
  color: #0369a1;
}
.minf-page-title {
  font-family: var(--cc-font-sans);
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--cc-color-text-1);
  margin: 0 0 4px;
}
.minf-page-subtitle {
  font-family: var(--cc-font-sans);
  font-size: 14px;
  color: var(--cc-color-primary);
  margin: 0;
}
.minf-id-badge {
  display: inline-block;
  padding: 2px 10px;
  background: var(--cc-color-primary-soft);
  border-radius: 6px;
  font-family: "JetBrains Mono", monospace;
  font-size: 13px;
  font-weight: 500;
  color: var(--cc-color-primary);
}

.minf-form-card {
  background: #fff;
  border: 1px solid var(--cc-color-border-light);
  border-radius: 16px;
  padding: 36px 40px;
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.02),
    0 4px 16px rgba(14, 165, 233, 0.06);
}
.minf-form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 32px;
  align-items: start;
}
.minf-form-grid > * {
  min-width: 0;
}

.minf-label {
  font-family: var(--cc-font-sans);
  font-size: 13px;
  font-weight: 500;
  color: var(--cc-color-text-1);
}
.minf-req {
  color: #ef4444;
  margin-left: 2px;
}

.minf-meta-row {
  display: flex;
  gap: 32px;
  flex-wrap: wrap;
  padding-top: 16px;
  margin-bottom: 20px;
  border-top: 1px solid #e0f2fe;
}
.minf-meta {
  font-family: var(--cc-font-sans);
  font-size: 12px;
  color: #7dd3fc;
}
.minf-meta b {
  color: var(--cc-color-primary);
}

.minf-form-card :deep(.el-form-item__label) {
  margin-bottom: 6px;
}
.minf-form-card :deep(.el-input__wrapper) {
  border-radius: 10px;
  background: var(--cc-color-bg);
  box-shadow: none;
  border: 1px solid var(--cc-color-border-light);
  transition:
    border-color 0.25s,
    background 0.25s,
    box-shadow 0.25s;
}
.minf-form-card :deep(.el-input__wrapper:hover) {
  background: #fff;
  border-color: #7dd3fc;
}
.minf-form-card :deep(.el-input__wrapper.is-focus) {
  background: #fff;
  border-color: var(--cc-color-primary);
  box-shadow: 0 0 0 3px var(--cc-color-focus-ring);
}
.minf-form-card :deep(.el-input__inner) {
  font-family: var(--cc-font-sans);
  font-size: 14px;
  color: var(--cc-color-text-1);
}

.minf-form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 24px;
  border-top: 1px solid #e0f2fe;
}
.minf-form-actions .el-button {
  font-family: var(--cc-font-sans);
  font-weight: 600;
  border-radius: 10px;
  padding: 12px 28px;
}
.minf-submit-btn {
  background: var(--cc-color-primary) !important;
  border: none !important;
  box-shadow: 0 2px 8px rgba(14, 165, 233, 0.3);
  transition: all 0.25s !important;
}
.minf-submit-btn:hover:not(.is-loading) {
  background: var(--cc-color-primary-active) !important;
  box-shadow: 0 4px 16px rgba(14, 165, 233, 0.4);
  transform: translateY(-1px);
}

@media (min-width: 1440px) {
  .minf-form-page {
    max-width: 1320px;
  }
  .minf-page-header {
    padding: 40px 48px;
  }
  .minf-form-card {
    padding: 40px 48px;
  }
  .minf-form-grid {
    gap: 0 48px;
  }
}
@media (max-width: 768px) {
  .minf-form-grid {
    grid-template-columns: 1fr;
  }
  .minf-page-header {
    padding: 20px;
  }
  .minf-header-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  .minf-form-card {
    padding: 20px 16px;
    border-radius: 12px;
  }
  .minf-page-title {
    font-size: 22px;
  }
  .minf-form-actions {
    flex-direction: column-reverse;
  }
  .minf-form-actions .el-button {
    width: 100%;
  }
}
</style>
