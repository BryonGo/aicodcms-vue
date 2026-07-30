<template>
  <div class="pay-form">
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
      <el-button type="primary" @click="emit('cancel')">{{ $t("message.common.back") }}</el-button>
    </div>

    <!-- 正常态 -->
    <div v-else class="pay-form__card">
      <el-form ref="fr" :model="form" :rules="rules" label-position="top" size="large">
        <!-- 模块绑定 -->
        <section class="pay-form__section">
          <div class="pay-form__section-header">
            <span class="pay-form__section-icon"><el-icon><Connection /></el-icon></span>
            <h3 class="pay-form__section-title">{{ $t("message.sdk.payConfig.sectionModule") }}</h3>
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
                :disabled="!form.module"
                class="pay-form__input"
                :placeholder="$t('message.sdk.payConfig.placeholderGameId')"
              />
            </el-form-item>
          </div>
        </section>

        <!-- 通道配置 -->
        <section class="pay-form__section">
          <div class="pay-form__section-header">
            <span class="pay-form__section-icon"><el-icon><Coin /></el-icon></span>
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
                      <!-- fetchable: 产品 ID 字段带「从 API 拉取」按钮，支持多选 -->
                      <template v-else-if="f.fetchable">
                        <div class="pay-form__fetch-row">
                          <el-input
                            v-model="extraFields[f.key]"
                            :placeholder="f.placeholder"
                            class="pay-form__mono"
                            clearable
                          >
                            <template #suffix>
                              <el-button
                                link
                                :icon="Search"
                                :loading="fetchingProducts"
                                size="small"
                                class="pay-form__fetch-btn"
                                :title="
                                  canFetch(f)
                                    ? t('message.sdk.payConfig.fetchProducts')
                                    : t('message.sdk.payConfig.fetchNeedApiKey')
                                "
                                :disabled="!canFetch(f)"
                                @click.stop="handleFetchProducts(f)"
                              />
                            </template>
                          </el-input>
                          <!-- 多选：已选产品标签 -->
                          <div
                            v-if="f.multiSelect && getSelectedProductIds(extraFields[f.key]).length > 0"
                            class="pay-form__selected-tags"
                          >
                            <span
                              v-for="pid in getSelectedProductIds(extraFields[f.key])"
                              :key="pid"
                              class="pay-form__selected-tag"
                            >
                              <span class="pay-form__selected-tag-text">{{ pid }}</span>
                              <el-icon
                                size="12"
                                class="pay-form__selected-tag-remove"
                                @click="removeSelectedProduct(pid, f.key)"
                                ><svg viewBox="0 0 12 12" fill="none"><path d="M3 3L9 9M9 3L3 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg></el-icon
                              >
                            </span>
                          </div>
                          <!-- 拉取结果下拉 -->
                          <div
                            v-if="fetchedProducts.length > 0 && activeFetchKey === f.key"
                            class="pay-form__product-dropdown"
                          >
                            <div class="pay-form__product-hint">
                              {{ f.multiSelect ? t("message.sdk.payConfig.selectProductMulti") : t("message.sdk.payConfig.selectProduct") }}
                            </div>
                            <div
                              v-for="p in fetchedProducts"
                              :key="p.product_id"
                              class="pay-form__product-item"
                              :class="{
                                'pay-form__product-item--active': isProductSelected(p, f.key),
                                'pay-form__product-item--multi': f.multiSelect,
                              }"
                              @click="selectProduct(p, f.key)"
                            >
                              <el-icon v-if="f.multiSelect" size="16" class="pay-form__product-check">
                                <svg v-if="isProductSelected(p, f.key)" viewBox="0 0 16 16" fill="currentColor"><path fill-rule="evenodd" d="M13.78 3.22a.75.75 0 010 1.06l-7 7a.75.75 0 01-1.06 0l-3-3a.75.75 0 011.06-1.06L6.25 9.69l6.47-6.47a.75.75 0 011.06 0z" clip-rule="evenodd"/></svg>
                                <svg v-else viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="1" width="14" height="14" rx="3"/></svg>
                              </el-icon>
                              <div class="pay-form__product-main">
                                <span class="pay-form__product-name">{{ p.name }}</span>
                                <span class="pay-form__product-id">{{ p.product_id }}</span>
                              </div>
                              <span v-if="formatProductPrice(p)" class="pay-form__product-price">{{
                                formatProductPrice(p)
                              }}</span>
                            </div>
                          </div>
                        </div>
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
        <div v-if="isEdit" class="pay-form__meta">
          <span class="pay-form__meta-item"><b>创建:</b> {{ fmt(form.created_at) }}</span>
          <span class="pay-form__meta-item"><b>更新:</b> {{ fmt(form.updated_at) }}</span>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  Loading,
  WarningFilled,
  Connection,
  Coin,
  Lock,
  View,
  Hide,
  Search,
} from "@element-plus/icons-vue";
import {
  addPayConfig,
  editPayConfig,
  getPayConfigDetail,
  deletePayConfig,
  getPayChannelList,
  getPayProductsByKey,
  PayChannelItem,
  type PayProductInfo,
} from "/@/api/addon/pay";
import {
  getChannelFields,
  parseExtraConfig,
  serializeExtraFields,
  normalizeNewlines,
  channelMeta,
  getDefaultExtraValues,
  type ExtraFieldDef,
} from "../channelSchema";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const props = defineProps<{
  mode: "add" | "edit";
  id?: number | string;
  appId?: number | string;
  module?: string;
}>();

const emit = defineEmits<{
  (e: "success"): void;
  (e: "deleted"): void;
  (e: "cancel"): void;
}>();

const isEdit = computed(() => props.mode === "edit");

const fr = ref();
const loading = ref(false);
const loadError = ref("");
const channelOptions = ref<PayChannelItem[]>([]);
const visibleFields = ref<Set<string>>(new Set());

// 加载数据时抑制 channel_code watcher，防止回写被覆盖
const loadingData = ref(false);

// ── 实时产品拉取 ──
const fetchingProducts = ref(false);
const fetchedProducts = ref<PayProductInfo[]>([]);
const activeFetchKey = ref("");

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

// 结构化扩展字段
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

/** 判断是否可拉取产品（需要 API Key 已填写） */
function canFetch(f: any): boolean {
  if (!f.fetchable) return false;
  const apiKeyField = f.fetchApiKeyField || "api_key";
  const apiKeyVal = (extraFields as any)[apiKeyField];
  return typeof apiKeyVal === "string" && apiKeyVal.trim().length > 0;
}

/** 从支付通道 API 实时拉取产品列表 */
async function handleFetchProducts(f: any) {
  if (fetchingProducts.value) return;

  const channelCode = form.channel_code;
  const apiKeyField = f.fetchApiKeyField || "api_key";
  const testModeField = f.fetchTestModeField || "test_mode";
  const testModeTrueValue = f.fetchTestModeTrueValue || "true";

  const apiKey = extraFields[apiKeyField] || "";
  const testModeRaw = extraFields[testModeField] || "false";
  const testMode = testModeRaw === testModeTrueValue;

  if (!apiKey.trim()) {
    ElMessage.warning(t("message.sdk.payConfig.fetchNeedApiKey"));
    return;
  }

  fetchingProducts.value = true;
  activeFetchKey.value = f.key;
  fetchedProducts.value = [];

  try {
    const res: any = await getPayProductsByKey({ channel_code: channelCode, api_key: apiKey, test_mode: testMode });
    const data = res.data || res;
    const products: PayProductInfo[] = data.products || [];
    fetchedProducts.value = products.filter((p) => p.status === "" || p.status === "active");
    if (fetchedProducts.value.length === 0) {
      ElMessage.info(t("message.sdk.payConfig.fetchNoProducts"));
    }
  } catch {
    ElMessage.error(t("message.sdk.payConfig.fetchFailed"));
    fetchedProducts.value = [];
  } finally {
    fetchingProducts.value = false;
  }
}

/** 获取当前 schema 中匹配 key 的字段定义 */
function getFieldDef(key: string) {
  return channelStructuredFields.value.find((f) => f.key === key) as ExtraFieldDef | undefined;
}

/** 多选：切换产品选中/取消 */
function selectProduct(p: PayProductInfo, key: string) {
  const f = getFieldDef(key);
  const isMulti = f?.multiSelect === true;
  const current = extraFields[key] || "";

  if (isMulti) {
    const ids = current
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const idx = ids.indexOf(p.product_id);
    if (idx >= 0) {
      ids.splice(idx, 1);
    } else {
      ids.push(p.product_id);
    }
    extraFields[key] = ids.join(",");
  } else {
    // 单选：点击即填入
    extraFields[key] = p.product_id;
    fetchedProducts.value = [];
    activeFetchKey.value = "";
  }
}

/** 多选：判断某产品是否已选中 */
function isProductSelected(p: PayProductInfo, key: string): boolean {
  const current = extraFields[key] || "";
  if (!current) return false;
  const ids = current.split(",").map((s) => s.trim()).filter(Boolean);
  return ids.includes(p.product_id);
}

/** 格式化产品价格显示 */
function formatProductPrice(p: PayProductInfo): string {
  if (p.price <= 0) return "";
  const cur = (p.currency || "USD").toUpperCase();
  return (p.price / 100).toFixed(2) + " " + cur;
}

/** 多选：解析已选产品 ID 列表 */
function getSelectedProductIds(val: string): string[] {
  if (!val) return [];
  return val.split(",").map((s) => s.trim()).filter(Boolean);
}

/** 多选：点击标签叉号移除单个产品 */
function removeSelectedProduct(pid: string, key: string) {
  const ids = getSelectedProductIds(extraFields[key]).filter((id) => id !== pid);
  extraFields[key] = ids.join(",");
}

function applyExtraFromJson(json: string) {
  Object.keys(extraFields).forEach((k) => delete extraFields[k]);
  const parsed = parseExtraConfig(json);
  // 先填 Schema 默认值，再填 JSON 中的实际值（JSON 数据优先）
  const defaults = getDefaultExtraValues(form.channel_code);
  Object.assign(extraFields, defaults, parsed);
}

/** 切换通道时：清空旧字段，填入新通道的 Schema 默认值 + JSON 数据 */
function fillExtraFields(json: string) {
  Object.keys(extraFields).forEach((k) => delete extraFields[k]);
  const defaults = getDefaultExtraValues(form.channel_code);
  const parsed = parseExtraConfig(json);
  Object.assign(extraFields, defaults, parsed);
}

watch(
  () => form.channel_code,
  (newCode, oldCode) => {
    // 加载数据时跳过 watcher，避免覆盖 loadData() 刚刚填好的值
    if (loadingData.value) return;
    // 仅在真正切换不同通道时才重构 extraFields
    if (newCode !== oldCode && newCode) {
      Object.keys(extraFields).forEach((k) => delete extraFields[k]);
      const defaults = getDefaultExtraValues(form.channel_code);
      const parsed = form.extra_config ? parseExtraConfig(form.extra_config) : {};
      Object.assign(extraFields, defaults, parsed);
    }
  },
);

watch(
  () => form.module,
  (val) => {
    if (val === "cms") form.app_id = 0;
  },
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
  const id = Number(props.id);
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
    loadingData.value = true;
    Object.assign(form, item);
    fillExtraFields(item.extra_config);
    loadingData.value = false;
  } catch {
    loadError.value = t("message.common.msgNetworkError");
  } finally {
    loading.value = false;
  }
}

const submit = async () => {
  try {
    await fr.value?.validate();
  } catch {
    return;
  }
  if (channelStructuredFields.value.length > 0) {
    form.extra_config = serializeExtraFields(channelStructuredFields.value, extraFields);
  }
  if (isEdit.value) {
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
  } else {
    await addPayConfig({
      module: form.module,
      platform: form.platform,
      app_id: form.app_id,
      channel_code: form.channel_code,
      state: form.state,
      extra_config: form.extra_config,
    });
    ElMessage.success(t("message.common.msgAddOk"));
  }
  emit("success");
};

const remove = async () => {
  try {
    await ElMessageBox.confirm(
      t("message.sdk.payConfig.deleteConfirm", { code: form.channel_code }),
      t("message.common.confirmDeleteTitle"),
      { type: "warning" },
    );
  } catch {
    return;
  }
  await deletePayConfig({ ids: [form.id] });
  ElMessage.success(t("message.common.msgDeleteOk"));
  emit("deleted");
};

onMounted(async () => {
  await loadChannels();
  if (isEdit.value && props.id) {
    loading.value = true;
    loadError.value = "";
    await loadData();
  } else {
    form.module = props.module || "game";
    form.app_id = props.appId ? Number(props.appId) : 0;
    form.channel_code = "";
  }
});

defineExpose({ submit, remove });
</script>

<style scoped>
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

/* ── 产品拉取 ── */
.pay-form__fetch-row {
  position: relative;
}
.pay-form__fetch-btn {
  padding: 2px 4px;
  font-size: 14px;
  color: var(--text-muted);
}
.pay-form__fetch-btn:hover {
  color: var(--gold);
}
.pay-form__fetch-btn.is-disabled {
  opacity: 0.3;
}
.pay-form__product-dropdown {
  position: absolute;
  left: 0;
  right: 0;
  top: 100%;
  margin-top: 4px;
  z-index: 100;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  box-shadow: var(--cc-shadow-lg);
  max-height: 260px;
  overflow-y: auto;
}
.pay-form__product-hint {
  padding: 8px 12px 4px;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.pay-form__product-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  cursor: pointer;
  transition: background 0.15s;
  border-bottom: 1px solid var(--border);
}
.pay-form__product-item:last-child {
  border-bottom: none;
}
.pay-form__product-item:hover {
  background: var(--gold-bg);
}
.pay-form__product-item--active {
  background: var(--gold-bg);
  border-left: 3px solid var(--gold);
}
.pay-form__product-main {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1;
}
.pay-form__product-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.pay-form__product-id {
  font-family: "JetBrains Mono", "Fira Code", monospace;
  font-size: 11px;
  color: var(--text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.pay-form__product-price {
  font-family: "JetBrains Mono", "Fira Code", monospace;
  font-size: 13px;
  font-weight: 600;
  color: var(--gold);
  margin-left: 16px;
  white-space: nowrap;
}

/* ── 多选产品标签 ── */
.pay-form__selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}
.pay-form__selected-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  background: var(--gold-bg);
  border: 1px solid var(--gold-border);
  border-radius: 4px;
  font-family: "JetBrains Mono", "Fira Code", monospace;
  font-size: 12px;
  color: var(--gold);
  line-height: 1.6;
}
.pay-form__selected-tag-text {
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.pay-form__selected-tag-remove {
  cursor: pointer;
  opacity: 0.6;
  flex-shrink: 0;
  color: var(--gold);
}
.pay-form__selected-tag-remove:hover {
  opacity: 1;
}

/* ── 多选复选图标 ── */
.pay-form__product-check {
  flex-shrink: 0;
  margin-right: 8px;
  color: var(--text-muted);
}
.pay-form__product-item--active .pay-form__product-check {
  color: var(--gold);
}
.pay-form__product-item--multi {
  padding: 10px 12px;
}
.pay-form__product-item--multi:hover {
  background: var(--gold-bg);
}
.pay-form__product-item--multi.pay-form__product-item--active {
  background: var(--gold-bg);
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

/* ── Responsive ── */
@media (max-width: 768px) {
  .pay-form__card {
    padding: 20px 16px;
    border-radius: 10px;
  }
  .pay-form__grid {
    grid-template-columns: 1fr;
  }
}
</style>
