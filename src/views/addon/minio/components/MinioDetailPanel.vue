<template>
  <div v-if="store.detailFile" class="minio-detail-panel">
    <div class="detail-header">
      <span>{{ $t("message.pms.minio.fileDetail") }}</span>
      <el-button link :icon="Close" @click="store.detailFile = null" />
    </div>

    <div class="detail-card detail-info">
      <el-descriptions :column="1" size="small" border>
        <el-descriptions-item :label="$t('message.pms.minio.fileName')">{{
          displayName(file.key)
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('message.pms.minio.path')">{{
          file.key
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('message.pms.minio.colSize')">{{
          file.size_format
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('message.pms.minio.mimeType')">{{
          file.content_type
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('message.pms.minio.colLastModified')">{{
          file.last_modified
        }}</el-descriptions-item>
        <el-descriptions-item label="ETag" v-if="file.e_tag"
          >{{ file.e_tag.slice(0, 12) }}...</el-descriptions-item
        >
      </el-descriptions>
    </div>

    <div class="detail-divider" data-:label="$t('message.common.colOperation')"></div>

    <div class="detail-card detail-actions">
      <el-button :icon="Download" @click="store.downloadFile(file.key)">{{
        $t("message.pms.minio.download")
      }}</el-button>
      <el-button :icon="Link" @click="store.copyFileUrl(file.key)">{{
        $t("message.pms.minio.copyLink")
      }}</el-button>
      <el-button :icon="View" @click="store.previewFile(file)">{{
        $t("message.common.preview")
      }}</el-button>
      <el-button :icon="Edit" @click="onRename">{{ $t("message.pms.minio.rename") }}</el-button>
      <el-button type="danger" :icon="Delete" @click="onDelete">{{
        $t("message.pms.minio.deleteFile")
      }}</el-button>
    </div>

    <!-- TAG管理 -->
    <div class="detail-divider" data-:label="$t('message.pms.minio.tags')"></div>
    <div class="detail-card">
      <div class="detail-tags">
        <el-tag
          v-for="tag in store.tags"
          :key="tag.key"
          closable
          size="small"
          :disable-transitions="false"
          @close="onRemoveTag(tag.key)"
        >
          {{ tag.key }}: {{ tag.value }}
        </el-tag>
        <el-popover placement="bottom" trigger="click" width="260" @show="onShowAddTag">
          <template #reference>
            <el-button class="add-tag-btn" link size="small" :icon="Plus">{{
              $t("message.pms.minio.addTag")
            }}</el-button>
          </template>
          <el-form size="small" label-width="50px">
            <el-form-item label="Key">
              <el-input v-model="store.newTagKey" :placeholder="$t('message.pms.minio.tagKey')" />
            </el-form-item>
            <el-form-item label="Value">
              <el-input v-model="store.newTagVal" :placeholder="$t('message.pms.minio.tagValue')" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" size="small" @click="onAddTag">{{
                $t("message.common.confirm")
              }}</el-button>
            </el-form-item>
          </el-form>
        </el-popover>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, watch } from "vue";
import { ElMessageBox, ElMessage } from "element-plus";
import { useMinioStore } from "../store";
import { displayName } from "../utils";
import { Close, Download, Link, View, Edit, Delete, Plus } from "@element-plus/icons-vue";
import { useI18n } from "vue-i18n";

export default defineComponent({
  name: "MinioDetailPanel",
  setup() {
    const { t } = useI18n();
    const store = useMinioStore();

    const file = computed(() => store.detailFile!);

    watch(
      () => store.detailFile,
      (newFile) => {
        if (newFile && !newFile.is_dir) {
          store.fetchTags(newFile.key);
        }
      },
    );

    function onRename() {
      if (!store.detailFile) return;
      store.renameTarget = store.detailFile;
      store.renameNewName = displayName(store.detailFile.key);
      store.renameDialogVisible = true;
    }

    function onDelete() {
      if (!store.detailFile) return;
      const name = displayName(store.detailFile.key);
      ElMessageBox.confirm(`确认删除文件「${name}」？`, t("message.common.confirmTitle"), {
        type: "warning",
      })
        .then(() => store.deleteFile(store.detailFile!))
        .catch(() => {});
    }

    function onShowAddTag() {
      store.newTagKey = "";
      store.newTagVal = "";
    }

    function onAddTag() {
      if (!store.detailFile || !store.newTagKey.trim()) {
        ElMessage.warning(t("message.pms.minio.msgTagKeyRequired"));
        return;
      }
      store.addTag(store.detailFile.key, store.newTagKey.trim(), store.newTagVal.trim());
    }

    function onRemoveTag(key: string) {
      if (!store.detailFile) return;
      store.removeTag(store.detailFile.key, key);
    }

    return {
      store,
      file,
      displayName,
      onRename,
      onDelete,
      onShowAddTag,
      onAddTag,
      onRemoveTag,
      Close,
      Download,
      Link,
      View,
      Edit,
      Delete,
      Plus,
    };
  },
});
</script>

<style scoped>
.minio-detail-panel {
  width: 280px;
  min-width: 280px;
  border-left: 1px solid #f0f2f5;
  background: #fafbfc;
  overflow-y: auto;
  padding: 16px;

  .detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    > span:first-child {
      font-weight: 600;
      font-size: 14px;
      color: var(--cc-color-text-1);
    }
  }

  .detail-card {
    background: var(--cc-color-surface);
    border-radius: 8px;
    padding: 14px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    border: 1px solid #f0f2f5;
  }

  .detail-info {
    :deep(.el-descriptions) {
      --el-descriptions-table-border-color: #f0f2f5;
      --el-descriptions-item-bordered-label-background: var(--cc-color-surface-hover);

      .el-descriptions__title {
        display: none;
      }

      .el-descriptions__cell {
        padding: 6px 10px;
        font-size: 12px;
      }

      .el-descriptions__label {
        color: var(--cc-color-text-4);
        font-weight: 500;
        width: 70px;
      }

      .el-descriptions__content {
        color: var(--cc-color-text-1);
        font-family: "SF Mono", "Fira Code", monospace;
        font-size: 12px;
        word-break: break-all;
      }
    }
  }

  .detail-actions {
    display: flex;
    flex-direction: column;
    gap: 6px;

    .el-button {
      border: 1px solid var(--cc-color-border-light);
      border-radius: var(--cc-radius-md);
      justify-content: flex-start;
      padding: 8px 12px;
      height: auto;
      font-size: 13px;
      transition: all 0.2s ease;
      background: var(--cc-color-surface);

      &:hover {
        transform: translateX(3px);
        border-color: var(--cc-color-primary);
        color: var(--cc-color-primary);
        background: rgba(0, 191, 165, 0.04);

        .el-icon {
          color: var(--cc-color-primary);
        }
      }

      &:active {
        transform: translateX(1px);
      }

      .el-icon {
        margin-right: 6px;
        font-size: 15px;
        color: var(--cc-color-text-3);
        transition: color 0.2s;
      }
    }

    .el-button--danger {
      &:hover {
        border-color: #f43f5e;
        color: #f43f5e;
        background: rgba(244, 63, 94, 0.04);

        .el-icon {
          color: #f43f5e;
        }
      }
    }
  }

  .detail-tags {
    padding: 4px 0;
    display: flex;
    flex-wrap: wrap;
    gap: 4px;

    .el-tag {
      background: var(--cc-color-primary-softer);
      border-color: color-mix(in srgb, var(--cc-color-primary) 22%, transparent);
      color: var(--cc-color-primary);
      font-size: 11px;
      height: 24px;
      padding: 0 8px;
      border-radius: 4px;

      .el-tag__close {
        color: var(--cc-color-primary);
        &:hover {
          background: rgba(29, 78, 216, 0.1);
        }
      }
    }

    .add-tag-btn {
      height: 24px;
      font-size: 11px;
      color: var(--cc-color-text-4);
      padding: 0 6px;
      border: 1px dashed #d1d5db;
      border-radius: 4px;
      transition: all 0.2s;

      &:hover {
        border-color: var(--cc-color-primary);
        color: var(--cc-color-primary);
      }
    }
  }

  .detail-divider {
    margin: 14px 0;
    border-color: #f0f2f5;
    position: relative;

    &::after {
      content: attr(data-label);
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      background: #fafbfc;
      padding: 0 8px;
      font-size: 11px;
      color: var(--cc-color-text-4);
    }
  }
}
</style>
