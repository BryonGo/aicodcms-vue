import request from "/@/utils/request";

// ===== 文件操作 =====

export function listMinioFiles(query: { prefix?: string; marker?: string; max_keys?: number }) {
  return request({
    url: "/api/v1/addon/minio/list",
    method: "get",
    params: query,
  });
}

export function deleteMinioFile(fileName: string) {
  return request({
    url: "/api/v1/addon/minio/del",
    method: "delete",
    data: { file_name: fileName },
  });
}

export function statMinioFile(fileName: string) {
  return request({
    url: "/api/v1/addon/minio/stat",
    method: "get",
    params: { "file-name": fileName },
  });
}

export function presignedGetUrl(fileName: string) {
  return request({
    url: "/api/v1/addon/minio/presigned-get",
    method: "get",
    params: { "file-name": fileName },
  });
}

export function presignedViewUrl(fileName: string) {
  return request({
    url: "/api/v1/addon/minio/presigned-view",
    method: "get",
    params: { "file-name": fileName },
  });
}

export function presignedPutUrl(fileName: string) {
  return request({
    url: "/api/v1/addon/minio/presigned-put",
    method: "get",
    params: { "file-name": fileName },
  });
}

export function mkdirMinioDir(path: string) {
  return request({
    url: "/api/v1/addon/minio/mkdir",
    method: "post",
    data: { path },
  });
}

export function copyMinioObject(src: string, dest: string, move = false) {
  return request({
    url: "/api/v1/addon/minio/copy",
    method: "post",
    data: { src, dest, move },
  });
}

export function batchDeleteMinioFiles(keys: string[]) {
  return request({
    url: "/api/v1/addon/minio/batch-del",
    method: "delete",
    data: { keys },
  });
}

// ===== 存储桶操作 =====

export function getMinioBuckets() {
  return request({
    url: "/api/v1/addon/minio/buckets",
    method: "get",
  });
}

// ===== 对象标签 =====

export function getMinioTags(fileName: string) {
  return request({
    url: "/api/v1/addon/minio/tagging",
    method: "get",
    params: { "file-name": fileName },
  });
}

export function setMinioTags(fileName: string, tags: { key: string; value: string }[]) {
  return request({
    url: "/api/v1/addon/minio/tagging",
    method: "put",
    data: { "file-name": fileName, tags },
  });
}

export function deleteMinioTags(fileName: string, keys: string[]) {
  return request({
    url: "/api/v1/addon/minio/tagging",
    method: "delete",
    data: { "file-name": fileName, keys },
  });
}

// ===== 桶设置 =====

export function getBucketSettings() {
  return request({
    url: "/api/v1/addon/minio/bucket/settings",
    method: "get",
  });
}

export function setBucketVersioning(enabled: boolean) {
  return request({
    url: "/api/v1/addon/minio/bucket/versioning",
    method: "post",
    data: { enabled },
  });
}

export function getBucketLifecycle() {
  return request({
    url: "/api/v1/addon/minio/bucket/lifecycle",
    method: "get",
  });
}

export function setBucketLifecycle(rules: any[]) {
  return request({
    url: "/api/v1/addon/minio/bucket/lifecycle",
    method: "post",
    data: { rules },
  });
}

// ===== 桶策略 =====

export function getBucketPolicy() {
  return request({
    url: "/api/v1/addon/minio/bucket/policy",
    method: "get",
  });
}

export function setBucketPolicy(data: { mode: string; policy?: string; allow_domains?: string[] }) {
  return request({
    url: "/api/v1/addon/minio/bucket/policy",
    method: "post",
    data,
  });
}

// ===== 桶加密 =====

export function setBucketEncryption() {
  return request({
    url: "/api/v1/addon/minio/bucket/encryption",
    method: "post",
  });
}

export function removeBucketEncryption() {
  return request({
    url: "/api/v1/addon/minio/bucket/encryption",
    method: "delete",
  });
}
