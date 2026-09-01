import request from "/@/utils/request";

// ===== 云厂商 =====

export const S3_PROVIDERS = [
  { value: "minio.s3", label: "MinIO" },
  { value: "tencent.cos", label: "Tencent COS" },
  { value: "aliyun.oss", label: "Aliyun OSS" },
  { value: "qiniu.kodo", label: "Qiniu Kodo" },
  { value: "baidu.bos", label: "Baidu BOS" },
  { value: "google.gcs", label: "Google GCS" },
] as const;

// ===== 文件操作 =====

export function listMinioFiles(query: { prefix?: string; marker?: string; max_keys?: number; provider?: string }) {
  return request({
    url: "/api/v1/addon/minio/list",
    method: "get",
    params: query,
  });
}

export function deleteMinioFile(fileName: string, provider?: string) {
  return request({
    url: "/api/v1/addon/minio/del",
    method: "delete",
    data: { file_name: fileName, provider },
  });
}

export function statMinioFile(fileName: string, provider?: string) {
  return request({
    url: "/api/v1/addon/minio/stat",
    method: "get",
    params: { "file-name": fileName, provider },
  });
}

export function presignedGetUrl(fileName: string, provider?: string) {
  return request({
    url: "/api/v1/addon/minio/presigned-get",
    method: "get",
    params: { "file-name": fileName, provider },
  });
}

export function presignedViewUrl(fileName: string, provider?: string) {
  return request({
    url: "/api/v1/addon/minio/presigned-view",
    method: "get",
    params: { "file-name": fileName, provider },
  });
}

export function presignedPutUrl(fileName: string, provider?: string) {
  return request({
    url: "/api/v1/addon/minio/presigned-put",
    method: "get",
    params: { "file-name": fileName, provider },
  });
}

export function mkdirMinioDir(path: string, provider?: string) {
  return request({
    url: "/api/v1/addon/minio/mkdir",
    method: "post",
    data: { path, provider },
  });
}

export function copyMinioObject(src: string, dest: string, move = false, provider?: string) {
  return request({
    url: "/api/v1/addon/minio/copy",
    method: "post",
    data: { src, dest, move, provider },
  });
}

export function batchDeleteMinioFiles(keys: string[], provider?: string) {
  return request({
    url: "/api/v1/addon/minio/batch-del",
    method: "delete",
    data: { keys, provider },
  });
}

// ===== 存储桶操作 =====

export function getMinioBuckets(provider?: string) {
  return request({
    url: "/api/v1/addon/minio/buckets",
    method: "get",
    params: { provider },
  });
}

// ===== 对象标签 =====

export function getMinioTags(fileName: string, provider?: string) {
  return request({
    url: "/api/v1/addon/minio/tagging",
    method: "get",
    params: { "file-name": fileName, provider },
  });
}

export function setMinioTags(fileName: string, tags: { key: string; value: string }[], provider?: string) {
  return request({
    url: "/api/v1/addon/minio/tagging",
    method: "put",
    data: { "file-name": fileName, tags, provider },
  });
}

export function deleteMinioTags(fileName: string, keys: string[], provider?: string) {
  return request({
    url: "/api/v1/addon/minio/tagging",
    method: "delete",
    data: { "file-name": fileName, keys, provider },
  });
}

// ===== 桶设置 =====

export function getBucketSettings(provider?: string) {
  return request({
    url: "/api/v1/addon/minio/bucket/settings",
    method: "get",
    params: { provider },
  });
}

export function setBucketVersioning(enabled: boolean, provider?: string) {
  return request({
    url: "/api/v1/addon/minio/bucket/versioning",
    method: "post",
    data: { enabled, provider },
  });
}

export function getBucketLifecycle(provider?: string) {
  return request({
    url: "/api/v1/addon/minio/bucket/lifecycle",
    method: "get",
    params: { provider },
  });
}

export function setBucketLifecycle(rules: any[], provider?: string) {
  return request({
    url: "/api/v1/addon/minio/bucket/lifecycle",
    method: "post",
    data: { rules, provider },
  });
}

// ===== 桶策略 =====

export function getBucketPolicy(provider?: string) {
  return request({
    url: "/api/v1/addon/minio/bucket/policy",
    method: "get",
    params: { provider },
  });
}

export function setBucketPolicy(data: { mode: string; policy?: string; allow_domains?: string[] }, provider?: string) {
  return request({
    url: "/api/v1/addon/minio/bucket/policy",
    method: "post",
    data: { ...data, provider },
  });
}

// ===== 桶加密 =====

export function setBucketEncryption(provider?: string) {
  return request({
    url: "/api/v1/addon/minio/bucket/encryption",
    method: "post",
    data: { provider },
  });
}

export function removeBucketEncryption(provider?: string) {
  return request({
    url: "/api/v1/addon/minio/bucket/encryption",
    method: "delete",
    data: { provider },
  });
}

// ===== 站点私有存储（每站独立桶 + 独立 AK/SK，SK 永不回传） =====

export interface SiteStorageStatus {
  site_id: number;
  provider: string;
  endpoint: string;
  bucket: string;
  region: string;
  cdn_url: string;
  access_key: string;
  has_credentials: boolean;
  status: "pending" | "provisioning" | "ready" | "failed";
  message: string;
  provisioned_at: number;
  updated_at: number;
}

export interface SiteStorageTestResult {
  site_id: number;
  provider: string;
  bucket: string;
  put_ok: boolean;
  get_ok: boolean;
  presign_ok: boolean;
  delete_ok: boolean;
  cross_bucket_denied: boolean;
  status: "pending" | "provisioning" | "ready" | "failed";
  message: string;
  elapsed_ms: number;
}

// 当前站点私有存储状态（AK 打码）
export function getSiteStorageStatus(provider = "minio.s3") {
  return request({
    url: "/api/v1/addon/minio/site/storage/status",
    method: "get",
    params: { provider },
  });
}

// 幂等初始化当前站点私有存储（不重建桶、不轮换在用凭据）
export function provisionSiteStorage(data: { bucket?: string; endpoint?: string; provider?: string } = {}) {
  return request({
    url: "/api/v1/addon/minio/site/storage/provision",
    method: "post",
    data,
  });
}

// 探测当前站点存储（Put/Get/预签名/Delete + 跨桶隔离）
export function testSiteStorage(provider = "minio.s3") {
  return request({
    url: "/api/v1/addon/minio/site/storage/test",
    method: "post",
    data: { provider },
  });
}

// 轮换当前站点存储凭据（新凭据验证失败自动回滚）
export function rotateSiteStorage(provider = "minio.s3") {
  return request({
    url: "/api/v1/addon/minio/site/storage/rotate",
    method: "post",
    data: { provider },
  });
}

// 绑定既有站点存储凭据（导入运维侧已生成的 AK/SK）
export function bindSiteStorage(data: {
  endpoint: string;
  bucket: string;
  region?: string;
  cdn_url?: string;
  access_key: string;
  secret_key: string;
  provider?: string;
}) {
  return request({
    url: "/api/v1/addon/minio/site/storage/bind",
    method: "post",
    data,
  });
}
