<template>
  <div class="ap-page">
    <el-breadcrumb separator="→">
      <el-breadcrumb-item :to="{ path: '/' }">
        <el-icon><HomeFilled /></el-icon> {{ t("breadcrumbHome") }}
      </el-breadcrumb-item>
      <el-breadcrumb-item>{{ t("breadcrumbSdk") }}</el-breadcrumb-item>
      <el-breadcrumb-item>{{ t("aiProviderTitle") }}</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="ap-header">
      <div>
        <h1 class="ap-title">{{ t("aiProviderTitle") }}</h1>
        <p class="ap-subtitle">{{ t("aiProviderSubtitle") }}</p>
      </div>
      <div class="ap-header-actions">
        <el-button size="large" @click="loadProviders">
          <el-icon><Refresh /></el-icon> {{ t("btnQuery") }}
        </el-button>
        <el-button type="primary" size="large" @click="openProviderDialog()">
          <el-icon><Plus /></el-icon> {{ t("btnNewProvider") }}
        </el-button>
      </div>
    </div>

    <el-alert
      v-if="!loading && providers.length === 0"
      type="info"
      :closable="false"
      show-icon
      class="ap-alert"
      :title="t('emptyProviders')"
    />

    <div class="ap-body">
      <!-- 左：供应商 -->
      <div class="ap-card ap-card-provider">
        <el-table
          :data="providers"
          border
          v-loading="loading"
          highlight-current-row
          :empty-text="t('noData')"
          @current-change="onSelectProvider"
        >
          <el-table-column prop="name" :label="t('colName')" min-width="140" />
          <el-table-column :label="t('colProtocol')" width="130">
            <template #default="{ row }">
              <el-tag size="small" effect="plain">{{ row.protocol }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="base_url" :label="t('colBaseUrl')" min-width="200" show-overflow-tooltip />
          <el-table-column :label="t('colKey')" width="90" align="center">
            <template #default="{ row }">
              <el-tag :type="row.has_credential ? 'success' : 'info'" size="small" effect="plain">
                {{ row.has_credential ? t("keySet") : t("keyUnset") }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column :label="t('colEnabled')" width="80" align="center">
            <template #default="{ row }">
              <el-tag :type="row.enabled ? 'success' : 'danger'" size="small" effect="plain">
                {{ row.enabled ? t("on") : t("off") }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column :label="t('colProbe')" width="150" show-overflow-tooltip>
            <template #default="{ row }">
              <span v-if="!row.last_probe_at" class="ap-muted">{{ t("probeNever") }}</span>
              <el-tag v-else :type="row.last_probe_ok ? 'success' : 'danger'" size="small" effect="plain">
                {{ row.last_probe_ok ? "OK" : "FAIL" }}
              </el-tag>
              <span v-if="row.last_probe_msg" class="ap-probe-msg">{{ row.last_probe_msg }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="t('colActions')" width="230" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" size="small" @click.stop="openProviderDialog(row)">
                {{ t("btnEdit") }}
              </el-button>
              <el-button link type="primary" size="small" :loading="busyId === row.id" @click.stop="onProbe(row)">
                {{ t("btnProbe") }}
              </el-button>
              <el-button link type="primary" size="small" :loading="busyId === row.id" @click.stop="onSync(row)">
                {{ t("btnSync") }}
              </el-button>
              <el-button link type="danger" size="small" @click.stop="onDeleteProvider(row)">
                {{ t("btnDelete") }}
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 右：选中供应商的模型 -->
      <div class="ap-card ap-card-model">
        <div class="ap-card-header">
          <span>
            {{ t("modelsOf") }}
            <strong v-if="selectedProvider">{{ selectedProvider.name }}</strong>
            <span v-else class="ap-muted">{{ t("selectProviderHint") }}</span>
          </span>
          <el-button size="small" :disabled="!selectedProvider" @click="openOrderDialog()">
            <el-icon><Sort /></el-icon> {{ t("btnOrder") }}
          </el-button>
          <el-button type="primary" size="small" :disabled="!selectedProvider" @click="openModelDialog()">
            <el-icon><Plus /></el-icon> {{ t("btnNewModel") }}
          </el-button>
        </div>

        <el-table
          :data="models"
          border
          v-loading="modelLoading"
          :empty-text="t('noModels')"
          class="ap-model-table"
        >
          <el-table-column prop="display_name" :label="t('colDisplayName')" min-width="150">
            <template #default="{ row }">
              {{ row.display_name }}
              <el-tag v-if="row.missing_since" type="warning" size="small" effect="plain" class="ap-tag">
                {{ t("missingTag") }}
              </el-tag>
              <!-- 系统自动下线：与运营手工 hidden 区分开，鼠标悬停给出理由 -->
              <el-tooltip v-if="row.auto_hidden" :content="row.hidden_reason || t('autoHiddenTag')" placement="top">
                <el-tag type="danger" size="small" effect="plain" class="ap-tag">{{ t("autoHiddenTag") }}</el-tag>
              </el-tooltip>
              <!-- 配置不全（缺能力参数/计费）：state 还是 available，但前台看不到它。
                   只看 state 的运营会以为"我明明上架了"，所以把缺口摊在这里。 -->
              <el-tooltip
                v-if="row.config_gaps && row.config_gaps.length"
                :content="configGapText(row)"
                placement="top"
              >
                <el-tag type="danger" size="small" class="ap-tag">{{ t("configGapTag") }}</el-tag>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column :label="t('normColFamily')" min-width="150">
            <template #default="{ row }">
              <template v-if="row.family">
                <el-tag size="small" effect="dark" type="warning">{{ row.family }}</el-tag>
                <el-tag v-if="row.is_default" size="small" effect="plain" class="ap-tag">{{ t("normIsDefaultTag") }}</el-tag>
              </template>
              <span v-else class="ap-muted">{{ t("normFamilyNone") }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="version_label" :label="t('normColVersion')" width="110" align="center">
            <template #default="{ row }">
              <span v-if="row.version_label">{{ row.version_label }}</span>
              <span v-else class="ap-muted">-</span>
            </template>
          </el-table-column>
          <el-table-column prop="upstream_id" :label="t('colUpstream')" min-width="200" show-overflow-tooltip />
          <el-table-column :label="t('colKind')" width="80" align="center">
            <template #default="{ row }">
              <el-tag size="small" effect="plain">{{ row.kind }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column :label="t('colSource')" width="90" align="center">
            <template #default="{ row }">
              <el-tag size="small" :type="row.source === 'pulled' ? 'success' : 'info'" effect="plain">
                {{ row.source }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column :label="t('colState')" width="100" align="center">
            <template #default="{ row }">
              <el-tag size="small" :type="row.state === 'available' ? 'success' : 'info'" effect="plain">
                {{ row.state }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column :label="t('colActions')" width="150" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" size="small" @click="openModelDialog(row)">
                {{ t("btnEdit") }}
              </el-button>
              <el-button link type="danger" size="small" @click="onDeleteModel(row)">
                {{ t("btnDelete") }}
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- 调整顺序：按前台条目（家族）上移/下移，服务端重排排序值 -->
    <el-dialog v-model="orderDialog" :title="t('orderTitle')" width="620px">
      <el-radio-group v-model="orderKind" class="ap-order-kind" @change="loadOrder">
        <el-radio-button value="image">{{ t("orderKindImage") }}</el-radio-button>
        <el-radio-button value="video">{{ t("orderKindVideo") }}</el-radio-button>
      </el-radio-group>
      <div class="ap-hint">{{ t("orderHint") }}</div>
      <el-table :data="orderList" v-loading="orderLoading" size="small" border max-height="420">
        <el-table-column type="index" width="46" align="center" />
        <el-table-column prop="name" :label="t('orderColEntry')" min-width="180">
          <template #default="{ row }">
            {{ row.name }}
            <el-tag v-if="row.versions > 1" size="small" effect="plain" class="ap-tag">
              {{ t("orderVersions", { n: row.versions }) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="key" :label="t('orderColKey')" min-width="140" show-overflow-tooltip />
        <el-table-column :label="t('colActions')" width="130" align="center">
          <template #default="{ $index }">
            <el-button link type="primary" size="small" :disabled="$index === 0" @click="moveOrder($index, 'up')">
              ↑
            </el-button>
            <el-button
              link
              type="primary"
              size="small"
              :disabled="$index === orderList.length - 1"
              @click="moveOrder($index, 'down')"
            >
              ↓
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <!-- 供应商表单 -->
    <el-dialog v-model="providerDialog" :title="providerForm.id ? t('btnEdit') : t('btnNewProvider')" width="640px">
      <el-form :model="providerForm" label-width="150px" label-position="right">
        <el-form-item :label="t('colName')" required>
          <el-input v-model="providerForm.name" :placeholder="t('phProviderName')" />
        </el-form-item>
        <el-form-item :label="t('colProtocol')" required>
          <el-select v-model="providerForm.protocol" :placeholder="t('phProtocol')" style="width: 100%">
            <el-option v-for="p in protocols" :key="p" :label="p" :value="p" />
          </el-select>
          <div class="ap-hint">{{ t("hintProtocol") }}</div>
        </el-form-item>
        <el-form-item :label="t('colBaseUrl')" required>
          <el-input v-model="providerForm.base_url" placeholder="https://api.openai.com" />
          <div class="ap-hint">{{ t("hintBaseUrl") }}</div>
        </el-form-item>
        <el-form-item :label="t('colKey')">
          <el-input
            v-model="providerForm.credential"
            type="password"
            show-password
            :placeholder="providerForm.id && providerForm.has_credential ? t('phKeyKeep') : t('phKey')"
          />
          <div class="ap-hint">{{ t("hintKey") }}</div>
        </el-form-item>
        <el-form-item :label="t('colModelListPath')">
          <el-input v-model="providerForm.model_list_path" placeholder="/v1/models" />
          <div class="ap-hint">{{ t("hintModelListPath") }}</div>
        </el-form-item>
        <el-form-item :label="t('colTimeout')">
          <el-input-number v-model="providerForm.timeout_ms" :min="1000" :step="10000" />
        </el-form-item>
        <el-form-item :label="t('colEnabled')">
          <el-switch v-model="providerForm.enabled" />
        </el-form-item>
        <el-form-item :label="t('colModelRemark')">
          <el-input v-model="providerForm.remark" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="providerDialog = false">{{ t("btnCancel") }}</el-button>
        <el-button type="primary" :loading="saving" @click="onSaveProvider">{{ t("btnSave") }}</el-button>
      </template>
    </el-dialog>

    <!-- 模型表单 -->
    <el-dialog v-model="modelDialog" :title="modelForm.id ? t('btnEdit') : t('btnNewModel')" width="680px">
      <el-form :model="modelForm" label-width="150px">
        <el-form-item :label="t('colDisplayName')" required>
          <el-input v-model="modelForm.display_name" :placeholder="t('phDisplayName')" />
          <div class="ap-hint">{{ t("hintDisplayName") }}</div>
        </el-form-item>
        <el-form-item :label="t('colUpstream')" required>
          <el-input v-model="modelForm.upstream_id" :placeholder="t('phUpstream')" />
          <div class="ap-hint">{{ t("hintUpstream") }}</div>
        </el-form-item>
        <el-form-item :label="t('colModelId')">
          <el-input v-model="modelForm.model_id" :disabled="!!modelForm.id" :placeholder="t('phModelId')" />
          <div class="ap-hint">{{ t("hintModelId") }}</div>
        </el-form-item>
        <el-form-item :label="t('normColFamily')">
          <el-input v-model="modelForm.family" :placeholder="t('normPhFamily')" />
          <div class="ap-hint">{{ t("normHintFamily") }}</div>
        </el-form-item>
        <el-form-item :label="t('normColVersion')">
          <el-input v-model="modelForm.version_label" :placeholder="t('normPhVersion')" />
          <div class="ap-hint">{{ t("normHintVersion") }}</div>
        </el-form-item>
        <el-form-item :label="t('normColIsDefault')">
          <el-switch v-model="modelForm.is_default" :disabled="!modelForm.family" />
          <span class="ap-hint" style="margin-left: 8px">{{ t("normHintIsDefault") }}</span>
        </el-form-item>
        <el-form-item :label="t('colKind')">
          <el-select v-model="modelForm.kind" style="width: 100%">
            <el-option label="image" value="image" />
            <el-option label="video" value="video" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('colState')">
          <el-select v-model="modelForm.state" style="width: 100%">
            <el-option :label="t('stateAvailable')" value="available" />
            <el-option :label="t('stateHidden')" value="hidden" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('colOutputFormat')">
          <el-select v-model="modelForm.output_format" clearable style="width: 100%">
            <el-option label="png" value="png" />
            <el-option label="jpeg" value="jpeg" />
            <el-option label="webp" value="webp" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('colAuthor')">
          <el-input v-model="modelForm.author" />
        </el-form-item>
        <el-form-item :label="t('colExcerpt')">
          <el-input v-model="modelForm.excerpt" />
        </el-form-item>
        <el-form-item :label="t('colSort')">
          <el-input-number v-model="modelForm.sort" :min="0" />
        </el-form-item>
        <el-form-item :label="t('colCapabilities')">
          <el-input v-model="capabilitiesText" type="textarea" :rows="4" placeholder='{"parameters":[...]}' />
          <div class="ap-hint">{{ t("hintJson") }}</div>
        </el-form-item>
        <el-form-item :label="t('colBilling')">
          <el-input v-model="billingText" type="textarea" :rows="3" placeholder='{"qualities":[...]}' />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="modelDialog = false">{{ t("btnCancel") }}</el-button>
        <el-button type="primary" :loading="saving" @click="onSaveModel">{{ t("btnSave") }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { ElMessage, ElMessageBox } from "element-plus";
import { HomeFilled, Refresh, Plus, Sort } from "@element-plus/icons-vue";
import {
  listAiProviders,
  saveAiProvider,
  deleteAiProvider,
  probeAiProvider,
  syncAiProvider,
  listAiModels,
  saveAiModel,
  deleteAiModel,
  listAiModelOrder,
  moveAiModelOrder,
  AiProviderItem,
  AiModelItem,
  AiModelEntry,
} from "/@/api/addon/aiProvider";

// 后台「AI 供应商与模型」页面。
//
// 这一页替代了此前散落的配置形态：过去每接一家上游要在 CMS 设置里加一组固定字段
// （字段名写死在 Go 代码里），现在供应商与模型都是库里的行 —— 接 xiaobai/xiaohei
// 只是在这里点「新建供应商」，不必改代码、不必发版。
//
// 两条前端必须守住的约定（与后端一致）：
//   1. 密钥只写不回。读取接口只给 has_credential；表单留空或全 `*` 表示不修改。
//   2. 「拉取上游模型」是**只补不覆盖**：已存在的模型不会丢掉运营改过的展示名与计费，
//      上游消失的模型只会被标记（页面显示 missing 角标），不会自动删除。
export default defineComponent({
  name: "addonPlatformAiProvider",
  components: { HomeFilled, Refresh, Plus },
  setup() {
    const { t: rawT } = useI18n();
    // 所有文案走 message.sdk.platform.ai* 命名空间。
    /**
     * i18n 包装：固定前缀 + **透传插值参数**。
     *
     * 必须透传：文案里的 `{n}` 是 vue-i18n 的具名插值，不传参数时它会被替换成空串
     * （"N 个版本" 渲染成 " 个版本"）—— 而这类缺失只体现在文案上，type-check 是过得去的。
     */
    const t = (key: string, params?: Record<string, unknown>) =>
      rawT(`message.sdk.platform.${key}`, params || {});

    /**
     * 配置缺口的悬停文案：先说结论（前台看不到它），再逐条列缺什么。
     *
     * 为什么要专门解释：这类模型的 state 是 available，运营在列表里看不出异常，
     * 只会在前台"找不到自己刚拉的模型"时来回问。
     */
    const configGapText = (row: AiModelItem) => {
      const lines = (row.config_gaps || []).map((g) => `· ${g.detail}`);
      return [t("configGapHint"), ...lines].join("\n");
    };

    const providers = ref<AiProviderItem[]>([]);
    const models = ref<AiModelItem[]>([]);
    const protocols = ref<string[]>([]);
    const selectedProvider = ref<AiProviderItem | null>(null);
    const loading = ref(false);
    const modelLoading = ref(false);
    const saving = ref(false);
    const busyId = ref<number | null>(null);

    const providerDialog = ref(false);
    const modelDialog = ref(false);
    const capabilitiesText = ref("");
    const billingText = ref("");

    const providerForm = reactive({
      id: 0,
      name: "",
      protocol: "",
      base_url: "",
      model_list_path: "",
      credential: "",
      enabled: true,
      timeout_ms: 300000,
      remark: "",
      has_credential: false,
    });

    const modelForm = reactive({
      id: 0,
      provider_id: 0,
      model_id: "",
      display_name: "",
      family: "",
      version_label: "",
      is_default: false,
      upstream_id: "",
      kind: "image",
      state: "available",
      author: "",
      excerpt: "",
      description: "",
      remark: "",
      output_format: "",
      sort: 0,
    });

    const loadProviders = async () => {
      loading.value = true;
      try {
        const res: any = await listAiProviders();
        const d = res.data || res;
        providers.value = d.list || [];
        protocols.value = d.protocols || [];
        // 刷新后保持选中项（否则运营每次改完都丢掉上下文）。
        if (selectedProvider.value) {
          const again = providers.value.find((p) => p.id === selectedProvider.value?.id);
          if (again) {
            selectedProvider.value = again;
            await loadModels(again.id);
          }
        }
      } finally {
        loading.value = false;
      }
    };

    const loadModels = async (providerId: number) => {
      modelLoading.value = true;
      try {
        const res: any = await listAiModels(providerId);
        const d = res.data || res;
        models.value = d.list || [];
      } finally {
        modelLoading.value = false;
      }
    };

    const onSelectProvider = async (row: AiProviderItem | null) => {
      selectedProvider.value = row;
      models.value = [];
      if (row) await loadModels(row.id);
    };

    const openProviderDialog = (row?: AiProviderItem) => {
      if (row) {
        Object.assign(providerForm, {
          id: row.id,
          name: row.name,
          protocol: row.protocol,
          base_url: row.base_url,
          model_list_path: row.model_list_path,
          credential: "",
          enabled: row.enabled,
          timeout_ms: row.timeout_ms || 300000,
          remark: row.remark,
          has_credential: row.has_credential,
        });
      } else {
        Object.assign(providerForm, {
          id: 0,
          name: "",
          protocol: protocols.value[0] || "",
          base_url: "",
          model_list_path: "",
          credential: "",
          enabled: true,
          timeout_ms: 300000,
          remark: "",
          has_credential: false,
        });
      }
      providerDialog.value = true;
    };

    const onSaveProvider = async () => {
      saving.value = true;
      try {
        await saveAiProvider({
          id: providerForm.id || undefined,
          name: providerForm.name,
          protocol: providerForm.protocol,
          base_url: providerForm.base_url,
          model_list_path: providerForm.model_list_path,
          // 留空即"不改密钥"（后端同样把全 `*` 当不改）。
          credential: providerForm.credential || undefined,
          enabled: providerForm.enabled,
          timeout_ms: providerForm.timeout_ms,
          remark: providerForm.remark,
        });
        ElMessage.success(t("saved"));
        providerDialog.value = false;
        await loadProviders();
      } catch (e: any) {
        ElMessage.error(e?.message || t("saveFailed"));
      } finally {
        saving.value = false;
      }
    };

    const onDeleteProvider = async (row: AiProviderItem) => {
      try {
        await ElMessageBox.confirm(t("confirmDeleteProvider").replace("{name}", row.name), {
          type: "warning",
        });
      } catch {
        return; // 用户取消
      }
      try {
        await deleteAiProvider(row.id);
        ElMessage.success(t("deleted"));
        if (selectedProvider.value?.id === row.id) {
          selectedProvider.value = null;
          models.value = [];
        }
        await loadProviders();
      } catch (e: any) {
        // 名下还有模型时后端会拒绝，把原话展示出来（含模型数量）。
        ElMessage.error(e?.message || t("deleteFailed"));
      }
    };

    const onProbe = async (row: AiProviderItem) => {
      busyId.value = row.id;
      try {
        const res: any = await probeAiProvider(row.id);
        const d = res.data || res;
        if (d.ok) ElMessage.success(d.message || t("probeOk"));
        else ElMessage.warning(d.message || t("probeFail"));
        await loadProviders();
      } catch (e: any) {
        ElMessage.error(e?.message || t("probeFail"));
      } finally {
        busyId.value = null;
      }
    };

    const onSync = async (row: AiProviderItem) => {
      busyId.value = row.id;
      try {
        const res: any = await syncAiProvider(row.id);
        const d: any = res.data || res;
        ElMessage.success(
          t("syncDone")
            .replace("{inserted}", String(d.inserted ?? 0))
            .replace("{existing}", String(d.existing ?? 0))
            .replace("{missing}", String(d.missing ?? 0)),
        );
        selectedProvider.value = row;
        await loadModels(row.id);
      } catch (e: any) {
        // 常见两种：协议不支持拉取（ARK）、上游凭据/网络问题。原话最有信息量。
        ElMessage.error(e?.message || t("syncFailed"));
      } finally {
        busyId.value = null;
      }
    };

    const openModelDialog = (row?: AiModelItem) => {
      if (!selectedProvider.value && !row) return;
      if (row) {
        Object.assign(modelForm, {
          id: row.id,
          provider_id: row.provider_id,
          model_id: row.model_id,
          display_name: row.display_name,
          family: row.family || "",
          version_label: row.version_label || "",
          is_default: !!row.is_default,
          upstream_id: row.upstream_id,
          kind: row.kind,
          state: row.state,
          author: row.author,
          excerpt: row.excerpt,
          description: row.description,
          remark: row.remark || "",
          output_format: row.output_format,
          sort: row.sort,
        });
        capabilitiesText.value = row.capabilities ? JSON.stringify(row.capabilities, null, 2) : "";
        billingText.value = row.billing ? JSON.stringify(row.billing, null, 2) : "";
      } else {
        Object.assign(modelForm, {
          id: 0,
          provider_id: selectedProvider.value?.id || 0,
          model_id: "",
          display_name: "",
          family: "",
          version_label: "",
          is_default: false,
          upstream_id: "",
          kind: "image",
          state: "available",
          author: "",
          excerpt: "",
          description: "",
          remark: "",
          output_format: "",
          sort: 0,
        });
        capabilitiesText.value = "";
        billingText.value = "";
      }
      modelDialog.value = true;
    };

    // parseJsonField 把 textarea 里的 JSON 解析成对象；留空返回 null（后端会写 NULL）。
    // 非法 JSON 交给调用方提示，不在这里静默吞掉 —— 静默吞会让运营以为保存成功了。
    const parseJsonField = (text: string): Record<string, any> | null => {
      const s = (text || "").trim();
      if (!s) return null;
      return JSON.parse(s);
    };

    const onSaveModel = async () => {
      let capabilities: Record<string, any> | null = null;
      let billing: Record<string, any> | null = null;
      try {
        capabilities = parseJsonField(capabilitiesText.value);
        billing = parseJsonField(billingText.value);
      } catch {
        ElMessage.error(t("jsonInvalid"));
        return;
      }
      saving.value = true;
      try {
        await saveAiModel({
          id: modelForm.id || undefined,
          provider_id: modelForm.provider_id,
          model_id: modelForm.model_id || undefined,
          display_name: modelForm.display_name,
          family: modelForm.family,
          version_label: modelForm.version_label,
          is_default: modelForm.is_default,
          upstream_id: modelForm.upstream_id,
          kind: modelForm.kind,
          state: modelForm.state,
          author: modelForm.author,
          excerpt: modelForm.excerpt,
          description: modelForm.description,
          remark: modelForm.remark,
          output_format: modelForm.output_format,
          sort: modelForm.sort,
          capabilities,
          billing,
        });
        ElMessage.success(t("saved"));
        modelDialog.value = false;
        await loadModels(modelForm.provider_id);
      } catch (e: any) {
        ElMessage.error(e?.message || t("saveFailed"));
      } finally {
        saving.value = false;
      }
    };

    const onDeleteModel = async (row: AiModelItem) => {
      try {
        await ElMessageBox.confirm(t("confirmDeleteModel").replace("{name}", row.display_name), {
          type: "warning",
        });
      } catch {
        return;
      }
      try {
        await deleteAiModel(row.id);
        ElMessage.success(t("deleted"));
        await loadModels(row.provider_id);
      } catch (e: any) {
        ElMessage.error(e?.message || t("deleteFailed"));
      }
    };

    /* ---------------- 调整顺序（按前台条目） ---------------- */

const orderDialog = ref(false);
const orderLoading = ref(false);
const orderKind = ref<"image" | "video">("image");
const orderList = ref<AiModelEntry[]>([]);

/** 打开时按当前供应商的 kind 预选，让运营少点一次。 */
function openOrderDialog() {
  const kinds = [...new Set(models.value.map((m) => m.kind).filter(Boolean))];
  if (kinds.length === 1) orderKind.value = kinds[0] as "image" | "video";
  orderDialog.value = true;
  void loadOrder();
}

async function loadOrder() {
  orderLoading.value = true;
  try {
    const res: any = await listAiModelOrder(orderKind.value);
    orderList.value = res.data?.list || [];
  } catch (e: any) {
    ElMessage.error(e?.message || t("orderLoadFailed"));
  } finally {
    orderLoading.value = false;
  }
}

/**
 * 上移/下移一位。
 *
 * 排序值由**服务端**重排：前端列表可能被供应商过滤过，在前端算"跟谁交换"会算错；
 * 而且历史数据里排序值全是 0，交换两个 0 等于没动 —— 所以这里只发"哪个条目、哪个方向"。
 */
async function moveOrder(index: number, dir: "up" | "down") {
  const entry = orderList.value[index];
  if (!entry) return;
  try {
    const res: any = await moveAiModelOrder(orderKind.value, entry.key, dir);
    orderList.value = res.data?.list || orderList.value;
  } catch (e: any) {
    ElMessage.error(e?.message || t("orderMoveFailed"));
  }
}

onMounted(() => loadProviders());

    return {
      t,
      configGapText,
      providers,
      models,
      protocols,
      selectedProvider,
      loading,
      modelLoading,
      saving,
      busyId,
      providerDialog,
      modelDialog,
      providerForm,
      modelForm,
      capabilitiesText,
      billingText,
      loadProviders,
      onSelectProvider,
      openProviderDialog,
      onSaveProvider,
      onDeleteProvider,
      onProbe,
      onSync,
      openModelDialog,
      onSaveModel,
      onDeleteModel,
      // 调整顺序（按前台条目）
      orderDialog,
      orderLoading,
      orderKind,
      orderList,
      openOrderDialog,
      loadOrder,
      moveOrder,
    };
  },
});
</script>

<style scoped>
.ap-page {
  max-width: 1600px;
  margin: 0 auto;
}
.ap-header {
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
.ap-header-actions {
  display: flex;
  gap: var(--cc-space-2);
}
.ap-title {
  font-family: var(--cc-font-sans);
  font-size: var(--cc-font-24);
  font-weight: 650;
  color: var(--cc-color-text-1);
  margin: 0 0 var(--cc-space-1);
  letter-spacing: -0.02em;
}
.ap-subtitle {
  font-family: var(--cc-font-sans);
  font-size: var(--cc-font-13);
  color: var(--cc-color-text-3);
  margin: 0;
}
.ap-alert {
  margin-bottom: var(--cc-space-4);
}
.ap-body {
  display: flex;
  flex-direction: column;
  gap: var(--cc-space-4);
}
.ap-card {
  background: var(--cc-color-surface);
  border: 1px solid var(--cc-color-border-light);
  border-radius: var(--cc-radius-xl);
  padding: var(--cc-space-5) var(--cc-space-6) var(--cc-space-3);
  box-shadow: var(--cc-shadow-sm);
}
.ap-card-model {
  padding-bottom: var(--cc-space-5);
}
.ap-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--cc-space-3);
  font-size: var(--cc-font-14);
  color: var(--cc-color-text-2);
}
.ap-muted {
  color: var(--cc-color-text-3);
  font-size: var(--cc-font-12);
}
.ap-probe-msg {
  display: block;
  font-size: var(--cc-font-11);
  color: var(--cc-color-text-3);
  margin-top: 2px;
}
.ap-tag {
  margin-left: var(--cc-space-1);
}
.ap-hint {
  font-size: var(--cc-font-11);
  color: var(--cc-color-text-3);
  line-height: 1.5;
  margin-top: 2px;
}
.ap-model-table {
  font-size: var(--cc-font-13);
}
@media (max-width: 768px) {
  .ap-header {
    flex-direction: column;
    align-items: flex-start;
    padding: var(--cc-space-5);
  }
  .ap-card {
    padding: var(--cc-space-3) var(--cc-space-2);
    overflow-x: auto;
  }
}
</style>
