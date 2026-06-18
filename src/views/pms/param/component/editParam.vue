<template>
  <div class="pms-card-container">
    <div class="pms-card-page">
      <div class="pms-card-header">
        <div>
          <h1 class="pms-card-title">
            {{ ruleForm.param_id ? $t("message.common.edit") : $t("message.common.add") }}
          </h1>
          <p class="pms-card-sub">PMS Parameter Management</p>
        </div>
      </div>
      <div class="pms-card-form">
        <el-form :model="ruleForm" ref="formRef" :rules="rules" label-position="top" size="large">
          <div class="pms-card-grid">
            <el-form-item :label="$t('message.common.colName')" prop="param_name"
              ><el-input
                v-model="ruleForm.param_name"
                :placeholder="$t('message.pms.param.placeholderName')"
            /></el-form-item>
            <el-form-item :label="$t('message.pms.param.colKey')" prop="param_key"
              ><el-input
                v-model="ruleForm.param_key"
                :placeholder="$t('message.pms.param.placeholderKey')"
            /></el-form-item>
            <el-form-item :label="$t('message.pms.param.colValue')" prop="param_value"
              ><el-input
                v-model="ruleForm.param_value"
                :placeholder="$t('message.pms.param.placeholderValue')"
            /></el-form-item>
            <el-form-item :label="$t('message.common.type')" prop="param_type"
              ><el-radio-group v-model="ruleForm.param_type"
                ><el-radio :label="'0'">{{ $t("message.common.no") }}</el-radio
                ><el-radio :label="'1'">{{ $t("message.common.yes") }}</el-radio></el-radio-group
              ></el-form-item
            >
            <el-form-item
              :label="$t('message.common.colRemark')"
              prop="remark"
              class="pms-card-full"
              ><el-input
                v-model="ruleForm.remark"
                type="textarea"
                :placeholder="$t('message.pms.dict.placeholderRemark')"
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
import { reactive, toRefs, defineComponent, ref, unref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { useI18n } from "vue-i18n";
import { addParam, editParam, getParam } from "/@/api/pms/param";
export default defineComponent({
  name: "systemEditParamData",
  setup() {
    const route = useRoute();
    const router = useRouter();
    const { t } = useI18n();
    const formRef = ref<HTMLElement | null>(null);
    const submitting = ref(false);
    const state = reactive({
      ruleForm: {
        param_id: 0,
        param_name: "",
        param_key: "",
        param_value: "",
        param_type: "0",
        remark: "",
      },
      rules: {
        param_name: [
          { required: true, message: t("message.pms.param.msgNameRequired"), trigger: "blur" },
        ],
        param_key: [
          { required: true, message: t("message.pms.param.msgKeyRequired"), trigger: "blur" },
        ],
        param_value: [{ required: true, message: "Parameter value is required", trigger: "blur" }],
      },
    });
    const id = Number(route.query.id);
    if (id) {
      getParam(id).then((res: any) => {
        const d = res.data?.data;
        if (d) {
          d.param_type = String(d.param_type);
          state.ruleForm = d;
        }
      });
    }
    const onSubmit = () => {
      const w = unref(formRef) as any;
      if (!w) return;
      w.validate((v: boolean) => {
        if (!v) return;
        submitting.value = true;
        (state.ruleForm.param_id ? editParam(state.ruleForm) : addParam(state.ruleForm))
          .then(() => {
            ElMessage.success(
              state.ruleForm.param_id
                ? t("message.common.msgEditOk")
                : t("message.common.msgAddOk"),
            );
            router.back();
          })
          .finally(() => (submitting.value = false));
      });
    };
    return { ...toRefs(state), formRef, submitting, onSubmit };
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
