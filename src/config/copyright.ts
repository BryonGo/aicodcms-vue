/**
 * 站点版权信息配置
 *
 * 默认 aicodcms；不同公司 / 客户 build 前只需修改根目录 `.env` 中的：
 *   VITE_APP_COPYRIGHT_OWNER = 公司名（默认 AICODCMS）
 *   VITE_APP_COPYRIGHT_YEAR  = 年份范围（默认 2021-2026）
 * 无需改动任何业务代码。
 */

// 公司 / 品牌名（默认 aicodcms）
const owner: string = String(import.meta.env.VITE_APP_COPYRIGHT_OWNER || "AICODCMS");

// 年份范围（默认 2021-2026）
const yearRange: string = String(import.meta.env.VITE_APP_COPYRIGHT_YEAR || "2021-2026");

export const copyright = {
  owner,
  yearRange,
  /** 英文版权行（footer 第一行 / 登录页） */
  en: `Copyright © ${yearRange} ${owner}. All Rights Reserved.`,
  /** 中文版权行（footer 第二行） */
  zh: `${owner} 版权所有`,
};
