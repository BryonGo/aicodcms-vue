import request from "/@/utils/request";

// 获取CMS设置
export function getCmsSetting() {
  return request({
    url: "/api/v1/admin/setting/get",
    method: "get",
  });
}

// 保存CMS设置
export function setCmsSetting(data: object) {
  return request({
    url: "/api/v1/admin/setting/set",
    method: "post",
    data: data,
  });
}

// ---- 动态表单 Schema 接口 ----

// 获取动态表单字段列表
export function getCmsSettingFields() {
  return request({
    url: "/api/v1/admin/setting/fields",
    method: "get",
  });
}

// 保存动态表单字段值
export function saveCmsSettingFields(values: Record<string, any>) {
  return request({
    url: "/api/v1/admin/setting/save-fields",
    method: "post",
    data: { values },
  });
}

// ---- 分组管理接口 ----

// 获取分组列表（树形）
export function listSettingGroup() {
  return request({
    url: "/api/v1/admin/setting/group/list",
    method: "get",
  });
}

// 新增分组
export function addSettingGroup(data: object) {
  return request({
    url: "/api/v1/admin/setting/group/add",
    method: "post",
    data,
  });
}

// 编辑分组
export function editSettingGroup(data: object) {
  return request({
    url: "/api/v1/admin/setting/group/edit",
    method: "put",
    data,
  });
}

// 删除分组
export function delSettingGroup(id: number) {
  return request({
    url: "/api/v1/admin/setting/group/del",
    method: "delete",
    data: { id },
  });
}

// 按分组查询字段列表
export function listSettingFieldByGroup(groupId: number) {
  return request({
    url: "/api/v1/admin/setting/field/list-by-group",
    method: "get",
    params: { group_id: groupId },
  });
}

// 切换系统默认语言（后端 gi18n 语言 + 持久化到 cms.yaml）
export function setLanguage(lang: string) {
  return request({
    url: "/api/v1/admin/setting/set-language",
    method: "post",
    data: { lang },
  });
}

// 获取系统默认语言（从 cms.yaml 配置读取，非硬编码）
export function getDefaultLanguage(): Promise<string> {
  return new Promise((resolve) => {
    getCmsSetting()
      .then((res: any) => {
        const lang = res?.data?.i18n?.default_language;
        resolve(lang || "zh-CN");
      })
      .catch(() => resolve("zh-CN"));
  });
}

// ---- 语言管理接口 ----

export interface LanguageInfo {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  rtl: boolean;
  enabled: boolean;
}

// 获取语言目录（filter=all 全量 / filter=active 仅激活）
export function getLanguageCatalog(filter?: string) {
  return request({
    url: "/api/v1/admin/setting/languages",
    method: "get",
    params: filter ? { filter } : undefined,
  });
}

// 激活语言
export function activateLanguage(code: string) {
  return request({
    url: "/api/v1/admin/setting/language/activate",
    method: "post",
    data: { code },
  });
}

// 停用语言
export function deactivateLanguage(code: string) {
  return request({
    url: "/api/v1/admin/setting/language/deactivate",
    method: "post",
    data: { code },
  });
}
