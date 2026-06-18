<template>
  <div class="minio-app">
    <div class="minio-shell">
      <!-- 左侧存储桶列表 -->
      <MinioBucketSwitcher />

      <!-- 右侧主区域 -->
      <div class="minio-main">
        <!-- 顶部工具栏 -->
        <MinioToolbar />

        <!-- 中间主体 -->
        <div class="minio-body">
          <MinioFileTable class="minio-table-area" />
          <MinioDetailPanel v-if="store.detailFile" />
        </div>

        <!-- 底部批量操作栏 -->
        <MinioBatchBar v-if="store.selectedFiles.length > 0" />
      </div>
    </div>

    <!-- 弹窗 -->
    <MinioUploadDialog />
    <MinioNewDirDialog />
    <MinioRenameDialog />
    <MinioPreviewDialog />
    <MinioSettingsPanel />
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from "vue";
import { useMinioStore } from "./store";
import MinioBucketSwitcher from "./components/MinioBucketSwitcher.vue";
import MinioToolbar from "./components/MinioToolbar.vue";
import MinioFileTable from "./components/MinioFileTable.vue";
import MinioDetailPanel from "./components/MinioDetailPanel.vue";
import MinioBatchBar from "./components/MinioBatchBar.vue";
import MinioUploadDialog from "./components/MinioUploadDialog.vue";
import MinioNewDirDialog from "./components/MinioNewDirDialog.vue";
import MinioRenameDialog from "./components/MinioRenameDialog.vue";
import MinioPreviewDialog from "./components/MinioPreviewDialog.vue";
import MinioSettingsPanel from "./components/MinioSettingsPanel.vue";

export default defineComponent({
  name: "addonMinioFileBrowser",
  components: {
    MinioBucketSwitcher,
    MinioToolbar,
    MinioFileTable,
    MinioDetailPanel,
    MinioBatchBar,
    MinioUploadDialog,
    MinioNewDirDialog,
    MinioRenameDialog,
    MinioPreviewDialog,
    MinioSettingsPanel,
  },
  setup() {
    const store = useMinioStore();

    onMounted(async () => {
      await store.fetchBuckets();
      await store.fetchFiles();
    });

    return { store };
  },
});
</script>

<style scoped>
.minio-app {
  height: 100%;
  padding: 12px;
  background: var(--cc-color-bg);
}

.minio-shell {
  display: flex;
  height: calc(100vh - 112px);
  background: var(--cc-color-surface);
  border-radius: var(--cc-radius-lg);
  box-shadow: var(--cc-shadow-sm);
  overflow: hidden;
}

.minio-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.minio-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.minio-table-area {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
</style>
