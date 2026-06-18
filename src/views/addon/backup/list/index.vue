<template>
  <ProPage :title="$t('message.backup.dataBackup')" :subtitle="$t('message.backup.fileList')">
    <template #actions>
      <el-select
        v-model="selectedDriver"
        :placeholder="$t('message.backup.selectDriver')"
        class="backup-driver-select"
      >
        <el-option
          v-for="d in drivers"
          :key="d.name"
          :label="d.name + (d.available ? ' ✓' : ' ✗')"
          :value="d.name"
          :disabled="!d.available"
        >
          <span>{{ d.name }}</span>
          <span class="backup-driver-status">{{ d.available ? "可用" : "不可用" }}</span>
        </el-option>
      </el-select>
      <el-button type="primary" :loading="creating" :disabled="!selectedDriver" @click="onCreate">{{
        $t("message.backup.createBackup")
      }}</el-button>
    </template>

    <ProToolbar v-model:size="tableSize" @refresh="load" />

    <ProTable
      :data="list"
      :loading="loading"
      :size="tableSize"
      :show-pagination="false"
      row-key="name"
      stripe
    >
      <el-table-column
        prop="name"
        :label="$t('message.backup.fileName')"
        min-width="220"
        show-overflow-tooltip
      />
      <el-table-column
        prop="size_human"
        :label="$t('message.backup.size')"
        width="120"
        align="right"
      />
      <el-table-column
        prop="created_at_str"
        :label="$t('message.backup.createTime')"
        width="180"
        align="center"
      />
      <el-table-column
        :label="$t('message.backup.action')"
        width="160"
        fixed="right"
        align="center"
      >
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="onDownload(row.name)">{{
            $t("message.backup.download")
          }}</el-button>
          <el-button link type="danger" size="small" @click="onDelete(row.name)">{{
            $t("message.backup.delete")
          }}</el-button>
        </template>
      </el-table-column>
    </ProTable>
  </ProPage>
</template>

<script lang="ts">
import { useI18n } from "vue-i18n";
import { defineComponent, onMounted, ref } from "vue";
import {
  listBackups,
  getBackupDrivers,
  createBackup,
  deleteBackup,
} from "/@/api/addon/backup/index";
import { ElMessage, ElMessageBox } from "element-plus";
import ProPage from "/@/components/pro/ProPage.vue";
import ProToolbar from "/@/components/pro/ProToolbar.vue";
import ProTable from "/@/components/pro/ProTable.vue";

export default defineComponent({
  name: "BackupList",
  components: { ProPage, ProToolbar, ProTable },
  setup() {
    const { t } = useI18n();
    const list = ref<any[]>([]);
    const drivers = ref<any[]>([]);
    const selectedDriver = ref("");
    const loading = ref(false);
    const creating = ref(false);
    const tableSize = ref<"large" | "default" | "small">("default");

    const load = () => {
      loading.value = true;
      listBackups()
        .then((res: any) => {
          list.value = res?.data?.list || [];
        })
        .finally(() => {
          loading.value = false;
        });
    };

    const loadDrivers = () => {
      getBackupDrivers().then((res: any) => {
        drivers.value = res?.data?.drivers || [];
        const first = drivers.value.find((d: any) => d.available);
        if (first) selectedDriver.value = first.name;
      });
    };

    const onCreate = () => {
      if (!selectedDriver.value) {
        ElMessage.warning(t("message.backup.pleaseSelectDriver"));
        return;
      }
      creating.value = true;
      createBackup(selectedDriver.value)
        .then((res: any) => {
          ElMessage.success(t("message.backup.backupCreated") + res?.data?.file_name);
          load();
        })
        .catch(() => {
          ElMessage.error(t("message.backup.backupCreateFailed"));
        })
        .finally(() => {
          creating.value = false;
        });
    };

    const onDownload = (name: string) => {
      const a = document.createElement("a");
      a.href = "/api/v1/admin/backup/download?file_name=" + encodeURIComponent(name);
      a.download = name;
      a.click();
    };

    const onDelete = (name: string) => {
      ElMessageBox.confirm(
        t("message.backup.confirmDeleteBackup", { name }),
        t("message.backup.confirm"),
        { type: "warning" },
      ).then(() => {
        deleteBackup(name).then(() => {
          ElMessage.success(t("message.backup.deleted"));
          load();
        });
      });
    };

    onMounted(() => {
      load();
      loadDrivers();
    });

    return {
      list,
      drivers,
      selectedDriver,
      loading,
      creating,
      tableSize,
      load,
      onCreate,
      onDownload,
      onDelete,
    };
  },
});
</script>

<style scoped>
.backup-driver-select {
  width: 180px;
}
.backup-driver-status {
  float: right;
  color: var(--cc-color-text-3);
  font-size: var(--cc-font-12);
}
</style>
