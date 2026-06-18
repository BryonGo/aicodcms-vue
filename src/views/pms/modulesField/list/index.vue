<template>
  <div class="pmfl-container">
    <el-breadcrumb separator="→" class="mb15">
      <el-breadcrumb-item :to="{ path: '/' }"
        ><el-icon><HomeFilled /></el-icon> {{ $t("message.router.home") }}</el-breadcrumb-item
      >
      <el-breadcrumb-item>{{ $t("message.pms.systemManagement") }}</el-breadcrumb-item>
      <el-breadcrumb-item>{{
        $t("message.pms.modulesInfoList.breadcrumbCurrent")
      }}</el-breadcrumb-item>
      <el-breadcrumb-item>{{
        $t("message.pms.modulesField.breadcrumbCurrent")
      }}</el-breadcrumb-item>
    </el-breadcrumb>
    <div class="pmfl-header">
      <div>
        <h1 class="pmfl-title">{{ $t("message.pms.modulesFieldEdit.labelField") }}</h1>
        <p class="pmfl-subtitle">{{ $t("message.pms.modulesField.pageSubtitle") }}</p>
      </div>
      <div class="pmfl-header-actions">
        <el-button
          v-auth="'/api/v1/admin/modules/field/add'"
          type="primary"
          size="large"
          class="pmfl-add-btn"
          @click="handleAdd"
        >
          <el-icon><ele-Plus /></el-icon> {{ $t("message.common.btnAdd") }}
        </el-button>
        <el-button
          v-auth="'/api/v1/admin/modules/field/del'"
          :disabled="multiple"
          type="danger"
          size="large"
          @click="handleDelete(null)"
        >
          <el-icon><ele-Delete /></el-icon> {{ $t("message.common.btnDelete") }}
        </el-button>
      </div>
    </div>

    <div class="pmfl-table-card">
      <el-table
        row-key="id"
        border
        v-tableDragable="dragOptions"
        v-loading="loading"
        :data="tableData.data"
        @selection-change="handleSelectionChange"
      >
        <el-table-column width="40" class-name="sortable-handle">
          <template #default>
            <el-icon><ele-Rank /></el-icon>
          </template>
        </el-table-column>
        <el-table-column type="selection" width="55" />
        <el-table-column :label="$t('message.common.colSort')" prop="sort" width="55" />
        <el-table-column
          :label="$t('message.pms.modulesFieldEdit.labelField')"
          width="120px"
          prop="label"
        />
        <el-table-column
          :label="$t('message.pms.modulesFieldEdit.labelName')"
          width="120px"
          prop="name"
        />
        <el-table-column
          :label="$t('message.pms.modulesFieldEdit.labelType')"
          width="100px"
          :formatter="handleModuleInfoFieldTypeFormatter"
          prop="type"
        ></el-table-column>
        <el-table-column
          :label="$t('message.pms.modulesField.labelTranslatable')"
          width="70"
          align="center"
        >
          <template #default="{ row }">
            <el-tag v-if="row.is_translatable === 1" type="success" size="small">{{
              $t("message.common.yes")
            }}</el-tag>
            <span v-else style="color: #c0c4cc">{{ $t("message.common.no") }}</span>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('message.pms.modulesFieldEdit.labelDefault')"
          min-width="100px"
          prop="default"
        />
        <el-table-column
          :label="$t('message.pms.modulesFieldEdit.labelDesc')"
          min-width="100px"
          prop="description"
        />
        <el-table-column
          align="center"
          class-name="small-padding"
          fixed="right"
          :label="$t('message.common.colOperation')"
          width="160px"
        >
          <template #default="scope">
            <el-button
              v-auth="'/api/v1/admin/modules/field/edit'"
              link
              type="primary"
              @click="handleUpdate(scope.row)"
            >
              <el-icon>
                <ele-EditPen />
              </el-icon>
              {{ $t("message.common.btnEdit") }}
            </el-button>
            <el-button
              v-auth="'/api/v1/admin/modules/field/del'"
              link
              type="primary"
              @click="handleDelete(scope.row)"
            >
              <el-icon>
                <ele-DeleteFilled />
              </el-icon>
              {{ $t("message.common.btnDelete") }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>
<script lang="ts">
import {
  computed,
  defineComponent,
  getCurrentInstance,
  onMounted,
  reactive,
  ref,
  toRefs,
  watch,
} from "vue";
import { ElMessage, ElMessageBox, FormInstance } from "element-plus";
import { delModulesField, listModulesField, updateModulesFieldSort } from "/@/api/pms/modulesField";
import {
  ModulesFieldInfoData,
  ModulesFieldTableColumns,
  ModulesFieldTableDataState,
  modulesInfoFieldOptions,
} from "/@/views/pms/modulesField/list/component/model";
import { useRoute, useRouter } from "vue-router";
// @ts-ignore
import { vDragable } from "element-plus-table-dragable";
import { useI18n } from "vue-i18n";

export default defineComponent({
  name: "apiV1SystemModulesFieldList",
  directives: {
    tableDragable: vDragable,
  },
  setup() {
    const { t } = useI18n();
    const route = useRoute();
    const router = useRouter();
    const moduleId = ref(route.query.id ? Number(route.query.id) : 0);
    const { proxy } = <any>getCurrentInstance();
    const loading = ref(false);
    const queryRef = ref();
    const editRef = ref();
    // 是否显示所有搜索选项
    const showAll = ref(false);
    // 非单个禁用
    const single = ref(true);
    // 非多个禁用
    const multiple = ref(true);
    const word = computed(() => {
      if (showAll.value === false) {
        //对文字进行处理
        return t("message.pms.modulesField.expandSearch");
      } else {
        return t("message.pms.modulesField.collapseSearch");
      }
    });

    const dragOptions = [
      {
        selector: "tbody", // add drag support for row
        option: {
          handle: ".sortable-handle",
          animation: 150,
          onEnd: (evt: any) => {
            const sortData: object[] = [];
            state.tableData.data.splice(
              evt.newIndex,
              0,
              state.tableData.data.splice(evt.oldIndex, 1)[0],
            );
            state.tableData.data.forEach((item: ModulesFieldInfoData, index: number) => {
              item.sort = index;
              sortData.push({ id: item.id, sort: item.sort });
            });
            // 更新排序到服务器
            updateModulesFieldSort(sortData);
          },
        },
      },
    ];

    const state = reactive<ModulesFieldTableDataState>({
      ids: [],
      tableData: {
        data: [],
        total: 0,
        loading: false,
        param: {
          module_id: moduleId.value,
          page: 1,
          row: 20,
        },
      },
    });
    // 页面加载时
    onMounted(() => {
      initTableData();
    });
    // 监听路由 query 变化（keep-alive 回退时重新读取 moduleId 并刷新数据）
    watch(
      () => route.query.id,
      (val) => {
        moduleId.value = val ? Number(val) : 0;
        state.tableData.param.module_id = moduleId.value;
        state.tableData.param.page = 1;
        modulesFieldList();
      },
    );
    // 初始化表格数据
    const initTableData = () => {
      modulesFieldList();
    };
    /** 重置按钮操作 */
    const resetQuery = (formEl: FormInstance | undefined) => {
      if (!formEl) return;
      formEl.resetFields();
      modulesFieldList();
    };
    // 获取列表数据
    const modulesFieldList = () => {
      loading.value = true;
      listModulesField(state.tableData.param).then((res: any) => {
        let list = res.data.list ?? [];
        state.tableData.data = list;
        state.tableData.total = res.data.total;
        loading.value = false;
      });
    };
    const toggleSearch = () => {
      showAll.value = !showAll.value;
    };
    // 多选框选中数据
    const handleSelectionChange = (selection: Array<ModulesFieldInfoData>) => {
      state.ids = selection.map((item) => item.id);
      single.value = selection.length != 1;
      multiple.value = !selection.length;
    };
    const handleAdd = () => {
      proxy.$router.push(`/pms/modules/field/list/add?moduleId=${moduleId.value}`);
    };
    const handleUpdate = (row: ModulesFieldTableColumns) => {
      if (!row) {
        row = state.tableData.data.find((item: ModulesFieldTableColumns) => {
          return item.id === state.ids[0];
        }) as ModulesFieldTableColumns;
      }
      proxy.$router.push(`/pms/modules/field/list/edit?moduleId=${moduleId.value}&id=${row.id}`);
    };
    const handleDelete = (row: ModulesFieldTableColumns) => {
      let msg = t("message.common.confirmDeleteBatch");
      let id: number[] = [];
      if (row) {
        msg = t(`此操作将永久删除数据，是否继续?`);
        id = [row.id];
      } else {
        id = state.ids;
      }
      if (id.length === 0) {
        ElMessage.error(t("message.common.msgSelectDelete"));
        return;
      }
      ElMessageBox.confirm(msg, t("message.common.confirmTitle"), {
        confirmButtonText: t("message.common.confirm"),
        cancelButtonText: t("message.common.cancel"),
        type: "warning",
      })
        .then(() => {
          delModulesField(id).then(() => {
            ElMessage.success(t("message.common.msgDeleteOk"));
            modulesFieldList();
          });
        })
        .catch(() => {});
    };
    // 格式化输出字段类型
    const handleModuleInfoFieldTypeFormatter = (row: ModulesFieldInfoData) => {
      for (const item of modulesInfoFieldOptions) {
        if (row.type === item.value) {
          return item.label;
        }
      }
      return t("message.common.msgUnknown");
    };
    return {
      proxy,
      editRef,
      showAll,
      loading,
      single,
      multiple,
      word,
      queryRef,
      moduleId,
      modulesFieldOptions: reactive(modulesInfoFieldOptions),
      resetQuery,
      modulesFieldList,
      toggleSearch,
      handleModuleInfoFieldTypeFormatter,
      handleSelectionChange,
      handleAdd,
      handleUpdate,
      handleDelete,
      vDragable,
      dragOptions,
      ...toRefs(state),
    };
  },
});
</script>
<style scoped>
.colBlock {
  display: block;
}

.colNone {
  display: none;
}
:deep(.sortable-handle) {
  cursor: move;
}
.pmfl-container {
  max-width: 1400px;
  margin: 0 auto;
}
.pmfl-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin: 24px 0 20px;
  padding: 24px 28px;
  background: var(--cc-color-surface);
  border-radius: var(--cc-radius-lg);
  border: 1px solid var(--cc-color-border-light);
}
.pmfl-title {
  font-size: var(--cc-font-20);
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--cc-color-text-1);
  margin: 0 0 4px;
}
.pmfl-subtitle {
  font-size: var(--cc-font-13);
  color: var(--cc-color-text-3);
  margin: 0;
}
.pmfl-header-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}
.pmfl-table-card {
  background: var(--cc-color-surface);
  border: 1px solid var(--cc-color-border-light);
  border-radius: var(--cc-radius-lg);
  padding: var(--cc-space-5) var(--cc-space-6) var(--cc-space-3);
  box-shadow: var(--cc-shadow-card);
}
.pmfl-table-card :deep(th.el-table__cell) {
  font-size: var(--cc-font-12);
  font-weight: 600;
  color: var(--cc-color-text-2);
  background: var(--cc-color-bg);
  border-bottom: 1px solid var(--cc-color-border-light);
}
@media (max-width: 768px) {
  .pmfl-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    padding: 20px;
  }
  .pmfl-header-actions {
    width: 100%;
  }
  .pmfl-header-actions .el-button {
    flex: 1;
  }
  .pmfl-table-card {
    padding: 12px 8px;
    border-radius: var(--cc-radius-md);
    overflow-x: auto;
  }
}
@media (min-width: 1441px) {
  .pmfl-container {
    max-width: none !important;
    padding: 0 40px;
  }
}
</style>
