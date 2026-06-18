<template>
  <div class="fa-page ver-form-page">
    <el-breadcrumb separator="→">
      <el-breadcrumb-item
        ><el-icon><HomeFilled /></el-icon>
        {{ $t("message.sdk.game.breadcrumbHome") }}</el-breadcrumb-item
      >
      <el-breadcrumb-item>{{ $t("message.sdk.game.breadcrumbSdk") }}</el-breadcrumb-item>
      <el-breadcrumb-item>{{ $t("message.sdk.version.breadcrumbVersion") }}</el-breadcrumb-item>
      <el-breadcrumb-item>{{ $t("message.common.edit") }}</el-breadcrumb-item>
    </el-breadcrumb>

    <div v-if="loading" class="ver-loading">
      <el-icon :size="28" class="ver-spin"><Loading /></el-icon>
      <p>{{ $t("message.sdk.version.editLoading") }}</p>
    </div>
    <template v-else-if="loadError">
      <div class="ver-error">
        <el-icon :size="40"><WarningFilled /></el-icon>
        <h3>{{ $t("message.sdk.version.editErrorTitle") }}</h3>
        <p>{{ loadError }}</p>
        <el-button type="primary" @click="goBack">{{ $t("message.common.back") }}</el-button>
      </div>
    </template>
    <template v-else>
      <div class="ver-page-header">
        <el-button link class="ver-back-btn" @click="goBack"
          ><el-icon><ArrowLeft /></el-icon> {{ $t("message.common.back") }}</el-button
        >
        <div class="ver-header-row">
          <div>
            <h1 class="ver-page-title">{{ form.version_name || $t("message.common.edit") }}</h1>
            <p class="ver-page-subtitle">
              {{ $t("message.sdk.version.codeLabel") }}:
              <span class="ver-id-badge">{{ form.version_code }}</span>
              <el-tag
                :type="form.enabled === 1 ? 'success' : 'info'"
                size="small"
                effect="light"
                style="margin-left: 8px"
              >
                {{
                  form.enabled === 1
                    ? $t("message.sdk.version.activeTag")
                    : $t("message.sdk.version.inactiveTag")
                }}
              </el-tag>
            </p>
          </div>
          <el-button type="danger" plain size="large" @click="onDelete"
            ><el-icon><Delete /></el-icon> {{ $t("message.common.delete") }}</el-button
          >
        </div>
      </div>

      <div class="ver-form-card">
        <el-form ref="formRef" :model="form" :rules="rules" label-position="top" size="large">
          <div class="ver-section">
            <h3 class="ver-section-title">
              <span class="ver-section-icon"
                ><el-icon><Box /></el-icon></span
              >{{ $t("message.sdk.version.editSectionInfo") }}
            </h3>
            <el-row :gutter="20">
              <el-col :xs="24" :md="12">
                <el-form-item prop="version_code">
                  <template #label
                    ><span class="ver-label"
                      >{{ $t("message.sdk.version.editLabelVersionCode")
                      }}<span class="ver-req">*</span></span
                    ></template
                  >
                  <el-input-number
                    v-model="form.version_code"
                    :min="1"
                    :step="1"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :md="12">
                <el-form-item prop="version_name">
                  <template #label
                    ><span class="ver-label">{{
                      $t("message.sdk.version.editLabelVersionName")
                    }}</span></template
                  >
                  <el-input v-model="form.version_name" placeholder="v1.0.0" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item prop="version_desc">
              <template #label
                ><span class="ver-label">{{
                  $t("message.sdk.version.editLabelVersionDesc")
                }}</span></template
              >
              <el-input
                v-model="form.version_desc"
                type="textarea"
                :rows="3"
                :placeholder="$t('message.sdk.version.editPlaceholderDesc')"
              />
            </el-form-item>
            <el-form-item prop="url">
              <template #label
                ><span class="ver-label">{{
                  $t("message.sdk.version.editLabelUrl")
                }}</span></template
              >
              <el-input v-model="form.url" />
            </el-form-item>
            <el-row :gutter="20">
              <el-col :xs="24" :md="12">
                <el-form-item prop="force_update">
                  <template #label
                    ><span class="ver-label">{{
                      $t("message.sdk.version.editLabelForceUpdate")
                    }}</span></template
                  >
                  <el-switch
                    v-model="form.force_update"
                    :active-value="1"
                    :inactive-value="0"
                    :active-text="$t('message.common.yes')"
                    :inactive-text="$t('message.common.no')"
                  />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :md="12">
                <el-form-item prop="enabled">
                  <template #label
                    ><span class="ver-label">{{
                      $t("message.sdk.version.editLabelEnabled")
                    }}</span></template
                  >
                  <el-switch
                    v-model="form.enabled"
                    :active-value="1"
                    :inactive-value="0"
                    :active-text="$t('message.common.enabled')"
                    :inactive-text="$t('message.common.disabled')"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </div>
          <div class="ver-meta-row">
            <span class="ver-meta"
              ><b>{{ $t("message.sdk.version.metaCreated") }}:</b> {{ fmt(form.created_at) }}</span
            >
            <span class="ver-meta"
              ><b>{{ $t("message.sdk.version.metaUpdated") }}:</b> {{ fmt(form.updated_at) }}</span
            >
          </div>
          <div class="ver-form-actions">
            <el-button size="large" @click="goBack">{{ $t("message.common.cancel") }}</el-button>
            <el-button
              type="primary"
              size="large"
              :loading="submitting"
              @click="onSubmit"
              class="ver-submit-btn"
            >
              <template v-if="!submitting"
                ><el-icon style="margin-right: 4px"><Check /></el-icon
                >{{ $t("message.sdk.version.saveBtnText") }}</template
              >
              <template v-else>{{ $t("message.common.saving") }}</template>
            </el-button>
          </div>
        </el-form>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, computed, onMounted, onActivated, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  HomeFilled,
  ArrowLeft,
  Box,
  Check,
  Delete,
  Loading,
  WarningFilled,
} from "@element-plus/icons-vue";
import { getVersionDetail, editVersion, deleteVersion } from "/@/api/addon/sdk";
import { useI18n } from "vue-i18n";

export default defineComponent({
  name: "addonSdkVersionEdit",
  components: { HomeFilled, ArrowLeft, Box, Check, Delete, Loading, WarningFilled },
  setup() {
    const { t } = useI18n();
    const router = useRouter();
    const route = useRoute();
    const formRef = ref();
    const loading = ref(true);
    const submitting = ref(false);
    const loadError = ref("");
    const appId = computed(() => Number(route.query.app_id) || 0);
    const gameName = computed(() => (route.query.name as string) || "");
    const form = reactive<any>({
      id: 0,
      app_id: 0,
      version_code: 0,
      version_name: "",
      version_desc: "",
      url: "",
      force_update: 0,
      enabled: 1,
      created_at: 0,
      updated_at: 0,
    });
    const rules = {
      version_code: [
        {
          required: true,
          message: t("message.sdk.version.msgVersionCodeRequired"),
          trigger: "blur",
        },
      ],
    };
    const fmt = (ts: number) =>
      ts > 0
        ? new Date(ts * 1000).toLocaleString("zh-CN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "—";
    const goBack = () =>
      router.push(`/addon/sdk/version/list?app_id=${appId.value}&name=${gameName.value}`);

    const loadData = async () => {
      const id = Number(route.query.id);
      if (!id) {
        loadError.value = t("message.sdk.version.editMissingId");
        loading.value = false;
        return;
      }
      try {
        const res: any = await getVersionDetail({ id });
        const d = res.data || res;
        const item = d.version || d;
        if (!item || !item.id) {
          loadError.value = t("message.sdk.version.editErrorNotFound");
          return;
        }
        Object.assign(form, item);
      } catch {
        loadError.value = t("message.sdk.version.editErrorNetwork");
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
        await editVersion({
          id: form.id,
          app_id: form.app_id,
          version_code: form.version_code,
          version_name: form.version_name,
          version_desc: form.version_desc,
          url: form.url,
          force_update: form.force_update,
          enabled: form.enabled,
        });
        ElMessage.success(t("message.sdk.version.saveSuccess"));
        goBack();
      } finally {
        submitting.value = false;
      }
    };
    const onDelete = () => {
      ElMessageBox.confirm(
        t("message.sdk.version.deleteConfirm", { code: form.version_code }),
        t("message.sdk.version.deleteTitle"),
        { type: "warning" },
      )
        .then(async () => {
          await deleteVersion({ ids: [form.id] });
          ElMessage.success(t("message.sdk.version.deleted"));
          goBack();
        })
        .catch(() => {});
    };
    onMounted(() => loadData());
    onActivated(() => loadData());
    watch(
      () => route.query.id,
      () => {
        if (route.query.id) loadData();
      },
    );
    return {
      formRef,
      form,
      rules,
      loading,
      submitting,
      loadError,
      appId,
      gameName,
      fmt,
      goBack,
      onSubmit,
      onDelete,
    };
  },
});
</script>

<style scoped>
.ver-form-page {
  max-width: 960px;
  margin: 0 auto;
}
.ver-spin {
  animation: ver-spin 1s linear infinite;
  color: #f59e0b;
}
@keyframes ver-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
.ver-loading,
.ver-error {
  text-align: center;
  padding: 80px 20px;
  color: var(--cc-color-text-4);
}
.ver-error h3 {
  color: #4b5563;
  margin: 16px 0 8px;
}

.ver-page-header {
  margin: 28px 0 24px;
  padding: 32px 36px;
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
  border-radius: var(--cc-radius-xl);
  border: 1px solid #fcd34d;
  overflow: hidden;
  position: relative;
}
.ver-page-header::before {
  content: "";
  position: absolute;
  top: -40px;
  right: -40px;
  width: 150px;
  height: 150px;
  background: radial-gradient(circle, rgba(245, 158, 11, 0.1) 0%, transparent 70%);
  border-radius: 50%;
}
.ver-header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  position: relative;
  z-index: 1;
}
.ver-back-btn {
  font-family: "Syne", system-ui, sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: var(--cc-color-text-3);
  padding: 0;
  margin-bottom: 10px;
  transition: color 0.2s;
}
.ver-back-btn:hover {
  color: #d97706;
}
.ver-page-title {
  font-family: "Syne", system-ui, sans-serif;
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: #78350f;
  margin: 0 0 4px;
  position: relative;
  z-index: 1;
}
.ver-page-subtitle {
  font-family: "Syne", system-ui, sans-serif;
  font-size: 14px;
  color: #d97706;
  margin: 0;
}
.ver-id-badge {
  display: inline-block;
  padding: 2px 10px;
  background: rgba(245, 158, 11, 0.1);
  border-radius: 6px;
  font-family: "JetBrains Mono", monospace;
  font-size: 14px;
  font-weight: 600;
  color: #d97706;
}

.ver-form-card {
  background: var(--cc-color-surface);
  border: 1px solid #fde68a;
  border-radius: var(--cc-radius-xl);
  padding: 36px 40px;
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.02),
    0 4px 16px rgba(245, 158, 11, 0.04);
}
.ver-section {
  margin-bottom: 28px;
}
.ver-section-title {
  font-family: "Syne", system-ui, sans-serif;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #d97706;
  margin: 0 0 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #fef3c7;
  display: flex;
  align-items: center;
  gap: 10px;
}
.ver-section-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: rgba(245, 158, 11, 0.08);
  border-radius: var(--cc-radius-md);
  font-size: 14px;
  color: #d97706;
}
.ver-label {
  font-family: "Syne", system-ui, sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: var(--cc-color-text-2);
}
.ver-req {
  color: var(--cc-color-danger);
  margin-left: 2px;
}

.ver-meta-row {
  display: flex;
  gap: 24px;
  padding: 12px 0 0;
  margin-bottom: 20px;
  border-top: 1px solid #fef3c7;
}
.ver-meta {
  font-family: "Syne", system-ui, sans-serif;
  font-size: 12px;
  color: var(--cc-color-text-4);
}
.ver-meta b {
  color: var(--cc-color-text-3);
}

.ver-form-card :deep(.el-form-item__label) {
  margin-bottom: 6px;
}
.ver-form-card :deep(.el-input__wrapper),
.ver-form-card :deep(.el-input-number__wrapper),
.ver-form-card :deep(.el-textarea__inner) {
  border-radius: var(--cc-radius-md);
  background: #fefce8;
  box-shadow: none;
  border: 1px solid #fde68a;
  transition:
    border-color 0.25s,
    background 0.25s,
    box-shadow 0.25s;
}
.ver-form-card :deep(.el-input__wrapper:hover),
.ver-form-card :deep(.el-input-number__wrapper:hover),
.ver-form-card :deep(.el-textarea__inner:hover) {
  background: var(--cc-color-surface);
  border-color: #fcd34d;
}
.ver-form-card :deep(.el-input__wrapper.is-focus),
.ver-form-card :deep(.el-input-number__wrapper.is-focus),
.ver-form-card :deep(.el-textarea__inner:focus) {
  background: var(--cc-color-surface);
  border-color: #f59e0b;
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
}
.ver-form-card :deep(.el-input__inner),
.ver-form-card :deep(.el-input-number__inner),
.ver-form-card :deep(.el-textarea__inner) {
  font-family: "Syne", system-ui, sans-serif;
  font-size: 14px;
  color: var(--cc-color-text-1);
}
.ver-form-card :deep(.el-input__inner::placeholder) {
  color: var(--cc-color-text-4);
}

.ver-form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 24px;
  border-top: 1px solid #fef3c7;
}
.ver-form-actions .el-button {
  font-family: "Syne", system-ui, sans-serif;
  font-weight: 600;
  letter-spacing: 0.005em;
  border-radius: var(--cc-radius-md);
  padding: 12px 28px;
}
.ver-submit-btn {
  background: linear-gradient(135deg, #f59e0b, #d97706) !important;
  border: none !important;
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3);
  transition: all 0.25s !important;
}
.ver-submit-btn:hover:not(.is-loading) {
  background: linear-gradient(135deg, #d97706, #b45309) !important;
  box-shadow: 0 4px 16px rgba(245, 158, 11, 0.4);
  transform: translateY(-1px);
}

@media (min-width: 1440px) {
  .ver-form-page {
    max-width: 1320px;
  }
  .ver-page-header {
    padding: 40px 48px;
  }
  .ver-form-card {
    padding: 40px 48px;
  }
}
@media (max-width: 768px) {
  .ver-page-header {
    padding: 20px;
  }
  .ver-header-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  .ver-form-card {
    padding: 20px 16px;
    border-radius: var(--cc-radius-lg);
  }
  .ver-page-title {
    font-size: 22px;
  }
  .ver-form-actions {
    flex-direction: column-reverse;
  }
  .ver-form-actions .el-button {
    width: 100%;
  }
}
</style>
