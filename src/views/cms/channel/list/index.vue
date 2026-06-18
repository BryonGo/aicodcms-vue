<template>
  <ProPage
    :title="$t('message.cms.channelList.breadcrumbCurrent')"
    :subtitle="
      $t('message.cms.channelList.breadcrumbCms') +
      ' / ' +
      $t('message.cms.channelList.breadcrumbCurrent')
    "
  >
    <template #actions>
      <el-button type="primary" :icon="Plus" @click="handleAdd()">
        {{ $t("message.common.add") }}
      </el-button>
    </template>

    <ProSearch
      v-model="tableData.param"
      :fields="searchFields"
      :collapse-threshold="2"
      @search="handleQuery"
      @reset="resetQuery"
    />

    <ProToolbar v-model:size="tableSize" @refresh="CmsChannelList">
      <template #left>
        <span v-if="ids.length" class="sel-count"
          >{{ ids.length }}{{ $t("message.cms.articleList.selectedCount") }}</span
        >
        <el-button :icon="Delete" :disabled="multiple" @click="handleDelete(null)">
          {{ $t("message.cms.channelList.remove") }}
        </el-button>
        <el-button :icon="DeleteFilled" :disabled="multiple" @click="handleClearArticles(null)">
          {{ $t("message.cms.channelList.clearArticles") }}
        </el-button>
      </template>
    </ProToolbar>

    <ProTable
      ref="tableRef"
      :data="tableData.data"
      :loading="loading"
      :size="tableSize"
      :max-height="tableHeight"
      :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
      default-expand-all
      row-key="id"
      selection
      :show-pagination="false"
      @selection-change="handleSelectionChange"
      @sort-change="handleSortChange"
    >
      <el-table-column
        :label="$t('message.common.colId')"
        width="70"
        prop="id"
        align="center"
        sortable="custom"
      />
      <el-table-column :label="$t('message.common.colName')" min-width="280" fixed="left">
        <template #default="{ row }">
          <div class="channel-node" @contextmenu.prevent.stop="showContextMenu($event, row)">
            <span class="channel-node__connector">{{ row._isLast ? "└─" : "├─" }}</span>
            <el-icon v-if="row.children?.length" class="channel-node__icon is-folder"
              ><FolderOpened
            /></el-icon>
            <el-icon v-else class="channel-node__icon"><Document /></el-icon>
            <span class="channel-node__label">{{ row.name }}</span>
            <el-tag v-if="row.type === 'channel'" size="small" type="info" effect="plain">{{
              $t("message.cms.channelList.tagCover")
            }}</el-tag>
            <el-tag v-else-if="row.type === 'list'" size="small" type="primary" effect="plain">{{
              $t("message.cms.channelList.tagList")
            }}</el-tag>
            <el-tag v-else-if="row.type === 'index'" size="small" type="success" effect="plain">{{
              $t("message.cms.channelList.tagHome")
            }}</el-tag>
            <el-tag v-else-if="row.type === 'page'" size="small" type="warning" effect="plain">{{
              $t("message.cms.channelList.tagPage")
            }}</el-tag>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="DiyUrl" width="130" prop="diyname" show-overflow-tooltip />
      <el-table-column
        :label="$t('message.cms.channelList.colFlag')"
        width="90"
        prop="flag"
        align="center"
      >
        <template #default="{ row }">
          <span
            v-if="row.flag"
            class="flag-badge"
            :style="{ '--flag-color': flagColor(row.flag) }"
            >{{ row.flag }}</span
          >
          <span v-else class="cell-muted">-</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('message.cms.channelList.colDoc')"
        width="80"
        prop="items"
        align="center"
      />
      <el-table-column
        :label="$t('message.cms.channelList.colNav')"
        width="70"
        prop="isnav"
        align="center"
      >
        <template #default="{ row }">
          <el-icon v-if="row.isnav" class="icon-success"><Check /></el-icon>
          <span v-else class="cell-muted">-</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('message.cms.channelList.colArticles')"
        width="90"
        prop="article_count"
        align="center"
      />
      <el-table-column
        :label="$t('message.cms.channelEdit.colWeigh')"
        width="96"
        prop="weigh"
        align="center"
        sortable="custom"
      >
        <template #default="{ row }">
          <el-input-number
            v-model="row.weigh"
            :min="0"
            :max="9999"
            size="small"
            controls-position="right"
            class="weigh-input"
            @change="(val: number) => handleWeighChange(row.id, val)"
          />
        </template>
      </el-table-column>
      <el-table-column :label="$t('message.common.colStatus')" width="90" align="center">
        <template #default="{ row }">
          <el-tag size="small" effect="plain" :type="row.status ? 'success' : 'info'">
            {{
              row.status
                ? $t("message.cms.channelList.tagNormal")
                : $t("message.cms.channelList.tagHidden")
            }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('message.cms.channelList.colLayoutTpl')"
        width="120"
        prop="layouttpl"
        show-overflow-tooltip
      />
      <el-table-column
        :label="$t('message.cms.channelList.colChannelTpl')"
        width="120"
        prop="channeltpl"
        show-overflow-tooltip
      />
      <el-table-column
        :label="$t('message.cms.channelEdit.colListtpl')"
        width="120"
        prop="listtpl"
        show-overflow-tooltip
      />
      <el-table-column
        :label="$t('message.cms.channelList.colDetailTpl')"
        width="120"
        prop="showtpl"
        show-overflow-tooltip
      />
      <el-table-column
        :label="$t('message.common.colOperation')"
        fixed="right"
        width="280"
        align="center"
      >
        <template #default="scope">
          <el-button
            v-if="scope.row.type === 'channel'"
            link
            type="primary"
            size="small"
            v-auth="'api/v1/admin/channel/add'"
            @click="handleAdd(scope.row.id)"
          >
            <el-icon><Plus /></el-icon> {{ $t("message.cms.channelList.child") }}
          </el-button>
          <el-button
            link
            type="primary"
            size="small"
            v-auth="'api/v1/admin/channel/edit'"
            @click="handleUpdate(scope.row)"
          >
            <el-icon><EditPen /></el-icon> {{ $t("message.common.edit") }}
          </el-button>
          <el-button
            v-if="scope.row.type !== 'index'"
            link
            type="warning"
            size="small"
            @click="handleClearArticles(scope.row)"
          >
            <el-icon><DeleteFilled /></el-icon> {{ $t("message.cms.channelList.clearArticles") }}
          </el-button>
          <el-button
            v-if="scope.row.type !== 'index'"
            link
            type="danger"
            size="small"
            v-auth="'api/v1/admin/channel/del'"
            @click="handleDelete(scope.row)"
          >
            <el-icon><Delete /></el-icon> {{ $t("message.cms.channelList.remove") }}
          </el-button>
        </template>
      </el-table-column>
    </ProTable>

    <teleport to="body">
      <div
        v-if="ctxMenu.visible"
        class="ctx-menu-mask"
        @click="closeCtxMenu"
        @contextmenu.prevent="closeCtxMenu"
      ></div>
      <div
        v-show="ctxMenu.visible"
        class="ctx-menu"
        :style="{ left: ctxMenu.x + 'px', top: ctxMenu.y + 'px' }"
      >
        <div class="ctx-menu-item" @click="doAdd">
          <el-icon size="14"><Plus /></el-icon>
          {{
            ctxMenu.target?.type === "channel"
              ? $t("message.cms.channelList.contextAddChild")
              : $t("message.cms.channelList.contextAdd")
          }}
        </div>
        <div class="ctx-menu-item" @click="doEdit">
          <el-icon size="14"><EditPen /></el-icon> {{ $t("message.cms.channelList.contextEdit") }}
        </div>
        <div class="ctx-menu-divider"></div>
        <div class="ctx-menu-item danger" @click="doDelete">
          <el-icon size="14"><Delete /></el-icon> {{ $t("message.cms.channelList.contextDelete") }}
        </div>
      </div>
    </teleport>
  </ProPage>
</template>

<script lang="ts">
import {
  defineComponent,
  getCurrentInstance,
  onMounted,
  onUnmounted,
  reactive,
  ref,
  toRefs,
  computed,
} from "vue";
import { useI18n } from "vue-i18n";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  Plus,
  Delete,
  DeleteFilled,
  FolderOpened,
  Document,
  Check,
  EditPen,
} from "@element-plus/icons-vue";
import ProPage from "/@/components/pro/ProPage.vue";
import ProSearch, { type ProSearchField } from "/@/components/pro/ProSearch.vue";
import ProToolbar from "/@/components/pro/ProToolbar.vue";
import ProTable from "/@/components/pro/ProTable.vue";
import {
  delCmsChannel,
  listCmsChannel,
  updateCmsChannelWeigh,
  clearChannelArticles,
} from "/@/api/cms/channel";
import {
  ChannelInfoData,
  ChannelTableColumns,
  ChannelTableDataState,
} from "/@/views/cms/channel/list/component/model";

export default defineComponent({
  name: "apiCmsChannelList",
  components: {
    ProPage,
    ProSearch,
    ProToolbar,
    ProTable,
    Plus,
    Delete,
    DeleteFilled,
    FolderOpened,
    Document,
    Check,
    EditPen,
  },
  setup() {
    const { t } = useI18n();
    const { proxy } = <any>getCurrentInstance();
    const loading = ref(false);
    const tableRef = ref();
    const tableSize = ref<"large" | "default" | "small">("default");
    const tableHeight = ref("calc(100vh - 290px)");
    const multiple = ref(true);

    const state = reactive<ChannelTableDataState>({
      ids: [],
      tableData: {
        data: [],
        total: 0,
        loading: false,
        param: { page: 1, row: 10, name: undefined },
      },
    });

    const searchFields = computed<ProSearchField[]>(() => [
      {
        prop: "name",
        label: t("message.common.colName"),
        placeholder: t("message.cms.channelList.placeholderName"),
        width: "240px",
      },
    ]);

    const ctxMenu = ref({ visible: false, x: 0, y: 0, target: null as any });
    const closeCtxMenu = () => {
      ctxMenu.value.visible = false;
      ctxMenu.value.target = null;
    };
    const showContextMenu = (e: MouseEvent, row: any) => {
      ctxMenu.value = { visible: true, x: e.clientX, y: e.clientY, target: row };
    };

    const markTreeConnectors = (nodes: any[]) => {
      for (let i = 0; i < nodes.length; i++) {
        nodes[i]._isLast = i === nodes.length - 1;
        if (nodes[i].children?.length) markTreeConnectors(nodes[i].children);
      }
    };

    const flattenTree = (nodes: any[]): any[] => {
      const result: any[] = [];
      const walk = (items: any[]) => {
        items.forEach((item) => {
          result.push(item);
          if (item.children?.length) walk(item.children);
        });
      };
      walk(nodes);
      return result;
    };

    const CmsChannelList = () => {
      loading.value = true;
      listCmsChannel(state.tableData.param)
        .then((res: any) => {
          let list = res.data.list ?? [];
          list = proxy.handleTree(list, "id", "parent_id");
          markTreeConnectors(list);
          state.tableData.data = list;
          state.tableData.total = list.length;
        })
        .finally(() => {
          loading.value = false;
        });
    };

    const handleQuery = () => {
      state.tableData.param.page = 1;
      CmsChannelList();
    };

    const resetQuery = () => {
      state.tableData.param.name = undefined;
      state.tableData.param.page = 1;
      CmsChannelList();
    };

    const handleSelectionChange = (selection: Array<ChannelInfoData>) => {
      state.ids = selection.map((item) => item.id);
      multiple.value = !selection.length;
    };

    const handleAdd = (id = 0) => {
      proxy.$router.push(`/cms/channel/list/add?parent_id=${id || 0}`);
    };
    const handleUpdate = (row: ChannelTableColumns) => {
      proxy.$router.push(`/cms/channel/list/edit?id=${row.id}`);
    };

    const handleSortChange = ({ prop, order }: { prop: string; order: string }) => {
      state.tableData.param.order = prop || "weigh";
      state.tableData.param.sort = order === "ascending" ? "ASC" : "DESC";
      CmsChannelList();
    };

    const handleWeighChange = (id: number, weigh: number) => {
      updateCmsChannelWeigh(id, weigh)
        .then(() => {
          ElMessage.success(t("message.weightUpdated"));
        })
        .catch(() => {
          CmsChannelList();
        });
    };

    const flagColor = (flag: string): string => {
      const colors: Record<string, string> = {
        index: "var(--cc-color-success)",
        list: "var(--cc-color-primary)",
        channel: "var(--cc-color-text-3)",
        page: "var(--cc-color-warning)",
        news: "var(--cc-color-primary)",
        product: "var(--cc-color-success)",
        about: "var(--cc-color-warning)",
        hot: "var(--cc-color-danger)",
        recommend: "var(--cc-color-success)",
        notice: "var(--cc-color-text-3)",
      };
      return colors[flag] || "var(--cc-color-text-3)";
    };

    const handleClearArticles = (row: ChannelTableColumns | null) => {
      const channelIds = row ? [row.id] : state.ids;
      if (!channelIds.length) {
        ElMessage.error(t("message.common.msgSelectDelete"));
        return;
      }
      ElMessageBox.confirm(
        t("message.cms.channelList.confirmClearArticles"),
        t("message.common.confirmDeleteTitle"),
        {
          confirmButtonText: t("message.common.confirm"),
          cancelButtonText: t("message.common.cancel"),
          type: "warning",
        },
      )
        .then(() =>
          clearChannelArticles(channelIds).then((res: any) => {
            const count = res.data?.deleted_count ?? 0;
            ElMessage.success(t("message.cms.channelList.msgClearArticlesOk", { count }));
            CmsChannelList();
          }),
        )
        .catch(() => {});
    };

    const handleDelete = (row: ChannelTableColumns | null) => {
      const ids = row ? [row.id] : state.ids;
      if (!ids.length) {
        ElMessage.error(t("message.cms.channelList.msgSelectData"));
        return;
      }
      if (row && (row.diyname === "index" || row.type === "index")) {
        ElMessage.error(t("message.cms.channelList.msgCannotDeleteHome"));
        return;
      }
      if (!row && state.ids.length) {
        const hasIndex = flattenTree(state.tableData.data).some(
          (item: any) =>
            (item.diyname === "index" || item.type === "index") && state.ids.includes(item.id),
        );
        if (hasIndex) {
          ElMessage.error(t("message.cms.channelList.msgCannotDeleteHomeExcluded"));
          return;
        }
      }
      ElMessageBox.confirm(
        t("message.cms.channelList.msgConfirmDelete"),
        t("message.common.confirmDeleteTitle"),
        {
          confirmButtonText: t("message.common.confirm"),
          cancelButtonText: t("message.common.cancel"),
          type: "warning",
        },
      )
        .then(() =>
          delCmsChannel(ids).then(() => {
            ElMessage.success(t("message.common.msgDeleteOk"));
            CmsChannelList();
          }),
        )
        .catch(() => {});
    };

    const doAdd = () => {
      const target = ctxMenu.value.target;
      closeCtxMenu();
      handleAdd(target?.id || 0);
    };
    const doEdit = () => {
      const target = ctxMenu.value.target;
      closeCtxMenu();
      if (target) handleUpdate(target);
    };
    const doDelete = () => {
      const target = ctxMenu.value.target;
      closeCtxMenu();
      if (target) handleDelete(target);
    };

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCtxMenu();
    };

    onMounted(() => {
      CmsChannelList();
      document.addEventListener("keydown", handleEsc);
    });
    onUnmounted(() => document.removeEventListener("keydown", handleEsc));

    return {
      proxy,
      loading,
      multiple,
      tableRef,
      tableSize,
      tableHeight,
      searchFields,
      CmsChannelList,
      handleQuery,
      resetQuery,
      handleSelectionChange,
      handleAdd,
      handleUpdate,
      handleDelete,
      handleClearArticles,
      handleSortChange,
      handleWeighChange,
      flagColor,
      ctxMenu,
      showContextMenu,
      closeCtxMenu,
      doAdd,
      doEdit,
      doDelete,
      Plus,
      Delete,
      DeleteFilled,
      FolderOpened,
      Document,
      Check,
      EditPen,
      ...toRefs(state),
    };
  },
});
</script>

<style scoped>
.sel-count {
  font-size: var(--cc-font-13);
  color: var(--cc-color-text-3);
}
.channel-node {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}
.channel-node__connector {
  width: 18px;
  flex-shrink: 0;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: var(--cc-font-13);
  color: var(--cc-color-text-4);
}
.channel-node__icon {
  font-size: 14px;
  color: var(--cc-color-text-3);
}
.channel-node__icon.is-folder {
  color: var(--cc-color-warning);
}
.channel-node__label {
  margin-right: 4px;
  color: var(--cc-color-text-1);
  font-weight: 500;
}
.cell-muted {
  color: var(--cc-color-text-4);
}
.icon-success {
  color: var(--cc-color-success);
}
.weigh-input {
  width: 76px;
}
.flag-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 30px;
  padding: 1px 8px;
  border-radius: var(--cc-radius-sm);
  background: var(--flag-color, var(--cc-color-text-3));
  color: var(--cc-color-text-inverse);
  font-size: var(--cc-font-12);
  line-height: 20px;
}
.ctx-menu-mask {
  position: fixed;
  inset: 0;
  z-index: 9998;
}
.ctx-menu {
  position: fixed;
  z-index: 9999;
  min-width: 148px;
  padding: 6px 0;
  border: 1px solid var(--cc-color-border-light);
  border-radius: var(--cc-radius-md);
  background: var(--cc-color-surface);
  box-shadow: var(--cc-shadow-pop);
  font-size: var(--cc-font-13);
  user-select: none;
}
.ctx-menu-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  color: var(--cc-color-text-2);
  cursor: pointer;
}
.ctx-menu-item:hover {
  background: var(--cc-color-primary-softer);
  color: var(--cc-color-primary);
}
.ctx-menu-item.danger {
  color: var(--cc-color-danger);
}
.ctx-menu-item.danger:hover {
  background: color-mix(in srgb, var(--cc-color-danger) 10%, transparent);
}
.ctx-menu-divider {
  height: 1px;
  margin: 4px 0;
  background: var(--cc-color-border-light);
}
@media (max-width: 768px) {
  :deep(.pro-table) {
    overflow-x: auto;
  }
}
</style>
