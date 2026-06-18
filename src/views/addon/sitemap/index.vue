<template>
  <ProPage
    :title="$t('message.cms.sitemap.breadcrumbCurrent')"
    :subtitle="$t('message.cms.sitemap.breadcrumbModule')"
  >
    <div class="sitemap-card">
      <div class="sitemap-card__header">{{ $t("message.cms.sitemap.configTitle") }}</div>
      <ProTable :data="configList" :show-pagination="false" bordered>
        <el-table-column prop="engine" :label="$t('message.cms.sitemap.colEngine')" width="100">
          <template #default="{ row }">
            <el-tag :type="engineType(row.engine)" size="small">{{ row.engine }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="$t('message.cms.sitemap.colToken')" min-width="200">
          <template #default="{ row }">
            <el-input
              v-model="row.token"
              size="small"
              :placeholder="$t('message.cms.sitemap.placeholderToken')"
            />
          </template>
        </el-table-column>
        <el-table-column :label="$t('message.cms.sitemap.colApiUrl')" min-width="300">
          <template #default="{ row }">
            <el-input v-model="row.api_url" size="small" :disabled="!hasPushApi(row.engine)" />
          </template>
        </el-table-column>
        <el-table-column :label="$t('message.cms.sitemap.colEnabled')" width="80">
          <template #default="{ row }">
            <el-switch
              v-model="row.is_enabled"
              :active-value="1"
              :inactive-value="0"
              size="small"
            />
          </template>
        </el-table-column>
        <el-table-column :label="$t('message.cms.sitemap.colPushMethod')" width="120">
          <template #default="{ row }">
            <span class="sitemap-muted">{{ pushMethod(row.engine) }}</span>
          </template>
        </el-table-column>
      </ProTable>
      <div class="sitemap-actions">
        <el-button type="primary" @click="saveConfig">{{
          $t("message.cms.sitemap.saveConfig")
        }}</el-button>
      </div>
    </div>

    <div class="sitemap-card">
      <div class="sitemap-card__header">{{ $t("message.cms.sitemap.generateTitle") }}</div>
      <el-form :inline="true">
        <el-form-item :label="$t('message.addon_sitemap.domain')">
          <el-input
            v-model="domain"
            placeholder="https://example.com"
            size="default"
            style="width: 300px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="doGenerate" :loading="generating">{{
            $t("message.addon_sitemap.generate")
          }}</el-button>
        </el-form-item>
      </el-form>
      <div v-if="generateMsg" class="sitemap-alert">
        <el-alert :title="generateMsg" type="success" show-icon :closable="true" />
      </div>

      <el-divider content-position="left">{{ $t("message.addon_sitemap.push") }}</el-divider>
      <div class="sitemap-push-actions">
        <el-button
          v-for="eng in pushableEngines"
          :key="eng"
          type="success"
          plain
          @click="doPush(eng)"
          :loading="pushing === eng"
        >
          <el-icon><ele-Upload /></el-icon> 推送至 {{ eng }}
        </el-button>
      </div>
      <div v-if="pushMsg" class="sitemap-alert sitemap-alert--top">
        <el-alert :title="pushMsg" type="info" show-icon :closable="true" />
      </div>
    </div>
  </ProPage>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from "vue";
import {
  getSitemapConfig,
  updateSitemapConfig,
  generateSitemap,
  pushSitemap,
  SitemapConfig,
} from "/@/api/addon/sitemap";
import { ElMessage } from "element-plus";
import { useI18n } from "vue-i18n";
import ProPage from "/@/components/pro/ProPage.vue";
import ProTable from "/@/components/pro/ProTable.vue";

export default defineComponent({
  name: "addonSitemap",
  components: { ProPage, ProTable },
  setup() {
    const { t } = useI18n();
    const configList = ref<SitemapConfig[]>([]);
    const domain = ref("https://example.com");
    const generating = ref(false);
    const generateMsg = ref("");
    const pushing = ref("");
    const pushMsg = ref("");
    const pushableEngines = ["baidu", "shenma"];

    const engineType = (engine: string) => {
      const map: Record<string, string> = {
        baidu: "danger",
        google: "primary",
        bing: "success",
        shenma: "warning",
        toutiao: "info",
      };
      return map[engine] || "";
    };

    const hasPushApi = (engine: string) => ["baidu", "shenma"].includes(engine);

    const pushMethod = (engine: string) => {
      const map: Record<string, string> = {
        baidu: t("message.addon_sitemap.pushApi"),
        google: "Search Console",
        bing: "Ping",
        shenma: t("message.addon_sitemap.pushApi"),
        toutiao: t("message.cms.sitemap.backendSubmit"),
      };
      return map[engine] || "";
    };

    const loadConfig = async () => {
      try {
        const res: any = await getSitemapConfig();
        configList.value = res.data?.list || res?.list || [];
      } catch {
        /* ignore */
      }
    };

    const saveConfig = async () => {
      try {
        await updateSitemapConfig(configList.value);
        ElMessage.success(t("message.common.saveSuccess"));
      } catch {
        /* ignore */
      }
    };

    const doGenerate = async () => {
      if (!domain.value) {
        ElMessage.warning(t("message.addon_sitemap.domainRequired"));
        return;
      }
      generating.value = true;
      generateMsg.value = "";
      try {
        const res: any = await generateSitemap(domain.value);
        generateMsg.value =
          res.data?.message || res?.message || t("message.addon_sitemap.generateDone");
      } catch {
        generateMsg.value = t("message.addon_sitemap.generateFailed");
      } finally {
        generating.value = false;
      }
    };

    const doPush = async (engine: string) => {
      pushing.value = engine;
      pushMsg.value = "";
      try {
        const res: any = await pushSitemap(engine, domain.value, 20);
        const d = res.data || res;
        pushMsg.value = t(`${d.success || 0} 条成功，${d.fail || 0} 条失败`);
        if (d.message && d.message !== pushMsg.value)
          pushMsg.value += t("message.addon_sitemap.responsePrefix") + d.message;
      } catch {
        pushMsg.value = t("message.addon_sitemap.pushFailed");
      } finally {
        pushing.value = "";
      }
    };

    onMounted(() => {
      loadConfig();
    });

    return {
      configList,
      domain,
      generating,
      generateMsg,
      pushing,
      pushMsg,
      pushableEngines,
      engineType,
      hasPushApi,
      pushMethod,
      saveConfig,
      doGenerate,
      doPush,
    };
  },
});
</script>

<style scoped>
.sitemap-card {
  background: var(--cc-color-surface);
  border: 1px solid var(--cc-color-border-light);
  border-radius: var(--cc-radius-xl);
  padding: var(--cc-space-5);
  box-shadow: var(--cc-shadow-sm);
}
.sitemap-card__header {
  margin-bottom: var(--cc-space-4);
  color: var(--cc-color-text-1);
  font-weight: 650;
}
.sitemap-actions {
  text-align: center;
  margin-top: var(--cc-space-4);
}
.sitemap-muted {
  font-size: var(--cc-font-12);
  color: var(--cc-color-text-4);
}
.sitemap-alert {
  margin-bottom: var(--cc-space-3);
}
.sitemap-alert--top {
  margin-top: var(--cc-space-3);
}
.sitemap-push-actions {
  display: flex;
  gap: var(--cc-space-2);
  flex-wrap: wrap;
}
</style>
