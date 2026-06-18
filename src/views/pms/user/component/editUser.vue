<template>
  <div class="pms-card-container">
    <div class="pms-card-page">
      <div class="pms-card-header">
        <div>
          <h1 class="pms-card-title">
            {{ ruleForm.user_id ? $t("message.common.edit") : $t("message.common.add") }}
          </h1>
          <p class="pms-card-sub">PMS User Management</p>
        </div>
      </div>
      <div class="pms-card-form">
        <el-alert
          v-if="ruleForm.user_id === 1"
          :title="$t('message.pms.user.superAdminNotEditable')"
          type="warning"
          show-icon
          :closable="false"
          style="margin-bottom: 20px"
        />
        <el-form ref="formRef" :model="ruleForm" :rules="rules" label-position="top" size="large">
          <div class="pms-card-grid">
            <el-form-item
              v-if="ruleForm.user_id === 0"
              :label="$t('message.pms.user.labelUsername')"
              prop="user_name"
              ><el-input v-model="ruleForm.user_name" :disabled="ruleForm.user_id === 1"
            /></el-form-item>
            <el-form-item
              v-if="ruleForm.user_id === 0"
              :label="$t('message.pms.user.labelPassword')"
              prop="password"
              ><el-input
                v-model="ruleForm.password"
                type="password"
                :disabled="ruleForm.user_id === 1"
            /></el-form-item>
            <el-form-item :label="$t('message.pms.user.colNickname')" prop="nick_name"
              ><el-input v-model="ruleForm.nick_name" :disabled="ruleForm.user_id === 1"
            /></el-form-item>
            <el-form-item :label="$t('message.pms.user.labelRole')"
              ><el-select
                v-model="ruleForm.role_ids"
                multiple
                style="width: 100%"
                :disabled="ruleForm.user_id === 1"
                ><el-option
                  v-for="r in roleList"
                  :key="'r-' + r.id"
                  :label="r.name"
                  :value="r.id" /></el-select
            ></el-form-item>
            <el-form-item :label="$t('message.pms.user.colDept')"
              ><el-cascader
                :options="deptData"
                :props="{
                  checkStrictly: true,
                  emitPath: false,
                  value: 'dept_id',
                  label: 'dept_name',
                }"
                clearable
                v-model="ruleForm.dept_id"
                style="width: 100%"
                :disabled="ruleForm.user_id === 1"
                ><template #default="{ node, data }"
                  ><span>{{ data.dept_name }}</span
                  ><span v-if="!node.isLeaf"> ({{ data.children.length }})</span></template
                ></el-cascader
              ></el-form-item
            >
            <el-form-item :label="$t('message.pms.user.colPhone')" prop="mobile"
              ><el-input v-model="ruleForm.mobile" :disabled="ruleForm.user_id === 1"
            /></el-form-item>
            <el-form-item :label="$t('message.pms.user.colEmail')" prop="email"
              ><el-input v-model="ruleForm.email" :disabled="ruleForm.user_id === 1"
            /></el-form-item>
            <el-form-item :label="$t('message.pms.user.colSex')"
              ><el-select
                v-model="ruleForm.sex"
                style="width: 100%"
                :disabled="ruleForm.user_id === 1"
                ><el-option
                  v-for="g in genderData"
                  :key="'g-' + g.value"
                  :label="g.label"
                  :value="g.value" /></el-select
            ></el-form-item>
            <el-form-item :label="$t('message.pms.user.colPost')"
              ><el-select
                v-model="ruleForm.section_ids"
                multiple
                style="width: 100%"
                :disabled="ruleForm.user_id === 1"
                ><el-option
                  v-for="p in postList"
                  :key="'p-' + p.section_id"
                  :label="p.section_name"
                  :value="p.section_id" /></el-select
            ></el-form-item>
            <el-form-item :label="$t('message.pms.user.labelUserStatus')"
              ><el-switch
                v-model="ruleForm.status"
                :active-value="1"
                :inactive-value="0"
                inline-prompt
                :active-text="$t('message.common.enabled')"
                :inactive-text="$t('message.common.disabled')"
                :disabled="ruleForm.user_id === 1"
            /></el-form-item>
            <el-form-item :label="$t('message.pms.user.labelUserType')" class="pms-card-full"
              ><el-radio-group v-model="ruleForm.isSuperAdmin" :disabled="ruleForm.user_id === 1"
                ><el-radio :label="1">{{ $t("message.pms.user.superAdmin") }}</el-radio
                ><el-radio :label="0">{{
                  $t("message.pms.user.normalUser")
                }}</el-radio></el-radio-group
              ></el-form-item
            >
            <el-form-item :label="$t('message.common.colRemark')" class="pms-card-full"
              ><el-input v-model="ruleForm.remark" type="textarea"
            /></el-form-item>
          </div>
          <div class="pms-card-actions">
            <el-button size="large" @click="$router.back()">{{
              $t("message.common.cancel")
            }}</el-button
            ><el-button
              type="primary"
              size="large"
              :loading="submitting"
              @click="onSubmit"
              class="pms-card-submit"
              >{{ submitting ? $t("message.common.saving") : $t("message.common.save") }}</el-button
            >
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { reactive, toRefs, defineComponent, getCurrentInstance, ref, unref } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  getEditUser,
  addUser,
  editUser,
  getRoleList,
  getPostList,
  getDeptList,
} from "/@/api/pms/user";
import { ElMessage } from "element-plus";
import { useI18n } from "vue-i18n";
export default defineComponent({
  name: "systemEditUser",
  setup() {
    const { proxy } = getCurrentInstance() as any;
    const { t } = useI18n();
    const route = useRoute();
    const router = useRouter();
    const formRef = ref<HTMLElement | null>(null);
    const submitting = ref(false);
    const roleList = ref<any[]>([]);
    const postList = ref<any[]>([]);
    const deptData = ref<any[]>([]);
    const genderData = [
      { label: t("message.male"), value: "0" },
      { label: t("message.female"), value: "1" },
    ];
    const state = reactive({
      ruleForm: {
        user_id: 0,
        user_name: "",
        password: "",
        nick_name: "",
        role_ids: [] as number[],
        dept_id: 0,
        mobile: "",
        email: "",
        sex: "0",
        section_ids: [] as number[],
        status: 1,
        isSuperAdmin: 0,
        remark: "",
      },
      rules: {
        user_name: [
          { required: true, message: t("message.pms.user.msgUsernameRequired"), trigger: "blur" },
        ],
        nick_name: [{ required: true, message: "Nickname is required", trigger: "blur" }],
      },
    });
    getRoleList().then((r: any) => {
      roleList.value = r.data.list || [];
    });
    getPostList().then((r: any) => {
      postList.value = r.data.list || [];
    });
    getDeptList().then((r: any) => {
      deptData.value = proxy.handleTree(r.data.list ?? [], "dept_id", "parent_id");
    });
    const id = Number(route.query.id);
    if (id) {
      getEditUser(id).then((r: any) => {
        const d = r.data.user;
        state.ruleForm = d;
      });
    }
    const onSubmit = () => {
      const w = unref(formRef) as any;
      if (!w) return;
      w.validate((v: boolean) => {
        if (!v) return;
        submitting.value = true;
        (id ? editUser(state.ruleForm) : addUser(state.ruleForm))
          .then(() => {
            ElMessage.success(id ? t("message.common.msgEditOk") : t("message.common.msgAddOk"));
            router.back();
          })
          .finally(() => (submitting.value = false));
      });
    };
    return {
      ...toRefs(state),
      formRef,
      roleList,
      postList,
      deptData,
      genderData,
      submitting,
      onSubmit,
    };
  },
});
</script>
<style scoped>
.pms-card-page {
  max-width: 960px;
  margin: 0 auto;
}
.pms-card-header {
  margin: 28px 0 24px;
  padding: 32px 36px;
  background: var(--cc-color-surface);
  border-radius: 16px;
  border: 1px solid var(--cc-color-border-light);
}
.pms-card-title {
  font-family: var(--cc-font-sans);
  font-size: 28px;
  font-weight: 700;
  color: var(--cc-color-text-1);
  margin: 0;
}
.pms-card-sub {
  font-family: var(--cc-font-sans);
  font-size: 14px;
  color: var(--cc-color-primary);
  margin: 4px 0 0;
}
.pms-card-form {
  background: #fff;
  border: 1px solid var(--cc-color-border-light);
  border-radius: 16px;
  padding: 36px 40px;
}
.pms-card-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 32px;
}
.pms-card-full {
  grid-column: 1/-1;
}
.pms-card-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 24px;
  border-top: 1px solid #e0f2fe;
}
.pms-card-actions .el-button {
  font-family: var(--cc-font-sans);
  font-weight: 600;
  border-radius: 10px;
  padding: 12px 28px;
}
.pms-card-submit {
  background: var(--cc-color-primary) !important;
  border: none !important;
}
.pms-card-form :deep(.el-input__wrapper) {
  border-radius: 10px;
  background: var(--cc-color-bg);
  border: 1px solid var(--cc-color-border-light);
}
.pms-card-form :deep(.el-input__wrapper.is-focus) {
  border-color: var(--cc-color-primary);
  box-shadow: 0 0 0 3px var(--cc-color-focus-ring);
}
@media (min-width: 1440px) {
  .pms-card-page {
    max-width: 1320px;
  }
  .pms-card-header {
    padding: 40px 48px;
  }
  .pms-card-form {
    padding: 40px 48px;
  }
  .pms-card-grid {
    gap: 0 48px;
  }
}
@media (max-width: 768px) {
  .pms-card-grid {
    grid-template-columns: 1fr;
  }
  .pms-card-header {
    padding: 20px;
  }
  .pms-card-form {
    padding: 20px 16px;
    border-radius: 12px;
  }
  .pms-card-title {
    font-size: 22px;
  }
  .pms-card-actions {
    flex-direction: column-reverse;
  }
  .pms-card-actions .el-button {
    width: 100%;
  }
}
</style>
