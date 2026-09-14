<template>
  <div class="pms-card-container">
    <el-breadcrumb separator="→" class="mb15">
      <el-breadcrumb-item :to="{ path: '/' }">{{ $t('message.pms.siteAdmin.breadcrumbHome') }}</el-breadcrumb-item>
      <el-breadcrumb-item>{{ $t('message.pms.siteAdmin.breadcrumbPms') }}</el-breadcrumb-item>
      <el-breadcrumb-item>{{ $t('message.pms.siteAdmin.title') }}</el-breadcrumb-item>
    </el-breadcrumb>
    <div class="pms-card-header">
      <div>
        <h1 class="pms-card-title">{{ $t('message.pms.siteAdmin.title') }}</h1>
        <p class="pms-card-sub">{{ $t('message.pms.siteAdmin.subtitle') }}</p>
      </div>
      <div class="pms-card-actions">
        <el-button size="large" type="success" class="pms-card-add" @click="onOpenBind">
          <el-icon><ele-FolderAdd /></el-icon> {{ $t('message.pms.siteAdmin.btnBind') }}
        </el-button>
      </div>
    </div>

    <div class="pms-card-search">
      <el-form :inline="true">
        <el-form-item :label="$t('message.pms.siteAdmin.formSite')">
          <el-select v-model="siteId" :placeholder="$t('message.pms.siteAdmin.phSelectSite')" style="width: 260px" @change="loadAdmins">
            <el-option v-for="s in sites" :key="s.id" :label="`${s.name}（${s.code}）`" :value="s.id" />
          </el-select>
        </el-form-item>
      </el-form>
    </div>

    <div class="pms-card-table">
      <el-table :data="admins" stripe border size="small" style="width: 100%">
        <el-table-column type="index" label="#" width="55" align="center" />
        <el-table-column prop="user_name" :label="$t('message.pms.siteAdmin.colAccount')" min-width="140" show-overflow-tooltip />
        <el-table-column prop="user_nickname" :label="$t('message.pms.siteAdmin.colNickname')" min-width="140" show-overflow-tooltip />
        <el-table-column :label="$t('message.pms.siteAdmin.colUserType')" width="130" align="center">
          <template #default="scope">
            <el-tag v-if="scope.row.is_super_admin === 1" type="warning" size="small" effect="light" round>
              {{ $t('message.pms.siteAdmin.userTypeSuper') }}
            </el-tag>
            <el-tag v-else type="info" size="small" effect="plain" round>
              {{ $t('message.pms.siteAdmin.userTypeNormal') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="$t('message.pms.siteAdmin.colStatus')" width="100" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.user_status === 1 ? 'success' : 'info'" size="small" effect="light" round>
              {{ scope.row.user_status === 1 ? $t('message.common.normal') : $t('message.common.disabled') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="$t('message.pms.siteAdmin.colActions')" width="120" align="center" fixed="right">
          <template #default="scope">
            <el-button link size="small" type="danger" @click="onUnbind(scope.row)">
              <el-icon><ele-Delete /></el-icon> {{ $t('message.pms.siteAdmin.btnUnbind') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 绑定弹窗 -->
    <el-dialog v-model="dialog.visible" :title="$t('message.pms.siteAdmin.dialogTitle')" width="520px" :close-on-click-modal="false">
      <el-form label-width="90px">
        <el-form-item :label="$t('message.pms.siteAdmin.formSite')">
          <el-select v-model="siteId" style="width: 100%" @change="loadAdmins">
            <el-option v-for="s in sites" :key="s.id" :label="`${s.name}（${s.code}）`" :value="s.id" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('message.pms.siteAdmin.formAdmin')">
          <el-select
            v-model="dialog.userId"
            filterable
            remote
            :remote-method="searchUsers"
            :loading="dialog.searching"
            :placeholder="$t('message.pms.siteAdmin.phSearchAdmin')"
            style="width: 100%"
          >
            <el-option v-for="u in userOptions" :key="u.id" :label="`${u.user_name}（${u.user_nickname}）`" :value="u.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <!-- 超管提示：绑定不会收窄其可见站点范围，避免运营以为「绑定了就只管这个站」。 -->
      <el-alert
        v-if="selectedIsSuperAdmin"
        type="warning"
        :closable="false"
        show-icon
        :title="$t('message.pms.siteAdmin.superAdminBindTip')"
      />
      <template #footer>
        <el-button @click="dialog.visible = false">{{ $t('message.common.btnCancel') }}</el-button>
        <el-button type="primary" :loading="dialog.saving" @click="onBind">{{ $t('message.pms.siteAdmin.btnBind') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { computed, reactive, ref, defineComponent, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useI18n } from "vue-i18n";
import { getMySites, listSiteAdmins, bindSiteAdmin, unbindSiteAdmin } from "/@/api/pms/siteAdmin";
import { getUserList } from "/@/api/pms/user";

export default defineComponent({
  name: "apiV1PmsSiteAdminList",
  setup() {
    const { t } = useI18n();
    const sites = ref<any[]>([]);
    const siteId = ref<number>(0);
    const admins = ref<any[]>([]);
    const userOptions = ref<any[]>([]);
    const dialog = reactive({ visible: false, userId: 0, searching: false, saving: false });

    // 选中的管理员是否为超级管理员：超管可见全部站点，绑定不会收窄其范围。
    const selectedIsSuperAdmin = computed(() => {
      const hit = userOptions.value.find((u: any) => u.id === dialog.userId);
      return Number(hit?.is_super_admin || 0) === 1;
    });

    const loadSites = () => {
      // 用「当前管理员可见的站点」而不是全站列表：非超管的站点管理员在这里
      // 既不该看到别的站点，也不该能给别的站点绑定管理员。
      getMySites().then((res: any) => {
        sites.value = (res?.data?.sites || []).filter((s: any) => s.status === 1);
        if (!siteId.value && sites.value.length > 0) {
          siteId.value = sites.value[0].id;
          loadAdmins();
        }
      });
    };

    const loadAdmins = () => {
      if (!siteId.value) return;
      listSiteAdmins(siteId.value).then((res: any) => {
        admins.value = res?.data?.list || [];
      });
    };

    const searchUsers = (kw: string) => {
      dialog.searching = true;
      getUserList({ page: 1, row: 20, user_name: kw }).then((res: any) => {
        userOptions.value = res?.data?.list || [];
        dialog.searching = false;
      });
    };

    const onOpenBind = () => {
      dialog.userId = 0;
      userOptions.value = [];
      dialog.visible = true;
      searchUsers("");
    };

    const onBind = () => {
      if (!siteId.value || !dialog.userId) {
        ElMessage.warning(t("message.pms.siteAdmin.warnSelect"));
        return;
      }
      dialog.saving = true;
      bindSiteAdmin(dialog.userId, siteId.value)
        .then(() => {
          ElMessage.success(t("message.pms.siteAdmin.bindOk"));
          dialog.visible = false;
          loadAdmins();
        })
        .finally(() => {
          dialog.saving = false;
        });
    };

    const onUnbind = (row: any) => {
      ElMessageBox.confirm(t("message.pms.siteAdmin.unbindConfirm", { name: row.user_name }), t("message.common.confirmTitle"), { type: "warning" })
        .then(() => {
          unbindSiteAdmin(row.id, siteId.value).then(() => {
            ElMessage.success(t("message.pms.siteAdmin.unbindOk"));
            loadAdmins();
          });
        })
        .catch(() => {});
    };

    onMounted(() => {
      loadSites();
    });

    return {
      sites,
      siteId,
      admins,
      userOptions,
      dialog,
      selectedIsSuperAdmin,
      loadAdmins,
      searchUsers,
      onOpenBind,
      onBind,
      onUnbind,
    };
  },
});
</script>

<style scoped>
.pms-card-container {
  max-width: 1400px;
  margin: 0 auto;
}
.pms-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin: 24px 0 20px;
  padding: 24px 28px;
  background: var(--cc-color-surface);
  border-radius: var(--cc-radius-lg);
  border: 1px solid var(--cc-color-border-light);
}
.pms-card-title {
  font-size: var(--cc-font-20);
  font-weight: 600;
  color: var(--cc-color-text-1);
  margin: 0 0 4px;
}
.pms-card-sub {
  font-size: var(--cc-font-13);
  color: var(--cc-color-text-3);
  margin: 0;
}
.pms-card-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}
.pms-card-search {
  margin-bottom: 16px;
  padding: 16px 20px;
  background: var(--cc-color-surface);
  border: 1px solid var(--cc-color-border-light);
  border-radius: var(--cc-radius-lg);
}
.pms-card-table {
  background: var(--cc-color-surface);
  border: 1px solid var(--cc-color-border-light);
  border-radius: var(--cc-radius-lg);
  padding: var(--cc-space-5) var(--cc-space-6) var(--cc-space-3);
}
</style>
