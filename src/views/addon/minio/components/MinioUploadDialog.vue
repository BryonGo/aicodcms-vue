<template>
  <el-dialog
    :title="$t('message.pms.minio.uploadTitle')"
    v-model="store.uploadDialogVisible"
    width="620px"
    @close="onClose"
    top="8vh"
  >
    <!-- 拖拽区域 + 选择按钮 -->
    <div
      class="upload-drop-zone"
      @dragenter.prevent="dragOver = true"
      @dragover.prevent="dragOver = true"
      @dragleave.prevent="dragOver = false"
      @drop.prevent="onDrop"
      :class="{ 'drag-over': dragOver }"
    >
      <el-icon :size="48" color="#c0c4cc"><UploadFilled /></el-icon>
      <p>{{ $t("message.pms.minio.dropzoneHint") }}</p>
      <p class="upload-hint">{{ $t("message.pms.minio.orClick") }}</p>
    </div>

    <div class="upload-btn-row">
      <el-button :icon="Document" @click="triggerFilePicker">{{
        $t("message.pms.minio.clickUpload")
      }}</el-button>
      <el-button :icon="FolderOpened" @click="triggerFolderPicker">{{
        $t("message.pms.minio.clickUpload")
      }}</el-button>
    </div>

    <input
      ref="fileInputRef"
      type="file"
      multiple
      style="display: none"
      @change="onFilesSelected"
    />
    <input
      ref="folderInputRef"
      type="file"
      webkitdirectory
      multiple
      style="display: none"
      @change="onFolderSelected"
    />

    <!-- 上传队列列表 -->
    <el-table
      v-if="store.uploadQueue.length > 0"
      :data="store.uploadQueue"
      max-height="300"
      stripe
      class="upload-queue-table"
    >
      <el-table-column
        prop="displayName"
        :label="$t('message.pms.minio.fileName')"
        min-width="200"
        show-overflow-tooltip
      />
      <el-table-column :label="$t('message.common.colStatus')" width="100">
        <template #default="{ row }">
          <el-tag v-if="row.status === 'done'" type="success" size="small">{{
            $t("message.common.success")
          }}</el-tag>
          <el-tag v-else-if="row.status === 'error'" type="danger" size="small">{{
            $t("message.msg.loadFailed")
          }}</el-tag>
          <el-tag v-else-if="row.status === 'uploading'" type="warning" size="small">{{
            $t("message.pms_upload.uploading")
          }}</el-tag>
          <el-tag v-else type="info" size="small">{{ $t("message.cms.tpl.waiting") }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="$t('message.common.progress')" width="140">
        <template #default="{ row }">
          <el-progress
            v-if="row.status === 'uploading'"
            :percentage="row.progress"
            :stroke-width="10"
          />
          <span v-else-if="row.status === 'done'" style="color: #67c23a">{{
            $t("message.sdk.order.statusSuccess")
          }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('message.common.msgNetworkError')" min-width="120">
        <template #default="{ row }">
          <span v-if="row.error" style="color: #f56c6c; font-size: 12px">{{ row.error }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('message.pms.minio.colAction')" width="60">
        <template #default="{ $index }">
          <el-button
            v-if="store.uploadQueue[$index].status === 'pending'"
            link
            size="small"
            type="danger"
            @click="store.removeFromQueue($index)"
            >{{ $t("message.common.btnRemove") }}</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <template #footer>
      <el-button @click="store.uploadDialogVisible = false">{{
        $t("message.pms.minio.cancel")
      }}</el-button>
      <el-button
        type="primary"
        :loading="store.uploading"
        :disabled="store.uploadQueue.length === 0"
        @click="store.startUpload()"
      >
        开始上传（{{ store.uploadQueue.length }}）
      </el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { ElMessage } from "element-plus";
import { useMinioStore } from "../store";
import { UploadFilled, FolderOpened, Document } from "@element-plus/icons-vue";

export default defineComponent({
  name: "MinioUploadDialog",
  setup() {
    const store = useMinioStore();
    const dragOver = ref(false);
    const fileInputRef = ref<HTMLInputElement>();
    const folderInputRef = ref<HTMLInputElement>();

    /** 拖拽释放：智能判断文件或文件夹 */
    function onDrop(e: DragEvent) {
      dragOver.value = false;
      const items = e.dataTransfer?.items;
      if (!items) return;

      for (const item of Array.from(items)) {
        const entry = item.webkitGetAsEntry?.(); // 主流浏览器都支持
        if (!entry) {
          // 降级：当普通文件处理
          const file = item.getAsFile();
          if (file) store.addToUploadQueue(file, file.name);
          continue;
        }
        if (entry.isDirectory) {
          // 递归遍历文件夹，包含根目录名
          traverseDirectory(entry as any, entry.name + "/");
        } else {
          // 单文件
          const file = item.getAsFile();
          if (file) store.addToUploadQueue(file, file.name);
        }
      }
    }

    /** 递归遍历文件夹，保留目录结构 */
    function traverseDirectory(dirEntry: any, parentPath: string) {
      const reader = dirEntry.createReader();
      reader.readEntries((entries: any[]) => {
        for (const entry of entries) {
          if (entry.isDirectory) {
            traverseDirectory(entry, parentPath + entry.name + "/");
          } else {
            entry.file((file: File) => {
              store.addToUploadQueue(file, parentPath + file.name);
            });
          }
        }
      });
    }

    /** 选择文件 */
    function triggerFilePicker() {
      fileInputRef.value?.click();
    }

    function onFilesSelected(e: Event) {
      const files = (e.target as HTMLInputElement).files;
      if (!files) return;
      for (const f of Array.from(files)) {
        store.addToUploadQueue(f, f.name);
      }
      if (fileInputRef.value) fileInputRef.value.value = "";
    }

    /** 选择文件夹 */
    function triggerFolderPicker() {
      folderInputRef.value?.click();
    }

    function onFolderSelected(e: Event) {
      const files = (e.target as HTMLInputElement).files;
      if (!files) return;
      for (const f of Array.from(files)) {
        store.addToUploadQueue(f, f.webkitRelativePath);
      }
      if (folderInputRef.value) folderInputRef.value.value = "";
    }

    function onClose() {
      store.clearQueue();
    }

    return {
      store,
      dragOver,
      fileInputRef,
      folderInputRef,
      onDrop,
      triggerFilePicker,
      onFilesSelected,
      triggerFolderPicker,
      onFolderSelected,
      onClose,
      UploadFilled,
      FolderOpened,
      Document,
    };
  },
});
</script>

<style scoped>
.upload-drop-zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 36px 24px;
  border: 2px dashed #d1d5db;
  border-radius: var(--cc-radius-lg);
  background: linear-gradient(135deg, #fafbfc 0%, #f8f9fb 100%);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    border-color: var(--cc-color-primary);
    background: var(--cc-color-primary-softer);
  }

  &.drag-over {
    border-color: var(--cc-color-primary);
    background: var(--cc-color-primary-softer);
    box-shadow: inset 0 0 0 2px rgba(0, 191, 165, 0.15);
    transform: scale(1.01);

    .el-icon {
      color: #00bfa5 !important;
    }
    p {
      color: #00bfa5 !important;
    }
  }

  .el-icon {
    transition: color 0.3s;
    margin-bottom: 4px;
  }

  p {
    margin: 4px 0 0;
    color: var(--cc-color-text-3);
    font-size: 14px;
    font-weight: 500;
  }
  .upload-hint {
    margin-top: 2px;
    font-size: 12px;
    color: #9ca3af;
  }
}

.upload-btn-row {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 14px;

  .el-button {
    border-radius: var(--cc-radius-md);
    font-size: 13px;
  }
}

.upload-queue-table {
  margin-top: 14px;
  border-radius: 8px;
  overflow: hidden;

  :deep(.el-table) {
    --el-table-border-color: var(--cc-color-border-light);

    th.el-table__cell {
      background: var(--cc-color-surface-hover);
      color: var(--cc-color-text-3);
      font-size: 12px;
      font-weight: 600;
    }

    .el-tag {
      border-radius: 4px;
      font-size: 11px;
      padding: 0 6px;
      height: 22px;
    }

    .el-progress {
      .el-progress-bar__outer {
        background: #e5e7eb;
      }
      .el-progress-bar__inner {
        background: #00bfa5;
      }
    }
  }
}
</style>
