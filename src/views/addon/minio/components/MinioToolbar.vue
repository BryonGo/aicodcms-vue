<template>
  <div class="minio-toolbar">
    <div class="toolbar-left">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item v-for="(crumb, idx) in store.breadcrumbs" :key="idx">
          <a
            v-if="idx < store.breadcrumbs.length - 1"
            style="color: var(--cc-color-primary); cursor: pointer"
            @click="store.navigateTo(crumb.prefix)"
          >
            {{ crumb.name }}
          </a>
          <span v-else>{{ crumb.name }}</span>
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="toolbar-right">
      <el-button :icon="Refresh" @click="store.fetchFiles()">{{
        $t("message.pms.minio.refresh")
      }}</el-button>
      <el-button type="success" :icon="UploadFilled" @click="store.uploadDialogVisible = true">{{
        $t("message.pms.minio.upload")
      }}</el-button>
      <el-button type="primary" :icon="FolderAdd" @click="store.newDirDialogVisible = true">{{
        $t("message.pms.minio.newDir")
      }}</el-button>
      <el-button :icon="Setting" @click="store.settingsDrawerVisible = true">{{
        $t("message.pms.minio.bucketSettings")
      }}</el-button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useMinioStore } from "../store";
import { Refresh, UploadFilled, FolderAdd, Setting } from "@element-plus/icons-vue";

export default defineComponent({
  name: "MinioToolbar",
  setup() {
    const store = useMinioStore();
    return { store, Refresh, UploadFilled, FolderAdd, Setting };
  },
});
</script>

<style scoped>
.minio-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 20px;
  background: var(--cc-color-surface);
  border-bottom: 1px solid var(--cc-color-border-light);
  gap: 12px;
  flex-wrap: wrap;
  min-height: 52px;

  .toolbar-left {
    flex: 1;
    min-width: 200px;

    :deep(.el-breadcrumb) {
      font-size: 13px;
    }
    :deep(.el-breadcrumb__item:last-child .el-breadcrumb__inner) {
      color: var(--cc-color-text-1);
      font-weight: 600;
    }
    :deep(.el-breadcrumb__inner a) {
      color: var(--cc-color-primary);
      font-weight: 500;
      transition: color 0.2s;
      &:hover {
        color: var(--cc-color-primary-hover);
      }
    }
    :deep(.el-breadcrumb__separator) {
      color: var(--cc-color-text-4);
    }
  }

  .toolbar-right {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    align-items: center;

    :deep(.el-button) {
      --el-button-border-color: var(--cc-color-text-1);
      border-radius: var(--cc-radius-md);
      font-size: 13px;
      transition: all 0.2s ease;

      &:hover {
        transform: translateY(-1px);
        box-shadow: var(--cc-shadow-sm);
      }

      &:active {
        transform: translateY(0);
      }
    }

    :deep(.el-button--success) {
      --el-button-bg-color: var(--cc-color-primary);
      --el-button-border-color: var(--cc-color-primary);
      --el-button-hover-bg-color: var(--cc-color-primary-hover);
      --el-button-hover-border-color: var(--cc-color-primary-hover);
      --el-button-active-bg-color: var(--cc-color-primary-active);
    }

    :deep(.el-button--primary) {
      --el-button-bg-color: var(--cc-color-primary);
      --el-button-border-color: var(--cc-color-primary);
    }
  }
}
</style>
