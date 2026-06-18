<template>
  <el-drawer
    v-model="store.settingsDrawerVisible"
    direction="rtl"
    size="500px"
    @open="onOpen"
    class="settings-drawer"
  >
    <template #header>
      <div class="drawer-header">
        <div class="drawer-header-icon">
          <svg
            viewBox="0 0 24 24"
            width="22"
            height="22"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M9 12l2 2 4-4" />
          </svg>
        </div>
        <div>
          <div class="drawer-title">{{ $t("message.minio.bucketSettings") }}</div>
          <div class="drawer-subtitle">
            {{ store.currentBucket || $t("message.pms.minio.unselectedBucket") }}
          </div>
        </div>
      </div>
    </template>

    <el-tabs v-model="activeTab" class="settings-tabs">
      <!-- ===== 版本控制 ===== -->
      <el-tab-pane :label="$t('message.minio.versioning')" name="versioning">
        <div class="setting-card">
          <div
            class="setting-icon-wrap"
            style="background: rgba(99, 102, 241, 0.1); color: #6366f1"
          >
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="12" cy="12" r="3" />
              <path
                d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
              />
            </svg>
          </div>
          <h3 class="setting-title">{{ $t("message.minio.versioning") }}</h3>
          <p class="setting-desc">{{ $t("message.minio.versioningDesc") }}</p>
          <div class="setting-control">
            <div class="toggle-row">
              <div class="toggle-label">
                <span class="toggle-name">{{ $t("message.minio.enableVersioning") }}</span>
                <span class="toggle-badge" :class="versioningEnabled ? 'badge-on' : 'badge-off'">
                  {{
                    versioningEnabled
                      ? $t("message.pms.minio.versionEnabled")
                      : $t("message.pms.minio.versionDisabled")
                  }}
                </span>
              </div>
              <el-switch v-model="versioningEnabled" @change="onVersioningChange" />
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!-- ===== 生命周期 ===== -->
      <el-tab-pane :label="$t('message.minio.lifecycle')" name="lifecycle">
        <div class="setting-card">
          <div
            class="setting-icon-wrap"
            style="background: rgba(245, 158, 11, 0.1); color: #f59e0b"
          >
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
          </div>
          <h3 class="setting-title">{{ $t("message.minio.lifecycleRules") }}</h3>
          <p class="setting-desc">{{ $t("message.minio.lifecycleDesc") }}</p>

          <div class="lifecycle-list">
            <div v-for="(rule, idx) in lifecycleRules" :key="idx" class="lifecycle-card">
              <div class="lifecycle-card-header">
                <span class="lifecycle-index">#{{ idx + 1 }}</span>
                <el-button
                  text
                  size="small"
                  class="lifecycle-del-btn"
                  @click="removeLifecycleRule(idx)"
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="14"
                    height="14"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"
                    /></svg
                  >{{ $t("message.common.delete") }}</el-button
                >
              </div>
              <div class="lifecycle-form">
                <div class="lifecycle-field">
                  <label>{{ $t("message.minio.prefixMatch") }}</label>
                  <el-input
                    v-model="rule.prefix"
                    :placeholder="$t('message.minio.prefixPlaceholder')"
                    size="small"
                  />
                </div>
                <div class="lifecycle-field">
                  <label>{{ $t("message.minio.expireDays") }}</label>
                  <el-input-number
                    v-model="rule.expire_days"
                    :min="1"
                    :max="3650"
                    size="small"
                    controls-position="right"
                  />
                </div>
                <div class="lifecycle-field">
                  <label>{{ $t("message.common.colStatus") }}</label>
                  <el-switch
                    v-model="rule.status"
                    active-value="Enabled"
                    inactive-value="Disabled"
                  />
                </div>
              </div>
            </div>
          </div>

          <el-button class="add-rule-btn" size="small" @click="addLifecycleRule">
            <svg
              viewBox="0 0 24 24"
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              style="margin-right: 4px"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            {{ $t("message.minio.addRule") }}
          </el-button>

          <div class="setting-save-bar">
            <el-button type="primary" :loading="savingLifecycle" @click="saveLifecycle">
              <svg
                viewBox="0 0 24 24"
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                style="margin-right: 4px"
              >
                <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                <path d="M17 21v-8H7v8M7 3v5h8" />
              </svg>
              {{ $t("message.minio.saveLifecycleRules") }}
            </el-button>
          </div>
        </div>
      </el-tab-pane>

      <!-- ===== 加密 ===== -->
      <el-tab-pane :label="$t('message.minio.encryption')" name="encryption">
        <div class="setting-card">
          <div
            class="setting-icon-wrap"
            style="background: rgba(16, 185, 129, 0.1); color: #10b981"
          >
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
          </div>
          <h3 class="setting-title">{{ $t("message.minio.serverSideEncryption") }}</h3>
          <p class="setting-desc">{{ $t("message.minio.sseDesc") }}</p>

          <div v-if="!encryptionEnabled && encryptionError" class="setting-warning">
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              style="flex-shrink: 0"
            >
              <path
                d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
              />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <span>{{ $t("message.minio.sseDisabled") }}</span>
          </div>

          <div class="setting-control">
            <div class="toggle-row">
              <div class="toggle-label">
                <span class="toggle-name">{{ $t("message.minio.enableSSE") }}</span>
                <span class="toggle-badge" :class="encryptionEnabled ? 'badge-on' : 'badge-off'">
                  {{
                    encryptionEnabled
                      ? $t("message.pms.minio.encEnabled")
                      : $t("message.pms.minio.encDisabled")
                  }}
                </span>
              </div>
              <el-switch
                v-model="encryptionEnabled"
                @change="onEncryptionChange"
                :loading="togglingEncryption"
              />
            </div>
            <div class="encryption-algo">
              {{ $t("message.minio.currentAlgorithm")
              }}<code>{{
                store.bucketSettings.encryption?.algorithm || $t("message.pms.minio.notEnabled")
              }}</code>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!-- ===== 桶策略 ===== -->
      <el-tab-pane :label="$t('message.minio.bucketPolicy')" name="policy">
        <div class="setting-card">
          <div class="setting-icon-wrap" style="background: rgba(244, 63, 94, 0.1); color: #f43f5e">
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <h3 class="setting-title">{{ $t("message.pms.minio.bucketPolicy") }}</h3>
          <p class="setting-desc">
            {{ $t("message.pms.minio.policyDesc") }}
          </p>

          <el-skeleton :loading="store.settingsLoading" animated>
            <template #default>
              <!-- 状态大标签 -->
              <div class="policy-status-bar">
                <span class="policy-status-label">{{ $t("message.pms.minio.currentStatus") }}</span>
                <span v-if="policy.is_public" class="policy-badge policy-public">
                  <svg
                    viewBox="0 0 24 24"
                    width="14"
                    height="14"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  {{ $t("message.pms.minio.publicRead") }}
                </span>
                <span v-else-if="policy.is_private" class="policy-badge policy-private">
                  <svg
                    viewBox="0 0 24 24"
                    width="14"
                    height="14"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                  {{ $t("message.pms.minio.privateBucket") }}
                </span>
                <span v-else class="policy-badge policy-hotlink">
                  <svg
                    viewBox="0 0 24 24"
                    width="14"
                    height="14"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                  >
                    <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
                  </svg>
                  {{ $t("message.pms.minio.hotlink") }}
                </span>
              </div>

              <!-- 操作按钮 -->
              <div class="policy-btn-group">
                <button
                  class="policy-btn policy-btn-public"
                  :disabled="policy.is_public || loadingPublic"
                  @click="setPublic"
                >
                  <span v-if="loadingPublic" class="btn-spinner" />
                  <svg
                    v-else
                    viewBox="0 0 24 24"
                    width="15"
                    height="15"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  {{ $t("message.pms.minio.publicRead") }}
                </button>
                <button
                  class="policy-btn policy-btn-private"
                  :disabled="policy.is_private || loadingPrivate"
                  @click="setPrivate"
                >
                  <span v-if="loadingPrivate" class="btn-spinner" />
                  <svg
                    v-else
                    viewBox="0 0 24 24"
                    width="15"
                    height="15"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                  {{ $t("message.pms.minio.privateBucket") }}
                </button>
                <button
                  class="policy-btn policy-btn-hotlink"
                  :disabled="(!policy.is_private && !policy.is_public) || loadingHotlink"
                  @click="enableHotlinkMode"
                >
                  <span v-if="loadingHotlink" class="btn-spinner" />
                  <svg
                    v-else
                    viewBox="0 0 24 24"
                    width="15"
                    height="15"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
                  </svg>
                  {{ $t("message.pms.minio.hotlink") }}
                </button>
              </div>

              <!-- 防盗链域名 -->
              <div v-if="showHotlinkEditor" class="hotlink-panel">
                <div class="hotlink-panel-title">
                  <svg
                    viewBox="0 0 24 24"
                    width="15"
                    height="15"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4M12 8h.01" />
                  </svg>
                  {{ $t("message.pms.minio.hotlinkDomains") }}
                </div>
                <div v-for="(domain, idx) in hotlinkDomains" :key="idx" class="hotlink-row">
                  <el-input
                    v-model="hotlinkDomains[idx]"
                    :placeholder="$t('message.pms.minio.placeholderDomain')"
                    size="small"
                  />
                  <button class="hotlink-remove-btn" @click="removeDomain(idx)">
                    <svg
                      viewBox="0 0 24 24"
                      width="14"
                      height="14"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <button class="hotlink-add-btn" @click="addDomain">
                  <svg
                    viewBox="0 0 24 24"
                    width="13"
                    height="13"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  {{ $t("message.pms.minio.addDomain") }}
                </button>
                <div class="hotlink-actions">
                  <button class="hotlink-save-btn" :disabled="savingHotlink" @click="saveHotlink">
                    <span v-if="savingHotlink" class="btn-spinner" />{{ $t("message.common.save") }}
                  </button>
                  <button class="hotlink-cancel-btn" @click="showHotlinkEditor = false">
                    {{ $t("message.common.cancel") }}
                  </button>
                </div>
                <div class="hotlink-tip">
                  <svg
                    viewBox="0 0 24 24"
                    width="12"
                    height="12"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4M12 8h.01" />
                  </svg>
                  {{ $t("message.pms.minio.hotlinkDesc") }}<code>http://localhost:*</code>、<code
                    >https://*.yourdomain.com/*</code
                  >
                </div>
              </div>

              <!-- 策略预览 -->
              <div class="policy-json-section">
                <div class="policy-json-label">{{ $t("message.pms.minio.policyJson") }}</div>
                <div class="policy-json-box">
                  <pre class="policy-json-pre">{{ policyJson }}</pre>
                </div>
              </div>
            </template>
          </el-skeleton>
        </div>
      </el-tab-pane>
    </el-tabs>
  </el-drawer>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useMinioStore } from "../store";
import { Plus } from "@element-plus/icons-vue";
import { useI18n } from "vue-i18n";

export default defineComponent({
  name: "MinioSettingsPanel",
  setup() {
    const { t } = useI18n();
    const store = useMinioStore();
    const activeTab = ref("versioning");
    const savingLifecycle = ref(false);
    const hotlinkSaving = ref(false);
    const encryptionError = ref(false);
    const togglingEncryption = ref(false);

    // ---- 版本控制 ----
    const versioningEnabled = ref(false);
    watch(
      () => store.bucketSettings.versioning?.enabled,
      (val) => {
        versioningEnabled.value = !!val;
      },
      { immediate: true },
    );

    async function onVersioningChange(val: boolean) {
      versioningEnabled.value = val;
      try {
        await store.toggleVersioning(val);
      } catch {
        versioningEnabled.value = !val;
        ElMessage.error(t("message.pms.minio.msgVersioningFail"));
      }
    }

    // ---- 生命周期 ----
    const lifecycleRules = ref<any[]>([]);
    watch(
      () => store.bucketSettings.lifecycle,
      (val) => {
        if (val && val.length > 0) {
          lifecycleRules.value = JSON.parse(JSON.stringify(val));
        } else {
          lifecycleRules.value = [{ prefix: "", expire_days: 30, status: "Enabled" }];
        }
      },
      { immediate: true },
    );

    function addLifecycleRule() {
      lifecycleRules.value.push({ prefix: "", expire_days: 30, status: "Enabled" });
    }
    function removeLifecycleRule(idx: number) {
      lifecycleRules.value.splice(idx, 1);
    }
    async function saveLifecycle() {
      savingLifecycle.value = true;
      try {
        await store.saveLifecycleRules(lifecycleRules.value);
      } catch {
        ElMessage.error(t("message.common.msgNetworkError"));
      } finally {
        savingLifecycle.value = false;
      }
    }

    // ---- 加密 ----
    const encryptionEnabled = ref(false);
    watch(
      () => store.bucketSettings.encryption?.algorithm,
      (val) => {
        encryptionEnabled.value = !!val;
      },
      { immediate: true },
    );

    async function onEncryptionChange(val: boolean) {
      togglingEncryption.value = true;
      encryptionError.value = false;
      encryptionEnabled.value = val;
      try {
        if (val) {
          await store.toggleEncryption(true);
        } else {
          try {
            await ElMessageBox.confirm(
              t("message.pms.minio.confirmDisableEncryptionMsg"),
              t("message.common.confirmTitle"),
              {
                confirmButtonText: t("message.common.confirm"),
                cancelButtonText: t("message.common.cancel"),
                type: "info",
              },
            );
            await store.toggleEncryption(false);
          } catch {
            encryptionEnabled.value = true;
            return;
          }
        }
      } catch (err: any) {
        encryptionEnabled.value = !val;
        encryptionError.value = true;
        const msg = err?.message || err?.msg || "";
        if (msg.includes("KMS")) {
          ElMessage.error(t("message.minio.sseDisabled"));
        } else {
          ElMessage.error(t("message.minio.encryptFailed") + msg);
        }
      } finally {
        togglingEncryption.value = false;
      }
    }

    // ---- 桶策略 ----
    const policy = computed(() => store.bucketSettings.policy || {});
    const policyJson = computed(() => {
      const p = store.bucketSettings.policy;
      if (!p || !p.policy) return t("message.pms.minio.noPolicyHint");
      try {
        return JSON.stringify(JSON.parse(p.policy), null, 2);
      } catch {
        return p.policy;
      }
    });

    const loadingPublic = ref(false);
    const loadingPrivate = ref(false);
    const loadingHotlink = ref(false);
    const showHotlinkEditor = ref(false);
    const hotlinkDomains = ref<string[]>([]);

    function onOpen() {
      showHotlinkEditor.value = false;
      store.fetchBucketSettings();
    }

    async function setPublic() {
      try {
        await ElMessageBox.confirm(
          t("message.pms.minio.confirmSetPublic"),
          t("message.common.confirmTitle"),
          {
            confirmButtonText: t("message.common.confirm"),
            cancelButtonText: t("message.common.cancel"),
            type: "warning",
          },
        );
        loadingPublic.value = true;
        await store.setBucketPublic();
        showHotlinkEditor.value = false;
      } catch {
        if (loadingPublic.value) ElMessage.error(t("message.pms.minio.setStatusUnchanged"));
      } finally {
        loadingPublic.value = false;
      }
    }

    async function setPrivate() {
      try {
        await ElMessageBox.confirm(
          t("message.pms.minio.confirmSetPrivate"),
          t("message.msg.warning"),
          {
            confirmButtonText: t("message.common.confirm"),
            cancelButtonText: t("message.common.cancel"),
            type: "warning",
          },
        );
        loadingPrivate.value = true;
        await store.setBucketPrivate();
        showHotlinkEditor.value = false;
      } catch {
        if (loadingPrivate.value) ElMessage.error(t("message.pms.minio.setStatusUnchanged"));
      } finally {
        loadingPrivate.value = false;
      }
    }

    function enableHotlinkMode() {
      hotlinkDomains.value = [...(policy.value.allow_domains || [])];
      if (hotlinkDomains.value.length === 0) {
        hotlinkDomains.value = ["http://localhost:*", "http://127.0.0.1:*"];
      }
      showHotlinkEditor.value = true;
    }

    function addDomain() {
      hotlinkDomains.value.push("");
    }
    function removeDomain(idx: number) {
      hotlinkDomains.value.splice(idx, 1);
    }

    async function saveHotlink() {
      const domains = hotlinkDomains.value.filter((d) => d.trim() !== "");
      if (domains.length === 0) {
        ElMessage.warning(t("message.pms.minio.msgAtLeastOneDomain"));
        return;
      }
      try {
        hotlinkSaving.value = true;
        loadingHotlink.value = true;
        await store.setBucketHotlink(domains);
        showHotlinkEditor.value = false;
      } catch {
        ElMessage.error(t("message.pms.minio.saveHotlinkFail"));
      } finally {
        hotlinkSaving.value = false;
        loadingHotlink.value = false;
      }
    }

    return {
      store,
      activeTab,
      versioningEnabled,
      onVersioningChange,
      lifecycleRules,
      savingLifecycle,
      addLifecycleRule,
      removeLifecycleRule,
      saveLifecycle,
      encryptionEnabled,
      onEncryptionChange,
      encryptionError,
      togglingEncryption,
      policy,
      policyJson,
      loadingPublic,
      loadingPrivate,
      loadingHotlink,
      showHotlinkEditor,
      hotlinkDomains,
      hotlinkSaving,
      setPublic,
      setPrivate,
      enableHotlinkMode,
      addDomain,
      removeDomain,
      saveHotlink,
      onOpen,
      Plus,
    };
  },
});
</script>

<style scoped>
/* ========== Drawer ========== */
.settings-drawer {
  :deep(.el-drawer) {
    background: #f5f6fa;
  }

  :deep(.el-drawer__header) {
    margin: 0;
    padding: 18px 22px 14px;
    background: var(--cc-color-surface);
    border-bottom: 1px solid var(--cc-color-border-light);
  }

  :deep(.el-drawer__body) {
    padding: 16px 18px 20px;
    overflow-y: auto;
  }
}

.drawer-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.drawer-header-icon {
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #6366f1, #818cf8);
  border-radius: var(--cc-radius-lg);
  color: #fff;
}

.drawer-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--cc-color-text-1);
  line-height: 1.3;
}

.drawer-subtitle {
  font-size: 12px;
  color: var(--cc-color-text-4);
  font-family: "SF Mono", "Fira Code", monospace;
}

/* ========== Tabs ========== */
.settings-tabs {
  :deep(.el-tabs__header) {
    margin-bottom: 18px;
    border-bottom: 1px solid var(--cc-color-border-light);
  }

  :deep(.el-tabs__nav-wrap::after) {
    display: none;
  }

  :deep(.el-tabs__item) {
    font-size: 13px;
    font-weight: 500;
    color: var(--cc-color-text-4);
    padding: 0 14px;
    height: 38px;
    line-height: 38px;
    transition: color 0.2s;

    &:hover {
      color: var(--cc-color-text-3);
    }

    &.is-active {
      color: #6366f1;
      font-weight: 600;
    }
  }

  :deep(.el-tabs__active-bar) {
    height: 2.5px;
    border-radius: var(--cc-radius-xs);
    background: #6366f1;
  }
}

/* ========== Setting Card ========== */
.setting-card {
  background: var(--cc-color-surface);
  border-radius: var(--cc-radius-lg);
  padding: 20px;
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.04),
    0 0 0 1px rgba(0, 0, 0, 0.02);
  margin-bottom: 14px;
}

.setting-icon-wrap {
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--cc-radius-lg);
  margin-bottom: 12px;
}

.setting-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--cc-color-text-1);
  margin: 0 0 4px;
}

.setting-desc {
  font-size: 12.5px;
  color: var(--cc-color-text-4);
  line-height: 1.5;
  margin: 0 0 16px;
}

.setting-control {
  margin-top: 4px;
}

.setting-warning {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  padding: 10px 12px;
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: 8px;
  font-size: 12px;
  color: #92400e;
  line-height: 1.5;
  margin-bottom: 14px;
}

/* ========== Toggle Row ========== */
.toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  background: var(--cc-color-surface-hover);
  border-radius: 8px;
  border: 1px solid #f0f2f5;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toggle-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--cc-color-text-1);
}

.toggle-badge {
  font-size: 11px;
  padding: 1px 8px;
  border-radius: var(--cc-radius-lg);
  font-weight: 600;
}

.badge-on {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
}

.badge-off {
  background: rgba(148, 163, 184, 0.15);
  color: var(--cc-color-text-3);
}

/* ========== Encryption ========== */
.encryption-algo {
  margin-top: 8px;
  font-size: 12px;
  color: var(--cc-color-text-4);
  padding: 0 14px;

  code {
    background: #f1f5f9;
    padding: 1px 6px;
    border-radius: 3px;
    font-family: "SF Mono", "Fira Code", monospace;
    font-size: 11px;
    color: var(--cc-color-text-2);
  }
}

/* ========== Lifecycle ========== */
.lifecycle-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 12px;
}

.lifecycle-card {
  background: var(--cc-color-surface-hover);
  border: 1px solid #f0f2f5;
  border-radius: 8px;
  overflow: hidden;
}

.lifecycle-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: var(--cc-color-surface);
  border-bottom: 1px solid #f0f2f5;
}

.lifecycle-index {
  font-size: 11px;
  font-weight: 700;
  color: #818cf8;
  background: rgba(99, 102, 241, 0.08);
  padding: 1px 8px;
  border-radius: 4px;
}

.lifecycle-del-btn {
  font-size: 12px;
  color: var(--cc-color-text-4);
  transition: color 0.15s;

  &:hover {
    color: #f43f5e !important;
    background: rgba(244, 63, 94, 0.06);
  }
}

.lifecycle-form {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;

  .lifecycle-field {
    label {
      display: block;
      font-size: 12px;
      color: var(--cc-color-text-3);
      margin-bottom: 4px;
      font-weight: 500;
    }

    .el-input-number {
      width: 100%;
    }

    .el-input-number--small {
      width: 100%;

      .el-input-number__decrease,
      .el-input-number__increase {
        width: 28px;
      }
    }
  }
}

.add-rule-btn {
  width: 100%;
  border: 1px dashed #d1d5db;
  color: var(--cc-color-text-3);
  font-size: 13px;
  border-radius: 8px;
  height: 36px;
  transition: all 0.2s;

  &:hover {
    border-color: #6366f1;
    color: #6366f1;
    background: rgba(99, 102, 241, 0.04);
  }
}

.setting-save-bar {
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid #f0f2f5;

  .el-button--primary {
    --el-button-bg-color: #6366f1;
    --el-button-border-color: #6366f1;
    --el-button-hover-bg-color: #4f46e5;
    --el-button-hover-border-color: #4f46e5;
    --el-button-active-bg-color: #4338ca;
    border-radius: 8px;
    font-size: 13px;
    height: 36px;
  }
}

/* ========== Policy ========== */
.policy-status-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
  padding: 10px 14px;
  background: var(--cc-color-surface-hover);
  border-radius: 8px;
  border: 1px solid #f0f2f5;
}

.policy-status-label {
  font-size: 12px;
  color: var(--cc-color-text-4);
  font-weight: 500;
}

.policy-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: var(--cc-radius-md);
}

.policy-public {
  background: rgba(16, 185, 129, 0.12);
  color: #059669;
}

.policy-private {
  background: rgba(244, 63, 94, 0.1);
  color: #e11d48;
}

.policy-hotlink {
  background: rgba(245, 158, 11, 0.12);
  color: #d97706;
}

.policy-btn-group {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.policy-btn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  padding: 9px 10px;
  border: 2px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: var(--cc-color-surface);
  position: relative;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:not(:disabled):hover {
    transform: translateY(-1px);
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.08);
  }

  &:not(:disabled):active {
    transform: translateY(0);
  }
}

.policy-btn-public {
  border-color: #a7f3d0;
  color: #059669;
  &:not(:disabled):hover {
    background: #ecfdf5;
    border-color: #34d399;
  }
}

.policy-btn-private {
  border-color: #fecaca;
  color: #e11d48;
  &:not(:disabled):hover {
    background: #fef2f2;
    border-color: #f87171;
  }
}

.policy-btn-hotlink {
  border-color: #fde68a;
  color: #d97706;
  &:not(:disabled):hover {
    background: #fffbeb;
    border-color: #fbbf24;
  }
}

.btn-spinner {
  width: 15px;
  height: 15px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ========== Hotlink ========== */
.hotlink-panel {
  background: #fafbfc;
  border: 1px solid #f0f2f5;
  border-radius: 8px;
  padding: 14px;
  margin-bottom: 12px;
  animation: fadeSlideIn 0.2s ease;
}

@keyframes fadeSlideIn {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.hotlink-panel-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: var(--cc-color-text-2);
  margin-bottom: 10px;
}

.hotlink-row {
  display: flex;
  gap: 6px;
  align-items: center;
  margin-bottom: 6px;
}

.hotlink-remove-btn {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: var(--cc-radius-md);
  background: transparent;
  color: var(--cc-color-text-4);
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    background: rgba(244, 63, 94, 0.08);
    color: #f43f5e;
  }
}

.hotlink-add-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border: none;
  background: transparent;
  font-size: 12px;
  color: #6366f1;
  font-weight: 500;
  cursor: pointer;
  padding: 6px 4px;
  border-radius: 4px;
  transition: all 0.15s;

  &:hover {
    background: rgba(99, 102, 241, 0.06);
  }
}

.hotlink-actions {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}

.hotlink-save-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 16px;
  font-size: 12px;
  font-weight: 600;
  border: none;
  border-radius: var(--cc-radius-md);
  background: #6366f1;
  color: #fff;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    background: #4f46e5;
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.hotlink-cancel-btn {
  padding: 6px 14px;
  font-size: 12px;
  border: 1px solid var(--cc-color-border-light);
  border-radius: var(--cc-radius-md);
  background: var(--cc-color-surface);
  color: var(--cc-color-text-3);
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    background: var(--cc-color-surface-hover);
  }
}

.hotlink-tip {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  margin-top: 10px;
  padding: 8px 10px;
  background: var(--cc-color-primary-softer);
  border-radius: var(--cc-radius-sm);
  font-size: 11px;
  color: var(--cc-color-primary);
  line-height: 1.5;

  code {
    background: rgba(59, 130, 246, 0.08);
    padding: 1px 4px;
    border-radius: 3px;
    font-family: "SF Mono", "Fira Code", monospace;
    font-size: 10px;
  }
}

/* ========== Policy JSON ========== */
.policy-json-section {
  margin-top: 4px;
}

.policy-json-label {
  font-size: 11px;
  color: var(--cc-color-text-4);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
}

.policy-json-box {
  background: #1e1e2e;
  border-radius: 8px;
  overflow: hidden;
}

.policy-json-pre {
  margin: 0;
  padding: 14px;
  font-family: "SF Mono", "Fira Code", "Cascadia Code", monospace;
  font-size: 11px;
  line-height: 1.7;
  color: #a5b4fc;
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 260px;
  overflow-y: auto;

  /* Catppuccin-inspired syntax coloring via simple string matching isn't possible,
     so we keep it readable with the indigo-tinted text. */
}
</style>
