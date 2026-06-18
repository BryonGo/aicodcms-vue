<template>
  <div class="pms-card-container">
    <el-breadcrumb separator="→" class="mb15">
      <el-breadcrumb-item :to="{ path: '/' }"
        ><el-icon><HomeFilled /></el-icon> {{ $t("message.router.home") }}</el-breadcrumb-item
      >
      <el-breadcrumb-item>{{ $t("message.pms.systemManagement") }}</el-breadcrumb-item>
      <el-breadcrumb-item>{{ $t("message.pms.monitor.cacheTitle") }}</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card shadow="hover">
      <template #header>
        <span>{{ $t("message.pms.cache.title") }}</span>
      </template>

      <!-- Stats Row -->
      <el-row :gutter="20" class="mb15">
        <el-col :span="8">
          <el-statistic
            :title="$t('message.pms.cache.mode')"
            :value="stats.redis_mode ? 'Redis' : $t('message.pms.cache.memory')"
          />
        </el-col>
        <el-col :span="8">
          <el-statistic :title="$t('message.pms.cache.entries')" :value="stats.size" />
        </el-col>
        <el-col :span="8">
          <el-statistic
            :title="$t('message.pms.cache.redisAlive')"
            :value="
              stats.redis_alive ? $t('message.pms.cache.alive') : $t('message.pms.cache.dead')
            "
            :value-style="{ color: stats.redis_alive ? '#67C23A' : '#F56C6C' }"
          />
        </el-col>
      </el-row>

      <el-divider />

      <!-- i18n Language Cache -->
      <h4 class="mb15">{{ $t("message.pms.cache.i18nTitle") }}</h4>
      <el-row :gutter="12" class="mb15">
        <el-col :span="6" v-for="(cached, lang) in stats.i18n_cached" :key="lang">
          <el-card shadow="never" :body-style="{ padding: '12px' }">
            <el-tag :type="cached ? 'success' : 'info'" size="large">
              {{ lang }}
            </el-tag>
            <span class="ml10" :class="cached ? 'text-success' : 'text-warning'">
              {{ cached ? $t("message.pms.cache.loaded") : $t("message.pms.cache.unloaded") }}
            </span>
          </el-card>
        </el-col>
      </el-row>

      <el-divider />

      <!-- Clear Buttons -->
      <h4 class="mb15">{{ $t("message.pms.cache.batchClear") }}</h4>
      <el-row :gutter="12">
        <el-col :span="6" v-for="btn in clearButtons" :key="btn.tag">
          <el-button
            :type="btn.type"
            :plain="btn.plain"
            size="large"
            class="w100"
            :loading="clearing === btn.tag"
            @click="handleClear(btn.tag)"
          >
            {{ btn.label }}
          </el-button>
        </el-col>
      </el-row>

      <!-- Result Feedback -->
      <el-alert
        v-if="resultMsg"
        :title="resultMsg"
        :type="resultType"
        show-icon
        closable
        class="mt15"
        @close="resultMsg = ''"
      />
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { getCacheStats, removeCache, type CacheStats, type CacheRemoveRes } from "/@/api/pms/cache";
import { ElMessage } from "element-plus";
import { useI18n } from "vue-i18n";
const { t } = useI18n();

const stats = ref<CacheStats>({
  size: 0,
  redis_mode: false,
  redis_alive: false,
  i18n_cached: {},
});

const clearing = ref<string>("");
const resultMsg = ref<string>("");
const resultType = ref<"success" | "error">("success");

const clearButtons = [
  { tag: "i18n", label: t("message.pms.cache.clearI18n"), type: "warning", plain: true },
  { tag: "admin", label: t("message.pms.cache.clearAdmin"), type: "", plain: true },
  { tag: "cms", label: t("message.pms.cache.clearCms"), type: "primary", plain: true },
  { tag: "all", label: t("message.pms.cache.clearAll"), type: "danger", plain: false },
];

async function loadStats() {
  try {
    const res: any = await getCacheStats();
    stats.value = res.data || res;
  } catch {
    ElMessage.error(t("message.pms.cache.fetchStatsFail"));
  }
}

async function handleClear(tag: string) {
  clearing.value = tag;
  resultMsg.value = "";
  try {
    const res: CacheRemoveRes = (await removeCache(tag)) as any;
    const d = (res as any).data || res;
    const count = d.keys_removed ?? 0;
    resultType.value = "success";
    resultMsg.value = t("message.pms.cache.clearResult", { tag, count });
    await loadStats();
  } catch {
    resultType.value = "error";
    resultMsg.value = t("message.pms.cache.clearFailed", { tag });
  } finally {
    clearing.value = "";
  }
}

onMounted(() => loadStats());
</script>

<style scoped>
.pms-card-container {
  padding: 16px;
}
.mb15 {
  margin-bottom: 15px;
}
.ml10 {
  margin-left: 10px;
}
.mt15 {
  margin-top: 15px;
}
.w100 {
  width: 100%;
}
.text-success {
  color: #67c23a;
}
.text-warning {
  color: #e6a23c;
}
</style>
