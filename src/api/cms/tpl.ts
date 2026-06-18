import request from "/@/utils/request";

// 文件列表（path 可选，不传则返回主题根目录列表）
export function listTemplateFiles(path?: string) {
  return request({
    url: "/api/v1/admin/tpl/files/list",
    method: "get",
    params: path ? { path } : {},
  });
}

// 读取文件
export function readTemplateFile(path: string) {
  return request({
    url: "/api/v1/admin/tpl/files/read",
    method: "get",
    params: { path },
  });
}

// 保存文件
export function saveTemplateFile(path: string, content: string) {
  return request({
    url: "/api/v1/admin/tpl/files/save",
    method: "put",
    data: { path, content },
  });
}

// 创建文件/目录
export function createTemplateItem(path: string, name: string, isDir: boolean) {
  return request({
    url: "/api/v1/admin/tpl/files/create",
    method: "post",
    data: { path, name, is_dir: isDir },
  });
}

// 删除文件/目录
export function deleteTemplateItem(path: string) {
  return request({
    url: "/api/v1/admin/tpl/files/delete",
    method: "delete",
    data: { path },
  });
}

// 重命名
export function renameTemplateItem(path: string, newName: string) {
  return request({
    url: "/api/v1/admin/tpl/files/rename",
    method: "put",
    data: { path, new_name: newName },
  });
}

// 获取指定频道类型的模板文件选项（后端处理路径映射）
export function listTemplateFilesByType(type: string) {
  return request({
    url: "/api/v1/admin/tpl/files/options",
    method: "get",
    params: { type },
  });
}

// ==================== 标签生成器 ====================

// 获取标签函数目录
export function getTagCatalog() {
  return request({
    url: "/api/v1/admin/tpl/tag/catalog",
    method: "get",
  });
}

// 预览标签生成
export function previewTag(data: Record<string, any>) {
  return request({
    url: "/api/v1/admin/tpl/tag/preview",
    method: "post",
    data,
  });
}

// 获取动态参数选项
export function getDynamicParams(paramName: string) {
  return request({
    url: "/api/v1/admin/tpl/tag/dynamic-params",
    method: "get",
    params: { param_name: paramName },
  });
}
