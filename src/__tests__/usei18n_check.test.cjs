#!/usr/bin/env node
/**
 * CI 检查：扫描所有 .vue 文件中 useI18n() 的调用位置。
 *
 * 规则：
 * 1. useI18n() 必须在 setup() 函数内部调用（普通 <script>）
 * 2. 使用 useI18n() 必须有 import { useI18n } from 'vue-i18n'
 *
 * 用法：
 *   node src/__tests__/usei18n_check.test.cjs
 *   node src/__tests__/usei18n_check.test.cjs --verbose
 *
 * 退出码：0=通过, 1=发现问题
 */
const fs = require("fs");
const path = require("path");

const SRC_DIR = path.resolve(__dirname, "..");
const verbose = process.argv.includes("--verbose") || process.argv.includes("-v");

// ---------- 文件扫描 ----------

function findVueFiles(dir) {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.name === "node_modules") continue;
    if (entry.isDirectory()) {
      files.push(...findVueFiles(fullPath));
    } else if (entry.name.endsWith(".vue")) {
      files.push(fullPath);
    }
  }
  return files.sort();
}

// ---------- 脚本块解析 ----------

function parseScripts(content) {
  const blocks = [];
  const re = /<script\s*([^>]*)>(.*?)<\/script>/gs;
  let m;
  while ((m = re.exec(content)) !== null) {
    const attrs = m[1].trim();
    const body = m[2];
    const isSetup = /\bsetup\b/.test(attrs);
    const startLine = content.slice(0, m.index).split("\n").length;
    blocks.push({ body, isSetup, startLine });
  }
  return blocks;
}

function isInsideSetup(line) {
  // 压缩单行: "export default defineComponent({...,setup(){const{t}=useI18n();...}})"
  if (/setup\s*\(/.test(line) && /\{/.test(line)) return true;
  // 多行: 有缩进
  return line.length - line.trimStart().length > 0;
}

// ---------- 单个文件检查 ----------

function checkFile(filePath) {
  const errors = [];
  const relPath = path.relative(SRC_DIR, filePath);
  const content = fs.readFileSync(filePath, "utf-8");
  const scripts = parseScripts(content);

  for (const block of scripts) {
    if (!block.body.includes("useI18n")) continue;

    const lines = block.body.split("\n");
    const hasImport = /['"]vue-i18n['"]/.test(block.body);

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const stripped = line.trim();

      if (!stripped.includes("useI18n")) continue;
      if (
        stripped.startsWith("import") ||
        stripped.startsWith("//") ||
        stripped.startsWith("/*") ||
        stripped.startsWith("*")
      )
        continue;

      const absLine = block.startLine + i;

      if (!hasImport) {
        errors.push({ file: relPath, line: absLine, code: stripped, type: "IMPORT_MISSING" });
      }

      if (!block.isSetup && !isInsideSetup(line)) {
        errors.push({ file: relPath, line: absLine, code: stripped, type: "MODULE_LEVEL" });
      }
    }
  }

  if (verbose && errors.length === 0) {
    console.log(`  ✅ ${relPath}`);
  } else if (verbose && errors.length > 0) {
    console.log(`  ❌ ${relPath} (${errors.length})`);
  }

  return errors;
}

// ---------- 入口 ----------

function main() {
  const vueFiles = findVueFiles(SRC_DIR);
  console.log(`\n扫描 ${vueFiles.length} 个 .vue 文件...\n`);

  const allErrors = [];
  for (const fp of vueFiles) {
    allErrors.push(...checkFile(fp));
  }

  if (allErrors.length === 0) {
    console.log("=".repeat(50));
    console.log("✅ 全部通过：所有文件 useI18n() 调用位置正确");
    console.log("=".repeat(50));
    console.log();
    process.exit(0);
  }

  // 按文件分组
  const grouped = {};
  for (const e of allErrors) {
    if (!grouped[e.file]) grouped[e.file] = [];
    grouped[e.file].push(e);
  }

  console.log("=".repeat(50));
  console.log(`❌ 发现 ${allErrors.length} 个问题：`);
  console.log("=".repeat(50));
  console.log();

  for (const [file, errs] of Object.entries(grouped).sort()) {
    console.log(`  📄 ${file}`);
    for (const e of errs) {
      const tag = e.type === "IMPORT_MISSING" ? "缺少 import" : "模块级调用";
      console.log(`    :${e.line}  [${tag}] ${e.code.trim()}`);
    }
    console.log();
  }

  process.exit(1);
}

main();
