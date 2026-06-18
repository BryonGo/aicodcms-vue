<template>
  <ProPage
    :title="$t('message.sdk.game.breadcrumbGame')"
    :subtitle="$t('message.sdk.game.headerSubtitle')"
  >
    <template #actions>
      <el-button v-if="!showDeleted" :icon="Delete" @click="switchToDeleted">{{
        $t("message.sdk.game.btnRecycle")
      }}</el-button>
      <el-button v-if="showDeleted" :icon="ArrowLeft" @click="switchToNormal">{{
        $t("message.sdk.game.btnBackToGame")
      }}</el-button>
      <el-button v-if="!showDeleted" type="primary" :icon="Plus" @click="onAdd">{{
        $t("message.common.add")
      }}</el-button>
    </template>

    <ProSearch v-model="searchForm" :fields="searchFields" @search="onSearch" @reset="onReset" />

    <ProToolbar v-model:size="tableSize" @refresh="loadData">
      <template #left>
        <el-button
          v-if="!showDeleted && selectedIds.length"
          type="danger"
          plain
          size="small"
          @click="onBatchDelete"
        >
          {{ $t("message.sdk.game.batchDelete") }} ({{ selectedIds.length }})
        </el-button>
      </template>
    </ProToolbar>

    <ProTable
      :data="tableData"
      :loading="loading"
      :size="tableSize"
      :total="total"
      :page="page"
      :page-size="size"
      selection
      @selection-change="onSelectionChange"
      @pagination="onPageChange"
    >
      <el-table-column prop="id" :label="$t('message.common.colId')" width="70" align="center" />
      <el-table-column
        prop="app_id"
        :label="$t('message.sdk.game.colAppId')"
        width="110"
        align="center"
      >
        <template #default="{ row }"
          ><span class="mono-primary">{{ row.app_id }}</span></template
        >
      </el-table-column>
      <el-table-column
        prop="name"
        :label="$t('message.sdk.game.colName')"
        min-width="150"
        show-overflow-tooltip
      >
        <template #default="{ row }">
          <router-link :to="`/addon/sdk/game/edit?id=${row.id}`" class="game-link">
            <el-avatar :size="28" shape="square" :src="row.icon_path" class="game-avatar" />
            {{ row.name }}
          </router-link>
        </template>
      </el-table-column>
      <el-table-column :label="$t('message.sdk.game.colPlatform')" width="100" align="center">
        <template #default="{ row }">
          <el-tag
            :type="row.platform_type === 1 ? '' : 'success'"
            size="small"
            effect="plain"
            round
          >
            {{
              row.platform_type === 1
                ? "Android"
                : row.platform_type === 2
                  ? "iOS"
                  : $t("message.sdk.game.platformGeneral")
            }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="$t('message.common.colStatus')" width="90" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small" effect="plain" round>
            {{
              row.status === 1
                ? $t("message.common.enabled")
                : $t("message.cms.language.btnDeactivate")
            }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="package_name"
        :label="$t('message.sdk.game.colPackage')"
        min-width="170"
        show-overflow-tooltip
      />
      <el-table-column :label="$t('message.sdk.game.colLogin')" width="80" align="center">
        <template #default="{ row }"
          ><el-icon :class="row.login_state === 1 ? 'state-on' : 'state-off'"
            ><CircleCheckFilled v-if="row.login_state === 1" /><CircleCloseFilled v-else /></el-icon
        ></template>
      </el-table-column>
      <el-table-column :label="$t('message.sdk.game.colPay')" width="80" align="center">
        <template #default="{ row }"
          ><el-icon :class="row.pay_state === 1 ? 'state-on' : 'state-off'"
            ><CircleCheckFilled v-if="row.pay_state === 1" /><CircleCloseFilled v-else /></el-icon
        ></template>
      </el-table-column>
      <el-table-column
        :label="$t('message.common.colOperation')"
        :width="showDeleted ? 120 : 280"
        fixed="right"
        align="center"
      >
        <template #default="{ row }">
          <template v-if="!showDeleted">
            <el-button link type="primary" size="small" @click="onEdit(row)">{{
              $t("message.common.edit")
            }}</el-button>
            <el-button link type="primary" size="small" @click="goProducts(row)">{{
              $t("message.sdk.game.btnProducts")
            }}</el-button>
            <el-button link type="primary" size="small" @click="goVersions(row)">{{
              $t("message.sdk.game.btnVersions")
            }}</el-button>
            <el-button link type="primary" size="small" @click="goPayConfig(row)">{{
              $t("message.sdk.game.btnPayConfig")
            }}</el-button>
            <el-button link type="danger" size="small" @click="onDelete(row)">{{
              $t("message.common.delete")
            }}</el-button>
          </template>
          <el-button v-else link type="success" size="small" @click="onRecover(row)">{{
            $t("message.sdk.game.btnRecover")
          }}</el-button>
        </template>
      </el-table-column>
    </ProTable>
  </ProPage>
</template>

<script lang="ts">
import { computed, defineComponent, ref, reactive, onMounted, onActivated } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  Plus,
  ArrowLeft,
  Delete,
  CircleCheckFilled,
  CircleCloseFilled,
} from "@element-plus/icons-vue";
import { useI18n } from "vue-i18n";
import ProPage from "/@/components/pro/ProPage.vue";
import ProSearch, { type ProSearchField } from "/@/components/pro/ProSearch.vue";
import ProToolbar from "/@/components/pro/ProToolbar.vue";
import ProTable from "/@/components/pro/ProTable.vue";
import { getGameList, deleteGame, recoverGame, GameItem } from "/@/api/addon/sdk";

export default defineComponent({
  name: "addonSdkGameList",
  components: {
    ProPage,
    ProSearch,
    ProToolbar,
    ProTable,
    Plus,
    ArrowLeft,
    Delete,
    CircleCheckFilled,
    CircleCloseFilled,
  },
  setup() {
    const { t } = useI18n();
    const router = useRouter();
    const searchForm = reactive({ keyword: "", status: "" });
    const tableData = ref<GameItem[]>([]);
    const loading = ref(false);
    const tableSize = ref<"large" | "default" | "small">("default");
    const page = ref(1);
    const size = ref(10);
    const total = ref(0);
    const showDeleted = ref(false);
    const selectedIds = ref<number[]>([]);
    const searchFields = computed<ProSearchField[]>(() => [
      {
        prop: "keyword",
        label: t("message.common.search"),
        placeholder: t("message.sdk.game.searchPlaceholder"),
        width: "260px",
      },
      {
        prop: "status",
        label: t("message.common.colStatus"),
        type: "select",
        width: "140px",
        options: [
          { label: t("message.common.enabled"), value: 1 },
          { label: t("message.common.disabled"), value: 0 },
        ],
      },
    ]);

    const loadData = async () => {
      loading.value = true;
      try {
        const params: any = { page: page.value, row: size.value };
        if (searchForm.keyword) params.keyword = searchForm.keyword;
        if (searchForm.status !== "") params.status = searchForm.status;
        if (showDeleted.value) params.deleted = 1;
        const res: any = await getGameList(params);
        const data = res.data || res;
        tableData.value = data.list || [];
        total.value = data.total || 0;
      } finally {
        loading.value = false;
      }
    };
    const onSearch = () => {
      page.value = 1;
      loadData();
    };
    const onReset = () => {
      searchForm.keyword = "";
      searchForm.status = "";
      onSearch();
    };
    const onPageChange = ({ page: nextPage, limit }: { page: number; limit: number }) => {
      page.value = nextPage;
      size.value = limit;
      loadData();
    };
    const onSelectionChange = (rows: GameItem[]) => {
      selectedIds.value = rows.map((row) => row.id);
    };
    const onAdd = () => router.push("/addon/sdk/game/add");
    const onEdit = (row: GameItem) => router.push(`/addon/sdk/game/edit?id=${row.id}`);
    const onDelete = (row: GameItem) => {
      ElMessageBox.confirm(
        t("message.sdk.game.deleteConfirm", { name: row.name }),
        t("message.common.confirmDeleteTitle"),
        { type: "warning" },
      )
        .then(async () => {
          await deleteGame({ ids: [row.id] });
          ElMessage.success(t("message.common.msgDeleteOk"));
          loadData();
        })
        .catch(() => {});
    };
    const onBatchDelete = () => {
      if (!selectedIds.value.length) return;
      ElMessageBox.confirm(
        t("message.sdk.game.batchDeleteConfirm", { count: selectedIds.value.length }),
        t("message.common.confirmDeleteTitle"),
        { type: "warning" },
      )
        .then(async () => {
          await deleteGame({ ids: selectedIds.value });
          ElMessage.success(t("message.common.msgDeleteOk"));
          selectedIds.value = [];
          loadData();
        })
        .catch(() => {});
    };
    const onRecover = (row: GameItem) => {
      ElMessageBox.confirm(`确认恢复游戏「${row.name}」？`, t("message.sdk.game.recoverTitle"), {
        type: "warning",
      })
        .then(async () => {
          await recoverGame({ ids: [row.id] });
          ElMessage.success(t("message.sdk.game.recoverOk"));
          loadData();
        })
        .catch(() => {});
    };
    const switchToDeleted = () => {
      showDeleted.value = true;
      page.value = 1;
      loadData();
    };
    const switchToNormal = () => {
      showDeleted.value = false;
      page.value = 1;
      loadData();
    };
    const goProducts = (row: GameItem) =>
      router.push(
        `/addon/sdk/product/list?app_id=${row.app_id}&name=${encodeURIComponent(row.name)}`,
      );
    const goVersions = (row: GameItem) =>
      router.push(
        `/addon/sdk/version/list?app_id=${row.app_id}&name=${encodeURIComponent(row.name)}`,
      );
    const goPayConfig = (row: GameItem) =>
      router.push(
        `/addon/pay/config/list?app_id=${row.app_id}&name=${encodeURIComponent(row.name)}`,
      );
    onMounted(() => loadData());
    onActivated(() => loadData());
    return {
      searchForm,
      searchFields,
      tableData,
      loading,
      tableSize,
      page,
      size,
      total,
      showDeleted,
      selectedIds,
      loadData,
      onSearch,
      onReset,
      onPageChange,
      onSelectionChange,
      onAdd,
      onEdit,
      onDelete,
      onBatchDelete,
      onRecover,
      switchToDeleted,
      switchToNormal,
      goProducts,
      goVersions,
      goPayConfig,
      Plus,
      ArrowLeft,
      Delete,
    };
  },
});
</script>

<style scoped>
.mono-primary {
  color: var(--cc-color-primary);
  font-weight: 700;
}
.game-link {
  display: inline-flex;
  align-items: center;
  gap: var(--cc-space-2);
  color: var(--cc-color-text-1);
  font-weight: 600;
  text-decoration: none;
}
.game-link:hover {
  color: var(--cc-color-primary);
}
.game-avatar {
  flex-shrink: 0;
}
.state-on {
  color: var(--cc-color-primary);
}
.state-off {
  color: var(--cc-color-text-4);
}
</style>
