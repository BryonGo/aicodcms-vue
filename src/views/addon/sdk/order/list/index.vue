<template>
  <ProPage :title="$t('message.sdk.order.title')" :subtitle="$t('message.sdk.order.subtitle')">
    <template #actions>
      <el-button plain :icon="Download" @click="onExport">{{
        $t("message.sdk.order.btnExport")
      }}</el-button>
    </template>

    <el-alert type="info" :closable="false" show-icon>
      <template #title>
        <span class="order-alert">
          <b>{{ $t("message.sdk.order.alertTitle") }}</b
          >{{ $t("message.sdk.order.alertStatusFlow") }}
          <b>{{ $t("message.sdk.order.alertNotifyTitle") }}</b
          ><span class="text-success">{{ $t("message.sdk.order.notifyDone") }}</span
          >{{ $t("message.sdk.order.alertSuccessHint") }}
          <span class="text-warning">{{ $t("message.sdk.order.notifyPending") }}</span> /
          <span class="text-danger">{{ $t("message.sdk.order.notifyFailed") }}</span
          >{{ $t("message.sdk.order.alertNotifyFailedHint")
          }}<b>{{ $t("message.sdk.order.alertReplenishQuote") }}</b
          >{{ $t("message.sdk.order.alertReplenishSuffix") }}
        </span>
      </template>
    </el-alert>

    <ProSearch
      v-model="searchForm"
      :fields="searchFields"
      collapsible
      :collapse-threshold="4"
      @search="onSearch"
      @reset="onReset"
    >
      <template #field-date_range>
        <el-date-picker
          v-model="dateRange"
          type="datetimerange"
          range-separator="—"
          :start-placeholder="$t('message.sdk.order.dateStart')"
          :end-placeholder="$t('message.sdk.order.dateEnd')"
          value-format="x"
          class="order-date-range"
          @change="onSearch"
        />
      </template>
      <template #field-advanced>
        <el-popover
          placement="bottom-start"
          :width="480"
          trigger="click"
          v-model:visible="advVisible"
        >
          <template #reference>
            <el-button :type="advBtnType" size="default">
              <el-icon><Filter /></el-icon> {{ $t("message.sdk.order.advancedSearch") }}
              <el-tag v-if="advCount" size="small" effect="dark" round class="adv-count">{{
                advCount
              }}</el-tag>
            </el-button>
          </template>
          <div class="adv-panel">
            <div class="adv-section">
              <h4>{{ $t("message.sdk.order.moreConditions") }}</h4>
              <el-row :gutter="12">
                <el-col :span="12"
                  ><el-form-item :label="$t('message.sdk.order.productId')"
                    ><el-input
                      v-model="adv.product_id"
                      :placeholder="$t('message.sdk.order.productIdPlaceholder')"
                      size="small"
                      clearable /></el-form-item
                ></el-col>
                <el-col :span="12"
                  ><el-form-item :label="$t('message.sdk.order.notifyStatus')"
                    ><el-select
                      v-model="adv.notify_status"
                      :placeholder="$t('message.common.status')"
                      size="small"
                      clearable
                      class="w100"
                      ><el-option
                        :label="$t('message.sdk.order.notifyDone')"
                        :value="1" /><el-option
                        :label="$t('message.sdk.order.notifyPending')"
                        :value="0" /><el-option
                        :label="$t('message.sdk.order.notifyFailed')"
                        :value="2" /></el-select></el-form-item
                ></el-col>
                <el-col :span="12"
                  ><el-form-item :label="$t('message.sdk.order.roleId')"
                    ><el-input
                      v-model="adv.role_id"
                      :placeholder="$t('message.sdk.order.roleId')"
                      size="small"
                      clearable /></el-form-item
                ></el-col>
                <el-col :span="12"
                  ><el-form-item :label="$t('message.sdk.order.serverId')"
                    ><el-input
                      v-model="adv.server_id"
                      :placeholder="$t('message.sdk.order.serverIdPlaceholder')"
                      size="small"
                      clearable /></el-form-item
                ></el-col>
              </el-row>
            </div>
            <div class="adv-actions">
              <el-button size="small" @click="clearAdv">{{
                $t("message.sdk.order.clearAll")
              }}</el-button>
              <el-button type="primary" size="small" @click="applyAdv">{{
                $t("message.sdk.order.apply")
              }}</el-button>
            </div>
          </div>
        </el-popover>
      </template>
    </ProSearch>

    <ProToolbar v-model:size="tableSize" @refresh="loadData" />

    <ProTable
      :data="tableData"
      :loading="loading"
      :size="tableSize"
      :total="total"
      :page="page"
      :page-size="size"
      selection
      @selection-change="onSelectionChange"
      @pagination="onPageChange"
    >
      <el-table-column
        prop="id"
        :label="$t('message.sdk.order.colOrderIdFull')"
        width="110"
        align="center"
      >
        <template #default="{ row }"
          ><router-link :to="`/addon/sdk/order/detail?id=${row.id}`" class="order-id-link">{{
            row.id
          }}</router-link></template
        >
      </el-table-column>
      <el-table-column prop="uid" label="UID" width="120" align="center" />
      <el-table-column
        prop="product_name"
        :label="$t('message.sdk.order.colProductName')"
        min-width="160"
        show-overflow-tooltip
      />
      <el-table-column :label="$t('message.sdk.order.colAmount')" width="120" align="right">
        <template #default="{ row }"
          ><span class="order-price">{{ formatPrice(row.price) }}</span>
          <span class="order-currency">{{ row.currency }}</span></template
        >
      </el-table-column>
      <el-table-column :label="$t('message.common.colStatus')" width="100" align="center">
        <template #default="{ row }"
          ><el-tag :type="statusTag(row.status)" size="small" effect="plain" round>{{
            statusText(row.status)
          }}</el-tag></template
        >
      </el-table-column>
      <el-table-column :label="$t('message.sdk.order.delivery')" width="100" align="center">
        <template #default="{ row }"
          ><el-tag :type="notifyTag(row.notify_status)" size="small" effect="plain" round>{{
            notifyText(row.notify_status)
          }}</el-tag></template
        >
      </el-table-column>
      <el-table-column
        prop="cp_order_id"
        :label="$t('message.sdk.order.cpOrderId')"
        min-width="170"
        show-overflow-tooltip
      />
      <el-table-column
        prop="created_at"
        :label="$t('message.common.colCreateTime')"
        width="170"
        align="center"
      >
        <template #default="{ row }">{{ fmt(row.created_at) }}</template>
      </el-table-column>
      <el-table-column
        :label="$t('message.common.colOperation')"
        width="160"
        fixed="right"
        align="center"
      >
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="onDetail(row)">{{
            $t("message.common.detail")
          }}</el-button>
          <el-button
            v-if="row.status !== 3 || row.notify_status !== 1"
            link
            type="warning"
            size="small"
            @click="onResend(row)"
            >{{ $t("message.sdk.order.replenish") }}</el-button
          >
        </template>
      </el-table-column>
    </ProTable>
  </ProPage>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, computed, onMounted, onActivated } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { Download, Filter } from "@element-plus/icons-vue";
import { useI18n } from "vue-i18n";
import ProPage from "/@/components/pro/ProPage.vue";
import ProSearch, { type ProSearchField } from "/@/components/pro/ProSearch.vue";
import ProToolbar from "/@/components/pro/ProToolbar.vue";
import ProTable from "/@/components/pro/ProTable.vue";
import { getOrderList, OrderItem, resendOrder } from "/@/api/addon/order";

export default defineComponent({
  name: "addonSdkOrderList",
  components: { ProPage, ProSearch, ProToolbar, ProTable, Download, Filter },
  setup() {
    const { t } = useI18n();
    const router = useRouter();
    const searchForm = reactive<any>({
      order_id: undefined,
      app_id: undefined,
      uid: undefined,
      status: "",
      cp_order_id: "",
      keyword: "",
    });
    const dateRange = ref<string[]>([]);
    const advVisible = ref(false);
    const adv = reactive({ product_id: "", notify_status: "", role_id: "", server_id: "" });
    const advCount = computed(
      () => Object.values(adv).filter((v) => v !== "" && v !== null).length,
    );
    const advBtnType = computed(() => (advCount.value > 0 ? "warning" : "default"));
    const searchFields = computed<ProSearchField[]>(() => [
      { prop: "date_range", label: t("message.sdk.order.colTime"), type: "slot", width: "340px" },
      { prop: "app_id", label: "AppID", type: "number", min: 0, width: "130px" },
      { prop: "uid", label: "UID", type: "number", min: 0, width: "160px" },
      {
        prop: "order_id",
        label: t("message.sdk.order.placeholderOrderId"),
        type: "number",
        min: 0,
        width: "160px",
      },
      {
        prop: "status",
        label: t("message.sdk.order.filterStatus"),
        type: "select",
        width: "140px",
        options: [
          { label: t("message.sdk.order.statusCreated"), value: 1 },
          { label: t("message.sdk.order.statusSubmitted"), value: 2 },
          { label: t("message.cms.sta.statusCompleted"), value: 3 },
          { label: t("message.cms.sta.statusFailed"), value: -1 },
        ],
      },
      { prop: "cp_order_id", label: t("message.sdk.order.cpOrderId"), width: "170px" },
      { prop: "advanced", label: "", type: "slot", width: "170px" },
    ]);

    const tableData = ref<OrderItem[]>([]);
    const loading = ref(false);
    const tableSize = ref<"large" | "default" | "small">("default");
    const page = ref(1);
    const size = ref(10);
    const total = ref(0);
    const selectedIds = ref<number[]>([]);

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
      )[s] || "—";
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
          })
        : "—";
    const formatPrice = (price: number) =>
      isNaN(Number(price)) ? "0.00" : (Number(price) / 100).toFixed(2);

    const buildParams = () => {
      const params: any = { page: page.value, row: size.value };
      if (
        searchForm.order_id !== undefined &&
        searchForm.order_id !== null &&
        searchForm.order_id !== ""
      )
        params.order_id = searchForm.order_id;
      if (searchForm.app_id !== undefined && searchForm.app_id !== null && searchForm.app_id !== "")
        params.app_id = searchForm.app_id;
      if (searchForm.uid !== undefined && searchForm.uid !== null && searchForm.uid !== "")
        params.uid = searchForm.uid;
      if (searchForm.status !== "") params.status = searchForm.status;
      if (searchForm.cp_order_id) params.cp_order_id = searchForm.cp_order_id;
      if (adv.product_id) params.product_id = adv.product_id;
      if (adv.notify_status !== "") params.notify_status = adv.notify_status;
      if (adv.role_id) params.role_id = adv.role_id;
      if (adv.server_id) params.server_id = adv.server_id;
      if (dateRange.value && dateRange.value.length === 2) {
        params.start_time = Math.floor(Number(dateRange.value[0]) / 1000);
        params.end_time = Math.floor(Number(dateRange.value[1]) / 1000);
      }
      return params;
    };

    const loadData = async () => {
      loading.value = true;
      try {
        const res: any = await getOrderList(buildParams());
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
      Object.assign(searchForm, {
        order_id: undefined,
        app_id: undefined,
        uid: undefined,
        status: "",
        cp_order_id: "",
        keyword: "",
      });
      dateRange.value = [];
      clearAdv();
      onSearch();
    };
    const onPageChange = ({ page: nextPage, limit }: { page: number; limit: number }) => {
      page.value = nextPage;
      size.value = limit;
      loadData();
    };
    const onSelectionChange = (rows: OrderItem[]) => {
      selectedIds.value = rows.map((row) => row.id);
    };
    const applyAdv = () => {
      advVisible.value = false;
      onSearch();
    };
    const clearAdv = () => {
      Object.assign(adv, { product_id: "", notify_status: "", role_id: "", server_id: "" });
    };
    const onDetail = (row: OrderItem) => router.push(`/addon/sdk/order/detail?id=${row.id}`);
    const onExport = () => {
      ElMessage.info(t("message.sdk.order.exportPendingHint"));
    };
    const onResend = (row: OrderItem) => {
      ElMessageBox.confirm(
        t("message.sdk.order.replenishConfirmMsg"),
        t("message.sdk.order.confirmReplenish"),
        { type: "warning" },
      )
        .then(async () => {
          await resendOrder({ order_id: row.id });
          ElMessage.success(t("message.sdk.order.msgReplenishOk"));
          loadData();
        })
        .catch(() => {});
    };

    onMounted(() => loadData());
    onActivated(() => loadData());
    return {
      searchForm,
      searchFields,
      dateRange,
      advVisible,
      adv,
      advCount,
      advBtnType,
      tableData,
      loading,
      tableSize,
      page,
      size,
      total,
      selectedIds,
      statusText,
      statusTag,
      notifyText,
      notifyTag,
      fmt,
      formatPrice,
      loadData,
      onSearch,
      onReset,
      onPageChange,
      onSelectionChange,
      applyAdv,
      clearAdv,
      onDetail,
      onExport,
      onResend,
      Download,
      Filter,
    };
  },
});
</script>

<style scoped>
.order-alert {
  font-size: var(--cc-font-13);
  line-height: 1.6;
}
.text-success {
  color: var(--cc-color-success);
}
.text-warning {
  color: var(--cc-color-warning);
}
.text-danger {
  color: var(--cc-color-danger);
}
.order-date-range {
  width: 340px;
}
.adv-count {
  margin-left: var(--cc-space-1);
}
.adv-panel {
  display: flex;
  flex-direction: column;
}
.adv-section h4 {
  margin: 0 0 var(--cc-space-3);
  color: var(--cc-color-primary);
  font-size: var(--cc-font-13);
  font-weight: 600;
}
.adv-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--cc-space-2);
  padding-top: var(--cc-space-3);
  margin-top: var(--cc-space-3);
  border-top: 1px solid var(--cc-color-border-light);
}
.order-id-link {
  color: var(--cc-color-primary);
  font-weight: 700;
  text-decoration: none;
}
.order-id-link:hover {
  text-decoration: underline;
}
.order-price {
  color: var(--cc-color-primary);
  font-weight: 700;
}
.order-currency {
  color: var(--cc-color-text-3);
  font-size: var(--cc-font-12);
}
@media (max-width: 768px) {
  .order-date-range {
    width: 100%;
  }
}
</style>
