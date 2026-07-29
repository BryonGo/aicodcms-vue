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
          <span class="link-primary" @click="onEdit(row)">{{ row.name }}</span>
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

    <ProDrawer
      v-model="drawerVisible"
      :title="drawerMode === 'add' ? $t('message.common.add') : $t('message.common.edit')"
      size="lg"
      :no-padding="true"
      :destroy-on-close="true"
      :show-footer="true"
      :confirm-text="drawerMode === 'add' ? $t('message.common.submit') : $t('message.common.save')"
      :cancel-text="$t('message.common.cancel')"
      :confirm-loading="submitting"
      @confirm="onConfirm"
      @cancel="onCancel"
    >
      <template #actions>
        <el-button
          v-if="drawerMode === 'edit'"
          type="danger"
          plain
          size="small"
          @click="onDrawerDelete"
        >
          {{ $t("message.common.delete") }}
        </el-button>
      </template>
      <DeveloperForm
        ref="formRef"
        :mode="drawerMode"
        :id="editId"
        @success="onSuccess"
        @deleted="onDeleted"
        @cancel="onCancel"
      />
    </ProDrawer>
  </ProPage>
</template>

<script lang="ts">
import { computed, defineComponent, ref, reactive, onMounted, onActivated } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Plus } from "@element-plus/icons-vue";
import { useI18n } from "vue-i18n";
import ProPage from "/@/components/pro/ProPage.vue";
import ProSearch, { type ProSearchField } from "/@/components/pro/ProSearch.vue";
import ProToolbar from "/@/components/pro/ProToolbar.vue";
import ProTable from "/@/components/pro/ProTable.vue";
import ProDrawer from "/@/components/pro/ProDrawer.vue";
import DeveloperForm from "/@/views/addon/sdk/developer/component/developer-form.vue";
import { getDeveloperList, deleteDeveloper, DeveloperItem } from "/@/api/addon/sdk";

export default defineComponent({
  name: "addonSdkDeveloperList",
  components: { ProPage, ProSearch, ProToolbar, ProTable, ProDrawer, DeveloperForm, Plus },
  setup() {
    const { t } = useI18n();
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
    // ── 抽屉化新增/编辑 ──
    const drawerVisible = ref(false);
    const drawerMode = ref<"add" | "edit">("add");
    const editId = ref<number | undefined>(undefined);
    const submitting = ref(false);
    const formRef = ref();
    const onAdd = () => {
      drawerMode.value = "add";
      editId.value = undefined;
      drawerVisible.value = true;
    };
    const onEdit = (row: DeveloperItem) => {
      drawerMode.value = "edit";
      editId.value = row.id;
      drawerVisible.value = true;
    };
    const onConfirm = async () => {
      submitting.value = true;
      try {
        await formRef.value?.submit();
      } finally {
        submitting.value = false;
      }
    };
    const onSuccess = () => {
      drawerVisible.value = false;
      loadData();
    };
    const onDeleted = () => {
      drawerVisible.value = false;
      loadData();
    };
    const onCancel = () => {
      drawerVisible.value = false;
    };
    const onDrawerDelete = () => {
      formRef.value?.remove();
    };
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
      drawerVisible,
      drawerMode,
      editId,
      submitting,
      formRef,
      onConfirm,
      onSuccess,
      onDeleted,
      onCancel,
      onDrawerDelete,
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
  cursor: pointer;
}
.link-primary:hover {
  text-decoration: underline;
}
</style>
