// Batch-add missing i18n keys to the correct lang files (zh-cn + en).
// Keys are merged into existing top-level objects or appended as new ones;
// duplicates are avoided per object.
// 批量补缺失的 i18n 键到对应语言文件（zh-cn + en），已存在对象内合并，不存在则新建。
import { readFileSync, writeFileSync } from 'node:fs';

const ROOT = 'D:/code/go-sdk-vue/src/i18n';

// 文案表：[zh, en]
const T = {
  // lang 顶层
  'comment.status': ['状态', 'Status'],
  'comment.action': ['操作', 'Actions'],
  'comment.delete': ['删除', 'Delete'],
  'form.time': ['时间', 'Time'],
  'form.confirm': ['确认', 'Confirm'],
  'form.deleted': ['已删除', 'Deleted'],
  'form.createTime': ['创建时间', 'Created'],
  'form.action': ['操作', 'Actions'],
  'form.delete': ['删除', 'Delete'],
  'form.status': ['状态', 'Status'],
  'common.saveSuccess': ['保存成功', 'Saved'],
  'common.deleteSuccess': ['删除成功', 'Deleted'],
  'common.pressEscToClose': ['按 Esc 关闭', 'Press Esc to close'],
  'common.batchDelete': ['批量删除', 'Batch Delete'],
  'addon_sitemap.generateFailed': ['生成失败', 'Generation failed'],
  'addon_sitemap.responsePrefix': ['返回前缀', 'Response prefix'],
  'addon_sitemap.pushFailed': ['推送失败', 'Push failed'],
  'webhook.status': ['状态', 'Status'],
  'webhook.createTime': ['创建时间', 'Created'],
  'webhook.action': ['操作', 'Actions'],
  'webhook.delete': ['删除', 'Delete'],
  'webhook.cancel': ['取消', 'Cancel'],
  'webhook.saved': ['已保存', 'Saved'],
  'webhook.created': ['已创建', 'Created'],
  'webhook.confirm': ['确认', 'Confirm'],
  'webhook.deleted': ['已删除', 'Deleted'],
  'cmsArticle.action': ['操作', 'Actions'],
  'cmsArticle.unknown': ['未知', 'Unknown'],
  'cmsArticle.btnRegenerateStatic': ['重新生成静态页', 'Regenerate static pages'],
  'cmsArticle.cancel': ['取消', 'Cancel'],
  'cmsArticle.confirmBatchRegen': ['确认批量重新生成所选文章的静态页？', 'Regenerate static pages for selected articles?'],
  'cmsArticle.titleBatchRegen': ['批量重新生成', 'Batch regeneration'],
  'cmsArticle.msgRegenerating': ['正在重新生成，请稍候…', 'Regenerating, please wait…'],
  'cmsArticle.msgRegenerateDone': ['重新生成完成', 'Regeneration complete'],
  'router.cmsArticleAdd': ['添加文章', 'Add Article'],
  'editSuccess': ['修改成功', 'Updated'],
  'addSuccess': ['添加成功', 'Added'],
  'weightUpdated': ['权重已更新', 'Weight updated'],
  'saveSuccess': ['保存成功', 'Saved'],
  'createSuccess': ['创建成功', 'Created'],
  'deleteSuccess': ['删除成功', 'Deleted'],
  // pages/cms
  'cms.msgSaveFailed': ['保存失败', 'Save failed'],
  'cms.tpl.waiting': ['等待中', 'Waiting'],
  'cms.articleList.flagHot': ['热门', 'Hot'],
  'cms.articleList.flagNew': ['最新', 'New'],
  'cms.articleList.flagRecommend': ['推荐', 'Recommended'],
  'cms.articleList.flagTop': ['置顶', 'Top'],
  'cms.blockEdit.transTitle': ['标题翻译', 'Title translation'],
  'cms.blockEdit.transContent': ['内容翻译', 'Content translation'],
  'cms.blockEdit.msgTypeRequired': ['请选择区块类型', 'Please select block type'],
  'cms.pageEdit.notFound': ['页面不存在', 'Page not found'],
  // pages/pms
  'pms.minio.tags': ['标签', 'Tags'],
  'pms.dept.email': ['邮箱', 'Email'],
  'pms.monitor.cacheTitle': ['缓存管理', 'Cache'],
  'pms.monitor.serverTitle': ['服务器信息', 'Server'],
  'pms.monitor.onlineTitle': ['在线用户', 'Online Users'],
  'pms.dictDataList.breadcrumbCurrent': ['字典数据', 'Dict Data'],
  'pms.dictDataList.confirmDeleteMulti': ['确认删除选中的数据？', 'Delete selected items?'],
  'pms.modulesField.expandSearch': ['展开搜索', 'Expand search'],
  'pms.modulesField.collapseSearch': ['收起搜索', 'Collapse search'],
  'pms.modulesFieldEdit.notFound': ['模型字段不存在', 'Model field not found'],
  'pms.modulesInfoList.pageSubtitle': ['自定义模型管理', 'Custom models'],
  'pms.operLog.detailTitle': ['日志详情', 'Log Detail'],
  'pms.post.confirmDeleteBatch': ['确认删除选中的岗位？', 'Delete selected posts?'],
  'pms.post.confirmDeleteSingle': ['确认删除该岗位？', 'Delete this post?'],
  'pms.systemManagementPostAdd': ['添加岗位', 'Add Post'],
  // pages/sdk
  'sdk.payChannel.placeholderName': ['请输入通道名称', 'Enter channel name'],
  'sdk.payConfig.colCode': ['编号', 'Code'],
  'sdk.ban.colUserId': ['用户ID', 'User ID'],
  'sdk.order.status': ['状态', 'Status'],
  // 注：login 页（account/mobile/scan/signInText）键原本已存在于 pages/login，无需补充；
  // 复检脚本对其命名空间的处理见 check-i18n-refs.mjs（login 顶层展开，无前缀）。
};

// 文件路由：前缀 → 文件
const FILES = {
  lang: `${ROOT}/lang/`,
  cms: `${ROOT}/pages/cms/`,
  pms: `${ROOT}/pages/pms/`,
  sdk: `${ROOT}/pages/sdk/`,
  login: `${ROOT}/pages/login/`,
};

function route(key) {
  const [head, ...rest] = key.split('.');
  if (head === 'cms' || head === 'pms' || head === 'sdk' || head === 'login') {
    return { file: FILES[head], path: rest };
  }
  if (head === 'account' || head === 'mobile' || head === 'scan') {
    return { file: FILES.login, path: key.split('.') };
  }
  if (head === 'signInText') {
    return { file: FILES.login, path: [key] };
  }
  return { file: FILES.lang, path: key.split('.') };
}

// 解析顶层对象位置：返回 [{name, start, end, bodyStart, bodyEnd}]（end 为对象右括号后一位）
function topLevelObjects(src) {
  const objs = [];
  const re = /^\s*([A-Za-z0-9_$]+)\s*:/gm;
  let m;
  while ((m = re.exec(src)) !== null) {
    const name = m[1];
    let i = m.index + m[0].length;
    while (i < src.length && /\s/.test(src[i])) i++;
    if (src[i] !== '{') continue;
    let depth = 1;
    let j = i + 1;
    while (j < src.length && depth > 0) {
      if (src[j] === '{') depth++;
      else if (src[j] === '}') depth--;
      j++;
    }
    objs.push({ name, start: m.index, end: j, bodyStart: i + 1, bodyEnd: j - 1 });
  }
  return objs;
}

function findObject(objs, name) {
  // 取最后一个同名对象（重复键后者覆盖）
  for (let i = objs.length - 1; i >= 0; i--) if (objs[i].name === name) return objs[i];
  return null;
}

function esc(v) {
  return v.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

// 对单个文件执行插入；返回修改后的内容
function applyFile(file, inserts) {
  // inserts: { path: [zh,en] }，path 为相对对象的路径（首段为顶层对象名）
  let src = readFileSync(file, 'utf8');
  // 按顶层对象分组
  const byTop = new Map();
  for (const key of Object.keys(inserts)) {
    const [top, ...rest] = inserts[key].path;
    if (!byTop.has(top)) byTop.set(top, []);
    byTop.get(top).push({ key, rest, zh: inserts[key].zh, en: inserts[key].en });
  }
  for (const [top, entries] of byTop) {
    const objs = topLevelObjects(src);
    const obj = findObject(objs, top);
    const valueOf = (e) => (e.zh !== undefined ? e.zh : e.en);
    // 单段键（rest 为空）：直接插入扁平键行
    const flat = entries.filter((e) => e.rest.length === 0);
    const nested = entries.filter((e) => e.rest.length > 0);
    if (obj) {
      const body = src.slice(obj.bodyStart, obj.bodyEnd);
      const lines = [];
      const seen = new Set();
      for (const e of [...flat, ...nested]) {
        const k = e.rest.join('.');
        if (seen.has(k)) continue;
        seen.add(k);
        // 已存在同名键则跳过（防止重复属性）
        if (new RegExp(`(^|[\\s,{])\\s*${k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*:`).test(body)) continue;
        lines.push(`    ${k}: "${esc(valueOf(e))}",`);
      }
      if (lines.length) {
        const ins = '\n' + lines.join('\n');
        src = src.slice(0, obj.bodyEnd) + ins + src.slice(obj.bodyEnd);
      }
    } else {
      // 新建顶层对象或扁平键，追加到文件末尾（最后一个 } 之前）。
      // 若顶层已存在同名键/对象（仅限 0-2 空格缩进，避免误匹配嵌套键），跳过。
      const headRe = new RegExp(`^ {0,2}${top.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*:`, 'm');
      if (headRe.test(src)) continue;
      const idx = src.lastIndexOf('}');
      const lines = [];
      for (const e of flat) lines.push(`  ${top}: "${esc(valueOf(e))}",`);
      if (nested.length) {
        lines.push(`  ${top}: {`);
        for (const e of nested) lines.push(`    ${e.rest.join('.')}: "${esc(valueOf(e))}",`);
        lines.push(`  },`);
      }
      if (lines.length) src = src.slice(0, idx) + '\n' + lines.join('\n') + '\n' + src.slice(idx);
    }
  }
  return src;
}

// 组装每个文件的插入任务
const byFile = {};
for (const [key, [zh, en]] of Object.entries(T)) {
  const r = route(key);
  if (!byFile[r.file]) byFile[r.file] = {};
  byFile[r.file][key] = { path: r.path, zh, en };
}

for (const [dir, inserts] of Object.entries(byFile)) {
  const zhFile = `${dir}zh-cn.ts`;
  const enFile = `${dir}en.ts`;
  // 分别构建 zh/en 插入（路径相同，值不同）
  const zhIns = {};
  const enIns = {};
  for (const [k, v] of Object.entries(inserts)) {
    zhIns[k] = { path: v.path, zh: v.zh };
    enIns[k] = { path: v.path, en: v.en };
  }
  const outZh = applyFile(zhFile, zhIns);
  const outEn = applyFile(enFile, enIns);
  writeFileSync(zhFile, outZh, 'utf8');
  writeFileSync(enFile, outEn, 'utf8');
  console.log(`updated ${zhFile} / ${enFile}`);
}