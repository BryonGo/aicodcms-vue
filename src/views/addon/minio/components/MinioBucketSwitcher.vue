<template>
  <div class="minio-bucket-panel">
    <div class="bucket-header">
      <el-icon :size="18"><Collection /></el-icon>
      <span>{{ $t("message.pms.minio.bucketName") }}</span>
    </div>
    <el-menu :default-active="store.currentBucket" class="bucket-menu" @select="onSelect">
      <el-menu-item v-for="bucket in store.buckets" :key="bucket.name" :index="bucket.name">
        <el-icon><Collection /></el-icon>
        <span>{{ bucket.name }}</span>
      </el-menu-item>
    </el-menu>
    <div v-if="store.buckets.length === 0" class="bucket-empty">
      <el-icon :size="32" color="#c0c4cc"><Collection /></el-icon>
      <p>{{ $t("message.pms.minio.noBucket") }}</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useMinioStore } from "../store";
import { Collection } from "@element-plus/icons-vue";

export default defineComponent({
  name: "MinioBucketSwitcher",
  setup() {
    const store = useMinioStore();

    function onSelect(index: string) {
      if (index !== store.currentBucket) {
        store.switchBucket(index);
      }
    }

    return { store, onSelect, Collection };
  },
});
</script>

<style scoped>
.minio-bucket-panel {
  width: 210px;
  min-width: 210px;
  background: var(--cc-color-bg-elevated);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;

  &::after {
    content: "";
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    width: 1px;
    background: linear-gradient(
      180deg,
      transparent 0%,
      var(--cc-color-primary-soft) 40%,
      var(--cc-color-primary) 60%,
      transparent 100%
    );
  }

  .bucket-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 16px 16px 14px;
    font-weight: 600;
    font-size: 13px;
    color: var(--cc-color-text-3);
    letter-spacing: 1px;
    text-transform: uppercase;
    border-bottom: 1px solid var(--cc-color-border-light);
    user-select: none;

    .el-icon {
      color: var(--cc-color-primary);
    }
  }

  .bucket-menu {
    flex: 1;
    overflow-y: auto;
    background: transparent;
    border-right: none;
    padding: 6px 0;

    &::-webkit-scrollbar {
      width: 4px;
    }
    &::-webkit-scrollbar-track {
      background: transparent;
    }
    &::-webkit-scrollbar-thumb {
      background: var(--cc-color-border-light);
      border-radius: var(--cc-radius-xs);
    }

    .el-menu-item {
      height: 42px;
      line-height: 42px;
      padding: 0 16px !important;
      color: var(--cc-color-text-3);
      font-size: 13px;
      border-left: 3px solid transparent;
      transition: all 0.2s ease;
      margin: 1px 6px;
      border-radius: var(--cc-radius-md);

      &:hover {
        background: var(--cc-color-primary-softer);
        color: var(--cc-color-text-2);
      }

      &.is-active {
        color: var(--cc-color-text-1);
        background: var(--cc-color-primary-soft);
        border-left-color: var(--cc-color-primary);
        font-weight: 500;
      }

      .el-icon {
        color: var(--cc-color-text-4);
        margin-right: 8px;
        font-size: 16px;
      }

      &.is-active .el-icon {
        color: var(--cc-color-primary);
      }
    }
  }

  .bucket-empty {
    text-align: center;
    padding: 40px 16px;
    color: var(--cc-color-text-4);
    p {
      margin-top: 8px;
      font-size: 13px;
    }
  }
}
</style>
