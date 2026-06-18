<template>
  <div class="pms-card-container language-manage">
    <el-breadcrumb separator="→" class="mb15">
      <el-breadcrumb-item :to="{ path: '/' }"
        ><el-icon><HomeFilled /></el-icon> {{ $t("message.router.home") }}</el-breadcrumb-item
      >
      <el-breadcrumb-item>{{ $t("message.cms.tplList.breadcrumbCms") }}</el-breadcrumb-item>
      <el-breadcrumb-item>{{ $t("message.cms.setting.breadcrumbCurrent") }}</el-breadcrumb-item>
      <el-breadcrumb-item>{{ $t("message.cms.language.title") }}</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card shadow="never" class="mb20">
      <template #header>
        <div class="card-header">
          <span class="title">{{ $t("message.cms.language.title") }}</span>
          <span class="subtitle">{{ $t("message.cms.language.subtitle") }}</span>
        </div>
      </template>

      <div class="toolbar">
        <el-alert
          :title="$t('message.cms.language.alertTitle')"
          type="error"
          :closable="false"
          show-icon
          class="mb20"
        >
          {{ $t("message.cms.language.alertDesc", { lang: defaultLang, file: "{lang}.toml" }) }}
        </el-alert>
      </div>

      <el-table :data="tableData" stripe v-loading="loading" style="width: 100%">
        <el-table-column :label="$t('message.cms.language.flagCol')" width="70" align="center">
          <template #default="{ row }">
            <span class="flag-icon">{{ row.flag }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="code" :label="$t('message.cms.language.codeCol')" width="140" />
        <el-table-column
          prop="nativeName"
          :label="$t('message.cms.language.nativeNameCol')"
          width="180"
        />
        <el-table-column
          prop="name"
          :label="$t('message.cms.language.englishNameCol')"
          min-width="200"
        />
        <el-table-column
          :label="$t('message.cms.language.directionCol')"
          width="100"
          align="center"
        >
          <template #default="{ row }">
            <el-tag :type="row.rtl ? 'warning' : 'info'" size="small">
              {{ row.rtl ? "RTL" : "LTR" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="$t('message.cms.language.statusCol')" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.enabled ? 'success' : 'info'" size="small">
              {{
                row.enabled
                  ? $t("message.cms.language.statusActive")
                  : $t("message.cms.language.statusInactive")
              }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('message.cms.language.actionCol')"
          width="140"
          align="center"
          fixed="right"
        >
          <template #default="{ row }">
            <el-button v-if="!row.enabled" type="primary" size="small" @click="handleActivate(row)">
              {{ $t("message.cms.language.btnActivate") }}
            </el-button>
            <el-popconfirm
              v-else-if="row.code !== defaultLang"
              :title="$t('message.cms.language.deactivateConfirm')"
              @confirm="handleDeactivate(row)"
            >
              <template #reference>
                <el-button type="danger" size="small">{{
                  $t("message.cms.language.btnDeactivate")
                }}</el-button>
              </template>
            </el-popconfirm>
            <el-tooltip v-else :content="$t('message.cms.language.defaultTooltip')">
              <el-button type="info" size="small" disabled>{{
                $t("message.cms.language.labelDefault")
              }}</el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <div class="mt20 text-secondary">
        {{ $t("message.cms.language.summary", { active: activeCount, total: totalCount }) }}
      </div>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { ElMessage } from "element-plus";
import { getLanguageCatalog, activateLanguage, deactivateLanguage } from "/@/api/cms/setting";
import type { LanguageInfo } from "/@/api/cms/setting";

const { t } = useI18n();

const loading = ref(false);
const tableData = ref<LanguageInfo[]>([]);
const defaultLang = ref("zh-CN");

const activeCount = computed(() => tableData.value.filter((l) => l.enabled).length);
const totalCount = computed(() => tableData.value.length);

async function fetchCatalog() {
  loading.value = true;
  try {
    const res: any = await getLanguageCatalog();
    tableData.value = res?.data?.catalog || [];
    defaultLang.value = res?.data?.default || "zh-CN";
  } catch {
    ElMessage.error(t("message.cms.language.fetchFailed"));
  } finally {
    loading.value = false;
  }
}

async function handleActivate(row: LanguageInfo) {
  try {
    await activateLanguage(row.code);
    ElMessage.success(t("message.cms.language.activated", { name: row.nativeName }));
    await fetchCatalog();
  } catch (e: any) {
    ElMessage.error(e?.message || t("message.cms.language.activateFailed"));
  }
}

async function handleDeactivate(row: LanguageInfo) {
  try {
    await deactivateLanguage(row.code);
    ElMessage.success(t("message.cms.language.deactivated", { name: row.nativeName }));
    await fetchCatalog();
  } catch (e: any) {
    ElMessage.error(e?.message || t("message.cms.language.deactivateFailed"));
  }
}

onMounted(() => {
  fetchCatalog();
});
</script>

<style scoped>
.language-manage {
  padding: 0;
}

.card-header {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.card-header .title {
  font-size: 16px;
  font-weight: 600;
}

.card-header .subtitle {
  font-size: 13px;
  color: #909399;
}

.flag-icon {
  font-size: 22px;
}

.text-secondary {
  color: var(--cc-color-text-3);
  font-size: var(--cc-font-13);
}
.pms-card-container {
  max-width: 1400px;
  margin: 0 auto;
}
.pms-card-container :deep(.el-card) {
  border: 1px solid var(--cc-color-border-light) !important;
  border-radius: var(--cc-radius-lg) !important;
  padding: 20px 24px !important;
}
@media (min-width: 1441px) {
  .pms-card-container {
    max-width: none !important;
    padding: 0 40px;
  }
}
</style>
