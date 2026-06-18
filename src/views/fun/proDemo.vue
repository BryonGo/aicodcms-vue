<template>
  <ProPage
    title="Pro Components Preview"
    subtitle="ProPage + ProSearch + ProToolbar + ProTable + ProDescriptions + ProDrawer + ProUpload with real data"
    badge="Demo"
  >
    <template #actions>
      <el-button :icon="DocumentIcon" @click="openDocs">Docs</el-button>
    </template>

    <ProSearch
      v-model="state.params"
      :fields="searchFields"
      collapsible
      :collapse-threshold="3"
      @search="search"
      @reset="reset"
    />

    <div>
      <ProToolbar :size="density" @refresh="query" @update:size="density = $event as any">
        <template #left>
          <el-button type="primary" :icon="PlusIcon" @click="onAdd">Add User</el-button>
          <el-button
            type="danger"
            :icon="DeleteIcon"
            :disabled="!state.ids.length"
            @click="remove()"
          >
            批量删除<template v-if="state.ids.length"> ({{ state.ids.length }})</template>
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
        selection
        @selection-change="onSelectionChange"
        @pagination="onPageChange"
      >
        <el-table-column prop="id" label="ID" width="72" align="center" />
        <el-table-column prop="user_name" label="Account" min-width="120" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="user-cell">
              <div class="user-cell__avatar" :style="{ background: avatarColor(row.user_name) }">
                {{ (row.user_nickname || row.user_name || "?")[0].toUpperCase() }}
              </div>
              <div class="user-cell__main">
                <div class="user-cell__name">{{ row.user_name }}</div>
                <div class="user-cell__sub">{{ row.user_nickname || "—" }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="dept.dept_name" label="Dept" min-width="120" show-overflow-tooltip />
        <el-table-column label="Roles" min-width="160">
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
        <el-table-column prop="mobile" label="Mobile" min-width="120" show-overflow-tooltip />
        <el-table-column label="Status" width="110" align="center">
          <template #default="{ row }">
            <el-switch
              v-model="row.user_status"
              inline-prompt
              :active-value="1"
              :inactive-value="0"
              active-text="Enabled"
              inactive-text="Disabled"
              :disabled="row.id === 1"
            />
          </template>
        </el-table-column>
        <el-table-column label="Created At" min-width="140">
          <template #default="{ row }">
            <span class="text-muted">{{ parseTime(row.created_at, "{y}-{m}-{d} {h}:{i}") }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Actions" width="260" fixed="right">
          <template #default="{ row }">
            <el-button
              link
              size="small"
              type="primary"
              :disabled="row.id === 1"
              @click="onDetail(row)"
              >Detail</el-button
            >
            <el-button link size="small" type="primary" :disabled="row.id === 1">Edit</el-button>
            <el-button link size="small" type="primary" :disabled="row.id === 1"
              >Reset Password</el-button
            >
            <el-button link size="small" type="danger" :disabled="row.id === 1" @click="remove(row)"
              >Delete</el-button
            >
          </template>
        </el-table-column>
      </ProTable>
    </div>

    <!-- ProDescriptions 嵌入页内 -->
    <ProDescriptions
      v-if="detailRow"
      :source="detailRow"
      :items="descItems"
      :column="2"
      title="Selected User Details (ProDescriptions demo)"
      subtitle="Schema-driven display with type/render/span/options/nested paths"
      bordered
      label-width="100px"
      size="default"
    >
      <template #extra>
        <el-button size="small" @click="detailRow = null">Clear</el-button>
      </template>
    </ProDescriptions>

    <!-- ProDrawer 演示按钮 -->
    <div>
      <el-button type="primary" @click="drawerOpen = true">
        Open Drawer (ProDrawer demo)
      </el-button>
    </div>

    <ProDrawer
      v-model="drawerOpen"
      title="User Detail Drawer"
      subtitle="ProDescriptions embedded in drawer"
      size="md"
      show-footer
      @confirm="onDrawerConfirm"
    >
      <ProDescriptions
        v-if="detailRow"
        :source="detailRow"
        :items="descItems"
        :column="1"
        label-width="100px"
      />
      <el-empty v-else description="Click Detail in the table above to select a row" />
    </ProDrawer>

    <!-- ProUpload Demo -->
    <div class="demo-card">
      <div class="demo-card__header">
        <h3 class="demo-card__title">ProUpload Demo</h3>
        <p class="demo-card__subtitle">Supports file / image / image-card / drag modes</p>
      </div>
      <div class="demo-card__body">
        <div class="upload-demo-grid">
          <div>
            <div class="demo-label">File mode</div>
            <ProUpload
              action="/api/v1/upload/file"
              mode="file"
              button-text="Upload File"
              tip="Supports doc/pdf/zip, max 20MB"
              :max-size="20"
            />
          </div>
          <div>
            <div class="demo-label">Image mode</div>
            <ProUpload
              action="/api/v1/upload/file"
              mode="image"
              button-text="Upload Image"
              accept="image/*"
              tip="Supports JPG / PNG / GIF"
            />
          </div>
          <div>
            <div class="demo-label">Image-card mode</div>
            <ProUpload action="/api/v1/upload/file" mode="image-card" multiple :limit="5" />
          </div>
          <div>
            <div class="demo-label">Drag mode</div>
            <ProUpload
              action="/api/v1/upload/file"
              mode="drag"
              multiple
              tip="Multiple files supported"
            />
          </div>
        </div>
      </div>
    </div>
  </ProPage>
</template>

<script setup lang="ts">
import { ref, computed, getCurrentInstance, h } from "vue";
import {
  Plus as PlusIcon,
  Delete as DeleteIcon,
  Document as DocumentIcon,
} from "@element-plus/icons-vue";
import { ElMessage, ElTag } from "element-plus";

import ProPage from "/@/components/pro/ProPage.vue";
import ProSearch, { type ProSearchField } from "/@/components/pro/ProSearch.vue";
import ProToolbar from "/@/components/pro/ProToolbar.vue";
import ProTable from "/@/components/pro/ProTable.vue";
import ProDescriptions, { type ProDescriptionsItem } from "/@/components/pro/ProDescriptions.vue";
import ProDrawer from "/@/components/pro/ProDrawer.vue";
import ProUpload from "/@/components/pro/ProUpload.vue";
import { useProTable } from "/@/composables/useProTable";

import { getUserList, deleteUser } from "/@/api/pms/user/index";
import { parseTime } from "/@/utils/aicodcod";

const density = ref<"large" | "default" | "small">("default");

const searchFields: ProSearchField[] = [
  { prop: "keyWords", label: "Keyword", type: "input", placeholder: "Account / nickname" },
  { prop: "mobile", label: "Mobile", type: "input" },
  {
    prop: "status",
    label: "Status",
    type: "select",
    options: [
      { label: "Enabled", value: 1 },
      { label: "Disabled", value: 0 },
    ],
  },
  { prop: "dateRange", label: "Created At", type: "daterange", width: "260px" },
];

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

const { proxy } = <any>getCurrentInstance();
const onAdd = () => proxy.$router.push("/pms/user/list/add");
const openDocs = () => ElMessage.info("See src/components/pro/ component comments for docs");

// ---- 头像 hash 配色 ----
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

// ---- ProDescriptions / ProDrawer demo ----
const detailRow = ref<any>(null);
const drawerOpen = ref(false);

const onDetail = (row: any) => {
  detailRow.value = row;
  drawerOpen.value = true;
};

const onDrawerConfirm = () => {
  ElMessage.success("Confirm demo");
  drawerOpen.value = false;
};

const descItems = computed<ProDescriptionsItem[]>(() => [
  { prop: "id", label: "ID" },
  { prop: "user_name", label: "Account" },
  { prop: "user_nickname", label: "Nickname", placeholder: "Not set" },
  { prop: "mobile", label: "Mobile" },
  { prop: "dept.dept_name", label: "Dept" },
  {
    prop: "user_status",
    label: "Status",
    render: (v) =>
      h(ElTag, { type: v === 1 ? "success" : "info", effect: "light", size: "small" }, () =>
        v === 1 ? "Enabled" : "Disabled",
      ),
  },
  {
    prop: "roleInfo",
    label: "Roles",
    span: 2,
    render: (v) => {
      if (!v || !v.length) return h("span", { class: "text-muted" }, "—");
      return h(
        "span",
        { style: { display: "inline-flex", gap: "4px", flexWrap: "wrap" } },
        v.map((r: any) => h(ElTag, { type: "info", effect: "light", size: "small" }, () => r.name)),
      );
    },
  },
  { prop: "created_at", label: "Created At", type: "datetime", span: 2 },
]);
</script>

<style scoped>
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

/* ---- Upload 演示卡片 ---- */
.demo-card {
  background: var(--cc-color-surface);
  border: 1px solid var(--cc-color-border-light);
  border-radius: var(--cc-radius-lg);
  box-shadow: var(--cc-shadow-card);
  overflow: hidden;
}
.demo-card__header {
  padding: var(--cc-space-4) var(--cc-space-5);
  border-bottom: 1px solid var(--cc-color-border-light);
}
.demo-card__title {
  margin: 0;
  font-size: var(--cc-font-16);
  font-weight: 600;
  color: var(--cc-color-text-1);
}
.demo-card__subtitle {
  margin: 4px 0 0;
  color: var(--cc-color-text-3);
  font-size: var(--cc-font-13);
}
.demo-card__body {
  padding: var(--cc-space-5);
}
.upload-demo-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--cc-space-5);
}
.demo-label {
  font-size: var(--cc-font-13);
  color: var(--cc-color-text-2);
  font-weight: 500;
  margin-bottom: var(--cc-space-2);
}
@media (max-width: 768px) {
  .upload-demo-grid {
    grid-template-columns: 1fr;
  }
}
</style>
