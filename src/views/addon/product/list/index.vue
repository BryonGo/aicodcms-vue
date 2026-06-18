<template>
  <ProPage
    :title="$t('message.sdk.product.breadcrumbProduct')"
    :subtitle="$t('message.sdk.product.listSubtitle')"
  >
    <template #actions>
      <el-button plain @click="showRecycle = true">{{
        $t("message.sdk.product.recycleTitle")
      }}</el-button>
      <el-button type="primary" @click="onAdd">{{ $t("message.sdk.product.btnAdd") }}</el-button>
    </template>

    <ProSearch v-model="searchForm" :fields="searchFields" @search="onSearch" @reset="onReset" />

    <ProToolbar v-model:size="tableSize" @refresh="loadData">
      <el-button v-if="selectedIds.length" type="danger" plain @click="onBatchDelete">
        {{ $t("message.sdk.product.batchDelete", { count: selectedIds.length }) }}
      </el-button>
    </ProToolbar>

    <ProTable
      :data="tableData"
      :loading="loading"
      :size="tableSize"
      :total="total"
      :page="page"
      :page-size="size"
      :empty-text="$t('message.sdk.product.emptyText')"
      selection
      @selection-change="onSelectionChange"
      @pagination="onPageChange"
    >
      <el-table-column :label="$t('message.sdk.product.colType')" width="100" align="center">
        <template #default="{ row }">
          <el-tag
            size="small"
            :type="row.type === 0 ? 'success' : row.type === 1 ? 'warning' : 'info'"
            effect="plain"
            round
          >
            {{ typeText(row.type) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('message.sdk.product.colName')"
        min-width="180"
        show-overflow-tooltip
      >
        <template #default="{ row }">
          <router-link :to="editLink(row)" class="product-link">{{
            row.name || $t("message.sdk.product.unnamed")
          }}</router-link>
          <span class="product-id">{{ row.extra?.local_product_id || "-" }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('message.sdk.product.colDefaultPrice')" width="130" align="right">
        <template #default="{ row }">
          <span class="product-price">¥{{ (row.price / 100).toFixed(2) }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('message.sdk.product.colStatus')" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="row.state === 1 ? 'success' : 'info'" size="small" effect="light" round>
            {{ row.state === 1 ? $t("message.common.enabled") : $t("message.common.disabled") }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('message.sdk.product.colAction')"
        width="140"
        fixed="right"
        align="center"
      >
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="onEdit(row)">{{
            $t("message.sdk.product.btnEdit")
          }}</el-button>
          <el-button link type="danger" size="small" @click="onDelete(row)">{{
            $t("message.sdk.product.btnDelete")
          }}</el-button>
        </template>
      </el-table-column>
    </ProTable>

    <!-- 回收站弹窗 -->
    <el-drawer
      v-model="showRecycle"
      :title="$t('message.sdk.product.recycleTitle')"
      width="720px"
      @open="
        () => {
          recycleTab = 'product';
          loadRecycle();
        }
      "
    >
      <el-tabs v-model="recycleTab" @tab-change="onRecycleTabChange">
        <el-tab-pane
          :label="t('message.sdk.product.tabProduct') + ' (' + (recycleProdTotal || 0) + ')'"
          name="product"
        >
          <el-table
            :data="recycleProdData"
            v-loading="recycleProdLoading"
            size="small"
            :empty-text="$t('message.sdk.product.recycleEmpty')"
            @selection-change="onRecycleProdSelect"
            max-height="380"
          >
            <el-table-column type="selection" width="36" />
            <el-table-column :label="$t('message.sdk.product.colName')" min-width="140">
              <template #default="{ row }">{{ row.name }}</template>
            </el-table-column>
            <el-table-column
              :label="$t('message.sdk.product.colDefaultPrice')"
              width="80"
              align="right"
            >
              <template #default="{ row }">¥{{ (row.price / 100).toFixed(2) }}</template>
            </el-table-column>
            <el-table-column :label="$t('message.sdk.product.colDeletedAt')" min-width="130">
              <template #default="{ row }">{{ fmtUnix(row.deleted_at) }}</template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane :label="'SKU (' + (recycleSkuTotal || 0) + ')'" name="sku">
          <el-table
            :data="recycleSkuData"
            v-loading="recycleSkuLoading"
            size="small"
            max-height="380"
            @selection-change="onRecycleSkuSelect"
          >
            <el-table-column type="selection" width="36" />
            <el-table-column
              prop="channel_code"
              :label="$t('message.sdk.product.colChannel')"
              width="100"
            />
            <el-table-column
              prop="sku"
              :label="$t('message.sdk.product.colSkuId')"
              min-width="140"
            />
            <el-table-column
              prop="price"
              :label="$t('message.sdk.product.colPrice')"
              width="80"
              align="right"
            >
              <template #default="{ row }">¥{{ (row.price / 100).toFixed(2) }}</template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane
          :label="t('message.sdk.product.tabTranslation') + ' (' + (recycleTransTotal || 0) + ')'"
          name="trans"
        >
          <el-table
            :data="recycleTransData"
            v-loading="recycleTransLoading"
            size="small"
            max-height="380"
            @selection-change="onRecycleTransSelect"
          >
            <el-table-column type="selection" width="36" />
            <el-table-column prop="lang" :label="$t('message.sdk.product.colLang')" width="80" />
            <el-table-column
              prop="name"
              :label="$t('message.sdk.product.colName')"
              min-width="140"
            />
          </el-table>
        </el-tab-pane>
      </el-tabs>
      <template #footer>
        <el-button @click="showRecycle = false">{{
          $t("message.sdk.product.btnCancel")
        }}</el-button>
        <el-button
          type="primary"
          :disabled="!rcSel.length"
          :loading="rcLoading"
          @click="onRecycleRestore"
          >{{ $t("message.sdk.product.restore", { count: rcSel.length }) }}</el-button
        >
        <el-button type="danger" :disabled="!rcSel.length" @click="onRecyclePurge">{{
          $t("message.sdk.product.purge")
        }}</el-button>
      </template>
    </el-drawer>
  </ProPage>
</template>

<script lang="ts">
import { computed, defineComponent, ref, reactive, onMounted, onActivated } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  getProductList,
  deleteProduct,
  getRecycleList,
  restoreProduct,
  purgeProduct,
  getSkuRecycleList,
  restoreSku,
  purgeSku,
  getTransRecycleList,
  restoreTrans,
  purgeTrans,
  ProductItem,
} from "/@/api/addon/product";
import { useI18n } from "vue-i18n";
import ProPage from "/@/components/pro/ProPage.vue";
import ProSearch, { type ProSearchField } from "/@/components/pro/ProSearch.vue";
import ProToolbar from "/@/components/pro/ProToolbar.vue";
import ProTable from "/@/components/pro/ProTable.vue";

export default defineComponent({
  name: "addonProductList",
  components: { ProPage, ProSearch, ProToolbar, ProTable },
  setup() {
    const { t } = useI18n();
    const router = useRouter();
    const searchForm = reactive({ keyword: "", type: -1 });
    const searchFields = computed<ProSearchField[]>(() => [
      {
        prop: "type",
        label: t("message.sdk.product.colType"),
        type: "select",
        width: "160px",
        options: [
          { label: t("message.common.all"), value: -1 },
          { label: t("message.sdk.product.type0"), value: 0 },
          { label: t("message.sdk.product.type1"), value: 1 },
          { label: t("message.sdk.product.type4"), value: 4 },
        ],
      },
      {
        prop: "keyword",
        label: t("message.common.search"),
        placeholder: t("message.sdk.product.searchPlaceholder"),
        width: "240px",
      },
    ]);
    const tableData = ref<ProductItem[]>([]);
    const loading = ref(false);
    const tableSize = ref<"large" | "default" | "small">("default");
    const page = ref(1);
    const size = ref(12);
    const total = ref(0);
    const selectedIds = ref<number[]>([]);
    // 回收站（三 Tab）
    const showRecycle = ref(false);
    const recycleTab = ref("product");
    const rcSel = ref<number[]>([]);
    const rcLoading = ref(false);

    // 商品 Tab
    const recycleProdData = ref<any[]>([]);
    const recycleProdLoading = ref(false);
    const recycleProdTotal = ref(0);
    // SKU Tab
    const recycleSkuData = ref<any[]>([]);
    const recycleSkuLoading = ref(false);
    const recycleSkuTotal = ref(0);
    // 翻译 Tab
    const recycleTransData = ref<any[]>([]);
    const recycleTransLoading = ref(false);
    const recycleTransTotal = ref(0);

    const loadRecycle = async () => {
      loadRecycleProd();
    };
    const loadRecycleProd = async () => {
      recycleProdLoading.value = true;
      try {
        const r: any = await getRecycleList({ page: 1, row: 50 });
        const d = r.data || r;
        recycleProdData.value = d.list || [];
        recycleProdTotal.value = d.total || 0;
      } finally {
        recycleProdLoading.value = false;
      }
    };
    const loadRecycleSku = async () => {
      recycleSkuLoading.value = true;
      try {
        const r: any = await getSkuRecycleList({ page: 1, row: 50 });
        const d = r.data || r;
        recycleSkuData.value = d.list || [];
        recycleSkuTotal.value = d.total || 0;
      } finally {
        recycleSkuLoading.value = false;
      }
    };
    const loadRecycleTrans = async () => {
      recycleTransLoading.value = true;
      try {
        const r: any = await getTransRecycleList({ page: 1, row: 50 });
        const d = r.data || r;
        recycleTransData.value = d.list || [];
        recycleTransTotal.value = d.total || 0;
      } finally {
        recycleTransLoading.value = false;
      }
    };
    const onRecycleTabChange = (name: string) => {
      rcSel.value = [];
      if (name === "sku") loadRecycleSku();
      else if (name === "trans") loadRecycleTrans();
      else loadRecycleProd();
    };
    const onRecycleProdSelect = (rows: any[]) => {
      rcSel.value = rows.map((r) => r.id);
    };
    const onRecycleSkuSelect = (rows: any[]) => {
      rcSel.value = rows.map((r) => r.id);
    };
    const onRecycleTransSelect = (rows: any[]) => {
      rcSel.value = rows.map((r) => r.id);
    };
    const onRecycleRestore = async () => {
      if (!rcSel.value.length) return;
      rcLoading.value = true;
      try {
        if (recycleTab.value === "product") await restoreProduct({ ids: rcSel.value });
        else if (recycleTab.value === "sku") await restoreSku({ ids: rcSel.value });
        else await restoreTrans({ ids: rcSel.value });
        ElMessage.success(t("message.sdk.product.restoreOk"));
        if (recycleTab.value === "product") {
          loadRecycleProd();
          loadData();
        } else if (recycleTab.value === "sku") loadRecycleSku();
        else loadRecycleTrans();
      } finally {
        rcLoading.value = false;
      }
    };
    const onRecyclePurge = async () => {
      if (!rcSel.value.length) return;
      try {
        await ElMessageBox.confirm(
          t("message.sdk.product.purgeConfirm"),
          t("message.sdk.product.purgeTitle"),
          {
            type: "warning",
            confirmButtonText: t("message.sdk.product.purgeConfirmBtn"),
            confirmButtonClass: "el-button--danger",
          },
        );
        if (recycleTab.value === "product") await purgeProduct({ ids: rcSel.value });
        else if (recycleTab.value === "sku") await purgeSku({ ids: rcSel.value });
        else await purgeTrans({ ids: rcSel.value });
        ElMessage.success(t("message.sdk.product.purgeOk"));
        rcSel.value = [];
        if (recycleTab.value === "product") {
          loadRecycleProd();
          loadData();
        } else if (recycleTab.value === "sku") loadRecycleSku();
        else loadRecycleTrans();
      } catch (e) {
        /* cancelled */
      }
    };
    const fmtUnix = (ts: number) => {
      if (!ts) return "-";
      const d = new Date(ts * 1000);
      return (
        d.getFullYear() +
        "-" +
        String(d.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(d.getDate()).padStart(2, "0") +
        " " +
        String(d.getHours()).padStart(2, "0") +
        ":" +
        String(d.getMinutes()).padStart(2, "0")
      );
    };

    const loadData = async () => {
      loading.value = true;
      try {
        const params: any = { page: page.value, row: size.value };
        if (searchForm.keyword) params.keyword = searchForm.keyword;
        if (searchForm.type !== -1) params.type = searchForm.type;
        const res: any = await getProductList(params);
        const d = res.data || res;
        tableData.value = d.list || [];
        total.value = d.total || 0;
      } finally {
        loading.value = false;
      }
    };

    const onSearch = () => {
      page.value = 1;
      loadData();
    };
    const onReset = () => {
      Object.assign(searchForm, { keyword: "", type: -1 });
      onSearch();
    };
    const onPageChange = ({ page: nextPage, limit }: { page: number; limit: number }) => {
      page.value = nextPage;
      size.value = limit;
      loadData();
    };
    const onSelectionChange = (rows: ProductItem[]) => {
      selectedIds.value = rows.map((r) => r.id);
    };
    const typeText = (type: number) =>
      (
        ({
          0: t("message.sdk.product.type0"),
          1: t("message.sdk.product.type1"),
          4: t("message.sdk.product.type4"),
        }) as any
      )[type] || type;
    const editLink = (row: ProductItem) => `/addon/product/edit?id=${row.id}`;
    const onAdd = () => router.push("/addon/product/add");
    const onEdit = (row: ProductItem) => router.push(editLink(row));

    const onDelete = (row: ProductItem) => {
      ElMessageBox.confirm(
        t("message.sdk.product.deleteConfirm", {
          name: row.name || row.extra?.local_product_id || "",
        }),
        t("message.sdk.product.deleteTitle"),
        { type: "warning" },
      )
        .then(async () => {
          await deleteProduct({ ids: [row.id] });
          ElMessage.success(t("message.sdk.product.deleteOk"));
          loadData();
        })
        .catch(() => {});
    };
    const onBatchDelete = () => {
      if (!selectedIds.value.length) return;
      ElMessageBox.confirm(
        t("message.sdk.product.batchDeleteConfirm", { count: selectedIds.value.length }),
        t("message.sdk.product.deleteTitle"),
        { type: "warning" },
      )
        .then(async () => {
          await deleteProduct({ ids: selectedIds.value });
          ElMessage.success(t("message.sdk.product.batchDeleteOk"));
          selectedIds.value = [];
          loadData();
        })
        .catch(() => {});
    };

    onMounted(() => loadData());
    onActivated(() => loadData());
    return {
      searchForm,
      searchFields,
      tableData,
      loading,
      tableSize,
      page,
      size,
      total,
      selectedIds,
      loadData,
      onSearch,
      onReset,
      onPageChange,
      onSelectionChange,
      typeText,
      editLink,
      onAdd,
      onEdit,
      onDelete,
      onBatchDelete,
      showRecycle,
      recycleTab,
      rcSel,
      rcLoading,
      recycleProdData,
      recycleProdLoading,
      recycleProdTotal,
      recycleSkuData,
      recycleSkuLoading,
      recycleSkuTotal,
      recycleTransData,
      recycleTransLoading,
      recycleTransTotal,
      loadRecycle,
      onRecycleTabChange,
      onRecycleProdSelect,
      onRecycleSkuSelect,
      onRecycleTransSelect,
      onRecycleRestore,
      onRecyclePurge,
      fmtUnix,
      t,
    };
  },
});
</script>

<style scoped>
.product-link {
  color: var(--cc-color-text-1);
  font-weight: 600;
  text-decoration: none;
}
.product-link:hover {
  color: var(--cc-color-primary);
}
.product-id {
  display: block;
  margin-top: 2px;
  color: var(--cc-color-text-3);
  font-family: var(--cc-font-mono);
  font-size: var(--cc-font-12);
}
.product-price {
  color: var(--cc-color-primary);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
</style>
