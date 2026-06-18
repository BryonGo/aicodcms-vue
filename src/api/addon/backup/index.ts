import request from "/@/utils/request";

export function listBackups() {
  return request({
    url: "/api/v1/addon/backup/backup/list",
    method: "get",
  });
}

export function getBackupDrivers() {
  return request({
    url: "/api/v1/addon/backup/backup/drivers",
    method: "get",
  });
}

export function createBackup(driver: string) {
  return request({
    url: "/api/v1/addon/backup/backup/create",
    method: "post",
    data: { driver },
  });
}

export function deleteBackup(fileName: string) {
  return request({
    url: "/api/v1/addon/backup/backup/del",
    method: "delete",
    data: { file_name: fileName },
  });
}

export function downloadBackup(fileName: string) {
  return request({
    url: "/api/v1/addon/backup/backup/download",
    method: "get",
    params: { file_name: fileName },
    responseType: "blob",
  });
}
