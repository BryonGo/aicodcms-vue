<template>
  <ProPage
    :title="$t('message.fun.proDemo.title')"
    :subtitle="$t('message.fun.proDemo.subtitle')"
    :badge="$t('message.fun.proDemo.badge')"
  >
    <template #actions>
      <el-button :icon="DocumentIcon" @click="openDocs">{{ $t('message.fun.proDemo.btnDocs') }}</el-button>
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
          <el-button type="primary" :icon="PlusIcon" @click="onAdd">{{ $t('message.fun.proDemo.btnAdd') }}</el-button>
          <el-button
            type="danger"
            :icon="DeleteIcon"
            :disabled="!state.ids.length"
            @click="remove()"
          >
            {{ $t('message.fun.proDemo.btnBatchDelete') }}<template v-if="state.ids.length"> ({{ state.ids.length }})</template>
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
        <el-table-column prop="id" :label="$t('message.common.colId')" width="72" align="center" />
        <el-table-column prop="user_name" :label="$t('message.fun.proDemo.colAccount')" min-width="120" show-overflow-tooltip>
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
        <el-table-column prop="dept.dept_name" :label="$t('message.fun.proDemo.colDept')" min-width="120" show-overflow-tooltip />
        <el-table-column :label="$t('message.fun.proDemo.colRoles')" min-width="160">
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
        <el-table-column prop="mobile" :label="$t('message.fun.proDemo.colMobile')" min-width="120" show-overflow-tooltip />
        <el-table-column :label="$t('message.common.colStatus')" width="110" align="center">
          <template #default="{ row }">
            <el-switch
              v-model="row.user_status"
              inline-prompt
              :active-value="1"
              :inactive-value="0"
              :active-text="$t('message.common.enabled')"
              :inactive-text="$t('message.common.disabled')"
              :disabled="row.id === 1"
            />
          </template>
        </el-table-column>
        <el-table-column :label="$t('message.common.colCreateTime')" min-width="140">
          <template #default="{ row }">
            <span class="text-muted">{{ parseTime(row.created_at, "{y}-{m}-{d} {h}:{i}") }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('message.common.colOperation')" width="260" fixed="right">
          <template #default="{ row }">
            <el-button
              link
              size="small"
              type="primary"
              :disabled="row.id === 1"
              @click="onDetail(row)"
              >{{ $t('message.common.btnDetail') }}</el-button
            >
            <el-button link size="small" type="primary" :disabled="row.id === 1">{{ $t('message.common.btnEdit') }}</el-button>
            <el-button link size="small" type="primary" :disabled="row.id === 1"
              >{{ $t('message.fun.proDemo.btnResetPwd') }}</el-button
            >
            <el-button link size="small" type="danger" :disabled="row.id === 1" @click="remove(row)"
              >{{ $t('message.common.btnDelete') }}</el-button>
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
      :title="$t('message.fun.proDemo.descTitle')"
      :subtitle="$t('message.fun.proDemo.descSubtitle')"
      bordered
      label-width="100px"
      size="default"
    >
      <template #extra>
        <el-button size="small" @click="detailRow = null">{{ $t('message.fun.proDemo.btnClear') }}</el-button>
      </template>
    </ProDescriptions>

    <!-- ProDrawer 演示按钮 -->
    <div>
      <el-button type="primary" @click="drawerOpen = true">
        {{ $t('message.fun.proDemo.btnOpenDrawer') }}
      </el-button>
    </div>

    <ProDrawer
      v-model="drawerOpen"
      :title="$t('message.fun.proDemo.drawerTitle')"
      :subtitle="$t('message.fun.proDemo.drawerSubtitle')"
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
      <el-empty v-else :description="$t('message.fun.proDemo.drawerEmpty')" />
    </ProDrawer>

    <!-- ProUpload Demo -->
    <div class="demo-card">
      <div class="demo-card__header">
        <h3 class="demo-card__title">{{ $t('message.fun.proDemo.uploadTitle') }}</h3>
        <p class="demo-card__subtitle">{{ $t('message.fun.proDemo.uploadSubtitle') }}</p>
      </div>
      <div class="demo-card__body">
        <div class="upload-demo-grid">
          <div>
            <div class="demo-label">{{ $t('message.fun.proDemo.uploadFileMode') }}</div>
            <ProUpload
              action="/api/v1/upload/file"
              mode="file"
              :button-text="$t('message.fun.proDemo.uploadBtnFile')"
              :tip="$t('message.fun.proDemo.uploadTipFile')"
              :max-size="20"
            />
          </div>
          <div>
            <div class="demo-label">{{ $t('message.fun.proDemo.uploadImageMode') }}</div>
            <ProUpload
              action="/api/v1/upload/file"
              mode="image"
              :button-text="$t('message.fun.proDemo.uploadBtnImage')"
              accept="image/*"
              :tip="$t('message.fun.proDemo.uploadTipImage')"
            />
          </div>
          <div>
            <div class="demo-label">{{ $t('message.fun.proDemo.uploadCardMode') }}</div>
            <ProUpload action="/api/v1/upload/file" mode="image-card" multiple :limit="5" />
          </div>
          <div>
            <div class="demo-label">{{ $t('message.fun.proDemo.uploadDragMode') }}</div>
            <ProUpload
              action="/api/v1/upload/file"
              mode="drag"
              multiple
              :tip="$t('message.fun.proDemo.uploadTipDrag')"
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
import { useI18n } from "vue-i18n";

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

const { t } = useI18n();

const density = ref<"large" | "default" | "small">("default");

const searchFields: ProSearchField[] = [
  { prop: "keyWords", label: t("message.fun.proDemo.searchKeyword"), type: "input", placeholder: t("message.fun.proDemo.searchKeywordPh") },
  { prop: "mobile", label: t("message.fun.proDemo.colMobile"), type: "input" },
  {
    prop: "status",
    label: t("message.common.colStatus"),
    type: "select",
    options: [
      { label: t("message.common.enabled"), value: 1 },
      { label: t("message.common.disabled"), value: 0 },
    ],
  },
  { prop: "dateRange", label: t("message.common.colCreateTime"), type: "daterange", width: "260px" },
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
  deleteApi: (ids) => deleteUser(ids as number[]),
  rowKey: "id",
});

const { proxy } = <any>getCurrentInstance();
const onAdd = () => proxy.$router.push("/pms/user/list/add");
const openDocs = () => ElMessage.info(t("message.fun.proDemo.docsTip"));

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
  ElMessage.success(t("message.fun.proDemo.confirmDemo"));
  drawerOpen.value = false;
};

const descItems = computed<ProDescriptionsItem[]>(() => [
  { prop: "id", label: t("message.common.colId") },
  { prop: "user_name", label: t("message.fun.proDemo.colAccount") },
  { prop: "user_nickname", label: t("message.fun.proDemo.colNickname"), placeholder: t("message.fun.proDemo.notSet") },
  { prop: "mobile", label: t("message.fun.proDemo.colMobile") },
  { prop: "dept.dept_name", label: t("message.fun.proDemo.colDept") },
  {
    prop: "user_status",
    label: t("message.common.colStatus"),
    render: (v) =>
      h(ElTag, { type: v === 1 ? "success" : "info", effect: "light", size: "small" }, () =>
        v === 1 ? t("message.common.enabled") : t("message.common.disabled"),
      ),
  },
  {
    prop: "roleInfo",
    label: t("message.fun.proDemo.colRoles"),
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
  { prop: "created_at", label: t("message.common.colCreateTime"), type: "datetime", span: 2 },
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
