/**
 * Vue 模板标签校验工具
 * 批量检测所有 .vue 文件中的闭合标签匹配问题
 * 用法: npx tsx scripts/validate-templates.ts
 */
import { readFileSync } from "fs";
import { globSync } from "glob";

const VIEWS_DIR = "src/views";

// 提取 <template> 内容
function extractTemplate(content: string): { template: string; lineOffset: number } | null {
  const match = content.match(/<template>([\s\S]*?)<\/template>/);
  if (!match) return null;
  const lineOffset =
    content.substring(0, match.index! + "<template>".length).split("\n").length - 1;
  return { template: match[1], lineOffset };
}

// 自闭合标签列表
const SELF_CLOSING = new Set([
  "br",
  "hr",
  "img",
  "input",
  "meta",
  "link",
  "area",
  "base",
  "col",
  "embed",
  "source",
  "track",
  "wbr",
  "el-icon",
  "router-link",
  "router-view",
  "SvgIcon",
  "IconSelector",
  "pagination",
]);

// 解析标签栈，返回不匹配错误
function validateTags(template: string, lineOffset: number): string[] {
  const errors: string[] = [];
  const tagRe = /<\/?([\w-]+)[^>]*\/?>|<!--[\s\S]*?-->/g;
  const stack: { tag: string; line: number }[] = [];
  let m;

  while ((m = tagRe.exec(template))) {
    if (m[0].startsWith("<!--")) continue; // 跳过注释

    const fullTag = m[0];
    const tagName = m[1];
    const isClosing = fullTag.startsWith("</");
    const isSelfClosing = fullTag.endsWith("/>") || SELF_CLOSING.has(tagName);

    if (isClosing) {
      if (stack.length === 0) {
        const line = lineOffset + template.substring(0, m.index!).split("\n").length;
        errors.push(`Line ${line}: orphan closing tag </${tagName}>`);
      } else {
        const open = stack[stack.length - 1];
        if (open.tag !== tagName) {
          const line = lineOffset + template.substring(0, m.index!).split("\n").length;
          errors.push(
            `Line ${line}: mismatched closing tag </${tagName}>, expected </${open.tag}> (opened at template line ${open.line})`,
          );
        }
        stack.pop();
      }
    } else if (!isSelfClosing) {
      const line = lineOffset + template.substring(0, m.index!).split("\n").length;
      stack.push({ tag: tagName, line });
    }
  }

  // 未闭合的标签
  for (const item of stack.reverse()) {
    errors.push(`Line ${item.line}: unclosed tag <${item.tag}>`);
  }

  return errors;
}

// 主函数
function main() {
  const files = globSync(`${VIEWS_DIR}/**/*.vue`);
  let totalErrors = 0;

  console.log(`\n🔍 Scanning ${files.length} .vue files...\n`);

  for (const file of files) {
    const content = readFileSync(file, "utf-8");
    const extracted = extractTemplate(content);
    if (!extracted) {
      console.log(`⚠️  ${file}: no <template> found`);
      continue;
    }

    const errors = validateTags(extracted.template, extracted.lineOffset);
    if (errors.length > 0) {
      totalErrors += errors.length;
      console.log(`❌ ${file}:`);
      errors.forEach((e) => console.log(`   ${e}`));
    }
  }

  if (totalErrors === 0) {
    console.log("✅ All templates valid!\n");
  } else {
    console.log(`\n❗ ${totalErrors} error(s) found in total.\n`);
    process.exit(1);
  }
}

main();
