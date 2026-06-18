const fs = require("fs");
const BASE = "/Users/progogame/code/go/src/codcms/server_vue/src";
const files = [
  "views/cms/article/list/index.vue",
  "views/cms/block/list/index.vue",
  "views/cms/page/list/index.vue",
  "views/cms/tag/list/index.vue",
  "views/pms/monitor/operLog/index.vue",
  "views/pms/dict/dataList.vue",
  "views/pms/modulesInfo/list/index.vue",
  "views/pms/modulesField/list/component/edit.vue",
];

for (const file of files) {
  let content = fs.readFileSync(`${BASE}/${file}`, "utf8");
  if (content.includes("useI18n")) {
    console.log(`  SKIP ${file} (already has useI18n)`);
    continue;
  }
  // Add import
  content = content.replace(/from "vue"/, 'from "vue"\nimport { useI18n } from "vue-i18n"');
  // Add in setup()
  content = content.replace(/setup\(\) \{/, "setup() {\n    const { t } = useI18n();");
  fs.writeFileSync(`${BASE}/${file}`, content, "utf8");
  console.log(`  OK: ${file}`);
}
