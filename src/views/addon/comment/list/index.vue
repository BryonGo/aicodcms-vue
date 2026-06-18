<template>
  <ProPage
    :title="$t('message.comment.commentManage')"
    :subtitle="$t('message.comment.commentManage')"
  >
    <ProSearch
      v-model="query"
      :fields="searchFields"
      :search-text="$t('message.comment.search')"
      :reset-text="$t('message.common.reset')"
      @search="onSearch"
      @reset="onReset"
    />

    <ProToolbar v-model:size="tableSize" @refresh="load">
      <template #left>
        <span v-if="selected.length" class="sel-count"
          >{{ selected.length }}{{ $t("message.cms.articleList.selectedCount") }}</span
        >
        <el-button @click="batchApprove" :disabled="!selected.length" type="success" :icon="Check">
          {{ $t("message.comment.batchApprove") }}
        </el-button>
        <el-button @click="batchReject" :disabled="!selected.length" type="warning" :icon="Close">
          {{ $t("message.comment.batchReject") }}
        </el-button>
        <el-button @click="batchRecycle" :disabled="!selected.length" :icon="Delete">
          {{ $t("message.comment.moveToRecycle") }}
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
      @selection-change="onSelect"
      @pagination="onPageChange"
    >
      <el-table-column
        :label="$t('message.comment.nickname')"
        prop="nickname"
        width="130"
        show-overflow-tooltip
      />
      <el-table-column
        :label="$t('message.comment.content')"
        prop="content"
        min-width="260"
        show-overflow-tooltip
      />
      <el-table-column
        :label="$t('message.comment.articleId')"
        prop="article_id"
        width="90"
        align="center"
      />
      <el-table-column :label="$t('message.comment.status')" width="110" align="center">
        <template #default="{ row }">
          <el-tag :type="statusType(row.status)" size="small" effect="plain">{{
            statusLabel(row.status)
          }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="IP" prop="ip" width="140" />
      <el-table-column
        :label="$t('message.comment.time')"
        prop="created_at"
        width="170"
        align="center"
      />
      <el-table-column
        :label="$t('message.comment.action')"
        width="240"
        fixed="right"
        align="center"
      >
        <template #default="{ row }">
          <el-button
            link
            size="small"
            @click="approve(row.id)"
            v-if="row.status === 0"
            type="success"
            >{{ $t("message.comment.approve") }}</el-button
          >
          <el-button
            link
            size="small"
            @click="reject(row.id)"
            v-if="row.status === 0"
            type="warning"
            >{{ $t("message.comment.rejected") }}</el-button
          >
          <el-button
            link
            size="small"
            @click="recycle(row.id)"
            v-if="row.status !== 3"
            type="danger"
            >{{ $t("message.comment.delete") }}</el-button
          >
          <el-button
            link
            size="small"
            @click="restore(row.id)"
            v-if="row.status === 3"
            type="primary"
            >{{ $t("message.comment.restore") }}</el-button
          >
          <el-button
            link
            size="small"
            @click="destroy(row.id)"
            v-if="row.status === 3"
            type="danger"
            >{{ $t("message.comment.destroy") }}</el-button
          >
        </template>
      </el-table-column>
    </ProTable>
  </ProPage>
</template>

<script lang="ts">
import { useI18n } from "vue-i18n";
import { computed, defineComponent, onMounted, reactive, ref } from "vue";
import { ElMessage } from "element-plus";
import { Check, Close, Delete } from "@element-plus/icons-vue";
import ProPage from "/@/components/pro/ProPage.vue";
import ProSearch, { type ProSearchField } from "/@/components/pro/ProSearch.vue";
import ProToolbar from "/@/components/pro/ProToolbar.vue";
import ProTable from "/@/components/pro/ProTable.vue";
import {
  listComments,
  approveComments,
  rejectComments,
  recycleComments,
  restoreComments,
  destroyComments,
} from "/@/api/addon/comment/index";

export default defineComponent({
  name: "CommentList",
  components: { ProPage, ProSearch, ProToolbar, ProTable, Check, Close, Delete },
  setup() {
    const { t } = useI18n();
    const list = ref<any[]>([]);
    const total = ref(0);
    const loading = ref(false);
    const tableSize = ref<"large" | "default" | "small">("default");
    const selected = ref<any[]>([]);
    const query = reactive({ status: -1, keyword: "", page: 1, limit: 20 });

    const searchFields = computed<ProSearchField[]>(() => [
      {
        prop: "status",
        label: t("message.comment.status"),
        type: "select",
        width: "160px",
        options: [
          { label: t("message.comment.all"), value: -1 },
          { label: t("message.comment.pending"), value: 0 },
          { label: t("message.comment.approved"), value: 1 },
          { label: t("message.comment.rejected"), value: 2 },
          { label: t("message.comment.recycleBin"), value: 3 },
        ],
      },
      {
        prop: "keyword",
        label: t("message.comment.content"),
        placeholder: t("message.comment.searchContent"),
        width: "240px",
      },
    ]);

    const load = () => {
      loading.value = true;
      listComments(query)
        .then((r: any) => {
          list.value = r?.data?.list || [];
          total.value = r?.data?.total || 0;
        })
        .finally(() => {
          loading.value = false;
        });
    };

    const onSearch = () => {
      query.page = 1;
      load();
    };
    const onReset = () => {
      query.status = -1;
      query.keyword = "";
      query.page = 1;
      load();
    };
    const onPageChange = ({ page, limit }: { page: number; limit: number }) => {
      query.page = page;
      query.limit = limit;
      load();
    };
    const onSelect = (rows: any[]) => {
      selected.value = rows.map((r: any) => r.id);
    };

    const approve = (id: number) =>
      approveComments([id]).then(() => {
        ElMessage.success(t("message.comment.approvedLabel"));
        load();
      });
    const reject = (id: number) =>
      rejectComments([id]).then(() => {
        ElMessage.success(t("message.comment.rejectedLabel"));
        load();
      });
    const recycle = (id: number) =>
      recycleComments([id]).then(() => {
        ElMessage.success(t("message.comment.movedToRecycle"));
        load();
      });
    const restore = (id: number) =>
      restoreComments([id]).then(() => {
        ElMessage.success(t("message.comment.restored"));
        load();
      });
    const destroy = (id: number) =>
      destroyComments([id]).then(() => {
        ElMessage.success(t("message.comment.destroyed"));
        load();
      });
    const batchApprove = () =>
      approveComments(selected.value).then(() => {
        ElMessage.success(t("message.comment.batchedApproved"));
        load();
      });
    const batchReject = () =>
      rejectComments(selected.value).then(() => {
        ElMessage.success(t("message.comment.batchedRejected"));
        load();
      });
    const batchRecycle = () =>
      recycleComments(selected.value).then(() => {
        ElMessage.success(t("message.comment.movedToRecycle"));
        load();
      });

    const statusType = (s: number) =>
      (({ 0: "warning", 1: "success", 2: "info", 3: "danger" }) as Record<number, string>)[s] ||
      "info";
    const statusLabel = (s: number) =>
      (
        ({
          0: t("message.comment.pending"),
          1: t("message.comment.approvedLabel"),
          2: t("message.comment.rejectedLabel"),
          3: t("message.comment.recycleBin"),
        }) as Record<number, string>
      )[s] || t("message.comment.unknown");

    onMounted(load);

    return {
      list,
      total,
      loading,
      tableSize,
      selected,
      query,
      searchFields,
      load,
      onSearch,
      onReset,
      onPageChange,
      onSelect,
      approve,
      reject,
      recycle,
      restore,
      destroy,
      batchApprove,
      batchReject,
      batchRecycle,
      statusType,
      statusLabel,
      Check,
      Close,
      Delete,
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
