<template>
  <div class="dept-edit-page">
    <!-- 页头 -->
    <div class="dept-edit-header">
      <div>
        <h1 class="dept-edit-title">
          {{ ruleForm.dept_id ? $t("message.common.edit") : $t("message.common.add") }}
        </h1>
        <p class="dept-edit-subtitle">{{ $t("message.pms.dept.pageSubtitle") }}</p>
      </div>
    </div>
    <!-- 表单卡片 -->
    <el-card shadow="never" class="dept-edit-card">
      <el-form
        ref="formRef"
        :model="ruleForm"
        :rules="rules"
        label-position="top"
        size="large"
        v-loading="loading"
      >
        <div class="dept-edit-grid">
          <el-form-item :label="$t('message.pms.dept.labelParent')">
            <el-cascader
              :options="deptData"
              :props="{
                checkStrictly: true,
                emitPath: false,
                value: 'dept_id',
                label: 'dept_name',
              }"
              :placeholder="$t('message.pms.dept.placeholderParent')"
              clearable
              v-model="ruleForm.parent_id"
              style="width: 100%"
            >
              <template #default="{ node, data }">
                <span>{{ data.dept_name }}</span>
                <span v-if="!node.isLeaf"> ({{ data.children.length }}) </span>
              </template>
            </el-cascader>
          </el-form-item>
          <el-form-item :label="$t('message.common.colName')" prop="dept_name">
            <el-input v-model="ruleForm.dept_name" />
          </el-form-item>
          <el-form-item :label="$t('message.pms.dept.colLeader')">
            <el-input v-model="ruleForm.leader" />
          </el-form-item>
          <el-form-item :label="$t('message.pms.dept.labelPhone')">
            <el-input v-model="ruleForm.phone" />
          </el-form-item>
          <el-form-item :label="$t('message.pms.dept.labelEmail')">
            <el-input v-model="ruleForm.email" />
          </el-form-item>
          <el-form-item :label="$t('message.common.colSort')">
            <el-input-number v-model="ruleForm.order_num" :min="0" :max="999" style="width: 100%" />
          </el-form-item>
          <el-form-item :label="$t('message.pms.dept.labelDeptStatus')">
            <el-switch
              v-model="ruleForm.status"
              :active-value="1"
              :inactive-value="0"
              inline-prompt
              :active-text="$t('message.common.enabled')"
              :inactive-text="$t('message.common.disabled')"
            />
          </el-form-item>
        </div>
        <div class="dept-edit-actions">
          <el-button size="large" @click="$router.back()">{{
            $t("message.common.cancel")
          }}</el-button>
          <el-button type="primary" size="large" :loading="submitting" @click="onSubmit" round>
            {{ submitting ? $t("message.common.saving") : $t("message.common.save") }}
          </el-button>
        </div>
      </el-form>
    </el-card>
  </div>
</template>
<script lang="ts">
import { reactive, toRefs, defineComponent, getCurrentInstance, ref, unref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { addDept, editDept, getDeptList, getDept } from "/@/api/pms/dept";
import { ElMessage } from "element-plus";
import { useI18n } from "vue-i18n";
interface TableDataRow {
  dept_name: string;
  id: number;
  parent_id: number;
  children?: TableDataRow[];
}
interface RuleFormState {
  dept_id: number;
  parent_id: number;
  dept_name: string;
  order_num: number;
  leader: string;
  phone: string | number;
  email: string;
  status: number;
}
interface DeptSate {
  ruleForm: RuleFormState;
  deptData: Array<TableDataRow>;
  rules: object;
}
export default defineComponent({
  name: "systemEditDept",
  setup() {
    const { t } = useI18n();
    const { proxy } = getCurrentInstance() as any;
    const route = useRoute();
    const router = useRouter();
    const formRef = ref<HTMLElement | null>(null);
    const submitting = ref(false);
    const loading = ref(false);
    const state = reactive<DeptSate>({
      ruleForm: {
        dept_id: 0,
        parent_id: 0,
        dept_name: "",
        order_num: 0,
        leader: "",
        phone: "",
        email: "",
        status: 1,
      },
      deptData: [],
      rules: {
        dept_name: [
          { required: true, message: t("message.pms.dept.msgNameRequired"), trigger: "blur" },
        ],
      },
    });
    const loadData = () => {
      getDeptList().then((res: any) => {
        state.deptData = proxy.handleTree(res.data.list ?? [], "dept_id", "parent_id");
      });
      const id = Number(route.query.id);
      if (id) {
        loading.value = true;
        getDept(id)
          .then((res: any) => {
            if (res?.code === 0 && res.data) {
              const d = res.data;
              state.ruleForm = {
                dept_id: d.dept_id ?? 0,
                parent_id: d.parent_id ?? 0,
                dept_name: d.dept_name ?? "",
                order_num: d.order_num ?? 0,
                leader: d.leader ?? "",
                phone: d.phone ?? "",
                email: d.email ?? "",
                status: d.status ?? 1,
              };
            }
          })
          .finally(() => {
            loading.value = false;
          });
      }
    };
    onMounted(() => {
      loadData();
    });
    const onSubmit = () => {
      const w = unref(formRef) as any;
      if (!w) return;
      w.validate((v: boolean) => {
        if (!v) return;
        submitting.value = true;
        (state.ruleForm.dept_id === 0 ? addDept(state.ruleForm) : editDept(state.ruleForm))
          .then(() => {
            ElMessage.success(
              state.ruleForm.dept_id ? t("message.common.msgEditOk") : t("message.common.msgAddOk"),
            );
            router.back();
          })
          .finally(() => (submitting.value = false));
      });
    };
    return { ...toRefs(state), formRef, submitting, t, loading, onSubmit };
  },
});
</script>
<style scoped>
.dept-edit-page {
  max-width: 960px;
  margin: 0 auto;
  font-family: var(--cc-font-sans);
}

/* ====== 页头 ====== */
.dept-edit-header {
  margin: 28px 0 24px;
  padding: 24px 28px 20px;
  background: var(--cc-color-surface);
  border-radius: 16px;
  border: 1px solid var(--cc-color-border);
}

.dept-edit-title {
  font-family: var(--cc-font-sans);
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--cc-color-text-1);
  margin: 0 0 4px;
}

.dept-edit-subtitle {
  font-family: var(--cc-font-sans);
  font-size: 14px;
  color: var(--cc-color-text-3);
  margin: 0;
}

/* ====== 表单卡片 ====== */
.dept-edit-card {
  border: 1px solid var(--cc-color-border);
  border-radius: 12px;
}

.dept-edit-card :deep(.el-card__body) {
  padding: 28px 32px;
}

.dept-edit-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 32px;
}

/* ====== 表单控件 ====== */
.dept-edit-card :deep(.el-form-item) {
  margin-bottom: 22px;
}

.dept-edit-card :deep(.el-form-item__label) {
  font-size: 13px;
  font-weight: 600;
  color: var(--cc-color-text-1);
  padding-bottom: 6px;
}

.dept-edit-card :deep(.el-input__wrapper),
.dept-edit-card :deep(.el-input-number__decrease),
.dept-edit-card :deep(.el-input-number__increase) {
  border-radius: 8px;
  border: 1px solid #d0d5dd;
  box-shadow: none;
  transition:
    box-shadow 0.2s ease,
    border-color 0.2s ease;
}

.dept-edit-card :deep(.el-input__wrapper:hover) {
  border-color: #a4b0c2;
}

.dept-edit-card :deep(.el-input__wrapper.is-focus) {
  border-color: var(--cc-color-primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.dept-edit-card :deep(.el-switch) {
  margin-top: 4px;
}

/* ====== 操作按钮 ====== */
.dept-edit-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 24px;
  border-top: 1px solid #eef1f5;
}

.dept-edit-actions .el-button {
  font-family: var(--cc-font-sans);
  font-weight: 600;
  border-radius: 10px;
  padding: 12px 28px;
}

/* ====== 响应式 ====== */
@media (max-width: 768px) {
  .dept-edit-grid {
    grid-template-columns: 1fr;
  }

  .dept-edit-header {
    padding: 20px;
  }

  .dept-edit-card :deep(.el-card__body) {
    padding: 20px 16px;
  }

  .dept-edit-title {
    font-size: 22px;
  }

  .dept-edit-actions {
    flex-direction: column-reverse;

    .el-button {
      width: 100%;
    }
  }
}
</style>
