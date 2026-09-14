<template>
  <div v-if="visible" class="update-bar" role="status" aria-live="polite">
    <el-icon class="update-bar__icon"><Refresh /></el-icon>
    <span class="update-bar__text">
      {{ t('message.updateBar.title') }}
      <em v-if="shortVersion">{{ shortVersion }}</em>
      <template v-if="watcher.paused.value">· {{ t('message.updateBar.paused') }}</template>
      <template v-else-if="watcher.countdown.value > 0">· {{ t('message.updateBar.autoIn', { n: watcher.countdown.value }) }}</template>
    </span>
    <el-button type="primary" size="small" @click="watcher.reload()">{{ t('message.updateBar.refreshNow') }}</el-button>
    <el-button link size="small" :title="t('message.updateBar.laterTip')" @click="watcher.dismiss()">{{ t('message.updateBar.later') }}</el-button>
  </div>
</template>

<script setup lang="ts" name="updateBar">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { Refresh } from '@element-plus/icons-vue';
import { useVersionWatcher } from '/@/composables/useVersionWatcher';

const { t } = useI18n();
const watcher = useVersionWatcher();

const visible = computed(() => !!watcher.available.value && !watcher.dismissed.value);
// 镜像 tag 形如 20260914151045-96ce975：只显示短 sha，避免提示条过长
const shortVersion = computed(() => {
  const v = watcher.available.value;
  if (!v) return '';
  const parts = v.split('-');
  return parts.length > 1 ? parts[parts.length - 1] : v;
});
</script>

<style scoped>
.update-bar {
  position: fixed;
  top: 14px;
  left: 50%;
  z-index: 3000;
  display: flex;
  align-items: center;
  gap: 10px;
  max-width: min(92vw, 620px);
  padding: 8px 12px;
  border: 1px solid var(--el-color-primary-light-5);
  border-radius: 999px;
  background: var(--el-bg-color-overlay, #fff);
  box-shadow: 0 8px 24px rgb(0 0 0 / 18%);
  font-size: 13px;
  transform: translateX(-50%);
}
.update-bar__icon {
  color: var(--el-color-primary);
}
.update-bar__text {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.update-bar__text em {
  margin-left: 4px;
  color: var(--el-text-color-secondary);
  font-style: normal;
  font-size: 11px;
}
</style>
