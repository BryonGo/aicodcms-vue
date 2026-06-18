<template>
  <el-dialog
    :title="$t('message.pms.minio.renameTitle')"
    v-model="store.renameDialogVisible"
    width="400px"
    @close="onClose"
  >
    <el-form label-width="80px">
      <el-form-item :label="$t('message.pms.minio.labelCurrentName')">
        <el-input :value="oldName" disabled />
      </el-form-item>
      <el-form-item :label="$t('message.pms.minio.labelNewName')">
        <el-input
          v-model="store.renameNewName"
          :placeholder="$t('message.pms.minio.placeholderNewName')"
          clearable
          @keyup.enter="submit"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="store.renameDialogVisible = false">{{
        $t("message.pms.minio.cancel")
      }}</el-button>
      <el-button type="primary" :loading="renaming" @click="submit">{{
        $t("message.common.confirm")
      }}</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from "vue";
import { ElMessage } from "element-plus";
import { useMinioStore } from "../store";
import { displayName } from "../utils";
import { useI18n } from "vue-i18n";

export default defineComponent({
  name: "MinioRenameDialog",
  setup() {
    const { t } = useI18n();
    const store = useMinioStore();
    const renaming = ref(false);
    const oldName = computed(() => (store.renameTarget ? displayName(store.renameTarget.key) : ""));

    async function submit() {
      if (!store.renameTarget || !store.renameNewName.trim()) {
        ElMessage.warning(t("message.minio.pleaseEnterNewName"));
        return;
      }
      renaming.value = true;
      try {
        await store.renameFile(store.renameTarget.key, store.renameNewName.trim());
      } catch {
        ElMessage.error(t("message.minio.renameFailed"));
      } finally {
        renaming.value = false;
      }
    }

    function onClose() {
      store.renameTarget = null;
      store.renameNewName = "";
    }

    return { store, oldName, renaming, submit, onClose };
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
