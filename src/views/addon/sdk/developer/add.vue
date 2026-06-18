<template>
  <div class="fa-page dev-form-page">
    <el-breadcrumb separator="→">
      <el-breadcrumb-item :to="{ path: '/' }"
        ><el-icon><HomeFilled /></el-icon>
        {{ $t("message.sdk.game.breadcrumbHome") }}</el-breadcrumb-item
      >
      <el-breadcrumb-item>{{ $t("message.sdk.game.breadcrumbSdk") }}</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/addon/sdk/developer/list' }">{{
        $t("message.sdk.developer.breadcrumbDeveloper")
      }}</el-breadcrumb-item>
      <el-breadcrumb-item>{{ $t("message.common.add") }}</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="dev-page-header">
      <el-button link class="dev-back-btn" @click="$router.push('/addon/sdk/developer/list')">
        <el-icon><ArrowLeft /></el-icon> {{ $t("message.common.back") }}
      </el-button>
      <h1 class="dev-page-title">{{ $t("message.common.add") }}</h1>
      <p class="dev-page-subtitle">{{ $t("message.sdk.developer.addSubtitle") }}</p>
    </div>

    <div class="dev-form-card">
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top" size="large">
        <!-- 基本信息 -->
        <div class="dev-form-section">
          <h3 class="dev-section-title">
            <span class="dev-section-icon"
              ><el-icon><OfficeBuilding /></el-icon
            ></span>
            {{ $t("message.sdk.developer.addSectionBasic") }}
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
            <span class="dev-section-icon"
              ><el-icon><Phone /></el-icon
            ></span>
            {{ $t("message.sdk.developer.addSectionContact") }}
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

        <!-- 操作 -->
        <div class="dev-form-actions">
          <el-button size="large" @click="$router.push('/addon/sdk/developer/list')">{{
            $t("message.common.cancel")
          }}</el-button>
          <el-button
            type="primary"
            size="large"
            :loading="submitting"
            @click="onSubmit"
            class="dev-submit-btn"
          >
            <template v-if="!submitting">
              <el-icon style="margin-right: 4px"><Check /></el-icon>
              {{ $t("message.common.submit") }}
            </template>
            <template v-else>{{ $t("message.sdk.developer.addBtnSubmitting") }}</template>
          </el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { HomeFilled, ArrowLeft, OfficeBuilding, Phone, Check } from "@element-plus/icons-vue";
import { addDeveloper } from "/@/api/addon/sdk";
import { useI18n } from "vue-i18n";

export default defineComponent({
  name: "addonSdkDeveloperAdd",
  components: { HomeFilled, ArrowLeft, OfficeBuilding, Phone, Check },
  setup() {
    const { t } = useI18n();
    const router = useRouter();
    const formRef = ref();
    const submitting = ref(false);
    const form = reactive({
      name: "",
      addr: "",
      contact_name: "",
      contact_email: "",
      contact_wx: "",
      phone_num: "",
    });
    const rules = {
      name: [
        { required: true, message: t("message.sdk.developer.msgNameRequired"), trigger: "blur" },
      ],
      contact_email: [
        { type: "email", message: t("message.sdk.developer.msgEmailInvalid"), trigger: "blur" },
      ],
    };

    const onSubmit = async () => {
      try {
        await formRef.value?.validate();
      } catch {
        return;
      }
      submitting.value = true;
      try {
        await addDeveloper({ ...form });
        ElMessage.success(t("message.common.msgAddOk"));
        router.push("/addon/sdk/developer/list");
      } finally {
        submitting.value = false;
      }
    };

    return { formRef, form, rules, submitting, onSubmit };
  },
});
</script>

<style scoped>
.dev-form-page {
  max-width: 960px;
  margin: 0 auto;
}

.dev-page-header {
  position: relative;
  margin: 28px 0 24px;
  padding: 32px 36px;
  background: var(--cc-color-surface);
  border-radius: var(--cc-radius-xl);
  border: 1px solid var(--cc-color-border-light);
  overflow: hidden;
}

.dev-page-header::before {
  content: "";
  position: absolute;
  top: -40px;
  right: -40px;
  width: 160px;
  height: 160px;
  background: radial-gradient(circle, rgba(13, 148, 136, 0.06) 0%, transparent 70%);
  border-radius: 50%;
}

.dev-page-header::after {
  content: "";
  position: absolute;
  bottom: -30px;
  left: 30%;
  width: 200px;
  height: 4px;
  background: linear-gradient(90deg, transparent, rgba(13, 148, 136, 0.15), transparent);
  border-radius: 2px;
}

.dev-back-btn {
  font-family: "DM Sans", system-ui, sans-serif;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.01em;
  color: var(--cc-color-text-3);
  padding: 0;
  margin-bottom: 12px;
  transition: color 0.2s;
}

.dev-back-btn:hover {
  color: #0d9488;
}

.dev-page-title {
  font-family: "DM Sans", system-ui, sans-serif;
  font-size: 28px;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--cc-color-text-1);
  margin: 0 0 6px;
  position: relative;
  z-index: 1;
}

.dev-page-subtitle {
  font-family: "DM Sans", system-ui, sans-serif;
  font-size: 14px;
  font-weight: 400;
  color: var(--cc-color-text-4);
  margin: 0;
  position: relative;
  z-index: 1;
}

.dev-form-card {
  background: var(--cc-color-surface);
  border: 1px solid var(--cc-color-border-light);
  border-radius: var(--cc-radius-xl);
  padding: 40px;
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.02),
    0 4px 16px rgba(0, 0, 0, 0.03);
  transition: box-shadow 0.3s;
}

.dev-form-card:hover {
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.02),
    0 8px 32px rgba(0, 0, 0, 0.05);
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

.dev-form :deep(.el-form-item__label) {
  margin-bottom: 6px;
}

.dev-form :deep(.el-input__wrapper) {
  border-radius: var(--cc-radius-md);
  background: var(--cc-color-bg);
  box-shadow: none;
  border: 1px solid var(--cc-color-border-light);
  transition:
    border-color 0.25s ease,
    background 0.25s ease,
    box-shadow 0.25s ease;
}

.dev-form :deep(.el-input__wrapper:hover) {
  background: var(--cc-color-surface);
  border-color: var(--cc-color-border);
}

.dev-form :deep(.el-input__wrapper.is-focus) {
  background: var(--cc-color-surface);
  border-color: #0d9488;
  box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.1);
}

.dev-form :deep(.el-input__inner) {
  font-family:
    "DM Sans",
    system-ui,
    -apple-system,
    sans-serif;
  font-size: 14px;
  color: var(--cc-color-text-1);
}

.dev-form :deep(.el-input__inner::placeholder) {
  color: var(--cc-color-text-4);
  font-weight: 400;
}

.dev-form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 28px;
  border-top: 1px solid #f1f5f9;
}

.dev-form-actions .el-button {
  font-family: "DM Sans", system-ui, sans-serif;
  font-weight: 500;
  letter-spacing: 0.01em;
  border-radius: var(--cc-radius-md);
  padding: 12px 28px;
  transition: all 0.2s ease;
}

.dev-submit-btn {
  background: linear-gradient(135deg, #0d9488, #0f766e) !important;
  border: none !important;
  box-shadow: 0 2px 8px rgba(13, 148, 136, 0.25);
  transition: all 0.25s ease !important;
}

.dev-submit-btn:hover:not(.is-loading) {
  background: linear-gradient(135deg, #0f766e, #115e59) !important;
  box-shadow: 0 4px 16px rgba(13, 148, 136, 0.35);
  transform: translateY(-1px);
}

.dev-submit-btn:active:not(.is-loading) {
  transform: translateY(0);
}

@media (max-width: 768px) {
  .dev-page-header {
    padding: 24px 20px;
  }
  .dev-form-card {
    padding: 24px 16px;
    border-radius: var(--cc-radius-lg);
  }
  .dev-page-title {
    font-size: 22px;
  }
  .dev-form-actions {
    flex-direction: column-reverse;
  }
  .dev-form-actions .el-button {
    width: 100%;
  }
}
@media (min-width: 1440px) {
  .dev-form-page {
    max-width: 1320px;
  }
  .dev-page-header {
    padding: 40px 48px;
  }
  .dev-form-card {
    padding: 40px 48px;
  }
}
</style>
