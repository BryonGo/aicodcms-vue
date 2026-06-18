<template>
  <div class="fa-page pch-page">
    <el-breadcrumb separator="→">
      <el-breadcrumb-item :to="{ path: '/' }"
        ><el-icon><HomeFilled /></el-icon> {{ $t("message.router.home") }}</el-breadcrumb-item
      >
      <el-breadcrumb-item>{{
        $t("message.sdk.payChannel.breadcrumbSdkModule")
      }}</el-breadcrumb-item>
      <el-breadcrumb-item>{{ $t("message.sdk.payChannel.title") }}</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="pch-header">
      <div>
        <h1 class="pch-title">{{ $t("message.sdk.payChannel.title") }}</h1>
        <p class="pch-subtitle">{{ $t("message.sdk.payChannel.subtitle") }}</p>
      </div>
      <el-button type="primary" size="large" @click="onAdd" class="pch-add"
        ><el-icon><Plus /></el-icon> {{ $t("message.sdk.payChannel.btnAdd") }}</el-button
      >
    </div>

    <div class="pch-table-card">
      <el-table
        :data="tableData"
        border
        v-loading="loading"
        class="pch-table"
        @selection-change="onSel"
        :empty-text="$t('message.sdk.payChannel.noData')"
      >
        <el-table-column type="selection" width="44" />
        <el-table-column prop="id" :label="$t('message.common.colId')" width="70" align="center" />
        <el-table-column
          prop="channel_code"
          :label="$t('message.sdk.payChannel.colCode')"
          width="160"
        >
          <template #default="{ row }"
            ><span class="pch-mono">{{ row.channel_code }}</span></template
          >
        </el-table-column>
        <el-table-column prop="name" :label="$t('message.common.colName')" min-width="140">
          <template #default="{ row }"
            ><router-link :to="`/addon/pay/channel/edit?id=${row.id}`" class="pch-link">{{
              row.name
            }}</router-link></template
          >
        </el-table-column>
        <el-table-column
          prop="platform_type"
          :label="$t('message.sdk.payChannel.colPlatform')"
          width="300"
        />
        <!-- <el-table-column prop="dev_link" :label="$t('message.sdk.payChannel.colDevLink')" min-width="180" show-overflow-tooltip /> -->
        <el-table-column :label="$t('message.common.colStatus')" width="80" align="center"
          ><template #default="{ row }"
            ><el-tag
              :type="row.state === 1 ? 'success' : 'info'"
              size="small"
              effect="plain"
              round
              >{{
                row.state === 1
                  ? $t("message.sdk.payChannel.stateShow")
                  : $t("message.sdk.payChannel.stateHide")
              }}</el-tag
            ></template
          ></el-table-column
        >
        <el-table-column
          :label="$t('message.common.colOperation')"
          width="140"
          fixed="right"
          align="center"
        >
          <template #default="{ row }"
            ><el-button link type="primary" size="small" @click="onEdit(row)">{{
              $t("message.common.edit")
            }}</el-button
            ><el-button link type="danger" size="small" @click="onDel(row)">{{
              $t("message.common.delete")
            }}</el-button></template
          >
        </el-table-column>
      </el-table>
      <div class="pch-footer">
        <el-button v-if="selIds.length" type="danger" plain size="small" @click="onBatchDel">{{
          $t("message.sdk.payChannel.batchDeleteCount", { count: selIds.length })
        }}</el-button
        ><pagination v-model:page="page" v-model:size="size" :total="total" @change="loadData" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, onMounted, onActivated } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { HomeFilled, Plus } from "@element-plus/icons-vue";
import { getPayChannelList, deletePayChannel } from "/@/api/addon/pay";
import { useI18n } from "vue-i18n";

export default defineComponent({
  name: "addonSdkPayChannelList",
  components: { HomeFilled, Plus },
  setup() {
    const router = useRouter();
    const { t } = useI18n();
    const tableData = ref<any[]>([]);
    const loading = ref(false);
    const page = ref(1);
    const size = ref(10);
    const total = ref(0);
    const selIds = ref<number[]>([]);

    const loadData = async () => {
      loading.value = true;
      try {
        const res: any = await getPayChannelList({ page: page.value, row: size.value });
        const d = res.data || res;
        tableData.value = d.list || [];
        total.value = d.total || 0;
      } finally {
        loading.value = false;
      }
    };
    const onSel = (rows: any[]) => {
      selIds.value = rows.map((r) => r.id);
    };
    const onAdd = () => router.push("/addon/pay/channel/add");
    const onEdit = (row: any) => router.push(`/addon/pay/channel/edit?id=${row.id}`);
    const onDel = (row: any) => {
      ElMessageBox.confirm(
        t("message.sdk.payChannel.deleteConfirm", { name: row.name }),
        t("message.sdk.payChannel.deleteTitle"),
        { type: "warning" },
      )
        .then(async () => {
          await deletePayChannel({ ids: [row.id] });
          ElMessage.success(t("message.sdk.payChannel.deleteSuccess"));
          loadData();
        })
        .catch(() => {});
    };
    const onBatchDel = () => {
      if (!selIds.value.length) return;
      ElMessageBox.confirm(
        t("message.sdk.payChannel.batchDeleteCount", { count: selIds.value.length }),
        t("message.sdk.payChannel.deleteTitle"),
        { type: "warning" },
      )
        .then(async () => {
          await deletePayChannel({ ids: selIds.value });
          ElMessage.success(t("message.sdk.payChannel.batchDeleteSuccess"));
          selIds.value = [];
          loadData();
        })
        .catch(() => {});
    };
    onMounted(() => loadData());
    onActivated(() => loadData());
    return {
      tableData,
      loading,
      page,
      size,
      total,
      selIds,
      loadData,
      onSel,
      onAdd,
      onEdit,
      onDel,
      onBatchDel,
    };
  },
});
</script>

<style scoped>
.pch-page {
  max-width: 1400px;
  margin: 0 auto;
}
.pch-mono {
  font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-weight: 600;
  color: var(--cc-color-text-2);
}
.pch-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: var(--cc-space-4);
  margin: var(--cc-space-5) 0;
  padding: var(--cc-space-6) var(--cc-space-7);
  background:
    radial-gradient(circle at 8% 0%, var(--cc-color-primary-softer), transparent 32%),
    var(--cc-color-surface);
  border: 1px solid var(--cc-color-border-light);
  border-radius: var(--cc-radius-xl);
  box-shadow: var(--cc-shadow-sm);
}
.pch-title {
  font-family: var(--cc-font-sans);
  font-size: var(--cc-font-24);
  font-weight: 650;
  color: var(--cc-color-text-1);
  margin: 0 0 var(--cc-space-1);
  letter-spacing: -0.02em;
}
.pch-subtitle {
  font-family: var(--cc-font-sans);
  font-size: var(--cc-font-13);
  color: var(--cc-color-text-3);
  margin: 0;
}
.pch-add {
  font-family: var(--cc-font-sans);
  font-weight: 600;
  border-radius: var(--cc-radius-md);
}
.pch-table-card {
  background: var(--cc-color-surface);
  border: 1px solid var(--cc-color-border-light);
  border-radius: var(--cc-radius-xl);
  padding: var(--cc-space-5) var(--cc-space-6) var(--cc-space-3);
  box-shadow: var(--cc-shadow-sm);
}
.pch-table {
  font-size: var(--cc-font-14);
}
.pch-table :deep(th.el-table__cell) {
  font-size: var(--cc-font-12);
  font-weight: 650;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--cc-color-text-3);
  background: var(--cc-color-surface-hover);
  border-bottom: 1px solid var(--cc-color-border-light);
}
.pch-table :deep(.el-table__row:hover > td.el-table__cell) {
  background: var(--cc-color-primary-softer);
}
.pch-link {
  color: var(--cc-color-primary);
  font-weight: 600;
  text-decoration: none;
}
.pch-link:hover {
  color: var(--cc-color-primary-hover);
}
.pch-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--cc-space-3);
  padding-top: var(--cc-space-3);
}
@media (min-width: 1401px) {
  .pch-page {
    max-width: none !important;
    padding: 0 var(--cc-space-8);
  }
}
@media (max-width: 768px) {
  .pch-header {
    flex-direction: column;
    align-items: flex-start;
    padding: var(--cc-space-5);
  }
  .pch-table-card {
    padding: var(--cc-space-3) var(--cc-space-2);
    border-radius: var(--cc-radius-lg);
    overflow-x: auto;
  }
}
</style>
