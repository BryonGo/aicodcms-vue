<template>
  <div class="pro-toolbar">
    <div class="pro-toolbar__left">
      <slot name="left" />
      <slot />
    </div>
    <div class="pro-toolbar__right">
      <slot name="right" />
      <el-tooltip v-if="showRefresh" content="Refresh" placement="top">
        <el-button :icon="RefreshIcon" circle text @click="$emit('refresh')" />
      </el-tooltip>
      <el-dropdown v-if="showDensity" trigger="click" @command="$emit('update:size', $event)">
        <el-tooltip content="Density" placement="top">
          <el-button :icon="ScaleIcon" circle text />
        </el-tooltip>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="large" :class="{ 'is-active': size === 'large' }"
              >Large</el-dropdown-item
            >
            <el-dropdown-item command="default" :class="{ 'is-active': size === 'default' }"
              >Default</el-dropdown-item
            >
            <el-dropdown-item command="small" :class="{ 'is-active': size === 'small' }"
              >Compact</el-dropdown-item
            >
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Refresh as RefreshIcon, Operation as ScaleIcon } from "@element-plus/icons-vue";

defineProps({
  showRefresh: { type: Boolean, default: true },
  showDensity: { type: Boolean, default: true },
  size: { type: String, default: "default" },
});

defineEmits<{
  (e: "refresh"): void;
  (e: "update:size", size: string): void;
}>();
</script>

<style scoped>
.pro-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--cc-space-3);
  flex-wrap: wrap;
  padding-bottom: var(--cc-space-3);
}
.pro-toolbar__left,
.pro-toolbar__right {
  display: flex;
  align-items: center;
  gap: var(--cc-space-2);
  flex-wrap: wrap;
}
.is-active {
  color: var(--cc-color-primary);
  font-weight: 600;
}
</style>
