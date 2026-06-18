<template>
  <el-dialog
    :title="$t('message.pms.minio.newDirTitle')"
    v-model="store.newDirDialogVisible"
    width="400px"
    @close="dirName = ''"
  >
    <el-form label-width="80px">
      <el-form-item :label="$t('message.pms.minio.labelDirName')">
        <el-input
          v-model="dirName"
          :placeholder="$t('message.pms.minio.placeholderPrefix')"
          clearable
          @keyup.enter="submit"
        />
      </el-form-item>
      <el-form-item :label="$t('message.pms.minio.labelParentPath')">
        <el-input :value="store.currentPrefix || '/'" disabled />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="store.newDirDialogVisible = false">{{
        $t("message.pms.minio.cancel")
      }}</el-button>
      <el-button type="primary" :loading="creating" @click="submit">{{
        $t("message.common.add")
      }}</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { ElMessage } from "element-plus";
import { useMinioStore } from "../store";
import { mkdirMinioDir } from "/@/api/addon/minio";
import { useI18n } from "vue-i18n";

export default defineComponent({
  name: "MinioNewDirDialog",
  setup() {
    const { t } = useI18n();
    const store = useMinioStore();
    const dirName = ref("");
    const creating = ref(false);

    async function submit() {
      if (!dirName.value.trim()) {
        ElMessage.warning(t("message.minio.pleaseEnterDirName"));
        return;
      }
      creating.value = true;
      try {
        const path = store.currentPrefix + dirName.value.replace(/\/$/, "") + "/";
        await mkdirMinioDir(path);
        ElMessage.success(t("message.minio.dirCreated"));
        store.newDirDialogVisible = false;
        dirName.value = "";
        await store.fetchFiles();
      } catch (err: any) {
        ElMessage.error(t("message.pms.minio.mkdirFail") + (err.message || ""));
      } finally {
        creating.value = false;
      }
    }

    return { store, dirName, creating, submit };
  },
});
</script>

<style scoped>
:deep(.el-dialog) {
  border-radius: var(--cc-radius-lg);
  .el-dialog__header {
    padding: 18px 20px 12px;
    margin: 0;
    .el-dialog__title {
      font-size: 16px;
      font-weight: 600;
    }
  }
  .el-dialog__body {
    padding: 16px 20px;
  }
  .el-dialog__footer {
    padding: 8px 20px 16px;
    border-top: 1px solid #f0f2f5;
  }
}
</style>
