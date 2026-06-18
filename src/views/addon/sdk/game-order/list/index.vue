<template>
  <ProPage :title="$t('message.sdk.gameOrder')" :subtitle="$t('message.sdk.game.breadcrumbSdk')">
    <ProSearch
      v-model="form"
      :fields="searchFields"
      collapsible
      :collapse-threshold="4"
      @search="onSearch"
      @reset="onReset"
    />

    <ProToolbar v-model:size="tableSize" @refresh="loadData" />

    <ProTable
      :data="tableData"
      :loading="loading"
      :size="tableSize"
      :total="total"
      :page="page"
      :page-size="size"
      @pagination="onPageChange"
    >
      <el-table-column prop="id" :label="$t('message.common.colId')" width="90" align="center" />
      <el-table-column prop="app_id" :label="$t('message.sdk.game.colAppId')" width="90" align="center" />
      <el-table-column prop="uid" :label="$t('message.sdk.order.colUserId')" width="110" align="center" />
      <el-table-column
        prop="cp_order_id"
        :label="$t('message.sdk.order.cpOrderId')"
        width="150"
        show-overflow-tooltip
      />
      <el-table-column
        prop="product_id"
        :label="$t('message.sdk.order.productId')"
        width="110"
        show-overflow-tooltip
      />
      <el-table-column :label="$t('message.sdk.order.colAmount')" width="120" align="right">
        <template #default="{ row }"
          ><span class="price-text">{{ (row.price / 100).toFixed(2) }}</span>
          <span class="currency-text">{{ row.currency }}</span></template
        >
      </el-table-column>
      <el-table-column prop="pay_channel_code" :label="$t('message.sdk.order.colChannel')" width="90" align="center" />
      <el-table-column :label="$t('message.sdk.order.colStatus')" width="90" align="center">
        <template #default="{ row }"
          ><el-tag :type="statusTag(row.status)" size="small" effect="plain">{{
            statusText(row.status)
          }}</el-tag></template
        >
      </el-table-column>
      <el-table-column prop="notify_status" :label="$t('message.sdk.order.colNotify')" width="80" align="center">
        <template #default="{ row }">
          <el-tag
            :type="
              row.notify_status === 1 ? 'success' : row.notify_status === 2 ? 'danger' : 'info'
            "
            size="small"
            effect="plain"
          >
            {{ notifyText(row.notify_status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="server_id" :label="$t('message.sdk.order.serverId')" width="90" />
      <el-table-column prop="role_id" :label="$t('message.sdk.order.roleId')" width="110" />
      <el-table-column
        prop="created_at"
        :label="$t('message.sdk.order.colTime')"
        width="170"
        align="center"
      >
        <template #default="{ row }">{{
          row.created_at ? new Date(row.created_at * 1000).toLocaleString() : "-"
        }}</template>
      </el-table-column>
      <el-table-column
        :label="$t('message.sdk.order.colAction')"
        width="220"
        fixed="right"
        align="center"
      >
        <template #default="{ row }">
          <el-button link size="small" type="primary" @click="onDetail(row.id)">{{ $t("message.sdk.order.btnDetail") }}</el-button>
          <el-button
            link
            size="small"
            type="warning"
            @click="onResend(row.id)"
            v-if="row.notify_status === 2"
            >{{ $t("message.sdk.order.replenish") }}</el-button
          >
          <el-button
            link
            size="small"
            type="success"
            @click="onClose(row.id)"
            v-if="row.status === 1"
            >{{ $t("message.sdk.order.btnClose") }}</el-button
          >
          <el-button
            link
            size="small"
            type="danger"
            @click="onRefund(row.id)"
            v-if="row.status === 3"
            >{{ $t("message.sdk.order.btnRefund") }}</el-button
          >
        </template>
      </el-table-column>
    </ProTable>
  </ProPage>
</template>

<script lang="ts">
import { computed, defineComponent, ref, reactive, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { ElMessage, ElMessageBox } from "element-plus";
import ProPage from "/@/components/pro/ProPage.vue";
import ProSearch, { type ProSearchField } from "/@/components/pro/ProSearch.vue";
import ProToolbar from "/@/components/pro/ProToolbar.vue";
import ProTable from "/@/components/pro/ProTable.vue";
import { getOrderList, resendOrder, closeOrder, refundOrder, OrderItem } from "/@/api/addon/order";

export default defineComponent({
  name: "addonSdkGameOrderList",
  components: { ProPage, ProSearch, ProToolbar, ProTable },
  setup() {
    const { t } = useI18n();
    const router = useRouter();
    const form = reactive<any>({
      app_id: undefined,
      uid: undefined,
      cp_order_id: "",
      order_id: "",
      status: "",
    });
    const tableData = ref<OrderItem[]>([]);
    const loading = ref(false);
    const tableSize = ref<"large" | "default" | "small">("default");
    const page = ref(1);
    const size = ref(10);
    const total = ref(0);

    const searchFields = computed<ProSearchField[]>(() => [
      { prop: "app_id", label: t("message.sdk.game.colAppId"), type: "number", min: 1, width: "140px" },
      { prop: "uid", label: t("message.sdk.order.colUserId"), type: "number", min: 0, width: "160px" },
      { prop: "cp_order_id", label: t("message.sdk.order.cpOrderId"), width: "170px" },
      { prop: "order_id", label: t("message.sdk.order.colOrderId"), width: "160px" },
      {
        prop: "status",
        label: t("message.sdk.order.colStatus"),
        type: "select",
        width: "140px",
        options: [
          { label: t("message.sdk.order.statusCreated"), value: "1" },
          { label: t("message.sdk.order.statusSubmitted"), value: "2" },
          { label: t("message.sdk.order.statusSuccess"), value: "3" },
          { label: t("message.sdk.order.statusFailed"), value: "-1" },
        ],
      },
    ]);

    const statusTag = (status: number) =>
      (({ 1: "info", 2: "warning", 3: "success", "-1": "danger" }) as any)[String(status)] ||
      "info";
    const statusText = (status: number) =>
      (({ 1: t("message.sdk.order.statusCreated"), 2: t("message.sdk.order.statusSubmitted"), 3: t("message.sdk.order.statusSuccess"), "-1": t("message.sdk.order.statusFailed") }) as any)[String(status)] ||
      String(status);

    const notifyText = (status: number) =>
      status === 1 ? t("message.sdk.order.notifyDone") : status === 2 ? t("message.sdk.order.notifyFailed") : "-";

    const loadData = async () => {
      loading.value = true;
      try {
        const params: any = { page: page.value, row: size.value };
        if (form.app_id) params.app_id = form.app_id;
        if (form.uid) params.uid = form.uid;
        if (form.cp_order_id) params.cp_order_id = form.cp_order_id;
        if (form.order_id) params.order_id = Number(form.order_id);
        if (form.status) params.status = form.status;
        const res: any = await getOrderList(params);
        const data = res.data || res;
        tableData.value = data.list || [];
        total.value = data.total || 0;
      } finally {
        loading.value = false;
      }
    };
    const onSearch = () => {
      page.value = 1;
      loadData();
    };
    const onReset = () => {
      Object.assign(form, {
        app_id: undefined,
        uid: undefined,
        cp_order_id: "",
        order_id: "",
        status: "",
      });
      onSearch();
    };
    const onPageChange = ({ page: nextPage, limit }: { page: number; limit: number }) => {
      page.value = nextPage;
      size.value = limit;
      loadData();
    };
    const onDetail = (id: number) => router.push({ path: "/addon/order/detail", query: { id } });
    const onResend = (id: number) => {
      ElMessageBox.confirm(t("message.sdk.order.replenishConfirmMsg"), t("message.sdk.order.confirmReplenish"), {
        type: "warning",
      })
        .then(async () => {
          try {
            await resendOrder({ order_id: id });
            ElMessage.success(t("message.sdk.order.msgReplenishOk"));
            loadData();
          } catch {
            ElMessage.error(t("message.sdk.order.msgOperationFailed"));
          }
        })
        .catch(() => {});
    };
    const onClose = (id: number) => {
      ElMessageBox.confirm(t("message.sdk.order.confirmClose"), t("message.sdk.order.confirmCloseTitle"), { type: "warning" })
        .then(async () => {
          try {
            await closeOrder({ order_id: id });
            ElMessage.success(t("message.sdk.order.msgCloseOk"));
            loadData();
          } catch {
            ElMessage.error(t("message.sdk.order.msgOperationFailed"));
          }
        })
        .catch(() => {});
    };
    const onRefund = (id: number) => {
      ElMessageBox.confirm(t("message.sdk.order.confirmRefund"), t("message.sdk.order.confirmRefundTitle"), { type: "warning" })
        .then(async () => {
          try {
            await refundOrder({ order_id: id });
            ElMessage.success(t("message.sdk.order.msgRefundOk"));
            loadData();
          } catch {
            ElMessage.error(t("message.sdk.order.msgOperationFailed"));
          }
        })
        .catch(() => {});
    };
    onMounted(() => loadData());
    return {
      form,
      searchFields,
      tableData,
      loading,
      tableSize,
      page,
      size,
      total,
      loadData,
      onSearch,
      onReset,
      onPageChange,
      onDetail,
      onResend,
      onClose,
      onRefund,
      statusTag,
      statusText,
      notifyText,
    };
  },
});
</script>

<style scoped>
.price-text {
  color: var(--cc-color-primary);
  font-weight: 700;
}
.currency-text {
  color: var(--cc-color-text-3);
  font-size: var(--cc-font-12);
}
</style>
