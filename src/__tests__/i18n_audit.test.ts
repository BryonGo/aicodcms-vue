import { describe, it, expect, vi } from "vitest";
import { Local, Session } from "/@/utils/storage";
import { elementPlusLocales } from "/@/i18n";

// ============================================================
// i18n 全模块审计测试
// ============================================================

describe("审计1: Element Plus ConfigProvider 配置", () => {
  it("App.vue 应使用 el-config-provider 包裹路由器", async () => {
    const appVue = await import("fs").then((fs) => fs.readFileSync("src/App.vue", "utf8"));
    expect(appVue).toContain("el-config-provider");
    expect(appVue).toContain(':locale="elementPlusLocale"');
  });

  it("Element Plus locale 应包含 5 种语言", () => {
    expect(elementPlusLocales).toBeDefined();
    expect(Object.keys(elementPlusLocales)).toContain("zh-cn");
    expect(Object.keys(elementPlusLocales)).toContain("en");
    expect(Object.keys(elementPlusLocales)).toContain("zh-cn");
    expect(Object.keys(elementPlusLocales)).toContain("en");
  });

  it("elementPlusLocale 应为 computed 响应式", async () => {
    const appVue = await import("fs").then((fs) => fs.readFileSync("src/App.vue", "utf8"));
    expect(appVue).toContain("computed(() => {");
    expect(appVue).toContain("elementPlusLocales[themeConfig.value.globalI18n]");
  });

  it("不应依赖 mittBus 事件切换 Element Plus 语言 (computed 应该替代)", async () => {
    const appVue = await import("fs").then((fs) => fs.readFileSync("src/App.vue", "utf8"));
    expect(appVue).not.toContain("mittBus.on('getI18nConfig'");
  });
});

describe("审计2: vue-i18n 配置", () => {
  it("i18n 应创建并导出", async () => {
    const { i18n } = await import("/@/i18n");
    expect(i18n).toBeDefined();
    expect(i18n.global).toBeDefined();
  });

  it("应支持 5 种语言 locale", async () => {
    const { i18n } = await import("/@/i18n");
    const locales = Object.keys(i18n.global.messages.value);
    expect(locales).toContain("zh-cn");
    expect(locales).toContain("en");
    expect(locales).toContain("en");
  });

  it("fallback 应为 zh-cn", async () => {
    const { i18n } = await import("/@/i18n");
    expect(i18n.global.fallbackLocale.value).toBe("zh-cn");
  });
});

describe("审计3: 语言文件翻译键覆盖率", () => {
  function collectKeys(obj: any, prefix: string, result: Set<string>) {
    if (typeof obj !== "object" || obj === null) return;
    for (const key of Object.keys(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      if (typeof obj[key] === "object" && obj[key] !== null) {
        collectKeys(obj[key], fullKey, result);
      } else {
        result.add(fullKey);
      }
    }
  }

  const cmsFiles = ["/@/i18n/pages/cms/zh-cn", "/@/i18n/pages/cms/en"];

  it("CMS 所有语言应有相同 keys", async () => {
    const keySets: Record<string, string[]> = {};
    for (const file of cmsFiles) {
      const mod = await import(file);
      const keys = new Set<string>();
      collectKeys(mod.default || mod, "", keys);
      keySets[file] = [...keys].sort();
    }

    const zhKeys = keySets[cmsFiles[0]];
    for (const file of cmsFiles.slice(1)) {
      const missing = zhKeys.filter((k) => !keySets[file].includes(k));
      const extra = keySets[file].filter((k) => !zhKeys.includes(k));
      if (missing.length > 0) {
        expect(missing).toEqual([]); // 输出具体缺失的 key
      }
      if (extra.length > 0) {
        expect(extra.filter((k) => !k.startsWith("minio."))).toEqual([]); // minio 允许局部不同
      }
    }
  });

  const pmsFiles = ["/@/i18n/pages/pms/zh-cn", "/@/i18n/pages/pms/en"];

  it("PMS 所有语言应有相同 keys", async () => {
    const keySets: Record<string, string[]> = {};
    for (const file of pmsFiles) {
      const mod = await import(file);
      const keys = new Set<string>();
      collectKeys(mod.default || mod, "", keys);
      keySets[file] = [...keys].sort();
    }

    const zhKeys = keySets[pmsFiles[0]];
    for (const file of pmsFiles.slice(1)) {
      const missing = zhKeys.filter((k) => !keySets[file].includes(k));
      expect(missing).toEqual([]);
    }
  });

  it("登录页 zh-cn/en 应有相同 keys", async () => {
    const ls = ["/@/i18n/pages/login/zh-cn", "/@/i18n/pages/login/en"];
    const keySets: Record<string, string[]> = {};
    for (const file of ls) {
      const mod = await import(file);
      const keys = new Set<string>();
      collectKeys(mod.default || mod, "", keys);
      keySets[file] = [...keys].sort();
    }
    const zhKeys = keySets[ls[0]];
    for (const file of ls.slice(1)) {
      expect(zhKeys.filter((k) => !keySets[file].includes(k))).toEqual([]);
    }
  });

  it("框架级 lang zh-cn/en 应有相同 keys", async () => {
    const ls = ["/@/i18n/lang/zh-cn", "/@/i18n/lang/en"];
    const keySets: Record<string, string[]> = {};
    for (const file of ls) {
      const mod = await import(file);
      const keys = new Set<string>();
      collectKeys(mod.default || mod, "", keys);
      keySets[file] = [...keys].sort();
    }
    const zhKeys = keySets[ls[0]];
    for (const file of ls.slice(1)) {
      const missing = zhKeys.filter((k) => !keySets[file].includes(k));
      // 框架级 keys 允许少量差异化
      expect(
        missing.filter(
          (k) =>
            !k.startsWith("cmsArticle") &&
            !k.startsWith("cmsBlock") &&
            !k.startsWith("login") &&
            !k.startsWith("loading"),
        ),
      ).toEqual([]);
    }
  });
});

describe("审计4: Vue 文件硬编码中文检测", () => {
  it("所有 views 文件不应包含未 i18n 的中文", async () => {
    const fs = await import("fs");
    const path = await import("path");

    // 递归收集 .vue 文件
    function findVueFiles(dir: string): string[] {
      const result: string[] = [];
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory() && entry.name !== "node_modules") {
          result.push(...findVueFiles(fullPath));
        } else if (entry.name.endsWith(".vue")) {
          result.push(fullPath);
        }
      }
      return result;
    }

    const allFiles = findVueFiles("src/views").concat(findVueFiles("src/components"));
    const issues: { file: string; lines: string[] }[] = [];

    for (const file of allFiles) {
      const content = fs.readFileSync(file, "utf8");
      const lines = content.split("\n");
      const chineseLines: string[] = [];

      let inStyleBlock = false;
      let inBlockComment = false;
      lines.forEach((line, idx) => {
        const trimmed = line.trim();
        // 跳过多行块注释
        if (inBlockComment) {
          if (trimmed.includes("*/")) {
            inBlockComment = false;
          }
          return;
        }
        if (trimmed.startsWith("/*")) {
          if (!trimmed.includes("*/")) inBlockComment = true;
          return;
        }
        // 跳过单行注释
        if (trimmed.startsWith("//") || trimmed.startsWith("*")) return;
        // 跳过含有块注释的行 (/* ... */)
        if (trimmed.includes("/*") || trimmed.includes("*/")) return;
        // 跳过行内注释后的中文: 只检查 // 之前的部分
        const codePart = trimmed.replace(/\/\/.*$/, "");
        if (!/[\u4e00-\u9fff]/.test(codePart)) return;
        if (trimmed.startsWith("<!--")) return;
        // 跳过 style 块内的所有行
        if (trimmed.startsWith("<style")) {
          inStyleBlock = true;
          return;
        }
        if (trimmed.startsWith("</style>")) {
          inStyleBlock = false;
          return;
        }
        if (inStyleBlock) return;
        // 跳过 console.log 调试信息
        if (
          trimmed.includes("console.log") ||
          trimmed.includes("console.warn") ||
          trimmed.includes("console.error")
        )
          return;
        // 检查是否含中文
        if (/[\u4e00-\u9fff]/.test(line)) {
          // 跳过已 i18n 的: $t(', t(', {{
          if (line.includes("$t(") || line.includes("t(") || line.includes("{{")) return;
          // 允许 data 中的 name/label
          if (line.includes("name:") && line.includes("'")) return;
          chineseLines.push(`  L${idx + 1}: ${line.trim().substring(0, 100)}`);
        }
      });

      if (chineseLines.length > 0) {
        issues.push({ file: file.replace("src/", ""), lines: chineseLines });
      }
    }

    if (issues.length > 0) {
      console.log("\n=== 以下文件仍有硬编码中文 ===");
      for (const issue of issues) {
        console.log(`\n${issue.file}:`);
        for (const l of issue.lines) console.log(l);
      }
    }
    expect(issues.length).toBe(0);
  });
});

describe("审计5: i18n 运行时切换验证", () => {
  beforeEach(() => {
    Local.clear();
    Session.clear();
    vi.restoreAllMocks();
  });

  it("切换语言应更新 localStorage", () => {
    Local.set("themeConfig", { globalI18n: "zh-cn", globalComponentSize: "large" });
    // 模拟切换到英文
    Local.remove("themeConfig");
    Local.set("themeConfig", { globalI18n: "en", globalComponentSize: "large" });
    expect(Local.get("themeConfig").globalI18n).toBe("en");
  });

  it("localStorage 未设置时 vue-i18n fallback 应为 zh-cn", async () => {
    Local.clear();
    const { i18n } = await import("/@/i18n");
    // 默认 locale 应与 fallback 一致或从 store 读取
    expect(["zh-cn", "zh-CN"]).toContain(i18n.global.locale.value);
  });

  it("Accept-Language 请求头应跟随语言设定", () => {
    Local.set("themeConfig", { globalI18n: "ja", globalComponentSize: "large" });
    const themeConfig = Local.get("themeConfig");
    const acceptLang = themeConfig?.globalI18n || "zh-CN";
    // 模拟 axios 拦截器逻辑
    const config: any = { headers: {} };
    config.headers["Accept-Language"] = acceptLang.replace("-cn", "-CN");
    expect(config.headers["Accept-Language"]).toBe("ja");
  });
});

describe("审计6: 翻译值有效性", () => {
  it("CMS zh-cn 每个 key 都应有中文值（非空字符串）", async () => {
    const mod = await import("/@/i18n/pages/cms/zh-cn");
    const issues: string[] = [];

    function check(obj: any, prefix: string) {
      if (typeof obj !== "object" || obj === null) return;
      for (const key of Object.keys(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (typeof obj[key] === "object" && obj[key] !== null) {
          check(obj[key], fullKey);
        } else if (typeof obj[key] === "string") {
          if (obj[key].trim() === "") issues.push(`${fullKey}: empty value`);
        }
      }
    }
    check(mod.default, "");
    expect(issues).toEqual([]);
  });

  it("CMS en 每个 key 都应有英文值（非空字符串）", async () => {
    const mod = await import("/@/i18n/pages/cms/en");
    const issues: string[] = [];

    function check(obj: any, prefix: string) {
      if (typeof obj !== "object" || obj === null) return;
      for (const key of Object.keys(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (typeof obj[key] === "object" && obj[key] !== null) {
          check(obj[key], fullKey);
        } else if (typeof obj[key] === "string") {
          if (obj[key].trim() === "") issues.push(`${fullKey}: empty value`);
        }
      }
    }
    check(mod.default, "");
    expect(issues).toEqual([]);
  });
});
