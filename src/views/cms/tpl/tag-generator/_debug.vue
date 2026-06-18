<template>
  <div style="padding: 20px; font-family: monospace">
    <h2>Tag Generator Debug</h2>
    <div style="margin: 10px 0">
      <el-button @click="fetchCatalog">Fetch Catalog</el-button>
      <el-button @click="testPreview">Test Preview</el-button>
    </div>
    <pre
      style="
        background: #1e1e1e;
        color: #d4d4d4;
        padding: 16px;
        border-radius: 6px;
        overflow: auto;
        max-height: 80vh;
        white-space: pre-wrap;
        word-break: break-all;
      "
      >{{ output }}</pre
    >
  </div>
</template>
<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { getTagCatalog, previewTag } from "/@/api/cms/tpl";
const { t } = useI18n();
const output = ref(t("message.cms.tpl.waiting"));

async function fetchCatalog() {
  output.value = t("message.common.loading");
  try {
    const res = await getTagCatalog();
    output.value = JSON.stringify(
      {
        fullResponse: res,
        catalogsCount: res.data?.catalogs?.length,
        firstCat: res.data?.catalogs?.[0]?.id,
        functionsCount: res.data?.catalogs?.reduce(
          (s: number, c: any) => s + c.functions.length,
          0,
        ),
        ...res.data,
      },
      null,
      2,
    );
  } catch (e: any) {
    output.value = `Error: ${e.message || e}`;
  }
}

async function testPreview() {
  output.value = t("message.common.loading");
  try {
    const res = await previewTag({
      catalog: "article",
      name: "list",
      attrs: { limit: "5", cat_id: "1" },
    });
    output.value = JSON.stringify(res, null, 2);
  } catch (e: any) {
    output.value = `Error: ${e.message || e}`;
  }
}
</script>
