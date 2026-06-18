<template>
  <div class="pro-upload" :class="[`pro-upload--${mode}`, { 'is-disabled': disabled }]">
    <!-- 图片墙模式 -->
    <el-upload
      v-if="mode === 'image' || mode === 'image-card'"
      ref="uploadRef"
      :action="action"
      :headers="mergedHeaders"
      :data="data"
      :name="name"
      :with-credentials="withCredentials"
      :multiple="multiple"
      :accept="accept || 'image/*'"
      :list-type="mode === 'image-card' ? 'picture-card' : 'picture'"
      :limit="limit"
      :disabled="disabled"
      :file-list="fileList"
      :before-upload="onBeforeUpload"
      :on-success="onSuccess"
      :on-error="onError"
      :on-exceed="onExceed"
      :on-remove="onRemove"
      :on-preview="onPreview"
      :on-progress="onProgress"
      class="pro-upload__el"
    >
      <template v-if="mode === 'image-card'">
        <el-icon class="pro-upload__icon"><Plus /></el-icon>
      </template>
      <template v-else>
        <el-button type="primary" :icon="UploadFilledIcon">{{ buttonText }}</el-button>
      </template>

      <template v-if="tip" #tip>
        <div class="pro-upload__tip">{{ tip }}</div>
      </template>
    </el-upload>

    <!-- 拖拽模式 -->
    <el-upload
      v-else-if="mode === 'drag'"
      ref="uploadRef"
      :action="action"
      :headers="mergedHeaders"
      :data="data"
      :name="name"
      :with-credentials="withCredentials"
      :multiple="multiple"
      :accept="accept"
      :limit="limit"
      :disabled="disabled"
      :file-list="fileList"
      :before-upload="onBeforeUpload"
      :on-success="onSuccess"
      :on-error="onError"
      :on-exceed="onExceed"
      :on-remove="onRemove"
      :on-preview="onPreview"
      :on-progress="onProgress"
      drag
      class="pro-upload__el pro-upload__drag"
    >
      <el-icon class="pro-upload__drag-icon"><UploadFilled /></el-icon>
      <div class="pro-upload__drag-text">
        {{ dragText || "将文件拖到此处，或" }}<em>{{ dragLinkText || "点击上传" }}</em>
      </div>
      <template v-if="tip" #tip>
        <div class="pro-upload__tip">{{ tip }}</div>
      </template>
    </el-upload>

    <!-- 普通文件列表 -->
    <el-upload
      v-else
      ref="uploadRef"
      :action="action"
      :headers="mergedHeaders"
      :data="data"
      :name="name"
      :with-credentials="withCredentials"
      :multiple="multiple"
      :accept="accept"
      :limit="limit"
      :disabled="disabled"
      :file-list="fileList"
      :before-upload="onBeforeUpload"
      :on-success="onSuccess"
      :on-error="onError"
      :on-exceed="onExceed"
      :on-remove="onRemove"
      :on-preview="onPreview"
      :on-progress="onProgress"
      class="pro-upload__el"
    >
      <el-button type="primary" :icon="UploadFilledIcon">{{ buttonText }}</el-button>
      <template v-if="tip" #tip>
        <div class="pro-upload__tip">{{ tip }}</div>
      </template>
    </el-upload>

    <!-- 图片预览 dialog -->
    <el-dialog v-model="previewVisible" :title="previewTitle" width="640px" append-to-body>
      <img
        v-if="previewUrl"
        :src="previewUrl"
        :alt="previewTitle"
        class="pro-upload__preview-img"
      />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { Plus, UploadFilled } from "@element-plus/icons-vue";
import {
  ElMessage,
  type UploadFile,
  type UploadFiles,
  type UploadProgressEvent,
  type UploadRawFile,
} from "element-plus";
import { UploadFilled as UploadFilledIcon } from "@element-plus/icons-vue";
import { Session } from "/@/utils/storage";

interface ProUploadFile {
  name: string;
  url?: string;
  uid?: number | string;
  status?: string;
  [k: string]: any;
}

const props = withDefaults(
  defineProps<{
    /** 双向绑定的文件 URL（单文件）或文件数组 */
    modelValue?: string | string[] | ProUploadFile[];
    /** 上传 action URL */
    action: string;
    /** 上传字段名 */
    name?: string;
    /** 额外 headers，默认带 Authorization */
    headers?: Record<string, string>;
    /** 额外 form data */
    data?: Record<string, any>;
    /** 是否带 cookies */
    withCredentials?: boolean;
    /** 是否多选 */
    multiple?: boolean;
    /** 文件类型限制 accept */
    accept?: string;
    /** 最大文件数 */
    limit?: number;
    /** 最大文件大小（MB） */
    maxSize?: number;
    /** 上传按钮文案 */
    buttonText?: string;
    /** 拖拽提示主文案 */
    dragText?: string;
    dragLinkText?: string;
    /** 底部提示 */
    tip?: string;
    /** 模式 */
    mode?: "file" | "image" | "image-card" | "drag";
    /** 禁用 */
    disabled?: boolean;
    /** 响应里取 URL 的字段路径，如 'data.url' */
    responseUrlKey?: string;
  }>(),
  {
    name: "file",
    multiple: false,
    limit: 0,
    mode: "file",
    buttonText: "Upload",
    responseUrlKey: "data.url",
    withCredentials: false,
    disabled: false,
  },
);

const emit = defineEmits<{
  (e: "update:modelValue", val: any): void;
  (e: "success", url: string, response: any, file: UploadFile): void;
  (e: "error", err: any, file: UploadFile): void;
  (e: "remove", file: UploadFile): void;
  (e: "change", files: UploadFiles): void;
}>();

const uploadRef = ref();

// ---- headers ---- 默认带 Authorization
const mergedHeaders = computed(() => {
  const h: Record<string, string> = { ...props.headers };
  if (!h.Authorization) {
    const token = Session.get("token");
    if (token) h.Authorization = `Bearer ${token}`;
  }
  return h;
});

// ---- fileList 内部 / 外部双向 ----
const fileList = ref<UploadFile[]>([]);

const normalize = (val: any): UploadFile[] => {
  if (!val) return [];
  const list = Array.isArray(val) ? val : [val];
  return list.filter(Boolean).map((it: any, i): UploadFile => {
    if (typeof it === "string") {
      return {
        name: it.split("/").pop() || `file-${i}`,
        url: it,
        uid: -(i + 1),
        status: "success",
      } as UploadFile;
    }
    return {
      name: it.name || (it.url && it.url.split("/").pop()) || `file-${i}`,
      url: it.url,
      uid: it.uid ?? -(i + 1),
      status: it.status || "success",
      ...it,
    } as UploadFile;
  });
};

watch(
  () => props.modelValue,
  (v) => {
    fileList.value = normalize(v);
  },
  { immediate: true, deep: true },
);

// ---- 同步出去 ----
const syncOut = () => {
  const urls = fileList.value.map((f) => f.url || "").filter(Boolean);
  if (props.multiple || (props.limit && props.limit > 1)) {
    emit("update:modelValue", urls);
  } else {
    emit("update:modelValue", urls[0] || "");
  }
  emit("change", fileList.value as UploadFiles);
};

// ---- 钩子 ----
const onBeforeUpload = (file: UploadRawFile): boolean | Promise<any> => {
  if (props.maxSize && file.size / 1024 / 1024 > props.maxSize) {
    ElMessage.error(`File size cannot exceed ${props.maxSize} MB`);
    return false;
  }
  return true;
};

const pickUrl = (response: any): string => {
  if (!response) return "";
  return (
    props.responseUrlKey
      .split(".")
      .reduce((o: any, k) => (o == null ? undefined : o[k]), response) || ""
  );
};

const onSuccess = (response: any, file: UploadFile) => {
  const url = pickUrl(response);
  if (url) {
    file.url = url;
  }
  // 标记成功 + 同步 file 列表
  file.status = "success";
  const list = uploadRef.value?.fileList || fileList.value;
  fileList.value = [...list];
  syncOut();
  emit("success", url, response, file);
};

const onError = (err: any, file: UploadFile) => {
  ElMessage.error("Upload failed");
  emit("error", err, file);
};

const onRemove = (file: UploadFile) => {
  fileList.value = (uploadRef.value?.fileList || fileList.value).filter(
    (f: UploadFile) => f.uid !== file.uid,
  );
  syncOut();
  emit("remove", file);
};

const onExceed = () => {
  if (props.limit) ElMessage.warning(`Upload up to ${props.limit} files`);
};

const onProgress = (_evt: UploadProgressEvent, _file: UploadFile) => {
  // EP 自带进度条
};

// ---- 图片预览 ----
const previewVisible = ref(false);
const previewUrl = ref("");
const previewTitle = ref("");
const onPreview = (file: UploadFile) => {
  if (props.mode === "image" || props.mode === "image-card") {
    previewUrl.value = file.url || "";
    previewTitle.value = file.name || "Preview";
    previewVisible.value = true;
  } else if (file.url) {
    window.open(file.url, "_blank");
  }
};

defineExpose({
  uploadRef,
  clearFiles: () => uploadRef.value?.clearFiles?.(),
  submit: () => uploadRef.value?.submit?.(),
});
</script>

<style scoped>
.pro-upload {
  display: inline-block;
  width: 100%;
}
.pro-upload.is-disabled {
  opacity: 0.6;
  pointer-events: none;
}

/* ---- 提示文字 ---- */
.pro-upload__tip {
  margin-top: 6px;
  color: var(--cc-color-text-3);
  font-size: var(--cc-font-12);
  line-height: 1.5;
}

/* ---- 图片卡片模式 ---- */
.pro-upload :deep(.el-upload--picture-card) {
  width: 96px;
  height: 96px;
  border-radius: var(--cc-radius-md);
  border: 1px dashed var(--cc-color-border);
  background: var(--cc-color-bg);
  color: var(--cc-color-text-3);
  transition:
    border-color 0.18s ease,
    background 0.18s ease,
    color 0.18s ease;
}
.pro-upload :deep(.el-upload--picture-card:hover) {
  border-color: var(--cc-color-primary);
  background: var(--cc-color-primary-softer);
  color: var(--cc-color-primary);
}
.pro-upload :deep(.el-upload-list--picture-card .el-upload-list__item) {
  width: 96px;
  height: 96px;
  border-radius: var(--cc-radius-md);
  border: 1px solid var(--cc-color-border-light);
}
.pro-upload__icon {
  font-size: 24px;
}

/* ---- 拖拽模式 ---- */
.pro-upload :deep(.el-upload-dragger) {
  padding: var(--cc-space-7) var(--cc-space-5);
  background: var(--cc-color-bg);
  border: 1px dashed var(--cc-color-border);
  border-radius: var(--cc-radius-lg);
  transition:
    border-color 0.18s ease,
    background 0.18s ease;
}
.pro-upload :deep(.el-upload-dragger:hover) {
  border-color: var(--cc-color-primary);
  background: var(--cc-color-primary-softer);
}
.pro-upload :deep(.el-upload-dragger.is-dragover) {
  border-color: var(--cc-color-primary);
  background: var(--cc-color-primary-soft);
}
.pro-upload__drag-icon {
  font-size: 48px;
  color: var(--cc-color-text-3);
  margin-bottom: var(--cc-space-3);
}
.pro-upload__drag-text {
  color: var(--cc-color-text-2);
  font-size: var(--cc-font-13);
}
.pro-upload__drag-text em {
  color: var(--cc-color-primary);
  font-style: normal;
  font-weight: 500;
  margin-left: 4px;
}

/* ---- 图片预览 ---- */
.pro-upload__preview-img {
  width: 100%;
  display: block;
}

/* ---- 文件列表 hover 删除按钮 ---- */
.pro-upload :deep(.el-upload-list__item) {
  transition: background 0.18s ease;
}
.pro-upload :deep(.el-upload-list__item:hover) {
  background: var(--cc-color-surface-hover);
}
</style>
