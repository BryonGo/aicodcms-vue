<template>
  <div class="batch-bar">
    <div class="batch-info">
      已选中 <strong>{{ store.selectedFiles.length }}</strong> 项
      <span style="margin-left: 8px; color: var(--cc-color-text-3)"
        >（共 {{ stats.totalSize }}，{{ stats.fileCount }} 个文件）</span
      >
    </div>
    <div class="batch-actions">
      <el-button :icon="Delete" type="danger" @click="onBatchDelete"
        >批量{{ $t("message.pms.minio.deleteFile") }}</el-button
      >
      <el-button :icon="Close" @click="store.selectedFiles = []">{{
        $t("message.pms.minio.batchUnselectAll")
      }}</el-button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
import { ElMessageBox } from "element-plus";
import { useMinioStore } from "../store";
import { summarizeFiles, formatFileSize } from "../utils";
import { Delete, Close } from "@element-plus/icons-vue";
import { useI18n } from "vue-i18n";

export default defineComponent({
  name: "MinioBatchBar",
  setup() {
    const { t } = useI18n();
    const store = useMinioStore();

    const stats = computed(() => {
      const s = summarizeFiles(store.selectedFiles);
      return {
        totalSize: formatFileSize(s.totalSize),
        fileCount: s.count,
      };
    });

    function onBatchDelete() {
      const count = store.selectedFiles.length;
      ElMessageBox.confirm(`确认批量删除选中的 ${count} 项？`, t("message.common.confirmTitle"), {
        type: "warning",
      })
        .then(() => store.batchDelete())
        .catch(() => {});
    }

    return { store, stats, onBatchDelete, Delete, Close };
  },
});
</script>

<style scoped>
.batch-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 20px;
  background: linear-gradient(135deg, #f0fdfa 0%, #ecfdf5 100%);
  border-top: 1px solid #a7f3d0;
  animation: minio-batch-slide-up 0.25s ease;

  .batch-info {
    font-size: 13px;
    color: var(--cc-color-text-2);

    strong {
      color: #059669;
      font-weight: 700;
      font-size: 15px;
      margin: 0 2px;
    }

    .batch-sub {
      margin-left: 10px;
      color: var(--cc-color-text-3);
      font-size: 12px;
    }
  }

  .batch-actions {
    display: flex;
    gap: 8px;

    .el-button--danger {
      --el-button-bg-color: #f43f5e;
      --el-button-border-color: #f43f5e;
      --el-button-hover-bg-color: #e11d48;
    }
  }
}

@keyframes minio-batch-slide-up {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
