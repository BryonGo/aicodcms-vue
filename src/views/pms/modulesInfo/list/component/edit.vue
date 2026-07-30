<template>
  <div class="minf-drawer-form">
    <el-form ref="formRef" :model="formData" :rules="rules" label-position="top" size="large">
      <div class="minf-form-grid">
        <el-form-item prop="name">
          <template #label
            ><span class="minf-label"
              >{{ $t("message.common.colName") }} <span class="minf-req">*</span></span
            ></template
          >
          <el-input
            v-model="formData.name"
            :placeholder="$t('message.pms.modulesInfoList.placeholderName')"
          />
        </el-form-item>
        <el-form-item prop="table_name">
          <template #label
            ><span class="minf-label"
              >{{ $t("message.pms.modulesInfoList.colTable") }}
              <span class="minf-req">*</span></span
            ></template
          >
          <el-input
            v-model="formData.table_name"
            :placeholder="$t('message.pms.modulesInfoList.placeholderTableName')"
          />
        </el-form-item>
      </div>

      <div v-if="formData.id" class="minf-meta-row">
        <span class="minf-meta"><b>{{ $t("message.common.colCreateTime") }}:</b> {{ fmtTs(formData.created_at) }}</span>
        <span class="minf-meta"><b>{{ $t("message.common.colUpdateTime") }}:</b> {{ fmtTs(formData.updated_at) }}</span>
      </div>

      <div class="minf-form-actions">
        <el-button size="large" @click="emit('close')">{{
          $t("message.common.cancel")
        }}</el-button>
        <el-button
          type="primary"
          size="large"
          :loading="submitting"
          @click="onSubmit"
          class="minf-submit-btn"
        >
          <template v-if="!submitting"
            ><el-icon style="margin-right: 4px"><Check /></el-icon
            >{{ $t("message.common.save") }}</template
          >
          <template v-else>{{ $t("message.common.saving") }}</template>
        </el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from "vue";
import { ElMessage, FormInstance } from "element-plus";
import { Check } from "@element-plus/icons-vue";
import { addModulesInfo, getModulesInfo, updateModulesInfo } from "/@/api/pms/modulesInfo";
import { useI18n } from "vue-i18n";

const props = withDefaults(defineProps<{ editId?: number }>(), { editId: 0 });
const emit = defineEmits<{ saved: []; close: [] }>();

const { t } = useI18n();
const formRef = ref<FormInstance>();
const submitting = ref(false);

interface ModuleFormData {
  id: number | undefined;
  name: string;
  table_name: string;
  created_at: number;
  updated_at: number;
}

const formData = reactive<ModuleFormData>({
  id: undefined,
  name: "",
  table_name: "",
  created_at: 0,
  updated_at: 0,
});

const rules = {
  name: [{ required: true, message: t("message.common.msgNameRequired"), trigger: "blur" }],
  table_name: [{ required: true, message: t("message.common.msgTableNameRequired"), trigger: "blur" }],
};

const fmtTs = (ts: number) => {
  if (!ts || ts <= 0) return "—";
  return new Date(ts * 1000).toLocaleString(undefined, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const loadData = async () => {
  if (!props.editId) return;
  try {
    const res = await getModulesInfo(props.editId);
    const data = (res as any).data;
    if (data?.id) {
      formData.id = data.id;
      formData.name = data.name || "";
      formData.table_name = data.table_name || "";
      formData.created_at = data.created_at || 0;
      formData.updated_at = data.updated_at || 0;
    }
  } catch {
    // ignore
  }
};

const onSubmit = async () => {
  try {
    await formRef.value?.validate();
  } catch {
    return;
  }
  submitting.value = true;
  try {
    if (formData.id) {
      await updateModulesInfo(formData);
      ElMessage.success(t("message.common.msgEditOk"));
    } else {
      await addModulesInfo(formData);
      ElMessage.success(t("message.common.msgAddOk"));
    }
    emit("saved");
  } catch {
    console.error(t("message.common.submitFailed"));
  } finally {
    submitting.value = false;
  }
};

onMounted(() => loadData());
</script>

<style scoped>
.minf-drawer-form {
  padding: 24px;
}
.minf-form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 32px;
  align-items: start;
}
.minf-form-grid > * {
  min-width: 0;
}

.minf-label {
  font-family: var(--cc-font-sans);
  font-size: 13px;
  font-weight: 500;
  color: var(--cc-color-text-1);
}
.minf-req {
  color: #ef4444;
  margin-left: 2px;
}

.minf-meta-row {
  display: flex;
  gap: 32px;
  flex-wrap: wrap;
  padding-top: 16px;
  margin-bottom: 20px;
  border-top: 1px solid var(--cc-color-border-light);
}
.minf-meta {
  font-family: var(--cc-font-sans);
  font-size: 12px;
  color: var(--cc-color-text-4);
}
.minf-meta b {
  color: var(--cc-color-text-3);
}

.minf-form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 24px;
  border-top: 1px solid var(--cc-color-border-light);
}
.minf-form-actions .el-button {
  font-family: var(--cc-font-sans);
  font-weight: 600;
  border-radius: 10px;
  padding: 12px 28px;
}
.minf-submit-btn {
  background: var(--cc-color-primary) !important;
  border: none !important;
  box-shadow: 0 2px 8px rgba(14, 165, 233, 0.3);
  transition: all 0.25s !important;
}
.minf-submit-btn:hover:not(.is-loading) {
  background: var(--cc-color-primary-active) !important;
  box-shadow: 0 4px 16px rgba(14, 165, 233, 0.4);
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .minf-form-grid {
    grid-template-columns: 1fr;
  }
  .minf-form-actions {
    flex-direction: column-reverse;
  }
  .minf-form-actions .el-button {
    width: 100%;
  }
}
</style>
