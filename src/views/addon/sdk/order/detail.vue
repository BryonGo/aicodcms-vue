<template>
  <div class="fa-page od-page">
    <el-breadcrumb separator="→">
      <el-breadcrumb-item :to="{ path: '/' }"
        ><el-icon><HomeFilled /></el-icon> {{ $t("message.router.home") }}</el-breadcrumb-item
      >
      <el-breadcrumb-item>{{ $t("message.sdk.game.breadcrumbSdk") }}</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/addon/sdk/order/list' }">{{
        $t("message.sdk.order.title")
      }}</el-breadcrumb-item>
      <el-breadcrumb-item>{{ $t("message.sdk.orderDetail") }}</el-breadcrumb-item>
    </el-breadcrumb>

    <div v-if="loading" class="od-loading">
      <el-icon :size="32" class="od-spin"><Loading /></el-icon>
      <p>{{ $t("message.sdk.order.detailLoading") }}</p>
    </div>
    <template v-else-if="loadError">
      <div class="od-error">
        <el-icon :size="48"><WarningFilled /></el-icon>
        <h3>{{ $t("message.sdk.order.detailLoadError") }}</h3>
        <p>{{ loadError }}</p>
        <el-button type="primary" @click="$router.push('/addon/sdk/order/list')">{{
          $t("message.common.backToList")
        }}</el-button>
      </div>
    </template>
    <template v-else>
      <div class="od-header">
        <el-button link class="od-back" @click="$router.push('/addon/sdk/order/list')"
          ><el-icon><ArrowLeft /></el-icon> {{ $t("message.sdk.order.backToOrderList") }}</el-button
        >
        <div class="od-header-row">
          <div>
            <h1 class="od-title">订单 #{{ detail.id }}</h1>
            <p class="od-subtitle">
              <el-tag :type="statusTag(detail.status)" size="small" effect="dark" round>{{
                statusText(detail.status)
              }}</el-tag>
              <el-tag
                :type="notifyTag(detail.notify_status)"
                size="small"
                effect="light"
                round
                style="margin-left: 8px"
              >
                {{ $t("message.sdk.order.notifyLabel") }}{{ notifyText(detail.notify_status) }}
              </el-tag>
            </p>
          </div>
          <el-button
            type="info"
            size="large"
            style="margin-left: 8px"
            @click="onQuery"
            :loading="querying"
          >
            <el-icon><Search /></el-icon> {{ $t("message.sdk.order.queryOrder") }}
          </el-button>
          <el-button
            v-if="canResend"
            type="warning"
            size="large"
            @click="onResend"
            :loading="resending"
            class="od-resend-btn"
          >
            <el-icon><RefreshRight /></el-icon> {{ $t("message.sdk.order.replenish") }}
          </el-button>
        </div>
      </div>

      <div class="od-grid">
        <div class="od-card">
          <h3 class="od-card-title">
            <el-icon><Document /></el-icon>{{ $t("message.sdk.order.orderInfo") }}
          </h3>
          <div class="od-kv">
            <div class="od-kv-item">
              <span class="od-k">{{ $t("message.sdk.order.colOrderIdFull") }}</span
              ><span class="od-v mono">{{ detail.id }}</span>
            </div>
            <div class="od-kv-item">
              <span class="od-k">{{ $t("message.sdk.order.appIdLabel") }}</span
              ><span class="od-v mono">{{ detail.app_id }}</span>
            </div>
            <div class="od-kv-item">
              <span class="od-k">{{ $t("message.sdk.order.cpOrderId") }}</span
              ><span class="od-v mono">{{ detail.cp_order_id || "—" }}</span>
            </div>
            <div class="od-kv-item">
              <span class="od-k">{{ $t("message.sdk.order.colProductIdFull") }}</span
              ><span class="od-v mono">{{ detail.product_id }}</span>
            </div>
            <div class="od-kv-item">
              <span class="od-k">{{ $t("message.sdk.order.colAmount") }}</span
              ><span class="od-v price">{{ formatPrice(detail.price) }} {{ detail.currency }}</span>
            </div>
            <div class="od-kv-item">
              <span class="od-k">{{ $t("message.sdk.order.notifyUrlLabel") }}</span
              ><span class="od-v break">{{ detail.pay_notify_url || "—" }}</span>
            </div>
          </div>
        </div>

        <div class="od-card">
          <h3 class="od-card-title">
            <el-icon><User /></el-icon>{{ $t("message.sdk.order.userAndRole") }}
          </h3>
          <div class="od-kv">
            <div class="od-kv-item">
              <span class="od-k">{{ $t("message.sdk.order.userUid") }}</span
              ><span class="od-v mono">{{ detail.uid }}</span>
            </div>
            <div class="od-kv-item">
              <span class="od-k">{{ $t("message.sdk.order.roleId") }}</span
              ><span class="od-v mono">{{ detail.role_id || "—" }}</span>
            </div>
            <div class="od-kv-item">
              <span class="od-k">{{ $t("message.sdk.order.serverId") }}</span
              ><span class="od-v mono">{{ detail.server_id || "—" }}</span>
            </div>
          </div>
        </div>

        <div class="od-card">
          <h3 class="od-card-title">
            <el-icon><Clock /></el-icon>{{ $t("message.sdk.order.timeInfo") }}
          </h3>
          <div class="od-kv">
            <div class="od-kv-item">
              <span class="od-k">{{ $t("message.common.colCreateTime") }}</span
              ><span class="od-v">{{ fmt(detail.created_at) }}</span>
            </div>
            <div class="od-kv-item">
              <span class="od-k">{{ $t("message.common.colUpdateTime") }}</span
              ><span class="od-v">{{ fmt(detail.updated_at) }}</span>
            </div>
          </div>
        </div>

        <div class="od-card" v-if="detail.notify_content">
          <h3 class="od-card-title">
            <el-icon><Bell /></el-icon>{{ $t("message.sdk.order.notifyContentJson") }}
          </h3>
          <pre class="od-json">{{ formatJson(detail.notify_content) }}</pre>
        </div>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  HomeFilled,
  ArrowLeft,
  Document,
  User,
  Clock,
  Bell,
  Loading,
  WarningFilled,
  RefreshRight,
  Search,
} from "@element-plus/icons-vue";
import { getOrderDetail, queryPayOrder, resendOrder } from "/@/api/addon/order";
import { useI18n } from "vue-i18n";

export default defineComponent({
  name: "addonSdkOrderDetail",
  components: {
    HomeFilled,
    ArrowLeft,
    Document,
    User,
    Clock,
    Bell,
    Loading,
    WarningFilled,
    RefreshRight,
  },
  setup() {
    const { t } = useI18n();
    const route = useRoute();
    const loading = ref(true);
    const loadError = ref("");
    const resending = ref(false);
    const querying = ref(false);
    const detail = ref<any>({});

    const statusText = (s: number) =>
      (
        ({
          1: t("message.sdk.order.statusCreated"),
          2: t("message.sdk.order.statusSubmitted"),
          3: t("message.sdk.order.statusSuccess"),
          "-1": t("message.pms_upload.failed"),
        }) as any
      )[s] || t("message.common.msgUnknown");
    const statusTag = (s: number) =>
      (({ 1: "info", 2: "", 3: "success", "-1": "danger" }) as any)[s] || "info";
    const notifyText = (s: number) =>
      (
        ({
          0: t("message.sdk.order.notifyPending"),
          1: t("message.sdk.order.notifyDone"),
          2: t("message.sdk.order.notifyFailed"),
        }) as any
      )[s] || t("message.common.msgUnknown");
    const notifyTag = (s: number) =>
      (({ 0: "warning", 1: "success", 2: "danger" }) as any)[s] || "info";
    const fmt = (ts: number) =>
      ts > 0
        ? new Date(ts * 1000).toLocaleString("zh-CN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })
        : "—";
    const formatPrice = (p: number) => (isNaN(Number(p)) ? "0.00" : (Number(p) / 100).toFixed(2));
    const formatJson = (s: string) => {
      try {
        return JSON.stringify(JSON.parse(s), null, 2);
      } catch {
        return s;
      }
    };
    const canResend = computed(() => detail.value.status !== 3 || detail.value.notify_status !== 1);

    const loadData = async () => {
      const id = route.query.id as string;
      if (!id) {
        loadError.value = t("message.sdk.order.missingId");
        loading.value = false;
        return;
      }
      try {
        const res: any = await getOrderDetail({ id });
        const d = res.data || res;
        const item = d.order || d;
        if (!item || !item.id) {
          loadError.value = t("message.sdk.order.notFound");
          return;
        }
        detail.value = item;
      } catch {
        loadError.value = t("message.common.msgNetworkError");
      } finally {
        loading.value = false;
      }
    };

    const queryResult = ref<any>(null);
    const onQuery = async () => {
      querying.value = true;
      queryResult.value = null;
      try {
        const res: any = await queryPayOrder({ order_id: detail.value.id });
        queryResult.value = res.data || res;
        const q = queryResult.value;
        ElMessageBox.alert(
          `<div style="line-height:2">
            <p><b>${t("message.sdk.order.status")}：</b>${q.trade_status || "—"}</p>
            <p><b>${t("message.sdk.order.amount")}：</b>${q.paid_amount ? (q.paid_amount / 100).toFixed(2) : "—"} CNY</p>
            <p><b>${t("message.sdk.order.platformOrder")}：</b>${q.platform_order || "—"}</p>
            <p><b>${t("message.sdk.order.isSuccess")}：</b>${q.is_success ? "✅ Yes" : "❌ No"}</p>
          </div>`,
          t("message.sdk.order.queryResultTitle"),
          { dangerouslyUseHTMLString: true, confirmButtonText: t("message.common.confirm") },
        );
      } catch (e: any) {
        ElMessage.error(e?.message || t("message.sdk.order.queryFailed"));
      } finally {
        querying.value = false;
      }
    };

    const onResend = () => {
      ElMessageBox.confirm(
        t("message.sdk.order.replenishConfirmMsgDetail"),
        t("message.sdk.order.confirmReplenish"),
        {
          type: "warning",
          confirmButtonText: t("message.sdk.order.btnReplenish"),
          cancelButtonText: t("message.common.cancel"),
        },
      )
        .then(async () => {
          resending.value = true;
          try {
            await resendOrder({ order_id: detail.value.id });
            ElMessage.success(t("message.sdk.order.msgReplenishOk"));
            loadData();
          } catch {
            /* handled */
          } finally {
            resending.value = false;
          }
        })
        .catch(() => {});
    };

    onMounted(() => loadData());
    return {
      loading,
      loadError,
      detail,
      resending,
      querying,
      queryResult,
      statusText,
      statusTag,
      notifyText,
      notifyTag,
      fmt,
      formatPrice,
      formatJson,
      canResend,
      onResend,
      onQuery,
    };
  },
});
</script>

<style scoped>
.od-page {
  max-width: 1200px;
  margin: 0 auto;
  padding-bottom: 40px;
}
.od-spin {
  animation: od-spin 1s linear infinite;
  color: var(--cc-color-primary);
}
@keyframes od-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
.od-loading,
.od-error {
  text-align: center;
  padding: 100px 20px;
  color: var(--cc-color-text-4);
}
.od-error h3 {
  color: var(--cc-color-text-2);
  margin: 16px 0 8px;
}
.mono {
  font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}
.break {
  word-break: break-all;
}
.price {
  color: var(--cc-color-primary);
  font-weight: 700;
  font-size: 16px;
}

.od-header {
  margin: 28px 0 24px;
  padding: 32px 36px;
  background:
    radial-gradient(circle at 8% 0%, var(--cc-color-primary-softer), transparent 34%),
    var(--cc-color-surface);
  border-radius: var(--cc-radius-xl);
  border: 1px solid var(--cc-color-border-light);
  overflow: hidden;
  position: relative;
}
.od-header::before {
  content: "";
  position: absolute;
  top: -50px;
  right: -50px;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, var(--cc-color-primary-softer) 0%, transparent 70%);
  border-radius: 50%;
}
.od-header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  position: relative;
  z-index: 1;
}
.od-back {
  font-family: var(--cc-font-sans);
  font-size: 13px;
  font-weight: 500;
  color: var(--cc-color-text-3);
  padding: 0;
  margin-bottom: 12px;
  transition: color 0.2s;
}
.od-back:hover {
  color: var(--cc-color-primary);
}
.od-title {
  font-family: var(--cc-font-sans);
  font-size: 30px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--cc-color-text-1);
  margin: 0 0 8px;
}
.od-subtitle {
  font-family: var(--cc-font-sans);
  font-size: 14px;
  color: var(--cc-color-text-3);
  margin: 0;
  display: flex;
  align-items: center;
}
.od-resend-btn {
  font-family: var(--cc-font-sans);
  font-weight: 700;
  font-size: 16px;
  border-radius: 12px;
  padding: 14px 28px;
  background: var(--cc-color-warning-soft) !important;
  border: none !important;
  color: var(--cc-color-warning) !important;
  box-shadow: none;
  transition: all 0.25s;
}
.od-resend-btn:hover {
  transform: translateY(-2px);
  box-shadow: none;
}

.od-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.od-card {
  background: var(--cc-color-surface);
  border: 1px solid var(--cc-color-border-light);
  border-radius: var(--cc-radius-lg);
  padding: 24px;
}
.od-card-title {
  font-family: var(--cc-font-sans);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--cc-color-primary);
  margin: 0 0 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.od-kv {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.od-kv-item {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
}
.od-k {
  font-family: var(--cc-font-sans);
  font-size: 13px;
  color: var(--cc-color-text-3);
  font-weight: 500;
  flex-shrink: 0;
}
.od-v {
  font-family: var(--cc-font-sans);
  font-size: 14px;
  color: var(--cc-color-text-1);
  font-weight: 600;
  text-align: right;
}
.od-json {
  font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 12px;
  color: var(--cc-color-text-1);
  background: var(--cc-color-bg);
  border-radius: 8px;
  padding: 16px;
  margin: 0;
  max-height: 400px;
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-all;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .od-header {
    padding: 20px;
  }
  .od-header-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  .od-title {
    font-size: 24px;
  }
  .od-grid {
    grid-template-columns: 1fr;
  }
}
@media (min-width: 1401px) {
  .od-page {
    max-width: none !important;
    padding: 0 40px;
  }
}
</style>
