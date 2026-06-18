import { Session } from "/@/utils/storage";

/**
 * 通用js方法封装处理
 * Copyright (c) 2022 gfast
 */

// normalizeApiBaseURL 规范化 API baseURL，避免 /zh-CN/ 语言路径污染接口地址。
export function normalizeApiBaseURL(raw: unknown): string {
  const value = String(raw || "").trim();
  if (!value) return "/";
  const stripLangPath = (path: string) => path.replace(/^\/[a-z]{2}(?:-[A-Z]{2})?\/?$/, "");
  try {
    const url = new URL(value, window.location.origin);
    url.pathname = stripLangPath(url.pathname).replace(/\/+$/, "");
    const out =
      url.origin === window.location.origin ? url.pathname : url.toString().replace(/\/+$/, "");
    return out || "/";
  } catch {
    return stripLangPath(value).replace(/\/+$/, "") || "/";
  }
}

export const baseURL: string = normalizeApiBaseURL(import.meta.env.VITE_API_URL);

// buildApiUrl 构造根路径 API 地址，避免当前页面 /zh-CN/ 前缀污染上传等非 axios 请求。
export function buildApiUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return baseURL.replace(/\/+$/, "") + "/" + path.replace(/^\/+/, "");
}

/**
 * 拼接文件完整URL（处理本地路径/相对路径/绝对路径）
 * 规则：完整URL(http/https/blob)直接返回；否则按 baseURL + / + url 拼接并规范化斜杠
 */
export function getUpFileUrl(url: string) {
  if (!url) {
    return url;
  }
  if (/^https?:\/\/|^blob/i.test(url)) {
    return url;
  }
  // 规范化：baseURL 去掉尾斜杠，url 去掉头斜杠，中间加一个 /
  return buildApiUrl(url);
}

/**
 * 构造树型结构数据
 * @param {*} data 数据源
 * @param {*} id id字段 默认 'id'
 * @param {*} parent_id 父节点字段 默认 'parent_id'
 * @param {*} children 孩子节点字段 默认 'children'
 * @param {*} rootId 根Id 默认 0
 */
export function handleTree(
  data: any[],
  id: string,
  parent_id: string,
  children: string,
  rootId: number,
): any[] {
  id = id || "id";
  parent_id = parent_id || "parent_id";
  children = children || "children";
  rootId = rootId || 0;
  //对源数据深度克隆
  const cloneData = JSON.parse(JSON.stringify(data));
  //循环所有项
  const treeData = cloneData.filter((father: any) => {
    let branchArr = cloneData.filter((child: any) => {
      //返回每一项的子级数组
      return father[id] === child[parent_id];
    });
    if (branchArr.length > 0) father[children] = branchArr;
    //返回第一层
    return father[parent_id] === rootId;
  });
  return treeData != "" ? treeData : data;
}

// 回显数据字典
export function selectDictLabel(data: any[], value: string): string {
  if (!Array.isArray(data)) return value ?? "";
  let actions: string[] = [];
  data.map((item) => {
    if (item.value == value) {
      actions.push(item.label);
      return false;
    }
  });
  return actions.join("");
}

export function getToken(): string {
  return Session.get("token");
}

// 日期格式化
export function parseTime(time: any, pattern: string) {
  if (arguments.length === 0 || !time) {
    return null;
  }
  const format = pattern || "{y}-{m}-{d} {h}:{i}:{s}";
  let date;
  if (typeof time === "object") {
    date = time;
  } else {
    if (typeof time === "string" && /^[0-9]+$/.test(time)) {
      time = parseInt(time);
    } else if (typeof time === "string") {
      // ISO 格式（含 T）直接使用，不替换 - 以免破坏时间戳格式
      if (!time.includes("T")) {
        time = time.replace(new RegExp(/-/gm), "/");
      }
    }
    if (typeof time === "number" && time.toString().length === 10) {
      time = time * 1000;
    }
    date = new Date(time);
  }
  const formatObj: any = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay(),
  };
  const time_str = format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
    let value = formatObj[key];
    // Note: getDay() returns 0 on Sunday
    if (key === "a") {
      return ["日", "一", "二", "三", "四", "五", "六"][value];
    }
    if (result.length > 0 && value < 10) {
      value = "0" + value;
    }
    return value || 0;
  });
  return time_str;
}
