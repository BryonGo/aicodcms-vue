<template>
  <div class="ver-form-page">
    <div v-if="loading" class="ver-loading">
      <el-icon :size="28" class="ver-spin"><Loading /></el-icon>
      <p>{{ $t("message.sdk.version.editLoading") }}</p>
    </div>
    <template v-else-if="loadError">
      <div class="ver-error">
        <el-icon :size="40"><WarningFilled /></el-icon>
        <h3>{{ $t("message.sdk.version.editErrorTitle") }}</h3>
        <p>{{ loadError }}</p>
        <el-button type="primary" @click="emit('cancel')">{{ $t("message.common.back") }}</el-button>
      </div>
    </template>
    <template v-else>
      <div class="ver-form-card">
        <el-form ref="formRef" :model="form" :rules="rules" label-position="top" size="large">
          <div class="ver-section">
            <h3 class="ver-section-title">
              <span class="ver-section-icon"><el-icon><Box /></el-icon></span
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
          <div v-if="isEdit" class="ver-meta-row">
            <span class="ver-meta"
              ><b>{{ $t("message.sdk.version.metaCreated") }}:</b> {{ fmt(form.created_at) }}</span
            >
            <span class="ver-meta"
              ><b>{{ $t("message.sdk.version.metaUpdated") }}:</b> {{ fmt(form.updated_at) }}</span
            >
          </div>
        </el-form>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, computed, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Box, Loading, WarningFilled } from "@element-plus/icons-vue";
import {
  addVersion,
  getVersionDetail,
  editVersion,
  deleteVersion,
} from "/@/api/addon/sdk";
import { useI18n } from "vue-i18n";

export default defineComponent({
  name: "addonSdkVersionForm",
  components: { Box, Loading, WarningFilled },
  props: {
    mode: { type: String as () => "add" | "edit", default: "add" },
    id: { type: [Number, String], default: undefined },
    appId: { type: [Number, String], default: 0 },
    gameName: { type: String, default: "" },
  },
  emits: ["success", "deleted", "cancel"],
  setup(props, { emit }) {
    const { t } = useI18n();
    const formRef = ref();
    const loading = ref(false);
    const loadError = ref("");
    const isEdit = computed(() => props.mode === "edit");
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

    const loadData = async () => {
      const id = Number(props.id);
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

    const submit = async () => {
      try {
        await formRef.value?.validate();
      } catch {
        return;
      }
      if (isEdit.value) {
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
      } else {
        await addVersion({ ...form, app_id: Number(props.appId) || 0 });
        ElMessage.success(t("message.sdk.version.addSuccess"));
      }
      emit("success");
    };

    const remove = async () => {
      try {
        await ElMessageBox.confirm(
          t("message.sdk.version.deleteConfirm", { code: form.version_code }),
          t("message.sdk.version.deleteTitle"),
          { type: "warning" },
        );
      } catch {
        return;
      }
      await deleteVersion({ ids: [form.id] });
      ElMessage.success(t("message.sdk.version.deleted"));
      emit("deleted");
    };

    onMounted(async () => {
      if (isEdit.value && props.id) {
        loading.value = true;
        loadError.value = "";
        await loadData();
      } else {
        form.app_id = Number(props.appId) || 0;
      }
    });

    return { formRef, form, rules, loading, loadError, isEdit, fmt, submit, remove, emit };
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
@media (max-width: 768px) {
  .ver-form-card {
    padding: 20px 16px;
    border-radius: var(--cc-radius-lg);
  }
}
</style>
