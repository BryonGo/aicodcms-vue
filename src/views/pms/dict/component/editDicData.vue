<template>
  <div class="pms-card-container">
    <div class="pms-card-page">
      <div class="pms-card-header">
        <div>
          <h1 class="pms-card-title">
            {{ ruleForm.dict_code ? $t("message.common.edit") : $t("message.common.add") }}
          </h1>
          <p class="pms-card-sub">字典类型: {{ ruleForm.dict_type || "—" }}</p>
        </div>
      </div>
      <div class="pms-card-form">
        <el-form :model="ruleForm" ref="formRef" :rules="rules" label-position="top" size="large">
          <div class="pms-card-grid">
            <el-form-item :label="$t('message.common.type')"
              ><el-input :model-value="ruleForm.dict_type" disabled
            /></el-form-item>
            <el-form-item :label="$t('message.pms.dict.labelDataLabel')" prop="dict_label"
              ><el-input v-model="ruleForm.dict_label"
            /></el-form-item>
            <el-form-item :label="$t('message.pms.dict.labelDataValue')" prop="dict_value"
              ><el-input v-model="ruleForm.dict_value"
            /></el-form-item>
            <el-form-item :label="$t('message.pms.dict.labelDataSort')" prop="dict_sort"
              ><el-input-number v-model="ruleForm.dict_sort" :min="0" style="width: 100%"
            /></el-form-item>
            <el-form-item :label="$t('message.pms.dict.labelDefault')"
              ><el-switch
                v-model="ruleForm.is_default"
                :active-value="1"
                :inactive-value="0"
                :active-text="$t('message.common.yes')"
                :inactive-text="$t('message.common.no')"
            /></el-form-item>
            <el-form-item :label="$t('message.pms.dict.labelStatus')"
              ><el-radio-group v-model="ruleForm.status"
                ><el-radio :label="1">{{ $t("message.pms.dict.statusEnabled") }}</el-radio
                ><el-radio :label="0">{{
                  $t("message.pms.dict.statusDisabled")
                }}</el-radio></el-radio-group
              ></el-form-item
            >
            <el-form-item :label="$t('message.pms.dict.labelRemark')" class="pms-card-full"
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
import { reactive, toRefs, defineComponent, ref, unref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getData, addData, editData } from "/@/api/pms/dict/data";
import { ElMessage } from "element-plus";
import { useI18n } from "vue-i18n";
interface RuleFormState {
  dict_code: number;
  dict_label: string;
  dict_value: string;
  dict_sort: number;
  is_default: number;
  status: number;
  remark: string;
  dict_type: string;
}
interface DicState {
  ruleForm: RuleFormState;
  rules: {};
}
export default defineComponent({
  name: "systemEditDicData",
  setup() {
    const { t } = useI18n();
    const route = useRoute();
    const router = useRouter();
    const formRef = ref<HTMLElement | null>(null);
    const submitting = ref(false);
    const dt = String(route.query.dict_type || route.query.type || "");
    const state = reactive<DicState>({
      ruleForm: {
        dict_code: 0,
        dict_label: "",
        dict_value: "",
        dict_sort: 0,
        is_default: 0,
        status: 1,
        remark: "",
        dict_type: dt,
      },
      rules: {
        dict_label: [
          { required: true, message: t("message.pms.dictData.msgLabelRequired"), trigger: "blur" },
        ],
        dict_value: [
          { required: true, message: t("message.pms.dictData.msgValueRequired"), trigger: "blur" },
        ],
        dict_sort: [
          { required: true, message: t("message.pms.dictData.msgSortRequired"), trigger: "blur" },
        ],
      },
    });
    const id = Number(route.query.id);
    if (id) {
      getData(id).then((res: any) => {
        state.ruleForm = res.data.dict;
      });
    }
    const onSubmit = () => {
      const w = unref(formRef) as any;
      if (!w) return;
      w.validate((v: boolean) => {
        if (!v) return;
        submitting.value = true;
        (state.ruleForm.dict_code ? editData(state.ruleForm) : addData(state.ruleForm))
          .then(() => {
            ElMessage.success(
              state.ruleForm.dict_code
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
