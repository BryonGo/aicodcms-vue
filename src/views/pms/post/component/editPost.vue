<template>
  <div class="pms-card-container">
    <div class="pms-card-page">
      <div class="pms-card-header">
        <div>
          <h1 class="pms-card-title">
            {{ formData.section_id ? "修改岗位" : $t("message.pms.systemManagementPostAdd") }}
          </h1>
          <p class="pms-card-sub">PMS Post Management</p>
        </div>
      </div>
      <div class="pms-card-form">
        <el-form ref="formRef" :model="formData" :rules="rules" label-position="top" size="large">
          <div class="pms-card-grid">
            <el-form-item :label="$t('message.common.colName')" prop="section_name"
              ><el-input
                v-model="formData.section_name"
                :placeholder="$t('message.pms.post.placeholderName')"
            /></el-form-item>
            <el-form-item :label="$t('message.pms.post.colCode')" prop="section_code"
              ><el-input
                v-model="formData.section_code"
                :placeholder="$t('message.pms.post.placeholderCode')"
            /></el-form-item>
            <el-form-item :label="$t('message.common.colSort')" prop="section_sort"
              ><el-input-number
                v-model="formData.section_sort"
                controls-position="right"
                :min="0"
                style="width: 100%"
            /></el-form-item>
            <el-form-item :label="$t('message.common.colStatus')" prop="status"
              ><el-switch
                v-model="formData.status"
                :active-value="1"
                :inactive-value="0"
                inline-prompt
                :active-text="$t('message.common.enabled')"
                :inactive-text="$t('message.common.disabled')"
            /></el-form-item>
            <el-form-item
              :label="$t('message.common.colRemark')"
              prop="remark"
              class="pms-card-full"
              ><el-input v-model="formData.remark" type="textarea"
            /></el-form-item>
          </div>
          <div class="pms-card-actions">
            <el-button size="large" @click="$router.back()">{{
              $t("message.common.cancel")
            }}</el-button
            ><el-button
              type="primary"
              size="large"
              :loading="loading"
              @click="onSubmit"
              class="pms-card-submit"
              >{{
                formData.section_id === 0 ? $t("message.common.add") : $t("message.common.save")
              }}</el-button
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
import { addPost, editPost } from "/@/api/pms/post";
import { ElMessage } from "element-plus";
import { useI18n } from "vue-i18n";
interface DialogRow {
  section_id: number;
  section_code: string;
  section_name: string;
  section_sort: number;
  status: number;
  remark: string;
}
interface PostState {
  loading: boolean;
  formData: DialogRow;
  rules: object;
}
export default defineComponent({
  name: "systemEditPost",
  setup() {
    const { t } = useI18n();
    const route = useRoute();
    const router = useRouter();
    const formRef = ref<HTMLElement | null>(null);
    const state = reactive<PostState>({
      loading: false,
      formData: {
        section_id: 0,
        section_code: "",
        section_name: "",
        section_sort: 0,
        status: 1,
        remark: "",
      },
      rules: {
        section_name: [
          { required: true, message: t("message.pms.post.msgNameRequired"), trigger: "blur" },
        ],
        section_code: [{ required: true, message: "Post code is required", trigger: "blur" }],
        section_sort: [{ required: true, message: "Post order is required", trigger: "blur" }],
      },
    });
    const id = Number(route.query.id);
    if (id) {
      const row = route.query as any;
      state.formData = {
        section_id: id,
        section_code: row.section_code || "",
        section_name: row.section_name || "",
        section_sort: Number(row.section_sort) || 0,
        status: Number(row.status) || 1,
        remark: row.remark || "",
      };
    }
    const onSubmit = () => {
      const w = unref(formRef) as any;
      if (!w) return;
      w.validate((v: boolean) => {
        if (!v) return;
        state.loading = true;
        (state.formData.section_id === 0 ? addPost(state.formData) : editPost(state.formData))
          .then(() => {
            ElMessage.success(
              state.formData.section_id
                ? t("message.common.msgEditOk")
                : t("message.common.msgAddOk"),
            );
            router.back();
          })
          .finally(() => (state.loading = false));
      });
    };
    return { ...toRefs(state), formRef, onSubmit };
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
