<template>
  <div class="pf-page">
    <el-breadcrumb separator="→">
      <el-breadcrumb-item :to="{ path: '/' }"
        ><el-icon><HomeFilled /></el-icon> {{ $t("message.sdk.platform.breadcrumbHome") }}</el-breadcrumb-item
      >
      <el-breadcrumb-item>{{ $t("message.sdk.platform.breadcrumbSdk") }}</el-breadcrumb-item>
      <el-breadcrumb-item>{{ $t("message.sdk.platform.usersTitle") }}</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="pf-header">
      <div>
        <h1 class="pf-title">{{ $t("message.sdk.platform.usersTitle") }}</h1>
        <p class="pf-subtitle">{{ $t("message.sdk.platform.usersSubtitle") }}</p>
      </div>
    </div>

    <div class="pf-filter-card">
      <el-form :inline="true" @submit.prevent>
        <el-form-item :label="$t('message.sdk.platform.colDisplayName')">
          <el-input
            v-model="q.query"
            :placeholder="$t('message.sdk.platform.colDisplayName')"
            clearable
            style="width: 180px"
            @keyup.enter="onQuery"
          />
        </el-form-item>
        <el-form-item :label="$t('message.sdk.platform.filterStatus')">
          <el-select v-model="q.state" style="width: 160px">
            <el-option
              v-for="s in STATE_OPTIONS"
              :key="s"
              :label="s === 'all' ? $t('message.sdk.platform.statusAll') : s"
              :value="s"
            />
          </el-select>
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
        <!-- id 是雪花 ID 的十进制字符串，不能当 number 处理（避免精度丢失） -->
        <el-table-column prop="id" :label="$t('message.sdk.platform.colId')" min-width="180" show-overflow-tooltip>
          <template #default="{ row }"><span class="pf-mono">{{ row.id }}</span></template>
        </el-table-column>
        <el-table-column
          prop="displayName"
          :label="$t('message.sdk.platform.colDisplayName')"
          min-width="140"
          show-overflow-tooltip
        />
        <el-table-column :label="$t('message.sdk.platform.colState')" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="row.state === 'active' ? 'success' : 'info'" size="small" effect="plain" round>
              {{ row.state }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="$t('message.sdk.platform.colCreatedAt')" width="170">
          <template #default="{ row }">{{ fmtTime(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column :label="$t('message.sdk.platform.colLastSeen')" width="170">
          <template #default="{ row }">{{ fmtTime(row.lastSeenAt) }}</template>
        </el-table-column>
        <el-table-column :label="$t('message.sdk.platform.colWorks')" width="100" align="right">
          <template #default="{ row }"><span class="pf-mono">{{ row.stats?.works ?? 0 }}</span></template>
        </el-table-column>
        <el-table-column :label="$t('message.sdk.platform.colPosts')" width="100" align="right">
          <template #default="{ row }"><span class="pf-mono">{{ row.stats?.posts ?? 0 }}</span></template>
        </el-table-column>
        <el-table-column :label="$t('message.sdk.platform.colAction')" width="220" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openDetail(row)">
              {{ $t("message.sdk.platform.btnDetail") }}
            </el-button>
            <el-button link type="primary" @click="openAdjust(row)">
              {{ $t("message.sdk.platform.btnAdjust") }}
            </el-button>
            <el-button v-if="row.state !== 'suspended'" link type="danger" @click="onAct(row)">
              {{ $t("message.sdk.platform.btnSuspend") }}
            </el-button>
            <el-button v-else link type="success" @click="onAct(row)">
              {{ $t("message.sdk.platform.btnRestore") }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pf-footer">
        <pagination v-model:page="page" v-model:limit="size" :total="total" @change="loadData" />
      </div>
    </div>

    <!-- 用户详情 + 钱包流水 -->
    <el-dialog
      v-model="detail.visible"
      :title="$t('message.sdk.platform.btnDetail')"
      width="760px"
      :close-on-click-modal="false"
    >
      <el-descriptions v-loading="detail.loading" :column="2" border>
        <el-descriptions-item :label="$t('message.sdk.platform.colId')">
          <span class="pf-mono">{{ detail.data.id || "-" }}</span>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('message.sdk.platform.colDisplayName')">
          {{ detail.data.displayName || "-" }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('message.sdk.platform.colState')">
          <el-tag :type="detail.data.state === 'active' ? 'success' : 'info'" size="small" effect="plain" round>
            {{ detail.data.state || "-" }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('message.sdk.platform.colCreatedAt')">
          {{ fmtTime(detail.data.createdAt) }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('message.sdk.platform.colLastSeen')">
          {{ fmtTime(detail.data.lastSeenAt) }}
        </el-descriptions-item>
        <!-- bio / comments / reports 无对应 i18n key，直接展示后端字段名 -->
        <el-descriptions-item label="bio" :span="2">{{ detail.data.bio || "-" }}</el-descriptions-item>
        <el-descriptions-item :label="$t('message.sdk.platform.colCredits')">
          <span class="pf-mono">{{ detail.data.wallet?.credits ?? "-" }}</span>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('message.sdk.platform.colHolds')">
          <span class="pf-mono">{{ detail.data.wallet?.holds ?? "-" }}</span>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('message.sdk.platform.colAvailable')">
          <span class="pf-mono">{{ detail.data.wallet?.available ?? "-" }}</span>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('message.sdk.platform.colBalanceCents')">
          <span class="pf-mono">{{ detail.data.wallet?.balanceCents ?? "-" }}</span>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('message.sdk.platform.colWorks')">
          <span class="pf-mono">{{ detail.data.stats?.works ?? 0 }}</span>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('message.sdk.platform.colPosts')">
          <span class="pf-mono">{{ detail.data.stats?.posts ?? 0 }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="comments">
          <span class="pf-mono">{{ detail.data.stats?.comments ?? 0 }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="reports">
          <span class="pf-mono">{{ detail.data.stats?.reports ?? 0 }}</span>
        </el-descriptions-item>
      </el-descriptions>

      <div class="pf-sub-title">{{ $t("message.sdk.platform.userLedgerTitle") }}</div>
      <el-table
        :data="detail.ledger"
        border
        size="small"
        max-height="280"
        v-loading="detail.ledgerLoading"
        class="pf-table"
        :empty-text="$t('message.sdk.platform.noData')"
      >
        <el-table-column prop="asset" :label="$t('message.sdk.platform.colAsset')" width="110" align="center" />
        <el-table-column :label="$t('message.sdk.platform.colAmount')" width="120" align="right">
          <template #default="{ row }">
            <span :class="row.amount >= 0 ? 'pf-positive' : 'pf-negative'" class="pf-num">
              {{ row.amount > 0 ? "+" : "" }}{{ row.amount }}
            </span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('message.sdk.platform.colBalanceAfter')" width="140" align="right">
          <template #default="{ row }"><span class="pf-mono">{{ row.balanceAfter }}</span></template>
        </el-table-column>
        <el-table-column
          prop="reason"
          :label="$t('message.sdk.platform.colReason')"
          min-width="140"
          show-overflow-tooltip
        />
        <el-table-column :label="$t('message.sdk.platform.colCreatedAt')" width="170">
          <template #default="{ row }">{{ fmtTime(row.createdAt) }}</template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <!-- 积分 / 余额调整 -->
    <el-dialog
      v-model="adjust.visible"
      :title="$t('message.sdk.platform.adjustTitle')"
      width="520px"
      :close-on-click-modal="false"
    >
      <el-form :model="adjust.form" label-width="140px">
        <el-form-item :label="$t('message.sdk.platform.adjustAsset')">
          <el-radio-group v-model="adjust.form.asset">
            <el-radio value="credit">{{ $t("message.sdk.platform.assetCredit") }}</el-radio>
            <el-radio value="balance">{{ $t("message.sdk.platform.assetBalance") }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="$t('message.sdk.platform.adjustAmount')">
          <!-- 可正可负：正数增加、负数扣减；balance 单位为分 -->
          <el-input-number v-model="adjust.form.amount" :precision="0" controls-position="right" style="width: 180px" />
        </el-form-item>
        <el-form-item :label="$t('message.sdk.platform.adjustReason')">
          <el-input v-model="adjust.form.reason" type="textarea" :rows="3" maxlength="200" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="adjust.visible = false">{{ $t("message.sdk.platform.btnReset") }}</el-button>
        <el-button type="primary" :loading="adjust.saving" @click="submitAdjust">
          {{ $t("message.sdk.platform.btnAdjust") }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, onMounted, onActivated } from "vue";
import { HomeFilled } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useI18n } from "vue-i18n";
import {
  getPlatformUsers,
  getPlatformUser,
  adjustPlatformUser,
  actPlatformUser,
  getPlatformUserLedger,
  AdminUserListItem,
  AdminUserDetail,
  AdminWalletLedgerItem,
} from "/@/api/addon/platform";

// 状态筛选值：all 复用 statusAll 文案，其余直接展示后端 state 值（active/suspended）
const STATE_OPTIONS = ["all", "active", "suspended"] as const;

interface AdjustForm {
  id: string;
  asset: "credit" | "balance";
  amount: number;
  reason: string;
}

export default defineComponent({
  name: "addonPlatformUsers",
  components: { HomeFilled },
  setup() {
    const { t } = useI18n();
    const tableData = ref<AdminUserListItem[]>([]);
    const loading = ref(false);
    const page = ref(1);
    const size = ref(20);
    const total = ref(0);
    const q = reactive<{ query?: string; state?: string }>({ query: undefined, state: "all" });

    // 用户时间字段是字符串时间（列表/详情），报价页那样按秒时间戳渲染会失效，两种都兼容
    const fmtTime = (v?: string | number | null) => {
      if (!v) return "-";
      const d = typeof v === "number" ? new Date(v * 1000) : new Date(v);
      if (Number.isNaN(d.getTime())) return String(v);
      return d.toLocaleString();
    };

    const emptyDetail = (): AdminUserDetail => ({
      id: "",
      displayName: "",
      avatarUrl: "",
      state: "",
      createdAt: "",
      lastSeenAt: "",
      bio: "",
      stats: { works: 0, posts: 0, comments: 0, reports: 0 },
      wallet: { credits: 0, holds: 0, available: 0, balanceCents: 0 },
      recentWorks: [],
      recentPosts: [],
    });

    const loadData = async () => {
      loading.value = true;
      try {
        const res: any = await getPlatformUsers({
          query: q.query || undefined,
          state: q.state && q.state !== "all" ? q.state : undefined,
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

    const onQuery = () => {
      page.value = 1;
      loadData();
    };
    const onReset = () => {
      q.query = undefined;
      q.state = "all";
      page.value = 1;
      loadData();
    };

    // ── 详情 + 钱包流水 ──
    const detail = reactive<{
      visible: boolean;
      loading: boolean;
      ledgerLoading: boolean;
      data: AdminUserDetail;
      ledger: AdminWalletLedgerItem[];
    }>({
      visible: false,
      loading: false,
      ledgerLoading: false,
      data: emptyDetail(),
      ledger: [],
    });

    const loadDetail = async (id: string) => {
      detail.loading = true;
      try {
        const res: any = await getPlatformUser(id);
        const d: any = res.data || res;
        detail.data = Object.assign(emptyDetail(), d);
      } finally {
        detail.loading = false;
      }
    };

    // 钱包流水：详情弹窗固定取最近 10 条
    const loadDetailLedger = async (id: string) => {
      detail.ledgerLoading = true;
      try {
        const res: any = await getPlatformUserLedger({ id, page: 1, pageSize: 10 });
        const d = res.data || res;
        detail.ledger = d.items || [];
      } finally {
        detail.ledgerLoading = false;
      }
    };

    const openDetail = async (row: AdminUserListItem) => {
      detail.visible = true;
      detail.ledger = [];
      await Promise.all([loadDetail(row.id), loadDetailLedger(row.id)]);
    };

    // 详情开着时刷新（调整/暂停/恢复后调用）
    const refreshDetail = async () => {
      const id = detail.data.id;
      if (!detail.visible || !id) return;
      await Promise.all([loadDetail(id), loadDetailLedger(id)]);
    };

    // ── 积分 / 余额调整 ──
    const adjust = reactive<{ visible: boolean; saving: boolean; form: AdjustForm }>({
      visible: false,
      saving: false,
      form: { id: "", asset: "credit", amount: 0, reason: "" },
    });

    const openAdjust = (row: AdminUserListItem) => {
      adjust.form = { id: row.id, asset: "credit", amount: 0, reason: "" };
      adjust.visible = true;
    };

    const submitAdjust = async () => {
      const amount = Number(adjust.form.amount || 0);
      const reason = adjust.form.reason.trim();
      if (!amount) {
        ElMessage.warning(t("message.sdk.platform.adjustAmount"));
        return;
      }
      if (!reason) {
        ElMessage.warning(t("message.sdk.platform.adjustReason"));
        return;
      }
      const assetLabel =
        adjust.form.asset === "credit"
          ? t("message.sdk.platform.assetCredit")
          : t("message.sdk.platform.assetBalance");
      try {
        await ElMessageBox.confirm(
          `${t("message.sdk.platform.adjustAsset")}: ${assetLabel} / ${t("message.sdk.platform.adjustAmount")}: ${amount} / ${t(
            "message.sdk.platform.adjustReason"
          )}: ${reason}`,
          t("message.sdk.platform.adjustTitle"),
          { type: "warning" }
        );
      } catch {
        return;
      }
      adjust.saving = true;
      try {
        await adjustPlatformUser({ id: adjust.form.id, asset: adjust.form.asset, amount, reason });
        ElMessage.success(t("message.sdk.platform.adjustOk"));
        adjust.visible = false;
        await loadData();
        await refreshDetail();
      } finally {
        adjust.saving = false;
      }
    };

    // ── 暂停 / 恢复（原因必填，留审计） ──
    const onAct = (row: AdminUserListItem) => {
      const isSuspend = row.state !== "suspended";
      const action: "suspend" | "restore" = isSuspend ? "suspend" : "restore";
      ElMessageBox.prompt(
        `${t("message.sdk.platform.colDisplayName")}: ${row.displayName || row.id}`,
        t(isSuspend ? "message.sdk.platform.btnSuspend" : "message.sdk.platform.btnRestore"),
        {
          type: "warning",
          inputPlaceholder: t("message.sdk.platform.disableReason"),
          // i18n 冻结：平台命名空间只有这一条「必须填写原因」提示，恢复沿用同一条
          inputValidator: (v: string) =>
            !!String(v || "").trim() || t("message.sdk.platform.disableReasonRequired"),
        }
      )
        .then(async ({ value }) => {
          await actPlatformUser({ id: row.id, action, reason: String(value).trim() });
          ElMessage.success(t("message.sdk.platform.switchOk"));
          await loadData();
          await refreshDetail();
        })
        .catch(() => {});
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
      STATE_OPTIONS,
      fmtTime,
      loadData,
      onQuery,
      onReset,
      detail,
      openDetail,
      adjust,
      openAdjust,
      submitAdjust,
      onAct,
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
.pf-num {
  font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-weight: 600;
}
.pf-positive {
  color: var(--el-color-success);
}
.pf-negative {
  color: var(--el-color-danger);
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
.pf-sub-title {
  font-family: var(--cc-font-sans);
  font-size: var(--cc-font-13);
  font-weight: 650;
  color: var(--cc-color-text-3);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  margin: var(--cc-space-5) 0 var(--cc-space-2);
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
