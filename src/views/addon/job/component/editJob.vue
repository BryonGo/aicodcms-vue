<template>
  <div class="pms-card-container">
    <div class="pms-card-page">
      <div class="pms-card-header">
        <div>
          <h1 class="pms-card-title">
            {{ ruleForm.job_id ? $t("message.common.edit") : $t("message.common.add") }}
          </h1>
          <p class="pms-card-sub">Job Management</p>
        </div>
      </div>
      <div class="pms-card-form">
        <el-form :model="ruleForm" ref="formRef" :rules="rules" label-position="top" size="large">
          <div class="pms-card-grid">
            <el-form-item :label="$t('message.pms.job.labelJobName')" prop="job_name"
              ><el-input
                v-model="ruleForm.job_name"
                :placeholder="$t('message.pms.job.placeholderJobName')"
            /></el-form-item>
            <el-form-item :label="$t('message.pms.job.labelJobGroup')" prop="job_group"
              ><el-select v-model="ruleForm.job_group" style="width: 100%"
                ><el-option :label="$t('message.user.dropdownDefault')" value="DEFAULT" /><el-option
                  :label="$t('message.pms.job.groupSystem')"
                  value="SYSTEM" /></el-select
            ></el-form-item>
            <el-form-item :label="$t('message.pms.job.labelInvokeTarget')" prop="invoke_target"
              ><el-input
                v-model="ruleForm.invoke_target"
                :placeholder="$t('message.pms.job.placeholderInvokeTarget')"
            /></el-form-item>
            <el-form-item :label="$t('message.pms.job.labelCronExpr')" prop="cron_expression"
              ><el-input
                v-model="ruleForm.cron_expression"
                :placeholder="$t('message.pms.job.placeholderCronExpr')"
            /></el-form-item>
            <el-form-item :label="$t('message.pms.job.labelMisfire')"
              ><el-select v-model="ruleForm.misfire_policy" style="width: 100%"
                ><el-option :label="$t('message.pms.job.misfireRepeat')" value="1" /><el-option
                  :label="$t('message.pms.job.misfireOnce')"
                  value="2" /></el-select
            ></el-form-item>
            <el-form-item :label="$t('message.pms.job.labelConcurrent')"
              ><el-radio-group v-model="ruleForm.concurrent"
                ><el-radio :label="0">{{ $t("message.pms.job.concurrentAllow") }}</el-radio
                ><el-radio :label="1">{{
                  $t("message.pms.job.concurrentForbid")
                }}</el-radio></el-radio-group
              ></el-form-item
            >
            <el-form-item :label="$t('message.common.colStatus')"
              ><el-radio-group v-model="ruleForm.status"
                ><el-radio :label="0">{{ $t("message.common.normal") }}</el-radio
                ><el-radio :label="1">{{ $t("message.common.disabled") }}</el-radio></el-radio-group
              ></el-form-item
            >
            <el-form-item :label="$t('message.pms.job.labelRemark')" class="pms-card-full"
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
import { defineComponent, reactive, toRefs, ref, unref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { useI18n } from "vue-i18n";
import { addJob, editJob, getJob } from "/@/api/addon/job";
export default defineComponent({
  name: "editJob",
  setup() {
    const route = useRoute();
    const router = useRouter();
    const { t } = useI18n();
    const formRef = ref();
    const submitting = ref(false);
    const state = reactive({
      ruleForm: {
        job_id: 0,
        job_name: "",
        job_group: "DEFAULT",
        invoke_target: "",
        cron_expression: "",
        misfire_policy: "1",
        concurrent: 0,
        status: 0,
        remark: "",
      },
      rules: {
        job_name: [
          { required: true, message: t("message.pms.job.msgJobNameRequired"), trigger: "blur" },
        ],
        cron_expression: [
          { required: true, message: t("message.pms.job.msgCronExprRequired"), trigger: "blur" },
        ],
        invoke_target: [
          {
            required: true,
            message: t("message.pms.job.msgInvokeTargetRequired"),
            trigger: "blur",
          },
        ],
      },
    });
    const id = Number(route.query.id);
    if (id) {
      getJob(id).then((res: any) => {
        const d = res.data?.data || res;
        if (d) state.ruleForm = { ...state.ruleForm, ...d };
      });
    }
    const onSubmit = () => {
      const w = unref(formRef) as any;
      if (!w) return;
      w.validate((v: boolean) => {
        if (!v) return;
        submitting.value = true;
        (state.ruleForm.job_id ? editJob(state.ruleForm) : addJob(state.ruleForm))
          .then(() => {
            ElMessage.success(
              state.ruleForm.job_id ? t("message.common.msgEditOk") : t("message.common.msgAddOk"),
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
  padding: 24px 28px;
  background: var(--cc-color-surface);
  border-radius: var(--cc-radius-lg);
  border: 1px solid var(--cc-color-border-light);
}
.pms-card-title {
  font-size: var(--cc-font-24);
  font-weight: 600;
  color: var(--cc-color-text-1);
  margin: 0;
}
.pms-card-sub {
  font-size: var(--cc-font-13);
  color: var(--cc-color-text-3);
  margin: 4px 0 0;
}
.pms-card-form {
  background: var(--cc-color-surface);
  border: 1px solid var(--cc-color-border-light);
  border-radius: var(--cc-radius-lg);
  padding: var(--cc-space-7) var(--cc-space-8);
  box-shadow: var(--cc-shadow-card);
}
.pms-card-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 32px;
}
.pms-card-full {
  grid-column: 1 / -1;
}
.pms-card-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 24px;
  border-top: 1px solid var(--cc-color-border-light);
}
.pms-card-actions .el-button {
  font-weight: 500;
  padding: 10px 24px;
}
.pms-card-form :deep(.el-input__wrapper),
.pms-card-form :deep(.el-textarea__inner) {
  border-radius: var(--cc-radius-md);
  background: var(--cc-color-bg);
  border: 1px solid var(--cc-color-border);
}
.pms-card-form :deep(.el-input__wrapper.is-focus),
.pms-card-form :deep(.el-textarea__inner:focus) {
  border-color: var(--cc-color-primary);
  box-shadow: 0 0 0 3px var(--cc-color-focus-ring);
}
@media (min-width: 1440px) {
  .pms-card-page {
    max-width: 1320px;
  }
  .pms-card-header {
    padding: 32px 40px;
  }
  .pms-card-form {
    padding: 36px 44px;
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
    border-radius: var(--cc-radius-md);
  }
  .pms-card-title {
    font-size: var(--cc-font-20);
  }
  .pms-card-actions {
    flex-direction: column-reverse;
  }
  .pms-card-actions .el-button {
    width: 100%;
  }
}
</style>
