import request from "/@/utils/request";
import { ElMessage } from "element-plus";

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

// ==================== 智能上传（自动路由） ====================

/**
 * 智能上传 — 自动选择直传/中转
 * - MinIO + ≤500MB → 客户端直传（不经过服务器）
 * - 其他 → 服务器中转
 * - 直传失败自动降级到中转
 */
export async function smartUpload(file: File): Promise<UploadResult> {
  try {
    const cfg = await getConfig();
    if (cfg.supports_direct_put && file.size <= cfg.direct_put_max_size) {
      const info = await getPresignedPutUrl(file.name, file.type);
      await directPut(info.upload_url, file);
      const result = await registerDirect(info, file);
      return result;
    }
    return await upload(file);
  } catch (err: any) {
    if (err.message?.includes("直传失败")) {
      try {
        return await upload(file);
      } catch {
        /* fall through */
      }
    }
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
