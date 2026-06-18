<template>
  <div class="pms-card-container">
    <div class="pms-card-page">
      <el-breadcrumb separator="→"
        ><el-breadcrumb-item :to="{ path: '/' }"
          ><el-icon><HomeFilled /></el-icon> {{ $t("message.router.home") }}</el-breadcrumb-item
        ><el-breadcrumb-item>{{ $t("message.sdk.email.breadcrumbSdk") }}</el-breadcrumb-item
        ><el-breadcrumb-item>{{ $t("message.sdk.email.title") }}</el-breadcrumb-item></el-breadcrumb
      >
      <div class="ems-header">
        <div>
          <h1 class="ems-title">{{ $t("message.sdk.email.title") }}</h1>
          <p class="ems-sub">{{ $t("message.sdk.email.subtitle") }}</p>
        </div>
      </div>
      <div class="ems-form-card">
        <el-form ref="formRef" :model="form" :rules="rules" label-position="top" size="large">
          <div class="ems-grid">
            <el-form-item :label="$t('message.sdk.email.labelTo')" prop="to"
              ><el-input v-model="form.to" placeholder="test@example.com"
            /></el-form-item>
            <el-form-item :label="$t('message.sdk.email.labelSubject')" prop="subject"
              ><el-input
                v-model="form.subject"
                :placeholder="$t('message.sdk.email.placeholderSubject')"
            /></el-form-item>
            <el-form-item :label="$t('message.sdk.email.labelBody')" prop="body" class="ems-full"
              ><el-input
                v-model="form.body"
                type="textarea"
                :rows="8"
                :placeholder="$t('message.sdk.email.placeholderBody')"
            /></el-form-item>
          </div>
          <div class="ems-actions">
            <el-button
              size="large"
              :loading="sending"
              @click="onSend"
              type="primary"
              class="ems-submit"
              ><el-icon style="margin-right: 4px"><Promotion /></el-icon
              >{{
                sending ? $t("message.sdk.email.btnSending") : $t("message.sdk.email.btnSendTest")
              }}</el-button
            >
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
import { ElMessage, FormInstance } from "element-plus";
import { HomeFilled, Promotion } from "@element-plus/icons-vue";
import { emailSend } from "/@/api/addon/sdk";
const { t } = useI18n();
const formRef = ref<FormInstance>();
const sending = ref(false);
const form = reactive({ to: "", subject: "", body: "" });
const rules = {
  to: [
    { required: true, message: t("message.sdk.email.ruleToRequired"), trigger: "blur" },
    { type: "email", message: t("message.sdk.email.ruleEmailInvalid"), trigger: "blur" },
  ],
  subject: [
    { required: true, message: t("message.sdk.email.ruleSubjectRequired"), trigger: "blur" },
  ],
};
const onSend = async () => {
  try {
    await formRef.value?.validate();
  } catch {
    return;
  }
  sending.value = true;
  try {
    await emailSend(form);
    ElMessage.success(t("message.sdk.email.msgSendOk"));
  } catch {
    ElMessage.error(t("message.sdk.email.msgSendFail"));
  } finally {
    sending.value = false;
  }
};
</script>
<style scoped>
.pms-card-page {
  max-width: 960px;
  margin: 0 auto;
}
.ems-header {
  margin: 28px 0 24px;
  padding: 32px 36px;
  background: var(--cc-color-surface);
  border-radius: 16px;
  border: 1px solid var(--cc-color-border-light);
}
.ems-title {
  font-family: var(--cc-font-sans);
  font-size: 28px;
  font-weight: 700;
  color: var(--cc-color-text-1);
  margin: 0;
}
.ems-sub {
  font-family: var(--cc-font-sans);
  font-size: 14px;
  color: var(--cc-color-primary);
  margin: 4px 0 0;
}
.ems-form-card {
  background: #fff;
  border: 1px solid var(--cc-color-border-light);
  border-radius: 16px;
  padding: 36px 40px;
}
.ems-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 32px;
}
.ems-full {
  grid-column: 1/-1;
}
.ems-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 24px;
  border-top: 1px solid #eff6ff;
}
.ems-actions .el-button {
  font-family: var(--cc-font-sans);
  font-weight: 600;
  border-radius: 10px;
  padding: 12px 28px;
}
.ems-submit {
  background: var(--cc-color-primary) !important;
  border: none !important;
}
.ems-form-card :deep(.el-input__wrapper) {
  border-radius: 10px;
  background: var(--cc-color-primary-softer);
  border: 1px solid var(--cc-color-border-light);
}
@media (min-width: 1440px) {
  .pms-card-page {
    max-width: 1320px;
  }
  .ems-header {
    padding: 40px 48px;
  }
  .ems-form-card {
    padding: 40px 48px;
  }
  .ems-grid {
    gap: 0 48px;
  }
}
@media (max-width: 768px) {
  .ems-grid {
    grid-template-columns: 1fr;
  }
  .ems-header {
    padding: 20px;
  }
  .ems-form-card {
    padding: 20px 16px;
    border-radius: 12px;
  }
  .ems-title {
    font-size: 22px;
  }
}
</style>
