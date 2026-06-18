import axios from "axios";
import { ElMessage, ElMessageBox } from "element-plus";
import { Session, Local } from "/@/utils/storage";

// 全局调试开关
const isDebug = import.meta.env.VITE_APP_DEBUG === "true";

// 调试日志
function debugLog(label: string, ...args: any[]) {
  if (!isDebug) return;
  if (args.length === 0) {
    console.log(`[API] ${label}`);
  } else {
    console.log(`[API] ${label}`, ...args);
  }
}

// normalizeApiBaseURL 规范化 API baseURL，避免后台部署在 /zh-CN/ 页面下时把 API 拼成 /zh-CN/api/v1/...
function normalizeApiBaseURL(raw: unknown) {
  const value = String(raw || "").trim();
  if (!value) return "";
  const stripLangPath = (path: string) => path.replace(/^\/[a-z]{2}(?:-[A-Z]{2})?\/?$/, "");
  try {
    const url = new URL(value, window.location.origin);
    url.pathname = stripLangPath(url.pathname).replace(/\/+$/, "");
    return url.origin === window.location.origin
      ? url.pathname
      : url.toString().replace(/\/+$/, "");
  } catch {
    return stripLangPath(value).replace(/\/+$/, "");
  }
}

// normalizeApiPath 保证所有 /api/v1 请求走站点根路径，多语言只通过 Accept-Language 请求头传递。
function normalizeApiPath(raw: unknown) {
  const value = String(raw || "");
  if (!value) return value;
  return value
    .replace(/^\/[a-z]{2}(?:-[A-Z]{2})?\/(api\/v1\/)/, "/$1")
    .replace(/^(api\/v1\/)/, "/$1");
}

// 401 弹窗防抖锁：防止多个并发 401 叠弹窗
let is401Alerting = false;

// 配置新建一个 axios 实例
const service = axios.create({
  baseURL: normalizeApiBaseURL(import.meta.env.VITE_API_URL),
  timeout: 50000,
  headers: { "Content-Type": "application/json" },
});

// 添加请求拦截器
service.interceptors.request.use(
  (config) => {
    // API 路径永远从根 /api/v1 开始，不能跟随当前 /zh-CN/ 页面路径。
    config.url = normalizeApiPath(config.url);

    // 调试：打印请求信息
    debugLog(">>> 请求", config.method?.toUpperCase(), config.url);
    if (config.params && Object.keys(config.params).length > 0) {
      debugLog("   params:", JSON.stringify(config.params));
    }
    if (config.data && typeof config.data === "string") {
      try {
        debugLog("   body:", JSON.stringify(JSON.parse(config.data)));
      } catch {
        debugLog("   body:", config.data);
      }
    }

    // 在发送请求之前做些什么 token
    if (Session.get("token")) {
      config.headers["Authorization"] = `Bearer ${Session.get("token")}`;
    }
    // 传递当前语言到后端（缺省 zh-CN，从后端配置获取，禁止硬编码）
    const themeConfig = Local.get("themeConfig");
    const currentLang = themeConfig?.globalI18n || "zh-CN";
    config.headers["Accept-Language"] = currentLang;
    console.log("[Lang] >>> Accept-Language:", currentLang, "| URL:", config.url);

    // FormData 请求：清除 Content-Type 让浏览器自动设置 multipart boundary
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => {
    debugLog("<<< 请求异常", error.message);
    return Promise.reject(error);
  },
);

// 添加响应拦截器
service.interceptors.response.use(
  (response) => {
    const res = response.data;
    const code = response.data.code;
    const httpCode = response.status;

    // 调试：打印响应信息
    debugLog("<<< 响应", httpCode, response.config.url);
    const respLang = response.headers["content-language"] || response.headers["Content-Language"];
    console.log(
      "[Lang] <<< Content-Language:",
      respLang,
      "| Accept-Language:",
      response.config?.headers?.["Accept-Language"],
      "| URL:",
      response.config?.url,
    );
    if (code === 0) {
      debugLog("   成功:", res);
    } else {
      debugLog("   失败:", res);
    }

    if (code === 401) {
      if (is401Alerting) return;
      is401Alerting = true;
      ElMessageBox.alert("登录状态已过期，请重新登录", "提示", { confirmButtonText: "确定" })
        .then(() => {
          is401Alerting = false;
          Session.clear(); // 清除浏览器全部临时缓存
          window.location.href = "/"; // 去登录页
        })
        .catch(() => {
          is401Alerting = false;
        });
    } else if (code === 403 || code === 70001) {
      // 权限不足，跳转到 401 页面
      ElMessageBox.alert("没有访问权限，请联系管理员", "权限不足", { confirmButtonText: "确定" })
        .then(() => {
          window.location.href = "/#/401";
        })
        .catch(() => {
          window.location.href = "/#/401";
        });
    } else if (code !== 0) {
      // 非 0 错误码：reject 传递错误给调用方，不再静默吞掉
      return Promise.reject(res);
    } else {
      return res;
    }
  },
  (error) => {
    debugLog("<<< 响应异常", error.message);
    if (error.response) {
      debugLog("   status:", error.response.status, "url:", error.response.config?.url);
      if (error.response.status === 404) {
        ElMessage({
          message: "请求地址出错",
          type: "warning",
        });
      } else if (error.response.status === 401) {
        if (is401Alerting) return;
        is401Alerting = true;
        ElMessageBox.alert("登录状态已过期，请重新登录", "提示", { confirmButtonText: "确定" })
          .then(() => {
            is401Alerting = false;
            Session.clear(); // 清除浏览器全部临时缓存
            window.location.href = "/"; // 去登录页
          })
          .catch(() => {
            is401Alerting = false;
          });
      } else if (error.response.status === 500) {
        ElMessage({
          message: "请求接口出错 500",
          type: "warning",
        });
      } else {
        if (error.response.data) ElMessage.error(error.response.statusText);
        else ElMessage.error("接口路径找不到");
      }
    } else if (error.message.indexOf("timeout") != -1) {
      ElMessage.error("网络超时");
    } else if (error.message == "Network Error") {
      ElMessage.error("网络连接错误");
    } else {
      ElMessage.error("网络连接错误");
    }
    return Promise.reject(error);
  },
);

// 导出 axios 实例
export default service;
