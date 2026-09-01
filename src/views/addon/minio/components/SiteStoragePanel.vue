<template>
  <el-dialog
    :model-value="visible"
    :title="$t('message.pms.minio.siteStorage.title')"
    width="560px"
    :close-on-click-modal="false"
    destroy-on-close
    @update:model-value="onClose"
  >
    <div v-loading="loading" class="ss-panel">
      <!-- 状态总览 -->
      <div class="ss-status" :class="'is-' + statusClass">
        <div class="ss-status-dot"></div>
        <div class="ss-status-text">
          <strong>{{ statusLabel }}</strong>
          <span v-if="storage.message" class="ss-status-msg">{{ storage.message }}</span>
          <span v-else class="ss-status-msg">
            {{ $t("message.pms.minio.siteStorage.noMessage") }}
          </span>
        </div>
      </div>

      <!-- 只读信息 -->
      <div class="ss-grid">
        <div class="ss-item">
          <span class="ss-label">{{ $t("message.pms.minio.siteStorage.endpoint") }}</span>
          <code class="ss-value">{{ storage.endpoint || "-" }}</code>
        </div>
        <div class="ss-item">
          <span class="ss-label">{{ $t("message.pms.minio.siteStorage.bucket") }}</span>
          <code class="ss-value">{{ storage.bucket || "-" }}</code>
        </div>
        <div class="ss-item">
          <span class="ss-label">{{ $t("message.pms.minio.siteStorage.accessKey") }}</span>
          <code class="ss-value">{{ storage.access_key || "-" }}</code>
        </div>
        <div class="ss-item">
          <span class="ss-label">{{ $t("message.pms.minio.siteStorage.secretKey") }}</span>
          <code class="ss-value">{{ storage.has_credentials ? maskedSecret : "-" }}</code>
        </div>
        <div class="ss-item">
          <span class="ss-label">{{ $t("message.pms.minio.siteStorage.updatedAt") }}</span>
          <span class="ss-value">{{ formatTime(storage.updated_at) }}</span>
        </div>
      </div>

      <!-- 探测明细 -->
      <div v-if="testResult" class="ss-test">
        <div class="ss-test-title">
          {{ $t("message.pms.minio.siteStorage.testResult") }}
          <el-tag :type="testResult.status === 'ready' ? 'success' : 'danger'" size="small">
            {{ testResult.status === "ready" ? $t("message.pms.minio.siteStorage.testOk") : $t("message.pms.minio.siteStorage.testFailed") }}
          </el-tag>
          <span class="ss-test-elapsed">{{ testResult.elapsed_ms }}ms</span>
        </div>
        <div class="ss-checks">
          <div
            v-for="item in checkItems"
            :key="item.key"
            class="ss-check"
            :class="item.ok ? 'is-ok' : 'is-bad'"
          >
            <el-icon v-if="item.ok"><CircleCheckFilled /></el-icon>
            <el-icon v-else><CircleCloseFilled /></el-icon>
            <span>{{ item.label }}</span>
          </div>
        </div>
        <div v-if="testResult.message" class="ss-test-msg">{{ testResult.message }}</div>
      </div>

      <!-- 危险操作提示 -->
      <el-alert
        :title="$t('message.pms.minio.siteStorage.dangerTip')"
        type="warning"
        :closable="false"
        show-icon
        class="ss-danger"
      />
    </div>

    <template #footer>
      <div class="ss-actions">
        <el-button :icon="Refresh" :loading="testing" @click="onTest">
          {{ $t("message.pms.minio.siteStorage.testConnection") }}
        </el-button>
        <el-button
          v-auth="'api/v1/addon/minio/site/storage/provision'"
          type="primary"
          :icon="MagicStick"
          :loading="provisioning"
          @click="onProvision"
        >
          {{ storage.bucket ? $t("message.pms.minio.siteStorage.retryInit") : $t("message.pms.minio.siteStorage.initStorage") }}
        </el-button>
        <el-button
          v-auth="'api/v1/addon/minio/site/storage/rotate'"
          type="danger"
          :icon="Key"
          :loading="rotating"
          @click="onRotate"
        >
          {{ $t("message.pms.minio.siteStorage.rotate") }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts">
import { computed, defineComponent, reactive, ref, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { CircleCheckFilled, CircleCloseFilled, Key, MagicStick, Refresh } from "@element-plus/icons-vue";
import { useI18n } from "vue-i18n";
import {
  getSiteStorageStatus,
  provisionSiteStorage,
  rotateSiteStorage,
  testSiteStorage,
  type SiteStorageStatus,
  type SiteStorageTestResult,
} from "/@/api/addon/minio";

export default defineComponent({
  name: "SiteStoragePanel",
  props: {
    visible: { type: Boolean, default: false },
    provider: { type: String, default: "minio.s3" },
  },
  emits: ["update:visible"],
  setup(props, { emit }) {
    const { t } = useI18n();
    const loading = ref(false);
    const testing = ref(false);
    const provisioning = ref(false);
    const rotating = ref(false);
    const storage = reactive<SiteStorageStatus>({
      site_id: 0,
      provider: "minio.s3",
      endpoint: "",
      bucket: "",
      region: "",
      cdn_url: "",
      access_key: "",
      has_credentials: false,
      status: "pending",
      message: "",
      provisioned_at: 0,
      updated_at: 0,
    });
    const testResult = ref<SiteStorageTestResult | null>(null);
    const maskedSecret = "********";

    const statusClass = computed(() => storage.status);
    const statusLabel = computed(() => {
      const map: Record<string, string> = {
        pending: t("message.pms.minio.siteStorage.statusPending"),
        provisioning: t("message.pms.minio.siteStorage.statusProvisioning"),
        ready: t("message.pms.minio.siteStorage.statusReady"),
        failed: t("message.pms.minio.siteStorage.statusFailed"),
      };
      return map[storage.status] || storage.status;
    });

    const checkItems = computed(() => {
      if (!testResult.value) return [];
      const r = testResult.value;
      return [
        { key: "put", label: t("message.pms.minio.siteStorage.checkPut"), ok: r.put_ok },
        { key: "get", label: t("message.pms.minio.siteStorage.checkGet"), ok: r.get_ok },
        { key: "presign", label: t("message.pms.minio.siteStorage.checkPresign"), ok: r.presign_ok },
        { key: "delete", label: t("message.pms.minio.siteStorage.checkDelete"), ok: r.delete_ok },
        { key: "cross", label: t("message.pms.minio.siteStorage.checkCross"), ok: r.cross_bucket_denied },
      ];
    });

    function formatTime(ts: number) {
      if (!ts) return "-";
      return new Date(ts * 1000).toLocaleString();
    }

    async function load() {
      loading.value = true;
      try {
        const res: any = await getSiteStorageStatus(props.provider);
        if (res?.code === 0 && res.data) {
          Object.assign(storage, res.data);
          return res.data as SiteStorageStatus;
        }
      } finally {
        loading.value = false;
      }
      return null;
    }

    async function onTest() {
      testing.value = true;
      try {
        const res: any = await testSiteStorage(props.provider);
        if (res?.code === 0) {
          testResult.value = res.data;
          await load();
          if (res.data?.status === "ready") {
            ElMessage.success(t("message.pms.minio.siteStorage.testOk"));
          } else {
            ElMessage.error(res.data?.message || t("message.pms.minio.siteStorage.testFailed"));
          }
        }
      } finally {
        testing.value = false;
      }
    }

    async function onProvision() {
      provisioning.value = true;
      try {
        const res: any = await provisionSiteStorage({ provider: props.provider });
        if (res?.code === 0) {
          Object.assign(storage, res.data);
          ElMessage.success(t("message.pms.minio.siteStorage.initOk"));
        }
      } finally {
        provisioning.value = false;
      }
    }

    function onRotate() {
      ElMessageBox.confirm(
        t("message.pms.minio.siteStorage.rotateConfirm"),
        t("message.pms.minio.siteStorage.warning"),
        { type: "warning", confirmButtonText: t("message.pms.minio.siteStorage.rotate") },
      )
        .then(async () => {
          rotating.value = true;
          try {
            const res: any = await rotateSiteStorage(props.provider);
            if (res?.code === 0) {
              Object.assign(storage, res.data);
              ElMessage.success(t("message.pms.minio.siteStorage.rotateOk"));
            }
          } finally {
            rotating.value = false;
          }
        })
        .catch(() => {});
    }

    function onClose(val: boolean) {
      if (!val) {
        testResult.value = null;
        emit("update:visible", false);
      }
    }

    watch(
      () => props.visible,
      (v) => {
        if (v) {
          testResult.value = null;
          load();
        }
      },
    );

    return {
      loading,
      testing,
      provisioning,
      rotating,
      storage,
      testResult,
      maskedSecret,
      statusClass,
      statusLabel,
      checkItems,
      formatTime,
      onTest,
      onProvision,
      onRotate,
      onClose,
      Refresh,
      MagicStick,
      Key,
      CircleCheckFilled,
      CircleCloseFilled,
    };
  },
});
</script>

<style scoped>
.ss-panel {
  min-height: 120px;
}
.ss-status {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 12px;
  border: 1px solid var(--cc-color-border);
  background: var(--cc-color-surface);
}
.ss-status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--cc-color-text-4);
  box-shadow: 0 0 0 5px color-mix(in srgb, var(--cc-color-text-4) 14%, transparent);
}
.ss-status.is-ready .ss-status-dot {
  background: var(--el-color-success);
  box-shadow: 0 0 0 5px color-mix(in srgb, var(--el-color-success) 16%, transparent);
}
.ss-status.is-failed .ss-status-dot {
  background: var(--el-color-danger);
  box-shadow: 0 0 0 5px color-mix(in srgb, var(--el-color-danger) 16%, transparent);
}
.ss-status.is-provisioning .ss-status-dot {
  background: var(--el-color-warning);
  box-shadow: 0 0 0 5px color-mix(in srgb, var(--el-color-warning) 16%, transparent);
  animation: ss-pulse 1.2s ease-in-out infinite;
}
@keyframes ss-pulse {
  50% { opacity: 0.45; }
}
.ss-status-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.ss-status-text strong {
  font-size: 14px;
  color: var(--cc-color-text-1);
}
.ss-status-msg {
  font-size: 12px;
  color: var(--cc-color-text-3);
  word-break: break-all;
}
.ss-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px 16px;
  margin-top: 14px;
}
.ss-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px 12px;
  border: 1px solid var(--cc-color-border);
  border-radius: 10px;
  background: var(--cc-color-bg);
}
.ss-label {
  font-size: 11px;
  letter-spacing: 0.06em;
  color: var(--cc-color-text-3);
}
.ss-value {
  font-size: 13px;
  color: var(--cc-color-text-1);
  word-break: break-all;
}
.ss-test {
  margin-top: 14px;
  padding: 12px 14px;
  border: 1px solid var(--cc-color-border);
  border-radius: 10px;
}
.ss-test-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: var(--cc-color-text-1);
}
.ss-test-elapsed {
  margin-left: auto;
  font-size: 12px;
  color: var(--cc-color-text-3);
}
.ss-checks {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
  margin-top: 10px;
}
.ss-check {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--cc-color-text-2);
}
.ss-check.is-ok {
  color: var(--el-color-success);
}
.ss-check.is-bad {
  color: var(--el-color-danger);
}
.ss-test-msg {
  margin-top: 8px;
  font-size: 12px;
  color: var(--el-color-danger);
  word-break: break-all;
}
.ss-danger {
  margin-top: 14px;
}
.ss-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}
</style>
