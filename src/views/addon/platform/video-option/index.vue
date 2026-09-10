<template>
  <div class="pf-page">
    <el-breadcrumb separator="→">
      <el-breadcrumb-item :to="{ path: '/' }"
        ><el-icon><HomeFilled /></el-icon> {{ $t("message.sdk.platform.breadcrumbHome") }}</el-breadcrumb-item
      >
      <el-breadcrumb-item>{{ $t("message.sdk.platform.breadcrumbSdk") }}</el-breadcrumb-item>
      <el-breadcrumb-item>{{ $t("message.sdk.platform.videoOptionTitle") }}</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="pf-header">
      <div>
        <h1 class="pf-title">{{ $t("message.sdk.platform.videoOptionTitle") }}</h1>
        <p class="pf-subtitle">{{ $t("message.sdk.platform.videoOptionSubtitle") }}</p>
      </div>
    </div>

    <div class="pf-filter-card" v-loading="loading">
      <el-form label-position="top" @submit.prevent>
        <el-form-item :label="$t('message.sdk.platform.voMystic')">
          <div class="vo-switch-block">
            <el-switch v-model="form.mysticLora" />
            <el-text type="info" size="small">{{ $t("message.sdk.platform.voMysticHint") }}</el-text>
          </div>
        </el-form-item>
        <el-form-item :label="$t('message.sdk.platform.videoOptionTitle')">
          <el-descriptions :column="2" border>
            <el-descriptions-item :label="$t('message.sdk.platform.voBaseLora')">
              <span class="pf-mono">{{ detail.lora || "-" }}</span>
            </el-descriptions-item>
            <el-descriptions-item :label="$t('message.sdk.platform.voNsfwLora')">
              <span class="pf-mono">{{ detail.nsfwLora || "-" }}</span>
            </el-descriptions-item>
            <el-descriptions-item :label="$t('message.sdk.platform.voSteps')">
              <span class="pf-mono">{{ detail.steps }}</span>
            </el-descriptions-item>
            <el-descriptions-item :label="$t('message.sdk.platform.voSecondsRange')">
              <span class="pf-mono">{{ detail.minSeconds }} ~ {{ detail.maxSeconds }}</span>
            </el-descriptions-item>
            <el-descriptions-item :label="$t('message.sdk.platform.voShiftVideo')">
              <span class="pf-mono">{{ detail.shiftVideo }}</span>
            </el-descriptions-item>
            <el-descriptions-item :label="$t('message.sdk.platform.voShiftAudio')">
              <span class="pf-mono">{{ detail.shiftAudio }}</span>
            </el-descriptions-item>
          </el-descriptions>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="saving" @click="onSave">
            {{ $t("message.sdk.platform.voSave") }}
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, onMounted, onActivated } from "vue";
import { HomeFilled } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useI18n } from "vue-i18n";
import { getPlatformVideoOption, setPlatformVideoOption, AdminVideoOption } from "/@/api/addon/platform";

export default defineComponent({
  name: "addonPlatformVideoOption",
  components: { HomeFilled },
  setup() {
    const { t } = useI18n();
    const loading = ref(false);
    const saving = ref(false);
    // 开关的本地值，只在加载成功或保存成功后以后端返回为准
    const form = reactive<{ mysticLora: boolean }>({ mysticLora: false });
    const detail = ref<AdminVideoOption>({
      mysticLora: false,
      lora: "",
      nsfwLora: "",
      steps: 0,
      shiftVideo: 0,
      shiftAudio: 0,
      minSeconds: 0,
      maxSeconds: 0,
    });

    const applyOption = (d: any) => {
      if (!d || typeof d !== "object") return;
      detail.value = { ...detail.value, ...d };
      form.mysticLora = !!d.mysticLora;
    };

    const loadData = async () => {
      loading.value = true;
      try {
        const res: any = await getPlatformVideoOption();
        applyOption(res.data || res);
      } finally {
        loading.value = false;
      }
    };

    const onSave = () => {
      ElMessageBox.confirm(t("message.sdk.platform.voConfirm"), t("message.sdk.platform.voSave"), {
        type: "warning",
      })
        .then(async () => {
          saving.value = true;
          try {
            const res: any = await setPlatformVideoOption({ mysticLora: form.mysticLora });
            applyOption(res.data || res);
            ElMessage.success(t("message.sdk.platform.voSaved"));
            await loadData();
          } finally {
            saving.value = false;
          }
        })
        .catch(() => {});
    };

    onMounted(() => loadData());
    onActivated(() => loadData());

    return { loading, saving, form, detail, loadData, onSave };
  },
});
</script>

<style scoped>
.pf-page {
  max-width: 1400px;
  margin: 0 auto;
}
.pf-mono {
  font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-weight: 600;
  color: var(--cc-color-text-2);
}
.pf-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: var(--cc-space-4);
  margin: var(--cc-space-5) 0;
  padding: var(--cc-space-6) var(--cc-space-7);
  background:
    radial-gradient(circle at 8% 0%, var(--cc-color-primary-softer), transparent 32%),
    var(--cc-color-surface);
  border: 1px solid var(--cc-color-border-light);
  border-radius: var(--cc-radius-xl);
  box-shadow: var(--cc-shadow-sm);
}
.pf-title {
  font-family: var(--cc-font-sans);
  font-size: var(--cc-font-24);
  font-weight: 650;
  color: var(--cc-color-text-1);
  margin: 0 0 var(--cc-space-1);
  letter-spacing: -0.02em;
}
.pf-subtitle {
  font-family: var(--cc-font-sans);
  font-size: var(--cc-font-13);
  color: var(--cc-color-text-3);
  margin: 0;
}
.pf-filter-card,
.pf-table-card {
  background: var(--cc-color-surface);
  border: 1px solid var(--cc-color-border-light);
  border-radius: var(--cc-radius-xl);
  padding: var(--cc-space-5) var(--cc-space-6) var(--cc-space-3);
  box-shadow: var(--cc-shadow-sm);
}
.pf-filter-card {
  margin-bottom: var(--cc-space-4);
}
.pf-table {
  font-size: var(--cc-font-14);
}
.pf-table :deep(th.el-table__cell) {
  font-size: var(--cc-font-12);
  font-weight: 650;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--cc-color-text-3);
  background: var(--cc-color-surface-hover);
  border-bottom: 1px solid var(--cc-color-border-light);
}
.pf-table :deep(.el-table__row:hover > td.el-table__cell) {
  background: var(--cc-color-primary-softer);
}
.pf-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: var(--cc-space-3);
  padding-top: var(--cc-space-3);
}
.vo-switch-block {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--cc-space-1);
}
@media (min-width: 1401px) {
  .pf-page {
    max-width: none !important;
    padding: 0 var(--cc-space-8);
  }
}
@media (max-width: 768px) {
  .pf-header {
    padding: var(--cc-space-5);
  }
  .pf-filter-card,
  .pf-table-card {
    padding: var(--cc-space-3) var(--cc-space-2);
    border-radius: var(--cc-radius-lg);
    overflow-x: auto;
  }
}
</style>
