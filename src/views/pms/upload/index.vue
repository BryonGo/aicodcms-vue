<template>
  <div class="ul-page">
    <!-- 面包屑 -->
    <el-breadcrumb separator="→">
      <el-breadcrumb-item :to="{ path: '/' }"
        ><el-icon><HomeFilled /></el-icon> {{ $t("message.router.home") }}</el-breadcrumb-item
      >
      <el-breadcrumb-item>{{ $t("message.pms.systemManagement") }}</el-breadcrumb-item>
      <el-breadcrumb-item>{{ $t("message.pms_upload.title") }}</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 页面头部 -->
    <div class="ul-header">
      <div>
        <h1 class="ul-title">{{ $t("message.pms_upload.title") }}</h1>
        <p class="ul-subtitle">{{ $t("message.pms_upload.subtitle") }}</p>
      </div>
      <div class="ul-header-actions">
        <el-button
          type="default"
          size="large"
          @click="uploadState.visible = true"
          class="ul-upload-btn"
        >
          <el-icon style="margin-right: 4px"><UploadFilled /></el-icon>
          {{ $t("message.pms_upload.btnUpload") }}
        </el-button>
        <el-button
          type="danger"
          size="large"
          plain
          :disabled="state.ids.length === 0"
          @click="onRowDel(null)"
        >
          <el-icon><Delete /></el-icon> {{ $t("message.common.batchDelete")
          }}{{ state.ids.length ? ` (${state.ids.length})` : "" }}
        </el-button>
      </div>
    </div>

    <!-- 搜索栏 -->
    <div class="ul-search-card">
      <el-form :inline="true" :model="state.tableData.param" size="default">
        <el-form-item>
          <el-input
            v-model.trim="state.tableData.param.keyword"
            clearable
            :placeholder="$t('message.pms_upload.searchPlaceholder')"
            @keyup.enter="dataList"
            class="ul-search-input"
          >
            <template #prefix
              ><el-icon><Search /></el-icon
            ></template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-select
            v-model="state.tableData.param.image_type"
            clearable
            :placeholder="$t('message.pms_upload.fileType')"
            style="width: 130px"
            @change="dataList"
          >
            <el-option :label="$t('message.pms_upload.typeImage')" value="image" />
            <el-option :label="$t('message.pms_upload.typeDoc')" value="doc" />
            <el-option :label="$t('message.pms_upload.typeVideo')" value="video" />
            <el-option :label="$t('message.pms_upload.typeAudio')" value="audio" />
            <el-option :label="$t('message.pms_upload.typeArchive')" value="archive" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-select
            v-model="state.tableData.param.storage"
            clearable
            :placeholder="$t('message.pms_upload.colStorageEngine')"
            style="width: 130px"
            @change="dataList"
          >
            <el-option :label="$t('message.pms_upload.storageLocal')" value="local" />
            <el-option label="MinIO" value="minio" />
            <el-option :label="$t('message.pms_upload.storageTencent')" value="tencent" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="dataList">{{ $t("message.common.search") }}</el-button>
          <el-button @click="resetQuery">{{ $t("message.common.reset") }}</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 表格 -->
    <div class="ul-table-card">
      <el-table
        :data="state.tableData.data"
        v-loading="state.tableData.loading"
        class="ul-table"
        @selection-change="handleSelectionChange"
        :empty-text="$t('message.pms_upload.emptyText')"
      >
        <el-table-column type="selection" width="44" />
        <el-table-column :label="$t('message.common.colId')" align="center" prop="id" width="60" />
        <el-table-column :label="$t('message.common.preview')" align="center" width="72">
          <template #default="{ row }">
            <el-popover placement="right" trigger="hover" :width="300" v-if="isImage(row.mimetype)">
              <template #reference>
                <div class="ul-thumb">
                  <img :src="getPreviewUrl(row)" class="ul-thumb-img" />
                </div>
              </template>
              <img
                :src="getPreviewUrl(row)"
                style="max-width: 280px; max-height: 200px; display: block; border-radius: 8px"
              />
            </el-popover>
            <div v-else class="ul-file-icon">
              <el-icon :size="20"><component :is="getFileIcon(row.mimetype)" /></el-icon>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('message.pms_upload.colFilename')"
          align="left"
          min-width="180"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <span class="ul-filename">{{ row.filename }}</span>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('message.pms_upload.colFilename')"
          align="left"
          min-width="160"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <span class="ul-srcname">{{ row.src_filename }}</span>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('message.pms_upload.colFileSize')"
          align="center"
          width="100"
          :formatter="sizeFormat"
        />
        <el-table-column :label="$t('message.pms_upload.colDimensions')" align="center" width="90">
          <template #default="{ row }">
            <span v-if="row.image_width" class="ul-dimension"
              >{{ row.image_width }}×{{ row.image_height }}</span
            >
            <span v-else class="ul-dimension muted">—</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('message.pms_upload.fieldExtension')" align="center" width="85">
          <template #default="{ row }">
            <span class="ul-ext-tag" :class="extClass(row.image_type)">{{
              row.image_type || "-"
            }}</span>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('message.pms_upload.colStorageEngine')"
          align="center"
          width="100"
        >
          <template #default="{ row }">
            <el-tag :type="getStorageTag(row.storage)" size="small" effect="light" round>
              {{ getStorageLabel(row.storage) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="MIME" align="center" width="130" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="ul-mime">{{ row.mimetype }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('message.pms_upload.colCreateDate')" align="center" width="170">
          <template #default="{ row }">
            <span class="ul-time">{{ formatTime(row.created_at) }}</span>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('message.common.colOperation')"
          align="center"
          width="140"
          fixed="right"
        >
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="onView(row)">{{
              $t("message.common.detail")
            }}</el-button>
            <el-button link type="danger" size="small" @click="onRowDel(row)">{{
              $t("message.common.delete")
            }}</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="ul-table-footer">
        <div class="ul-footer-left">
          <span class="ul-stats">共 {{ state.tableData.total }} 个文件</span>
        </div>
        <pagination
          v-show="state.tableData.total > 0"
          :total="state.tableData.total"
          v-model:page="state.tableData.param.page"
          v-model:limit="state.tableData.param.row"
          @pagination="dataList"
        />
      </div>
    </div>

    <!-- 上传弹窗 -->
    <el-drawer
      v-model="uploadState.visible"
      :title="$t('message.pms_upload.uploadFile')"
      width="580px"
      destroy-on-close
      :close-on-click-modal="false"
      class="ul-dialog"
    >
      <div class="ul-upload-wrap">
        <!-- 拖拽区 -->
        <div
          class="ul-dropzone"
          :class="{
            'is-dragover': uploadState.isDragOver,
            'is-empty': uploadState.files.length === 0,
          }"
          @dragover.prevent="uploadState.isDragOver = true"
          @dragleave.prevent="uploadState.isDragOver = false"
          @drop.prevent="onDrop"
          @click="triggerFileInput"
        >
          <div class="ul-dropzone-visual">
            <div class="ul-dropzone-icon-ring">
              <el-icon :size="36"><UploadFilled /></el-icon>
            </div>
            <p class="ul-dropzone-title">{{ $t("message.pms_upload.dropzoneHint") }}</p>
            <p class="ul-dropzone-subtitle">{{ $t("message.pms_upload.orClick") }}</p>
          </div>
          <input
            ref="fileInputRef"
            type="file"
            multiple
            class="ul-file-hidden-input"
            @change="onFileInputChange"
          />
        </div>

        <!-- 文件队列 -->
        <TransitionGroup
          name="ul-queue"
          tag="div"
          class="ul-upload-queue"
          v-if="uploadState.files.length > 0"
        >
          <div v-for="(item, idx) in uploadState.files" :key="item.uid" class="ul-upload-item">
            <div class="ul-upload-item-left">
              <div class="ul-upload-item-icon" :class="'is-' + item.status">
                <el-icon :size="22" v-if="item.status === 'waiting'"><DocIcon /></el-icon>
                <el-icon :size="22" v-else-if="item.status === 'uploading'" class="is-spin"
                  ><Loading
                /></el-icon>
                <el-icon :size="22" v-else-if="item.status === 'done'"
                  ><CircleCheckFilled
                /></el-icon>
                <el-icon :size="22" v-else><CircleCloseFilled /></el-icon>
              </div>
              <div class="ul-upload-item-info">
                <p class="ul-upload-item-name" :title="item.name">{{ item.name }}</p>
                <p class="ul-upload-item-meta">{{ formatFileSize(item.size) }}</p>
                <div class="ul-upload-item-bar" v-if="item.status === 'uploading'">
                  <span class="ul-upload-bar-fill" :style="{ width: item.progress + '%' }" />
                </div>
                <p class="ul-upload-item-err" v-if="item.status === 'error'">
                  {{ item.error || $t("message.pms_upload.failed") }}
                </p>
              </div>
            </div>
            <div class="ul-upload-item-right">
              <el-button
                link
                size="small"
                type="danger"
                @click="removeFile(idx)"
                v-if="item.status !== 'uploading'"
              >
                <el-icon><Close /></el-icon>
              </el-button>
            </div>
          </div>
        </TransitionGroup>
      </div>

      <template #footer>
        <div class="ul-dialog-footer">
          <el-button @click="closeUpload" :disabled="uploadState.uploading">{{
            $t("message.common.close")
          }}</el-button>
          <el-button
            type="primary"
            @click="startUpload"
            :disabled="uploadState.uploading || uploadState.files.length === 0"
            :loading="uploadState.uploading"
            class="ul-dialog-submit"
          >
            <template v-if="!uploadState.uploading"
              ><el-icon><UploadFilled /></el-icon>{{ $t("message.pms_upload.uploadBtn") }}</template
            >
            <template v-else>{{ $t("message.pms_upload.uploading") }}</template>
          </el-button>
        </div>
      </template>
    </el-drawer>

    <!-- 详情弹窗 -->
    <el-drawer
      v-model="state.dialogVisible"
      :title="$t('message.pms_upload.detailTitle')"
      width="640px"
      destroy-on-close
      class="ul-dialog"
    >
      <el-descriptions v-if="state.currentRow" :column="2" border class="ul-desc">
        <el-descriptions-item :label="$t('message.common.colId')" align="center">{{
          state.currentRow.id
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('message.pms.upload.colSrcFilename')" align="center">{{
          state.currentRow.src_filename
        }}</el-descriptions-item>
        <el-descriptions-item
          :label="$t('message.pms.upload.colStoragePath')"
          align="center"
          :span="2"
          >{{ state.currentRow.filename }}</el-descriptions-item
        >
        <el-descriptions-item :label="$t('message.pms.minio.fileSize')" align="center">{{
          sizeFormat(state.currentRow)
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('message.pms.upload.colMimeType')" align="center">{{
          state.currentRow.mimetype
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('message.pms.upload.colExtension')" align="center">{{
          state.currentRow.image_type || "-"
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('message.pms_upload.colDimensions')" align="center">
          {{ state.currentRow.image_width || "-" }} × {{ state.currentRow.image_height || "-" }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('message.pms.upload.colStorage')" align="center">{{
          getStorageLabel(state.currentRow.storage)
        }}</el-descriptions-item>
        <el-descriptions-item
          :label="$t('message.pms.upload.colUploadTime')"
          align="center"
          :span="2"
          >{{ formatTime(state.currentRow.created_at) }}</el-descriptions-item
        >
        <el-descriptions-item :label="$t('message.pms_upload.colUrl')" align="center" :span="2">
          <el-link
            type="primary"
            :href="getPreviewUrl(state.currentRow)"
            target="_blank"
            :underline="false"
            class="ul-url-link"
          >
            {{ getPreviewUrl(state.currentRow) }}
          </el-link>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('message.common.preview')" align="center" :span="2">
          <el-image
            v-if="isImage(state.currentRow.mimetype)"
            :src="getPreviewUrl(state.currentRow)"
            style="max-width: 300px; max-height: 200px"
            fit="contain"
            :preview-src-list="[getPreviewUrl(state.currentRow)]"
            preview-teleported
          />
          <span v-else class="ul-muted">{{ $t("message.pms_upload.msgNoPreview") }}</span>
        </el-descriptions-item>
      </el-descriptions>
    </el-drawer>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, onMounted } from "vue";
import { ElMessageBox, ElMessage } from "element-plus";
import { listUploads, deleteUploads, getPresignedUrl, smartUpload } from "/@/api/pms/upload";
import { getUpFileUrl } from "/@/utils/aicodcod";
import {
  Picture as IconPicture,
  Document as IconDocument,
  VideoCamera as IconVideo,
  Headset as IconAudio,
  Tickets as IconArchive,
  View,
  Search,
  UploadFilled,
  CircleCheckFilled,
  CircleCloseFilled,
  Loading,
  Close,
  HomeFilled,
  Delete,
} from "@element-plus/icons-vue";
import { Document as DocIcon } from "@element-plus/icons-vue";
import { useI18n } from "vue-i18n";

interface UploadRow {
  id: number;
  filename: string;
  src_filename: string;
  filesize: number;
  url: string;
  storage: string;
  created_at: string;
  mimetype: string;
  image_type: string;
  image_width: string;
  image_height: string;
}

interface FileItem {
  uid: number;
  name: string;
  size: number;
  file: File;
  status: "waiting" | "uploading" | "done" | "error";
  progress: number;
  error?: string;
}

export default defineComponent({
  name: "UploadList",
  setup() {
    const { t } = useI18n();
    const state = reactive({
      ids: [] as number[],
      dialogVisible: false,
      currentRow: null as UploadRow | null,
      presignedUrlCache: {} as Record<number, string>,
      tableData: {
        data: [] as UploadRow[],
        total: 0,
        loading: false,
        param: {
          row: 15,
          page: 1,
          keyword: undefined as string | undefined,
          image_type: undefined as string | undefined,
          storage: undefined as string | undefined,
        },
      },
    });

    let _uploadUid = 0;
    const fileInputRef = ref<HTMLInputElement | null>(null);
    const uploadState = reactive({
      visible: false,
      isDragOver: false,
      uploading: false,
      files: [] as FileItem[],
    });

    const formatFileSize = (bytes: number) => {
      if (!bytes) return "0 B";
      if (bytes < 1024) return bytes + " B";
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
      if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB";
      return (bytes / (1024 * 1024 * 1024)).toFixed(2) + " GB";
    };

    const addFiles = (files: FileList | File[]) => {
      for (const f of Array.from(files).filter((f) => f.size > 0)) {
        uploadState.files.push({
          uid: ++_uploadUid,
          name: f.name,
          size: f.size,
          file: f,
          status: "waiting",
          progress: 0,
        });
      }
    };
    const triggerFileInput = () => fileInputRef.value?.click();
    const onFileInputChange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (target.files) addFiles(target.files);
      target.value = "";
    };
    const onDrop = (e: DragEvent) => {
      uploadState.isDragOver = false;
      if (e.dataTransfer?.files) addFiles(e.dataTransfer.files);
    };
    const removeFile = (idx: number) => uploadState.files.splice(idx, 1);

    const startUpload = async () => {
      if (uploadState.uploading || uploadState.files.length === 0) return;
      uploadState.uploading = true;
      let success = 0,
        fail = 0;
      for (const item of uploadState.files) {
        if (item.status === "done") {
          success++;
          continue;
        }
        if (item.status === "error") {
          fail++;
          continue;
        }
        item.status = "uploading";
        item.progress = 30;
        try {
          await smartUpload(item.file);
          item.status = "done";
          item.progress = 100;
          success++;
        } catch (err: any) {
          item.status = "error";
          item.progress = 0;
          item.error = err?.message || t("message.pms_upload.failed");
          fail++;
        }
      }
      uploadState.uploading = false;
      if (success > 0 && fail === 0) {
        ElMessage.success(t(`${success} 个文件上传成功`));
        closeUpload();
        dataList();
      } else if (success > 0 && fail > 0) {
        ElMessage.warning(t(`${success} 成功, ${fail} 失败`));
        uploadState.files = uploadState.files.filter((f) => f.status === "error");
        dataList();
      } else {
        ElMessage.error(t("message.pms_upload.failed"));
      }
    };

    const closeUpload = () => {
      if (uploadState.uploading) return;
      uploadState.visible = false;
      uploadState.files = [];
    };

    const dataList = () => {
      state.tableData.loading = true;
      const params: any = {
        page_num: state.tableData.param.page,
        page_size: state.tableData.param.row,
      };
      if (state.tableData.param.keyword) params.keyword = state.tableData.param.keyword;
      if (state.tableData.param.image_type) params.image_type = state.tableData.param.image_type;
      if (state.tableData.param.storage) params.storage = state.tableData.param.storage;
      listUploads(params)
        .then((res: any) => {
          const data = res.data || res;
          state.tableData.data = data.list || [];
          state.tableData.total = data.total || 0;
          state.presignedUrlCache = {};
          prefetchMinioUrls();
        })
        .catch(() => {})
        .finally(() => {
          state.tableData.loading = false;
        });
    };

    const prefetchMinioUrls = () => {
      state.tableData.data
        .filter((r) => r.storage === "minio" && !state.presignedUrlCache[r.id])
        .forEach((row) => {
          getPresignedUrl(row.id)
            .then((res: any) => {
              const data = res.data || res;
              if (data?.url) state.presignedUrlCache[row.id] = data.url;
            })
            .catch(() => {});
        });
    };

    const resetQuery = () => {
      state.tableData.param.keyword = undefined;
      state.tableData.param.image_type = undefined;
      state.tableData.param.storage = undefined;
      state.tableData.param.page = 1;
      dataList();
    };

    const onRowDel = (row: UploadRow | null) => {
      const ids = row ? [row.id] : state.ids;
      if (ids.length === 0) {
        ElMessage.error(t("message.pms_upload.msgSelectDelete"));
        return;
      }
      ElMessageBox.confirm(
        row ? t(`确认删除「${row.src_filename}」？`) : t(`确认删除 ${ids.length} 个文件？`),
        t("message.common.confirmDeleteTitle"),
        { type: "warning" },
      )
        .then(() => {
          deleteUploads(ids).then(() => {
            ElMessage.success(t("message.common.msgDeleteOk"));
            dataList();
          });
        })
        .catch(() => {});
    };

    const handleSelectionChange = (selection: UploadRow[]) => {
      state.ids = selection.map((i) => i.id);
    };

    const onView = async (row: UploadRow) => {
      if (row.storage === "minio") {
        try {
          const res = await getPresignedUrl(row.id);
          const data = res.data || res;
          if (data?.url) state.presignedUrlCache[row.id] = data.url;
        } catch (_) {}
      }
      state.currentRow = row;
      state.dialogVisible = true;
    };

    const sizeFormat = (row: UploadRow) => {
      const s = row.filesize;
      if (!s) return "0 B";
      if (s < 1024) return s + " B";
      if (s < 1048576) return (s / 1024).toFixed(1) + " KB";
      return (s / 1048576).toFixed(1) + " MB";
    };

    const formatTime = (ts: string) => {
      if (!ts) return "-";
      const d = new globalThis.Date(Number(ts) * 1000);
      if (isNaN(d.getTime())) return ts;
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      const hh = String(d.getHours()).padStart(2, "0");
      const mi = String(d.getMinutes()).padStart(2, "0");
      return `${mm}-${dd} ${hh}:${mi}`;
    };

    const isImage = (mime: string) => mime && mime.startsWith("image/");

    const getPreviewUrl = (row: UploadRow) => {
      if (row.storage === "minio" && state.presignedUrlCache[row.id])
        return state.presignedUrlCache[row.id];
      if (!row.url) return "";
      if (/^https?:\/\/|^blob/i.test(row.url)) return row.url;
      return getUpFileUrl(row.url);
    };

    const getFileIcon = (mime: string) => {
      if (!mime) return IconDocument;
      if (mime.startsWith("image/")) return IconPicture;
      if (mime.startsWith("video/")) return IconVideo;
      if (mime.startsWith("audio/")) return IconAudio;
      if (/zip|rar|tar|gzip|7z/.test(mime)) return IconArchive;
      return IconDocument;
    };

    const extClass = (ext: string) => {
      if (!ext) return "";
      if (/jpe?g|png|gif|webp|svg|bmp/.test(ext)) return "ext-image";
      if (/doc|docx|pdf|xls|xlsx|ppt|pptx|txt/.test(ext)) return "ext-doc";
      if (/mp4|avi|mov|wmv|flv|mkv/.test(ext)) return "ext-video";
      if (/mp3|wav|wma|aac|flac/.test(ext)) return "ext-audio";
      if (/zip|rar|tar|gz|7z/.test(ext)) return "ext-archive";
      return "";
    };

    const getStorageLabel = (s: string) =>
      (
        ({
          local: t("message.pms_upload.local"),
          minio: "MinIO",
          tencent: t("message.pms_upload.tencentCos"),
        }) as Record<string, string>
      )[s] || s;
    const getStorageTag = (s: string) =>
      (({ local: "info", minio: "warning", tencent: "success" }) as Record<string, string>)[s] ||
      "info";

    onMounted(() => dataList());

    return {
      state,
      dataList,
      resetQuery,
      onRowDel,
      handleSelectionChange,
      onView,
      sizeFormat,
      formatTime,
      isImage,
      getPreviewUrl,
      getFileIcon,
      extClass,
      getStorageLabel,
      getStorageTag,
      uploadState,
      fileInputRef,
      formatFileSize,
      onFileInputChange,
      onDrop,
      removeFile,
      startUpload,
      closeUpload,
      triggerFileInput,
      IconPicture,
      IconDocument,
      IconVideo,
      IconAudio,
      IconArchive,
      View,
      Search,
      UploadFilled,
      CircleCheckFilled,
      CircleCloseFilled,
      Loading,
      Close,
      DocIcon,
      HomeFilled,
      Delete,
    };
  },
});
</script>

<style scoped>
.ul-page {
  max-width: 1400px;
  margin: 0 auto;
  font-family: "Plus Jakarta Sans", system-ui, sans-serif;
}

/* ========== Header ========== */
.ul-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin: 24px 0 20px;
  padding: 28px 32px 24px;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 40%, #fcd34d 100%);
  border-radius: 16px;
  border: 1px solid #fbbf24;
  position: relative;
  overflow: hidden;
}
.ul-header::before {
  content: "";
  position: absolute;
  top: -60px;
  right: -40px;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.25) 0%, transparent 70%);
  pointer-events: none;
}
.ul-header::after {
  content: "";
  position: absolute;
  bottom: -30px;
  right: 80px;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, transparent 70%);
  pointer-events: none;
}
.ul-title {
  font-family: "Plus Jakarta Sans", system-ui, sans-serif;
  font-size: 26px;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: #78350f;
  margin: 0 0 4px;
  position: relative;
}
.ul-subtitle {
  font-family: "Plus Jakarta Sans", system-ui, sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #b45309;
  margin: 0;
  position: relative;
}
.ul-header-actions {
  display: flex;
  gap: 10px;
  align-items: center;
  position: relative;
}
.ul-header-actions .el-button {
  font-family: "Plus Jakarta Sans", system-ui, sans-serif;
  font-weight: 600;
  border-radius: 10px;
}
.ul-upload-btn {
  background: linear-gradient(135deg, #d97706, #b45309) !important;
  border: none !important;
  color: #fff !important;
  box-shadow: 0 2px 8px rgba(217, 119, 6, 0.3);
  transition: all 0.25s ease;
}
.ul-upload-btn:hover {
  box-shadow: 0 4px 16px rgba(217, 119, 6, 0.4) !important;
  transform: translateY(-1px);
}

/* ========== Search Card ========== */
.ul-search-card {
  margin-bottom: 16px;
  padding: 16px 20px;
  background: #fff;
  border: 1px solid #fde68a;
  border-radius: 12px;
}
.ul-search-card :deep(.el-form-item) {
  margin-bottom: 0;
}
.ul-search-input {
  width: 260px;
}
.ul-search-input :deep(.el-input__wrapper) {
  border-radius: 10px;
  box-shadow: none;
  border: 1px solid #fde68a;
  transition:
    border-color 0.25s,
    box-shadow 0.25s;
}
.ul-search-input :deep(.el-input__wrapper:hover) {
  border-color: #fbbf24;
}
.ul-search-input :deep(.el-input__wrapper.is-focus) {
  border-color: #d97706;
  box-shadow: 0 0 0 3px rgba(217, 119, 6, 0.1);
}

/* ========== Table Card ========== */
.ul-table-card {
  background: #fff;
  border: 1px solid #fde68a;
  border-radius: 16px;
  padding: 20px 24px 12px;
}
.ul-table {
  font-family: "Plus Jakarta Sans", system-ui, sans-serif;
  font-size: 14px;
}
.ul-table :deep(th.el-table__cell) {
  font-family: "Plus Jakarta Sans", system-ui, sans-serif;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #92400e;
  background: #fffbeb;
  border-bottom: 2px solid #fde68a;
}
.ul-table :deep(.el-table__row:hover > td.el-table__cell) {
  background: #fffbeb;
}
.ul-table :deep(.el-table__row > td) {
  border-bottom-color: #fef3c7;
}

.ul-filename {
  font-weight: 500;
  color: #1c1917;
}
.ul-srcname {
  color: #78716c;
  font-size: 13px;
}
.ul-dimension {
  font-size: 13px;
  color: #78716c;
}
.ul-dimension.muted {
  color: #d6d3d1;
}
.ul-mime {
  font-size: 12px;
  color: #a8a29e;
}
.ul-url-link {
  font-size: 12px;
  word-break: break-all;
}
.ul-muted {
  color: #d6d3d1;
  font-size: 13px;
}

/* Thumbnail */
.ul-thumb {
  width: 48px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 6px;
  background: transparent;
  margin: 0 auto;
}
.ul-thumb-img {
  max-width: 48px;
  max-height: 36px;
  object-fit: cover;
}
.ul-file-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 36px;
  color: #d6d3d1;
}

/* Ext tag */
.ul-ext-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.03em;
  font-family: "SF Mono", "JetBrains Mono", monospace;
}
.ul-ext-tag.ext-image {
  background: #fef3c7;
  color: #d97706;
}
.ul-ext-tag.ext-doc {
  background: var(--cc-color-primary-softer);
  color: var(--cc-color-primary);
}
.ul-ext-tag.ext-video {
  background: #fce4ec;
  color: #d32f2f;
}
.ul-ext-tag.ext-audio {
  background: #f3e5f5;
  color: #7b1fa2;
}
.ul-ext-tag.ext-archive {
  background: #e8f5e9;
  color: #2e7d32;
}

/* Footer */
.ul-table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
}
.ul-stats {
  font-size: 13px;
  color: #a8a29e;
}

/* ========== Upload Dialog ========== */
.ul-dialog :deep(.el-dialog__header) {
  font-family: "Plus Jakarta Sans", system-ui, sans-serif;
  font-weight: 700;
  font-size: 17px;
  color: #292524;
}
.ul-upload-wrap {
  padding: 4px 0;
}
.ul-dropzone {
  border: 2px dashed #fcd34d;
  border-radius: 16px;
  padding: 48px 0;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
  position: relative;
}
.ul-dropzone:hover {
  border-color: #f59e0b;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
}
.ul-dropzone.is-dragover {
  border-color: #d97706;
  background: linear-gradient(135deg, #fde68a 0%, #fcd34d 100%);
  box-shadow:
    0 0 0 8px rgba(217, 119, 6, 0.1),
    inset 0 0 40px rgba(217, 119, 6, 0.04);
  transform: scale(1.008);
}
.ul-dropzone-visual {
  pointer-events: none;
}
.ul-dropzone-icon-ring {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: linear-gradient(135deg, #fde68a 0%, #fcd34d 100%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #d97706;
  margin-bottom: 16px;
  transition: all 0.3s ease;
}
.is-dragover .ul-dropzone-icon-ring {
  background: linear-gradient(135deg, #d97706 0%, #f59e0b 100%);
  color: #fff;
  box-shadow: 0 8px 24px rgba(217, 119, 6, 0.3);
}
.ul-dropzone-title {
  font-size: 15px;
  font-weight: 600;
  color: #292524;
  margin: 0 0 6px;
}
.ul-dropzone-subtitle {
  font-size: 13px;
  color: #a8a29e;
  margin: 0;
}
.ul-file-hidden-input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}

.ul-upload-queue {
  margin-top: 20px;
  max-height: 320px;
  overflow-y: auto;
}
.ul-upload-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-radius: 12px;
  background: #fafaf9;
  border: 1px solid #f5f5f4;
  transition: all 0.3s ease;
}
.ul-upload-item:not(:last-child) {
  margin-bottom: 8px;
}
.ul-upload-item:hover {
  background: #f5f5f4;
  border-color: #e7e5e4;
}

.ul-upload-item-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}
.ul-upload-item-icon {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.3s ease;
}
.ul-upload-item-icon.is-waiting {
  background: #f5f5f4;
  color: #a8a29e;
}
.ul-upload-item-icon.is-uploading {
  background: #fef3c7;
  color: #d97706;
}
.ul-upload-item-icon.is-done {
  background: #f0fdf4;
  color: #16a34a;
}
.ul-upload-item-icon.is-error {
  background: #fef2f2;
  color: #ef4444;
}

.is-spin {
  animation: ul-spin 1s linear infinite;
}
@keyframes ul-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.ul-upload-item-info {
  flex: 1;
  min-width: 0;
}
.ul-upload-item-name {
  font-size: 13px;
  font-weight: 500;
  color: #292524;
  margin: 0 0 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.ul-upload-item-meta {
  font-size: 11px;
  color: #a8a29e;
  margin: 0 0 6px;
}
.ul-upload-item-bar {
  height: 4px;
  border-radius: 2px;
  background: #e7e5e4;
  overflow: hidden;
}
.ul-upload-bar-fill {
  display: block;
  height: 100%;
  border-radius: 2px;
  background: linear-gradient(90deg, #f59e0b, #d97706);
  transition: width 0.6s ease;
  animation: ul-shimmer 2s infinite;
}
@keyframes ul-shimmer {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}
.ul-upload-item-err {
  font-size: 11px;
  color: #ef4444;
  margin: 4px 0 0;
}
.ul-upload-item-right {
  flex-shrink: 0;
  margin-left: 12px;
}

.ul-dialog-submit {
  background: linear-gradient(135deg, #d97706, #b45309) !important;
  border: none !important;
}

/* Queue transitions */
.ul-queue-enter-active,
.ul-queue-leave-active {
  transition: all 0.35s ease;
}
.ul-queue-enter-from {
  opacity: 0;
  transform: translateY(12px) scale(0.96);
}
.ul-queue-leave-to {
  opacity: 0;
  transform: translateX(24px);
}

/* Description list */
.ul-desc :deep(th) {
  background: #fffbeb !important;
  color: #92400e !important;
  font-weight: 600;
}
.ul-desc :deep(.el-descriptions__cell) {
  border-color: #fde68a !important;
}

/* Responsive */
@media (max-width: 768px) {
  .ul-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    padding: 20px;
  }
  .ul-table-card {
    padding: 12px 8px;
    border-radius: 12px;
    overflow-x: auto;
  }
  .ul-search-input {
    width: 100%;
  }
  .ul-stats {
    display: none;
  }
}
@media (min-width: 1441px) {
  .ul-page {
    max-width: none;
    padding: 0 40px;
  }
}
</style>
