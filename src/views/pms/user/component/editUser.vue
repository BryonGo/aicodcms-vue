<template>
  <div class="user-drawer-form">
    <el-alert
      v-if="ruleForm.user_id === ADMIN_USER_ID"
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
          ><el-input v-model="ruleForm.user_name" :disabled="ruleForm.user_id === ADMIN_USER_ID"
        /></el-form-item>
        <el-form-item
          v-if="ruleForm.user_id === 0"
          :label="$t('message.pms.user.labelPassword')"
          prop="password"
          ><el-input
            v-model="ruleForm.password"
            type="password"
            :disabled="ruleForm.user_id === ADMIN_USER_ID"
        /></el-form-item>
        <el-form-item :label="$t('message.pms.user.colNickname')" prop="nick_name"
          ><el-input v-model="ruleForm.nick_name" :disabled="ruleForm.user_id === ADMIN_USER_ID"
        /></el-form-item>
        <el-form-item :label="$t('message.pms.user.labelRole')"
          ><el-select
            v-model="ruleForm.role_ids"
            multiple
            style="width: 100%"
            :disabled="ruleForm.user_id === ADMIN_USER_ID"
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
            :disabled="ruleForm.user_id === ADMIN_USER_ID"
            ><template #default="{ node, data }"
              ><span>{{ data.dept_name }}</span
              ><span v-if="!node.isLeaf"> ({{ data.children.length }})</span></template
            ></el-cascader
          ></el-form-item
        >
        <el-form-item :label="$t('message.pms.user.colPhone')" prop="mobile"
          ><el-input v-model="ruleForm.mobile" :disabled="ruleForm.user_id === ADMIN_USER_ID"
        /></el-form-item>
        <el-form-item :label="$t('message.pms.user.colEmail')" prop="email"
          ><el-input v-model="ruleForm.email" :disabled="ruleForm.user_id === ADMIN_USER_ID"
        /></el-form-item>
        <el-form-item :label="$t('message.pms.user.colSex')"
          ><el-select
            v-model="ruleForm.sex"
            style="width: 100%"
            :disabled="ruleForm.user_id === ADMIN_USER_ID"
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
            :disabled="ruleForm.user_id === ADMIN_USER_ID"
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
            :disabled="ruleForm.user_id === ADMIN_USER_ID"
        /></el-form-item>
        <el-form-item :label="$t('message.pms.user.labelUserType')" class="pms-card-full"
          ><el-radio-group v-model="ruleForm.isSuperAdmin" :disabled="ruleForm.user_id === ADMIN_USER_ID"
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
      <div class="user-form-actions">
        <el-button size="large" @click="$emit('close')">{{
          $t("message.common.cancel")
        }}</el-button
        ><el-button
          type="primary"
          size="large"
          :loading="submitting"
          @click="onSubmit"
          class="user-submit-btn"
          >{{ submitting ? $t("message.common.saving") : $t("message.common.save") }}</el-button
        >
      </div>
    </el-form>
  </div>
</template>
<script lang="ts">
import { reactive, toRefs, defineComponent, getCurrentInstance, ref, unref } from "vue";
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
  props: {
    editId: { type: Number, default: 0 },
  },
  emits: ["saved", "close"],
  setup(props, ctx) {
    const { proxy } = getCurrentInstance() as any;
    const { t } = useI18n();
    const formRef = ref<HTMLElement | null>(null);
    const submitting = ref(false);
    const roleList = ref<any[]>([]);
    const postList = ref<any[]>([]);
    const deptData = ref<any[]>([]);
    const genderData = [
      { label: t("message.male"), value: "0" },
      { label: t("message.female"), value: "1" },
    ];
    const ADMIN_USER_ID: number = 1;
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
    getRoleList({}).then((r: any) => {
      roleList.value = r.data.list || [];
    });
    getPostList({}).then((r: any) => {
      postList.value = r.data.list || [];
    });
    getDeptList().then((r: any) => {
      deptData.value = proxy.handleTree(r.data.list ?? [], "dept_id", "parent_id");
    });
    const id = props.editId;
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
            ctx.emit("saved");
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
      ADMIN_USER_ID,
      submitting,
      onSubmit,
    };
  },
});
</script>
<style scoped>
.user-drawer-form {
  padding: 24px;
}

.pms-card-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 32px;
}

.pms-card-full {
  grid-column: 1/-1;
}

.user-form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 24px;
  border-top: 1px solid #e0f2fe;
}

.user-form-actions .el-button {
  font-family: var(--cc-font-sans);
  font-weight: 600;
  border-radius: 10px;
  padding: 12px 28px;
}

.user-submit-btn {
  background: var(--cc-color-primary) !important;
  border: none !important;
}

.user-drawer-form :deep(.el-input__wrapper) {
  border-radius: 10px;
  background: var(--cc-color-bg);
  border: 1px solid var(--cc-color-border-light);
}

.user-drawer-form :deep(.el-input__wrapper.is-focus) {
  border-color: var(--cc-color-primary);
  box-shadow: 0 0 0 3px var(--cc-color-focus-ring);
}

@media (min-width: 1440px) {
  .pms-card-grid {
    gap: 0 48px;
  }
}

@media (max-width: 768px) {
  .pms-card-grid {
    grid-template-columns: 1fr;
  }

  .user-form-actions {
    flex-direction: column-reverse;
  }

  .user-form-actions .el-button {
    width: 100%;
  }
}
</style>
