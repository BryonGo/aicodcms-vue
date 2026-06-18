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
      <el-breadcrumb-item>$t('message.common.edit')</el-breadcrumb-item>
    </el-breadcrumb>

    <div v-if="loading" class="bn-loading">
      <el-icon :size="28" class="bn-spin"><Loading /></el-icon>
      <p>{{ $t("message.user.loading") }}</p>
    </div>
    <template v-else-if="loadError">
      <div class="bn-error">
        <el-icon :size="40"><WarningFilled /></el-icon>
        <h3>{{ $t("message.sdk.ban.loadError") }}</h3>
        <p>{{ loadError }}</p>
        <el-button type="primary" @click="$router.push('/addon/sdk/ban/list')">{{
          $t("message.common.back")
        }}</el-button>
      </div>
    </template>
    <template v-else>
      <div class="bn-page-header">
        <el-button link class="bn-back-btn" @click="$router.push('/addon/sdk/ban/list')"
          ><el-icon><ArrowLeft /></el-icon> {{ $t("message.common.back") }}封禁列表</el-button
        >
        <div class="bn-header-row">
          <div>
            <h1 class="bn-page-title">$t('message.common.edit')</h1>
            <p class="bn-page-subtitle">
              ID: <span class="bn-id-badge">{{ form.id }}</span>
              <el-tag
                v-if="isExpired"
                type="warning"
                size="small"
                effect="light"
                style="margin-left: 8px"
                >{{ $t("message.sdk.ban.statusExpired") }}</el-tag
              >
              <el-tag
                v-else-if="isPermanent"
                type="danger"
                size="small"
                effect="light"
                style="margin-left: 8px"
                >{{ $t("message.sdk.ban.foreverText") }}</el-tag
              >
              <el-tag v-else type="danger" size="small" effect="light" style="margin-left: 8px">{{
                $t("message.sdk.ban.statusActive")
              }}</el-tag>
            </p>
          </div>
          <el-button type="danger" plain size="large" @click="onDelete"
            ><el-icon><Delete /></el-icon>{{ $t("message.common.delete") }}</el-button
          >
        </div>
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
                      >{{ $t("message.sdk.ban.banType") }}<span class="bn-req">*</span></span
                    ></template
                  >
                  <el-select v-model="form.ban_type" style="width: 100%">
                    <el-option :label="$t('message.sdk.ban.colUserId')" :value="1" />
                    <el-option :label="$t('message.sdk.ban.devicePlaceholder')" :value="2" />
                    <el-option :label="$t('message.sdk.ban.ipPlaceholder')" :value="3" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :md="12">
                <el-form-item prop="banned_target">
                  <template #label
                    ><span class="bn-label"
                      >{{ $t("message.sdk.ban.banTarget") }}<span class="bn-req">*</span></span
                    ></template
                  >
                  <el-input v-model="form.banned_target" />
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
                :placeholder="$t('message.sdk.ban.addLabelReason')"
              />
            </el-form-item>
            <el-row :gutter="20">
              <el-col :xs="24" :md="12">
                <el-form-item prop="begin_time">
                  <template #label
                    ><span class="bn-label">{{
                      $t("message.sdk.ban.colBeginTime")
                    }}</span></template
                  >
                  <el-date-picker
                    v-model="beginDate"
                    type="datetime"
                    :placeholder="$t('message.sdk.ban.beginTimePlaceholder')"
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
              <span class="bn-scope-text">{{
                form.app_id === 0
                  ? $t("message.sdk.ban.globalBanLabel")
                  : `Game AppID: ${form.app_id}`
              }}</span>
              <el-input-number
                v-model="form.app_id"
                :min="0"
                :placeholder="$t('message.sdk.ban.globalAppIdHint')"
                style="width: 180px; margin-top: 8px"
              />
            </el-form-item>
          </div>

          <div class="bn-meta-row">
            <span class="bn-meta"><b>创建:</b> {{ fmt(form.created_at) }}</span>
            <span class="bn-meta"><b>更新:</b> {{ fmt(form.updated_at) }}</span>
          </div>

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
                ><el-icon style="margin-right: 4px"><Check /></el-icon>
                {{ $t("message.common.save") }}</template
              >
              <template v-else>$t('message.common.saving')</template>
            </el-button>
          </div>
        </el-form>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, computed, onMounted, onActivated, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { useI18n } from "vue-i18n";
import {
  HomeFilled,
  ArrowLeft,
  Warning,
  Check,
  Delete,
  Loading,
  WarningFilled,
} from "@element-plus/icons-vue";
import { getBanDetail, editBan, deleteBan } from "/@/api/addon/sdk";

export default defineComponent({
  name: "addonSdkBanEdit",
  components: { HomeFilled, ArrowLeft, Warning, Check, Delete, Loading, WarningFilled },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const { t } = useI18n();
    const formRef = ref();
    const loading = ref(true);
    const submitting = ref(false);
    const loadError = ref("");
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
      ban_type: [{ required: true }],
      banned_target: [
        { required: true, message: t("message.sdk.ban.banTargetRequired"), trigger: "blur" },
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

    const isPermanent = computed(() => !form.end_time || form.end_time <= 0);
    const isExpired = computed(
      () => form.end_time > 0 && form.end_time < Math.floor(Date.now() / 1000),
    );

    const loadData = async () => {
      const id = Number(route.query.id);
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
        if (form.begin_time > 0) beginDate.value = String(form.begin_time * 1000);
        if (form.end_time > 0) endDate.value = String(form.end_time * 1000);
      } catch {
        loadError.value = t("message.common.msgNetworkError");
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
        const payload: any = {
          id: form.id,
          ban_type: form.ban_type,
          banned_target: form.banned_target,
          reason: form.reason,
          app_id: form.app_id,
        };
        if (beginDate.value) payload.begin_time = Math.floor(Number(beginDate.value) / 1000);
        else payload.begin_time = 0;
        if (endDate.value) payload.end_time = Math.floor(Number(endDate.value) / 1000);
        else payload.end_time = 0;
        await editBan(payload);
        ElMessage.success(t("message.common.msgSaveOk"));
        router.push("/addon/sdk/ban/list");
      } finally {
        submitting.value = false;
      }
    };

    const onDelete = () => {
      ElMessageBox.confirm(
        t("message.sdk.ban.confirmDeleteRecord"),
        t("message.common.confirmDeleteTitle"),
        { type: "warning" },
      )
        .then(async () => {
          await deleteBan({ ids: [form.id] });
          ElMessage.success(t("message.common.msgDeleteOk"));
          router.push("/addon/sdk/ban/list");
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
      beginDate,
      endDate,
      isPermanent,
      isExpired,
      fmt,
      onSubmit,
      onDelete,
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
.bn-header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  position: relative;
  z-index: 1;
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
}
.bn-id-badge {
  display: inline-block;
  padding: 2px 10px;
  background: rgba(244, 63, 94, 0.1);
  border-radius: 6px;
  font-family: "JetBrains Mono", monospace;
  font-size: 13px;
  font-weight: 500;
  color: #e11d48;
}
.bn-scope-text {
  font-size: 13px;
  color: var(--cc-color-text-3);
  font-weight: 500;
  display: block;
  margin-bottom: 4px;
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
  .bn-header-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
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
