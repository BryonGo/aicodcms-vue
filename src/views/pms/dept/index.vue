<template>
  <div class="pms-card-container">
    <el-breadcrumb separator="→" class="mb15">
      <el-breadcrumb-item :to="{ path: '/' }"
        ><el-icon><HomeFilled /></el-icon> {{ $t("message.router.home") }}</el-breadcrumb-item
      >
      <el-breadcrumb-item>{{ $t("message.pms.systemManagement") }}</el-breadcrumb-item>
      <el-breadcrumb-item>{{ $t("message.pms.dept.breadcrumbCurrent") }}</el-breadcrumb-item>
    </el-breadcrumb>
    <div class="pms-card-header">
      <div>
        <h1 class="pms-card-title">{{ $t("message.common.dept") }}</h1>
        <p class="pms-card-sub">
          {{ $t("message.pms.dept.pageSubtitle") || $t("message.pms.dept.pageTitle") }}
        </p>
      </div>
      <div class="pms-card-actions">
        <el-button size="large" type="success" class="pms-card-add" @click="onOpenAddDept">
          <el-icon><Plus /></el-icon> {{ $t("message.common.add") }}
        </el-button>
      </div>
    </div>
    <div class="pms-card-search">
      <el-form :inline="true">
        <el-form-item :label="$t('message.common.colName')">
          <el-input
            v-model="tableData.param.dept_name"
            :placeholder="$t('message.pms.dept.placeholderSearch')"
            clearable
            @keyup.enter="deptList"
          />
        </el-form-item>
        <el-form-item :label="$t('message.pms.dept.labelDeptStatus')">
          <el-select
            v-model="tableData.param.status"
            :placeholder="$t('message.pms.dept.placeholderStatus2')"
            clearable
          >
            <el-option :label="$t('message.pms.dept.statusEnabled')" value="1" />
            <el-option :label="$t('message.pms.dept.statusDisabled')" value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="deptList">
            <el-icon><Search /></el-icon> {{ $t("message.common.search") }}
          </el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="pms-card-table">
      <el-table
        :data="tableData.data"
        style="width: 100%"
        row-key="dept_id"
        default-expand-all
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        stripe
        border
        size="small"
      >
        <el-table-column
          prop="dept_name"
          :label="$t('message.common.colName')"
          min-width="200"
          show-overflow-tooltip
        >
          <template #default="scope">
            <span class="dept-name-cell">
              <el-icon v-if="scope.row.children?.length" class="dept-folder-icon"
                ><FolderOpened
              /></el-icon>
              <el-icon v-else class="dept-file-icon"><Document /></el-icon>
              {{ scope.row.dept_name }}
            </span>
          </template>
        </el-table-column>
        <el-table-column
          prop="status"
          :label="$t('message.common.colStatus')"
          width="100"
          align="center"
        >
          <template #default="scope">
            <el-tag
              :type="scope.row.status === 1 ? 'success' : 'info'"
              size="small"
              effect="light"
              round
            >
              {{
                scope.row.status === 1
                  ? $t("message.pms.dept.statusEnabled")
                  : $t("message.pms.dept.statusDisabled")
              }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="order_num"
          :label="$t('message.common.colSort')"
          width="80"
          align="center"
        />
        <el-table-column
          prop="created_at"
          :label="$t('message.common.colCreateTime')"
          width="180"
          align="center"
        >
          <template #default="scope">
            {{ parseTime(scope.row.created_at, "{m}/{d} {h}:{i}") }}
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('message.common.colOperation')"
          width="240"
          align="center"
          fixed="right"
        >
          <template #default="scope">
            <el-button link size="small" type="primary" @click="onOpenAddDept(scope.row)">
              <el-icon><Plus /></el-icon> {{ $t("message.common.add") }}
            </el-button>
            <el-button link size="small" type="primary" @click="onOpenEditDept(scope.row)">
              <el-icon><Edit /></el-icon> {{ $t("message.common.btnEdit") }}
            </el-button>
            <el-button link size="small" type="danger" @click="onTabelRowDel(scope.row)">
              <el-icon><Delete /></el-icon> {{ $t("message.common.btnRemove") }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, toRefs, reactive, onMounted, defineComponent, getCurrentInstance } from "vue";
import { useI18n } from "vue-i18n";
import { ElMessageBox, ElMessage } from "element-plus";

import { deleteDept, getDeptList } from "/@/api/pms/dept";
import { parseTime } from "/@/utils/aicodcod";

// 定义接口来定义对象的类型
interface TableDataRow {
  dept_id: number;
  parent_id: number;
  dept_name: string;
  status: number;
  order_num: number;
  created_at: string;
  children?: TableDataRow[];
}
interface TableDataState {
  tableData: {
    data: Array<TableDataRow>;
    loading: boolean;
    param: {
      row: number;
      page: number;
      dept_name: string;
      status: string;
    };
  };
}

export default defineComponent({
  name: "systemDept",
  setup() {
    const { t } = useI18n();
    const { proxy } = getCurrentInstance() as any;

    const state = reactive<TableDataState>({
      tableData: {
        data: [],
        loading: false,
        param: {
          page: 1,
          row: 10,
          dept_name: "",
          status: "",
        },
      },
    });
    // 初始化表格数据
    const initTableData = () => {
      deptList();
    };
    const deptList = () => {
      getDeptList(state.tableData.param).then((res: any) => {
        state.tableData.data = proxy.handleTree(res.data.list ?? [], "dept_id", "parent_id");
      });
    };
    // 打开新增菜单弹窗
    const onOpenAddDept = (row?: TableDataRow) => {
      proxy.$router.push(`/pms/dept/list/add?parent_id=${row?.dept_id || 0}`);
    };
    // 打开编辑菜单弹窗
    const onOpenEditDept = (row: TableDataRow) => {
      proxy.$router.push(
        `/pms/dept/list/edit?id=${row.dept_id}&dept_name=${row.dept_name}&parent_id=${row.parent_id || 0}&order_num=${row.order_num || 0}&leader=${encodeURIComponent(row.leader || "")}&phone=${encodeURIComponent(row.phone || "")}&email=${encodeURIComponent(row.email || "")}&status=${row.status || 1}`,
      );
    };
    // 删除当前行
    const onTabelRowDel = (row: TableDataRow) => {
      ElMessageBox.confirm(
        `This will permanently delete department: ${row.dept_name}. Continue?`,
        t("message.common.confirmTitle"),
        {
          confirmButtonText: t("message.common.delete"),
          cancelButtonText: t("message.pms.common.cancelBtn"),
          type: "warning",
        },
      )
        .then(() => {
          deleteDept(row.dept_id).then(() => {
            ElMessage.success(t("message.msg.deleteSuccess"));
            deptList();
          });
        })
        .catch(() => {});
    };
    // 页面加载时
    onMounted(() => {
      initTableData();
    });
    return {
      deptList,
      onOpenAddDept,
      onOpenEditDept,
      onTabelRowDel,
      parseTime,
      ...toRefs(state),
    };
  },
});
</script>

<style scoped>
/* 风格统一到 design system（薄荷绿）— 旧浅蓝主题（#bae6fd/#0ea5e9）下线 */
.pms-card-container {
  max-width: 1400px;
  margin: 0 auto;
}
.pms-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin: 24px 0 20px;
  padding: 24px 28px;
  background: var(--cc-color-surface);
  border-radius: var(--cc-radius-lg);
  border: 1px solid var(--cc-color-border-light);
}
.pms-card-title {
  font-size: var(--cc-font-20);
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--cc-color-text-1);
  margin: 0 0 4px;
}
.pms-card-sub {
  font-size: var(--cc-font-13);
  color: var(--cc-color-text-3);
  margin: 0;
}
.pms-card-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}
.pms-card-search {
  margin-bottom: 16px;
  padding: 16px 20px;
  background: var(--cc-color-surface);
  border: 1px solid var(--cc-color-border-light);
  border-radius: var(--cc-radius-lg);
  box-shadow: var(--cc-shadow-xs);
}
.pms-card-search :deep(.el-form-item) {
  margin-bottom: 0;
}
.pms-card-table {
  background: var(--cc-color-surface);
  border: 1px solid var(--cc-color-border-light);
  border-radius: var(--cc-radius-lg);
  padding: var(--cc-space-5) var(--cc-space-6) var(--cc-space-3);
  box-shadow: var(--cc-shadow-card);
}
.pms-card-table :deep(th.el-table__cell) {
  font-size: var(--cc-font-12);
  font-weight: 600;
  color: var(--cc-color-text-2);
  background: var(--cc-color-bg);
  border-bottom: 1px solid var(--cc-color-border-light);
}

.dept-name-cell {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
  color: var(--cc-color-text-1);
}
.dept-folder-icon {
  color: var(--cc-color-warning);
  font-size: 16px;
}
.dept-file-icon {
  color: var(--cc-color-text-4);
  font-size: 14px;
}
.pms-card-table :deep(.el-button.is-link) {
  font-size: var(--cc-font-12);
  padding: 4px 6px;
}
.pms-card-table :deep(.el-button.is-link .el-icon) {
  margin-right: 2px;
}

@media (max-width: 768px) {
  .pms-card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    padding: 20px;
  }
  .pms-card-actions {
    width: 100%;
  }
  .pms-card-actions .el-button {
    flex: 1;
  }
  .pms-card-table {
    padding: 12px 8px;
    border-radius: var(--cc-radius-md);
    overflow-x: auto;
  }
}
@media (min-width: 1441px) {
  .pms-card-container {
    max-width: none !important;
    padding: 0 40px;
  }
}
</style>
