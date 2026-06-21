import { createI18n } from "vue-i18n";
import pinia from "/@/stores/index";
import { storeToRefs } from "pinia";
import { useThemeConfig } from "/@/stores/themeConfig";
import { Local } from "/@/utils/storage";
// Element Plus 语言包（与 vue-i18n 解耦，仅用于 ConfigProvider）
import elZhCn from "element-plus/es/locale/lang/zh-cn";
import elEn from "element-plus/es/locale/lang/en";

import nextZhcn from "/@/i18n/lang/zh-cn";
import nextEn from "/@/i18n/lang/en";

import pagesLoginZhcn from "/@/i18n/pages/login/zh-cn";
import pagesLoginEn from "/@/i18n/pages/login/en";

import pagesCmsZhcn from "/@/i18n/pages/cms/zh-cn";
import pagesCmsEn from "/@/i18n/pages/cms/en";

import pagesPmsZhcn from "/@/i18n/pages/pms/zh-cn";
import pagesPmsEn from "/@/i18n/pages/pms/en";

import pagesSdkZhcn from "/@/i18n/pages/sdk/zh-cn";
import pagesSdkEn from "/@/i18n/pages/sdk/en";

import pagesDashboardZhcn from "/@/i18n/pages/dashboard/zh-cn";
import pagesDashboardEn from "/@/i18n/pages/dashboard/en";

// 定义语言国际化内容（仅 vue-i18n，Element Plus locale 独立管理）
const messages = {
  "zh-cn": {
    message: {
      ...nextZhcn,
      ...pagesLoginZhcn,
      cms: pagesCmsZhcn,
      pms: pagesPmsZhcn,
      sdk: { ...nextZhcn.sdk, ...pagesSdkZhcn },
      dashboard: pagesDashboardZhcn,
    },
  },
  en: {
    message: {
      ...nextEn,
      ...pagesLoginEn,
      cms: pagesCmsEn,
      pms: pagesPmsEn,
      sdk: pagesSdkEn,
      dashboard: pagesDashboardEn,
    },
  },
};

// Element Plus 语言包映射（与 vue-i18n 解耦，仅用于 ConfigProvider）
export const elementPlusLocales: Record<string, any> = {
  "zh-cn": elZhCn,
  en: elEn,
};

// 读取 pinia 默认语言
const stores = useThemeConfig(pinia);
const { themeConfig } = storeToRefs(stores);

// backendToFrontendLang 后端语言代码（zh-CN, en-US）→ 前端 locale（zh-cn, en）
export function backendToFrontendLang(lang: string): string {
  const map: Record<string, string> = {
    "zh-CN": "zh-cn",
    "en-US": "en",
    "zh-cn": "zh-cn",
    en: "en",
  };
  return map[lang] || "zh-cn";
}

// 从未选择语言时，尝试从后端获取默认语言（禁止硬编码）
async function initDefaultLanguage() {
  const saved = Local.get("themeConfig");
  if (saved && saved.globalI18n) {
    return; // 已有用户选择，不覆写
  }
  try {
    const { getDefaultLanguage } = await import("/@/api/cms/setting");
    const lang = await getDefaultLanguage();
    if (lang) {
      themeConfig.value.globalI18n = backendToFrontendLang(lang);
      Local.set("themeConfig", themeConfig.value);
    }
  } catch {
    // 后端不可达时保留 Pinia 默认值（zh-cn）
  }
}
initDefaultLanguage();

// 导出语言国际化
export const i18n = createI18n({
  silentTranslationWarn: true,
  missingWarn: false,
  silentFallbackWarn: true,
  fallbackWarn: false,
  locale: themeConfig.value.globalI18n,
  fallbackLocale: "zh-cn",
  legacy: false,
  messages,
});
