<template>
  <div class="pms-card-container">
    <el-breadcrumb separator="→" class="mb15">
      <el-breadcrumb-item :to="{ path: '/' }"
        ><el-icon><HomeFilled /></el-icon> {{ $t("message.router.home") }}</el-breadcrumb-item
      >
      <el-breadcrumb-item>{{ $t("message.pms.systemManagement") }}</el-breadcrumb-item>
      <el-breadcrumb-item>{{ $t("message.pms.post.breadcrumbCurrent") }}</el-breadcrumb-item>
    </el-breadcrumb>
    <div class="pms-card-header">
      <div>
        <h1 class="pms-card-title">{{ $t("message.pms.post.colCode") }}</h1>
        <p class="pms-card-sub">PMS Post Management</p>
      </div>
      <div class="pms-card-actions">
        <el-button size="large" type="success" class="pms-card-add" @click="onOpenAddPost"
          ><el-icon><ele-FolderAdd /></el-icon> {{ $t("message.common.add") }}</el-button
        >
        <el-button size="large" type="danger" @click="onRowDel(null)"
          ><el-icon><ele-Delete /></el-icon> {{ $t("message.common.delete") }}</el-button
        >
      </div>
    </div>
    <div class="pms-card-search">
      <div class="system-user-search mb15">
        <el-form :inline="true">
          <el-form-item :label="$t('message.common.colName')">
            <el-input
              size="default"
              v-model="tableData.param.section_name"
              :placeholder="$t('message.pms.post.placeholderName')"
              class="w-50 m-2"
              clearable
            />
          </el-form-item>
          <el-form-item :label="$t('message.pms.post.colCode')">
            <el-input
              size="default"
              v-model="tableData.param.section_code"
              :placeholder="$t('message.pms.post.placeholderCode')"
              class="w-50 m-2"
              clearable
            />
          </el-form-item>
          <el-form-item :label="$t('message.pms.post.labelStatus')">
            <el-select
              size="default"
              :placeholder="$t('message.pms.post.placeholderStatus')"
              class="w-50 m-2"
              v-model="tableData.param.status"
              clearable
            >
              <el-option :label="$t('message.pms.post.statusEnabled')" value="1" />
              <el-option :label="$t('message.pms.post.statusDisabled')" value="0" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button size="default" type="primary" class="ml10" @click="sectionList">
              <el-icon><ele-Search /></el-icon> {{ $t("message.common.search") }}</el-button
            >
          </el-form-item>
        </el-form>
      </div>
    </div>
    <div class="pms-card-table">
      <el-table
        :data="tableData.data"
        stripe
        border
        size="small"
        @selection-change="handleSelectionChange"
        style="width: 100%"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column type="index" :label="$t('message.common.colId')" width="60" />
        <el-table-column
          prop="section_code"
          :label="$t('message.pms.post.colCode')"
          show-overflow-tooltip
        />
        <el-table-column
          prop="section_name"
          :label="$t('message.common.colName')"
          show-overflow-tooltip
        />
        <el-table-column
          prop="section_sort"
          :label="$t('message.common.colSort')"
          width="80"
          align="center"
        />
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
                  ? $t("message.pms.post.statusEnabled")
                  : $t("message.pms.post.statusDisabled")
              }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="remark"
          :label="$t('message.pms.post.colDesc')"
          show-overflow-tooltip
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
          width="220"
          align="center"
          fixed="right"
        >
          <template #default="scope">
            <el-button link size="small" type="primary" @click="onOpenEditPost(scope.row)">
              <el-icon><ele-Edit /></el-icon> {{ $t("message.common.btnEdit") }}
            </el-button>
            <el-button link size="small" type="danger" @click="onRowDel(scope.row)">
              <el-icon><ele-Delete /></el-icon> {{ $t("message.common.btnRemove") }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination
        v-show="tableData.total > 0"
        :total="tableData.total"
        v-model:page="tableData.param.page"
        v-model:limit="tableData.param.row"
        @pagination="sectionList"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { toRefs, reactive, onMounted, ref, defineComponent, toRaw, getCurrentInstance } from "vue";
import { useI18n } from "vue-i18n";
import { ElMessageBox, ElMessage } from "element-plus";

import { deletePost, getPostList } from "/@/api/pms/post";
import { parseTime } from "/@/utils/aicodcod";

// 定义接口来定义对象的类型
interface TableData {
  section_id: number;
  section_code: string;
  section_name: string;
  section_sort: number;
  status: number;
  remark: string;
  created_at: string;
}
interface TableDataState {
  ids: number[];
  tableData: {
    data: Array<TableData>;
    total: number;
    loading: boolean;
    param: {
      section_name: string;
      status: string;
      section_code: string;
      row: number;
      page: number;
    };
  };
}

export default defineComponent({
  name: "apiV1SystemPostList",
  setup() {
    const { t } = useI18n();
    const { proxy } = getCurrentInstance() as any;
    const addPostRef = ref();

    const state = reactive<TableDataState>({
      ids: [],
      tableData: {
        data: [],
        total: 0,
        loading: false,
        param: {
          section_name: "",
          status: "",
          section_code: "",
          page: 1,
          row: 10,
        },
      },
    });
    // 初始化表格数据
    const initTableData = () => {
      sectionList();
    };
    const sectionList = () => {
      getPostList(state.tableData.param).then((res) => {
        state.tableData.data = res.data.list ?? [];
        state.tableData.total = res.data.total;
      });
    };
    // 打开新增岗位弹窗
    const onOpenAddPost = () => {
      proxy.$router.push("/pms/post/list/add");
    };
    // 打开修改岗位弹窗
    const onOpenEditPost = (row: object) => {
      proxy.$router.push(
        `/pms/post/list/edit?id=${(row as any).section_id}&section_name=${(row as any).section_name}&section_code=${(row as any).section_code}&section_sort=${(row as any).section_sort}&status=${(row as any).status}&remark=${encodeURIComponent((row as any).remark || "")}`,
      );
    };
    // 删除岗位
    const onRowDel = (row: any) => {
      let msg = t("message.pms.post.confirmDeleteBatch");
      let ids: number[] = [];
      if (row) {
        msg =
          t("message.pms.post.confirmDeleteSingle").replace("{name}", row.section_name) +
          ", continue?";
        ids = [row.section_id];
      } else {
        ids = state.ids;
      }
      if (ids.length === 0) {
        ElMessage.error(t("message.common.msgSelectDelete"));
        return;
      }
      ElMessageBox.confirm(msg, t("message.common.confirmTitle"), {
        confirmButtonText: t("message.common.confirm"),
        cancelButtonText: t("message.pms.common.cancelBtn"),
        type: "warning",
      })
        .then(() => {
          deletePost(ids).then(() => {
            ElMessage.success(t("message.msg.deleteSuccess"));
            sectionList();
          });
        })
        .catch(() => {});
    };
    // 分页改变
    const onHandleSizeChange = (val: number) => {
      state.tableData.param.page = val;
    };
    // 分页改变
    const onHandleCurrentChange = (val: number) => {
      state.tableData.param.row = val;
    };
    // 页面加载时
    onMounted(() => {
      initTableData();
    });
    // 多选框选中数据
    const handleSelectionChange = (selection: Array<TableData>) => {
      state.ids = selection.map((item) => item.section_id);
    };
    return {
      addPostRef,
      onOpenAddPost,
      onOpenEditPost,
      onRowDel,
      onHandleSizeChange,
      onHandleCurrentChange,
      sectionList,
      handleSelectionChange,
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
