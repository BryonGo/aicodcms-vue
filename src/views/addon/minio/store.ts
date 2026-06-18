import { defineStore } from "pinia";
import { ref } from "vue";
import { ElMessage } from "element-plus";
import request from "/@/utils/request";
import type { MinioFileInfo, MinioBucketInfo, BreadcrumbItem, UploadItem, FileTag } from "./types";
import {
  listMinioFiles,
  deleteMinioFile,
  presignedGetUrl,
  presignedViewUrl,
  getMinioTags,
  setMinioTags,
  deleteMinioTags,
  getBucketSettings,
  setBucketVersioning,
  setBucketLifecycle,
  getBucketPolicy,
  setBucketPolicy,
} from "/@/api/addon/minio";
import { isImageFile, urlObjToStr } from "./utils";

export const useMinioStore = defineStore("minio", () => {
  // ===== State =====
  const buckets = ref<MinioBucketInfo[]>([]);
  const currentBucket = ref("");
  const files = ref<MinioFileInfo[]>([]);
  const selectedFiles = ref<MinioFileInfo[]>([]);
  const breadcrumbs = ref<BreadcrumbItem[]>([{ name: "根目录", prefix: "" }]);
  const currentPrefix = ref("");
  const loading = ref(false);
  const isTruncated = ref(false);
  const nextMarker = ref("");
  const detailFile = ref<MinioFileInfo | null>(null);

  // 对话框可见性
  const uploadDialogVisible = ref(false);
  const newDirDialogVisible = ref(false);
  const renameDialogVisible = ref(false);
  const previewDialogVisible = ref(false);
  const settingsDrawerVisible = ref(false);

  // 上传相关
  const uploadQueue = ref<UploadItem[]>([]);
  const uploading = ref(false);

  // 重命名
  const renameTarget = ref<MinioFileInfo | null>(null);
  const renameNewName = ref("");

  // 预览
  const previewUrl = ref("");
  const previewType = ref("");
  const previewGallery = ref<MinioFileInfo[]>([]);
  const previewFileIndex = ref(-1);

  // ===== Actions =====

  /** 切换存储桶 */
  async function switchBucket(bucketName: string) {
    currentBucket.value = bucketName;
    currentPrefix.value = "";
    breadcrumbs.value = [{ name: "根目录", prefix: "" }];
    detailFile.value = null;
    selectedFiles.value = [];
    await fetchFiles();
  }

  /** 获取文件列表 */
  async function fetchFiles(params?: { marker?: string; max_keys?: number }) {
    loading.value = true;
    try {
      const res: any = await listMinioFiles({
        prefix: currentPrefix.value,
        max_keys: params?.max_keys || 500,
        marker: params?.marker || "",
      });
      const data = res.data || res;
      files.value = data.files || [];
      isTruncated.value = !!data.is_truncated;
      nextMarker.value = data.next_marker || "";
    } catch (err: any) {
      console.error("[MinIO] 获取文件列表失败:", err);
      ElMessage.error("获取文件列表失败");
    } finally {
      loading.value = false;
    }
  }

  /** 加载更多（分页） */
  async function loadMore() {
    if (!isTruncated.value || !nextMarker.value) return;
    await fetchFiles({ marker: nextMarker.value });
  }

  /** 重置到根目录 */
  function resetToRoot() {
    currentPrefix.value = "";
    breadcrumbs.value = [{ name: "根目录", prefix: "" }];
    detailFile.value = null;
    selectedFiles.value = [];
    fetchFiles();
  }

  /** 进入目录 */
  function enterDir(key: string) {
    currentPrefix.value = key;
    breadcrumbs.value.push({
      name: displayName(key),
      prefix: key,
    });
    detailFile.value = null;
    selectedFiles.value = [];
    fetchFiles();
  }

  /** 导航到面包屑指定层级 */
  function navigateTo(prefix: string) {
    currentPrefix.value = prefix;
    const idx = breadcrumbs.value.findIndex((c) => c.prefix === prefix);
    if (idx >= 0) breadcrumbs.value = breadcrumbs.value.slice(0, idx + 1);
    detailFile.value = null;
    selectedFiles.value = [];
    fetchFiles();
  }

  /** 添加文件到上传队列 */
  function addToUploadQueue(file: File, relativePath?: string) {
    const path = relativePath || file.name;
    uploadQueue.value.push({
      raw: file,
      targetPath: currentPrefix.value + path,
      displayName: path,
      status: "pending",
      progress: 0,
    });
  }

  /** 从上传队列移除 */
  function removeFromQueue(index: number) {
    uploadQueue.value.splice(index, 1);
  }

  /** 清空上传队列 */
  function clearQueue() {
    uploadQueue.value = [];
  }

  /** 执行上传 */
  async function startUpload() {
    if (uploadQueue.value.length === 0) {
      ElMessage.warning("请选择文件");
      return;
    }
    uploading.value = true;

    let successCount = 0;
    for (const item of uploadQueue.value) {
      item.status = "uploading";
      const form = new FormData();
      form.append("file-name", item.raw);
      form.append("type", "100");
      form.append("path", item.targetPath);
      try {
        await request({
          url: "/api/v1/addon/minio/put",
          method: "put",
          data: form,
          onUploadProgress: (e: ProgressEvent) => {
            if (e.total) item.progress = Math.round((e.loaded / e.total) * 100);
          },
        });
        item.status = "done";
        item.progress = 100;
        successCount++;
      } catch (err: any) {
        item.status = "error";
        item.error = err.message || "上传失败";
      }
    }
    ElMessage.success(`上传完成: ${successCount}/${uploadQueue.value.length} 个成功`);
    clearQueue();
    uploadDialogVisible.value = false;
    uploading.value = false;
    await fetchFiles();
  }

  /** 创建目录 */
  async function createDir(dirName: string) {
    const path = currentPrefix.value + dirName.replace(/\/$/, "") + "/";
    try {
      await request({
        url: "/api/v1/addon/minio/mkdir",
        method: "post",
        data: { path },
      });
      ElMessage.success("目录创建成功");
      newDirDialogVisible.value = false;
      await fetchFiles();
    } catch (err: any) {
      ElMessage.error("创建目录失败: " + (err.message || ""));
    }
  }

  /** 删除文件（单条） */
  async function deleteFile(file: MinioFileInfo) {
    try {
      await deleteMinioFile(file.key);
      ElMessage.success("删除成功");
      if (detailFile.value?.key === file.key) detailFile.value = null;
      await fetchFiles();
    } catch {
      ElMessage.error("删除失败");
    }
  }

  /** 批量删除文件（目录走递归删除，文件走批量删除） */
  async function batchDelete() {
    const items = selectedFiles.value;
    if (items.length === 0) return;
    let dirs = items.filter((f) => f.is_dir).map((f) => f.key);
    let files = items.filter((f) => !f.is_dir).map((f) => f.key);

    try {
      // 目录递归删除（逐个调用 /del）
      for (const dir of dirs) {
        await deleteMinioFile(dir);
      }
      // 文件批量删除
      if (files.length > 0) {
        await request({
          url: "/api/v1/addon/minio/batch-del",
          method: "delete",
          data: { keys: files },
        });
      }
      ElMessage.success(`成功删除 ${items.length} 项`);
      selectedFiles.value = [];
      detailFile.value = null;
      await fetchFiles();
    } catch {
      ElMessage.error("批量删除失败");
    }
  }

  /** 重命名文件 */
  async function renameFile(oldKey: string, newName: string) {
    const parts = oldKey.split("/");
    parts[parts.length - 1] = newName;
    const newKey = parts.join("/");
    try {
      await request({
        url: "/api/v1/addon/minio/copy",
        method: "post",
        data: { src: oldKey, dest: newKey, move: true },
      });
      ElMessage.success("重命名成功");
      renameDialogVisible.value = false;
      detailFile.value = null;
      await fetchFiles();
    } catch {
      ElMessage.error("重命名失败");
    }
  }

  /** 下载文件 */
  async function downloadFile(key: string) {
    try {
      const res: any = await presignedGetUrl(key);
      const url = urlObjToStr((res.data || res)["presigned-get-url"]);
      if (url) window.open(url, "_blank");
      else ElMessage.error("获取下载地址失败");
    } catch {
      ElMessage.error("获取下载地址失败");
    }
  }

  /** 复制链接 */
  async function copyFileUrl(key: string) {
    try {
      const res: any = await presignedViewUrl(key);
      const url = urlObjToStr((res.data || res)["presigned-view-url"]);
      if (url) {
        await navigator.clipboard.writeText(url);
        ElMessage.success("链接已复制");
      }
    } catch {
      ElMessage.error("获取预览链接失败");
    }
  }

  /** 预览文件（图片/PDF等），附带画廊导航支持 */
  async function previewFile(file: MinioFileInfo) {
    await loadPreviewUrl(file);
    // 设置画廊导航：当前目录下所有图片文件（MIME + 扩展名双保险）
    if (isImageFile(file.content_type, file.key)) {
      previewGallery.value = files.value.filter(
        (f) => !f.is_dir && isImageFile(f.content_type, f.key),
      );
      previewFileIndex.value = previewGallery.value.findIndex((f) => f.key === file.key);
    } else {
      previewGallery.value = [];
      previewFileIndex.value = -1;
    }
    previewDialogVisible.value = true;
  }

  /** 加载图片的签名URL */
  async function loadPreviewUrl(file: MinioFileInfo) {
    try {
      const res: any = await presignedViewUrl(file.key);
      const url = urlObjToStr((res.data || res)["presigned-view-url"]);
      if (url) {
        previewUrl.value = url;
        previewType.value = file.content_type;
      }
    } catch {
      ElMessage.error("获取预览地址失败");
    }
  }

  /** 上一张 */
  async function prevPreview() {
    if (previewGallery.value.length === 0 || previewFileIndex.value < 0) return;
    const prevIdx =
      (previewFileIndex.value - 1 + previewGallery.value.length) % previewGallery.value.length;
    previewFileIndex.value = prevIdx;
    await loadPreviewUrl(previewGallery.value[prevIdx]);
  }

  /** 下一张 */
  async function nextPreview() {
    if (previewGallery.value.length === 0 || previewFileIndex.value < 0) return;
    const nextIdx = (previewFileIndex.value + 1) % previewGallery.value.length;
    previewFileIndex.value = nextIdx;
    await loadPreviewUrl(previewGallery.value[nextIdx]);
  }

  /** 获取存储桶列表 */
  async function fetchBuckets() {
    try {
      const res: any = await request({
        url: "/api/v1/addon/minio/buckets",
        method: "get",
      });
      const data = res.data || res;
      buckets.value = data.buckets || [];
      if (buckets.value.length > 0 && !currentBucket.value) {
        currentBucket.value = data.current || buckets.value[0].name;
      }
    } catch {
      console.warn("[MinIO] 获取存储桶列表失败");
    }
  }

  // ===== TAG管理 =====

  const tags = ref<FileTag[]>([]);
  const addingTag = ref(false);
  const newTagKey = ref("");
  const newTagVal = ref("");

  async function fetchTags(fileName: string) {
    try {
      const res: any = await getMinioTags(fileName);
      tags.value = (res.data || res).tags || [];
    } catch {
      tags.value = [];
    }
  }

  async function addTag(fileName: string, key: string, value: string) {
    const newTags = [...tags.value, { key, value }];
    try {
      await setMinioTags(fileName, newTags);
      tags.value = newTags;
      ElMessage.success("标签添加成功");
    } catch {
      ElMessage.error("添加标签失败");
    }
  }

  async function removeTag(fileName: string, key: string) {
    try {
      await deleteMinioTags(fileName, [key]);
      tags.value = tags.value.filter((t) => t.key !== key);
      ElMessage.success("标签已删除");
    } catch {
      ElMessage.error("删除标签失败");
    }
  }

  // ===== 桶设置 =====

  const bucketSettings = ref<any>({
    versioning: { enabled: false },
    lifecycle: [],
    encryption: { algorithm: "" },
    policy: { is_public: false, is_private: true, policy: "", allow_domains: [] },
  });
  const settingsLoading = ref(false);

  /** 一次性获取全部桶设置（含策略） */
  async function fetchBucketSettings() {
    settingsLoading.value = true;
    try {
      const [settingsRes, policyRes] = await Promise.all([getBucketSettings(), getBucketPolicy()]);
      const settings = settingsRes.data || settingsRes;
      const policy = policyRes.data || policyRes;
      bucketSettings.value = {
        ...settings,
        policy: {
          is_public: policy.is_public ?? false,
          is_private: policy.is_private ?? true,
          policy: policy.policy ?? "",
          allow_domains: policy.allow_domains ?? [],
        },
      };
    } catch {
      console.warn("[MinIO] 获取桶设置失败");
    } finally {
      settingsLoading.value = false;
    }
  }

  async function toggleVersioning(enabled: boolean) {
    await setBucketVersioning(enabled);
    bucketSettings.value.versioning.enabled = enabled;
    ElMessage.success(enabled ? "版本控制已启用" : "版本控制已关闭");
  }

  async function saveLifecycleRules(rules: any[]) {
    await setBucketLifecycle(rules);
    bucketSettings.value.lifecycle = rules;
    ElMessage.success("生命周期规则已更新");
  }

  // ===== 桶加密 =====

  async function toggleEncryption(enabled: boolean) {
    if (enabled) {
      await request({ url: "/api/v1/addon/minio/bucket/encryption", method: "post" });
      bucketSettings.value.encryption.algorithm = "AES256";
      ElMessage.success("桶加密已开启");
    } else {
      await request({ url: "/api/v1/addon/minio/bucket/encryption", method: "delete" });
      bucketSettings.value.encryption.algorithm = "";
      ElMessage.warning("桶加密已关闭，已有加密文件仍可正常读取，新文件不再加密");
    }
  }

  // ===== 桶策略 & 防盗链 =====

  /** 设置后重新拉取最新策略状态（供 setBucketPublic/Private/Hotlink 复用） */
  async function refreshPolicy() {
    const res: any = await getBucketPolicy();
    const data = res.data || res;
    bucketSettings.value.policy = {
      is_public: data.is_public ?? false,
      is_private: data.is_private ?? true,
      policy: data.policy ?? "",
      allow_domains: data.allow_domains ?? [],
    };
  }

  async function setBucketPublic() {
    await setBucketPolicy({ mode: "public" });
    await refreshPolicy();
    ElMessage.success("桶已设为公开");
  }

  async function setBucketPrivate() {
    await setBucketPolicy({ mode: "private" });
    await refreshPolicy();
    ElMessage.success("桶已设为私有");
  }

  async function setBucketHotlink(allowDomains: string[]) {
    await setBucketPolicy({ mode: "hotlink", allow_domains: allowDomains });
    await refreshPolicy();
    ElMessage.success("防盗链规则已更新");
  }

  return {
    // state
    buckets,
    currentBucket,
    files,
    selectedFiles,
    breadcrumbs,
    currentPrefix,
    loading,
    isTruncated,
    nextMarker,
    detailFile,
    uploadDialogVisible,
    newDirDialogVisible,
    renameDialogVisible,
    previewDialogVisible,
    settingsDrawerVisible,
    uploadQueue,
    uploading,
    renameTarget,
    renameNewName,
    previewUrl,
    previewType,
    previewGallery,
    previewFileIndex,

    // tag state
    tags,
    addingTag,
    newTagKey,
    newTagVal,

    // settings state
    bucketSettings,
    settingsLoading,

    // actions
    switchBucket,
    fetchFiles,
    loadMore,
    resetToRoot,
    enterDir,
    navigateTo,
    addToUploadQueue,
    removeFromQueue,
    clearQueue,
    startUpload,
    createDir,
    deleteFile,
    batchDelete,
    renameFile,
    downloadFile,
    copyFileUrl,
    previewFile,
    prevPreview,
    nextPreview,
    fetchBuckets,

    // tag actions
    fetchTags,
    addTag,
    removeTag,

    // settings actions
    fetchBucketSettings,
    toggleVersioning,
    saveLifecycleRules,
    toggleEncryption,
    setBucketPublic,
    setBucketPrivate,
    setBucketHotlink,
  };
});

function displayName(key: string): string {
  const parts = key.split("/").filter(Boolean);
  return parts[parts.length - 1] || key;
}
