<template>
  <ProPage :title="$t('message.sdk.user.title')" :subtitle="$t('message.sdk.user.subtitle')">
    <template #actions>
      <el-button type="primary" :icon="Plus" @click="addDialog = true">
        {{ $t("message.common.add") }}
      </el-button>
    </template>

    <ProSearch
      v-model="searchForm"
      :fields="searchFields"
      collapsible
      :collapse-threshold="2"
      @search="onSearch"
      @reset="onReset"
    >
      <template #field-date_range>
        <el-date-picker
          v-model="dateRange"
          type="datetimerange"
          range-separator="—"
          :start-placeholder="$t('message.sdk.user.dateStart')"
          :end-placeholder="$t('message.sdk.user.dateEnd')"
          value-format="x"
          class="date-range"
        />
      </template>
    </ProSearch>

    <ProToolbar v-model:size="tableSize" @refresh="loadData" />

    <ProTable
      :data="tableData"
      :loading="loading"
      :size="tableSize"
      :total="total"
      :page="page"
      :page-size="size"
      @pagination="onPageChange"
    >
      <el-table-column prop="id" label="UID" width="110" align="center">
        <template #default="{ row }">
          <router-link :to="`/addon/sdk/user/detail?id=${row.id}`" class="uid-link">{{
            row.id
          }}</router-link>
        </template>
      </el-table-column>
      <el-table-column :label="$t('message.sdk.user.colUser')" min-width="210">
        <template #default="{ row }">
          <div class="user-cell">
            <el-avatar :size="32" shape="circle" class="user-avatar">{{
              (row.username || row.email || "U")[0].toUpperCase()
            }}</el-avatar>
            <div class="user-info">
              <router-link :to="`/addon/sdk/user/detail?id=${row.id}`" class="name-link">{{
                row.username || row.email || `UID:${row.id}`
              }}</router-link>
              <span class="user-meta">{{ row.email || row.nickname || "—" }}</span>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column :label="$t('message.common.type')" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="userTypeTag(row.user_type) as any" size="small" effect="plain" round>{{
            userTypeLabel(row.user_type)
          }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="$t('message.common.colStatus')" width="100" align="center">
        <template #default="{ row }">
          <el-switch
            :model-value="row.status === 1"
            :active-value="true"
            :inactive-value="false"
            @change="(val: boolean) => onChangeStatus(row, val ? 1 : 0)"
          />
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('message.sdk.user.colLastLoginIp')"
        width="160"
        align="center"
        show-overflow-tooltip
      >
        <template #default="{ row }"
          ><span class="mono-text">{{ row.last_login_ip || "—" }}</span></template
        >
      </el-table-column>
      <el-table-column :label="$t('message.sdk.user.colLastLogin')" width="170" align="center">
        <template #default="{ row }">{{ fmt(row.last_login_time) }}</template>
      </el-table-column>
      <el-table-column :label="$t('message.sdk.user.colRegTime')" width="170" align="center">
        <template #default="{ row }">{{ fmt(row.created_at) }}</template>
      </el-table-column>
      <el-table-column
        :label="$t('message.common.colOperation')"
        width="200"
        fixed="right"
        align="center"
      >
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="onResetPwd(row)">{{
            $t("message.sdk.user.btnResetPwd")
          }}</el-button>
          <el-button link type="danger" size="small" @click="onDelete(row)">{{
            $t("message.common.delete")
          }}</el-button>
        </template>
      </el-table-column>
    </ProTable>

    <el-drawer
      v-model="addDialog"
      :title="$t('message.common.add')"
      width="480px"
      @close="resetAddForm"
    >
      <el-form label-position="top">
        <el-form-item :label="$t('message.sdk.user.colUsername')" required>
          <el-input v-model="addForm.username" placeholder="username" />
        </el-form-item>
        <el-form-item :label="$t('message.sdk.user.colEmail')">
          <el-input v-model="addForm.email" placeholder="email@example.com" />
        </el-form-item>
        <el-form-item :label="$t('message.sdk.user.colPassword')" required>
          <el-input v-model="addForm.password" type="password" placeholder="********" />
        </el-form-item>
        <el-form-item :label="$t('message.sdk.user.colNickname')">
          <el-input v-model="addForm.nickname" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addDialog = false">{{ $t("message.common.cancel") }}</el-button>
        <el-button type="primary" :loading="addLoading" @click="onSubmitAdd">{{
          $t("message.common.save")
        }}</el-button>
      </template>
    </el-dialog>
  </ProPage>
</template>

<script lang="ts">
import { computed, defineComponent, ref, reactive, onMounted, onActivated } from "vue";
import { useI18n } from "vue-i18n";
import { ElMessage, ElMessageBox } from "element-plus";
import { Plus } from "@element-plus/icons-vue";
import ProPage from "/@/components/pro/ProPage.vue";
import ProSearch, { type ProSearchField } from "/@/components/pro/ProSearch.vue";
import ProToolbar from "/@/components/pro/ProToolbar.vue";
import ProTable from "/@/components/pro/ProTable.vue";
import {
  getUserList,
  deleteUser,
  resetPwd,
  setStatus,
  addUser,
  UserItem,
  userTypeLabel,
  userTypeTag,
} from "/@/api/addon/sdk";

export default defineComponent({
  name: "addonSdkUserList",
  components: { ProPage, ProSearch, ProToolbar, ProTable, Plus },
  setup() {
    const { t } = useI18n();
    const searchForm = reactive({ keyword: "", account_type: "" });
    const dateRange = ref<string[]>([]);
    const tableData = ref<UserItem[]>([]);
    const loading = ref(false);
    const tableSize = ref<"large" | "default" | "small">("default");
    const page = ref(1);
    const size = ref(10);
    const total = ref(0);

    const searchFields = computed<ProSearchField[]>(() => [
      {
        prop: "keyword",
        label: t("message.sdk.user.colUser"),
        placeholder: t("message.sdk.user.searchPlaceholder"),
        width: "260px",
      },
      {
        prop: "account_type",
        label: t("message.common.type"),
        type: "select",
        placeholder: t("message.common.status"),
        width: "160px",
        options: [
          { label: t("message.pms.dept.email"), value: "email" },
          { label: t("message.sdk.user.typeGuest"), value: "guest" },
          { label: "Google", value: "google" },
          { label: "Facebook", value: "facebook" },
          { label: "Apple", value: "apple" },
        ],
      },
      { prop: "date_range", label: t("message.sdk.user.colRegTime"), type: "slot", width: "320px" },
    ]);

    const fmt = (ts: number) =>
      ts > 0
        ? new Date(ts * 1000).toLocaleString("zh-CN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "—";

    const loadData = async () => {
      loading.value = true;
      try {
        const p: any = { page: page.value, row: size.value };
        if (searchForm.keyword) p.keyword = searchForm.keyword;
        if (searchForm.account_type) p.account_type = searchForm.account_type;
        if (dateRange.value && dateRange.value.length === 2) {
          p.start_time = Math.floor(Number(dateRange.value[0]) / 1000);
          p.end_time = Math.floor(Number(dateRange.value[1]) / 1000);
        }
        const res: any = await getUserList(p);
        const d = res.data || res;
        tableData.value = d.list || [];
        total.value = d.total || 0;
      } catch {
        tableData.value = [];
        total.value = 0;
      } finally {
        loading.value = false;
      }
    };
    const onSearch = () => {
      page.value = 1;
      loadData();
    };
    const onReset = () => {
      Object.assign(searchForm, { keyword: "", account_type: "" });
      dateRange.value = [];
      onSearch();
    };
    const onPageChange = ({ page: nextPage, limit }: { page: number; limit: number }) => {
      page.value = nextPage;
      size.value = limit;
      loadData();
    };

    const addDialog = ref(false);
    const addLoading = ref(false);
    const addForm = reactive({ username: "", email: "", password: "", nickname: "" });
    const resetAddForm = () => {
      addForm.username = "";
      addForm.email = "";
      addForm.password = "";
      addForm.nickname = "";
    };
    const onSubmitAdd = async () => {
      if (!addForm.username || !addForm.password) {
        ElMessage.warning(t("message.sdk.user.msgUserPwdRequired"));
        return;
      }
      addLoading.value = true;
      try {
        await addUser(addForm);
        ElMessage.success(t("message.sdk.user.msgAddSuccess"));
        addDialog.value = false;
        loadData();
      } catch {
        ElMessage.error(t("message.sdk.user.msgAddFailed"));
      } finally {
        addLoading.value = false;
      }
    };

    const onChangeStatus = (row: UserItem, status: number) => {
      setStatus({ id: row.id, status })
        .then(() => {
          row.status = status;
          ElMessage.success(
            status === 1
              ? t("message.sdk.user.statusEnabled")
              : t("message.sdk.user.statusDisabled"),
          );
        })
        .catch(() => {});
    };

    const onDelete = (row: UserItem) => {
      ElMessageBox.confirm(
        t("message.sdk.user.confirmDeleteUser", { name: row.username || row.email || row.id }),
        t("message.sdk.user.confirmDeleteTitle"),
        { type: "warning" },
      )
        .then(async () => {
          await deleteUser({ ids: [row.id] });
          ElMessage.success(t("message.sdk.user.msgDeleteSuccess"));
          loadData();
        })
        .catch(() => {});
    };

    const onResetPwd = (row: UserItem) => {
      ElMessageBox.prompt(
        t("message.sdk.user.promptPwdMessage", { name: row.username || row.email || row.id }),
        t("message.sdk.user.promptPwdTitle"),
        {
          type: "warning",
          inputType: "password",
          inputPlaceholder: t("message.sdk.user.promptPwdPlaceholder"),
        },
      )
        .then(async ({ value }) => {
          if (!value) return;
          await resetPwd({ id: row.id, password: value });
          ElMessage.success(t("message.sdk.user.msgPwdReset"));
        })
        .catch(() => {});
    };

    onMounted(() => loadData());
    onActivated(() => loadData());
    return {
      searchForm,
      searchFields,
      dateRange,
      tableData,
      loading,
      tableSize,
      page,
      size,
      total,
      fmt,
      loadData,
      onSearch,
      onReset,
      onPageChange,
      userTypeLabel,
      userTypeTag,
      onDelete,
      onResetPwd,
      onChangeStatus,
      addDialog,
      addLoading,
      addForm,
      resetAddForm,
      onSubmitAdd,
      Plus,
    };
  },
});
</script>

<style scoped>
.date-range {
  width: 320px;
}
.uid-link,
.name-link {
  color: var(--cc-color-primary);
  text-decoration: none;
  font-weight: 600;
}
.uid-link:hover,
.name-link:hover {
  text-decoration: underline;
}
.mono-text {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: var(--cc-font-13);
  color: var(--cc-color-text-2);
}
.user-cell {
  display: flex;
  align-items: center;
  gap: var(--cc-space-3);
}
.user-avatar {
  background: var(--cc-grad-mint);
  color: var(--cc-color-text-inverse);
  font-weight: 700;
  flex-shrink: 0;
}
.user-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}
.user-meta {
  font-size: var(--cc-font-12);
  color: var(--cc-color-text-3);
}
@media (max-width: 768px) {
  .date-range {
    width: 100%;
  }
}
</style>
