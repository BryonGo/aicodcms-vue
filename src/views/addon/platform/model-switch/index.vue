<template>
  <div class="pf-page">
    <el-breadcrumb separator="→">
      <el-breadcrumb-item :to="{ path: '/' }"
        ><el-icon><HomeFilled /></el-icon>
        {{ $t("message.sdk.platform.breadcrumbHome") }}</el-breadcrumb-item
      >
      <el-breadcrumb-item>{{
        $t("message.sdk.platform.breadcrumbSdk")
      }}</el-breadcrumb-item>
      <el-breadcrumb-item>{{
        $t("message.sdk.platform.modelSwitchTitle")
      }}</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="pf-header">
      <div>
        <h1 class="pf-title">
          {{ $t("message.sdk.platform.modelSwitchTitle") }}
        </h1>
        <p class="pf-subtitle">
          {{ $t("message.sdk.platform.modelSwitchSubtitle") }}
        </p>
      </div>
    </div>

    <div class="pf-filter-card">
      <el-form :inline="true" @submit.prevent>
        <el-form-item :label="$t('message.sdk.platform.colKind')">
          <el-select
            v-model="q.kind"
            style="width: 150px"
            @change="onFilterKindChange"
          >
            <el-option :label="$t('message.sdk.platform.kindAll')" value="" />
            <el-option
              :label="$t('message.sdk.platform.kindImage')"
              value="image"
            />
            <el-option
              :label="$t('message.sdk.platform.kindVideo')"
              value="video"
            />
            <el-option
              :label="$t('message.sdk.platform.kindCloud')"
              value="cloud"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('message.sdk.platform.filterType')">
          <el-select
            v-model="q.type"
            clearable
            style="width: 150px"
            :placeholder="$t('message.sdk.platform.typeAll')"
          >
            <el-option
              v-for="t in facets.types"
              :key="t"
              :label="t"
              :value="t"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('message.sdk.platform.filterFamily')">
          <el-select
            v-model="q.family"
            clearable
            filterable
            style="width: 190px"
            :placeholder="$t('message.sdk.platform.familyAll')"
          >
            <el-option
              v-for="f in facets.families"
              :key="f"
              :label="f"
              :value="f"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('message.sdk.platform.filterEngine')">
          <el-select
            v-model="q.engine"
            clearable
            style="width: 140px"
            :placeholder="$t('message.sdk.platform.engineAll')"
          >
            <el-option
              v-for="e in facets.engines"
              :key="e"
              :label="e"
              :value="e"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('message.sdk.platform.colName')">
          <el-input
            v-model="q.query"
            :placeholder="$t('message.sdk.platform.colName')"
            clearable
            style="width: 190px"
            @keyup.enter="onQuery"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onQuery">{{
            $t("message.sdk.platform.btnQuery")
          }}</el-button>
          <el-button @click="onReset">{{
            $t("message.sdk.platform.btnReset")
          }}</el-button>
        </el-form-item>
      </el-form>

      <div class="pf-batch-bar">
        <span class="pf-batch-count">{{
          $t("message.sdk.platform.batchSelected", { n: selection.length })
        }}</span>
        <el-radio-group v-model="batchScope" size="small">
          <el-radio-button value="selected">{{
            $t("message.sdk.platform.batchScopeSelected")
          }}</el-radio-button>
          <el-radio-button value="filtered">{{
            $t("message.sdk.platform.batchScopeFiltered")
          }}</el-radio-button>
        </el-radio-group>
        <el-button type="success" plain size="small" @click="onBatch(true)">
          {{ $t("message.sdk.platform.batchEnable") }}
        </el-button>
        <el-button type="danger" plain size="small" @click="onBatch(false)">
          {{ $t("message.sdk.platform.batchDisable") }}
        </el-button>
        <span v-if="batchScope === 'filtered'" class="pf-batch-hint">
          {{ $t("message.sdk.platform.batchFilteredHint") }}
        </span>
      </div>
    </div>

    <div class="pf-table-card">
      <el-table
        ref="tableRef"
        :data="tableData"
        border
        v-loading="loading"
        class="pf-table"
        row-key="modelId"
        :empty-text="$t('message.sdk.platform.noData')"
        @selection-change="onSelectionChange"
      >
        <el-table-column type="selection" width="46" reserve-selection />
        <el-table-column
          prop="kind"
          :label="$t('message.sdk.platform.colKind')"
          width="84"
          align="center"
        />
        <el-table-column
          prop="modelId"
          :label="$t('message.sdk.platform.colModelId')"
          width="190"
          show-overflow-tooltip
        >
          <template #default="{ row }"
            ><span class="pf-mono">{{ row.modelId }}</span></template
          >
        </el-table-column>
        <el-table-column
          :label="$t('message.sdk.platform.colName')"
          min-width="220"
        >
          <template #default="{ row }">
            <div class="pf-name-cell">
              <el-image
                v-if="row.cover"
                :src="row.cover"
                class="pf-cover"
                fit="cover"
              >
                <template #error><span class="pf-cover-fallback" /></template>
              </el-image>
              <div class="pf-name-text">
                <span>{{ row.name }}</span>
                <el-tag
                  v-if="row.hasOverride"
                  size="small"
                  effect="plain"
                  type="warning"
                  round
                >
                  {{ $t("message.sdk.platform.overrideYes") }}
                </el-tag>
              </div>
            </div>
            <div v-if="row.summary" class="pf-summary">{{ row.summary }}</div>
          </template>
        </el-table-column>
        <el-table-column
          prop="type"
          :label="$t('message.sdk.platform.colType')"
          width="100"
        />
        <el-table-column
          prop="family"
          :label="$t('message.sdk.platform.colFamily')"
          width="140"
          show-overflow-tooltip
        />
        <el-table-column
          prop="engine"
          :label="$t('message.sdk.platform.colEngine')"
          width="100"
        />
        <el-table-column
          :label="$t('message.sdk.platform.colStatus')"
          width="86"
          align="center"
        >
          <template #default="{ row }">
            <el-tag
              :type="row.enabled ? 'success' : 'info'"
              size="small"
              effect="plain"
              round
            >
              {{
                row.enabled
                  ? $t("message.sdk.platform.enabled")
                  : $t("message.sdk.platform.disabled")
              }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="reason"
          :label="$t('message.sdk.platform.colReason')"
          min-width="140"
          show-overflow-tooltip
        />
        <el-table-column
          :label="$t('message.sdk.platform.colUpdatedAt')"
          width="170"
        >
          <template #default="{ row }">{{ fmtTime(row.updatedAt) }}</template>
        </el-table-column>
        <el-table-column
          :label="$t('message.sdk.platform.colOp')"
          width="170"
          align="center"
          fixed="right"
        >
          <template #default="{ row }">
            <el-button
              v-if="row.enabled"
              type="danger"
              link
              size="small"
              @click="onDisable(row)"
            >
              {{ $t("message.sdk.platform.btnDisable") }}
            </el-button>
            <el-button
              v-else
              type="primary"
              link
              size="small"
              @click="onEnable(row)"
            >
              {{ $t("message.sdk.platform.btnEnable") }}
            </el-button>
            <el-button
              type="warning"
              link
              size="small"
              @click="onEditMeta(row)"
            >
              {{ $t("message.sdk.platform.btnEditMeta") }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pf-footer">
        <pagination
          v-model:page="page"
          v-model:limit="size"
          :total="total"
          @change="loadData"
        />
      </div>
    </div>

    <ProDrawer
      v-model="metaVisible"
      :title="$t('message.sdk.platform.metaTitle')"
      :subtitle="$t('message.sdk.platform.metaHint')"
      size="md"
      :destroy-on-close="true"
    >
      <el-form label-position="top">
        <el-form-item :label="$t('message.sdk.platform.colModelId')">
          <span class="pf-mono">{{ metaForm.modelId }}</span>
        </el-form-item>
        <el-form-item :label="$t('message.sdk.platform.metaFieldTitle')">
          <div class="pf-field">
            <el-input
              v-model="metaForm.title"
              maxlength="64"
              show-word-limit
              clearable
            />
            <p class="pf-default-hint">
              {{
                $t("message.sdk.platform.metaDefault", {
                  v: metaRow?.defaultName || metaEmptyText,
                })
              }}
            </p>
          </div>
        </el-form-item>
        <el-form-item :label="$t('message.sdk.platform.metaFieldSummary')">
          <div class="pf-field">
            <el-input
              v-model="metaForm.summary"
              type="textarea"
              :rows="3"
              maxlength="200"
              show-word-limit
            />
            <p class="pf-default-hint">
              {{
                $t("message.sdk.platform.metaDefault", {
                  v: metaRow?.defaultSummary || metaEmptyText,
                })
              }}
            </p>
          </div>
        </el-form-item>
        <el-form-item :label="$t('message.sdk.platform.metaFieldCover')">
          <div class="pf-field">
            <div class="pf-cover-edit">
              <img
                v-if="metaForm.cover"
                :src="coverPreview"
                class="pf-cover-preview"
                alt="icon"
              />
              <div v-else class="pf-cover-empty">
                {{ $t("message.sdk.platform.coverEmpty") }}
              </div>
              <div class="pf-cover-actions">
                <ProUpload
                  v-model="metaForm.cover"
                  :action="coverUploadAction"
                  mode="file"
                  accept="image/*"
                  :limit="1"
                  response-url-key="data.path"
                  :button-text="$t('message.sdk.platform.coverUpload')"
                  :tip="$t('message.sdk.platform.coverTip')"
                />
                <el-input
                  v-model="metaForm.cover"
                  clearable
                  :placeholder="$t('message.sdk.platform.coverUrlHint')"
                />
              </div>
            </div>
            <p class="pf-default-hint">
              {{
                $t("message.sdk.platform.metaDefault", {
                  v: metaRow?.defaultCover || metaEmptyText,
                })
              }}
            </p>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button :disabled="!metaRow?.hasOverride" @click="onResetMeta">
          {{ $t("message.sdk.platform.metaReset") }}
        </el-button>
        <el-button @click="metaVisible = false">
          {{ $t("message.common.btnCancel") }}
        </el-button>
        <el-button type="primary" :loading="metaSaving" @click="onSaveMeta">
          {{ $t("message.common.btnSave") }}
        </el-button>
      </template>
    </ProDrawer>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  reactive,
  computed,
  onMounted,
  onActivated,
} from "vue";
import { HomeFilled } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useI18n } from "vue-i18n";
import type { TableInstance } from "element-plus";
import ProDrawer from "/@/components/pro/ProDrawer.vue";
import ProUpload from "/@/components/pro/ProUpload.vue";
import { buildApiUrl, getUpFileUrl } from "/@/utils/aicodcod";
import {
  getPlatformModelSwitches,
  getPlatformModelSwitchFacets,
  setPlatformModelSwitch,
  batchSetPlatformModelSwitches,
  setPlatformModelMeta,
  resetPlatformModelMeta,
  AdminModelSwitchItem,
} from "/@/api/addon/platform";

export default defineComponent({
  name: "addonPlatformModelSwitch",
  components: { HomeFilled, ProDrawer, ProUpload },
  setup() {
    const { t } = useI18n();
    const tableRef = ref<TableInstance>();
    const tableData = ref<AdminModelSwitchItem[]>([]);
    const selection = ref<AdminModelSwitchItem[]>([]);
    const loading = ref(false);
    const page = ref(1);
    const size = ref(50);
    const total = ref(0);
    const q = reactive<{
      kind: string;
      type: string;
      family: string;
      engine: string;
      query: string;
    }>({
      kind: "",
      type: "",
      family: "",
      engine: "",
      query: "",
    });
    const facets = reactive<{
      types: string[];
      families: string[];
      engines: string[];
    }>({
      types: [],
      families: [],
      engines: [],
    });
    const batchScope = ref<"selected" | "filtered">("selected");

    const metaVisible = ref(false);
    const metaSaving = ref(false);
    const metaRow = ref<AdminModelSwitchItem | null>(null);
    const metaForm = reactive<{
      kind: string;
      modelId: string;
      title: string;
      summary: string;
      cover: string;
    }>({
      kind: "",
      modelId: "",
      title: "",
      summary: "",
      cover: "",
    });
    const metaEmptyText = t("message.sdk.platform.metaEmpty");

    const fmtTime = (ts: number) =>
      ts ? new Date(ts * 1000).toLocaleString() : "-";

    // 图标上传：走站点对象存储（与其它模块同一个上传接口，ProUpload 会自动带上 Authorization）
    const coverUploadAction = buildApiUrl("/api/v1/addon/upload");
    // 预览用**生效值**：已改写用改写值，没改写就显示模型自带的图标（这样运营看得见现状再决定要不要换）。
    // 注意 metaForm.cover 只在「真的要改写」时才有值，避免把默认值抄成覆盖。
    const coverPreview = computed(() =>
      getUpFileUrl(metaForm.cover || metaRow.value?.cover || ""),
    );

    const loadFacets = async () => {
      try {
        const res: any = await getPlatformModelSwitchFacets(q.kind);
        const d = res.data || res;
        facets.types = d.types || [];
        facets.families = d.families || [];
        facets.engines = d.engines || [];
      } catch {
        facets.types = [];
        facets.families = [];
        facets.engines = [];
      }
    };

    const loadData = async () => {
      loading.value = true;
      try {
        const res: any = await getPlatformModelSwitches({
          kind: q.kind,
          type: q.type,
          family: q.family,
          engine: q.engine,
          query: q.query,
          page: page.value,
          pageSize: size.value,
        });
        const d = res.data || res;
        tableData.value = d.items || [];
        total.value = d.total || 0;
      } finally {
        loading.value = false;
      }
    };

    const reload = async () => {
      await loadFacets();
      await loadData();
    };

    const onQuery = () => {
      page.value = 1;
      loadData();
    };
    const onFilterKindChange = () => {
      // 类别变了，type/family/engine 的可选项也变；旧值可能不再存在，直接清空避免查出空列表。
      q.type = "";
      q.family = "";
      q.engine = "";
      selection.value = [];
      tableRef.value?.clearSelection();
      page.value = 1;
      reload();
    };
    const onReset = () => {
      q.kind = "";
      q.type = "";
      q.family = "";
      q.engine = "";
      q.query = "";
      batchScope.value = "selected";
      selection.value = [];
      tableRef.value?.clearSelection();
      page.value = 1;
      reload();
    };

    const onSelectionChange = (rows: AdminModelSwitchItem[]) => {
      selection.value = rows;
    };

    // 停用必须填写原因（后端留审计），原因为空直接拦下不发请求
    const onDisable = (row: AdminModelSwitchItem) => {
      ElMessageBox.prompt(
        t("message.sdk.platform.disableReason"),
        t("message.sdk.platform.btnDisable"),
        {
          type: "warning",
          inputPlaceholder: t("message.sdk.platform.disableReason"),
          inputValidator: (value: string) =>
            (value || "").trim()
              ? true
              : t("message.sdk.platform.disableReasonRequired"),
        },
      )
        .then(async ({ value }) => {
          const reason = (value || "").trim();
          if (!reason) return;
          const res: any = await setPlatformModelSwitch({
            kind: row.kind,
            modelId: row.modelId,
            enabled: false,
            reason,
          });
          const d = res.data || res;
          if (d && typeof d === "object") Object.assign(row, d);
          ElMessage.success(t("message.sdk.platform.switchOk"));
          await loadData();
        })
        .catch(() => {});
    };

    const onEnable = (row: AdminModelSwitchItem) => {
      ElMessageBox.confirm(
        `${t("message.sdk.platform.btnEnable")} ${row.name || row.modelId}?`,
        {
          type: "warning",
        },
      )
        .then(async () => {
          const res: any = await setPlatformModelSwitch({
            kind: row.kind,
            modelId: row.modelId,
            enabled: true,
          });
          const d = res.data || res;
          if (d && typeof d === "object") Object.assign(row, d);
          ElMessage.success(t("message.sdk.platform.switchOk"));
          await loadData();
        })
        .catch(() => {});
    };

    /**
     * 批量启停。
     *
     * 范围=已勾选：只发 ids。勾选行同属一个类别时顺带带上 kind；跨类别或「全部类别」视图
     * 不带 kind —— 后端会按 id 反查类别（早先在「全部类别」下直接 return，导致按钮点了没反应）。
     * 范围=当前筛选：回传与列表同一套筛选条件，后端按同一 match 挑选。
     */
    const onBatch = (enabled: boolean) => {
      const payload: any = { enabled };
      if (batchScope.value === "selected") {
        if (!selection.value.length) {
          ElMessage.warning(t("message.sdk.platform.batchNeedScope"));
          return;
        }
        payload.ids = selection.value.map((r) => r.modelId);
        const kinds = [...new Set(selection.value.map((r) => r.kind))];
        if (kinds.length === 1) payload.kind = kinds[0];
      } else {
        if (!q.kind && !q.type && !q.family && !q.engine && !q.query) {
          ElMessage.warning(t("message.sdk.platform.batchNeedCond"));
          return;
        }
        if (q.kind) payload.kind = q.kind;
        payload.type = q.type;
        payload.family = q.family;
        payload.engine = q.engine;
        payload.query = q.query;
      }
      const count =
        batchScope.value === "selected" ? selection.value.length : total.value;
      const run = async (reason: string) => {
        const res: any = await batchSetPlatformModelSwitches({
          ...payload,
          reason,
        });
        const d = res.data || res;
        const n = d.updated ?? 0;
        const skipped = d.skipped ?? 0;
        ElMessage.success(
          skipped > 0
            ? t("message.sdk.platform.batchResultSkipped", { n, m: skipped })
            : t("message.sdk.platform.batchResult", { n }),
        );
        selection.value = [];
        tableRef.value?.clearSelection();
        await loadData();
      };
      if (enabled) {
        ElMessageBox.confirm(
          t("message.sdk.platform.batchEnableConfirm", { n: count }),
          {
            type: "warning",
          },
        )
          .then(() => run(""))
          .catch(() => {});
        return;
      }
      ElMessageBox.prompt(
        t("message.sdk.platform.batchDisableReason"),
        t("message.sdk.platform.batchDisableTitle"),
        {
          type: "warning",
          inputPlaceholder: t("message.sdk.platform.disableReason"),
          inputValidator: (value: string) =>
            (value || "").trim()
              ? true
              : t("message.sdk.platform.disableReasonRequired"),
        },
      )
        .then(({ value }) => run((value || "").trim()))
        .catch(() => {});
    };

    const onEditMeta = (row: AdminModelSwitchItem) => {
      metaRow.value = row;
      metaForm.kind = row.kind;
      metaForm.modelId = row.modelId;
      // 覆盖值优先；未覆盖时留空，placeholder 提示静态默认值 —— 避免把默认值「抄」成覆盖。
      metaForm.title = row.hasOverride ? row.name : "";
      metaForm.summary = row.hasOverride ? row.summary : "";
      metaForm.cover = row.hasOverride ? row.cover : "";
      metaVisible.value = true;
    };

    const onSaveMeta = async () => {
      metaSaving.value = true;
      try {
        const res: any = await setPlatformModelMeta({ ...metaForm });
        const d = res.data || res;
        if (metaRow.value && d && typeof d === "object")
          Object.assign(metaRow.value, d);
        ElMessage.success(t("message.sdk.platform.metaSaved"));
        metaVisible.value = false;
        await loadData();
      } finally {
        metaSaving.value = false;
      }
    };

    const onResetMeta = () => {
      if (!metaRow.value) return;
      ElMessageBox.confirm(
        t("message.sdk.platform.metaResetConfirm"),
        t("message.sdk.platform.metaReset"),
        {
          type: "warning",
        },
      )
        .then(async () => {
          const res: any = await resetPlatformModelMeta({
            kind: metaForm.kind,
            modelId: metaForm.modelId,
          });
          const d = res.data || res;
          if (metaRow.value && d && typeof d === "object")
            Object.assign(metaRow.value, d);
          ElMessage.success(t("message.sdk.platform.metaResetOk"));
          metaVisible.value = false;
          await loadData();
        })
        .catch(() => {});
    };

    onMounted(() => reload());
    onActivated(() => reload());

    return {
      tableRef,
      tableData,
      selection,
      loading,
      page,
      size,
      total,
      q,
      facets,
      batchScope,
      metaVisible,
      metaSaving,
      metaRow,
      metaForm,
      metaEmptyText,
      coverUploadAction,
      coverPreview,
      fmtTime,
      loadData,
      onQuery,
      onReset,
      onFilterKindChange,
      onSelectionChange,
      onDisable,
      onEnable,
      onBatch,
      onEditMeta,
      onSaveMeta,
      onResetMeta,
    };
  },
});
</script>

<style scoped>
.pf-page {
  max-width: 1400px;
  margin: 0 auto;
}
.pf-mono {
  font-family:
    "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
    monospace;
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
    radial-gradient(
      circle at 8% 0%,
      var(--cc-color-primary-softer),
      transparent 32%
    ),
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
.pf-batch-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--cc-space-3);
  padding: var(--cc-space-3) 0 var(--cc-space-4);
  border-top: 1px dashed var(--cc-color-border-light);
  margin-top: var(--cc-space-1);
}
.pf-batch-count {
  font-size: var(--cc-font-13);
  font-weight: 600;
  color: var(--cc-color-text-2);
}
.pf-batch-hint {
  font-size: var(--cc-font-12);
  color: var(--cc-color-text-3);
}
.pf-name-cell {
  display: flex;
  align-items: center;
  gap: var(--cc-space-2);
}
.pf-cover {
  width: 26px;
  height: 26px;
  border-radius: var(--cc-radius-sm);
  flex: none;
}
.pf-cover-fallback {
  display: block;
  width: 26px;
  height: 26px;
  border-radius: var(--cc-radius-sm);
  background: var(--cc-color-surface-hover);
  border: 1px dashed var(--cc-color-border-light);
}
.pf-name-text {
  display: flex;
  align-items: center;
  gap: var(--cc-space-2);
}
.pf-summary {
  font-size: var(--cc-font-12);
  color: var(--cc-color-text-3);
  margin-top: 2px;
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
/*
 * 固定列（Element Plus 的 sticky 右列）必须有**不透明**底色：
 * 半透明悬停色会让横向滚动到下面的单元格透出来，看起来像「停用旁边多出一个启用」。
 * 做法：底色先铺一层 surface（不透明），再把主色当 background-image 叠上去。
 */
.pf-table :deep(.el-table__cell.el-table-fixed-column--right) {
  background-color: var(--cc-color-surface);
}
.pf-table :deep(.el-table__row:hover > td.el-table__cell) {
  background-color: var(--cc-color-surface);
  background-image: linear-gradient(
    var(--cc-color-primary-softer),
    var(--cc-color-primary-softer)
  );
}
.pf-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: var(--cc-space-3);
  padding-top: var(--cc-space-3);
}
.pf-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
  min-width: 0;
}
.pf-field :deep(.el-textarea__inner) {
  width: 100%;
}
.pf-cover-edit {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  width: 100%;
}
.pf-cover-preview {
  width: 72px;
  height: 72px;
  border-radius: var(--cc-radius-md);
  object-fit: cover;
  border: 1px solid var(--cc-color-border-light);
  flex: none;
  background: var(--cc-color-surface-hover);
}
.pf-cover-empty {
  width: 72px;
  height: 72px;
  border-radius: var(--cc-radius-md);
  border: 1px dashed var(--cc-color-border);
  color: var(--cc-color-text-3);
  font-size: var(--cc-font-12);
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 4px;
  flex: none;
  line-height: 1.4;
}
.pf-cover-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  min-width: 0;
}
.pf-default-hint {
  font-size: var(--cc-font-12);
  color: var(--cc-color-text-3);
  line-height: 1.6;
  word-break: break-all;
}
.pf-dialog-hint {
  font-size: var(--cc-font-12);
  color: var(--cc-color-text-3);
  margin: 0;
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
