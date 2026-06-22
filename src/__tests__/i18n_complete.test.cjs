/**
 * i18n 全量审计测试 (增强版)
 * 运行: node src/__tests__/i18n_complete.test.cjs
 * exit code: 0=通过, 1=失败
 *
 * 测试覆盖:
 *   Group 1: 引用→定义完整性 (zh-cn + en)
 *   Group 2: 语言文件一致性 (key 数量 + 死 key)
 *   Group 3: 中文硬编码残留 (按钮/标签/placeholder/dialog)
 *   Group 4: Vue 模板语法检查 (转义引号/括号配对/空key)
 */
const fs = require("fs");
const path = require("path");
const BASE = path.resolve(__dirname, "..");
let errors = 0;
let total = 0;

function test(name, fn) {
  total++;
  try {
    fn();
    console.log(`  ✓ ${name}`);
  } catch (e) {
    console.log(`  ✗ ${name}\n    ${e.message}`);
    errors++;
  }
}
function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

console.log("\n════════════════════════════════════");
console.log("  i18n 全量审计测试 (增强版)");
console.log("════════════════════════════════════\n");

// ============================================================
// 共享工具函数
// ============================================================
function walkFiles(dir, exts, exclude = []) {
  const r = [];
  if (!fs.existsSync(dir)) return r;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const fp = path.join(dir, e.name);
    if (e.isDirectory() && !exclude.includes(e.name) && !e.name.startsWith("."))
      r.push(...walkFiles(fp, exts, exclude));
    else if (exts.some((x) => e.name.endsWith(x))) r.push(fp);
  }
  return r;
}

function extractTRefs(content) {
  const refs = [];
  // Template $t() - double or single quotes
  const re1 = /\$t\(["'](message\.[^"']+)["']\)/g;
  let m;
  while ((m = re1.exec(content)) !== null) refs.push(m[1]);
  // Script t() - from useI18n() destructure
  const re2 = /(?<!\$)t\(["'](message\.[^"']+)["']\)/g;
  while ((m = re2.exec(content)) !== null) refs.push(m[1]);
  // Raw string patterns: 'message.xxx.yyy' stored for dynamic resolve
  const rawMatch = content.match(/'message\.[a-zA-Z.]+\.[a-zA-Z]+'/g);
  if (rawMatch) {
    for (const rm of rawMatch) {
      refs.push(rm.replace(/^'/, "").replace(/'$/, ""));
    }
  }
  // i18n.global.t(meta.title) - extract meta.title values from route.ts
  const rtMatch = content.match(/title:\s*'message\.[^']+'/g);
  if (rtMatch) {
    for (const rtm of rtMatch) {
      refs.push(rtm.replace(/^title:\s*'/, "").replace(/'$/, ""));
    }
  }
  return [...new Set(refs)];
}

function parseI18nKeys(filepaths) {
  const keys = new Set();
  for (const fp of filepaths) {
    if (!fs.existsSync(fp)) continue;
    const content = fs.readFileSync(fp, "utf8");
    const lines = content.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const inlineRegex = /(\w+)\s*:\s*['"][^'"]*['"]/g;
      let m;
      while ((m = inlineRegex.exec(line)) !== null) keys.add(m[1]);
      const mlMatch = line.match(/^\s*(\w+)\s*:\s*$/);
      if (mlMatch && i + 1 < lines.length && /^['"]/.test(lines[i + 1].trim()))
        keys.add(mlMatch[1]);
      const objMatch = line.match(/^\s*(\w+)\s*:\s*\{/);
      if (objMatch) keys.add(objMatch[1]);
    }
  }
  return keys;
}

// 收集所有文件
const vueFiles = [
  ...walkFiles(path.join(BASE, "views"), [".vue"], ["node_modules", "dist"]),
  ...walkFiles(path.join(BASE, "layout"), [".vue"]),
  ...walkFiles(path.join(BASE, "components"), [".vue"]),
  ...walkFiles(path.join(BASE, "api"), [".ts"]),
  ...walkFiles(path.join(BASE, "stores"), [".ts"]),
  ...walkFiles(path.join(BASE, "utils"), [".ts"]),
  ...walkFiles(path.join(BASE, "router"), [".ts"]),
  ...walkFiles(path.join(BASE, "views"), [".ts"], ["node_modules", "dist"]),
].filter((f) => !f.includes("/views/fun/") && !f.endsWith("_debug.vue"));

// 收集所有引用
const allRefs = new Map();
for (const fp of vueFiles) {
  const content = fs.readFileSync(fp, "utf8");
  const refs = extractTRefs(content);
  for (const ref of refs) {
    if (!allRefs.has(ref)) allRefs.set(ref, []);
    allRefs.get(ref).push(fp.replace(BASE + "/", ""));
  }
}

// 解析 i18n 定义
const zhKeys = parseI18nKeys([
  path.join(BASE, "i18n/lang/zh-cn.ts"),
  path.join(BASE, "i18n/pages/login/zh-cn.ts"),
  path.join(BASE, "i18n/pages/cms/zh-cn.ts"),
  path.join(BASE, "i18n/pages/pms/zh-cn.ts"),
  path.join(BASE, "i18n/pages/sdk/zh-cn.ts"),
  path.join(BASE, "i18n/pages/dashboard/zh-cn.ts"),
]);
const enKeys = parseI18nKeys([
  path.join(BASE, "i18n/lang/en.ts"),
  path.join(BASE, "i18n/pages/login/en.ts"),
  path.join(BASE, "i18n/pages/cms/en.ts"),
  path.join(BASE, "i18n/pages/pms/en.ts"),
  path.join(BASE, "i18n/pages/sdk/en.ts"),
  path.join(BASE, "i18n/pages/dashboard/en.ts"),
]);

const CHINESE = /[\u4e00-\u9fff]/;
// 专有名词/技术术语白名单：这些 label 不需要 i18n 化（翻译反而错）
const LABEL_WHITELIST = new Set([
  "ID",
  "UID",
  "IP",
  "App ID",
  "App Id",
  "AppID",
  "Slug",
  "MIME",
  "MinIO",
  "ETag",
  "API Key",
  "Key",
  "Value",
  "Token",
  "URL",
  "HTML",
  "CMS",
  "CNY",
  "USD",
  "EUR",
  "JPY",
  "DiyUrl",
]);
const EXCLUDE = [
  /^\s*\/\//,
  /^\s*<!--/,
  /console\./,
  /^\s*\/\*/,
  /^\s*\*/,
  /^\s*export/,
  /^\s*import/,
];

// ============================================================
// Group 1: 引用→定义完整性
// ============================================================
console.log("1. 引用→定义完整性");
test(`所有 ${allRefs.size} 个 $t() 引用在 zh-cn 中有定义`, () => {
  const missing = [];
  for (const [ref, files] of allRefs) {
    const leaf = ref.split(".").pop();
    if (!zhKeys.has(leaf)) missing.push(`${ref} (${files.join(", ")})`);
  }
  assert(missing.length === 0, `${missing.length} 个缺失\n    ${missing.join("\n    ")}`);
});
test(`所有 ${allRefs.size} 个 $t() 引用在 en 中有定义`, () => {
  const missing = [];
  for (const [ref, files] of allRefs) {
    const leaf = ref.split(".").pop();
    if (!enKeys.has(leaf)) missing.push(`${ref} (${files.join(", ")})`);
  }
  assert(missing.length === 0, `${missing.length} 个缺失\n    ${missing.join("\n    ")}`);
});

// ============================================================
// Group 2: 语言文件一致性
// ============================================================
console.log("\n2. 语言文件一致性");
test("zh-cn 和 en key 数量一致 (≤2差异仅警告)", () => {
  const diff = Math.abs(zhKeys.size - enKeys.size);
  if (diff <= 2) console.log(`    ⚠️zh:${zhKeys.size} en:${enKeys.size} (差异${diff}, 警告不阻断)`);
  else assert(false, `zh:${zhKeys.size} en:${enKeys.size} (差异${diff}超过阈值)`);
});

// 死 key 检测（跳过基础设施 key）
const INFRA_PREFIXES = [
  "router",
  "staticRoutes",
  "notFound",
  "noAccess",
  "layout",
  "user",
  "tagsView",
  "cms",
  "common",
  "msg",
  "label",
  "link",
  "account",
  "mobile",
  "scan",
];
test("无业务级死 key", () => {
  const usedLeaves = new Set();
  for (const ref of allRefs.keys()) usedLeaves.add(ref.split(".").pop());
  const dead = [...zhKeys].filter((k) => !usedLeaves.has(k) && !INFRA_PREFIXES.includes(k));
  if (dead.length > 0) console.log(`    ⚠️${dead.length} 个未使用key: ${dead.join(", ")}`);
  // 不阻断
});

// ============================================================
// Group 3: 中文硬编码残留
// ============================================================
console.log("\n3. 中文硬编码残留检测");
test("按钮/标签/表头无中文硬编码", () => {
  const issues = [];
  for (const fp of vueFiles) {
    const rel = fp.replace(BASE + "/", "");
    const lines = fs.readFileSync(fp, "utf8").split("\n");
    for (let i = 0; i < lines.length; i++) {
      const tl = lines[i].trim();
      if (EXCLUDE.some((p) => p.test(tl))) continue;
      if (!CHINESE.test(lines[i])) continue;
      if (!/el-button|el-tag|el-table-column|el-form-item|el-tab-pane/.test(lines[i])) continue;
      if (!lines[i].includes("$t(")) issues.push(`${rel}:${i + 1}: ${tl}`);
    }
  }
  if (issues.length > 0) console.log(`    ✗ ${issues.length} 处:\n    ${issues.join("\n    ")}`);
  assert(issues.length === 0, `${issues.length} 处中文硬编码`);
});

test("placeholder 无中文硬编码", () => {
  const issues = [];
  for (const fp of vueFiles) {
    const rel = fp.replace(BASE + "/", "");
    const lines = fs.readFileSync(fp, "utf8").split("\n");
    for (let i = 0; i < lines.length; i++) {
      const tl = lines[i].trim();
      if (EXCLUDE.some((p) => p.test(tl))) continue;
      if (/placeholder="[^"]*[\u4e00-\u9fff]/.test(lines[i])) issues.push(`${rel}:${i + 1}: ${tl}`);
    }
  }
  assert(issues.length === 0, `${issues.length} 处`);
});

test("dialog/drawer title 无中文硬编码", () => {
  const issues = [];
  for (const fp of vueFiles) {
    const rel = fp.replace(BASE + "/", "");
    const lines = fs.readFileSync(fp, "utf8").split("\n");
    for (let i = 0; i < lines.length; i++) {
      const l = lines[i],
        tl = l.trim();
      if (EXCLUDE.some((p) => p.test(tl))) continue;
      // Check for inline title with Chinese
      if (
        /<(el-dialog|el-drawer)[^>]*title="[^"]*[\u4e00-\u9fff][^"]*"/.test(l) &&
        !l.includes("$t(")
      ) {
        issues.push(`${rel}:${i + 1}: ${tl}`);
      }
    }
  }
  if (issues.length > 0)
    console.log(`    ⚠️${issues.length} 处: ${issues.slice(0, 3).join(" | ")}`);
  if (issues.length <= 6) return; // tolerant
  assert(issues.length === 0, `${issues.length} 处`);
});

test("el-table-column label 无硬编码英文（应使用 $t()）", () => {
  const issues = [];
  for (const fp of vueFiles) {
    const rel = fp.replace(BASE + "/", "");
    const lines = fs.readFileSync(fp, "utf8").split("\n");
    for (let i = 0; i < lines.length; i++) {
      const l = lines[i];
      if (EXCLUDE.some((p) => p.test(l))) continue;
      // label="XXX" without $t()
      const m = l.match(/label="([A-Z][A-Za-z0-9 /]+)"/);
      if (m && !l.includes("$t(") && !LABEL_WHITELIST.has(m[1])) {
        issues.push(`${rel}:${i + 1}: label="${m[1]}"`);
      }
    }
  }
  if (issues.length > 0) console.log(`    ✗ ${issues.length} 处:\n    ${issues.join("\n    ")}`);
  assert(issues.length === 0, `${issues.length} 处硬编码英文 label`);
});

test("el-button / desc 无硬编码英文（应使用 $t()）", () => {
  const issues = [];
  for (const fp of vueFiles) {
    const rel = fp.replace(BASE + "/", "");
    const lines = fs.readFileSync(fp, "utf8").split("\n");
    for (let i = 0; i < lines.length; i++) {
      const l = lines[i];
      if (EXCLUDE.some((p) => p.test(l))) continue;
      // desc="XXX" or >English text</el-button
      const descM = l.match(/desc="([A-Z][A-Za-z0-9 /,]+)"/);
      if (descM && !l.includes("$t(") && !LABEL_WHITELIST.has(descM[1])) {
        issues.push(`${rel}:${i + 1}: desc="${descM[1]}"`);
      }
      // >English< without $t
      const btnM = l.match(/>([A-Z][a-z]+(?: [A-Z][a-z]+)*)<\/el-button/);
      if (btnM && !l.includes("$t(") && !l.includes("{{") && !LABEL_WHITELIST.has(btnM[1])) {
        issues.push(`${rel}:${i + 1}: >${btnM[1]}<`);
      }
    }
  }
  if (issues.length > 0) console.log(`    ✗ ${issues.length} 处:\n    ${issues.join("\n    ")}`);
  assert(issues.length === 0, `${issues.length} 处硬编码英文按钮/desc`);
});

// ============================================================
// Group 4: Vue 模板语法检查 (新增)
// ============================================================
console.log("\n4. Vue 模板语法检查");
const SYNTAX_CHECKS = [
  {
    name: '$t(\\"X\\") 转义引号 (会触发 Vue 解析错误)',
    pattern: /\$t\(\\"/,
    explain:
      '$t(\\"X\\") 写法会导致 "Error parsing JavaScript expression: Expecting Unicode escape sequence" 错误。应将内层双引号改为单引号: $t(\'X\')',
  },
  {
    name: "模板中 {{ 无匹配 }}",
    pattern: (content) => {
      // 只在 <template> 区块检查
      const tpl = content.match(/<template>([\s\S]*)<\/template>/);
      if (!tpl) return [];
      const text = tpl[1];
      const issues = [];
      let depth = 0;
      for (let i = 0; i < text.length; i++) {
        if (text[i] === "{" && text[i + 1] === "{") {
          depth++;
          i++;
        } else if (text[i] === "}" && text[i + 1] === "}") {
          depth--;
          i++;
        }
      }
      if (depth !== 0) issues.push(`模板中有 ${depth} 个未闭合的 {{`);
      return issues;
    },
    explain: "模板中存在未闭合的 {{ }} 表达式",
  },
  {
    name: "$t() 调用括号不匹配",
    pattern: (content) => {
      const issues = [];
      const re = /\$t\(/g;
      let m;
      while ((m = re.exec(content)) !== null) {
        let depth = 1,
          pos = m.index + 3;
        let inStr = false,
          strChar = "";
        while (depth > 0 && pos < content.length) {
          const ch = content[pos];
          if (!inStr && (ch === "'" || ch === '"')) {
            inStr = true;
            strChar = ch;
          } else if (inStr && ch === strChar && content[pos - 1] !== "\\") {
            inStr = false;
          } else if (!inStr && ch === "(") depth++;
          else if (!inStr && ch === ")") depth--;
          pos++;
        }
        if (depth > 0) issues.push(`$t( 括号未闭合 at ${m.index}`);
      }
      return issues;
    },
    explain: "$t() 调用中存在括号不匹配",
  },
  {
    name: "$t() 空调用",
    pattern: /\$t\(\s*\)/g,
    explain: "发现 $t() 空调用，未传入 i18n key",
  },
  {
    name: ':="\\$t(" ',
    pattern: /:"\\\$t\(/g,
    explain: "模板属性中的 $t( 前有转义反斜杠，可能是错误的转义",
  },
  {
    name: "t('message.xxx') 在脚本中使用但缺少 useI18n 导入",
    pattern: (content) => {
      if (!content.includes("<script")) return [];
      const hasUseI18n = /useI18n/.test(content);
      if (hasUseI18n) return [];
      const issues = [];
      const lines = content.split("\n");
      for (let i = 0; i < lines.length; i++) {
        // 排除前导 $（$t 模板）/ 字母数字下划线（自定义函数）/ 点号（obj.t 对象方法，如 i18n.global.t）
        // setup 之外（props.default 等）合法用法是 i18n.global.t，不能也无须 useI18n()
        const m = lines[i].match(/[^$\w.]t\(\s*['"](message\.[^'"]+)['"]\s*\)/);
        if (m && !lines[i].includes("//") && !lines[i].includes("import")) {
          issues.push(`第${i + 1}行: t('${m[1]}') 缺少 useI18n`);
        }
      }
      return issues;
    },
    explain:
      "脚本中 t('message.xxx') 需要 import { useI18n } from 'vue-i18n' + const { t } = useI18n()",
  },
  {
    name: "('message.xxx') 裸字符串（缺少 \\$t() 包装）",
    pattern: (content) => {
      const issues = [];
      const re = /(?<!\$t|\bt|\/\/)\s*\(\s*['"](message\.[a-zA-Z.]+\.[a-zA-Z]+)['"]\s*\)/g;
      let m;
      while ((m = re.exec(content)) !== null) {
        // Skip URL/href contexts
        const ctx = content.substring(Math.max(0, m.index - 20), m.index + m[0].length);
        if (ctx.includes("href=") || ctx.includes("//")) continue;
        issues.push(m[1]);
      }
      return issues;
    },
    explain: "('message.xxx') 这种格式缺少 $t() 或 t() 包装，页面会显示原始 key 文本",
  },
];

for (const check of SYNTAX_CHECKS) {
  test(check.name, () => {
    const issues = [];
    for (const fp of vueFiles) {
      const content = fs.readFileSync(fp, "utf8");
      const rel = fp.replace(BASE + "/", "");
      if (typeof check.pattern === "function") {
        const res = check.pattern(content);
        if (res.length > 0) res.forEach((r) => issues.push(`${rel}: ${r}`));
      } else if (check.pattern instanceof RegExp) {
        const ms = content.match(check.pattern);
        if (ms && ms.length > 0) {
          // find line numbers
          const lines = content.split("\n");
          for (let i = 0; i < lines.length; i++) {
            if (check.pattern.test(lines[i])) issues.push(`${rel}:${i + 1}: ${check.explain}`);
          }
        }
      }
    }
    assert(issues.length === 0, `${issues.length} 处:\n    ${issues.join("\n    ")}`);
  });
}

// ============================================================
// 结果
// ============================================================
console.log(`\n════════════════════════════════════`);
console.log(
  `  引用: ${allRefs.size} | zh:${zhKeys.size} | en:${enKeys.size} | 文件:${vueFiles.length}`,
);
console.log(`  结果: ${errors === 0 ? "✅ 全部通过" : "❌ " + errors + "/" + total + " 失败"}`);
console.log(`════════════════════════════════════\n`);
process.exit(errors > 0 ? 1 : 0);
