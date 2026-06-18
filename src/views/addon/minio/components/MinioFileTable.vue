<template>
  <div class="minio-table-area">
    <el-table
      :data="store.files"
      v-loading="store.loading"
      stripe
      style="width: 100%"
      @row-click="onRowClick"
      @selection-change="onSelectionChange"
      height="calc(100vh - 320px)"
    >
      <el-table-column type="selection" width="40" />
      <el-table-column :label="$t('message.pms.minio.thumbnail')" width="60" align="center">
        <template #default="{ row }">
          <span v-if="!row.is_dir && isImageFile(row.content_type, row.key)" class="thumb-wrap">
            <img
              v-if="thumbCache[row.key]"
              :src="thumbCache[row.key]"
              class="file-thumb"
              style="
                width: 36px;
                height: 36px;
                max-width: 36px;
                max-height: 36px;
                object-fit: cover;
                display: block;
              "
              loading="lazy"
              @click.stop="store.previewFile(row)"
              @error="thumbCache[row.key] = ''"
            />
            <el-icon v-else class="icon-img-placeholder"><IconPicture /></el-icon>
          </span>
          <el-icon v-else-if="row.is_dir" class="icon-folder"><FolderOpened /></el-icon>
          <el-icon v-else class="icon-doc"><Document /></el-icon>
        </template>
      </el-table-column>
      <el-table-column :label="$t('message.pms.minio.fileName')" min-width="360">
        <template #default="{ row }">
          <a v-if="row.is_dir" class="file-link" @click="store.enterDir(row.key)">
            {{ displayName(row.key) }}
          </a>
          <span v-else class="file-name-plain">{{ displayName(row.key) }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('message.pms.minio.colSize')" width="120" prop="size_format" />
      <el-table-column
        :label="$t('message.pms.minio.colLastModified')"
        width="180"
        prop="last_modified"
      />
      <el-table-column :label="$t('message.pms.minio.colType')" width="140" prop="content_type" />
      <el-table-column :label="$t('message.pms.minio.colAction')" width="340" fixed="right">
        <template #default="{ row }">
          <template v-if="!row.is_dir">
            <el-button link size="small" type="primary" @click.stop="store.downloadFile(row.key)">{{
              $t("message.pms.minio.download")
            }}</el-button>
            <el-button link size="small" type="primary" @click.stop="store.copyFileUrl(row.key)">{{
              $t("message.pms.minio.copyLink")
            }}</el-button>
            <el-button link size="small" type="primary" @click.stop="onRename(row)">{{
              $t("message.pms.minio.rename")
            }}</el-button>
            <el-button link size="small" type="danger" @click.stop="onDelete(row)">{{
              $t("message.pms.minio.deleteFile")
            }}</el-button>
          </template>
          <template v-else>
            <el-button link size="small" type="primary" @click.stop="onRename(row)">{{
              $t("message.pms.minio.rename")
            }}</el-button>
            <el-button link size="small" type="danger" @click.stop="onDelete(row)">{{
              $t("message.pms.minio.deleteFile")
            }}</el-button>
          </template>
        </template>
      </el-table-column>
    </el-table>

    <div v-if="store.isTruncated" class="load-more">
      <el-button type="primary" link :loading="store.loading" @click="store.loadMore()">{{
        $t("message.pms.minio.loadMore")
      }}</el-button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from "vue";
import { ElMessageBox } from "element-plus";
import { useMinioStore } from "../store";
import { displayName, isImageFile, urlObjToStr } from "../utils";
import { presignedViewUrl } from "/@/api/addon/minio";
import { FolderOpened, Document, Picture as IconPicture } from "@element-plus/icons-vue";
import { useI18n } from "vue-i18n";

export default defineComponent({
  name: "MinioFileTable",
  setup() {
    const { t } = useI18n();
    const store = useMinioStore();
    const thumbCache = ref<Record<string, string>>({});

    /** 异步预加载图片文件的预览URL，缓存后供缩略图显示 */
    async function ensureThumbnail(key: string, mime: string) {
      if (!isImageFile(mime, key) || thumbCache.value[key]) return;
      try {
        const res: any = await presignedViewUrl(key);
        const url = urlObjToStr((res.data || res)["presigned-view-url"]);
        if (url) thumbCache.value[key] = url;
      } catch {
        /* 单个加载失败不影响其他 */
      }
    }

    // 文件列表变化时自动预加载所有图片缩略图
    watch(
      () => store.files,
      (files) => {
        for (const f of files) {
          ensureThumbnail(f.key, f.content_type);
        }
      },
      { immediate: true },
    );

    function onRowClick(row: any) {
      if (!row.is_dir) {
        store.detailFile = row;
      }
    }

    function onSelectionChange(selection: any[]) {
      store.selectedFiles = selection;
    }

    function onRename(row: any) {
      store.renameTarget = row;
      store.renameNewName = displayName(row.key);
      store.renameDialogVisible = true;
    }

    function onDelete(row: any) {
      const name = displayName(row.key);
      const type = row.is_dir ? t("message.minio.directory") : t("message.minio.file");
      ElMessageBox.confirm(`确认删除${type}「${name}」？`, t("message.common.confirmTitle"), {
        type: "warning",
      })
        .then(() => store.deleteFile(row))
        .catch(() => {});
    }

    return {
      store,
      displayName,
      isImageFile,
      thumbCache,
      onRowClick,
      onSelectionChange,
      onRename,
      onDelete,
      FolderOpened,
      Document,
      IconPicture,
    };
  },
});
</script>

<style scoped>
.minio-table-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;

  :deep(.el-table) {
    border: none;
    --el-table-border-color: var(--cc-color-border-light);

    th.el-table__cell {
      background: var(--cc-color-surface-hover);
      color: var(--cc-color-text-3);
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      padding: 8px 0;
      border-bottom: 1px solid var(--cc-color-border-light);
    }

    .el-table__row {
      transition: all 0.15s ease;
      cursor: default;

      td.el-table__cell {
        border-bottom: 1px solid var(--cc-color-border-light);
        padding: 6px 0;
        font-size: 13px;
      }

      &:hover td.el-table__cell {
        background: var(--cc-color-primary-softer);
      }

      /* Selected state — user row click selects */
      &.current-row td.el-table__cell {
        background: var(--cc-color-primary-softer);
        box-shadow: inset 0 0 0 1px var(--cc-color-primary-soft);
      }

      .file-cell {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .icon-folder {
        flex-shrink: 0;
        color: #f59e0b;
        font-size: 17px;
      }

      .icon-doc {
        flex-shrink: 0;
        color: var(--cc-color-text-3);
        font-size: 16px;
      }

      .thumb-wrap {
        flex-shrink: 0;
        width: 36px;
        height: 36px;
        max-width: 36px;
        max-height: 36px;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--cc-color-surface-hover);
        border-radius: 4px;
        overflow: hidden;
      }

      .file-thumb {
        display: block;
        width: 36px;
        height: 36px;
        max-width: 36px;
        max-height: 36px;
        object-fit: cover;
        border-radius: 4px;
        cursor: pointer;
        transition: opacity 0.2s;
        border: 1px solid #f0f2f5;

        &:hover {
          opacity: 0.8;
        }
      }

      .icon-img-placeholder {
        color: var(--cc-color-text-3);
        font-size: 20px;
      }

      .file-link {
        color: var(--cc-color-text-1);
        font-family: "SF Mono", "Fira Code", "Cascadia Code", monospace;
        font-size: 13px;
        font-weight: 500;
        transition: color 0.15s;
        cursor: pointer;

        &:hover {
          color: var(--cc-color-primary);
        }
      }

      .file-name-plain {
        font-size: 13px;
        color: var(--cc-color-text-1);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      /* Action buttons */
      .el-button.is-link {
        font-size: 12px;
        padding: 0 4px;

        &.el-button--primary {
          --el-color-primary: var(--cc-color-primary);
          &:hover {
            --el-color-primary: var(--cc-color-primary-active);
          }
        }
        &.el-button--danger {
          --el-color-danger: #94a3b8;
          &:hover {
            --el-color-danger: #f43f5e;
          }
        }
      }
    }

    /* Checkbox column */
    .el-table-column--selection .el-checkbox__inner {
      border-color: var(--cc-color-border);
    }
  }

  .load-more {
    text-align: center;
    padding: 10px 0;
    border-top: 1px solid #f0f2f5;
    background: #fafbfc;

    .el-button.is-link {
      font-size: 13px;
      color: var(--cc-color-text-3);
      &:hover {
        color: var(--cc-color-primary);
      }
    }
  }
}
</style>
