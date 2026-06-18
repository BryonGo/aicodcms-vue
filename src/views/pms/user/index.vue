<template>
  <ProPage
    :title="$t('message.pms.user.breadcrumbCurrent')"
    :subtitle="
      $t('message.pms.user.breadcrumbSystem') + ' / ' + $t('message.pms.user.breadcrumbCurrent')
    "
  >
    <template #actions>
      <el-button type="primary" :icon="PlusIcon" @click="onOpenAddUser">
        {{ $t("message.common.add") }}
      </el-button>
    </template>

    <div class="user-layout">
      <!-- 左侧：部门树 -->
      <aside class="user-layout__aside">
        <div class="dept-card">
          <div class="dept-card__header">
            <el-icon class="dept-card__icon"><OfficeBuilding /></el-icon>
            <span>{{ $t("message.common.dept") }}</span>
          </div>
          <div class="dept-card__filter">
            <el-input
              v-model="filterText"
              :prefix-icon="SearchIcon"
              :placeholder="$t('message.pms.user.placeholderUsername')"
              clearable
              size="default"
            />
          </div>
          <el-scrollbar class="dept-card__tree">
            <el-tree
              ref="treeRef"
              :data="deptData"
              :props="deptProps"
              default-expand-all
              :filter-node-method="deptFilterNode"
              @node-click="handleNodeClick"
              node-key="dept_id"
              highlight-current
            />
          </el-scrollbar>
        </div>
      </aside>

      <!-- 右侧：搜索 + 工具栏 + 表格 -->
      <section class="user-layout__main">
        <ProSearch
          v-model="state.params"
          :fields="searchFields"
          collapsible
          :collapse-threshold="3"
          @search="search"
          @reset="resetWithDept"
        />

        <div>
          <ProToolbar :size="density" @refresh="query" @update:size="density = $event as any">
            <template #left>
              <el-button type="primary" :icon="PlusIcon" @click="onOpenAddUser">
                {{ $t("message.common.add") }}
              </el-button>
              <el-button
                type="danger"
                :icon="DeleteIcon"
                :disabled="!state.ids.length"
                @click="onBatchDelete"
              >
                {{ $t("message.common.btnDelete")
                }}<template v-if="state.ids.length"> ({{ state.ids.length }})</template>
              </el-button>
              <el-tag
                v-if="currentDeptName"
                type="info"
                effect="light"
                closable
                @close="clearDeptFilter"
              >
                <el-icon class="dept-tag-icon"><OfficeBuilding /></el-icon>
                {{ currentDeptName }}
              </el-tag>
            </template>
          </ProToolbar>

          <ProTable
            :data="state.data"
            :loading="state.loading"
            :total="state.total"
            :page="state.page"
            :page-size="state.size"
            :size="density"
            selection
            @selection-change="onSelectionChange"
            @pagination="onPageChange"
          >
            <el-table-column prop="id" label="ID" width="72" align="center" />
            <el-table-column
              :label="$t('message.pms.user.colAccount')"
              min-width="180"
              show-overflow-tooltip
            >
              <template #default="{ row }">
                <div class="user-cell">
                  <div
                    class="user-cell__avatar"
                    :style="{ background: avatarColor(row.user_name) }"
                  >
                    {{ (row.user_nickname || row.user_name || "?")[0].toUpperCase() }}
                  </div>
                  <div class="user-cell__main">
                    <div class="user-cell__name">{{ row.user_name }}</div>
                    <div class="user-cell__sub">{{ row.user_nickname || "—" }}</div>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column
              prop="dept.dept_name"
              :label="$t('message.pms.user.colDept')"
              min-width="120"
              show-overflow-tooltip
            />
            <el-table-column :label="$t('message.pms.user.colRole')" min-width="160">
              <template #default="{ row }">
                <el-tag
                  v-for="(r, i) in row.roleInfo || []"
                  :key="'r-' + i"
                  size="small"
                  type="info"
                  effect="light"
                  style="margin-right: 4px"
                  >{{ r.name }}</el-tag
                >
                <span v-if="!row.roleInfo?.length" class="text-muted">—</span>
              </template>
            </el-table-column>
            <el-table-column
              prop="mobile"
              :label="$t('message.pms.user.colPhone')"
              min-width="120"
              show-overflow-tooltip
            />
            <el-table-column
              :label="$t('message.pms.user.colUserStatus')"
              width="120"
              align="center"
            >
              <template #default="{ row }">
                <el-switch
                  v-model="row.user_status"
                  inline-prompt
                  :active-value="1"
                  :inactive-value="0"
                  :active-text="$t('message.common.enabled')"
                  :inactive-text="$t('message.common.disabled')"
                  :disabled="row.id === 1"
                  @change="handleStatusChange(row)"
                />
              </template>
            </el-table-column>
            <el-table-column :label="$t('message.common.colCreateTime')" min-width="150">
              <template #default="{ row }">
                <span class="text-muted">{{
                  parseTime(row.created_at, "{y}-{m}-{d} {h}:{i}")
                }}</span>
              </template>
            </el-table-column>
            <el-table-column :label="$t('message.common.colOperation')" width="200" fixed="right">
              <template #default="{ row }">
                <el-button
                  link
                  size="small"
                  type="primary"
                  :disabled="row.id === 1"
                  @click="onOpenEditUser(row)"
                >
                  {{ $t("message.common.btnEdit") }}
                </el-button>
                <el-button
                  link
                  size="small"
                  type="primary"
                  :disabled="row.id === 1"
                  @click="handleResetPwd(row)"
                >
                  {{ $t("message.common.reset") }}
                </el-button>
                <el-button
                  link
                  size="small"
                  type="danger"
                  :disabled="row.id === 1"
                  @click="onRowDel(row)"
                >
                  {{ $t("message.common.btnRemove") }}
                </el-button>
              </template>
            </el-table-column>
          </ProTable>
        </div>
      </section>
    </div>
  </ProPage>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, getCurrentInstance } from "vue";
import { useI18n } from "vue-i18n";
import { ElMessage, ElMessageBox, ElTree } from "element-plus";
import {
  Plus as PlusIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  OfficeBuilding,
} from "@element-plus/icons-vue";

import ProPage from "/@/components/pro/ProPage.vue";
import ProSearch, { type ProSearchField } from "/@/components/pro/ProSearch.vue";
import ProToolbar from "/@/components/pro/ProToolbar.vue";
import ProTable from "/@/components/pro/ProTable.vue";
import { useProTable } from "/@/composables/useProTable";

import {
  getUserList,
  getDeptTree,
  deleteUser,
  resetUserPwd,
  changeUserStatus,
} from "/@/api/pms/user/index";
import { parseTime } from "/@/utils/aicodcod";

const { t } = useI18n();
const { proxy } = <any>getCurrentInstance();

const density = ref<"large" | "default" | "small">("default");
const filterText = ref("");
const treeRef = ref<InstanceType<typeof ElTree>>();
const deptData = ref<any[]>([]);
const deptProps = { children: "children", label: "dept_name" };
const currentDeptName = ref("");

let isActive = true;
onUnmounted(() => {
  isActive = false;
});

// ---- 搜索 schema ----
const searchFields: ProSearchField[] = [
  {
    prop: "keyWords",
    label: t("message.pms.user.labelKeyword"),
    type: "input",
    placeholder: t("message.pms.user.placeholderAccount"),
  },
  {
    prop: "mobile",
    label: t("message.pms.user.labelPhone"),
    type: "input",
    placeholder: t("message.pms.user.placeholderMobile"),
  },
  {
    prop: "status",
    label: t("message.common.status"),
    type: "select",
    placeholder: t("message.pms.user.placeholderStatus"),
    options: [
      { label: t("message.pms.user.statusEnabled"), value: 1 },
      { label: t("message.pms.user.statusDisabled"), value: 0 },
    ],
  },
  {
    prop: "dateRange",
    label: t("message.common.colCreateTime"),
    type: "daterange",
    width: "260px",
  },
];

// ---- 列表 composable ----
const { state, query, search, reset, onPageChange, onSelectionChange, remove } = useProTable({
  api: getUserList,
  defaults: { keyWords: "", mobile: "", status: "", dept_id: "", dateRange: [] },
  pageKey: "page",
  sizeKey: "row",
  defaultPageSize: 10,
  transform: (res) => ({
    list: res?.data?.list ?? [],
    total: res?.data?.total ?? 0,
  }),
  deleteApi: deleteUser,
  rowKey: "id",
});

// 重置时清空已选部门
const resetWithDept = () => {
  currentDeptName.value = "";
  treeRef.value?.setCurrentKey(undefined as any);
  reset();
};

// ---- 部门树 ----
const loadDept = async () => {
  try {
    const res: any = await getDeptTree();
    if (!isActive) return;
    deptData.value = res?.data?.deps ?? [];
  } catch (e) {
    deptData.value = [];
  }
};

watch(filterText, (val) => {
  treeRef.value?.filter(val);
});

const deptFilterNode = (value: string, data: any) => {
  if (!value) return true;
  return (data.dept_name || "").includes(value);
};

const handleNodeClick = (data: any) => {
  state.params.dept_id = data.dept_id;
  currentDeptName.value = data.dept_name || "";
  state.page = 1;
  query();
};

const clearDeptFilter = () => {
  state.params.dept_id = "";
  currentDeptName.value = "";
  treeRef.value?.setCurrentKey(undefined as any);
  state.page = 1;
  query();
};

// ---- 操作 ----
const onOpenAddUser = () => proxy.$router.push("/pms/user/list/add");
const onOpenEditUser = (row: any) => proxy.$router.push(`/pms/user/list/edit?id=${row.id}`);

// 单行删除 = remove(row)
const onRowDel = (row: any) => {
  ElMessageBox.confirm(
    t("message.common.confirmDeleteSingle") + ` (${row.user_name})`,
    t("message.common.confirmTitle"),
    {
      confirmButtonText: t("message.common.confirm"),
      cancelButtonText: t("message.common.cancel"),
      type: "warning",
    },
  )
    .then(() => {
      deleteUser([row.id]).then(() => {
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
  ElMessageBox.confirm(t("message.pms.user.confirmDelete"), t("message.common.confirmTitle"), {
    confirmButtonText: t("message.common.confirm"),
    cancelButtonText: t("message.common.cancel"),
    type: "warning",
  })
    .then(() => {
      remove();
    })
    .catch(() => {});
};

// 重置密码
const handleResetPwd = (row: any) => {
  ElMessageBox.prompt(
    t("message.pms.user.placeholderPwd") + ` (${row.user_name})`,
    t("message.common.confirmTitle"),
    {
      confirmButtonText: t("message.common.confirm"),
      cancelButtonText: t("message.common.cancel"),
    },
  )
    .then(({ value }) => {
      if (!value) {
        ElMessage.warning(t("message.pms.user.msgPasswordRequired"));
        return;
      }
      resetUserPwd(row.id, value).then(() => {
        ElMessage.success(t("message.common.msgEditOk"));
      });
    })
    .catch(() => {});
};

// 状态切换
const handleStatusChange = (row: any) => {
  const text = row.user_status === 1 ? t("message.common.enabled") : t("message.common.disabled");
  ElMessageBox.confirm(`${text} ${row.user_name} ?`, t("message.common.confirmTitle"), {
    confirmButtonText: t("message.common.confirm"),
    cancelButtonText: t("message.common.cancel"),
    type: "warning",
  })
    .then(() => {
      changeUserStatus(row.id, row.user_status).then(() => {
        ElMessage.success(t("message.common.msgEditOk"));
      });
    })
    .catch(() => {
      // 取消则回滚 UI
      row.user_status = row.user_status === 0 ? 1 : 0;
    });
};

// ---- 头像底色 ----
const avatarColors = [
  "#16BAAA",
  "#3B82F6",
  "#8B5CF6",
  "#F59E0B",
  "#EC4899",
  "#10B981",
  "#0EA5E9",
  "#EF4444",
];
const avatarColor = (name?: string) => {
  if (!name) return avatarColors[0];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return avatarColors[h % avatarColors.length];
};

onMounted(() => {
  loadDept();
});
</script>

<style scoped>
.user-layout {
  display: flex;
  gap: var(--cc-space-4);
  min-height: 0;
}
.user-layout__aside {
  flex: 0 0 240px;
  min-width: 0;
}
.user-layout__main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--cc-space-4);
}

/* ---- 部门卡片 ---- */
.dept-card {
  background: var(--cc-color-surface);
  border: 1px solid var(--cc-color-border-light);
  border-radius: var(--cc-radius-lg);
  box-shadow: var(--cc-shadow-xs);
  display: flex;
  flex-direction: column;
  height: 100%;
  max-height: calc(100vh - 220px);
  overflow: hidden;
}
.dept-card__header {
  display: flex;
  align-items: center;
  gap: var(--cc-space-2);
  padding: var(--cc-space-4) var(--cc-space-4) var(--cc-space-2);
  color: var(--cc-color-text-1);
  font-weight: 600;
  font-size: var(--cc-font-14);
}
.dept-card__icon {
  color: var(--cc-color-primary);
  font-size: 16px;
}
.dept-card__filter {
  padding: 0 var(--cc-space-4) var(--cc-space-3);
}
.dept-card__tree {
  flex: 1;
  padding: 0 var(--cc-space-2) var(--cc-space-3);
}
.dept-card__tree :deep(.el-tree) {
  background: transparent;
  font-size: var(--cc-font-13);
}
.dept-card__tree :deep(.el-tree-node__content) {
  height: 32px;
  border-radius: var(--cc-radius-sm);
  margin: 2px 4px;
  padding: 0 6px;
}
.dept-card__tree :deep(.el-tree-node__content:hover) {
  background: var(--cc-color-surface-hover);
}
.dept-card__tree :deep(.el-tree-node.is-current > .el-tree-node__content) {
  background: var(--cc-color-primary-soft);
  color: var(--cc-color-primary);
  font-weight: 600;
}

/* ---- 用户单元格 ---- */
.user-cell {
  display: flex;
  align-items: center;
  gap: var(--cc-space-3);
}
.user-cell__avatar {
  width: 32px;
  height: 32px;
  border-radius: var(--cc-radius-md);
  color: #fff;
  font-weight: 700;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.user-cell__main {
  min-width: 0;
}
.user-cell__name {
  font-weight: 600;
  color: var(--cc-color-text-1);
  font-size: var(--cc-font-13);
}
.user-cell__sub {
  font-size: var(--cc-font-12);
  color: var(--cc-color-text-3);
}
.text-muted {
  color: var(--cc-color-text-3);
}

/* ---- 部门 tag ---- */
.dept-tag-icon {
  font-size: 12px;
  margin-right: 2px;
  vertical-align: -1px;
}
</style>
