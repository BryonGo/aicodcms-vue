<template>
  <div class="bn-form-page">
    <div v-if="loading" class="bn-loading">
      <el-icon :size="28" class="bn-spin"><Loading /></el-icon>
      <p>{{ $t("message.user.loading") }}</p>
    </div>
    <template v-else-if="loadError">
      <div class="bn-error">
        <el-icon :size="40"><WarningFilled /></el-icon>
        <h3>{{ $t("message.sdk.ban.loadError") }}</h3>
        <p>{{ loadError }}</p>
        <el-button type="primary" @click="emit('cancel')">{{ $t("message.common.back") }}</el-button>
      </div>
    </template>
    <template v-else>
      <div class="bn-form-card">
        <el-form ref="formRef" :model="form" :rules="rules" label-position="top" size="large">
          <div class="bn-section">
            <h3 class="bn-section-title">
              <span class="bn-section-icon"><el-icon><Warning /></el-icon></span
              >{{ $t("message.sdk.ban.addSectionInfo") }}
            </h3>
            <el-row :gutter="20">
              <el-col :xs="24" :md="12">
                <el-form-item prop="ban_type">
                  <template #label
                    ><span class="bn-label"
                      >{{ $t("message.common.type") }} <span class="bn-req">*</span></span
                    ></template
                  >
                  <el-select v-model="form.ban_type" style="width: 100%">
                    <el-option :label="$t('message.sdk.ban.typeAccount')" :value="1" />
                    <el-option :label="$t('message.sdk.ban.typeDevice')" :value="2" />
                    <el-option :label="$t('message.sdk.ban.typeIp')" :value="3" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :md="12">
                <el-form-item prop="banned_target">
                  <template #label
                    ><span class="bn-label"
                      >{{ $t("message.sdk.ban.banTarget") }} <span class="bn-req">*</span></span
                    ></template
                  >
                  <el-input v-model="form.banned_target" :placeholder="banTargetPlaceholder" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item prop="reason">
              <template #label
                ><span class="bn-label">{{ $t("message.sdk.ban.colReason") }}</span></template
              >
              <el-input
                v-model="form.reason"
                type="textarea"
                :rows="2"
                :placeholder="$t('message.sdk.ban.reasonHint')"
              />
            </el-form-item>
            <el-row :gutter="20">
              <el-col :xs="24" :md="12">
                <el-form-item prop="begin_time">
                  <template #label
                    ><span class="bn-label">{{ $t("message.sdk.ban.colBeginTime") }}</span></template
                  >
                  <el-date-picker
                    v-model="beginDate"
                    type="datetime"
                    :placeholder="$t('message.sdk.ban.immediate')"
                    value-format="x"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :md="12">
                <el-form-item prop="end_time">
                  <template #label
                    ><span class="bn-label">{{ $t("message.sdk.ban.colEndTime") }}</span></template
                  >
                  <el-date-picker
                    v-model="endDate"
                    type="datetime"
                    :placeholder="$t('message.sdk.ban.foreverHint')"
                    value-format="x"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item prop="app_id">
              <template #label
                ><span class="bn-label">{{ $t("message.sdk.ban.banScope") }}</span></template
              >
              <div class="bn-toggle-group">
                <el-switch
                  v-model="isGlobal"
                  :active-text="$t('message.sdk.ban.allGames')"
                  :inactive-text="$t('message.sdk.ban.specificGame')"
                />
                <el-input-number
                  v-if="!isGlobal"
                  v-model="form.app_id"
                  :min="0"
                  placeholder="AppID"
                  style="width: 160px; margin-left: 12px"
                />
              </div>
            </el-form-item>
          </div>

          <el-alert
            type="warning"
            :title="$t('message.sdk.ban.ruleTitle')"
            :closable="false"
            show-icon
            style="margin-bottom: 20px"
          >
            <p style="margin: 4px 0 0">• {{ $t("message.sdk.ban.immediate") }}</p>
            <p style="margin: 2px 0 0">{{ $t("message.sdk.ban.ruleForever") }}</p>
            <p style="margin: 2px 0 0">• {{ $t("message.sdk.ban.allGames") }}</p>
          </el-alert>

          <div v-if="isEdit" class="bn-meta-row">
            <span class="bn-meta"><b>创建:</b> {{ fmt(form.created_at) }}</span>
            <span class="bn-meta"><b>更新:</b> {{ fmt(form.updated_at) }}</span>
          </div>
        </el-form>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, computed, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Warning, Loading, WarningFilled } from "@element-plus/icons-vue";
import { addBan, getBanDetail, editBan, deleteBan } from "/@/api/addon/sdk";
import { useI18n } from "vue-i18n";

export default defineComponent({
  name: "addonSdkBanForm",
  components: { Warning, Loading, WarningFilled },
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
    const isGlobal = ref(false);
    const beginDate = ref("");
    const endDate = ref("");
    const form = reactive<any>({
      id: 0,
      ban_type: 1,
      banned_target: "",
      reason: "",
      app_id: 0,
      begin_time: 0,
      end_time: 0,
      created_at: 0,
      updated_at: 0,
    });
    const rules = {
      ban_type: [{ required: true, message: t("message.sdk.ban.banTypeRequired"), trigger: "blur" }],
      banned_target: [
        { required: true, message: t("message.sdk.ban.addPlaceholderTarget"), trigger: "blur" },
      ],
    };
    const banTargetPlaceholder = computed(() => {
      if (form.ban_type === 1) return t("message.sdk.ban.colUserId");
      if (form.ban_type === 2) return t("message.sdk.ban.devicePlaceholder");
      return t("message.sdk.ban.ipPlaceholder");
    });
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
        loadError.value = t("message.sdk.ban.editMissingId");
        loading.value = false;
        return;
      }
      try {
        const res: any = await getBanDetail({ id });
        const d = res.data || res;
        const item = d.ban || d;
        if (!item || !item.id) {
          loadError.value = t("message.sdk.ban.editErrorNotFound");
          return;
        }
        Object.assign(form, item);
        isGlobal.value = form.app_id === 0;
        if (form.begin_time > 0) beginDate.value = String(form.begin_time * 1000);
        if (form.end_time > 0) endDate.value = String(form.end_time * 1000);
      } catch {
        loadError.value = t("message.common.msgNetworkError");
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
      const payload: any = {
        ban_type: form.ban_type,
        banned_target: form.banned_target,
        reason: form.reason,
        app_id: isGlobal.value ? 0 : form.app_id,
        begin_time: beginDate.value ? Math.floor(Number(beginDate.value) / 1000) : 0,
        end_time: endDate.value ? Math.floor(Number(endDate.value) / 1000) : 0,
      };
      if (isEdit.value) {
        payload.id = form.id;
        await editBan(payload);
        ElMessage.success(t("message.common.msgSaveOk"));
      } else {
        await addBan(payload);
        ElMessage.success(t("message.msg.addSuccess"));
      }
      emit("success");
    };

    const remove = async () => {
      try {
        await ElMessageBox.confirm(
          t("message.sdk.ban.confirmDeleteRecord"),
          t("message.common.confirmDeleteTitle"),
          { type: "warning" },
        );
      } catch {
        return;
      }
      await deleteBan({ ids: [form.id] });
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
      isGlobal,
      beginDate,
      endDate,
      banTargetPlaceholder,
      fmt,
      submit,
      remove,
      emit,
    };
  },
});
</script>

<style scoped>
.bn-form-page {
  max-width: 960px;
  margin: 0 auto;
}
.bn-spin {
  animation: bn-spin 1s linear infinite;
  color: #f43f5e;
}
@keyframes bn-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
.bn-loading,
.bn-error {
  text-align: center;
  padding: 80px 20px;
  color: var(--cc-color-text-4);
}
.bn-error h3 {
  color: #4b5563;
  margin: 16px 0 8px;
}
.bn-form-card {
  background: var(--cc-color-surface);
  border: 1px solid #fecdd3;
  border-radius: var(--cc-radius-xl);
  padding: 36px 40px;
  box-shadow: var(--cc-shadow-sm);
}
.bn-section {
  margin-bottom: 28px;
}
.bn-section-title {
  font-family: "Karla", system-ui, sans-serif;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #e11d48;
  margin: 0 0 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #ffe4e6;
  display: flex;
  align-items: center;
  gap: 10px;
}
.bn-section-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: var(--cc-color-danger-soft);
  border-radius: var(--cc-radius-md);
  font-size: 14px;
  color: #e11d48;
}
.bn-label {
  font-family: "Karla", system-ui, sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: var(--cc-color-text-2);
}
.bn-req {
  color: #e11d48;
  margin-left: 2px;
}
.bn-toggle-group {
  display: flex;
  align-items: center;
  padding-top: 4px;
}
.bn-meta-row {
  display: flex;
  gap: 24px;
  padding: 12px 0 0;
  margin-bottom: 20px;
  border-top: 1px solid #ffe4e6;
}
.bn-meta {
  font-family: "Karla", system-ui, sans-serif;
  font-size: 12px;
  color: var(--cc-color-text-4);
}
.bn-meta b {
  color: var(--cc-color-text-3);
}
.bn-form-card :deep(.el-form-item__label) {
  margin-bottom: 6px;
}
.bn-form-card :deep(.el-input__wrapper),
.bn-form-card :deep(.el-input-number__wrapper),
.bn-form-card :deep(.el-textarea__inner) {
  border-radius: var(--cc-radius-md);
  background: var(--cc-color-danger-soft);
  box-shadow: none;
  border: 1px solid #fecdd3;
  transition:
    border-color 0.25s,
    background 0.25s,
    box-shadow 0.25s;
}
.bn-form-card :deep(.el-input__wrapper:hover),
.bn-form-card :deep(.el-input-number__wrapper:hover),
.bn-form-card :deep(.el-textarea__inner:hover) {
  background: var(--cc-color-surface);
  border-color: #fda4af;
}
.bn-form-card :deep(.el-input__wrapper.is-focus),
.bn-form-card :deep(.el-input-number__wrapper.is-focus),
.bn-form-card :deep(.el-textarea__inner:focus) {
  background: var(--cc-color-surface);
  border-color: #f43f5e;
  box-shadow: 0 0 0 3px var(--cc-color-danger-soft);
}
.bn-form-card :deep(.el-input__inner),
.bn-form-card :deep(.el-input-number__inner),
.bn-form-card :deep(.el-textarea__inner) {
  font-family: "Karla", system-ui, sans-serif;
  font-size: 14px;
  color: var(--cc-color-text-1);
}
.bn-form-card :deep(.el-input__inner::placeholder) {
  color: var(--cc-color-text-4);
}
@media (max-width: 768px) {
  .bn-form-card {
    padding: 20px 16px;
    border-radius: var(--cc-radius-lg);
  }
}
</style>
