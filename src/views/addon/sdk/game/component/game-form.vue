<template>
  <div class="game-form-page">
    <div v-if="loading" class="gm-loading">
      <el-icon class="gm-loading-icon" :size="28"><Loading /></el-icon>
      <p>{{ $t("message.sdk.game.editLoading") }}</p>
    </div>
    <template v-else-if="loadError">
      <div class="gm-error">
        <el-icon :size="40"><WarningFilled /></el-icon>
        <h3>{{ $t("message.sdk.game.editErrorTitle") }}</h3>
        <p>{{ loadError }}</p>
        <el-button type="primary" @click="emit('cancel')">{{
          $t("message.sdk.game.btnBackToGame")
        }}</el-button>
      </div>
    </template>
    <template v-else>
      <div class="gm-form-card">
        <el-form ref="formRef" :model="form" :rules="rules" label-position="top" size="large">
          <!-- 密钥信息（仅编辑模式） -->
          <div v-if="isEdit" class="gm-section gm-key-section">
            <h3 class="gm-section-title">
              <span class="gm-section-badge"><el-icon><Key /></el-icon></span>
              {{ $t("message.sdk.game.editSectionKey") }}
            </h3>
            <div class="gm-key-grid">
              <div class="gm-key-item">
                <span class="gm-key-label">AppID</span>
                <el-input :model-value="String(form.app_id)" disabled class="gm-key-input" />
              </div>
              <div class="gm-key-item">
                <span class="gm-key-label">
                  {{ $t("message.sdk.game.editAppKey") }}
                  <el-button link size="small" @click="copyText(form.app_key)"
                    ><el-icon><CopyDocument /></el-icon>
                    {{ $t("message.sdk.game.editBtnCopy") }}</el-button
                  >
                </span>
                <el-input :model-value="form.app_key" disabled class="gm-key-input" />
              </div>
              <div class="gm-key-item">
                <span class="gm-key-label">
                  {{ $t("message.sdk.game.editAppSecret") }}
                  <el-button link size="small" @click="copyText(form.app_secret)"
                    ><el-icon><CopyDocument /></el-icon>
                    {{ $t("message.sdk.game.editBtnCopy") }}</el-button
                  >
                </span>
                <el-input
                  :model-value="form.app_secret"
                  show-password
                  disabled
                  class="gm-key-input"
                />
              </div>
            </div>
          </div>

          <!-- 基本信息 -->
          <div class="gm-section">
            <h3 class="gm-section-title">
              <span class="gm-section-badge"><el-icon><Grid /></el-icon></span>
              {{ isEdit ? $t("message.sdk.game.editSectionBasic") : $t("message.sdk.game.addSectionBasic") }}
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

          <!-- 登录配置 -->
          <div class="gm-section">
            <h3 class="gm-section-title">
              <span class="gm-section-badge"><el-icon><User /></el-icon></span>
              {{ isEdit ? $t("message.sdk.game.editSectionLogin") : $t("message.sdk.game.addSectionLogin") }}
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

          <!-- 支付配置 -->
          <div class="gm-section">
            <h3 class="gm-section-title">
              <span class="gm-section-badge"><el-icon><CreditCard /></el-icon></span>
              {{ isEdit ? $t("message.sdk.game.editSectionPay") : $t("message.sdk.game.addSectionPay") }}
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
                ><span class="gm-label">{{
                  $t("message.sdk.game.addLabelIconPath")
                }}</span></template
              >
              <el-input
                v-model="form.icon_path"
                :placeholder="$t('message.sdk.game.addPlaceholderIcon')"
              />
            </el-form-item>
          </div>

          <!-- 时间信息（仅编辑模式） -->
          <div v-if="isEdit" class="gm-section">
            <h3 class="gm-section-title">
              <span class="gm-section-badge"><el-icon><Clock /></el-icon></span>
              {{ $t("message.sdk.game.editSectionTime") }}
            </h3>
            <div class="gm-meta-grid">
              <div class="gm-meta-item">
                <span class="gm-meta-label">{{ $t("message.sdk.game.editLabelCreated") }}</span>
                <span class="gm-meta-value">{{ fmt(form.created_at) }}</span>
              </div>
              <div class="gm-meta-item">
                <span class="gm-meta-label">{{ $t("message.sdk.game.editLabelUpdated") }}</span>
                <span class="gm-meta-value">{{ fmt(form.updated_at) }}</span>
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
  Grid,
  User,
  CreditCard,
  Key,
  CopyDocument,
  Clock,
  Loading,
  WarningFilled,
} from "@element-plus/icons-vue";
import {
  addGame,
  getGameDetail,
  editGame,
  deleteGame,
  getDeveloperList,
  DeveloperItem,
} from "/@/api/addon/sdk";
import { useI18n } from "vue-i18n";

export default defineComponent({
  name: "addonSdkGameForm",
  components: {
    Grid,
    User,
    CreditCard,
    Key,
    CopyDocument,
    Clock,
    Loading,
    WarningFilled,
  },
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
    const developerList = ref<DeveloperItem[]>([]);

    const form = reactive<any>({
      id: 0,
      app_id: 0,
      app_key: "",
      app_secret: "",
      name: "",
      cp_id: 0,
      package_name: "",
      platform_type: 0,
      online_type: 0,
      category: "",
      icon_path: "",
      status: 1,
      login_state: 1,
      email_login_state: 0,
      social_login_state: 0,
      social_login_types: "",
      pay_state: 0,
      protocol_state: 1,
      privacy_url: "",
      agreement_url: "",
      callback_url: "",
      created_at: 0,
      updated_at: 0,
      deleted_at: 0,
    });
    const rules = {
      name: [{ required: true, message: t("message.sdk.game.msgNameRequired"), trigger: "blur" }],
    };

    const fmt = (ts: number) => {
      if (!ts || ts <= 0) return "—";
      return new Date(ts * 1000).toLocaleString("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    const copyText = (text: string) => {
      navigator.clipboard
        .writeText(text)
        .then(() => ElMessage.success(t("message.sdk.game.copied")));
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

    const loadData = async () => {
      const id = Number(props.id);
      if (!id) {
        loading.value = false;
        return;
      }
      try {
        const res: any = await getGameDetail({ id });
        const d = res.data || res;
        const game = d.game || d;
        if (!game || !game.id) {
          loadError.value = t("message.sdk.game.editErrorNotFound");
          return;
        }
        Object.assign(form, game);
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
      if (isEdit.value) {
        const { app_key, app_secret, app_id: _aid, ...editData } = form;
        await editGame(editData);
        ElMessage.success(t("message.sdk.game.saveSuccess"));
      } else {
        const { app_key, app_secret, app_id: _aid, id: _id, ...addData } = form;
        await addGame(addData);
        ElMessage.success(t("message.sdk.game.addSuccess"));
      }
      emit("success");
    };

    const remove = async () => {
      try {
        await ElMessageBox.confirm(
          t("message.sdk.game.deleteConfirm", { name: form.name }),
          t("message.sdk.game.deleteConfirmTitle"),
          {
            type: "warning",
            confirmButtonText: t("message.sdk.game.deleteConfirmBtn"),
            cancelButtonText: t("message.common.cancel"),
          },
        );
      } catch {
        return;
      }
      await deleteGame({ ids: [form.id] });
      ElMessage.success(t("message.sdk.game.deleted"));
      emit("deleted");
    };

    onMounted(async () => {
      loadDevelopers();
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
      developerList,
      fmt,
      copyText,
      submit,
      remove,
      emit,
    };
  },
});
</script>

<style scoped>
.game-form-page {
  max-width: 960px;
  margin: 0 auto;
}
.gm-loading {
  text-align: center;
  padding: 80px 20px;
  color: #818cf8;
}
.gm-loading-icon {
  animation: gm-spin 1s linear infinite;
}
@keyframes gm-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
.gm-error {
  text-align: center;
  padding: 80px 20px;
  color: var(--cc-color-text-4);
}
.gm-error h3 {
  color: #4b5563;
  margin: 16px 0 8px;
  font-weight: 600;
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
.gm-key-section {
  background: #eef2ff;
  border-radius: var(--cc-radius-lg);
  padding: 20px 24px;
}
.gm-key-section .gm-section-title {
  border-bottom-color: #c7d2fe;
  margin-bottom: 16px;
}
.gm-key-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}
.gm-key-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.gm-key-label {
  font-family: "Outfit", system-ui, sans-serif;
  font-size: 12px;
  font-weight: 600;
  color: #6366f1;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.gm-key-input :deep(.el-input__wrapper) {
  background: var(--cc-color-surface);
  border-color: #c7d2fe;
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
.gm-meta-grid {
  display: flex;
  gap: 32px;
  flex-wrap: wrap;
}
.gm-meta-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 140px;
}
.gm-meta-label {
  font-family: "Outfit", system-ui, sans-serif;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--cc-color-text-4);
}
.gm-meta-value {
  font-family: "Outfit", system-ui, sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: var(--cc-color-text-2);
}
@media (max-width: 768px) {
  .gm-form-card {
    padding: 20px 16px;
    border-radius: var(--cc-radius-lg);
  }
  .gm-toggle-group {
    gap: 16px;
  }
  .gm-key-grid {
    grid-template-columns: 1fr;
  }
}
</style>
