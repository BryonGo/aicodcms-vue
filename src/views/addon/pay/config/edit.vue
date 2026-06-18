<template>
  <div class="pay-form">
    <!-- 面包屑 -->
    <nav class="pay-form__breadcrumb">
      <router-link to="/" class="pay-form__bc-link">{{ $t("message.router.home") }}</router-link>
      <span class="pay-form__bc-sep">/</span>
      <span class="pay-form__bc-text">{{ $t("message.sdk.payConfig.headerTitle") }}</span>
      <span class="pay-form__bc-sep">/</span>
      <span class="pay-form__bc-current">{{ $t("message.sdk.payConfig.editTitle") }}</span>
    </nav>

    <!-- 加载态 -->
    <div v-if="loading" class="pay-form__loading">
      <el-icon :size="28" class="pay-form__spin"><Loading /></el-icon>
      <p>{{ $t("message.user.loading") }}</p>
    </div>

    <!-- 错误态 -->
    <div v-else-if="loadError" class="pay-form__error">
      <el-icon :size="40"><WarningFilled /></el-icon>
      <h3>{{ $t("message.sdk.payConfig.editErrorTitle") }}</h3>
      <p>{{ loadError }}</p>
      <el-button type="primary" @click="goBack">{{ $t("message.common.back") }}</el-button>
    </div>

    <!-- 正常态 -->
    <template v-else>
      <!-- 页头 -->
      <header class="pay-form__header">
        <button class="pay-form__back" @click="goBack">
          <el-icon size="14"><ArrowLeft /></el-icon>
          <span>{{ $t("message.sdk.payConfig.backToList") }}</span>
        </button>
        <div class="pay-form__header-row">
          <div>
            <h1 class="pay-form__title">
              {{ form.channel_code || $t("message.sdk.payConfig.editTitle") }}
            </h1>
            <p class="pay-form__subtitle">
              ID: <span class="pay-form__id-badge">{{ form.id }}</span> &middot; 模块:
              <span class="pay-form__module-tag">{{ form.module || "—" }}</span>
            </p>
          </div>
          <button class="pay-form__delete-btn" @click="onDelete">
            <el-icon size="14"><Delete /></el-icon>
            <span>{{ $t("message.common.delete") }}</span>
          </button>
        </div>
      </header>

      <!-- 表单卡片 -->
      <div class="pay-form__card">
        <el-form ref="formRef" :model="form" :rules="rules" label-position="top" size="large">
          <!-- 模块绑定 -->
          <section class="pay-form__section">
            <div class="pay-form__section-header">
              <span class="pay-form__section-icon"
                ><el-icon><Connection /></el-icon
              ></span>
              <h3 class="pay-form__section-title">
                {{ $t("message.sdk.payConfig.sectionModule") }}
              </h3>
            </div>
            <div class="pay-form__grid">
              <el-form-item prop="module">
                <template #label
                  ><span class="pay-form__label"
                    >{{ $t("message.sdk.payConfig.labelModule")
                    }}<span class="pay-form__req">*</span></span
                  ></template
                >
                <el-select
                  v-model="form.module"
                  :placeholder="$t('message.sdk.payConfig.placeholderModule')"
                  class="pay-form__input"
                >
                  <el-option :label="$t('message.sdk.payConfig.optionGame')" value="game" />
                  <el-option :label="$t('message.sdk.payConfig.optionCms')" value="cms" />
                  <el-option :label="$t('message.sdk.payConfig.optionRecharge')" value="recharge" />
                </el-select>
              </el-form-item>
              <el-form-item prop="platform">
                <template #label
                  ><span class="pay-form__label"
                    >{{ $t("message.sdk.payConfig.labelClientDevice")
                    }}<span class="pay-form__req">*</span></span
                  ></template
                >
                <el-select
                  v-model="form.platform"
                  :placeholder="$t('message.sdk.payConfig.placeholderPlatform')"
                  class="pay-form__input"
                >
                  <el-option :label="$t('message.sdk.payConfig.optionWeb')" value="web" />
                  <el-option :label="$t('message.sdk.payConfig.optionMobile')" value="mobile" />
                  <el-option :label="$t('message.sdk.payConfig.optionPc')" value="pc" />
                </el-select>
                <span class="pay-form__hint">{{ $t("message.sdk.payConfig.hintPlatform") }}</span>
              </el-form-item>
              <el-form-item v-if="form.module === 'game'" prop="app_id">
                <template #label
                  ><span class="pay-form__label"
                    >App ID<span class="pay-form__req">*</span></span
                  ></template
                >
                <el-input-number
                  v-model="form.app_id"
                  :min="1"
                  class="pay-form__input"
                  :placeholder="$t('message.sdk.payConfig.placeholderGameId')"
                />
              </el-form-item>
            </div>
          </section>

          <!-- 通道配置 -->
          <section class="pay-form__section">
            <div class="pay-form__section-header">
              <span class="pay-form__section-icon"
                ><el-icon><Coin /></el-icon
              ></span>
              <h3 class="pay-form__section-title">{{ $t("message.sdk.payConfig.colConfig") }}</h3>
            </div>

            <el-form-item prop="channel_code">
              <template #label
                ><span class="pay-form__label"
                  >{{ $t("message.sdk.payChannel.colCode")
                  }}<span class="pay-form__req">*</span></span
                ></template
              >
              <el-select
                v-model="form.channel_code"
                :placeholder="$t('message.sdk.payConfig.placeholderChannel')"
                clearable
                filterable
                class="pay-form__input"
              >
                <el-option
                  v-for="ch in channelOptions"
                  :key="ch.channel_code"
                  :label="`${ch.name} (${ch.channel_code})`"
                  :value="ch.channel_code"
                >
                  <span class="pay-form__channel-option">
                    <span
                      class="pay-form__channel-dot"
                      :style="{ background: getChannelColor(ch.channel_code) }"
                    />
                    <span>{{ ch.name }}</span>
                    <span class="pay-form__channel-code-tag">{{ ch.channel_code }}</span>
                  </span>
                </el-option>
              </el-select>
            </el-form-item>

            <el-form-item prop="state">
              <template #label
                ><span class="pay-form__label">{{ $t("message.common.colStatus") }}</span></template
              >
              <el-switch
                v-model="form.state"
                :active-value="1"
                :inactive-value="0"
                :active-text="$t('message.common.enabled')"
                :inactive-text="$t('message.common.disabled')"
              />
            </el-form-item>

            <!-- 结构化扩展字段 -->
            <el-form-item v-if="activeChannelMeta || form.extra_config">
              <template #label
                ><span class="pay-form__label">{{
                  $t("message.sdk.payConfig.labelExtraConfig")
                }}</span></template
              >

              <template v-if="channelStructuredFields.length > 0">
                <div
                  class="pay-form__extra-card"
                  :style="{
                    borderLeftColor: activeChannelMeta?.color || 'var(--cc-color-primary)',
                  }"
                >
                  <div class="pay-form__extra-header">
                    <span
                      class="pay-form__extra-dot"
                      :style="{ background: activeChannelMeta?.color || 'var(--cc-color-primary)' }"
                    />
                    <span class="pay-form__extra-title"
                      >{{ activeChannelMeta?.name || form.channel_code }} 配置</span
                    >
                  </div>
                  <div class="pay-form__extra-fields">
                    <template v-for="f in channelStructuredFields" :key="f.key">
                      <el-form-item :prop="'extra_' + f.key" class="pay-form__extra-item">
                        <template #label>
                          <span class="pay-form__label"
                            >{{ f.label }}
                            <el-icon v-if="f.secret" size="12" class="pay-form__secret-icon"
                              ><Lock
                            /></el-icon>
                          </span>
                        </template>
                        <template v-if="f.type === 'select'">
                          <el-select
                            v-model="extraFields[f.key]"
                            :placeholder="$t('message.sdk.payConfig.placeholderSelect')"
                            class="pay-form__input"
                            clearable
                          >
                            <el-option
                              v-for="o in f.options"
                              :key="o.value"
                              :label="o.label"
                              :value="o.value"
                            />
                          </el-select>
                        </template>
                        <template v-else-if="f.multiline">
                          <el-input
                            v-model="extraFields[f.key]"
                            type="textarea"
                            :rows="f.rows || 3"
                            :placeholder="f.placeholder"
                            class="pay-form__mono"
                            clearable
                          />
                        </template>
                        <template v-else>
                          <el-input
                            v-model="extraFields[f.key]"
                            :placeholder="f.placeholder"
                            :type="f.secret && !visibleFields.has(f.key) ? 'password' : 'text'"
                            class="pay-form__mono"
                            clearable
                          >
                            <template #suffix>
                              <el-icon
                                v-if="f.secret"
                                class="pay-form__eye"
                                @click="toggleVisibility(f.key)"
                              >
                                <View v-if="visibleFields.has(f.key)" />
                                <Hide v-else />
                              </el-icon>
                            </template>
                          </el-input>
                        </template>
                      </el-form-item>
                    </template>
                  </div>
                </div>
              </template>

              <!-- 降级：原始 JSON -->
              <template v-else>
                <el-input
                  v-model="form.extra_config"
                  type="textarea"
                  :rows="5"
                  placeholder='{"key":"value"}'
                  class="pay-form__mono"
                  @input="onExtraInput"
                />
                <span class="pay-form__hint"
                  >{{ $t("message.sdk.payConfig.hintPem") }}<code>\n</code> 会自动转回换行</span
                >
              </template>
            </el-form-item>
          </section>

          <!-- 元数据 -->
          <div class="pay-form__meta">
            <span class="pay-form__meta-item"><b>创建:</b> {{ fmt(form.created_at) }}</span>
            <span class="pay-form__meta-item"><b>更新:</b> {{ fmt(form.updated_at) }}</span>
          </div>

          <!-- 操作按钮 -->
          <div class="pay-form__actions">
            <el-button size="large" @click="goBack">{{ $t("message.common.cancel") }}</el-button>
            <button type="button" class="pay-form__submit" :disabled="submitting" @click="onSubmit">
              <template v-if="!submitting"
                ><el-icon size="16"><Check /></el-icon>
                {{ $t("message.sdk.payConfig.editBtnSave") }}</template
              >
              <template v-else>{{ $t("message.common.saving") }}</template>
            </button>
          </div>
        </el-form>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onActivated, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  ArrowLeft,
  Connection,
  Coin,
  Check,
  Delete,
  Loading,
  WarningFilled,
  Lock,
  View,
  Hide,
} from "@element-plus/icons-vue";
import {
  getPayConfigDetail,
  editPayConfig,
  deletePayConfig,
  getPayChannelList,
  PayChannelItem,
} from "/@/api/addon/pay";
import {
  getChannelFields,
  parseExtraConfig,
  serializeExtraFields,
  normalizeNewlines,
  channelMeta,
} from "./channelSchema";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const router = useRouter();
const route = useRoute();

const formRef = ref();
const loading = ref(true);
const submitting = ref(false);
const loadError = ref("");
const channelOptions = ref<PayChannelItem[]>([]);
const appId = computed(() => Number(route.query.app_id) || 0);
const gameName = computed(() => (route.query.name as string) || "");
const visibleFields = ref<Set<string>>(new Set());

const form = reactive<any>({
  id: 0,
  module: "game",
  platform: "",
  app_id: 0,
  channel_code: "",
  state: 1,
  extra_config: "",
  created_at: 0,
  updated_at: 0,
});

const extraFields = reactive<Record<string, string>>({});
const channelStructuredFields = computed(() => getChannelFields(form.channel_code));
const activeChannelMeta = computed(() => channelMeta[form.channel_code] || null);

function getChannelColor(code: string): string {
  return channelMeta[code]?.color || "var(--cc-color-text-3)";
}

function toggleVisibility(key: string) {
  const s = new Set(visibleFields.value);
  if (s.has(key)) s.delete(key);
  else s.add(key);
  visibleFields.value = s;
}

function fillExtraFields(json: string) {
  Object.keys(extraFields).forEach((k) => delete extraFields[k]);
  const parsed = parseExtraConfig(json);
  Object.assign(extraFields, parsed);
}

watch(
  () => form.channel_code,
  () => {
    Object.keys(extraFields).forEach((k) => delete extraFields[k]);
    fillExtraFields(form.extra_config);
  },
  { immediate: true },
);

const rules: Record<string, any> = {
  module: [
    { required: true, message: t("message.sdk.payConfig.placeholderModule"), trigger: "change" },
  ],
  platform: [
    { required: true, message: t("message.sdk.payConfig.selectClientDevice"), trigger: "change" },
  ],
  app_id: [
    {
      required: true,
      type: "number",
      min: 1,
      message: t("message.sdk.payConfig.placeholderGameId"),
      trigger: "blur",
    },
  ],
  channel_code: [
    { required: true, message: t("message.sdk.payConfig.placeholderChannel"), trigger: "change" },
  ],
};

function fmt(ts: number) {
  return ts > 0
    ? new Date(ts * 1000).toLocaleString("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";
}

function onExtraInput(val: string) {
  form.extra_config = normalizeNewlines(val);
}

function goBack() {
  router.push(
    `/addon/pay/config/list?app_id=${form.app_id}&module=${form.module}&name=${gameName.value}`,
  );
}

async function loadChannels() {
  try {
    const res: any = await getPayChannelList({ page: 1, row: 200 });
    const d = res.data || res;
    channelOptions.value = (d.list || []).filter((ch: PayChannelItem) => ch.state === 1);
  } catch {
    channelOptions.value = [];
  }
}

async function loadData() {
  const id = Number(route.query.id);
  if (!id) {
    loadError.value = t("message.sdk.payConfig.editMissingId");
    loading.value = false;
    return;
  }
  try {
    const res: any = await getPayConfigDetail({ id });
    const d = res.data || res;
    const item = d.pay_config || d;
    if (!item || !item.id) {
      loadError.value = t("message.sdk.payConfig.editErrorNotFound");
      return;
    }
    Object.assign(form, item);
    fillExtraFields(item.extra_config);
  } catch {
    loadError.value = t("message.common.msgNetworkError");
  } finally {
    loading.value = false;
  }
}

async function onSubmit() {
  try {
    await formRef.value?.validate();
  } catch {
    return;
  }
  if (channelStructuredFields.value.length > 0) {
    form.extra_config = serializeExtraFields(channelStructuredFields.value, extraFields);
  }
  submitting.value = true;
  try {
    await editPayConfig({
      id: form.id,
      module: form.module,
      platform: form.platform,
      app_id: form.app_id,
      channel_code: form.channel_code,
      state: form.state,
      extra_config: form.extra_config,
    });
    ElMessage.success(t("message.common.msgSaveOk"));
    goBack();
  } finally {
    submitting.value = false;
  }
}

function onDelete() {
  ElMessageBox.confirm(
    t("message.sdk.payConfig.deleteConfirm", { code: form.channel_code }),
    t("message.common.confirmDeleteTitle"),
    { type: "warning" },
  )
    .then(async () => {
      await deletePayConfig({ ids: [form.id] });
      ElMessage.success(t("message.common.msgDeleteOk"));
      goBack();
    })
    .catch(() => {});
}

onMounted(() => {
  loadChannels();
  loadData();
});
onActivated(() => loadData());
watch(
  () => route.query.id,
  () => {
    if (route.query.id) loadData();
  },
);
</script>

<style scoped>
/* ═══════════════════════════════════════════
   Carbon & Gold — Payment Config Edit Form
   ═══════════════════════════════════════════ */

.pay-form {
  --gold: var(--cc-color-primary);
  --gold-light: var(--cc-color-primary-hover);
  --gold-bg: var(--cc-color-primary-softer);
  --gold-border: var(--cc-color-primary-soft);
  --slate: var(--cc-color-text-1);
  --slate-light: var(--cc-color-text-2);
  --surface: var(--cc-color-surface);
  --surface-raised: var(--cc-color-surface-hover);
  --border: var(--cc-color-border-light);
  --text: var(--cc-color-text-1);
  --text-secondary: var(--cc-color-text-3);
  --text-muted: var(--cc-color-text-4);
  --radius: var(--cc-radius-lg);
  --radius-sm: var(--cc-radius-md);
  max-width: 960px;
  margin: 0 auto;
}

/* ── Breadcrumb ── */
.pay-form__breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  font-size: 13px;
}
.pay-form__bc-link {
  color: var(--text-secondary);
  text-decoration: none;
  transition: color 0.2s;
}
.pay-form__bc-link:hover {
  color: var(--gold);
}
.pay-form__bc-sep {
  color: var(--text-muted);
}
.pay-form__bc-text {
  color: var(--text-secondary);
}
.pay-form__bc-current {
  color: var(--text);
  font-weight: 600;
}

/* ── Loading / Error ── */
.pay-form__loading,
.pay-form__error {
  text-align: center;
  padding: 80px 20px;
  color: var(--text-muted);
}
.pay-form__error h3 {
  color: var(--text);
  margin: 16px 0 8px;
  font-weight: 600;
}
.pay-form__error p {
  margin-bottom: 16px;
}
.pay-form__spin {
  animation: paySpin 1s linear infinite;
  color: var(--gold);
}
@keyframes paySpin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* ── Header ── */
.pay-form__header {
  margin-bottom: 24px;
  padding: 28px 32px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-left: 3px solid var(--gold);
  border-radius: var(--radius);
}

.pay-form__back {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  font-family: inherit;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  cursor: pointer;
  margin-bottom: 12px;
  padding: 0;
  transition: color 0.2s;
}
.pay-form__back:hover {
  color: var(--gold);
}

.pay-form__header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.pay-form__title {
  font-family: var(--cc-font-sans);
  font-size: 26px;
  font-weight: 700;
  letter-spacing: -0.025em;
  color: var(--slate);
  margin: 0 0 4px;
}

.pay-form__subtitle {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 6px;
}

.pay-form__id-badge {
  display: inline-block;
  padding: 2px 10px;
  background: var(--gold-bg);
  border-radius: 6px;
  font-family: "JetBrains Mono", "Fira Code", monospace;
  font-size: 13px;
  font-weight: 500;
  color: var(--gold);
}

.pay-form__module-tag {
  display: inline-block;
  padding: 1px 8px;
  background: var(--cc-color-info-soft);
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  color: var(--cc-color-info);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.pay-form__delete-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 500;
  color: var(--cc-color-danger);
  background: var(--cc-color-danger-soft);
  border: 1px solid var(--cc-color-danger-soft);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.2s;
}
.pay-form__delete-btn:hover {
  background: var(--cc-color-danger-soft);
  border-color: var(--cc-color-danger);
}

/* ── Form Card ── */
.pay-form__card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 36px 40px;
  box-shadow: var(--cc-shadow-sm);
}

/* ── Section ── */
.pay-form__section {
  margin-bottom: 32px;
}

.pay-form__section-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border);
}

.pay-form__section-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: var(--gold-bg);
  border-radius: var(--radius-sm);
  color: var(--gold);
  font-size: 14px;
}

.pay-form__section-title {
  font-family: var(--cc-font-sans);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--gold);
  margin: 0;
}

/* ── Grid ── */
.pay-form__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 24px;
}

/* ── Labels ── */
.pay-form__label {
  font-family: var(--cc-font-sans);
  font-size: 13px;
  font-weight: 500;
  color: var(--text);
}
.pay-form__req {
  color: var(--cc-color-danger);
  margin-left: 2px;
}
.pay-form__hint {
  display: block;
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 4px;
  line-height: 1.4;
}
.pay-form__hint code {
  background: var(--cc-color-surface-hover);
  padding: 1px 5px;
  border-radius: 3px;
  font-size: 11px;
}

/* ── Input Styling ── */
.pay-form__input {
  width: 100%;
}
.pay-form__card :deep(.el-form-item__label) {
  margin-bottom: 6px;
}
.pay-form__card :deep(.el-input__wrapper),
.pay-form__card :deep(.el-textarea__inner),
.pay-form__card :deep(.el-select .el-input__wrapper) {
  border-radius: var(--radius-sm);
  background: var(--surface-raised);
  box-shadow: none;
  border: 1px solid var(--border);
  transition:
    border-color 0.2s,
    background 0.2s,
    box-shadow 0.2s;
}
.pay-form__card :deep(.el-input__wrapper:hover),
.pay-form__card :deep(.el-textarea__inner:hover),
.pay-form__card :deep(.el-select .el-input__wrapper:hover) {
  background: var(--surface);
  border-color: var(--gold-border);
}
.pay-form__card :deep(.el-input__wrapper.is-focus),
.pay-form__card :deep(.el-textarea__inner:focus),
.pay-form__card :deep(.el-select .el-input__wrapper.is-focus) {
  background: var(--surface);
  border-color: var(--gold);
  box-shadow: 0 0 0 3px var(--cc-color-primary-softer);
}
.pay-form__card :deep(.el-input__inner),
.pay-form__card :deep(.el-textarea__inner) {
  font-family: var(--cc-font-sans);
  font-size: 14px;
  color: var(--text);
}
.pay-form__card :deep(.el-input__inner::placeholder) {
  color: var(--text-muted);
}

/* ── Monospace Fields ── */
.pay-form__mono :deep(.el-input__inner),
.pay-form__mono :deep(.el-textarea__inner) {
  font-family: "JetBrains Mono", "Fira Code", monospace !important;
  font-weight: 500;
  font-size: 13px;
}

/* ── Channel Option ── */
.pay-form__channel-option {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}
.pay-form__channel-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.pay-form__channel-code-tag {
  margin-left: auto;
  font-family: "JetBrains Mono", "Fira Code", monospace;
  font-size: 11px;
  font-weight: 500;
  color: var(--text-muted);
  background: var(--surface-raised);
  padding: 1px 6px;
  border-radius: 4px;
}

/* ── Extra Config Card ── */
.pay-form__extra-card {
  padding: 20px;
  background: var(--surface-raised);
  border: 1px solid var(--border);
  border-left: 3px solid var(--gold);
  border-radius: var(--radius-sm);
  width: 100%;
}

.pay-form__extra-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 1px dashed var(--border);
}

.pay-form__extra-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.pay-form__extra-title {
  font-family: var(--cc-font-sans);
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
}

.pay-form__extra-fields {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.pay-form__extra-item {
  margin-bottom: 4px;
}

/* ── Secret Icon ── */
.pay-form__secret-icon {
  color: var(--gold);
  margin-left: 4px;
  vertical-align: middle;
}
.pay-form__eye {
  cursor: pointer;
  color: var(--text-muted);
  transition: color 0.2s;
}
.pay-form__eye:hover {
  color: var(--gold);
}

/* ── Meta ── */
.pay-form__meta {
  display: flex;
  gap: 24px;
  padding: 12px 0 0;
  margin-bottom: 20px;
  border-top: 1px solid var(--border);
}
.pay-form__meta-item {
  font-family: var(--cc-font-sans);
  font-size: 12px;
  color: var(--text-muted);
}
.pay-form__meta-item b {
  color: var(--text-secondary);
  font-weight: 600;
}

/* ── Actions ── */
.pay-form__actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 24px;
  border-top: 1px solid var(--border);
}

.pay-form__submit {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 12px 28px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  color: var(--cc-color-primary);
  background: var(--cc-color-primary-softer);
  border: 1px solid var(--cc-color-primary-soft);
  border-radius: var(--radius-sm);
  cursor: pointer;
  box-shadow: none;
  transition: all 0.2s;
}
.pay-form__submit:hover:not(:disabled) {
  background: var(--cc-color-primary-soft);
  border-color: var(--cc-color-primary);
}
.pay-form__submit:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

/* ── Responsive ── */
@media (min-width: 1440px) {
  .pay-form {
    max-width: 1320px;
  }
  .pay-form__header {
    padding: 36px 44px;
  }
  .pay-form__card {
    padding: 40px 48px;
  }
}
@media (max-width: 768px) {
  .pay-form__header {
    padding: 20px;
  }
  .pay-form__header-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  .pay-form__card {
    padding: 20px 16px;
    border-radius: 10px;
  }
  .pay-form__grid {
    grid-template-columns: 1fr;
  }
  .pay-form__title {
    font-size: 20px;
  }
  .pay-form__actions {
    flex-direction: column-reverse;
  }
  .pay-form__submit,
  .pay-form__actions .el-button {
    width: 100%;
  }
}
</style>
