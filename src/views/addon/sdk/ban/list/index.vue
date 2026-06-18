<template>
  <ProPage :title="$t('message.sdk.ban.title')" :subtitle="$t('message.sdk.ban.subtitle')">
    <template #actions>
      <el-button type="primary" :icon="Plus" @click="onAdd">{{
        $t("message.sdk.ban.addBtn")
      }}</el-button>
    </template>

    <ProSearch
      v-model="searchForm"
      :fields="searchFields"
      collapsible
      :collapse-threshold="3"
      @search="onSearch"
      @reset="onReset"
    >
      <template #field-contain_global>
        <el-checkbox v-model="searchContainGlobal" @change="onSearch">{{
          $t("message.sdk.ban.containGlobal")
        }}</el-checkbox>
      </template>
    </ProSearch>
    <ProToolbar v-model:size="tableSize" @refresh="loadData">
      <template #left>
        <el-button v-if="selectedIds.length" type="danger" plain size="small" @click="onBatchDelete"
          >{{ $t("message.sdk.ban.batchDelete") }} ({{ selectedIds.length }})</el-button
        >
      </template>
    </ProToolbar>

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
      <el-table-column prop="id" :label="$t('message.common.colId')" width="70" align="center" />
      <el-table-column prop="app_id" label="AppID" width="90" align="center" />
      <el-table-column :label="$t('message.sdk.ban.colType')" width="90" align="center"
        ><template #default="{ row }"
          ><el-tag :type="banTypeTag(row.ban_type)" size="small" effect="plain" round>{{
            banTypeText(row.ban_type)
          }}</el-tag></template
        ></el-table-column
      >
      <el-table-column
        prop="banned_target"
        :label="$t('message.sdk.ban.colTarget')"
        min-width="180"
        show-overflow-tooltip
        ><template #default="{ row }"
          ><router-link :to="`/addon/sdk/ban/edit?id=${row.id}`" class="link-primary">{{
            row.banned_target
          }}</router-link></template
        ></el-table-column
      >
      <el-table-column
        prop="reason"
        :label="$t('message.sdk.ban.colReason')"
        min-width="150"
        show-overflow-tooltip
      />
      <el-table-column :label="$t('message.sdk.ban.colScope')" width="90" align="center"
        ><template #default="{ row }"
          ><el-tag :type="row.app_id === 0 ? 'danger' : ''" size="small" effect="plain">{{
            row.app_id === 0 ? $t("message.sdk.ban.scopeGlobal") : $t("message.sdk.ban.scopeGame")
          }}</el-tag></template
        ></el-table-column
      >
      <el-table-column :label="$t('message.sdk.ban.colBeginTime')" width="170" align="center"
        ><template #default="{ row }">{{ fmt(row.begin_time) }}</template></el-table-column
      >
      <el-table-column :label="$t('message.sdk.ban.colEndTime')" width="170" align="center"
        ><template #default="{ row }"
          ><span v-if="!row.end_time" class="forever-text">{{ $t("message.sdk.ban.forever") }}</span
          ><span v-else :class="{ 'expired-text': isExpired(row) }">{{
            fmt(row.end_time)
          }}</span></template
        ></el-table-column
      >
      <el-table-column :label="$t('message.common.colStatus')" width="90" align="center"
        ><template #default="{ row }"
          ><el-tag v-if="isExpired(row)" type="info" size="small" effect="plain" round>{{
            $t("message.sdk.ban.statusExpired")
          }}</el-tag
          ><el-tag v-else-if="!row.end_time" type="danger" size="small" effect="plain" round>{{
            $t("message.sdk.ban.forever")
          }}</el-tag
          ><el-tag v-else type="danger" size="small" effect="plain" round>{{
            $t("message.sdk.ban.statusActive")
          }}</el-tag></template
        ></el-table-column
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
          ><el-button link type="danger" size="small" @click="onDelete(row)">{{
            $t("message.common.delete")
          }}</el-button></template
        ></el-table-column
      >
    </ProTable>

    <el-alert
      type="warning"
      :title="$t('message.sdk.ban.ruleTitle')"
      :closable="false"
      show-icon
      class="rule-alert"
    >
      <p>{{ $t("message.sdk.ban.ruleForever") }}</p>
      <p>{{ $t("message.sdk.ban.ruleExpired") }}</p>
      <p>{{ $t("message.sdk.ban.ruleGlobal") }}</p>
    </el-alert>
  </ProPage>
</template>

<script lang="ts">
import { computed, defineComponent, ref, reactive, onMounted, onActivated } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { Plus } from "@element-plus/icons-vue";
import { useI18n } from "vue-i18n";
import ProPage from "/@/components/pro/ProPage.vue";
import ProSearch, { type ProSearchField } from "/@/components/pro/ProSearch.vue";
import ProToolbar from "/@/components/pro/ProToolbar.vue";
import ProTable from "/@/components/pro/ProTable.vue";
import { getBanList, deleteBan, BanItem } from "/@/api/addon/sdk";

export default defineComponent({
  name: "addonSdkBanList",
  components: { ProPage, ProSearch, ProToolbar, ProTable, Plus },
  setup() {
    const { t } = useI18n();
    const router = useRouter();
    const searchForm = reactive<any>({
      app_id: undefined,
      ban_type: "",
      keyword: "",
      contain_global: false,
    });
    const searchContainGlobal = ref(false);
    const tableData = ref<BanItem[]>([]);
    const loading = ref(false);
    const tableSize = ref<"large" | "default" | "small">("default");
    const page = ref(1);
    const size = ref(10);
    const total = ref(0);
    const selectedIds = ref<number[]>([]);
    const searchFields = computed<ProSearchField[]>(() => [
      { prop: "app_id", label: "AppID", type: "number", min: 0, width: "140px" },
      {
        prop: "ban_type",
        label: t("message.common.type"),
        type: "select",
        width: "140px",
        options: [
          { label: t("message.sdk.ban.typeAccount"), value: 1 },
          { label: t("message.sdk.ban.typeIp"), value: 2 },
          { label: t("message.sdk.ban.typeDevice"), value: 3 },
        ],
      },
      {
        prop: "keyword",
        label: t("message.common.search"),
        placeholder: t("message.sdk.ban.searchHint"),
        width: "220px",
      },
      { prop: "contain_global", label: "", type: "slot", width: "180px" },
    ]);
    const banTypeText = (type: number) =>
      (
        ({
          1: t("message.sdk.ban.typeAccount"),
          2: t("message.sdk.ban.typeIp"),
          3: t("message.sdk.ban.typeDevice"),
        }) as any
      )[type] || t("message.common.msgUnknown");
    const banTypeTag = (type: number) =>
      (({ 1: "danger", 2: "warning", 3: "" }) as any)[type] || "info";
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
    const isExpired = (row: BanItem) =>
      row.end_time > 0 && row.end_time < Math.floor(Date.now() / 1000);
    const loadData = async () => {
      loading.value = true;
      try {
        const params: any = { page: page.value, row: size.value };
        if (
          searchForm.app_id !== undefined &&
          searchForm.app_id !== null &&
          searchForm.app_id !== ""
        )
          params.app_id = searchForm.app_id;
        if (searchForm.ban_type !== "") params.ban_type = searchForm.ban_type;
        if (searchForm.keyword) params.keyword = searchForm.keyword;
        if (searchContainGlobal.value) params.contain_global = 1;
        const res: any = await getBanList(params);
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
        app_id: undefined,
        ban_type: "",
        keyword: "",
        contain_global: false,
      });
      searchContainGlobal.value = false;
      onSearch();
    };
    const onPageChange = ({ page: nextPage, limit }: { page: number; limit: number }) => {
      page.value = nextPage;
      size.value = limit;
      loadData();
    };
    const onSelectionChange = (rows: BanItem[]) => {
      selectedIds.value = rows.map((row) => row.id);
    };
    const onAdd = () => router.push("/addon/sdk/ban/add");
    const onEdit = (row: BanItem) => router.push(`/addon/sdk/ban/edit?id=${row.id}`);
    const onDelete = (row: BanItem) => {
      ElMessageBox.confirm(t("message.sdk.ban.deleteConfirm"), t("message.common.confirmTitle"), {
        type: "warning",
      })
        .then(async () => {
          await deleteBan({ ids: [row.id] });
          ElMessage.success(t("message.common.msgDeleteOk"));
          loadData();
        })
        .catch(() => {});
    };
    const onBatchDelete = () => {
      if (!selectedIds.value.length) return;
      ElMessageBox.confirm(
        t("message.sdk.ban.batchDeleteConfirm", { count: selectedIds.value.length }),
        t("message.common.confirmDeleteTitle"),
        { type: "warning" },
      )
        .then(async () => {
          await deleteBan({ ids: selectedIds.value });
          ElMessage.success(t("message.common.msgDeleteOk"));
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
      searchContainGlobal,
      tableData,
      loading,
      tableSize,
      page,
      size,
      total,
      selectedIds,
      banTypeText,
      banTypeTag,
      fmt,
      isExpired,
      loadData,
      onSearch,
      onReset,
      onPageChange,
      onSelectionChange,
      onAdd,
      onEdit,
      onDelete,
      onBatchDelete,
      Plus,
    };
  },
});
</script>

<style scoped>
.link-primary {
  color: var(--cc-color-primary);
  font-weight: 600;
  text-decoration: none;
}
.link-primary:hover {
  text-decoration: underline;
}
.forever-text {
  color: var(--cc-color-danger);
  font-weight: 700;
}
.expired-text {
  color: var(--cc-color-text-4);
  text-decoration: line-through;
}
.rule-alert {
  margin-top: var(--cc-space-4);
}
.rule-alert p {
  margin: 4px 0 0;
}
</style>
