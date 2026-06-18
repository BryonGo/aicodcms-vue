<template>
  <div class="ud-page">
    <el-breadcrumb separator="→">
      <el-breadcrumb-item :to="{ path: '/' }"
        ><el-icon><HomeFilled /></el-icon> {{ $t("message.router.home") }}</el-breadcrumb-item
      >
      <el-breadcrumb-item>{{ $t("message.sdk.game.breadcrumbSdk") }}</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/addon/sdk/user/list' }">{{
        $t("message.sdk.user.title")
      }}</el-breadcrumb-item>
      <el-breadcrumb-item>{{ $t("message.sdk.userDetail") }}</el-breadcrumb-item>
    </el-breadcrumb>

    <div v-if="loading" class="ud-loading">
      <el-icon :size="32" class="ud-spin"><Loading /></el-icon>
      <p>{{ $t("message.sdk.user.detailLoading") }}</p>
    </div>
    <template v-else-if="loadError">
      <div class="ud-error">
        <el-icon :size="48"><WarningFilled /></el-icon>
        <h3>{{ $t("message.sdk.user.detailError") }}</h3>
        <p>{{ loadError }}</p>
        <el-button @click="$router.push('/addon/sdk/user/list')">{{
          $t("message.common.backToList")
        }}</el-button>
      </div>
    </template>
    <template v-else>
      <!-- Profile Card -->
      <div class="ud-profile">
        <div class="ud-profile-bg"></div>
        <el-button link class="ud-back" @click="$router.push('/addon/sdk/user/list')"
          ><el-icon><ArrowLeft /></el-icon> {{ $t("message.sdk.user.backToList") }}</el-button
        >
        <div class="ud-profile-body">
          <el-avatar :size="72" class="ud-pfp">{{
            (user.username || user.email || "U")[0].toUpperCase()
          }}</el-avatar>
          <div class="ud-profile-info">
            <h1 class="ud-name">{{ user.username || user.email || `UID: ${user.id}` }}</h1>
            <div class="ud-badges">
              <span class="ud-type-badge" :class="userTypeClass(user.user_type)">{{
                userTypeLabel(user.user_type)
              }}</span>
              <span class="ud-status-badge" :class="user.status === 1 ? 'active' : 'inactive'">{{
                user.status === 1
                  ? $t("message.sdk.user.statusActive")
                  : $t("message.sdk.user.statusInactive")
              }}</span>
            </div>
          </div>
        </div>
        <div class="ud-profile-actions">
          <el-button type="primary" plain size="large" @click="editDialog = true">
            <el-icon><EditPen /></el-icon> {{ $t("message.common.edit") }}
          </el-button>
          <el-button type="danger" plain size="large" @click="onBan" v-if="user.status !== -1">
            <el-icon><CircleCloseFilled /></el-icon> {{ $t("message.sdk.user.btnBan") }}
          </el-button>
          <el-button type="success" plain size="large" @click="onUnban" v-if="user.status === -1">
            <el-icon><CircleCheckFilled /></el-icon> {{ $t("message.sdk.user.btnUnban") }}
          </el-button>
        </div>
      </div>

      <!-- Info Grid -->
      <div class="ud-grid">
        <div class="ud-card">
          <h3 class="ud-card-title">
            <el-icon><User /></el-icon>{{ $t("message.sdk.user.basicInfo") }}
          </h3>
          <div class="ud-kv">
            <div class="ud-kv-item">
              <span class="ud-k">{{ $t("message.sdk.user.colUserId") }}</span
              ><span class="ud-v mono">{{ user.id }}</span>
            </div>
            <div class="ud-kv-item">
              <span class="ud-k">{{ $t("message.sdk.user.colEmail") }}</span
              ><span class="ud-v">{{ user.email || "—" }}</span>
            </div>
            <div class="ud-kv-item">
              <span class="ud-k">{{ $t("message.sdk.user.colUsername") }}</span
              ><span class="ud-v">{{ user.username || "—" }}</span>
            </div>
            <div class="ud-kv-item">
              <span class="ud-k">{{ $t("message.sdk.user.colAccountType") }}</span
              ><span class="ud-v">{{ userTypeLabel(user.user_type) }}</span>
            </div>
          </div>
        </div>

        <div class="ud-card">
          <h3 class="ud-card-title">
            <el-icon><Monitor /></el-icon>{{ $t("message.sdk.user.deviceInfo") }}
          </h3>
          <div class="ud-kv">
            <div class="ud-kv-item">
              <span class="ud-k">{{ $t("message.sdk.user.colLastLoginIp") }}</span
              ><span class="ud-v mono">{{ user.last_login_ip || "—" }}</span>
            </div>
          </div>
        </div>

        <div class="ud-card">
          <h3 class="ud-card-title">
            <el-icon><Clock /></el-icon>{{ $t("message.sdk.user.timeInfo") }}
          </h3>
          <div class="ud-kv">
            <div class="ud-kv-item">
              <span class="ud-k">{{ $t("message.sdk.user.colRegTime") }}</span
              ><span class="ud-v">{{ fmt(user.created_at) }}</span>
            </div>
            <div class="ud-kv-item">
              <span class="ud-k">{{ $t("message.sdk.user.colLastLogin") }}</span
              ><span class="ud-v">{{ fmt(user.last_login_time) }}</span>
            </div>
            <div class="ud-kv-item">
              <span class="ud-k">{{ $t("message.sdk.user.colLoginCount") }}</span
              ><span class="ud-v mono">{{ user.login_count || 0 }}</span>
            </div>
          </div>
        </div>

        <div class="ud-card">
          <h3 class="ud-card-title">
            <el-icon><Coin /></el-icon>{{ $t("message.sdk.user.payStats") }}
          </h3>
          <div class="ud-kv">
            <div class="ud-kv-item">
              <span class="ud-k">{{ $t("message.sdk.user.totalPay") }}</span
              ><span class="ud-v price">{{ formatPrice(user.total_pay) }}</span>
            </div>
            <div class="ud-kv-item">
              <span class="ud-k">{{ $t("message.sdk.user.orderCount") }}</span
              ><span class="ud-v mono">{{ user.order_count || 0 }}</span>
            </div>
            <div class="ud-kv-item">
              <span class="ud-k">{{ $t("message.sdk.user.refundCount") }}</span
              ><span class="ud-v mono">{{ user.refund_count || 0 }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Orders -->
      <div class="ud-card ud-card-wide" v-if="orders.length">
        <h3 class="ud-card-title">
          <el-icon><List /></el-icon>{{ $t("message.sdk.user.recentOrders") }}
        </h3>
        <el-table
          :data="orders"
          size="small"
          class="ud-orders-table"
          :empty-text="$t('message.sdk.user.noOrders')"
        >
          <el-table-column prop="id" :label="$t('message.sdk.order.colOrderIdFull')" width="90"
            ><template #default="{ row }"
              ><span class="mono-sm">{{ row.id }}</span></template
            ></el-table-column
          >
          <el-table-column
            prop="product_id"
            :label="$t('message.sdk.user.colProduct')"
            min-width="140"
          />
          <el-table-column :label="$t('message.sdk.order.colAmount')" width="100" align="right"
            ><template #default="{ row }"
              ><span class="ud-price-sm">{{ formatPrice(row.price) }}</span></template
            ></el-table-column
          >
          <el-table-column :label="$t('message.common.colStatus')" width="80" align="center"
            ><template #default="{ row }"
              ><el-tag
                :type="row.status === 3 ? 'success' : 'warning'"
                size="small"
                effect="dark"
                round
                >{{
                  row.status === 3
                    ? $t("message.sdk.user.orderDone")
                    : $t("message.sdk.user.orderProcessing")
                }}</el-tag
              ></template
            ></el-table-column
          >
          <el-table-column :label="$t('message.sdk.user.colTime')" width="150" align="center"
            ><template #default="{ row }">{{ fmt(row.created_at) }}</template></el-table-column
          >
        </el-table>
      </div>

      <!-- Association Tabs -->
      <div class="ud-tabs">
        <el-tabs v-model="activeTab" @tab-change="onTabChange">
          <el-tab-pane :label="$t('message.sdk.user.gameRoles')" name="game-users">
            <el-table v-if="gameUsers.length" :data="gameUsers" style="width: 100%">
              <el-table-column prop="app_id" label="App ID" width="80" />
              <el-table-column prop="game_nickname" :label="$t('message.sdk.user.gameNickname')" />
              <el-table-column
                prop="login_count"
                :label="$t('message.sdk.user.colLoginCount')"
                width="90"
              />
              <el-table-column
                prop="last_login_time"
                :label="$t('message.sdk.user.colLastLogin')"
                width="160"
              >
                <template #default="{ row }">{{ fmt(row.last_login_time) }}</template>
              </el-table-column>
              <el-table-column
                prop="last_login_ip"
                :label="$t('message.sdk.user.colIp')"
                width="130"
              />
            </el-table>
            <el-empty v-else :description="$t('message.common.noData')" />
          </el-tab-pane>
          <el-tab-pane :label="$t('message.sdk.user.devicesTab')" name="tokens">
            <el-table v-if="tokens.length" :data="tokens" style="width: 100%">
              <el-table-column prop="id" label="ID" width="80" />
              <el-table-column
                prop="device_info"
                :label="$t('message.sdk.user.deviceInfo')"
                width="160"
              />
              <el-table-column
                prop="expire_at"
                :label="$t('message.sdk.user.colExpireAt')"
                width="160"
              >
                <template #default="{ row }">{{ fmt(row.expire_at) }}</template>
              </el-table-column>
              <el-table-column
                prop="created_at"
                :label="$t('message.sdk.user.colCreatedAt')"
                width="160"
              >
                <template #default="{ row }">{{ fmt(row.created_at) }}</template>
              </el-table-column>
              <el-table-column :label="$t('message.sdk.user.colOperation')" width="100">
                <template #default="{ row }">
                  <el-button type="danger" size="small" @click="onKickOut(row.id)">{{
                    $t("message.sdk.user.btnKickOut")
                  }}</el-button>
                </template>
              </el-table-column>
            </el-table>
            <el-empty v-else :description="$t('message.sdk.user.noTokens')" />
          </el-tab-pane>
          <el-tab-pane :label="$t('message.sdk.user.loginHistory')" name="login-history">
            <el-table v-if="loginHistory.length" :data="loginHistory" style="width: 100%">
              <el-table-column prop="id" label="ID" width="80" />
              <el-table-column prop="app_id" label="App ID" width="80" />
              <el-table-column prop="ip" :label="$t('message.sdk.user.colIp')" width="130" />
              <el-table-column
                prop="device_id"
                :label="$t('message.sdk.user.colDevice')"
                width="150"
              />
              <el-table-column
                prop="login_time"
                :label="$t('message.sdk.user.colTime')"
                width="160"
              >
                <template #default="{ row }">{{ fmt(row.login_time) }}</template>
              </el-table-column>
            </el-table>
            <el-empty v-else :description="$t('message.common.noData')" />
          </el-tab-pane>
        </el-tabs>
      </div>
      <!-- Edit Dialog -->
      <el-drawer
        v-model="editDialog"
        :title="$t('message.common.edit')"
        width="480px"
        @close="
          editForm.nickname = '';
          editForm.avatar = '';
        "
      >
        <el-form label-position="top">
          <el-form-item :label="$t('message.sdk.user.colNickname')">
            <el-input v-model="editForm.nickname" :placeholder="user.nickname || user.username" />
          </el-form-item>
          <el-form-item :label="$t('message.sdk.user.colAvatar')">
            <el-input v-model="editForm.avatar" placeholder="https://..." />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="editDialog = false">{{ $t("message.common.cancel") }}</el-button>
          <el-button type="primary" :loading="editLoading" @click="onSubmitEdit">{{
            $t("message.common.save")
          }}</el-button>
        </template>
      </el-drawer>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, onMounted, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  HomeFilled,
  ArrowLeft,
  User,
  Monitor,
  Clock,
  Coin,
  List,
  Loading,
  WarningFilled,
  CircleCloseFilled,
  CircleCheckFilled,
  EditPen,
} from "@element-plus/icons-vue";
import {
  getUser,
  getUserOrders,
  editUser,
  getGameUsers,
  getLoginHistory,
  getAccounts,
  getDevices,
  getTokenList,
  deleteTokens,
  userTypeLabel,
} from "/@/api/addon/sdk";
import { useI18n } from "vue-i18n";

export default defineComponent({
  name: "addonSdkUserDetail",
  components: {
    HomeFilled,
    ArrowLeft,
    User,
    Monitor,
    Clock,
    Coin,
    List,
    Loading,
    WarningFilled,
    CircleCloseFilled,
    CircleCheckFilled,
    EditPen,
  },
  setup() {
    const { t } = useI18n();
    const route = useRoute();
    const router = useRouter();
    const loading = ref(true);
    const loadError = ref("");
    const user = ref<any>({});
    const orders = ref<any[]>([]);
    const activeTab = ref("game-users");
    const gameUsers = ref<any[]>([]);
    const loginHistory = ref<any[]>([]);
    const accounts = ref<any[]>([]);
    const devices = ref<any[]>([]);
    const tokens = ref<any[]>([]);

    const fmt = (ts: number) =>
      ts > 0
        ? new Date(ts * 1000).toLocaleString("zh-CN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "—";
    const formatPrice = (p: number) => {
      if (!p || isNaN(Number(p))) return "¥0.00";
      return "¥" + (Number(p) / 100).toFixed(2);
    };
    const userTypeClass = (type: number) => {
      const map: Record<number, string> = {
        1: "type-email",
        2: "type-guest",
        3: "type-google",
        4: "type-facebook",
        5: "type-apple",
      };
      return map[type] || "type-unknown";
    };

    const loadData = async () => {
      const id = String(route.query.id as string);
      if (!id) {
        loadError.value = t("message.sdk.user.missingUserId");
        loading.value = false;
        return;
      }
      try {
        const res: any = await getUser({ id });
        const d = res.data || res;
        const item = d.user || d;
        if (!item || !item.id) {
          loadError.value = t("message.sdk.user.userNotFound");
          return;
        }
        user.value = item;
        try {
          const or: any = await getUserOrders({ uid: id, row: 20 });
          orders.value = (or.data || or).list || [];
        } catch {
          orders.value = [];
        }
        try {
          const gu: any = await getGameUsers({ uid: id });
          gameUsers.value = (gu.data || gu).list || [];
        } catch {
          gameUsers.value = [];
        }
        try {
          const lh: any = await getLoginHistory({ uid: id, row: 20 });
          loginHistory.value = (lh.data || lh).list || [];
        } catch {
          loginHistory.value = [];
        }
        try {
          const ac: any = await getAccounts({ uid: id });
          accounts.value = (ac.data || ac).list || [];
        } catch {
          accounts.value = [];
        }
        try {
          const dv: any = await getDevices({ uid: id });
          devices.value = (dv.data || dv).list || [];
        } catch {
          devices.value = [];
        }
        try {
          const tk: any = await getTokenList({ uid: id });
          tokens.value = (tk.data || tk).list || [];
        } catch {
          tokens.value = [];
        }
      } catch {
        loadError.value = t("message.common.msgNetworkError");
      } finally {
        loading.value = false;
      }
    };

    const editDialog = ref(false);
    const editLoading = ref(false);
    const editForm = reactive({ nickname: "", avatar: "" });
    const onSubmitEdit = async () => {
      editLoading.value = true;
      try {
        await editUser({
          id: user.value.id,
          nickname: editForm.nickname || undefined,
          avatar: editForm.avatar || undefined,
        });
        ElMessage.success(t("message.sdk.user.editSuccess"));
        editDialog.value = false;
        loadData();
      } catch {
        ElMessage.error(t("message.common.msgNetworkError"));
      } finally {
        editLoading.value = false;
      }
    };

    const onTabChange = async (name: string) => {
      const id = String(route.query.id as string);
      if (!id) return;
      if (name === "game-users" && !gameUsers.value.length) {
        try {
          const gu: any = await getGameUsers({ uid: id });
          gameUsers.value = (gu.data || gu).list || [];
        } catch {
          gameUsers.value = [];
        }
      } else if (name === "login-history" && !loginHistory.value.length) {
        try {
          const lh: any = await getLoginHistory({ uid: id, row: 20 });
          loginHistory.value = (lh.data || lh).list || [];
        } catch {
          loginHistory.value = [];
        }
      } else if (name === "accounts" && !accounts.value.length) {
        try {
          const ac: any = await getAccounts({ uid: id });
          accounts.value = (ac.data || ac).list || [];
        } catch {
          accounts.value = [];
        }
      } else if (name === "devices" && !devices.value.length) {
        try {
          const dv: any = await getDevices({ uid: id });
          devices.value = (dv.data || dv).list || [];
        } catch {
          devices.value = [];
        }
        try {
          const tk: any = await getTokenList({ uid: id });
          tokens.value = (tk.data || tk).list || [];
        } catch {
          tokens.value = [];
        }
      }
    };

    const onBan = () => {
      ElMessageBox.confirm(
        t("message.sdk.user.banConfirm", {
          name: user.value.username || user.value.email || user.value.id,
        }),
        t("message.sdk.user.banConfirmTitle"),
        { type: "warning" },
      )
        .then(async () => {
          ElMessage.success(t("message.sdk.user.banSuccess"));
          loadData();
        })
        .catch(() => {});
    };
    const onUnban = () => {
      ElMessageBox.confirm(
        t("message.sdk.user.unbanConfirm"),
        t("message.sdk.user.unbanConfirmTitle"),
        { type: "warning" },
      )
        .then(async () => {
          ElMessage.success(t("message.sdk.user.unbanSuccess"));
          loadData();
        })
        .catch(() => {});
    };

    const onKickOut = (id: number) => {
      ElMessageBox.confirm(
        t("message.sdk.user.confirmKickOut"),
        t("message.sdk.user.confirmKickOutTitle"),
        { type: "warning" },
      )
        .then(async () => {
          try {
            await deleteTokens({ ids: [id] });
            ElMessage.success(t("message.sdk.user.kickOutSuccess"));
            const tk: any = await getTokenList({ uid: String(route.query.id) });
            tokens.value = (tk.data || tk).list || [];
          } catch {
            ElMessage.error(t("message.sdk.user.kickOutFailed"));
          }
        })
        .catch(() => {});
    };

    onMounted(() => loadData());
    return {
      loading,
      loadError,
      user,
      orders,
      fmt,
      formatPrice,
      userTypeClass,
      onBan,
      onUnban,
      userTypeLabel,
      editDialog,
      editLoading,
      editForm,
      onSubmitEdit,
      activeTab,
      gameUsers,
      loginHistory,
      accounts,
      devices,
      tokens,
      onTabChange,
      onKickOut,
    };
  },
});
</script>

<style scoped>
.ud-page {
  max-width: 1200px;
  margin: 0 auto;
  padding-bottom: 40px;
}
.mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-weight: 600;
}
.mono-sm {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: var(--cc-font-12);
  color: var(--cc-color-text-3);
}

.ud-spin {
  animation: ud-spin 1s linear infinite;
  color: var(--cc-color-primary);
}
@keyframes ud-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
.ud-loading,
.ud-error {
  margin-top: var(--cc-space-5);
  padding: var(--cc-space-8) var(--cc-space-5);
  text-align: center;
  color: var(--cc-color-text-3);
  background: var(--cc-color-surface);
  border: 1px solid var(--cc-color-border-light);
  border-radius: var(--cc-radius-lg);
  box-shadow: var(--cc-shadow-card);
}
.ud-error h3 {
  margin: var(--cc-space-4) 0 var(--cc-space-2);
  color: var(--cc-color-text-1);
}

/* ---- Profile ---- */
.ud-profile {
  position: relative;
  margin: var(--cc-space-5) 0 var(--cc-space-4);
  padding: var(--cc-space-7) var(--cc-space-7) var(--cc-space-6);
  overflow: hidden;
  background: var(--cc-color-surface);
  border: 1px solid var(--cc-color-border-light);
  border-radius: var(--cc-radius-xl);
  box-shadow: var(--cc-shadow-card);
}
.ud-profile-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(
      circle at 14% 8%,
      color-mix(in srgb, var(--cc-color-primary) 14%, transparent) 0%,
      transparent 34%
    ),
    radial-gradient(
      circle at 90% 18%,
      color-mix(in srgb, var(--cc-color-success) 10%, transparent) 0%,
      transparent 32%
    );
}
.ud-back {
  position: relative;
  z-index: 1;
  padding: 0;
  margin-bottom: var(--cc-space-5);
  color: var(--cc-color-text-3);
  font-size: var(--cc-font-13);
  font-weight: 500;
  transition: color 0.18s ease;
}
.ud-back:hover {
  color: var(--cc-color-primary);
}
.ud-profile-body {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: var(--cc-space-5);
}
.ud-pfp {
  color: var(--cc-color-text-inverse);
  font-size: 28px;
  font-weight: 700;
  background: var(--cc-grad-mint);
  box-shadow: 0 10px 28px color-mix(in srgb, var(--cc-color-primary) 22%, transparent);
}
.ud-name {
  margin: 0 0 var(--cc-space-2);
  color: var(--cc-color-text-1);
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.02em;
}
.ud-badges {
  display: flex;
  flex-wrap: wrap;
  gap: var(--cc-space-2);
}
.ud-type-badge,
.ud-status-badge {
  display: inline-flex;
  align-items: center;
  height: 24px;
  padding: 0 12px;
  border-radius: 999px;
  font-size: var(--cc-font-12);
  font-weight: 600;
  border: 1px solid transparent;
}
.ud-type-badge.type-email,
.ud-type-badge.type-facebook {
  color: var(--cc-color-primary);
  background: var(--cc-color-primary-softer);
  border-color: color-mix(in srgb, var(--cc-color-primary) 18%, transparent);
}
.ud-type-badge.type-guest,
.ud-type-badge.type-unknown {
  color: var(--cc-color-text-3);
  background: var(--cc-color-surface-hover);
  border-color: var(--cc-color-border-light);
}
.ud-type-badge.type-google {
  color: var(--cc-color-danger);
  background: color-mix(in srgb, var(--cc-color-danger) 10%, transparent);
  border-color: color-mix(in srgb, var(--cc-color-danger) 20%, transparent);
}
.ud-type-badge.type-apple {
  color: var(--cc-color-text-1);
  background: var(--cc-color-bg-elevated);
  border-color: var(--cc-color-border-light);
}
.ud-status-badge.active {
  color: var(--cc-color-success);
  background: color-mix(in srgb, var(--cc-color-success) 10%, transparent);
  border-color: color-mix(in srgb, var(--cc-color-success) 20%, transparent);
}
.ud-status-badge.inactive {
  color: var(--cc-color-text-3);
  background: var(--cc-color-surface-hover);
  border-color: var(--cc-color-border-light);
}
.ud-profile-actions {
  position: absolute;
  top: var(--cc-space-7);
  right: var(--cc-space-7);
  z-index: 1;
  display: flex;
  gap: var(--cc-space-2);
  flex-wrap: wrap;
  justify-content: flex-end;
}
.ud-profile-actions .el-button {
  font-weight: 600;
  border-radius: var(--cc-radius-md);
}

/* ---- Cards ---- */
.ud-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--cc-space-4);
  margin-bottom: var(--cc-space-4);
}
.ud-card,
.ud-tabs {
  background: var(--cc-color-surface);
  border: 1px solid var(--cc-color-border-light);
  border-radius: var(--cc-radius-lg);
  box-shadow: var(--cc-shadow-card);
}
.ud-card {
  padding: var(--cc-space-5);
}
.ud-card-wide {
  grid-column: 1 / -1;
  margin-bottom: var(--cc-space-4);
}
.ud-card-title {
  display: flex;
  align-items: center;
  gap: var(--cc-space-2);
  margin: 0 0 var(--cc-space-4);
  color: var(--cc-color-primary);
  font-size: var(--cc-font-13);
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.ud-kv {
  display: flex;
  flex-direction: column;
  gap: var(--cc-space-3);
}
.ud-kv-item {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--cc-space-3);
}
.ud-k {
  flex-shrink: 0;
  color: var(--cc-color-text-3);
  font-size: var(--cc-font-13);
  font-weight: 500;
}
.ud-v {
  color: var(--cc-color-text-1);
  font-size: var(--cc-font-14);
  font-weight: 600;
  text-align: right;
}
.ud-v.price,
.ud-price-sm {
  color: var(--cc-color-success);
  font-weight: 700;
}
.ud-v.price {
  font-size: 18px;
}
.ud-price-sm {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.ud-orders-table {
  font-size: var(--cc-font-13);
}
.ud-orders-table :deep(th.el-table__cell) {
  color: var(--cc-color-text-3) !important;
  background: var(--cc-color-bg) !important;
}
.ud-orders-table :deep(.el-table__row:hover > td.el-table__cell) {
  background: var(--cc-color-surface-hover) !important;
}

.ud-tabs {
  padding: var(--cc-space-4) var(--cc-space-5) var(--cc-space-5);
}
.ud-tabs :deep(.el-tabs__header) {
  margin-bottom: var(--cc-space-4);
}
.ud-tabs :deep(.el-table) {
  --el-table-header-bg-color: var(--cc-color-bg);
}

@media (max-width: 768px) {
  .ud-profile {
    padding: var(--cc-space-5);
  }
  .ud-profile-body {
    flex-direction: column;
    text-align: center;
  }
  .ud-profile-actions {
    position: static;
    margin-top: var(--cc-space-4);
    justify-content: center;
  }
  .ud-grid {
    grid-template-columns: 1fr;
  }
  .ud-name {
    font-size: 22px;
  }
}
@media (min-width: 1401px) {
  .ud-page {
    max-width: none !important;
    padding: 0 40px 40px;
  }
}
</style>
