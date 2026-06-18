<template>
  <ProPage
    :title="`${$t('message.form.data')} — ID: ${formId}`"
    :subtitle="$t('message.form.formManage')"
  >
    <template #actions>
      <el-button type="success" :icon="Download" @click="onExport">{{
        $t("message.form.exportCsv")
      }}</el-button>
    </template>

    <ProToolbar v-model:size="tableSize" @refresh="load">
      <template #left>
        <span v-if="selected.length" class="sel-count"
          >{{ selected.length }}{{ $t("message.cms.articleList.selectedCount") }}</span
        >
        <el-button type="danger" :icon="Delete" @click="onDelSelected" :disabled="!selected.length">
          {{ $t("message.form.deleteSelected") }}
        </el-button>
      </template>
    </ProToolbar>

    <ProTable
      :data="list"
      :loading="loading"
      :size="tableSize"
      :total="total"
      :page="query.page"
      :page-size="query.limit"
      selection
      show-index
      @selection-change="onSelect"
      @pagination="onPageChange"
    >
      <el-table-column
        v-for="col in columns"
        :key="col"
        :label="col"
        :prop="col"
        min-width="130"
        show-overflow-tooltip
      />
      <el-table-column label="IP" prop="ip" width="140" />
      <el-table-column
        :label="$t('message.form.time')"
        prop="created_at"
        width="170"
        align="center"
      />
    </ProTable>
  </ProPage>
</template>

<script lang="ts">
import { useI18n } from "vue-i18n";
import { defineComponent, onMounted, reactive, ref } from "vue";
import { useRoute } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { Delete, Download } from "@element-plus/icons-vue";
import ProPage from "/@/components/pro/ProPage.vue";
import ProToolbar from "/@/components/pro/ProToolbar.vue";
import ProTable from "/@/components/pro/ProTable.vue";
import { listFormData, delFormData } from "/@/api/addon/form/index";

export default defineComponent({
  name: "FormData",
  components: { ProPage, ProToolbar, ProTable, Delete, Download },
  setup() {
    const { t } = useI18n();
    const route = useRoute();
    const formId = Number(route.params.id);
    const list = ref<any[]>([]);
    const total = ref(0);
    const loading = ref(false);
    const tableSize = ref<"large" | "default" | "small">("default");
    const selected = ref<any[]>([]);
    const query = reactive({ page: 1, limit: 20 });
    const columns = ref<string[]>([]);

    const load = () => {
      loading.value = true;
      listFormData(formId, query)
        .then((r: any) => {
          const items = r?.data?.list || [];
          list.value = items;
          total.value = r?.data?.total || 0;
          columns.value = items.length ? items[0]._labels || [] : columns.value;
        })
        .finally(() => {
          loading.value = false;
        });
    };

    const onPageChange = ({ page, limit }: { page: number; limit: number }) => {
      query.page = page;
      query.limit = limit;
      load();
    };

    const onSelect = (rows: any[]) => {
      selected.value = rows.map((r: any) => r.id);
    };

    const onExport = () => {
      const a = document.createElement("a");
      a.href = "/api/v1/addon/form/data/export?form_id=" + formId;
      a.download = "form_" + formId + "_data.csv";
      a.click();
    };

    const onDelSelected = () => {
      if (!selected.value.length) return;
      ElMessageBox.confirm(t("message.form.confirmDeleteData"), t("message.form.confirm"), {
        type: "warning",
      }).then(() => {
        delFormData(selected.value).then(() => {
          ElMessage.success(t("message.form.deleted"));
          load();
        });
      });
    };

    onMounted(load);
    return {
      formId,
      list,
      total,
      loading,
      tableSize,
      selected,
      query,
      columns,
      load,
      onPageChange,
      onSelect,
      onExport,
      onDelSelected,
      Delete,
      Download,
    };
  },
});
</script>

<style scoped>
.sel-count {
  font-size: var(--cc-font-13);
  color: var(--cc-color-text-3);
}
</style>
