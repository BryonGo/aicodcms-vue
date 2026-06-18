import type { MinioFileInfo } from "./types";

/** 从对象路径中提取显示名称 */
export function displayName(key: string): string {
  const parts = key.split("/").filter(Boolean);
  return parts[parts.length - 1] || key;
}

/** 将 Go *url.URL JSON 对象转为字符串 */
export function urlObjToStr(obj: any): string {
  if (typeof obj === "string") return obj;
  if (!obj) return "";
  if (obj.Scheme && obj.Host) {
    let s = obj.Scheme + "://" + obj.Host + (obj.Path || "");
    if (obj.RawQuery) s += "?" + obj.RawQuery;
    return s;
  }
  return "";
}

/** 格式化文件大小字节为人类可读格式 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

/** 判断文件是否为图片类型（仅MIME） */
export function isImageType(mime: string): boolean {
  return [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/bmp",
    "image/svg+xml",
  ].includes(mime);
}

const IMG_EXTS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".webp",
  ".bmp",
  ".svg",
  ".ico",
  ".tif",
  ".tiff",
  ".avif",
]);

/** 通过文件扩展名判断图片（MIME缺失时的兜底） */
export function isImageByExtension(key: string): boolean {
  const idx = key.lastIndexOf(".");
  if (idx < 0) return false;
  return IMG_EXTS.has(key.slice(idx).toLowerCase());
}

/** 综合判断是否为图片文件：MIME类型 + 扩展名双保险 */
export function isImageFile(mime: string, key: string): boolean {
  return isImageType(mime) || isImageByExtension(key);
}

/** 判断文件是否为可预览的文本类型 */
export function isPreviewable(mime: string): boolean {
  return isImageType(mime) || ["application/pdf", "text/plain", "text/html"].includes(mime);
}

/** 区分文件图标的类型类别 */
export function getFileCategory(mime: string): string {
  if (!mime) return "unknown";
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  if (mime.startsWith("audio/")) return "audio";
  if (mime === "application/pdf") return "pdf";
  if (mime.includes("zip") || mime.includes("rar") || mime.includes("tar") || mime.includes("7z"))
    return "archive";
  if (mime.startsWith("text/")) return "text";
  return "other";
}

/** 从列表中统计文件总数和总大小 */
export function summarizeFiles(files: MinioFileInfo[]): { count: number; totalSize: number } {
  let totalSize = 0;
  let count = 0;
  for (const f of files) {
    if (!f.is_dir) {
      count++;
      totalSize += f.size;
    }
  }
  return { count, totalSize };
}

/** 延迟函数 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
