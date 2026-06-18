/** 文件/目录信息 */
export interface MinioFileInfo {
  key: string;
  size: number;
  size_format: string;
  last_modified: string;
  content_type: string;
  is_dir: boolean;
}

/** 存储桶信息 */
export interface MinioBucketInfo {
  name: string;
  creation_date: string;
}

/** 面包屑节点 */
export interface BreadcrumbItem {
  name: string;
  prefix: string;
}

/** 上传队列项 */
export interface UploadItem {
  raw: File;
  targetPath: string;
  displayName: string;
  status: "pending" | "uploading" | "done" | "error";
  progress: number;
  error?: string;
}

/** 标签 */
export interface FileTag {
  key: string;
  value: string;
}
