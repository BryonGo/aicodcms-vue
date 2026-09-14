<template>
  <div class="pf-page">
    <el-breadcrumb separator="→">
      <el-breadcrumb-item :to="{ path: '/' }"
        ><el-icon><HomeFilled /></el-icon> {{ $t("message.sdk.platform.breadcrumbHome") }}</el-breadcrumb-item
      >
      <el-breadcrumb-item>{{ $t("message.sdk.platform.breadcrumbSdk") }}</el-breadcrumb-item>
      <el-breadcrumb-item>{{ $t("message.sdk.platform.promptsTitle") }}</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="pf-header">
      <div>
        <h1 class="pf-title">{{ $t("message.sdk.platform.promptsTitle") }}</h1>
        <p class="pf-subtitle">{{ $t("message.sdk.platform.promptsSubtitle") }}</p>
      </div>
      <el-button type="primary" plain @click="onExport">{{ $t("message.sdk.platform.btnExport") }}</el-button>
    </div>

    <!-- 概览 -->
    <div class="pf-stats">
      <div v-for="card in statCards" :key="card.key" class="pf-stat">
        <div class="pf-stat__value">{{ card.value }}</div>
        <div class="pf-stat__label">{{ card.label }}</div>
      </div>
    </div>

    <el-tabs v-model="tab" class="pf-tabs" @tab-change="onTabChange">
      <!-- ── 流水 ── -->
      <el-tab-pane :label="$t('message.sdk.platform.tabLogs')" name="logs">
        <div class="pf-filter-card">
          <el-form :inline="true" @submit.prevent>
            <el-form-item :label="$t('message.sdk.platform.colAccountId')">
              <el-input v-model="q.accountId" placeholder="accountId" clearable style="width: 180px" @keyup.enter="onQuery" />
            </el-form-item>
            <el-form-item :label="$t('message.sdk.platform.colProduct')">
              <el-select v-model="q.product" clearable style="width: 140px" :placeholder="$t('message.sdk.platform.promotedAll')">
                <el-option v-for="p in facets.products" :key="p.key" :label="p.label" :value="p.key" />
              </el-select>
            </el-form-item>
            <el-form-item :label="$t('message.sdk.platform.filterTool')">
              <el-select v-model="q.tool" clearable filterable style="width: 190px" :placeholder="$t('message.sdk.platform.promotedAll')">
                <el-option v-for="t in facets.tools" :key="t.key" :label="t.label" :value="t.key" />
              </el-select>
            </el-form-item>
            <el-form-item :label="$t('message.sdk.platform.filterTemplate')">
              <el-select v-model="q.template" clearable filterable style="width: 170px" :placeholder="$t('message.sdk.platform.promotedAll')">
                <el-option v-for="t in facets.templates" :key="t.key" :label="t.label" :value="t.key" />
              </el-select>
            </el-form-item>
            <el-form-item :label="$t('message.sdk.platform.colPrompt')">
              <el-input v-model="q.query" clearable style="width: 200px" @keyup.enter="onQuery" />
            </el-form-item>
            <el-form-item :label="$t('message.sdk.platform.filterTimeRange')">
              <el-date-picker
                v-model="q.range"
                type="daterange"
                value-format="x"
                style="width: 260px"
                :start-placeholder="$t('message.sdk.platform.filterTimeRange')"
                :end-placeholder="$t('message.sdk.platform.filterTimeRange')"
              />
            </el-form-item>
            <el-form-item>
              <el-checkbox v-model="q.favoritedOnly">{{ $t("message.sdk.platform.filterFavoritedOnly") }}</el-checkbox>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="onQuery">{{ $t("message.sdk.platform.btnQuery") }}</el-button>
              <el-button @click="onReset">{{ $t("message.sdk.platform.btnReset") }}</el-button>
            </el-form-item>
          </el-form>
        </div>

        <div class="pf-table-card">
          <el-table :data="logs" border v-loading="loading" class="pf-table" :empty-text="$t('message.sdk.platform.noData')">
            <el-table-column :label="$t('message.sdk.platform.colCreatedAt')" width="160">
              <template #default="{ row }"><span class="pf-mono">{{ fmtTime(row.createdAt) }}</span></template>
            </el-table-column>
            <el-table-column prop="accountId" :label="$t('message.sdk.platform.colAccountId')" width="170" show-overflow-tooltip>
              <template #default="{ row }"><span class="pf-mono">{{ row.accountId || "-" }}</span></template>
            </el-table-column>
            <el-table-column :label="$t('message.sdk.platform.colTool')" width="190" show-overflow-tooltip>
              <template #default="{ row }">
                <span v-if="row.tool">{{ row.tool }}</span>
                <span v-else class="pf-muted">-</span>
                <span v-if="row.template" class="pf-muted"> / {{ row.template }}</span>
              </template>
            </el-table-column>
            <el-table-column :label="$t('message.sdk.platform.colPrompt')" min-width="280">
              <template #default="{ row }">
                <div class="pf-prompt" :title="row.prompt">{{ row.prompt || $t("message.sdk.platform.promptEmpty") }}</div>
              </template>
            </el-table-column>
            <el-table-column :label="$t('message.sdk.platform.colReuseCount')" width="90" align="center">
              <template #default="{ row }">
                <el-tag v-if="row.reuseCount > 1" size="small" type="warning" effect="plain">{{ row.reuseCount }}</el-tag>
                <span v-else class="pf-muted">{{ row.reuseCount || 0 }}</span>
              </template>
            </el-table-column>
            <el-table-column :label="$t('message.sdk.platform.colFavoriteId')" width="90" align="center">
              <template #default="{ row }">
                <el-tag v-if="row.favoriteId" size="small" type="success" effect="plain">
                  {{ row.rating ? "★" + row.rating : "✓" }}
                </el-tag>
                <span v-else class="pf-muted">-</span>
              </template>
            </el-table-column>
            <el-table-column :label="$t('message.sdk.platform.colActions')" width="200" fixed="right" align="center">
              <template #default="{ row }">
                <el-button link type="primary" size="small" @click="openDetail(row)">
                  {{ $t("message.sdk.platform.btnDetail") }}
                </el-button>
                <el-button link type="primary" size="small" @click="openFavorite(row)">
                  {{ row.favoriteId ? $t("message.sdk.platform.btnEditFavorite") : $t("message.sdk.platform.btnFavorite") }}
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <div class="pf-footer">
            <el-pagination
              v-model:current-page="page"
              v-model:page-size="pageSize"
              :total="total"
              :page-sizes="[20, 50, 100, 200]"
              layout="total, sizes, prev, pager, next"
              @current-change="loadLogs"
              @size-change="onQuery"
            />
          </div>
        </div>
      </el-tab-pane>

      <!-- ── 精选池 ── -->
      <el-tab-pane :label="$t('message.sdk.platform.tabFavorites')" name="favorites">
        <div class="pf-filter-card">
          <el-form :inline="true" @submit.prevent>
            <el-form-item :label="$t('message.sdk.platform.filterPromoted')">
              <el-select v-model="fq.promoted" clearable style="width: 190px" :placeholder="$t('message.sdk.platform.promotedAll')">
                <el-option :label="$t('message.sdk.platform.promotedAll')" value="" />
                <el-option :label="$t('message.sdk.platform.promotedNone')" value="none" />
                <el-option
                  v-for="t in promoteTargets"
                  :key="t.key"
                  :label="t.label"
                  :value="t.key"
                />
              </el-select>
            </el-form-item>
            <el-form-item :label="$t('message.sdk.platform.colPrompt')">
              <el-input v-model="fq.query" clearable style="width: 220px" @keyup.enter="loadFavorites" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="onFavQuery">{{ $t("message.sdk.platform.btnQuery") }}</el-button>
              <el-button @click="onFavReset">{{ $t("message.sdk.platform.btnReset") }}</el-button>
            </el-form-item>
          </el-form>
        </div>

        <div class="pf-table-card">
          <el-table :data="favorites" border v-loading="favLoading" class="pf-table" :empty-text="$t('message.sdk.platform.noData')">
            <el-table-column :label="$t('message.sdk.platform.colTitle')" width="180" show-overflow-tooltip>
              <template #default="{ row }">{{ row.title || "-" }}</template>
            </el-table-column>
            <el-table-column :label="$t('message.sdk.platform.colPrompt')" min-width="280">
              <template #default="{ row }">
                <div class="pf-prompt" :title="row.prompt">{{ row.prompt }}</div>
              </template>
            </el-table-column>
            <el-table-column :label="$t('message.sdk.platform.colRating')" width="90" align="center">
              <template #default="{ row }">
                <span class="pf-mono">{{ row.rating ? "★".repeat(row.rating) : "-" }}</span>
              </template>
            </el-table-column>
            <el-table-column :label="$t('message.sdk.platform.colTags')" width="180" show-overflow-tooltip>
              <template #default="{ row }">
                <el-tag v-for="t in splitTags(row.tags)" :key="t" size="small" effect="plain" class="pf-tag">{{ t }}</el-tag>
                <span v-if="!row.tags" class="pf-muted">-</span>
              </template>
            </el-table-column>
            <el-table-column :label="$t('message.sdk.platform.colPromotedTo')" width="200" show-overflow-tooltip>
              <template #default="{ row }">
                <template v-if="row.promotedTo">
                  <el-tag size="small" type="success" effect="plain">{{ row.promotedTo }}</el-tag>
                  <div class="pf-muted pf-small">{{ row.promotedRef }}</div>
                </template>
                <span v-else class="pf-muted">{{ $t("message.sdk.platform.promotedNone") }}</span>
              </template>
            </el-table-column>
            <el-table-column :label="$t('message.sdk.platform.colActions')" width="230" fixed="right" align="center">
              <template #default="{ row }">
                <el-button link type="primary" size="small" @click="openFavoriteEdit(row)">
                  {{ $t("message.sdk.platform.btnEditFavorite") }}
                </el-button>
                <el-button link type="success" size="small" @click="openPromote(row)">
                  {{ $t("message.sdk.platform.btnPromote") }}
                </el-button>
                <el-button link type="danger" size="small" @click="onRemoveFavorite(row)">
                  {{ $t("message.sdk.platform.btnRemove") }}
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <div class="pf-footer">
            <el-pagination
              v-model:current-page="favPage"
              v-model:page-size="favPageSize"
              :total="favTotal"
              :page-sizes="[20, 50, 100, 200]"
              layout="total, sizes, prev, pager, next"
              @current-change="loadFavorites"
              @size-change="onFavQuery"
            />
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- ── 详情 ── -->
    <el-dialog v-model="detailVisible" :title="$t('message.sdk.platform.detailDialogTitle')" width="760px">
      <div v-if="detail" class="pf-detail">
        <div class="pf-detail__row"><span>{{ $t("message.sdk.platform.colAccountId") }}</span><b class="pf-mono">{{ detail.accountId }}</b></div>
        <div class="pf-detail__row"><span>{{ $t("message.sdk.platform.colTaskId") }}</span><b class="pf-mono">{{ detail.taskId }}</b></div>
        <div class="pf-detail__row"><span>{{ $t("message.sdk.platform.colSessionId") }}</span><b class="pf-mono">{{ detail.sessionId || "-" }}</b></div>
        <div class="pf-detail__row"><span>{{ $t("message.sdk.platform.colEngine") }}</span><b>{{ detail.product }} / {{ detail.type }} / {{ detail.engine || "-" }}</b></div>
        <div class="pf-detail__row"><span>{{ $t("message.sdk.platform.colModelId") }}</span><b>{{ detail.modelId || "-" }}</b></div>
        <div class="pf-detail__row"><span>{{ $t("message.sdk.platform.colTool") }}</span><b>{{ detail.tool || "-" }}<template v-if="detail.template"> / {{ detail.template }}</template></b></div>
        <div class="pf-detail__block">
          <div class="pf-detail__label">{{ $t("message.sdk.platform.colPrompt") }}</div>
          <pre class="pf-pre">{{ detail.prompt || $t("message.sdk.platform.promptEmpty") }}</pre>
        </div>
        <div class="pf-detail__block">
          <div class="pf-detail__label">{{ $t("message.sdk.platform.colFinalPrompt") }}</div>
          <pre class="pf-pre">{{ detail.finalPrompt || $t("message.sdk.platform.noFinalPrompt") }}</pre>
        </div>
        <div v-if="detail.negativePrompt" class="pf-detail__block">
          <div class="pf-detail__label">{{ $t("message.sdk.platform.colNegativePrompt") }}</div>
          <pre class="pf-pre">{{ detail.negativePrompt }}</pre>
        </div>
        <div class="pf-detail__block">
          <div class="pf-detail__label">{{ $t("message.sdk.platform.colParams") }}</div>
          <pre class="pf-pre">{{ JSON.stringify(detail.params || {}, null, 2) }}</pre>
        </div>
      </div>
    </el-dialog>

    <!-- ── 收藏 / 编辑精选 ── -->
    <el-dialog v-model="favVisible" :title="$t('message.sdk.platform.favoriteDialogTitle')" width="680px">
      <el-form label-width="120px">
        <el-form-item :label="$t('message.sdk.platform.colTitle')">
          <el-input v-model="favForm.title" maxlength="120" />
        </el-form-item>
        <el-form-item :label="$t('message.sdk.platform.fieldPrompt')">
          <el-input v-model="favForm.prompt" type="textarea" :rows="4" />
        </el-form-item>
        <el-form-item :label="$t('message.sdk.platform.colNegativePrompt')">
          <el-input v-model="favForm.negativePrompt" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item :label="$t('message.sdk.platform.fieldTool')">
          <el-input v-model="favForm.tool" style="width: 220px" />
        </el-form-item>
        <el-form-item :label="$t('message.sdk.platform.fieldTemplate')">
          <el-input v-model="favForm.template" style="width: 220px" />
        </el-form-item>
        <el-form-item :label="$t('message.sdk.platform.colTags')">
          <el-input v-model="favForm.tags" :placeholder="$t('message.sdk.platform.fieldTags')" />
        </el-form-item>
        <el-form-item :label="$t('message.sdk.platform.ratingHint')">
          <el-rate v-model="favForm.rating" :max="5" />
        </el-form-item>
        <el-form-item :label="$t('message.sdk.platform.colNote')">
          <el-input v-model="favForm.note" type="textarea" :rows="2" maxlength="512" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="favVisible = false">{{ $t("message.sdk.platform.btnCancel") }}</el-button>
        <el-button type="primary" :loading="saving" @click="onSaveFavorite">{{ $t("message.sdk.platform.btnSave") }}</el-button>
      </template>
    </el-dialog>

    <!-- ── 沉淀（表单由后端 fields 动态驱动）── -->
    <el-dialog v-model="promoteVisible" :title="$t('message.sdk.platform.promoteDialogTitle')" width="680px">
      <el-alert v-if="favRow" type="info" :closable="false" class="pf-alert">
        <div class="pf-prompt">{{ favRow.prompt }}</div>
      </el-alert>
      <el-form label-width="150px">
        <el-form-item :label="$t('message.sdk.platform.fieldTarget')" required>
          <el-select v-model="promoteForm.target" style="width: 100%" @change="onTargetChange">
            <el-option v-for="t in promoteTargets" :key="t.key" :label="t.label" :value="t.key" />
          </el-select>
        </el-form-item>
        <!--
          这一层刻意由 fields 驱动：后台不认识任何具体沉淀目标的字段名，
          产品新增一个沉淀目标时这里不用改。
        -->
        <el-form-item
          v-for="f in currentTargetFields"
          :key="f.key"
          :label="f.label"
          :required="f.required"
        >
          <el-select
            v-if="f.options && f.options.length"
            v-model="promoteForm.options[f.key]"
            filterable
            clearable
            style="width: 100%"
            :placeholder="f.placeholder"
          >
            <el-option
              v-for="o in f.options"
              :key="o.key"
              :label="o.count ? o.label + '  (' + o.count + ')' : o.label"
              :value="o.key"
            />
          </el-select>
          <el-input v-else v-model="promoteForm.options[f.key]" :placeholder="f.placeholder" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="promoteVisible = false">{{ $t("message.sdk.platform.btnCancel") }}</el-button>
        <el-button type="primary" :loading="promoting" @click="onPromote">{{ $t("message.sdk.platform.btnPromote") }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, computed, onMounted, onActivated } from "vue";
import { useI18n } from "vue-i18n";
import { HomeFilled } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  getPlatformPromptLogs,
  exportPlatformPromptLogs,
  getPlatformPromptFacets,
  getPlatformPromptStats,
  getPlatformPromptFavorites,
  savePlatformPromptFavorite,
  deletePlatformPromptFavorite,
  getPlatformPromptPromoteTargets,
  promotePlatformPromptFavorite,
  AdminPromptLogItem,
  AdminPromptFav,
  AdminPromptFacets,
  AdminPromptStats,
  AdminPromptTarget,
} from "/@/api/addon/platform";

/** request 封装在不同版本里可能已解包，这里统一兜一层（与同目录 tasks 页一致）。 */
const unwrap = (res: any) => res?.data ?? res;

export default defineComponent({
  name: "addonPlatformPrompts",
  components: { HomeFilled },
  setup() {
    const { t } = useI18n();
    const tab = ref("logs");
    const loading = ref(false);
    const favLoading = ref(false);
    const saving = ref(false);
    const promoting = ref(false);

    const logs = ref<AdminPromptLogItem[]>([]);
    const total = ref(0);
    const page = ref(1);
    const pageSize = ref(20);

    const favorites = ref<AdminPromptFav[]>([]);
    const favTotal = ref(0);
    const favPage = ref(1);
    const favPageSize = ref(20);

    const facets = ref<AdminPromptFacets>({ products: [], tools: [], templates: [] });
    const stats = ref<AdminPromptStats | null>(null);
    const promoteTargets = ref<AdminPromptTarget[]>([]);

    const q = reactive<{
      accountId: string;
      product?: string;
      tool?: string;
      template?: string;
      query: string;
      range: [string, string] | null;
      favoritedOnly: boolean;
    }>({
      accountId: "",
      product: undefined,
      tool: undefined,
      template: undefined,
      query: "",
      range: null,
      favoritedOnly: false,
    });

    const fq = reactive<{ promoted?: string; query: string }>({ promoted: "", query: "" });

    /** 时间范围 → unix 秒（el-date-picker 的 value-format="x" 给的是毫秒字符串）。 */
    const timeRange = () => {
      if (!q.range || q.range.length !== 2) return { from: undefined, to: undefined };
      return { from: Math.floor(Number(q.range[0]) / 1000), to: Math.floor(Number(q.range[1]) / 1000) };
    };

    /** 组装筛选参数；accountId 是字符串但后端收数字，非数字就当没填。 */
    const filterParams = () => {
      const { from, to } = timeRange();
      const accountId = /^\d+$/.test(q.accountId.trim()) ? Number(q.accountId.trim()) : undefined;
      return {
        accountId,
        product: q.product || undefined,
        tool: q.tool || undefined,
        template: q.template || undefined,
        query: q.query.trim() || undefined,
        favoritedOnly: q.favoritedOnly || undefined,
        from,
        to,
      };
    };

    const loadLogs = async () => {
      loading.value = true;
      try {
        const res: any = await getPlatformPromptLogs({ ...filterParams(), page: page.value, pageSize: pageSize.value });
        const d = unwrap(res) || {};
        logs.value = d.list || [];
        total.value = d.total || 0;
        if (d.stats) stats.value = d.stats;
      } finally {
        loading.value = false;
      }
    };

    const loadFavorites = async () => {
      favLoading.value = true;
      try {
        const res: any = await getPlatformPromptFavorites({
          query: fq.query.trim() || undefined,
          promoted: fq.promoted || undefined,
          page: favPage.value,
          pageSize: favPageSize.value,
        });
        const d = unwrap(res) || {};
        favorites.value = d.list || [];
        favTotal.value = d.total || 0;
      } finally {
        favLoading.value = false;
      }
    };

    const loadFacets = async () => {
      try {
        facets.value = unwrap(await getPlatformPromptFacets()) || facets.value;
      } catch {
        /* 下拉取不到不该让页面挂掉 */
      }
    };

    const loadStats = async () => {
      try {
        stats.value = unwrap(await getPlatformPromptStats()) || stats.value;
      } catch {
        /* 同上 */
      }
    };

    const loadTargets = async () => {
      try {
        const d = unwrap(await getPlatformPromptPromoteTargets()) || {};
        promoteTargets.value = d.list || [];
      } catch {
        promoteTargets.value = [];
      }
    };

    const onQuery = () => {
      page.value = 1;
      loadLogs();
    };
    const onReset = () => {
      q.accountId = "";
      q.product = undefined;
      q.tool = undefined;
      q.template = undefined;
      q.query = "";
      q.range = null;
      q.favoritedOnly = false;
      page.value = 1;
      loadLogs();
    };
    const onFavQuery = () => {
      favPage.value = 1;
      loadFavorites();
    };
    const onFavReset = () => {
      fq.promoted = "";
      fq.query = "";
      favPage.value = 1;
      loadFavorites();
    };

    const onTabChange = (name: string | number) => {
      if (name === "favorites") loadFavorites();
      else loadLogs();
    };

    // ── 详情 ──
    const detailVisible = ref(false);
    const detail = ref<AdminPromptLogItem | null>(null);
    const openDetail = (row: AdminPromptLogItem) => {
      detail.value = row;
      detailVisible.value = true;
    };

    // ── 收藏 / 编辑 ──
    const favVisible = ref(false);
    const favForm = reactive({
      logId: "",
      title: "",
      prompt: "",
      negativePrompt: "",
      tool: "",
      template: "",
      tags: "",
      rating: 0,
      note: "",
    });

    const openFavorite = (row: AdminPromptLogItem) => {
      favForm.logId = row.id;
      favForm.title = "";
      // 预填用户原文（而不是最终提示词）：运营要沉淀的是"人写的那句"。
      favForm.prompt = row.prompt || row.finalPrompt;
      favForm.negativePrompt = row.negativePrompt;
      favForm.tool = row.tool || "";
      favForm.template = row.template || "";
      favForm.tags = "";
      favForm.rating = row.rating || 0;
      favForm.note = "";
      favVisible.value = true;
    };

    const openFavoriteEdit = (row: AdminPromptFav) => {
      favForm.logId = row.logId;
      favForm.title = row.title;
      favForm.prompt = row.prompt;
      favForm.negativePrompt = row.negativePrompt;
      favForm.tool = row.tool;
      favForm.template = row.template;
      favForm.tags = row.tags;
      favForm.rating = row.rating;
      favForm.note = row.note;
      favVisible.value = true;
    };

    const onSaveFavorite = async () => {
      if (!favForm.logId) return;
      saving.value = true;
      try {
        await savePlatformPromptFavorite({ ...favForm });
        ElMessage.success(t("message.sdk.platform.favoriteSaved"));
        favVisible.value = false;
        await Promise.all([loadLogs(), loadStats()]);
        if (tab.value === "favorites") await loadFavorites();
      } finally {
        saving.value = false;
      }
    };

    // ── 沉淀 ──
    const promoteVisible = ref(false);
    const favRow = ref<AdminPromptFav | null>(null);
    const promoteForm = reactive<{ target: string; options: Record<string, string> }>({
      target: "",
      options: {},
    });

    const currentTargetFields = computed(
      () => promoteTargets.value.find((t) => t.key === promoteForm.target)?.fields || [],
    );

    const openPromote = (row: AdminPromptFav) => {
      favRow.value = row;
      promoteForm.target = row.promotedTo || promoteTargets.value[0]?.key || "";
      onTargetChange();
      promoteVisible.value = true;
    };

    /**
     * 切换目标时重置并预填。
     *
     * 预填是**按键名猜**的（含 prompt 的字段给提示词、label_chinese 给标题），
     * 不去认识任何具体目标的字段——否则"动态表单"就白做了。
     */
    const onTargetChange = () => {
      promoteForm.options = {};
      const row = favRow.value;
      if (!row) return;
      currentTargetFields.value.forEach((f) => {
        if (f.key.includes("prompt")) promoteForm.options[f.key] = row.prompt || "";
        else if (f.key === "label_chinese") promoteForm.options[f.key] = row.title || "";
        else if (f.options && f.options.length) promoteForm.options[f.key] = f.options[0].key;
        else promoteForm.options[f.key] = "";
      });
    };

    const onPromote = async () => {
      if (!favRow.value) return;
      if (!promoteForm.target) {
        ElMessage.warning(t("message.sdk.platform.fieldTarget"));
        return;
      }
      for (const f of currentTargetFields.value) {
        if (f.required && !String(promoteForm.options[f.key] || "").trim()) {
          // 字段名由后端给，不要在文案里写死"分类"这类具体目标的字段名。
          ElMessage.warning(f.label);
          return;
        }
      }
      promoting.value = true;
      try {
        await promotePlatformPromptFavorite(favRow.value.id, {
          target: promoteForm.target,
          options: promoteForm.options,
        });
        ElMessage.success(t("message.sdk.platform.promotedOk"));
        promoteVisible.value = false;
        await Promise.all([loadFavorites(), loadStats()]);
      } finally {
        promoting.value = false;
      }
    };

    const onRemoveFavorite = async (row: AdminPromptFav) => {
      // 只提示标题而不是把整段提示词弹出来：确认框是给"要不要删"看的，
      // 完整内容在表格里已经截断显示，没必要把成人向长文再糊一屏。
      const label = row.title || String(row.prompt).slice(0, 40);
      await ElMessageBox.confirm(label, t("message.sdk.platform.confirmRemoveFavorite"), { type: "warning" });
      await deletePlatformPromptFavorite(row.id);
      ElMessage.success(t("message.sdk.platform.favoriteRemoved"));
      await Promise.all([loadFavorites(), loadLogs(), loadStats()]);
    };

    // ── 导出 ──
    const csvCell = (v: unknown) => {
      const s = v === null || v === undefined ? "" : String(v);
      return '"' + s.replace(/"/g, '""') + '"';
    };

    const onExport = async () => {
      const res: any = await exportPlatformPromptLogs(filterParams());
      const list: AdminPromptLogItem[] = unwrap(res)?.list || [];
      if (!list.length) {
        ElMessage.warning(t("message.sdk.platform.exportEmpty"));
        return;
      }
      const header = ["id", "createdAt", "accountId", "product", "type", "tool", "template", "modelId", "prompt", "finalPrompt", "negativePrompt", "reuseCount"];
      const rows = list.map((r) =>
        [r.id, fmtTime(r.createdAt), r.accountId, r.product, r.type, r.tool, r.template, r.modelId, r.prompt, r.finalPrompt, r.negativePrompt, r.reuseCount]
          .map(csvCell)
          .join(","),
      );
      // BOM：不加的话 Excel 打开中文是乱码。
      const csv = "\uFEFF" + [header.join(","), ...rows].join("\r\n");
      ElMessage.success(t("message.sdk.platform.exportOk"));
      const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `prompt-logs-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    };

    // ── 展示工具 ──
    const fmtTime = (ts: number) => (ts ? new Date(ts * 1000).toLocaleString() : "-");
    const splitTags = (tags: string) => (tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : []);

    const statCards = computed(() => {
      const s = stats.value;
      return [
        { key: "total", label: t("message.sdk.platform.statTotal"), value: s?.total ?? 0 },
        { key: "today", label: t("message.sdk.platform.statToday"), value: s?.today ?? 0 },
        { key: "users", label: t("message.sdk.platform.statUsers"), value: s?.users ?? 0 },
        { key: "favorites", label: t("message.sdk.platform.statFavorites"), value: s?.favorites ?? 0 },
        { key: "promoted", label: t("message.sdk.platform.statPromoted"), value: s?.promoted ?? 0 },
      ];
    });

    onMounted(() => {
      loadLogs();
      loadFacets();
      loadStats();
      loadTargets();
    });
    onActivated(() => loadLogs());

    return {
      tab,
      logs,
      favorites,
      loading,
      favLoading,
      saving,
      promoting,
      page,
      pageSize,
      total,
      favPage,
      favPageSize,
      favTotal,
      q,
      fq,
      facets,
      stats,
      statCards,
      promoteTargets,
      currentTargetFields,
      detail,
      detailVisible,
      favVisible,
      favForm,
      promoteVisible,
      promoteForm,
      favRow,
      splitTags,
      fmtTime,
      openDetail,
      openFavorite,
      openFavoriteEdit,
      onSaveFavorite,
      openPromote,
      onTargetChange,
      onPromote,
      onRemoveFavorite,
      onExport,
      onQuery,
      onReset,
      onFavQuery,
      onFavReset,
      onTabChange,
      loadLogs,
      loadFavorites,
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
  font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-weight: 600;
  color: var(--cc-color-text-2);
}
.pf-muted {
  color: var(--cc-color-text-3);
}
.pf-small {
  font-size: var(--cc-font-12);
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
.pf-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: var(--cc-space-4);
  margin-bottom: var(--cc-space-4);
}
.pf-stat {
  background: var(--cc-color-surface);
  border: 1px solid var(--cc-color-border-light);
  border-radius: var(--cc-radius-xl);
  padding: var(--cc-space-4) var(--cc-space-5);
  box-shadow: var(--cc-shadow-sm);
}
.pf-stat__value {
  font-family: var(--cc-font-sans);
  font-size: var(--cc-font-24);
  font-weight: 650;
  color: var(--cc-color-text-1);
}
.pf-stat__label {
  font-size: var(--cc-font-12);
  color: var(--cc-color-text-3);
  text-transform: uppercase;
  letter-spacing: 0.04em;
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
/* 提示词是长文本：表格里固定两行截断，完整内容在详情弹窗里看。 */
.pf-prompt {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-word;
  line-height: 1.5;
  color: var(--cc-color-text-1);
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
.pf-tag {
  margin: 0 4px 2px 0;
}
.pf-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: var(--cc-space-3);
  padding-top: var(--cc-space-3);
}
.pf-detail__row {
  display: flex;
  gap: var(--cc-space-4);
  padding: 6px 0;
  border-bottom: 1px dashed var(--cc-color-border-light);
}
.pf-detail__row > span {
  width: 120px;
  color: var(--cc-color-text-3);
  font-size: var(--cc-font-13);
  flex: none;
}
.pf-detail__block {
  margin-top: var(--cc-space-4);
}
.pf-detail__label {
  font-size: var(--cc-font-12);
  color: var(--cc-color-text-3);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 4px;
}
.pf-pre {
  margin: 0;
  max-height: 220px;
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-word;
  background: var(--cc-color-surface-hover);
  border: 1px solid var(--cc-color-border-light);
  border-radius: var(--cc-radius-md);
  padding: var(--cc-space-3);
  font-size: var(--cc-font-13);
  color: var(--cc-color-text-1);
}
.pf-alert {
  margin-bottom: var(--cc-space-4);
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
