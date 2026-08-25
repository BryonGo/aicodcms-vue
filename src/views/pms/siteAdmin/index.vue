<template>
  <div class="pms-card-container">
    <el-breadcrumb separator="→" class="mb15">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限</el-breadcrumb-item>
      <el-breadcrumb-item>站点管理员</el-breadcrumb-item>
    </el-breadcrumb>
    <div class="pms-card-header">
      <div>
        <h1 class="pms-card-title">站点管理员</h1>
        <p class="pms-card-sub">将后台管理员绑定到站点，绑定后仅能管理该站点的内容</p>
      </div>
      <div class="pms-card-actions">
        <el-button size="large" type="success" class="pms-card-add" @click="onOpenBind">
          <el-icon><ele-FolderAdd /></el-icon> 绑定管理员
        </el-button>
      </div>
    </div>

    <div class="pms-card-search">
      <el-form :inline="true">
        <el-form-item label="站点">
          <el-select v-model="siteId" placeholder="选择站点" style="width: 260px" @change="loadAdmins">
            <el-option v-for="s in sites" :key="s.id" :label="`${s.name}（${s.code}）`" :value="s.id" />
          </el-select>
        </el-form-item>
      </el-form>
    </div>

    <div class="pms-card-table">
      <el-table :data="admins" stripe border size="small" style="width: 100%">
        <el-table-column type="index" label="#" width="55" align="center" />
        <el-table-column prop="user_name" label="登录账号" min-width="140" show-overflow-tooltip />
        <el-table-column prop="user_nickname" label="昵称" min-width="140" show-overflow-tooltip />
        <el-table-column label="状态" width="100" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.user_status === 1 ? 'success' : 'info'" size="small" effect="light" round>
              {{ scope.row.user_status === 1 ? "正常" : "禁用" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center" fixed="right">
          <template #default="scope">
            <el-button link size="small" type="danger" @click="onUnbind(scope.row)">
              <el-icon><ele-Delete /></el-icon> 解绑
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 绑定弹窗 -->
    <el-dialog v-model="dialog.visible" title="绑定管理员" width="520px" :close-on-click-modal="false">
      <el-form label-width="90px">
        <el-form-item label="站点">
          <el-select v-model="siteId" style="width: 100%" @change="loadAdmins">
            <el-option v-for="s in sites" :key="s.id" :label="`${s.name}（${s.code}）`" :value="s.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="管理员">
          <el-select
            v-model="dialog.userId"
            filterable
            remote
            :remote-method="searchUsers"
            :loading="dialog.searching"
            placeholder="输入账号/昵称搜索"
            style="width: 100%"
          >
            <el-option v-for="u in userOptions" :key="u.id" :label="`${u.user_name}（${u.user_nickname}）`" :value="u.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialog.visible = false">取消</el-button>
        <el-button type="primary" :loading="dialog.saving" @click="onBind">绑定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { reactive, ref, defineComponent, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { listSites } from "/@/api/cms/site";
import { listSiteAdmins, bindSiteAdmin, unbindSiteAdmin } from "/@/api/pms/siteAdmin";
import { getUserList } from "/@/api/pms/user";

export default defineComponent({
  name: "apiV1PmsSiteAdminList",
  setup() {
    const sites = ref<any[]>([]);
    const siteId = ref<number>(0);
    const admins = ref<any[]>([]);
    const userOptions = ref<any[]>([]);
    const dialog = reactive({ visible: false, userId: 0, searching: false, saving: false });

    const loadSites = () => {
      listSites().then((res: any) => {
        sites.value = res?.data?.list || [];
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
        ElMessage.warning("请选择站点和管理员");
        return;
      }
      dialog.saving = true;
      bindSiteAdmin(dialog.userId, siteId.value)
        .then(() => {
          ElMessage.success("绑定成功");
          dialog.visible = false;
          loadAdmins();
        })
        .finally(() => {
          dialog.saving = false;
        });
    };

    const onUnbind = (row: any) => {
      ElMessageBox.confirm(`确认解绑管理员「${row.user_name}」？`, "提示", { type: "warning" })
        .then(() => {
          unbindSiteAdmin(row.id, siteId.value).then(() => {
            ElMessage.success("解绑成功");
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
