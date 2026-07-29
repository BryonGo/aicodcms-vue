<template>
  <div class="dev-form-page">
    <div v-if="loading" class="dev-loading-state">
      <el-icon class="dev-loading-icon" :size="28"><Loading /></el-icon>
      <p class="dev-loading-text">{{ $t("message.sdk.developer.editLoading") }}</p>
    </div>
    <template v-else-if="loadError">
      <div class="dev-error-state">
        <el-icon :size="40"><WarningFilled /></el-icon>
        <h3>{{ $t("message.sdk.developer.editErrorTitle") }}</h3>
        <p>{{ loadError }}</p>
        <el-button type="primary" @click="emit('cancel')">{{ $t("message.common.back") }}</el-button>
      </div>
    </template>
    <template v-else>
      <div class="dev-form-card">
        <el-form ref="formRef" :model="form" :rules="rules" label-position="top" size="large">
          <!-- 基本信息 -->
          <div class="dev-form-section">
            <h3 class="dev-section-title">
              <span class="dev-section-icon"><el-icon><OfficeBuilding /></el-icon></span>
              {{ isEdit ? $t("message.sdk.developer.editSectionBasic") : $t("message.sdk.developer.addSectionBasic") }}
            </h3>
            <el-form-item prop="name" class="dev-form-item-primary">
              <template #label>
                <span class="dev-label"
                  >{{ $t("message.sdk.developer.addLabelName") }}
                  <span class="dev-required">*</span></span
                >
              </template>
              <el-input
                v-model="form.name"
                :placeholder="$t('message.sdk.developer.addPlaceholderName')"
                maxlength="64"
                show-word-limit
              />
            </el-form-item>
            <el-form-item prop="addr">
              <template #label
                ><span class="dev-label">{{
                  $t("message.sdk.developer.addLabelAddress")
                }}</span></template
              >
              <el-input
                v-model="form.addr"
                :placeholder="$t('message.sdk.developer.addPlaceholderAddress')"
                maxlength="128"
              />
            </el-form-item>
          </div>

          <!-- 联系方式 -->
          <div class="dev-form-section">
            <h3 class="dev-section-title">
              <span class="dev-section-icon"><el-icon><Phone /></el-icon></span>
              {{ isEdit ? $t("message.sdk.developer.editSectionContact") : $t("message.sdk.developer.addSectionContact") }}
            </h3>
            <el-row :gutter="24">
              <el-col :xs="24" :sm="12">
                <el-form-item prop="contact_name">
                  <template #label
                    ><span class="dev-label">{{
                      $t("message.sdk.developer.addLabelContact")
                    }}</span></template
                  >
                  <el-input
                    v-model="form.contact_name"
                    :placeholder="$t('message.sdk.developer.addPlaceholderContact')"
                  />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="12">
                <el-form-item prop="phone_num">
                  <template #label
                    ><span class="dev-label">{{
                      $t("message.sdk.developer.addLabelPhone")
                    }}</span></template
                  >
                  <el-input
                    v-model="form.phone_num"
                    :placeholder="$t('message.sdk.developer.addPlaceholderPhone')"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="24">
              <el-col :xs="24" :sm="12">
                <el-form-item prop="contact_email">
                  <template #label
                    ><span class="dev-label">{{
                      $t("message.sdk.developer.addLabelEmail")
                    }}</span></template
                  >
                  <el-input
                    v-model="form.contact_email"
                    :placeholder="$t('message.sdk.developer.addPlaceholderEmail')"
                  />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="12">
                <el-form-item prop="contact_wx">
                  <template #label
                    ><span class="dev-label">{{
                      $t("message.sdk.developer.addLabelWechat")
                    }}</span></template
                  >
                  <el-input
                    v-model="form.contact_wx"
                    :placeholder="$t('message.sdk.developer.addPlaceholderWechat')"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </div>

          <!-- 时间信息（编辑模式只读） -->
          <div v-if="isEdit" class="dev-form-section">
            <h3 class="dev-section-title">
              <span class="dev-section-icon"><el-icon><Clock /></el-icon></span>
              {{ $t("message.sdk.developer.editSectionTime") }}
            </h3>
            <div class="dev-meta-grid">
              <div class="dev-meta-item">
                <span class="dev-meta-label">{{ $t("message.common.colCreateTime") }}</span>
                <span class="dev-meta-value">{{ formatTime(form.created_at) }}</span>
              </div>
              <div class="dev-meta-item">
                <span class="dev-meta-label">{{ $t("message.common.colUpdateTime") }}</span>
                <span class="dev-meta-value">{{ formatTime(form.updated_at) }}</span>
              </div>
              <div class="dev-meta-item">
                <span class="dev-meta-label">{{ $t("message.common.colStatus") }}</span>
                <span class="dev-meta-value">
                  <el-tag
                    :type="form.deleted_at > 0 ? 'danger' : 'success'"
                    size="small"
                    effect="light"
                  >
                    {{
                      form.deleted_at > 0
                        ? $t("message.common.statusHide")
                        : $t("message.common.statusShow")
                    }}
                  </el-tag>
                </span>
              </div>
            </div>
          </div>
        </el-form>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, computed, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  OfficeBuilding,
  Phone,
  Clock,
  Loading,
  WarningFilled,
} from "@element-plus/icons-vue";
import { addDeveloper, getDeveloperDetail, editDeveloper, deleteDeveloper } from "/@/api/addon/sdk";
import { useI18n } from "vue-i18n";

export default defineComponent({
  name: "addonSdkDeveloperForm",
  components: { OfficeBuilding, Phone, Clock, Loading, WarningFilled },
  props: {
    mode: { type: String as () => "add" | "edit", default: "add" },
    id: { type: [Number, String], default: undefined },
  },
  emits: ["success", "deleted", "cancel"],
  setup(props, { emit }) {
    const { t } = useI18n();
    const formRef = ref();
    const loading = ref(false);
    const loadError = ref("");
    const isEdit = computed(() => props.mode === "edit");

    const form = reactive({
      id: 0,
      name: "",
      addr: "",
      contact_name: "",
      contact_email: "",
      contact_wx: "",
      phone_num: "",
      created_at: 0,
      updated_at: 0,
      deleted_at: 0,
    });
    const rules = {
      name: [
        { required: true, message: t("message.sdk.developer.msgNameRequired"), trigger: "blur" },
      ],
      contact_email: [
        { type: "email", message: t("message.sdk.developer.msgEmailInvalid"), trigger: "blur" },
      ],
    };

    const formatTime = (ts: number): string => {
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
      const id = Number(props.id);
      if (!id) {
        loading.value = false;
        return;
      }
      try {
        const res: any = await getDeveloperDetail({ id });
        const d = res.data || res;
        const dev = d.developer || d;
        if (!dev || !dev.id) {
          loadError.value = t("message.sdk.developer.editErrorNotFound");
          return;
        }
        Object.assign(form, dev);
      } catch {
        loadError.value = t("message.common.msgNetworkErrorRetry");
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
      const payload = {
        id: form.id,
        name: form.name,
        addr: form.addr,
        contact_name: form.contact_name,
        contact_email: form.contact_email,
        contact_wx: form.contact_wx,
        phone_num: form.phone_num,
      };
      if (isEdit.value) {
        await editDeveloper(payload);
        ElMessage.success(t("message.common.msgSaveOk"));
      } else {
        await addDeveloper(payload);
        ElMessage.success(t("message.common.msgAddOk"));
      }
      emit("success");
    };

    const remove = async () => {
      try {
        await ElMessageBox.confirm(
          t("message.sdk.developer.deleteConfirm", { name: form.name }),
          t("message.common.confirmDeleteTitle"),
          { type: "warning" },
        );
      } catch {
        return;
      }
      await deleteDeveloper({ ids: [form.id] });
      ElMessage.success(t("message.common.msgDeleteOk"));
      emit("deleted");
    };

    onMounted(async () => {
      if (isEdit.value && props.id) {
        loading.value = true;
        loadError.value = "";
        await loadData();
      }
    });

    return {
      formRef,
      form,
      rules,
      loading,
      loadError,
      isEdit,
      formatTime,
      submit,
      remove,
      emit,
    };
  },
});
</script>

<style scoped>
.dev-form-page {
  max-width: 960px;
  margin: 0 auto;
}
.dev-loading-state {
  text-align: center;
  padding: 80px 20px;
}
.dev-loading-icon {
  color: #0d9488;
  animation: dev-spin 1s linear infinite;
}
@keyframes dev-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
.dev-loading-text {
  font-family: "DM Sans", system-ui, sans-serif;
  color: var(--cc-color-text-4);
  margin-top: 12px;
  font-size: 14px;
}
.dev-error-state {
  text-align: center;
  padding: 80px 20px;
  color: var(--cc-color-text-4);
}
.dev-error-state h3 {
  font-family: "DM Sans", system-ui, sans-serif;
  color: var(--cc-color-text-2);
  margin: 16px 0 8px;
  font-weight: 600;
  font-size: 18px;
}
.dev-error-state p {
  font-size: 14px;
  margin: 0 0 20px;
}
.dev-form-card {
  background: var(--cc-color-surface);
  border: 1px solid var(--cc-color-border-light);
  border-radius: var(--cc-radius-xl);
  padding: 36px 40px;
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.02),
    0 4px 16px rgba(0, 0, 0, 0.03);
}
.dev-form-section {
  margin-bottom: 36px;
}
.dev-form-section:last-of-type {
  margin-bottom: 28px;
}
.dev-section-title {
  font-family: "DM Sans", system-ui, sans-serif;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #0d9488;
  margin: 0 0 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  align-items: center;
  gap: 8px;
}
.dev-section-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: rgba(13, 148, 136, 0.08);
  border-radius: var(--cc-radius-md);
  font-size: 14px;
  color: #0d9488;
}
.dev-label {
  font-family: "DM Sans", system-ui, sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: var(--cc-color-text-1);
  letter-spacing: 0.01em;
}
.dev-required {
  color: var(--cc-color-danger);
  margin-left: 2px;
}
.dev-form-item-primary :deep(.el-input__wrapper) {
  box-shadow: 0 0 0 1px var(--cc-color-border) inset;
  transition:
    box-shadow 0.25s ease,
    background 0.25s ease;
}
.dev-form-item-primary :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #94a3b8 inset;
}
.dev-form-item-primary :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 2px rgba(13, 148, 136, 0.25) inset;
}
.dev-form-card :deep(.el-form-item__label) {
  margin-bottom: 6px;
}
.dev-form-card :deep(.el-input__wrapper) {
  border-radius: var(--cc-radius-md);
  background: var(--cc-color-bg);
  box-shadow: none;
  border: 1px solid var(--cc-color-border-light);
  transition:
    border-color 0.25s ease,
    background 0.25s ease,
    box-shadow 0.25s ease;
}
.dev-form-card :deep(.el-input__wrapper:hover) {
  background: var(--cc-color-surface);
  border-color: var(--cc-color-border);
}
.dev-form-card :deep(.el-input__wrapper.is-focus) {
  background: var(--cc-color-surface);
  border-color: #0d9488;
  box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.1);
}
.dev-form-card :deep(.el-input__inner) {
  font-family:
    "DM Sans",
    system-ui,
    -apple-system,
    sans-serif;
  font-size: 14px;
  color: var(--cc-color-text-1);
}
.dev-form-card :deep(.el-input__inner::placeholder) {
  color: var(--cc-color-text-4);
  font-weight: 400;
}
.dev-meta-grid {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}
.dev-meta-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 140px;
}
.dev-meta-label {
  font-family: "DM Sans", system-ui, sans-serif;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--cc-color-text-4);
}
.dev-meta-value {
  font-family: "DM Sans", system-ui, sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: var(--cc-color-text-1);
}
@media (max-width: 768px) {
  .dev-form-card {
    padding: 24px 16px;
    border-radius: var(--cc-radius-lg);
  }
  .dev-meta-grid {
    flex-direction: column;
    gap: 12px;
  }
}
</style>
