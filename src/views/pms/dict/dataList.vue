<template>
  <ProPage
    :title="$t('message.pms.dictDataList.breadcrumbCurrent')"
    :subtitle="
      $t('message.pms.dict.breadcrumbCurrent') +
      ' / ' +
      $t('message.pms.dictDataList.breadcrumbCurrent')
    "
  >
    <ProSearch
      v-model="state.params"
      :fields="searchFields"
      @search="search"
      @reset="resetWithType"
    />

    <div>
      <ProToolbar :size="density" @refresh="query" @update:size="density = $event as any">
        <template #left>
          <el-button type="primary" :icon="PlusIcon" @click="onOpenAddDic">{{
            $t("message.common.btnAdd")
          }}</el-button>
          <el-button
            type="danger"
            :icon="DeleteIcon"
            :disabled="!state.ids.length"
            @click="onBatchDelete"
          >
            {{ $t("message.common.btnDelete")
            }}<template v-if="state.ids.length"> ({{ state.ids.length }})</template>
          </el-button>
        </template>
      </ProToolbar>

      <ProTable
        :data="state.data"
        :loading="state.loading"
        :total="state.total"
        :page="state.page"
        :page-size="state.size"
        :size="density"
        row-key="dict_code"
        selection
        @selection-change="onSelectionChange"
        @pagination="onPageChange"
      >
        <el-table-column
          prop="dict_code"
          :label="$t('message.pms.dictDataList.colCode')"
          width="80"
          align="center"
        />
        <el-table-column
          prop="dict_label"
          :label="$t('message.pms.dictDataList.labelLabel')"
          min-width="120"
          show-overflow-tooltip
        />
        <el-table-column
          prop="dict_value"
          :label="$t('message.pms.dictDataList.colValue')"
          min-width="120"
          show-overflow-tooltip
        />
        <el-table-column
          prop="dict_sort"
          :label="$t('message.common.colSort')"
          width="80"
          align="center"
        />
        <el-table-column
          :label="$t('message.pms.dictDataList.colDefault')"
          width="90"
          align="center"
        >
          <template #default="{ row }">
            <el-tag :type="row.is_default === 1 ? 'success' : 'info'" effect="light" size="small">
              {{
                row.is_default === 1
                  ? $t("message.pms.dictDataList.isDefault")
                  : $t("message.pms.dictDataList.notDefault")
              }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('message.pms.dictDataList.labelStatus')"
          width="100"
          align="center"
        >
          <template #default="{ row }">
            <el-tag
              :type="row.status === 1 ? 'success' : row.status === 2 ? 'danger' : 'info'"
              effect="light"
              size="small"
            >
              {{
                row.status === 1
                  ? $t("message.pms.dictDataList.statusNormal")
                  : row.status === 2
                    ? $t("message.pms.dictDataList.statusStop")
                    : "-"
              }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="remark"
          :label="$t('message.common.colRemark')"
          min-width="180"
          show-overflow-tooltip
        />
        <el-table-column :label="$t('message.common.colCreateTime')" width="160">
          <template #default="{ row }">
            <span class="text-muted">{{ formatDate(row.created_at) }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('message.common.colOperation')" width="170" fixed="right">
          <template #default="{ row }">
            <el-button link size="small" type="primary" @click="onOpenEditDic(row)">{{
              $t("message.common.btnEdit")
            }}</el-button>
            <el-button link size="small" type="danger" @click="onRowDel(row)">{{
              $t("message.common.btnRemove")
            }}</el-button>
          </template>
        </el-table-column>
      </ProTable>
    </div>
  </ProPage>
</template>

<script setup lang="ts">
import { ref, onMounted, getCurrentInstance } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { ElMessage, ElMessageBox } from "element-plus";
import { Plus as PlusIcon, Delete as DeleteIcon } from "@element-plus/icons-vue";

import ProPage from "/@/components/pro/ProPage.vue";
import ProSearch, { type ProSearchField } from "/@/components/pro/ProSearch.vue";
import ProToolbar from "/@/components/pro/ProToolbar.vue";
import ProTable from "/@/components/pro/ProTable.vue";
import { useProTable } from "/@/composables/useProTable";

import { useDict, getDataList, deleteData } from "/@/api/pms/dict/data";

const { t } = useI18n();
const { proxy } = <any>getCurrentInstance();
const route = useRoute();

const density = ref<"large" | "default" | "small">("default");
const dictOptions = ref<{ label: string; value: string }[]>([]);

// 时间戳格式化
const formatDate = (timestamp: number): string => {
  if (!timestamp) return "-";
  const date = new Date(timestamp * 1000);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const h = String(date.getHours()).padStart(2, "0");
  const mi = String(date.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${d} ${h}:${mi}`;
};

const searchFields: ProSearchField[] = [
  {
    prop: "dict_type",
    label: t("message.pms.dictDataList.labelType"),
    type: "select",
    placeholder: t("message.pms.dictDataList.placeholderType"),
    get options() {
      return dictOptions.value;
    },
  } as any,
  {
    prop: "dict_label",
    label: t("message.pms.dictDataList.labelLabel"),
    type: "input",
    placeholder: t("message.pms.dictDataList.placeholderLabel"),
  },
  {
    prop: "status",
    label: t("message.pms.dictDataList.labelStatus"),
    type: "select",
    placeholder: t("message.pms.dictDataList.placeholderStatus"),
    options: [
      { label: t("message.common.status"), value: 0 },
      { label: t("message.common.normal"), value: 1 },
      { label: t("message.common.disabled"), value: 2 },
    ],
  },
];

// 列表 transform 时去掉 status=0 的搜索条件
const { state, query, search, reset, onPageChange, onSelectionChange, remove } = useProTable({
  api: (params: any) => {
    const p = { ...params };
    if (p.status === 0) delete p.status;
    return getDataList(p);
  },
  defaults: { dict_type: "", dict_label: "", status: 0 } as any,
  pageKey: "page",
  sizeKey: "row",
  defaultPageSize: 10,
  transform: (res) => ({
    list: res?.data?.list ?? [],
    total: res?.data?.total ?? 0,
  }),
  deleteApi: deleteData,
  rowKey: "dict_code",
  immediate: false,
});

const resetWithType = () => {
  const dictType = state.params.dict_type;
  state.params = { dict_type: dictType, dict_label: "", status: 0 } as any;
  state.page = 1;
  query();
};

const onOpenAddDic = () =>
  proxy.$router.push(`/pms/dict/data/add?dict_type=${state.params.dict_type || ""}`);
const onOpenEditDic = (row: any) =>
  proxy.$router.push(
    `/pms/dict/data/edit?id=${row.dict_code}&dict_type=${state.params.dict_type || ""}`,
  );

const onRowDel = (row: any) => {
  ElMessageBox.confirm(
    t("message.common.confirmDeleteSingle", { name: row.dict_label }),
    t("message.common.confirmTitle"),
    {
      confirmButtonText: t("message.common.confirm"),
      cancelButtonText: t("message.common.cancel"),
      type: "warning",
    },
  )
    .then(() => {
      deleteData([row.dict_code]).then(() => {
        ElMessage.success(t("message.common.msgDeleteOk"));
        query();
      });
    })
    .catch(() => {});
};

const onBatchDelete = () => {
  if (!state.ids.length) {
    ElMessage.warning(t("message.common.msgSelectDelete"));
    return;
  }
  ElMessageBox.confirm(
    t("message.pms.dictDataList.confirmDeleteMulti", { count: state.ids.length }),
    t("message.common.confirmTitle"),
    {
      confirmButtonText: t("message.common.confirm"),
      cancelButtonText: t("message.common.cancel"),
      type: "warning",
    },
  )
    .then(() => remove())
    .catch(() => {});
};

// 加载字典类型选项
const loadDictTypes = () => {
  const dictData: any = useDict("sys_dict_type");
  setTimeout(() => {
    const types = dictData.sys_dict_type || [];
    dictOptions.value = types.map((item: any) => ({ label: item.label, value: item.value }));
  }, 500);
};

onMounted(() => {
  const dict_type = (route.params as any)?.dict_type;
  if (dict_type) {
    state.params.dict_type = String(dict_type);
  }
  loadDictTypes();
  query();
});
</script>

<style scoped>
.text-muted {
  color: var(--cc-color-text-3);
}
</style>
