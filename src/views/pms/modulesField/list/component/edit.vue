<template>
  <div class="mfld-form-page">
    <el-breadcrumb separator="→">
      <el-breadcrumb-item :to="{ path: '/' }"
        ><el-icon><HomeFilled /></el-icon> {{ $t("message.router.home") }}</el-breadcrumb-item
      >
      <el-breadcrumb-item>{{ $t("message.pms.modulesField.breadcrumbPms") }}</el-breadcrumb-item>
      <el-breadcrumb-item>{{
        $t("message.pms.modulesInfoList.breadcrumbCurrent")
      }}</el-breadcrumb-item>
      <el-breadcrumb-item>{{
        $t("message.pms.modulesField.breadcrumbCurrent")
      }}</el-breadcrumb-item>
      <el-breadcrumb-item>{{
        formData.id
          ? $t("message.router.pmsModulesFieldEdit")
          : $t("message.router.pmsModulesFieldAdd")
      }}</el-breadcrumb-item>
    </el-breadcrumb>

    <div v-if="loading" class="mfld-loading">
      <el-icon :size="28" class="mfld-spin"><Loading /></el-icon>
      <p>{{ $t("message.pms.commonExt.loading") }}</p>
    </div>

    <template v-else-if="loadError">
      <div class="mfld-error">
        <el-icon :size="40"><WarningFilled /></el-icon>
        <h3>{{ $t("message.pms.commonExt.loadError") }}</h3>
        <p>{{ loadError }}</p>
        <el-button type="primary" @click="onCancel">{{
          $t("message.common.backToList")
        }}</el-button>
      </div>
    </template>

    <template v-else>
      <div class="mfld-page-header">
        <el-button link class="mfld-back-btn" @click="onCancel">
          <el-icon><ArrowLeft /></el-icon> {{ $t("message.common.backToList") }}
        </el-button>
        <div class="mfld-header-row">
          <div>
            <h1 class="mfld-page-title">
              {{
                formData.label ||
                (formData.id
                  ? $t("message.router.pmsModulesFieldEdit")
                  : $t("message.router.pmsModulesFieldAdd"))
              }}
            </h1>
            <p class="mfld-page-subtitle">
              {{ $t("message.pms.modulesFieldEdit.labelModel") }}:
              <span class="mfld-model-badge">{{ modulesInfo?.name }}</span>
              <template v-if="formData.id">
                · ID: <span class="mfld-id-badge">{{ formData.id }}</span></template
              >
            </p>
          </div>
          <el-button v-if="formData.id" type="danger" plain size="large" @click="onDelete">
            <el-icon><Delete /></el-icon>{{ $t("message.common.delete") }}</el-button
          >
        </div>
      </div>

      <div class="mfld-form-card">
        <el-form ref="formRef" :model="formData" :rules="rules" label-position="top" size="large">
          <div class="mfld-form-grid">
            <el-form-item :label="$t('message.pms.modulesFieldEdit.labelModel')">
              <el-input :value="modulesInfo?.name" disabled />
            </el-form-item>
            <el-form-item prop="label">
              <template #label
                ><span class="mfld-label"
                  >{{ $t("message.pms.modulesFieldEdit.labelField") }}
                  <span class="mfld-req">*</span></span
                ></template
              >
              <el-input
                v-model="formData.label"
                :placeholder="$t('message.pms.modulesFieldEdit.placeholderField')"
              />
            </el-form-item>
            <el-form-item prop="name">
              <template #label
                ><span class="mfld-label"
                  >{{ $t("message.pms.modulesFieldEdit.labelName") }}
                  <span class="mfld-req">*</span></span
                ></template
              >
              <el-input
                v-model="formData.name"
                :placeholder="$t('message.pms.modulesFieldEdit.placeholderName')"
              />
            </el-form-item>
            <el-form-item prop="type">
              <template #label
                ><span class="mfld-label">{{
                  $t("message.pms.modulesFieldEdit.labelType")
                }}</span></template
              >
              <el-select
                v-model="formData.type"
                :placeholder="$t('message.pms.modulesFieldEdit.placeholderType')"
                value-key="value"
                style="width: 100%"
              >
                <el-option
                  v-for="item in fieldOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item
              prop="fieldLength"
              v-if="
                [
                  'text',
                  'select',
                  'radio',
                  'checkbox',
                  'email',
                  'url',
                  'password',
                  'json',
                  'code',
                ].includes(formData.type)
              "
            >
              <template #label
                ><span class="mfld-label">{{
                  $t("message.pms.modulesFieldEdit.labelLength")
                }}</span></template
              >
              <el-input
                v-model="formData.field_length"
                :placeholder="$t('message.pms.modulesFieldEdit.placeholderLength')"
              />
            </el-form-item>
            <el-form-item
              prop="options"
              v-if="['checkbox', 'radio', 'select', 'tags'].includes(formData.type)"
            >
              <template #label>
                <span class="mfld-label"
                  >{{ $t("message.pms.modulesFieldEdit.labelOptions") }}
                  <el-tooltip
                    :content="$t('message.pms.modulesFieldEdit.tooltipOptions')"
                    effect="dark"
                    placement="right"
                    ><el-icon><QuestionFilled /></el-icon></el-tooltip
                ></span>
              </template>
              <el-input
                v-model="formData.options"
                :placeholder="$t('message.pms.modulesFieldEdit.placeholderOptions')"
                type="textarea"
                :rows="3"
              />
            </el-form-item>
            <el-form-item prop="default">
              <template #label
                ><span class="mfld-label">{{
                  $t("message.pms.modulesFieldEdit.labelDefault")
                }}</span></template
              >
              <el-input
                v-model="formData.default"
                :placeholder="$t('message.pms.modulesFieldEdit.placeholderDefault')"
              />
            </el-form-item>
            <el-form-item prop="description">
              <template #label
                ><span class="mfld-label">{{
                  $t("message.pms.modulesFieldEdit.labelDesc")
                }}</span></template
              >
              <el-input
                v-model="formData.description"
                :placeholder="$t('message.pms.modulesFieldEdit.placeholderDesc')"
              />
            </el-form-item>
            <el-form-item prop="is_translatable" class="mfld-full-row">
              <template #label
                ><span class="mfld-label">{{
                  $t("message.pms.modulesFieldEdit.translatable")
                }}</span></template
              >
              <div style="display: flex; align-items: center; gap: 8px">
                <el-switch
                  v-model="formData.is_translatable"
                  :active-value="1"
                  :inactive-value="0"
                  :active-text="$t('message.common.yes')"
                  :inactive-text="$t('message.common.no')"
                />
                <span style="color: #7dd3fc; font-size: 12px">{{
                  $t("message.pms.modulesFieldEdit.translatableHint")
                }}</span>
              </div>
            </el-form-item>
          </div>

          <div v-if="formData.id" class="mfld-meta-row">
            <span class="mfld-meta"><b>创建时间:</b> {{ fmtTs(formData.created_at) }}</span>
            <span class="mfld-meta"><b>更新时间:</b> {{ fmtTs(formData.updated_at) }}</span>
          </div>

          <div class="mfld-form-actions">
            <el-button size="large" @click="onCancel">{{ $t("message.common.cancel") }}</el-button>
            <el-button
              type="primary"
              size="large"
              :loading="submitting"
              @click="onSubmit"
              class="mfld-submit-btn"
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
import { reactive, ref, onMounted, watch, computed } from "vue";
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
  QuestionFilled,
} from "@element-plus/icons-vue";
import {
  addModulesField,
  getModulesField,
  updateModulesField,
  delModulesField,
} from "/@/api/pms/modulesField";
import { getModulesInfo } from "/@/api/pms/modulesInfo";
import { modulesInfoFieldOptions } from "/@/views/pms/modulesField/list/component/model";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const formRef = ref<FormInstance>();
const loading = ref(false);
const submitting = ref(false);
const loadError = ref("");
const modulesInfo = ref<any>(null);
const fieldOptions = reactive(modulesInfoFieldOptions);

const moduleId = computed(() => Number(route.query.moduleId || route.query.mid || 0));

interface FieldFormData {
  id: number | undefined;
  label: string;
  name: string;
  type: string;
  description: string;
  default: string;
  sort: number;
  options: string;
  field_length: string;
  is_translatable: number;
  moduleId: number | undefined;
  created_at: number;
  updated_at: number;
}

const formData = reactive<FieldFormData>({
  id: undefined,
  label: "",
  name: "",
  type: "text",
  description: "",
  default: "",
  sort: 0,
  options: "",
  field_length: "",
  is_translatable: 0,
  moduleId: undefined,
  created_at: 0,
  updated_at: 0,
});

const rules = {
  label: [
    {
      required: true,
      message: t("message.pms.modulesFieldEdit.msgLabelRequired"),
      trigger: "blur",
    },
  ],
  name: [
    { required: true, message: t("message.pms.modulesFieldEdit.msgNameRequired"), trigger: "blur" },
  ],
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
  const mid = moduleId.value;
  const id = Number(route.query.id);
  if (!mid) {
    loading.value = false;
    return;
  }
  loading.value = true;
  loadError.value = "";
  try {
    const infoRes = await getModulesInfo(mid);
    modulesInfo.value = (infoRes as any).data;
    if (id) {
      const res = await getModulesField(id);
      const data = (res as any).data;
      if (data?.id) {
        Object.assign(formData, {
          id: data.id,
          label: data.label || "",
          name: data.name || "",
          type: data.type || "text",
          description: data.description || "",
          default: data.default || "",
          sort: data.sort ?? 0,
          options: data.options || "",
          field_length: data.field_length || "",
          is_translatable: data.is_translatable ?? 0,
          moduleId: mid,
          created_at: data.created_at || 0,
          updated_at: data.updated_at || 0,
        });
        formData.moduleId = mid;
      } else {
        loadError.value = t("message.pms.modulesFieldEdit.notFound");
      }
    } else {
      formData.moduleId = mid;
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
    const data = { ...formData, moduleId: moduleId.value };
    if (formData.id) {
      await updateModulesField(data);
      ElMessage.success(t("message.common.msgEditOk"));
    } else {
      await addModulesField(data);
      ElMessage.success(t("message.common.msgAddOk"));
    }
    onCancel();
  } catch {
    console.error(t("message.common.submitFailed"));
  } finally {
    submitting.value = false;
  }
};

const onCancel = () => {
  // 优先返回上一页（回退到列表），list 页的 watch 会自动刷新数据
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push(`/pms/modules/field/list?id=${moduleId.value}`);
  }
};

const onDelete = () => {
  ElMessageBox.confirm(
    `Delete field "${formData.label}"? This cannot be undone.`,
    t("message.common.confirmDeleteTitle"),
    {
      type: "warning",
      confirmButtonText: t("message.common.confirmDeleteTitle"),
      cancelButtonText: t("message.common.cancel"),
    },
  )
    .then(async () => {
      await delModulesField([formData.id!]);
      ElMessage.success(t("message.common.msgDeleteOk"));
      onCancel();
    })
    .catch(() => {});
};

onMounted(() => loadData());
watch(
  () => route.query.id,
  () => {
    loadData();
  },
);
</script>

<style scoped>
.mfld-form-page {
  max-width: 960px;
  margin: 0 auto;
}
.mfld-loading {
  text-align: center;
  padding: 80px 20px;
  color: var(--cc-color-text-3);
}
.mfld-spin {
  animation: mfld-spin 1s linear infinite;
}
@keyframes mfld-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
.mfld-error {
  text-align: center;
  padding: 80px 20px;
  color: var(--cc-color-text-4);
}
.mfld-error h3 {
  color: var(--cc-color-text-2);
  margin: 16px 0 8px;
  font-weight: 600;
}

.mfld-page-header {
  position: relative;
  margin: 28px 0 24px;
  padding: 32px 36px;
  background: var(--cc-color-surface);
  border-radius: 16px;
  border: 1px solid var(--cc-color-border-light);
  overflow: hidden;
}
.mfld-page-header::before {
  content: "";
  position: absolute;
  top: -50px;
  right: -50px;
  width: 180px;
  height: 180px;
  background: radial-gradient(circle, rgba(14, 165, 233, 0.08) 0%, transparent 70%);
  border-radius: 50%;
}
.mfld-header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  position: relative;
  z-index: 1;
}
.mfld-back-btn {
  font-family: var(--cc-font-sans);
  font-size: 13px;
  font-weight: 500;
  color: var(--cc-color-primary);
  padding: 0;
  margin-bottom: 10px;
  transition: color 0.2s;
}
.mfld-back-btn:hover {
  color: #0369a1;
}
.mfld-page-title {
  font-family: var(--cc-font-sans);
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--cc-color-text-1);
  margin: 0 0 4px;
}
.mfld-page-subtitle {
  font-family: var(--cc-font-sans);
  font-size: 14px;
  color: var(--cc-color-primary);
  margin: 0;
}
.mfld-model-badge {
  display: inline-block;
  padding: 2px 10px;
  background: var(--cc-color-primary-soft);
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  color: var(--cc-color-primary);
}
.mfld-id-badge {
  display: inline-block;
  padding: 2px 10px;
  background: var(--cc-color-primary-soft);
  border-radius: 6px;
  font-family: "JetBrains Mono", monospace;
  font-size: 13px;
  font-weight: 500;
  color: var(--cc-color-primary);
}

.mfld-form-card {
  background: #fff;
  border: 1px solid var(--cc-color-border-light);
  border-radius: 16px;
  padding: 36px 40px;
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.02),
    0 4px 16px rgba(14, 165, 233, 0.06);
}
.mfld-form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 32px;
  align-items: start;
}
.mfld-form-grid > * {
  min-width: 0;
}
.mfld-full-row {
  grid-column: 1 / -1;
}

.mfld-label {
  font-family: var(--cc-font-sans);
  font-size: 13px;
  font-weight: 500;
  color: var(--cc-color-text-1);
}
.mfld-req {
  color: #ef4444;
  margin-left: 2px;
}

.mfld-meta-row {
  display: flex;
  gap: 32px;
  flex-wrap: wrap;
  padding-top: 16px;
  margin-bottom: 20px;
  border-top: 1px solid #e0f2fe;
}
.mfld-meta {
  font-family: var(--cc-font-sans);
  font-size: 12px;
  color: #7dd3fc;
}
.mfld-meta b {
  color: var(--cc-color-primary);
}

.mfld-form-card :deep(.el-form-item__label) {
  margin-bottom: 6px;
}
.mfld-form-card :deep(.el-input__wrapper),
.mfld-form-card :deep(.el-textarea__inner) {
  border-radius: 10px;
  background: var(--cc-color-bg);
  box-shadow: none;
  border: 1px solid var(--cc-color-border-light);
  transition:
    border-color 0.25s,
    background 0.25s,
    box-shadow 0.25s;
}
.mfld-form-card :deep(.el-input__wrapper:hover),
.mfld-form-card :deep(.el-textarea__inner:hover) {
  background: #fff;
  border-color: #7dd3fc;
}
.mfld-form-card :deep(.el-input__wrapper.is-focus),
.mfld-form-card :deep(.el-textarea__inner:focus) {
  background: #fff;
  border-color: var(--cc-color-primary);
  box-shadow: 0 0 0 3px var(--cc-color-focus-ring);
}
.mfld-form-card :deep(.el-input__inner),
.mfld-form-card :deep(.el-textarea__inner) {
  font-family: var(--cc-font-sans);
  font-size: 14px;
  color: var(--cc-color-text-1);
}

.mfld-form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 24px;
  border-top: 1px solid #e0f2fe;
}
.mfld-form-actions .el-button {
  font-family: var(--cc-font-sans);
  font-weight: 600;
  border-radius: 10px;
  padding: 12px 28px;
}
.mfld-submit-btn {
  background: var(--cc-color-primary) !important;
  border: none !important;
  box-shadow: 0 2px 8px rgba(14, 165, 233, 0.3);
  transition: all 0.25s !important;
}
.mfld-submit-btn:hover:not(.is-loading) {
  background: var(--cc-color-primary-active) !important;
  box-shadow: 0 4px 16px rgba(14, 165, 233, 0.4);
  transform: translateY(-1px);
}

@media (min-width: 1440px) {
  .mfld-form-page {
    max-width: 1320px;
  }
  .mfld-page-header {
    padding: 40px 48px;
  }
  .mfld-form-card {
    padding: 40px 48px;
  }
  .mfld-form-grid {
    gap: 0 48px;
  }
}
@media (max-width: 768px) {
  .mfld-form-grid {
    grid-template-columns: 1fr;
  }
  .mfld-page-header {
    padding: 20px;
  }
  .mfld-header-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  .mfld-form-card {
    padding: 20px 16px;
    border-radius: 12px;
  }
  .mfld-page-title {
    font-size: 22px;
  }
  .mfld-form-actions {
    flex-direction: column-reverse;
  }
  .mfld-form-actions .el-button {
    width: 100%;
  }
}
</style>
