<template>
  <ProPage
    :title="$t('message.sdk.developer.headerTitle')"
    :subtitle="$t('message.sdk.developer.headerSubtitle')"
  >
    <template #actions>
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
        prop="name"
        :label="$t('message.common.colName')"
        min-width="180"
        show-overflow-tooltip
      >
        <template #default="{ row }">
          <router-link :to="`/addon/sdk/developer/edit?id=${row.id}`" class="link-primary">{{
            row.name
          }}</router-link>
        </template>
      </el-table-column>
      <el-table-column
        prop="contact_name"
        :label="$t('message.sdk.developer.colContact')"
        width="120"
      />
      <el-table-column
        prop="contact_email"
        :label="$t('message.sdk.developer.colEmail')"
        min-width="190"
        show-overflow-tooltip
      />
      <el-table-column
        prop="contact_wx"
        :label="$t('message.sdk.developer.colWechat')"
        width="140"
        show-overflow-tooltip
      />
      <el-table-column prop="phone_num" :label="$t('message.sdk.developer.colPhone')" width="150" />
      <el-table-column
        :label="$t('message.common.colOperation')"
        width="150"
        fixed="right"
        align="center"
      >
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="onEdit(row)">{{
            $t("message.common.edit")
          }}</el-button>
          <el-button link type="danger" size="small" @click="onDelete(row)">{{
            $t("message.common.delete")
          }}</el-button>
        </template>
      </el-table-column>
    </ProTable>
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
import { getDeveloperList, deleteDeveloper, DeveloperItem } from "/@/api/addon/sdk";

export default defineComponent({
  name: "addonSdkDeveloperList",
  components: { ProPage, ProSearch, ProToolbar, ProTable, Plus },
  setup() {
    const { t } = useI18n();
    const router = useRouter();
    const searchForm = reactive({ keyword: "" });
    const tableData = ref<DeveloperItem[]>([]);
    const loading = ref(false);
    const tableSize = ref<"large" | "default" | "small">("default");
    const page = ref(1);
    const size = ref(10);
    const total = ref(0);
    const searchFields = computed<ProSearchField[]>(() => [
      {
        prop: "keyword",
        label: t("message.common.search"),
        placeholder: t("message.sdk.developer.searchPlaceholder"),
        width: "260px",
      },
    ]);

    const loadData = async () => {
      loading.value = true;
      try {
        const params: any = { page: page.value, row: size.value };
        if (searchForm.keyword) params.keyword = searchForm.keyword;
        const res: any = await getDeveloperList(params);
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
    const onAdd = () => router.push("/addon/sdk/developer/add");
    const onEdit = (row: DeveloperItem) => router.push(`/addon/sdk/developer/edit?id=${row.id}`);
    const onDelete = (row: DeveloperItem) => {
      ElMessageBox.confirm(
        t("message.sdk.developer.deleteConfirm", { name: row.name }),
        t("message.sdk.developer.deleteTitle"),
        { type: "warning" },
      )
        .then(async () => {
          await deleteDeveloper({ ids: [row.id] });
          ElMessage.success(t("message.common.msgDeleteOk"));
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
      loadData,
      onSearch,
      onReset,
      onPageChange,
      onAdd,
      onEdit,
      onDelete,
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
</style>
