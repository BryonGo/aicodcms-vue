// Scan all vue views for i18n keys (message.*) that do not resolve in the
// zh-cn lang files (pages/cms, pages/pms, pages/login, pages/sdk, pages/dashboard, lang).
// 扫描所有视图引用的 i18n 键，找出语言文件中不存在的键。
import fs from 'node:fs';
import path from 'node:path';

const root = 'D:/code/go-sdk-vue/src';

// 1. 加载所有语言文件并扁平化键
const langFiles = [
  ['i18n/lang/zh-cn', 'lang'],
  ['i18n/pages/cms/zh-cn', 'cms'],
  ['i18n/pages/pms/zh-cn', 'pms'],
  // login 页面语言在 i18n/index.ts 中顶层展开（...pagesLoginZhcn），无 login. 前缀
  ['i18n/pages/login/zh-cn', ''],
  ['i18n/pages/sdk/zh-cn', 'sdk'],
  ['i18n/pages/dashboard/zh-cn', 'dashboard'],
];

function loadTs(file) {
  // 简单转换：export default { ... } TS 对象 → 用 node 的 ts 转译太重，
  // 直接正则抽取 "key": value 结构不可靠；改用 vite 转译成本高。
  // 折中：用 esbuild？没有。用 tsx？没有。这里用 regex 粗略解析顶层与一层对象。
  return null;
}

// 改用更可靠方式：利用 vite-plus 的 test 环境？不。这里直接用简单 TOML-like 解析：
// 文件是 TS：export default { key: { sub: "v" }, key2: "v2", ... }
// 用递归括号解析：
function parseTsObject(src) {
  const start = src.indexOf('{');
  const end = src.lastIndexOf('}');
  const body = src.slice(start + 1, end);
  return parseBody(body);
}

function parseBody(body) {
  const out = {};
  let i = 0;
  const len = body.length;
  while (i < len) {
    // 跳过空白/逗号/注释
    const ch = body[i];
    if (ch === ',' || ch === '\n' || ch === '\r' || ch === ' ' || ch === '\t') { i++; continue; }
    if (ch === '/' && body[i + 1] === '/') { while (i < len && body[i] !== '\n') i++; continue; }
    if (ch === '/' && body[i + 1] === '*') { const e = body.indexOf('*/', i); i = e < 0 ? len : e + 2; continue; }
    // 键名：identifier 或 "quoted"
    let key = '';
    if (ch === '"' || ch === "'") {
      const q = ch; i++;
      while (i < len && body[i] !== q) { key += body[i]; i++; }
      i++; // 结束引号
    } else {
      while (i < len && /[A-Za-z0-9_$]/.test(body[i])) { key += body[i]; i++; }
    }
    // 冒号
    while (i < len && body[i] !== ':') i++;
    i++;
    // 值：对象 / 字符串 / 数字 / true/false / 模板
    while (i < len && (body[i] === ' ' || body[i] === '\t' || body[i] === '\n')) i++;
    if (body[i] === '{') {
      // 嵌套对象：括号配对
      let depth = 1; let j = i + 1;
      while (j < len && depth > 0) {
        if (body[j] === '{') depth++;
        else if (body[j] === '}') depth--;
        j++;
      }
      const sub = parseBody(body.slice(i + 1, j - 1));
      for (const [sk, sv] of Object.entries(sub)) out[key ? key + '.' + sk : sk] = sv;
      i = j;
    } else {
      // 字符串值
      let val = '';
      if (body[i] === '"' || body[i] === "'") {
        const q = body[i]; i++;
        while (i < len && body[i] !== q) { if (body[i] === '\\') { i++; } val += body[i]; i++; }
        i++;
      } else {
        while (i < len && body[i] !== ',' && body[i] !== '\n') { val += body[i]; i++; }
      }
      if (key) out[key] = val.trim();
    }
  }
  return out;
}

const allKeys = new Set();
const keySources = {};
for (const [file, ns] of langFiles) {
  const src = fs.readFileSync(path.join(root, file + '.ts'), 'utf8');
  const obj = parseTsObject(src);
  for (const k of Object.keys(obj)) {
    const full = ns === 'lang' ? k : ns + '.' + k;
    allKeys.add(full);
    keySources[full] = file;
  }
}

// 2. 扫描所有 vue 文件里的 $t/t 引用
function walk(dir, out) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === 'node_modules' || e.name === 'fun') continue;
      walk(p, out);
    } else if (e.name.endsWith('.vue')) {
      out.push(p);
    }
  }
}

const vueFiles = [];
walk(path.join(root, 'views'), vueFiles);

const missing = new Map();
const refRe = /\$t\(\s*["'`]([^"'`]+)["'`]/g;
const refRe2 = /(?:^|[^.$])\bt\(\s*["'`]([^"'`]+)["'`]/g;

for (const f of vueFiles) {
  const content = fs.readFileSync(f, 'utf8');
  const found = new Set();
  let m;
  while ((m = refRe.exec(content)) !== null) found.add(m[1]);
  while ((m = refRe2.exec(content)) !== null) found.add(m[1]);
  for (const key of found) {
    if (!key.startsWith('message.')) continue;
    const k = key.slice('message.'.length);
    if (!allKeys.has(k)) {
      if (!missing.has(k)) missing.set(k, []);
      missing.get(k).push(f.replace(root + '/', ''));
    }
  }
}

console.log('total keys:', allKeys.size);
console.log('missing keys referenced by views:', missing.size);
for (const [k, files] of missing) {
  console.log(`\n  ${k}  ← ${files.slice(0, 3).join(', ')}${files.length > 3 ? '...' : ''}`);
}
