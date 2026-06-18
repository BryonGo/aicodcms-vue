<template>
  <div class="fa-page bn-form-page">
    <el-breadcrumb separator="→">
      <el-breadcrumb-item :to="{ path: '/' }"
        ><el-icon><HomeFilled /></el-icon> {{ $t("message.router.home") }}</el-breadcrumb-item
      >
      <el-breadcrumb-item>{{ $t("message.sdk.game.breadcrumbSdk") }}</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/addon/sdk/ban/list' }">{{
        $t("message.sdk.ban.title")
      }}</el-breadcrumb-item>
      <el-breadcrumb-item>{{ $t("message.sdk.ban.addTitle") }}</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="bn-page-header">
      <el-button link class="bn-back-btn" @click="$router.push('/addon/sdk/ban/list')"
        ><el-icon><ArrowLeft /></el-icon> {{ $t("message.common.back") }}封禁列表</el-button
      >
      <h1 class="bn-page-title">{{ $t("message.sdk.ban.addTitle") }}</h1>
      <p class="bn-page-subtitle">{{ $t("message.sdk.ban.subtitle") }}</p>
    </div>

    <div class="bn-form-card">
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top" size="large">
        <div class="bn-section">
          <h3 class="bn-section-title">
            <span class="bn-section-icon"
              ><el-icon><Warning /></el-icon></span
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
                active-text="$t('message.sdk.ban.allGames')"
                inactive-text="$t('message.sdk.ban.specificGame')"
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
          <p style="margin: 4px 0 0">• 开始时间为空 = $t('message.sdk.ban.immediate')</p>
          <p style="margin: 2px 0 0">{{ $t("message.sdk.ban.ruleForever") }}</p>
          <p style="margin: 2px 0 0">• {{ $t("message.sdk.ban.allGames") }}对所有游戏生效</p>
        </el-alert>

        <div class="bn-form-actions">
          <el-button size="large" @click="$router.push('/addon/sdk/ban/list')">{{
            $t("message.common.cancel")
          }}</el-button>
          <el-button
            type="primary"
            size="large"
            :loading="submitting"
            @click="onSubmit"
            class="bn-submit-btn"
          >
            <template v-if="!submitting"
              ><el-icon style="margin-right: 4px"><Check /></el-icon
              >{{ $t("message.sdk.ban.addBtnSubmit") }}</template
            >
            <template v-else>{{ $t("message.sdk.ban.adding") }}</template>
          </el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, computed } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { useI18n } from "vue-i18n";
import { HomeFilled, ArrowLeft, Warning, Check } from "@element-plus/icons-vue";
import { addBan } from "/@/api/addon/sdk";

export default defineComponent({
  name: "addonSdkBanAdd",
  components: { HomeFilled, ArrowLeft, Warning, Check },
  setup() {
    const router = useRouter();
    const { t } = useI18n();
    const formRef = ref();
    const submitting = ref(false);
    const isGlobal = ref(false);
    const beginDate = ref("");
    const endDate = ref("");
    const form = reactive({ ban_type: 1, banned_target: "", reason: "", app_id: 0 as number });
    const rules = {
      ban_type: [
        { required: true, message: t("message.sdk.ban.banTypeRequired"), trigger: "blur" },
      ],
      banned_target: [
        { required: true, message: t("message.sdk.ban.addPlaceholderTarget"), trigger: "blur" },
      ],
    };
    const banTargetPlaceholder = computed(() => {
      if (form.ban_type === 1) return t("message.sdk.ban.colUserId");
      if (form.ban_type === 2) return t("message.sdk.ban.devicePlaceholder");
      return t("message.sdk.ban.ipPlaceholder");
    });

    const onSubmit = async () => {
      try {
        await formRef.value?.validate();
      } catch {
        return;
      }
      submitting.value = true;
      try {
        const payload: any = {
          ban_type: form.ban_type,
          banned_target: form.banned_target,
          reason: form.reason,
          app_id: isGlobal.value ? 0 : form.app_id,
        };
        if (beginDate.value) payload.begin_time = Math.floor(Number(beginDate.value) / 1000);
        if (endDate.value) payload.end_time = Math.floor(Number(endDate.value) / 1000);
        await addBan(payload);
        ElMessage.success(t("message.msg.addSuccess"));
        router.push("/addon/sdk/ban/list");
      } finally {
        submitting.value = false;
      }
    };
    return {
      formRef,
      form,
      rules,
      submitting,
      beginDate,
      endDate,
      isGlobal,
      banTargetPlaceholder,
      onSubmit,
    };
  },
});
</script>

<style scoped>
.bn-form-page {
  max-width: 960px;
  margin: 0 auto;
}

.bn-page-header {
  margin: 28px 0 24px;
  padding: 32px 36px;
  background:
    radial-gradient(circle at 0 0, var(--cc-color-danger-soft), transparent 34%),
    var(--cc-color-surface);
  border-radius: var(--cc-radius-xl);
  border: 1px solid #fda4af;
  overflow: hidden;
  position: relative;
}
.bn-page-header::before {
  content: "";
  position: absolute;
  top: -40px;
  right: -40px;
  width: 150px;
  height: 150px;
  background: radial-gradient(circle, var(--cc-color-danger-soft) 0%, transparent 70%);
  border-radius: 50%;
}
.bn-back-btn {
  font-family: "Karla", system-ui, sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: var(--cc-color-text-3);
  padding: 0;
  margin-bottom: 10px;
  transition: color 0.2s;
}
.bn-back-btn:hover {
  color: #e11d48;
}
.bn-page-title {
  font-family: "Karla", system-ui, sans-serif;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: #881337;
  margin: 0 0 4px;
  position: relative;
  z-index: 1;
}
.bn-page-subtitle {
  font-family: "Karla", system-ui, sans-serif;
  font-size: 14px;
  color: #e11d48;
  margin: 0;
  position: relative;
  z-index: 1;
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

.bn-form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 24px;
  border-top: 1px solid #ffe4e6;
}
.bn-form-actions .el-button {
  font-family: "Karla", system-ui, sans-serif;
  font-weight: 600;
  letter-spacing: 0.005em;
  border-radius: var(--cc-radius-md);
  padding: 12px 28px;
}
.bn-submit-btn {
  background: linear-gradient(135deg, #f43f5e, #e11d48) !important;
  border: none !important;
  box-shadow: none;
  transition: all 0.25s !important;
}
.bn-submit-btn:hover:not(.is-loading) {
  background: linear-gradient(135deg, #e11d48, #be123c) !important;
  box-shadow: none;
  transform: translateY(-1px);
}
@media (min-width: 1440px) {
  .bn-form-page {
    max-width: 1320px;
  }
  .bn-page-header {
    padding: 40px 48px;
  }
  .bn-form-card {
    padding: 40px 48px;
  }
}
@media (max-width: 768px) {
  .bn-page-header {
    padding: 20px;
  }
  .bn-form-card {
    padding: 20px 16px;
    border-radius: var(--cc-radius-lg);
  }
  .bn-page-title {
    font-size: 22px;
  }
  .bn-form-actions {
    flex-direction: column-reverse;
  }
  .bn-form-actions .el-button {
    width: 100%;
  }
}
</style>
