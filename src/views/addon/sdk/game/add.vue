<template>
  <div class="fa-page game-form-page">
    <el-breadcrumb separator="→">
      <el-breadcrumb-item :to="{ path: '/' }"
        ><el-icon><HomeFilled /></el-icon> {{ $t("message.router.home") }}</el-breadcrumb-item
      >
      <el-breadcrumb-item>{{ $t("message.sdk.game.breadcrumbSdk") }}</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/addon/sdk/game/list' }">{{
        $t("message.sdk.game.breadcrumbGame")
      }}</el-breadcrumb-item>
      <el-breadcrumb-item>{{ $t("message.sdk.game.addTitle") }}</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="gm-page-header">
      <el-button link class="gm-back-btn" @click="$router.push('/addon/sdk/game/list')">
        <el-icon><ArrowLeft /></el-icon> {{ $t("message.common.backToList") }}
      </el-button>
      <h1 class="gm-page-title">{{ $t("message.sdk.game.addTitle") }}</h1>
      <p class="gm-page-subtitle">{{ $t("message.sdk.game.addSubtitle") }}</p>
    </div>

    <div class="gm-form-card">
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top" size="large">
        <div class="gm-section">
          <h3 class="gm-section-title">
            <span class="gm-section-badge"
              ><el-icon><Grid /></el-icon
            ></span>
            {{ $t("message.sdk.game.addSectionBasic") }}
          </h3>
          <el-row :gutter="20">
            <el-col :xs="24" :md="12">
              <el-form-item prop="name">
                <template #label
                  ><span class="gm-label"
                    >{{ $t("message.sdk.game.addLabelName") }} <span class="gm-req">*</span></span
                  ></template
                >
                <el-input
                  v-model="form.name"
                  :placeholder="$t('message.sdk.game.addPlaceholderName')"
                  maxlength="64"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :md="12">
              <el-form-item prop="package_name">
                <template #label
                  ><span class="gm-label">{{
                    $t("message.sdk.game.addLabelPackage")
                  }}</span></template
                >
                <el-input
                  v-model="form.package_name"
                  :placeholder="$t('message.sdk.game.addPlaceholderPackage')"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :xs="24" :md="12">
              <el-form-item prop="category">
                <template #label
                  ><span class="gm-label">{{
                    $t("message.sdk.game.addLabelCategory")
                  }}</span></template
                >
                <el-input
                  v-model="form.category"
                  :placeholder="$t('message.sdk.game.addPlaceholderCategory')"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :md="6">
              <el-form-item prop="platform_type">
                <template #label
                  ><span class="gm-label">{{
                    $t("message.sdk.game.addLabelPlatform")
                  }}</span></template
                >
                <el-select v-model="form.platform_type" style="width: 100%">
                  <el-option :label="$t('message.sdk.game.platformGeneral')" :value="0" />
                  <el-option :label="$t('message.sdk.game.platformAndroid')" :value="1" />
                  <el-option :label="$t('message.sdk.game.platformIos')" :value="2" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :md="6">
              <el-form-item prop="online_type">
                <template #label
                  ><span class="gm-label">{{
                    $t("message.sdk.game.addLabelOnline")
                  }}</span></template
                >
                <el-select v-model="form.online_type" style="width: 100%">
                  <el-option :label="$t('message.sdk.game.addOnlineFormal')" :value="0" />
                  <el-option :label="$t('message.sdk.game.addOnlineTest')" :value="1" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :xs="24" :md="12">
              <el-form-item prop="cp_id">
                <template #label
                  ><span class="gm-label">{{
                    $t("message.sdk.game.addLabelDeveloper")
                  }}</span></template
                >
                <el-select
                  v-model="form.cp_id"
                  :placeholder="$t('message.sdk.game.addPlaceholderDeveloper')"
                  clearable
                  filterable
                  style="width: 100%"
                >
                  <el-option
                    v-for="dev in developerList"
                    :key="dev.id"
                    :label="dev.name"
                    :value="dev.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :md="12">
              <el-form-item prop="status">
                <template #label
                  ><span class="gm-label">{{
                    $t("message.sdk.game.addLabelStatus")
                  }}</span></template
                >
                <div class="gm-switch-wrap">
                  <el-switch
                    v-model="form.status"
                    :active-value="1"
                    :inactive-value="0"
                    :active-text="$t('message.common.enabled')"
                    :inactive-text="$t('message.common.disabled')"
                  />
                </div>
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <div class="gm-section">
          <h3 class="gm-section-title">
            <span class="gm-section-badge"
              ><el-icon><User /></el-icon
            ></span>
            {{ $t("message.sdk.game.addSectionLogin") }}
          </h3>
          <div class="gm-toggle-group">
            <div class="gm-toggle-item">
              <span class="gm-toggle-label">{{ $t("message.sdk.game.addLabelLoginFunc") }}</span>
              <el-switch v-model="form.login_state" :active-value="1" :inactive-value="0" />
            </div>
            <div class="gm-toggle-item">
              <span class="gm-toggle-label">{{ $t("message.sdk.game.addLabelEmailLogin") }}</span>
              <el-switch v-model="form.email_login_state" :active-value="1" :inactive-value="0" />
            </div>
            <div class="gm-toggle-item">
              <span class="gm-toggle-label">{{ $t("message.sdk.game.addLabelSocialLogin") }}</span>
              <el-switch v-model="form.social_login_state" :active-value="1" :inactive-value="0" />
            </div>
          </div>
          <el-form-item v-if="form.social_login_state === 1" prop="social_login_types">
            <template #label
              ><span class="gm-label">{{
                $t("message.sdk.game.addLabelSocialPlatform")
              }}</span></template
            >
            <el-input
              v-model="form.social_login_types"
              :placeholder="$t('message.sdk.game.addPlaceholderSocialTypes')"
            />
          </el-form-item>
        </div>

        <div class="gm-section">
          <h3 class="gm-section-title">
            <span class="gm-section-badge"
              ><el-icon><CreditCard /></el-icon
            ></span>
            {{ $t("message.sdk.game.addSectionPay") }}
          </h3>
          <div class="gm-toggle-group">
            <div class="gm-toggle-item">
              <span class="gm-toggle-label">{{ $t("message.sdk.game.addLabelPayFunc") }}</span>
              <el-switch v-model="form.pay_state" :active-value="1" :inactive-value="0" />
            </div>
            <div class="gm-toggle-item">
              <span class="gm-toggle-label">{{ $t("message.sdk.game.addLabelProtocol") }}</span>
              <el-switch v-model="form.protocol_state" :active-value="1" :inactive-value="0" />
            </div>
          </div>
          <el-form-item prop="callback_url">
            <template #label
              ><span class="gm-label">{{
                $t("message.sdk.game.addLabelCallbackUrl")
              }}</span></template
            >
            <el-input
              v-model="form.callback_url"
              :placeholder="$t('message.sdk.game.addPlaceholderCallback')"
            />
          </el-form-item>
          <el-row :gutter="20">
            <el-col :xs="24" :md="12">
              <el-form-item prop="privacy_url">
                <template #label
                  ><span class="gm-label">{{
                    $t("message.sdk.game.addLabelPrivacyUrl")
                  }}</span></template
                >
                <el-input
                  v-model="form.privacy_url"
                  :placeholder="$t('message.sdk.game.addPlaceholderPrivacy')"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :md="12">
              <el-form-item prop="agreement_url">
                <template #label
                  ><span class="gm-label">{{
                    $t("message.sdk.game.addLabelAgreementUrl")
                  }}</span></template
                >
                <el-input
                  v-model="form.agreement_url"
                  :placeholder="$t('message.sdk.game.addPlaceholderAgreement')"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item prop="icon_path">
            <template #label
              ><span class="gm-label">{{ $t("message.sdk.game.addLabelIconPath") }}</span></template
            >
            <el-input
              v-model="form.icon_path"
              :placeholder="$t('message.sdk.game.addPlaceholderIcon')"
            />
          </el-form-item>
        </div>

        <div class="gm-form-actions">
          <el-button size="large" @click="$router.push('/addon/sdk/game/list')">{{
            $t("message.common.cancel")
          }}</el-button>
          <el-button
            type="primary"
            size="large"
            :loading="submitting"
            @click="onSubmit"
            class="gm-submit-btn"
          >
            <template v-if="!submitting"
              ><el-icon style="margin-right: 4px"><Check /></el-icon>
              {{ $t("message.sdk.game.addBtnSubmit") }}</template
            >
            <template v-else>{{ $t("message.sdk.game.addBtnSubmitting") }}</template>
          </el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { ElMessage } from "element-plus";
import { HomeFilled, ArrowLeft, Grid, User, CreditCard, Check } from "@element-plus/icons-vue";
import { addGame, getDeveloperList, DeveloperItem } from "/@/api/addon/sdk";

export default defineComponent({
  name: "addonSdkGameAdd",
  components: { HomeFilled, ArrowLeft, Grid, User, CreditCard, Check },
  setup() {
    const { t } = useI18n();
    const router = useRouter();
    const formRef = ref();
    const submitting = ref(false);
    const developerList = ref<DeveloperItem[]>([]);
    const form = reactive({
      name: "",
      package_name: "",
      category: "",
      platform_type: 0,
      online_type: 0,
      cp_id: 0,
      status: 1,
      login_state: 1,
      email_login_state: 0,
      social_login_state: 0,
      social_login_types: "",
      pay_state: 0,
      protocol_state: 1,
      callback_url: "",
      privacy_url: "",
      agreement_url: "",
      icon_path: "",
    });
    const rules = {
      name: [{ required: true, message: t("message.sdk.game.msgNameRequired"), trigger: "blur" }],
    };

    const loadDevelopers = async () => {
      try {
        const res: any = await getDeveloperList({ page: 1, row: 200 });
        const d = res.data || res;
        developerList.value = d.list || [];
      } catch {
        developerList.value = [];
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
        await addGame({ ...form });
        ElMessage.success(t("message.sdk.game.addSuccess"));
        router.push("/addon/sdk/game/list");
      } finally {
        submitting.value = false;
      }
    };
    loadDevelopers();
    return { formRef, form, rules, submitting, onSubmit, developerList };
  },
});
</script>

<style scoped>
.game-form-page {
  max-width: 960px;
  margin: 0 auto;
}

.gm-page-header {
  position: relative;
  margin: 28px 0 24px;
  padding: 32px 36px;
  background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%);
  border-radius: var(--cc-radius-xl);
  border: 1px solid #c7d2fe;
  overflow: hidden;
}
.gm-page-header::before {
  content: "";
  position: absolute;
  top: -50px;
  right: -50px;
  width: 180px;
  height: 180px;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 70%);
  border-radius: 50%;
}
.gm-back-btn {
  font-family: "Outfit", system-ui, sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: var(--cc-color-text-3);
  padding: 0;
  margin-bottom: 10px;
  transition: color 0.2s;
}
.gm-back-btn:hover {
  color: #6366f1;
}
.gm-page-title {
  font-family: "Outfit", system-ui, sans-serif;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: #1e1b4b;
  margin: 0 0 4px;
  position: relative;
  z-index: 1;
}
.gm-page-subtitle {
  font-family: "Outfit", system-ui, sans-serif;
  font-size: 14px;
  color: #818cf8;
  margin: 0;
  position: relative;
  z-index: 1;
}

.gm-form-card {
  background: var(--cc-color-surface);
  border: 1px solid #e0e7ff;
  border-radius: var(--cc-radius-xl);
  padding: 36px 40px;
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.02),
    0 4px 16px rgba(99, 102, 241, 0.04);
}

.gm-section {
  margin-bottom: 32px;
}
.gm-section:last-of-type {
  margin-bottom: 24px;
}
.gm-section-title {
  font-family: "Outfit", system-ui, sans-serif;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #6366f1;
  margin: 0 0 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #eef2ff;
  display: flex;
  align-items: center;
  gap: 10px;
}
.gm-section-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  background: rgba(99, 102, 241, 0.08);
  border-radius: var(--cc-radius-md);
  font-size: 14px;
  color: #6366f1;
}

.gm-label {
  font-family: "Outfit", system-ui, sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: var(--cc-color-text-2);
  letter-spacing: 0.005em;
}
.gm-req {
  color: var(--cc-color-danger);
  margin-left: 2px;
}

.gm-toggle-group {
  display: flex;
  gap: 32px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}
.gm-toggle-item {
  display: flex;
  align-items: center;
  gap: 12px;
}
.gm-toggle-label {
  font-family: "Outfit", system-ui, sans-serif;
  font-size: 14px;
  color: #4b5563;
  font-weight: 500;
}
.gm-switch-wrap {
  padding-top: 6px;
}

.gm-form-card :deep(.el-form-item__label) {
  margin-bottom: 6px;
}
.gm-form-card :deep(.el-input__wrapper),
.gm-form-card :deep(.el-input-number__wrapper) {
  border-radius: var(--cc-radius-md);
  background: #fafafe;
  box-shadow: none;
  border: 1px solid #e0e7ff;
  transition:
    border-color 0.25s,
    background 0.25s,
    box-shadow 0.25s;
}
.gm-form-card :deep(.el-input__wrapper:hover),
.gm-form-card :deep(.el-input-number__wrapper:hover) {
  background: var(--cc-color-surface);
  border-color: #a5b4fc;
}
.gm-form-card :deep(.el-input__wrapper.is-focus),
.gm-form-card :deep(.el-input-number__wrapper.is-focus) {
  background: var(--cc-color-surface);
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}
.gm-form-card :deep(.el-input__inner),
.gm-form-card :deep(.el-input-number__inner) {
  font-family: "Outfit", system-ui, sans-serif;
  font-size: 14px;
  color: var(--cc-color-text-1);
}
.gm-form-card :deep(.el-input__inner::placeholder) {
  color: var(--cc-color-text-4);
}

.gm-form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 24px;
  border-top: 1px solid #eef2ff;
}
.gm-form-actions .el-button {
  font-family: "Outfit", system-ui, sans-serif;
  font-weight: 600;
  letter-spacing: 0.005em;
  border-radius: var(--cc-radius-md);
  padding: 12px 28px;
}
.gm-submit-btn {
  background: linear-gradient(135deg, #6366f1, #4f46e5) !important;
  border: none !important;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
  transition: all 0.25s !important;
}
.gm-submit-btn:hover:not(.is-loading) {
  background: linear-gradient(135deg, #4f46e5, #4338ca) !important;
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.4);
  transform: translateY(-1px);
}
@media (min-width: 1440px) {
  .game-form-page {
    max-width: 1320px;
  }
  .gm-page-header {
    padding: 40px 48px;
  }
  .gm-form-card {
    padding: 40px 48px;
  }
}
@media (max-width: 768px) {
  .gm-page-header {
    padding: 20px;
  }
  .gm-form-card {
    padding: 20px 16px;
    border-radius: var(--cc-radius-lg);
  }
  .gm-page-title {
    font-size: 22px;
  }
  .gm-toggle-group {
    gap: 16px;
  }
  .gm-form-actions {
    flex-direction: column-reverse;
  }
  .gm-form-actions .el-button {
    width: 100%;
  }
}
</style>
