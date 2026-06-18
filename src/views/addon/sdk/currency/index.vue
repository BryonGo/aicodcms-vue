<template>
  <ProPage
    :title="$t('message.sdk.currency.title')"
    :subtitle="$t('message.sdk.currency.subtitle')"
  >
    <template #actions>
      <el-button :icon="Download" :loading="initing" @click="onInit">{{
        $t("message.sdk.currency.initCurrency")
      }}</el-button>
      <el-button :icon="Refresh" :loading="syncing" @click="onSync">{{
        $t("message.sdk.currency.syncRate")
      }}</el-button>
      <el-button
        text
        :type="hasApiKey ? 'success' : 'warning'"
        :icon="Setting"
        @click="showApiKeyDialog = true"
      >
        {{
          hasApiKey
            ? $t("message.sdk.currency.apiKeyConfigured")
            : $t("message.sdk.currency.setApiKey")
        }}
      </el-button>
      <el-button type="primary" :icon="Plus" @click="onAdd">{{
        $t("message.common.add")
      }}</el-button>
    </template>

    <ProSearch v-model="searchForm" :fields="searchFields" @search="onSearch" @reset="onReset" />
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
      <el-table-column prop="id" :label="$t('message.common.colId')" width="70" align="center" />
      <el-table-column
        prop="currency_code"
        :label="$t('message.sdk.currency.colCode')"
        width="110"
        align="center"
        ><template #default="{ row }"
          ><span class="currency-code">{{ row.currency_code }}</span></template
        ></el-table-column
      >
      <el-table-column
        prop="currency_name"
        :label="$t('message.common.colName')"
        min-width="140"
        show-overflow-tooltip
      />
      <el-table-column
        prop="currency_symbol"
        :label="$t('message.sdk.currency.colSymbol')"
        min-width="90"
        align="center"
        ><template #default="{ row }"
          ><span class="currency-symbol">{{ row.currency_symbol }}</span></template
        ></el-table-column
      >
      <el-table-column :label="$t('message.sdk.currency.colRate')" width="130" align="right"
        ><template #default="{ row }"
          ><span class="currency-rate">{{ row.rate_real_time || "—" }}</span></template
        ></el-table-column
      >
      <el-table-column :label="$t('message.sdk.currency.colFixedRate')" width="120" align="right"
        ><template #default="{ row }">{{ row.rate_fixed || "—" }}</template></el-table-column
      >
      <el-table-column
        prop="last_rate_update_time"
        :label="$t('message.sdk.currency.syncTime')"
        width="170"
        align="center"
        ><template #default="{ row }">{{
          fmt(row.last_rate_update_time)
        }}</template></el-table-column
      >
      <el-table-column
        :label="$t('message.common.colOperation')"
        width="150"
        fixed="right"
        align="center"
        ><template #default="{ row }"
          ><el-button link type="primary" size="small" @click="onEdit(row)">{{
            $t("message.common.edit")
          }}</el-button
          ><el-button link type="danger" size="small" @click="onDel(row)">{{
            $t("message.common.delete")
          }}</el-button></template
        ></el-table-column
      >
    </ProTable>

    <el-drawer
      v-model="showApiKeyDialog"
      :title="$t('message.sdk.currency.apiKeyTitle')"
      width="520px"
      :close-on-click-modal="false"
      @open="onDialogOpen"
    >
      <el-form :model="apiKeyForm" label-position="top">
        <el-alert v-if="hasApiKey" type="success" :closable="false" show-icon class="mb12">
          <template #title
            >{{ $t("message.sdk.currency.apiKeySavedLabel") }}
            <code class="api-key-mask">{{ maskedKey }}</code></template
          >
        </el-alert>
        <el-alert v-else type="warning" :closable="false" show-icon class="mb12">
          <template #title>{{ $t("message.sdk.currency.apiKeyNotSet") }}</template>
        </el-alert>
        <el-form-item label="API Key">
          <el-input
            v-model="apiKeyForm.api_key"
            :placeholder="$t('message.sdk.currency.apiKeyPlaceholderLong')"
            clearable
            type="password"
            show-password
          />
        </el-form-item>
        <el-alert type="info" :closable="false" show-icon>
          <p>
            {{ $t("message.sdk.currency.apiKeyFreeLink")
            }}<a href="https://apilayer.com/marketplace/exchangeratesapi-api" target="_blank"
              >apilayer.com</a
            >
          </p>
          <p>
            {{ $t("message.sdk.currency.apiKeyFreeNote") }}
            <a
              href="https://docs.apilayer.com/exchangeratesapi/docs/exchange-rates-api-v-1-0-0#/default/getLatestRates"
              target="_blank"
              >/latest</a
            >
            ·
            <a
              href="https://docs.apilayer.com/exchangeratesapi/docs/exchange-rates-api-v-1-0-0#/default/getSupportedSymbols"
              target="_blank"
              >/symbols</a
            >
          </p>
        </el-alert>
      </el-form>
      <template #footer>
        <el-button @click="showApiKeyDialog = false">{{ $t("message.common.cancel") }}</el-button>
        <el-button type="primary" :loading="savingApiKey" @click="saveApiKey">{{
          $t("message.common.save")
        }}</el-button>
      </template>
    </el-drawer>
  </ProPage>
</template>

<script lang="ts">
import { computed, defineComponent, ref, reactive, onMounted, onActivated, watch } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { Plus, Refresh, Setting, Download } from "@element-plus/icons-vue";
import { useI18n } from "vue-i18n";
import ProPage from "/@/components/pro/ProPage.vue";
import ProSearch, { type ProSearchField } from "/@/components/pro/ProSearch.vue";
import ProToolbar from "/@/components/pro/ProToolbar.vue";
import ProTable from "/@/components/pro/ProTable.vue";
import {
  getCurrencyList,
  deleteCurrency,
  syncCurrencyRates,
  initCurrencies,
  getCurrencyApiConfig,
  saveCurrencyApiConfig,
} from "/@/api/addon/sdk";

export default defineComponent({
  name: "addonSdkCurrencyList",
  components: { ProPage, ProSearch, ProToolbar, ProTable, Plus, Refresh, Setting, Download },
  setup() {
    const { t } = useI18n();
    const router = useRouter();
    const tableData = ref<any[]>([]);
    const loading = ref(false);
    const tableSize = ref<"large" | "default" | "small">("default");
    const syncing = ref(false);
    const initing = ref(false);
    const page = ref(1);
    const size = ref(10);
    const total = ref(0);
    const searchForm = reactive({ keyword: "" });
    const showApiKeyDialog = ref(false);
    const savingApiKey = ref(false);
    const hasApiKey = ref(false);
    const maskedKey = ref("");
    const apiKeyForm = reactive({ api_key: "" });
    const searchFields = computed<ProSearchField[]>(() => [
      {
        prop: "keyword",
        label: t("message.common.search"),
        placeholder: t("message.sdk.currency.searchHint"),
        width: "260px",
      },
    ]);
    const fmt = (ts: number) => (ts > 0 ? new Date(ts * 1000).toLocaleString("zh-CN") : "—");
    const loadData = async () => {
      loading.value = true;
      try {
        const params: any = { page: page.value, row: size.value };
        if (searchForm.keyword) params.keyword = searchForm.keyword;
        const res: any = await getCurrencyList(params);
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
      searchForm.keyword = "";
      onSearch();
    };
    const onPageChange = ({ page: nextPage, limit }: { page: number; limit: number }) => {
      page.value = nextPage;
      size.value = limit;
      loadData();
    };
    const onAdd = () => router.push("/addon/sdk/currency/add");
    const onEdit = (row: any) => router.push(`/addon/sdk/currency/edit?id=${row.id}`);
    const onDel = (row: any) => {
      ElMessageBox.confirm(
        t("message.sdk.currency.deleteConfirm", { code: row.currency_code }),
        t("message.common.confirmDeleteTitle"),
        { type: "warning" },
      )
        .then(async () => {
          await deleteCurrency({ ids: [row.id] });
          ElMessage.success(t("message.common.msgDeleteOk"));
          loadData();
        })
        .catch(() => {});
    };
    const onSync = async () => {
      syncing.value = true;
      try {
        const res: any = await syncCurrencyRates();
        const data = res.data || res;
        ElMessage.success(data.message || t("message.sdk.currency.syncCompleted"));
        loadData();
      } catch (e: any) {
        const msg = e?.data?.message || e?.message || t("message.sdk.currency.syncFailed");
        if (msg.includes(t("message.sdk.currency.notConfigured")) || msg.includes("API Key")) {
          ElMessage.warning(msg);
          showApiKeyDialog.value = true;
        } else {
          ElMessage.error(msg);
        }
      } finally {
        syncing.value = false;
      }
    };
    const onInit = async () => {
      ElMessageBox.confirm(
        t("message.sdk.currency.initConfirmMsg"),
        t("message.sdk.currency.initConfirm"),
        { type: "info" },
      )
        .then(async () => {
          initing.value = true;
          try {
            const res: any = await initCurrencies();
            const data = res.data || res;
            ElMessage.success(data.message || t("message.sdk.currency.initCompleted"));
            loadData();
          } catch (e: any) {
            const msg = e?.data?.message || e?.message || t("message.sdk.currency.initFailed");
            if (msg.includes(t("message.sdk.currency.notConfigured")) || msg.includes("API Key")) {
              ElMessage.warning(msg);
              showApiKeyDialog.value = true;
            } else {
              ElMessage.error(msg);
            }
          } finally {
            initing.value = false;
          }
        })
        .catch(() => {});
    };
    const saveApiKey = async () => {
      if (!apiKeyForm.api_key.trim()) {
        ElMessage.warning(t("message.sdk.currency.placeholderApiKey"));
        return;
      }
      savingApiKey.value = true;
      try {
        await saveCurrencyApiConfig({ api_key: apiKeyForm.api_key.trim() });
        ElMessage.success(t("message.sdk.currency.apiKeySaved"));
        showApiKeyDialog.value = false;
        apiKeyForm.api_key = "";
        loadApiConfig();
      } catch {
        ElMessage.error(t("message.common.msgNetworkError"));
      } finally {
        savingApiKey.value = false;
      }
    };
    const loadApiConfig = async () => {
      try {
        const res: any = await getCurrencyApiConfig();
        const data = res.data || res;
        hasApiKey.value = data.has_api_key || false;
        maskedKey.value = data.masked_key || "";
      } catch {
        hasApiKey.value = false;
        maskedKey.value = "";
      }
    };
    const onDialogOpen = () => {
      apiKeyForm.api_key = "";
      loadApiConfig();
    };
    watch([page, size], () => {
      loadData();
    });
    onMounted(() => {
      loadData();
      loadApiConfig();
    });
    onActivated(() => {
      loadData();
      loadApiConfig();
    });
    return {
      tableData,
      loading,
      tableSize,
      syncing,
      initing,
      page,
      size,
      total,
      searchForm,
      searchFields,
      fmt,
      loadData,
      onSearch,
      onReset,
      onPageChange,
      onAdd,
      onEdit,
      onDel,
      onSync,
      onInit,
      showApiKeyDialog,
      savingApiKey,
      apiKeyForm,
      hasApiKey,
      maskedKey,
      saveApiKey,
      onDialogOpen,
      loadApiConfig,
      Plus,
      Refresh,
      Setting,
      Download,
    };
  },
});
</script>

<style scoped>
.currency-code,
.currency-rate {
  font-weight: 700;
  color: var(--cc-color-primary);
}
.currency-symbol {
  font-size: var(--cc-font-18);
  color: var(--cc-color-text-1);
}
.mb12 {
  margin-bottom: var(--cc-space-3);
}
.api-key-mask {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  background: color-mix(in srgb, var(--cc-color-success) 12%, transparent);
  padding: 2px 6px;
  border-radius: var(--cc-radius-sm);
}
:deep(.el-alert p) {
  margin: 0;
}
:deep(.el-alert p + p) {
  margin-top: var(--cc-space-1);
}
:deep(.el-alert a) {
  color: var(--cc-color-primary);
}
</style>
