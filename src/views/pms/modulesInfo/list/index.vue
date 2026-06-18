<template>
  <div class="pmsl-container">
    <el-breadcrumb separator="→" class="mb15">
      <el-breadcrumb-item :to="{ path: '/' }"
        ><el-icon><HomeFilled /></el-icon> {{ $t("message.router.home") }}</el-breadcrumb-item
      >
      <el-breadcrumb-item>{{ $t("message.pms.systemManagement") }}</el-breadcrumb-item>
      <el-breadcrumb-item>{{
        $t("message.pms.modulesInfoList.breadcrumbCurrent")
      }}</el-breadcrumb-item>
    </el-breadcrumb>
    <div class="pmsl-header">
      <div>
        <h1 class="pmsl-title">{{ $t("message.pms.modulesInfoList.labelName") }}</h1>
        <p class="pmsl-subtitle">{{ $t("message.pms.modulesInfoList.pageSubtitle") }}</p>
      </div>
      <div class="pmsl-header-actions">
        <el-button
          v-auth="'api/v1/admin/modules/info/add'"
          type="primary"
          size="large"
          class="pmsl-add-btn"
          @click="handleAdd"
        >
          <el-icon><ele-Plus /></el-icon> {{ $t("message.common.btnAdd") }}
        </el-button>
        <el-button
          v-auth="'api/v1/admin/modules/info/del'"
          :disabled="multiple"
          type="danger"
          size="large"
          @click="handleDelete(null)"
        >
          <el-icon><ele-Delete /></el-icon> {{ $t("message.common.btnDelete") }}
        </el-button>
      </div>
    </div>

    <div class="pmsl-search-card">
      <div class="system-modulesInfo-search mb15">
        <el-form ref="queryRef" :inline="true" :model="tableData.param" label-width="80px">
          <el-row>
            <el-form-item :label="$t('message.pms.modulesInfoList.labelName')" prop="name">
              <el-input
                v-model="tableData.param.name"
                clearable
                :placeholder="$t('message.pms.modulesInfoList.placeholderName')"
                @keyup.enter.native="modulesInfoList"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="modulesInfoList">
                <el-icon>
                  <ele-Search />
                </el-icon>
                {{ $t("message.common.search") }}
              </el-button>
              <el-button @click="resetQuery(queryRef)">
                <el-icon>
                  <ele-Refresh />
                </el-icon>
                {{ $t("message.common.reset") }}
              </el-button>
            </el-form-item>
          </el-row>
        </el-form>
      </div>
    </div>

    <div class="pmsl-table-card">
      <el-table
        v-loading="loading"
        :data="tableData.data"
        border
        @selection-change="handleSelectionChange"
      >
        <el-table-column align="center" type="selection" width="55" />
        <el-table-column
          align="center"
          :label="$t('message.common.colId')"
          prop="id"
          width="80px"
        />
        <el-table-column
          :label="$t('message.pms.modulesInfoList.labelName')"
          min-width="100px"
          prop="name"
        />
        <el-table-column
          :label="$t('message.pms.modulesInfoList.colTable')"
          min-width="100px"
          prop="table_name"
        />
        <el-table-column
          align="center"
          class-name="small-padding"
          fixed="right"
          :label="$t('message.common.colOperation')"
          width="360px"
        >
          <template #default="scope">
            <el-button
              v-if="scope.row.id !== 1"
              v-auth="'api/v1/admin/modules/info/edit'"
              size="small"
              icon="Edit"
              type="primary"
              @click="handleUpdate(scope.row)"
            >
              <!--              修改-->
            </el-button>
            <el-button
              v-auth="'api/v1/admin/modules/info/edit'"
              size="small"
              icon="Setting"
              type="success"
              @click="handleFieldEdit(scope.row)"
            >
              <!--              字段设置-->
            </el-button>
            <el-button
              v-auth="'api/v1/admin/modules/info/create'"
              size="small"
              icon="ArrowRightBold"
              type="info"
              @click="handleCreateModule(scope.row)"
            >
              {{ $t("message.pms.modulesInfoList.btnGenerate") }}
            </el-button>
            <el-button
              v-if="scope.row.id !== 1"
              v-auth="'api/v1/admin/modules/info/del'"
              size="small"
              icon="Delete"
              type="danger"
              @click="handleDelete(scope.row)"
            >
              <!-- 删除-->
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination
        v-show="tableData.total > 0"
        v-model:limit="tableData.param.row"
        v-model:page="tableData.param.page"
        :total="tableData.total"
        @pagination="modulesInfoList"
      />
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
} from "vue";
import { ElMessage, ElMessageBox, FormInstance } from "element-plus";
import { useI18n } from "vue-i18n";
import { createModule, delModulesInfo, listModulesInfo } from "/@/api/pms/modulesInfo";
import {
  ModulesInfoInfoData,
  ModulesInfoTableColumns,
  ModulesInfoTableDataState,
} from "/@/views/pms/modulesInfo/list/component/model";
import { useRouter } from "vue-router";

export default defineComponent({
  name: "apiV1SystemModulesInfoList",
  setup() {
    const router = useRouter();
    const { t } = useI18n();
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
        return $t("message.pms.modulesInfoList.expandSearch");
      } else {
        return $t("message.pms.modulesInfoList.collapseSearch");
      }
    });
    const state = reactive<ModulesInfoTableDataState>({
      ids: [],
      tableData: {
        data: [],
        total: 0,
        loading: false,
        param: {
          page: 1,
          row: 10,
          id: undefined,
          name: undefined,
          sort: undefined,
          table_name: undefined,
          created_at: undefined,
          status: undefined,
          fields: undefined,
        },
      },
    });
    // 页面加载时
    onMounted(() => {
      initTableData();
    });
    // 初始化表格数据
    const initTableData = () => {
      modulesInfoList();
    };
    /** 重置按钮操作 */
    const resetQuery = (formEl: FormInstance | undefined) => {
      if (!formEl) return;
      formEl.resetFields();
      modulesInfoList();
    };
    const handleCreateModule = (row: ModulesInfoTableColumns) => {
      ElMessageBox.confirm(
        "Generating the model will back up and delete original table data. Continue?",
        t("message.pms.modulesInfoList.confirmWarning"),
        {
          cancelButtonText: t("message.common.cancel"),
          confirmButtonText: t("message.common.confirm"),
          type: "warning",
        },
      )
        .then(() => {
          createModule(row.id)
            .then(() => {
              ElMessage.success(t("message.pms.modulesInfoList.msgCreateOk"));
            })
            .catch(() => {});
        })
        .catch(() => {});
    };

    const handleFieldEdit = (row: ModulesInfoTableColumns) => {
      router.push("/pms/cms/modules/field/list?id=" + row.id);
    };
    // 获取列表数据
    const modulesInfoList = () => {
      loading.value = true;
      listModulesInfo(state.tableData.param).then((res: any) => {
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
    const handleSelectionChange = (selection: Array<ModulesInfoInfoData>) => {
      state.ids = selection.map((item) => item.id);
      single.value = selection.length != 1;
      multiple.value = !selection.length;
    };
    const handleAdd = () => {
      proxy.$router.push("/pms/modules/info/list/add");
    };
    const handleUpdate = (row: ModulesInfoTableColumns) => {
      if (!row) {
        row = state.tableData.data.find((item: ModulesInfoTableColumns) => {
          return item.id === state.ids[0];
        }) as ModulesInfoTableColumns;
      }
      proxy.$router.push(`/pms/modules/info/list/edit?id=${row.id}`);
    };
    const handleDelete = (row: ModulesInfoTableColumns) => {
      let msg = t("message.common.confirmDeleteBatch");
      let id: number[] = [];
      if (row) {
        msg = t("message.common.confirmDeleteSingle");
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
          delModulesInfo(id).then(() => {
            ElMessage.success(t("message.common.msgDeleteOk"));
            modulesInfoList();
          });
        })
        .catch(() => {});
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
      resetQuery,
      modulesInfoList,
      toggleSearch,
      handleSelectionChange,
      handleAdd,
      handleUpdate,
      handleDelete,
      handleFieldEdit,
      handleCreateModule,
      ...toRefs(state),
    };
  },
});
</script>
<style scoped>
.pmsl-container {
  max-width: 1400px;
  margin: 0 auto;
}

.pmsl-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin: 24px 0 20px;
  padding: 24px 28px;
  background: var(--cc-color-surface);
  border-radius: var(--cc-radius-lg);
  border: 1px solid var(--cc-color-border-light);
}
.pmsl-title {
  font-size: var(--cc-font-20);
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--cc-color-text-1);
  margin: 0 0 4px;
}
.pmsl-subtitle {
  font-size: var(--cc-font-13);
  color: var(--cc-color-text-3);
  margin: 0;
}
.pmsl-header-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.pmsl-search-card {
  margin-bottom: 16px;
  padding: 16px 20px;
  background: var(--cc-color-surface);
  border: 1px solid var(--cc-color-border-light);
  border-radius: var(--cc-radius-lg);
  box-shadow: var(--cc-shadow-xs);
}
.pmsl-search-card :deep(.el-form-item) {
  margin-bottom: 0;
}

.pmsl-table-card {
  background: var(--cc-color-surface);
  border: 1px solid var(--cc-color-border-light);
  border-radius: var(--cc-radius-lg);
  padding: var(--cc-space-5) var(--cc-space-6) var(--cc-space-3);
  box-shadow: var(--cc-shadow-card);
}
.pmsl-table-card :deep(th.el-table__cell) {
  font-size: var(--cc-font-12);
  font-weight: 600;
  color: var(--cc-color-text-2);
  background: var(--cc-color-bg);
  border-bottom: 1px solid var(--cc-color-border-light);
}

.colBlock {
  display: block;
}
.colNone {
  display: none;
}

@media (max-width: 768px) {
  .pmsl-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    padding: 20px;
  }
  .pmsl-header-actions {
    width: 100%;
  }
  .pmsl-header-actions .el-button {
    flex: 1;
  }
  .pmsl-table-card {
    padding: 12px 8px;
    border-radius: var(--cc-radius-md);
    overflow-x: auto;
  }
}
@media (min-width: 1441px) {
  .pmsl-container {
    max-width: none !important;
    padding: 0 40px;
  }
}
</style>
