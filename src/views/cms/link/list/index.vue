<template>
  <ProPage :title="$t('message.menu_cms_link')" :subtitle="$t('message.menu_cms_link')">
    <template #actions>
      <el-button type="primary" :icon="Plus" @click="handleAdd">
        {{ $t("message.common.btnAdd") }}
      </el-button>
    </template>

    <ProSearch
      v-model="queryParams"
      :fields="searchFields"
      @search="handleQuery"
      @reset="resetQuery"
    />

    <ProToolbar v-model:size="tableSize" @refresh="getList">
      <template #left>
        <span v-if="selectedIds.length" class="sel-count"
          >{{ selectedIds.length }}{{ $t("message.cms.articleList.selectedCount") }}</span
        >
        <el-button :icon="Delete" :disabled="!selectedIds.length" @click="handleDelete(null)">
          {{ $t("message.common.btnDelete") }}
        </el-button>
      </template>
    </ProToolbar>

    <ProTable
      :data="tableData.list"
      :loading="loading"
      :size="tableSize"
      :total="tableData.total"
      :page="tableData.page"
      :page-size="tableData.row"
      selection
      @selection-change="handleSelectionChange"
      @pagination="onPageChange"
    >
      <el-table-column prop="id" :label="$t('message.common.colId')" width="70" align="center" />
      <el-table-column
        prop="name"
        :label="$t('message.common.colName')"
        min-width="150"
        show-overflow-tooltip
      />
      <el-table-column
        prop="url"
        :label="$t('message.common.colUrl')"
        min-width="220"
        show-overflow-tooltip
      >
        <template #default="{ row }">
          <a :href="row.url" target="_blank" class="link-text">{{ row.url }}</a>
        </template>
      </el-table-column>
      <el-table-column
        prop="group_name"
        :label="$t('message.cmsLink.group')"
        width="120"
        align="center"
      >
        <template #default="{ row }">
          <el-tag size="small" effect="plain">{{ row.group_name || "-" }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="sort"
        :label="$t('message.common.colSort')"
        width="80"
        align="center"
      />
      <el-table-column
        prop="status"
        :label="$t('message.common.colStatus')"
        width="90"
        align="center"
      >
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'info'" effect="plain">
            {{ row.status === 1 ? $t("message.common.enabled") : $t("message.common.disabled") }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('message.common.colOperation')"
        width="150"
        fixed="right"
        align="center"
      >
        <template #default="{ row }">
          <el-button size="small" type="primary" link @click="handleUpdate(row)">{{
            $t("message.common.btnEdit")
          }}</el-button>
          <el-button size="small" type="danger" link @click="handleDelete(row)">{{
            $t("message.common.btnDelete")
          }}</el-button>
        </template>
      </el-table-column>
    </ProTable>
  </ProPage>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { computed, reactive, ref, onMounted, getCurrentInstance } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Plus, Delete } from "@element-plus/icons-vue";
import ProPage from "/@/components/pro/ProPage.vue";
import ProSearch, { type ProSearchField } from "/@/components/pro/ProSearch.vue";
import ProToolbar from "/@/components/pro/ProToolbar.vue";
import ProTable from "/@/components/pro/ProTable.vue";
import { getLinkList, delLink } from "@/api/cms/link";

const { t } = useI18n();
const { proxy } = getCurrentInstance() as any;
const loading = ref(false);
const tableSize = ref<"large" | "default" | "small">("default");
const selectedIds = ref<number[]>([]);

const queryParams = reactive({
  name: "",
  group_name: "",
});

const tableData = reactive({
  list: [] as any[],
  total: 0,
  page: 1,
  row: 20,
});

const searchFields = computed<ProSearchField[]>(() => [
  {
    prop: "name",
    label: t("message.common.colName"),
    placeholder: t("message.common.btnSearch"),
    width: "220px",
  },
  {
    prop: "group_name",
    label: t("message.cmsLink.group"),
    type: "select",
    placeholder: t("message.cmsLink.selectGroup"),
    width: "180px",
    options: [
      { label: "friend", value: "friend" },
      { label: "partner", value: "partner" },
      { label: "footer", value: "footer" },
    ],
  },
]);

function getList() {
  loading.value = true;
  const params: Record<string, any> = { page: tableData.page, row: tableData.row };
  if (queryParams.name) params.name = queryParams.name;
  if (queryParams.group_name) params.group_name = queryParams.group_name;
  getLinkList(params)
    .then((res: any) => {
      if (res.code === 0 || res.code === 200) {
        tableData.list = res.data.list || [];
        tableData.total = res.data.total || 0;
      }
    })
    .finally(() => {
      loading.value = false;
    });
}

function handleQuery() {
  tableData.page = 1;
  getList();
}

function resetQuery() {
  queryParams.name = "";
  queryParams.group_name = "";
  tableData.page = 1;
  getList();
}

function onPageChange({ page, limit }: { page: number; limit: number }) {
  tableData.page = page;
  tableData.row = limit;
  getList();
}

function handleSelectionChange(rows: any[]) {
  selectedIds.value = rows.map((row) => row.id);
}

function handleAdd() {
  proxy.$router.push("/cms/link/list/add");
}

function handleUpdate(row: any) {
  proxy.$router.push(`/cms/link/list/edit?id=${row.id}`);
}

function handleDelete(row: any | null) {
  const ids = row ? [row.id] : selectedIds.value;
  if (!ids.length) {
    ElMessage.error(t("message.common.msgSelectDelete"));
    return;
  }
  ElMessageBox.confirm(t("message.common.confirmDeleteBatch"), t("message.common.confirmTitle"), {
    confirmButtonText: t("message.common.confirm"),
    cancelButtonText: t("message.common.cancel"),
    type: "warning",
  })
    .then(() =>
      delLink(ids).then((res: any) => {
        if (res.code === 0 || res.code === 200) {
          ElMessage.success(t("message.common.msgDeleteOk"));
          selectedIds.value = [];
          getList();
        }
      }),
    )
    .catch(() => {});
}

onMounted(() => {
  getList();
});
</script>

<style scoped>
.sel-count {
  font-size: var(--cc-font-13);
  color: var(--cc-color-text-3);
}
.link-text {
  color: var(--cc-color-primary);
  text-decoration: none;
}
.link-text:hover {
  text-decoration: underline;
}
</style>
