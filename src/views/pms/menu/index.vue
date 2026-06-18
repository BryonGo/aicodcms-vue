<template>
  <ProPage
    :title="$t('message.pms.menu.breadcrumbCurrent')"
    :subtitle="
      $t('message.pms.systemManagement') + ' / ' + $t('message.pms.menu.breadcrumbCurrent')
    "
  >
    <template #actions>
      <el-button
        type="primary"
        :icon="PlusIcon"
        v-auth="'api/v1/pms/menu/add'"
        @click="onOpenAddMenu(null)"
      >
        {{ $t("message.common.add") }}
      </el-button>
    </template>

    <div class="search-bar">
      <el-form :inline="true" @submit.prevent="handleQuery">
        <el-form-item :label="$t('message.common.colName')">
          <el-input
            v-model="queryParams.title"
            :placeholder="$t('message.pms.menu.placeholderName')"
            clearable
            size="default"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item :label="$t('message.pms.menu.componentPath')">
          <el-input
            v-model="queryParams.component"
            :placeholder="$t('message.pms.menu.placeholderComponent')"
            clearable
            size="default"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="SearchIcon" @click="handleQuery">
            {{ $t("message.common.search") }}
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="menu-drag-tip">
      <el-icon><Rank /></el-icon>
      <span>{{ $t("message.pms.menu.dragTip") }}</span>
    </div>

    <div class="menu-table-wrap system-menu-container">
      <el-table
        ref="menuTableRef"
        :data="menuTableData"
        style="width: 100%"
        row-key="id"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        default-expand-all
      >
        <el-table-column
          :label="$t('message.common.colName')"
          min-width="220"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <SvgIcon :name="row.icon" />
            <span class="ml10">{{ row.title }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="path"
          :label="$t('message.pms.menu.colRoutePath')"
          min-width="150"
          show-overflow-tooltip
        />
        <el-table-column
          :label="$t('message.pms.menu.componentPath')"
          min-width="180"
          show-overflow-tooltip
        >
          <template #default="{ row }">{{ row.component }}</template>
        </el-table-column>
        <el-table-column
          :label="$t('message.pms.menu.apiRule')"
          min-width="180"
          show-overflow-tooltip
        >
          <template #default="{ row }">{{ row.name }}</template>
        </el-table-column>
        <el-table-column :label="$t('message.pms.menu.menuSort')" width="80" align="center">
          <template #default="{ row }">
            <el-tag
              size="small"
              effect="light"
              :type="row.menu_type === 0 ? 'info' : row.menu_type === 1 ? 'success' : 'warning'"
            >
              {{ row.weigh }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="$t('message.pms.menu.colMenuType')" width="100" align="center">
          <template #default="{ row }">
            <el-tag
              :type="row.menu_type === 0 ? 'danger' : row.menu_type === 1 ? 'success' : 'warning'"
              effect="light"
              size="small"
            >
              {{
                row.menu_type === 0
                  ? $t("message.pms.menu.typeDir")
                  : row.menu_type === 1
                    ? $t("message.pms.menu.typeMenu")
                    : $t("message.pms.menu.typeButton")
              }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="is_hide"
          :label="$t('message.pms.menu.colIsHide')"
          :formatter="formatIsHide"
          width="100"
          align="center"
        />
        <el-table-column :label="$t('message.common.colOperation')" width="240" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.menu_type !== 2"
              link
              size="small"
              type="primary"
              v-auth="'api/v1/pms/menu/add'"
              @click="onOpenAddMenu(row)"
            >
              {{ $t("message.common.add") }}
            </el-button>
            <el-button
              link
              size="small"
              type="primary"
              v-auth="'api/v1/pms/menu/edit'"
              @click="onOpenEditMenu(row)"
            >
              {{ $t("message.common.edit") }}
            </el-button>
            <el-button
              link
              size="small"
              type="danger"
              v-auth="'api/v1/pms/menu/del'"
              @click="onTabelRowDel(row)"
            >
              {{ $t("message.common.delete") }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </ProPage>
</template>

<script lang="ts">
import {
  ref,
  toRefs,
  reactive,
  onMounted,
  onBeforeMount,
  onUnmounted,
  defineComponent,
  getCurrentInstance,
  watch,
  nextTick,
} from "vue";
import { ElMessageBox, ElMessage } from "element-plus";
import { Plus as PlusIcon, Search as SearchIcon, Rank } from "@element-plus/icons-vue";
import Sortable from "sortablejs";

import ProPage from "/@/components/pro/ProPage.vue";
import { delMenu, getMenuList, menuSort } from "/@/api/pms/menu";
import { useI18n } from "vue-i18n";

export default defineComponent({
  name: "apiV1SystemAuthMenuList",
  components: {
    ProPage,
    PlusIcon: PlusIcon as any,
    SearchIcon: SearchIcon as any,
    Rank: Rank as any,
  },

  setup() {
    const { t } = useI18n();
    const menuTableRef = ref();
    let sortableInstance: any = null;
    let rawMenuList: any[] = [];

    const state = reactive({
      queryParams: { title: "", component: "" },
      menuTableData: [] as any[],
    });
    const { proxy } = getCurrentInstance() as any;
    const { sys_show_hide } = proxy.useDict("sys_show_hide");
    const acType = ref("add");

    const onOpenAddMenu = (row: any) => {
      acType.value = "add";
      proxy.$router.push(`/pms/menu/list/add?parent_id=${row?.id || 0}`);
    };
    const onOpenEditMenu = (row: any) => {
      acType.value = "edit";
      proxy.$router.push(`/pms/menu/list/edit?id=${row.id}`);
    };
    const onTabelRowDel = (row: any) => {
      ElMessageBox.confirm(
        proxy.$t("message.pms.menu.confirmDelete", { name: row.title }),
        proxy.$t("message.common.confirmDeleteTitle") || proxy.$t("message.common.confirmTitle"),
        {
          confirmButtonText: proxy.$t("message.common.confirm"),
          cancelButtonText: proxy.$t("message.common.cancel"),
          type: "warning",
        },
      )
        .then(() => {
          delMenu(row.id).then(() => {
            ElMessage.success(proxy.$t("message.common.msgDeleteOk"));
            menuList();
          });
        })
        .catch(() => {});
    };

    const formatIsHide = (row: any) => {
      return row.is_hide == 0
        ? proxy.$t("message.common.statusShow")
        : proxy.$t("message.common.statusHide");
    };

    const flattenTree = (tree: any[]): any[] => {
      const result: any[] = [];
      const walk = (nodes: any[]) => {
        nodes.forEach((node) => {
          result.push({ id: node.id, pid: node.pid, weigh: node.weigh, menu_type: node.menu_type });
          if (node.children?.length) walk(node.children);
        });
      };
      walk(tree);
      return result;
    };

    const initSortable = async () => {
      await nextTick();
      if (sortableInstance) sortableInstance.destroy();
      const el = document.querySelector(
        ".system-menu-container .el-table__body-wrapper tbody",
      ) as HTMLElement | null;
      if (!el) return;

      sortableInstance = Sortable.create(el, {
        animation: 200,
        handle: ".el-table__row",
        onEnd: async () => {
          const rows = el.querySelectorAll(".el-table__row");
          const visibleRows: Element[] = [];
          rows.forEach((row: Element) => {
            if ((row as HTMLElement).offsetParent !== null) visibleRows.push(row);
          });
          const newOrder: number[] = visibleRows
            .map((row: Element) => Number(row.getAttribute("data-row-key")))
            .filter((id: number) => !isNaN(id));

          if (newOrder.length === 0 || !rawMenuList.length) return;

          const originalMap: Record<number, any> = {};
          rawMenuList.forEach((item) => {
            originalMap[item.id] = item;
          });

          const updatedItems: { id: number; pid: number; weigh: number }[] = [];
          const pidCounters: Record<number, number> = {};

          newOrder.forEach((id, index) => {
            const item = originalMap[id];
            if (!item) return;
            let newPid = 0;
            if (index > 0) {
              const prevItem = originalMap[newOrder[index - 1]];
              if (prevItem) {
                if (prevItem.menu_type === 0) newPid = prevItem.id;
                else newPid = prevItem.pid;
              }
            }
            if (!pidCounters[newPid]) pidCounters[newPid] = 0;
            pidCounters[newPid]++;
            const newWeigh = pidCounters[newPid] * 10;
            if (item.pid !== newPid || item.weigh !== newWeigh) {
              updatedItems.push({ id, pid: newPid, weigh: newWeigh });
            }
          });

          if (updatedItems.length > 0) {
            try {
              await menuSort(updatedItems);
              ElMessage.success(proxy.$t("message.common.msgSortOk"));
              menuList();
            } catch (e) {
              ElMessage.error(proxy.$t("message.common.msgSortFail"));
              menuList();
            }
          }
        },
      });
    };

    onBeforeMount(() => {
      menuList();
    });
    onMounted(() => {
      nextTick(() => {
        setTimeout(() => initSortable(), 300);
      });
    });
    onUnmounted(() => {
      if (sortableInstance) {
        sortableInstance.destroy();
        sortableInstance = null;
      }
    });
    watch(
      () => sys_show_hide.length,
      (len) => {
        if (len > 0) state.menuTableData = [...state.menuTableData];
      },
    );
    watch(
      () => state.menuTableData,
      () => {
        nextTick(() => {
          setTimeout(() => initSortable(), 200);
        });
      },
      { deep: true },
    );

    const handleQuery = () => menuList();
    const menuList = () => {
      getMenuList(state.queryParams).then((res) => {
        rawMenuList = flattenTree(proxy.handleTree(res.data.rules ?? [], "id", "pid"));
        state.menuTableData = proxy.handleTree(res.data.rules ?? [], "id", "pid");
      });
    };

    return {
      menuTableRef,
      onOpenAddMenu,
      onOpenEditMenu,
      onTabelRowDel,
      formatIsHide,
      menuList,
      handleQuery,
      ...toRefs(state),
      sys_show_hide,
      acType,
    };
  },
});
</script>

<style scoped>
.search-bar {
  background: var(--cc-color-surface);
  border: 1px solid var(--cc-color-border-light);
  border-radius: var(--cc-radius-lg);
  padding: var(--cc-space-4) var(--cc-space-5);
  box-shadow: var(--cc-shadow-xs);
}
.search-bar :deep(.el-form-item) {
  margin-right: var(--cc-space-3);
  margin-bottom: 0;
}
.menu-drag-tip {
  font-size: var(--cc-font-12);
  color: var(--cc-color-text-3);
  display: flex;
  align-items: center;
  gap: 6px;
}
.menu-table-wrap {
  background: var(--cc-color-surface);
  border: 1px solid var(--cc-color-border-light);
  border-radius: var(--cc-radius-lg);
  box-shadow: var(--cc-shadow-card);
  overflow: hidden;
}
.system-menu-container :deep(.el-table__row) {
  cursor: grab;
}
.system-menu-container :deep(.el-table__row:active) {
  cursor: grabbing;
}
.system-menu-container :deep(.sortable-ghost) {
  opacity: 0.4;
  background: var(--cc-color-surface-active) !important;
}
</style>
