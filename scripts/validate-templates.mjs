/**
 * Vue 模板标签校验工具
 * 只报告真正的错误：孤儿闭标签（没有匹配开口的 </xxx>）
 * 用法: node scripts/validate-templates.mjs
 */
import { readFileSync, readdirSync, statSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VIEWS_DIR = path.resolve(__dirname, "../src/views");

function collectVueFiles(dir) {
  const results = [];
  for (const entry of readdirSync(dir)) {
    const fp = path.join(dir, entry);
    if (entry.startsWith(".") || entry === "node_modules") continue;
    const st = statSync(fp);
    if (st.isDirectory()) results.push(...collectVueFiles(fp));
    else if (entry.endsWith(".vue")) results.push(fp);
  }
  return results;
}

function extractTemplate(content) {
  const m = content.match(/<template>([\s\S]*?)<\/template>/);
  if (!m) return null;
  const offset = content.substring(0, m.index + "<template>".length).split("\n").length;
  return { tpl: m[1], offset };
}

function getLine(t, pos, off) {
  return off + t.substring(0, pos).split("\n").length;
}

/**
 * 匹配一个完整的 HTML/XML 标签，正确处理引号内的 >。
 * 返回 { tag, selfClose } | null
 * tag: "/div" 表示闭标签, "div" 表示开标签
 * selfClose: true 表示以 /> 结束
 */
function matchTag(str, pos) {
  if (str[pos] !== "<") return null;
  let i = pos + 1;
  const isClose = str[i] === "/";
  if (isClose) i++;
  // 读标签名
  const nameStart = i;
  while (i < str.length && /[\w-]/.test(str[i])) i++;
  const name = str.substring(nameStart, i);
  if (!name) return null;
  // 跳过属性（处理引号）
  let selfClose = false;
  while (i < str.length) {
    if (str[i] === ">") {
      i++;
      break;
    }
    if (str[i] === "/" && str[i + 1] === ">") {
      selfClose = true;
      i += 2;
      break;
    }
    if (str[i] === '"') {
      i++;
      while (i < str.length && str[i] !== '"') i++;
      i++;
      continue;
    }
    if (str[i] === "'") {
      i++;
      while (i < str.length && str[i] !== "'") i++;
      i++;
      continue;
    }
    i++;
  }
  return { tag: (isClose ? "/" : "") + name, selfClose, end: i };
}

function validate(template, lineOffset) {
  const errs = [];
  const clean = template.replace(/<!--[\s\S]*?-->/g, "");
  const stack = [];
  let pos = 0;

  while (pos < clean.length) {
    const m = matchTag(clean, pos);
    if (!m) {
      pos++;
      continue;
    }
    pos = m.end;

    if (m.tag.startsWith("/")) {
      // 闭合标签：向前查找栈中匹配的开口
      const name = m.tag.slice(1);
      let found = -1;
      for (let i = stack.length - 1; i >= 0; i--) {
        if (stack[i].tag === name) {
          found = i;
          break;
        }
      }
      if (found === -1) {
        errs.push(`Line ${getLine(clean, pos, lineOffset)}: orphan </${name}> (no matching open)`);
      } else if (found < stack.length - 1) {
        for (let i = stack.length - 1; i > found; i--) {
          errs.push(
            `Line ${getLine(clean, pos, lineOffset)}: </${name}> closes but <${stack[i].tag}> (line ${stack[i].line}) still open`,
          );
        }
        stack.length = found;
      } else {
        stack.pop();
      }
    } else if (!m.selfClose) {
      stack.push({ tag: m.tag, line: getLine(clean, pos, lineOffset) });
    }
  }
  return errs;
}

// ──── main ────
const files = collectVueFiles(VIEWS_DIR);
let total = 0;
console.log(`\nScanning ${files.length} .vue files...\n`);

for (const file of files) {
  const tpl = extractTemplate(readFileSync(file, "utf-8"));
  if (!tpl) continue;
  const errs = validate(tpl.tpl, tpl.offset);
  if (errs.length > 0) {
    total += errs.length;
    console.log(`FAIL  ${path.relative(VIEWS_DIR, file)}:`);
    errs.forEach((e) => console.log(`      ${e}`));
  }
}

if (total === 0) {
  console.log("OK   All templates valid!\n");
  process.exit(0);
} else {
  console.log(`\n${total} detected issue(s).\n`);
  process.exit(1);
}
