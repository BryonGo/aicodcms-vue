<template>
  <div class="pf-page">
    <el-breadcrumb separator="→">
      <el-breadcrumb-item :to="{ path: '/' }"
        ><el-icon><HomeFilled /></el-icon> {{ $t("message.sdk.platform.breadcrumbHome") }}</el-breadcrumb-item
      >
      <el-breadcrumb-item>{{ $t("message.sdk.platform.breadcrumbSdk") }}</el-breadcrumb-item>
      <el-breadcrumb-item>{{ $t("message.sdk.platform.ratesTitle") }}</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="pf-header">
      <div>
        <h1 class="pf-title">{{ $t("message.sdk.platform.ratesTitle") }}</h1>
        <p class="pf-subtitle">{{ $t("message.sdk.platform.ratesSubtitle") }}</p>
      </div>
      <div class="pf-header-actions">
        <el-button @click="openBatch">{{ $t("message.sdk.platform.btnBatchDuration") }}</el-button>
        <el-button type="primary" @click="openWrite()">{{ $t("message.sdk.platform.btnAddRate") }}</el-button>
      </div>
    </div>

    <div class="pf-filter-card">
      <el-form :inline="true" @submit.prevent>
        <el-form-item :label="$t('message.sdk.platform.filterSite')">
          <el-input v-model="q.siteId" placeholder="siteId" clearable style="width: 140px" @keyup.enter="onQuery" />
        </el-form-item>
        <el-form-item :label="$t('message.sdk.platform.filterProduct')">
          <el-input v-model="q.product" placeholder="hougong / gamelora" clearable style="width: 180px" @keyup.enter="onQuery" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onQuery">{{ $t("message.sdk.platform.btnQuery") }}</el-button>
          <el-button @click="onReset">{{ $t("message.sdk.platform.btnReset") }}</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="pf-table-card">
      <el-table
        :data="tableData"
        border
        v-loading="loading"
        class="pf-table"
        :empty-text="$t('message.sdk.platform.noData')"
      >
        <el-table-column prop="id" :label="$t('message.sdk.platform.colId')" width="90" align="center" />
        <el-table-column prop="siteId" :label="$t('message.sdk.platform.colSiteId')" width="90" align="center" />
        <el-table-column prop="product" :label="$t('message.sdk.platform.colProduct')" width="110" />
        <el-table-column :label="$t('message.sdk.platform.colType')" width="170">
          <template #default="{ row }">
            <el-tag size="small" effect="plain" round>{{ $t(dimGroup(row.dimKey)) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="dimKey" :label="$t('message.sdk.platform.colDimKey')" min-width="150" show-overflow-tooltip />
        <el-table-column prop="credits" :label="$t('message.sdk.platform.colCredits')" width="100" align="right">
          <template #default="{ row }"><span class="pf-mono">{{ row.credits }}</span></template>
        </el-table-column>
        <el-table-column prop="providerCostCents" :label="$t('message.sdk.platform.colCostCents')" width="120" align="right">
          <template #default="{ row }"><span class="pf-mono">{{ row.providerCostCents }}</span></template>
        </el-table-column>
        <el-table-column prop="revision" :label="$t('message.sdk.platform.colRevision')" width="90" align="center" />
        <el-table-column :label="$t('message.sdk.platform.colStatus')" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small" effect="plain" round>
              {{ row.status === 1 ? $t("message.sdk.platform.enabled") : $t("message.sdk.platform.disabled") }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="$t('message.sdk.platform.colCreatedAt')" width="170">
          <template #default="{ row }">{{ fmtTime(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column :label="$t('message.sdk.platform.colAction')" width="90" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openWrite(row)">{{ $t("message.sdk.platform.btnAddRate") }}</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pf-footer">
        <pagination v-model:page="page" v-model:limit="size" :total="total" @change="loadData" />
      </div>
    </div>

    <!-- 写入 / 改价 -->
    <el-dialog v-model="write.visible" :title="$t('message.sdk.platform.rateDialogTitle')" width="520px" :close-on-click-modal="false">
      <el-form :model="write.form" label-width="140px">
        <el-form-item :label="$t('message.sdk.platform.fieldSiteId')">
          <el-input-number v-model="write.form.siteId" :min="1" controls-position="right" style="width: 160px" />
        </el-form-item>
        <el-form-item :label="$t('message.sdk.platform.fieldProduct')">
          <el-input v-model="write.form.product" style="width: 220px" />
        </el-form-item>
        <el-form-item :label="$t('message.sdk.platform.fieldDimKey')">
          <el-input v-model="write.form.dimKey" placeholder="t2i:16:9 / i2v:16:9:10 / reskin:<styleId>" />
        </el-form-item>
        <el-form-item :label="$t('message.sdk.platform.fieldCredits')">
          <el-input-number v-model="write.form.credits" :min="0" controls-position="right" style="width: 160px" />
        </el-form-item>
        <el-form-item :label="$t('message.sdk.platform.fieldCostCents')">
          <el-input-number v-model="write.form.providerCostCents" :min="0" controls-position="right" style="width: 160px" />
        </el-form-item>
        <el-form-item>
          <el-text type="info" size="small">{{ $t("message.sdk.platform.rateHintWrite") }}</el-text>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="write.visible = false">{{ $t("message.sdk.platform.btnReset") }}</el-button>
        <el-button type="primary" :loading="write.saving" @click="submitWrite">
          {{ $t("message.sdk.platform.rateDialogTitle") }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 批量生成按时长报价 -->
    <el-dialog v-model="batch.visible" :title="$t('message.sdk.platform.rateBatchTitle')" width="520px" :close-on-click-modal="false">
      <el-form :model="batch.form" label-width="140px">
        <el-form-item :label="$t('message.sdk.platform.filterSite')">
          <el-input-number v-model="batch.form.siteId" :min="1" controls-position="right" style="width: 160px" />
        </el-form-item>
        <el-form-item :label="$t('message.sdk.platform.filterProduct')">
          <el-input v-model="batch.form.product" style="width: 220px" />
        </el-form-item>
        <el-form-item :label="$t('message.sdk.platform.batchRatio')">
          <el-select v-model="batch.form.ratio" style="width: 160px">
            <el-option v-for="r in VIDEO_RATIOS" :key="r" :label="r" :value="r" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('message.sdk.platform.batchFrom')">
          <el-input-number v-model="batch.form.from" :min="1" :max="60" controls-position="right" style="width: 140px" />
        </el-form-item>
        <el-form-item :label="$t('message.sdk.platform.batchTo')">
          <el-input-number v-model="batch.form.to" :min="1" :max="60" controls-position="right" style="width: 140px" />
        </el-form-item>
        <el-form-item :label="$t('message.sdk.platform.batchCredits')">
          <el-input-number v-model="batch.form.credits" :min="0" controls-position="right" style="width: 160px" />
        </el-form-item>
        <el-form-item>
          <el-text type="info" size="small">{{ $t("message.sdk.platform.batchHint") }}</el-text>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="batch.visible = false">{{ $t("message.sdk.platform.btnReset") }}</el-button>
        <el-button type="primary" :loading="batch.saving" @click="submitBatch">
          {{ $t("message.sdk.platform.batchRun") }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, onMounted, onActivated } from "vue";
import { HomeFilled } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { useI18n } from "vue-i18n";
import { getPlatformBillingRates, upsertPlatformBillingRate, AdminBillingRateItem } from "/@/api/addon/platform";

// 视频画幅（与后端 internal/platform/model/video/catalog.go 的 Resolutions 一致；
// 用于「批量生成按时长报价」的画幅下拉）。
const VIDEO_RATIOS = ["16:9", "9:16", "1:1", "4:3", "3:4"] as const;

export default defineComponent({
  name: "addonPlatformBillingRates",
  components: { HomeFilled },
  setup() {
    const { t } = useI18n();
    const tableData = ref<AdminBillingRateItem[]>([]);
    const loading = ref(false);
    const page = ref(1);
    const size = ref(20);
    const total = ref(0);
    const q = reactive<{ siteId?: number; product?: string }>({ siteId: undefined, product: undefined });

    const fmtTime = (ts: number) => (ts ? new Date(ts * 1000).toLocaleString() : "-");

    // dimKey → 分组 i18n key。形态见 sql/migrations/platform/004、005 与
    // internal/platform/task/controller/task.go 的 dimKey()：
    //   t2i:<画幅>       图片档
    //   i2v:<画幅>       视频档（按画幅单档）
    //   i2v:<画幅>:<秒>  视频档（按时长，可选维度）
    //   extend:<画幅>    角色延展
    //   reskin:<风格ID>  风格费率
    // 注意画幅自身含冒号，所以按冒号段数区分。
    const dimGroup = (dimKey: string): string => {
      const k = dimKey || "";
      if (k.startsWith("i2v:")) return k.split(":").length >= 4 ? "message.sdk.platform.groupVideoDuration" : "message.sdk.platform.groupVideo";
      if (k.startsWith("t2i:")) return "message.sdk.platform.groupImage";
      if (k.startsWith("extend:")) return "message.sdk.platform.groupExtend";
      if (k.startsWith("reskin:")) return "message.sdk.platform.groupStyle";
      return "message.sdk.platform.groupOther";
    };

    const loadData = async () => {
      loading.value = true;
      try {
        const res: any = await getPlatformBillingRates({
          siteId: q.siteId,
          product: q.product,
          page: page.value,
          pageSize: size.value,
        });
        const d = res.data || res;
        tableData.value = d.list || [];
        total.value = d.total || 0;
      } finally {
        loading.value = false;
      }
    };

    const onQuery = () => {
      page.value = 1;
      loadData();
    };
    const onReset = () => {
      q.siteId = undefined;
      q.product = undefined;
      page.value = 1;
      loadData();
    };

    // ── 写入 / 改价 ──
    const write = reactive({
      visible: false,
      saving: false,
      form: { siteId: 1, product: "hougong", dimKey: "", credits: 0, providerCostCents: 0 },
    });

    const openWrite = (row?: AdminBillingRateItem) => {
      if (row) {
        write.form = {
          siteId: row.siteId,
          product: row.product,
          dimKey: row.dimKey,
          credits: row.credits,
          providerCostCents: row.providerCostCents,
        };
      } else {
        write.form = {
          siteId: q.siteId ?? 1,
          product: q.product || "hougong",
          dimKey: "",
          credits: 0,
          providerCostCents: 0,
        };
      }
      write.visible = true;
    };

    const submitWrite = async () => {
      if (!write.form.dimKey.trim()) {
        ElMessage.warning(t("message.sdk.platform.fieldDimKey"));
        return;
      }
      write.saving = true;
      try {
        await upsertPlatformBillingRate({
          siteId: write.form.siteId,
          product: write.form.product,
          dimKey: write.form.dimKey.trim(),
          credits: write.form.credits,
          providerCostCents: write.form.providerCostCents,
        });
        ElMessage.success(t("message.sdk.platform.writeOk"));
        write.visible = false;
        await loadData();
      } finally {
        write.saving = false;
      }
    };

    // ── 批量生成按时长报价 ──
    const batch = reactive({
      visible: false,
      saving: false,
      form: { siteId: 1, product: "hougong", ratio: "16:9", from: 2, to: 15, credits: 0 },
    });

    const openBatch = () => {
      batch.form.siteId = q.siteId ?? 1;
      batch.form.product = q.product || "hougong";
      batch.visible = true;
    };

    // 逐秒写入 i2v:<画幅>:<秒>。后端 upsert 语义：同价幂等，改价则旧行下线、revision+1。
    const submitBatch = async () => {
      const from = Math.min(batch.form.from, batch.form.to);
      const to = Math.max(batch.form.from, batch.form.to);
      batch.saving = true;
      let ok = 0;
      try {
        for (let sec = from; sec <= to; sec++) {
          await upsertPlatformBillingRate({
            siteId: batch.form.siteId,
            product: batch.form.product,
            dimKey: `i2v:${batch.form.ratio}:${sec}`,
            credits: batch.form.credits,
          });
          ok++;
        }
        ElMessage.success(t("message.sdk.platform.batchDone", { n: ok }));
        batch.visible = false;
        await loadData();
      } finally {
        batch.saving = false;
      }
    };

    onMounted(() => loadData());
    onActivated(() => loadData());

    return {
      tableData,
      loading,
      page,
      size,
      total,
      q,
      fmtTime,
      dimGroup,
      loadData,
      onQuery,
      onReset,
      write,
      openWrite,
      submitWrite,
      batch,
      openBatch,
      submitBatch,
      VIDEO_RATIOS,
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
.pf-header-actions {
  display: flex;
  align-items: center;
  gap: var(--cc-space-2);
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
