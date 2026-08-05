import request from "/@/utils/request";
import { ElMessage } from "element-plus";
import { useI18n } from "vue-i18n";

// ==================== 类型定义 ====================

export interface UploadResult {
  url: string;
  name: string;
  size: number;
  isImage: boolean;
  storage?: string;
}

export interface UploadConfig {
  storage: string;
  supports_direct_put: boolean;
  direct_put_max_size: number;
  max_image_size: string;
  max_file_size: string;
  allowed_image_types: string;
  allowed_file_types: string;
}

interface PresignedPutInfo {
  upload_url: string;
  object_path: string;
  full_path: string;
  storage: string;
}

/** 分片上传初始化响应 */
export interface MultipartInitResult {
  upload_id: string;
  object_key: string;
  chunk_size: number;
  chunk_num: number;
  mode: "proxy" | "direct";
  storage: string;
}

/** 分片状态 */
export interface MultipartPartInfo {
  part_number: number;
  e_tag: string;
  size: number;
}

export interface MultipartStatusResult {
  upload_id: string;
  status: string;
  uploaded_parts: MultipartPartInfo[];
  missing_parts: number[];
  chunk_num: number;
}

export interface MultipartPresignedResult {
  part_number: number;
  presigned_url: string;
  expires_in: number;
}

// ==================== 配置 ====================

let configCache: UploadConfig | null = null;

/** 获取上传配置（缓存 60 秒） */
export async function getConfig(): Promise<UploadConfig> {
  if (configCache) return configCache;
  try {
    const res: any = await request({ url: "/api/v1/addon/upload/config", method: "get" });
    configCache = (res.data || res) as UploadConfig;
    setTimeout(() => {
      configCache = null;
    }, 60000);
    return configCache as UploadConfig;
  } catch {
    return {
      storage: "local",
      supports_direct_put: false,
      direct_put_max_size: 0,
      max_image_size: "",
      max_file_size: "",
      allowed_image_types: "",
      allowed_file_types: "",
    };
  }
}

// ==================== 上传（服务器中转） ====================

/** 上传单个文件（中转模式，自动检测图片/文件） */
export async function upload(file: File): Promise<UploadResult> {
  const fd = new FormData();
  fd.append("file", file);
  const res: any = await request({ url: "/api/v1/addon/upload", method: "post", data: fd });
  const d = res.data || res;
  return {
    url: d.full_path,
    name: d.name || file.name,
    size: d.size || file.size,
    isImage:
      d.is_image ?? /\.(avif|bmp|gif|heic|heif|ico|jpe?g|png|psd|svg|tiff?|webp)$/i.test(file.name),
    storage: d.storage,
  };
}

/** 上传多个文件（中转模式） */
export async function uploadMultiple(files: File[]): Promise<UploadResult[]> {
  const fd = new FormData();
  for (const f of files) fd.append("file", f);
  const res: any = await request({
    url: "/api/v1/addon/upload/multiple",
    method: "post",
    data: fd,
  });
  const list = res.data || res;
  if (!Array.isArray(list)) return [];
  return list.map((d: any) => ({
    url: d.full_path,
    name: d.name,
    size: d.size,
    isImage: d.is_image,
    storage: d.storage,
  }));
}

// ==================== 客户端直传 ====================

/** 获取直传预签名 URL */
async function getPresignedPutUrl(
  filename: string,
  contentType?: string,
): Promise<PresignedPutInfo> {
  const params: any = { file_name: filename };
  if (contentType) params.content_type = contentType;
  const res: any = await request({
    url: "/api/v1/addon/upload/presigned-put",
    method: "get",
    params,
  });
  return res.data || res;
}

/** 直传文件到存储 */
async function directPut(url: string, file: File): Promise<void> {
  const r = await fetch(url, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
  if (!r.ok) throw new Error(`直传失败 HTTP ${r.status}`);
}

/** 注册直传完成的文件 */
async function registerDirect(info: PresignedPutInfo, file: File): Promise<UploadResult> {
  const fd = new FormData();
  fd.append("object_path", info.object_path);
  fd.append("full_path", info.full_path);
  fd.append("file_name", file.name);
  fd.append("file_size", String(file.size));
  fd.append("content_type", file.type);
  fd.append("storage", info.storage);
  const res: any = await request({
    url: "/api/v1/addon/upload/register",
    method: "post",
    data: fd,
  });
  const d = res.data || res;
  return {
    url: d.full_path,
    name: d.name || file.name,
    size: d.size || file.size,
    isImage: d.is_image,
    storage: d.storage,
  };
}

// ==================== 分片上传 ====================

/** 初始化分片上传 */
async function multipartInit(
  fileName: string,
  fileSize: number,
  contentType: string,
  fileMd5: string,
  chunkSize: number,
): Promise<MultipartInitResult> {
  const res: any = await request({
    url: "/api/v1/addon/upload/multipart/init",
    method: "post",
    data: {
      file_name: fileName,
      file_size: fileSize,
      content_type: contentType,
      file_md5: fileMd5,
      chunk_size: chunkSize,
    },
  });
  return res.data || res;
}

/** 查询分片上传状态 */
export async function multipartStatus(uploadId: string): Promise<MultipartStatusResult> {
  const res: any = await request({
    url: "/api/v1/addon/upload/multipart/status",
    method: "get",
    params: { upload_id: uploadId },
  });
  return res.data || res;
}

/** 获取单个分片的预签名 URL */
async function multipartPresigned(
  uploadId: string,
  partNumber: number,
): Promise<MultipartPresignedResult> {
  const res: any = await request({
    url: "/api/v1/addon/upload/multipart/presigned",
    method: "get",
    params: { upload_id: uploadId, part_number: partNumber },
  });
  return res.data || res;
}

/** 直传一个分片到云存储 */
async function multipartDirectPart(url: string, chunk: Blob): Promise<string> {
  const r = await fetch(url, {
    method: "PUT",
    body: chunk,
    headers: { "Content-Type": "application/octet-stream" },
  });
  if (!r.ok) throw new Error(`分片直传失败 HTTP ${r.status}`);
  return r.headers.get("ETag") || "";
}

/** 合并分片 */
async function multipartMerge(
  uploadId: string,
  parts: { part_number: number; e_tag: string; size: number }[],
): Promise<UploadResult> {
  const res: any = await request({
    url: "/api/v1/addon/upload/multipart/merge",
    method: "post",
    data: { upload_id: uploadId, parts },
  });
  const d = res.data || res;
  return {
    url: d.full_path,
    name: d.file_name,
    size: d.file_size,
    isImage: d.is_image,
    storage: d.storage,
  };
}

/** 取消分片上传 */
export async function multipartAbort(uploadId: string): Promise<void> {
  await request({
    url: "/api/v1/addon/upload/multipart/abort",
    method: "post",
    data: { upload_id: uploadId },
  });
}

// ==================== 大文件分片直传 ====================

/** 默认分片大小 16MB */
const DEFAULT_CHUNK_SIZE = 16 * 1024 * 1024;

/** 直传整文件阈值 128MB，超过走分片 */
const DIRECT_PART_THRESHOLD = 128 * 1024 * 1024;

/** 计算文件 MD5（Web Crypto API） */
async function computeFileMd5(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  const hashBuf = await crypto.subtle.digest("SHA-256", buf);
  const hashArr = Array.from(new Uint8Array(hashBuf));
  return hashArr.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * 大文件分片直传
 * - 初始化分片上传 → 逐分片获取预签名 URL → 直传 → 合并
 */
async function multipartDirectUpload(file: File, onProgress?: (pct: number) => void): Promise<UploadResult> {
  const fileMd5 = await computeFileMd5(file);
  const chunkSize = DEFAULT_CHUNK_SIZE;
  const init = await multipartInit(file.name, file.size, file.type, fileMd5, chunkSize);

  if (init.mode !== "direct") {
    throw new Error("存储引擎不支持分片直传，请使用服务器中转模式");
  }

  const parts: { part_number: number; e_tag: string; size: number }[] = [];
  const totalChunks = init.chunk_num;
  let uploadedBytes = 0;

  for (let i = 1; i <= totalChunks; i++) {
    const start = (i - 1) * chunkSize;
    const end = Math.min(start + chunkSize, file.size);
    const chunk = file.slice(start, end);

    const presigned = await multipartPresigned(init.upload_id, i);
    const etag = await multipartDirectPart(presigned.presigned_url, chunk);

    parts.push({ part_number: i, e_tag: etag, size: chunk.size });
    uploadedBytes += chunk.size;
    if (onProgress) onProgress(Math.round((uploadedBytes / file.size) * 100));
  }

  return await multipartMerge(init.upload_id, parts);
}

// ==================== 智能上传（自动路由） ====================

/**
 * 智能上传 — 自动选择最优路径
 * - ≤128MB + S3 → 客户端整文件直传
 * - >128MB + S3 → 客户端分片直传
 * - 其他 → 服务器中转
 * - 直传/分片直传失败自动降级到服务器中转
 */
export async function smartUpload(
  file: File,
  onProgress?: (pct: number) => void,
): Promise<UploadResult> {
  try {
    const cfg = await getConfig();

    if (cfg.supports_direct_put) {
      // 大文件走分片直传
      if (file.size > DIRECT_PART_THRESHOLD) {
        try {
          return await multipartDirectUpload(file, onProgress);
        } catch (e: any) {
          console.warn("分片直传失败，降级到服务器中转:", e.message);
          return await upload(file);
        }
      }

      // 小文件走整文件直传
      if (file.size <= cfg.direct_put_max_size) {
        try {
          const info = await getPresignedPutUrl(file.name, file.type);
          await directPut(info.upload_url, file);
          return await registerDirect(info, file);
        } catch (e: any) {
          if (e.message?.includes("直传失败")) {
            return await upload(file);
          }
          throw e;
        }
      }
    }

    return await upload(file);
  } catch (err: any) {
    ElMessage.error(`上传失败：${file.name}`);
    throw err;
  }
}

// ==================== 资源管理 ====================

export function listUploads(query: {
  page_num?: number;
  page_size?: number;
  keyword?: string;
  image_type?: string;
  storage?: string;
}) {
  return request({ url: "/api/v1/addon/upload/list", method: "get", params: query });
}

export function deleteUploads(ids: number[]) {
  return request({ url: "/api/v1/addon/upload/del", method: "delete", data: { ids } });
}

export function editUpload(data: { id: number; src_filename?: string }) {
  return request({ url: "/api/v1/addon/upload/edit", method: "put", data });
}

/** 获取附件预览 URL */
export function getPresignedUrl(id: number) {
  return request({ url: "/api/v1/addon/upload/presigned-url", method: "get", params: { id } });
}
