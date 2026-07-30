<template>
  <div class="tge-drawer-form">
    <el-form ref="formRef" :model="formData" :rules="rules" label-position="top" size="large">
      <div class="tge-form-grid">
        <el-form-item prop="name">
          <template #label
            ><span class="tge-label"
              >{{ $t("message.common.colName") }} <span class="tge-req">*</span></span
            ></template
          >
          <el-input
            v-model.trim="formData.name"
            :placeholder="$t('message.cms.tagList.placeholderName')"
          />
        </el-form-item>
        <el-form-item prop="seotitle">
          <template #label
            ><span class="tge-label">{{ $t("message.cms.tagEdit.seoTitle") }}</span></template
          >
          <el-input v-model.trim="formData.seotitle" placeholder="seotitle" />
        </el-form-item>
        <el-form-item prop="keywords">
          <template #label
            ><span class="tge-label">{{
              $t("message.cms.articleEdit.colKeywords")
            }}</span></template
          >
          <el-input v-model.trim="formData.keywords" placeholder="keywords" />
        </el-form-item>
        <el-form-item prop="description">
          <template #label
            ><span class="tge-label">{{
              $t("message.cms.tagList.colDescription")
            }}</span></template
          >
          <el-input
            v-model.trim="formData.description"
            placeholder="description"
            type="textarea"
            :rows="3"
          />
        </el-form-item>
        <el-form-item prop="views">
          <template #label
            ><span class="tge-label">{{
              $t("message.cms.articleEdit.colViews")
            }}</span></template
          >
          <el-input
            v-model.trim="formData.views"
            type="number"
            :placeholder="$t('message.cms.articleEdit.placeholderViews')"
          />
        </el-form-item>
        <el-form-item prop="autolink">
          <template #label
            ><span class="tge-label">{{
              $t("message.cms.tagList.colAutolink")
            }}</span></template
          >
          <el-radio-group v-model="formData.autolink">
            <el-radio :label="1">{{ $t("message.common.yes") }}</el-radio>
            <el-radio :label="0">{{ $t("message.common.no") }}</el-radio>
          </el-radio-group>
        </el-form-item>
      </div>

      <div v-if="formData.id" class="tge-meta-row">
        <span class="tge-meta"><b>{{ $t("message.common.colCreateTime") }}:</b> {{ fmtTs(formData.created_at) }}</span>
        <span class="tge-meta"><b>{{ $t("message.common.colUpdateTime") }}:</b> {{ fmtTs(formData.updated_at) }}</span>
      </div>

      <div class="tge-form-actions">
        <el-button v-if="formData.id" type="danger" plain size="large" @click="onDelete">
          <el-icon><Delete /></el-icon>{{ $t("message.common.delete") }}</el-button
        >
        <div style="flex:1" />
        <el-button size="large" @click="emit('close')">{{
          $t("message.common.cancel")
        }}</el-button>
        <el-button
          type="primary"
          size="large"
          :loading="submitting"
          @click="onSubmit"
          class="tge-submit-btn"
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
import { ElMessage, ElMessageBox, FormInstance } from "element-plus";
import { useI18n } from "vue-i18n";
import { Check, Delete } from "@element-plus/icons-vue";
import { getCmsTags, addCmsTags, updateCmsTags, delCmsTags } from "/@/api/cms/tag";

const props = withDefaults(defineProps<{ editId?: number }>(), { editId: 0 });
const emit = defineEmits<{ saved: []; close: [] }>();

const { t } = useI18n();
const formRef = ref<FormInstance>();
const submitting = ref(false);

interface TagFormData {
  id: number | undefined;
  name: string;
  seotitle: string;
  keywords: string;
  description: string;
  views: number | undefined;
  autolink: number;
  created_at: number;
  updated_at: number;
}

const formData = reactive<TagFormData>({
  id: undefined,
  name: "",
  seotitle: "",
  keywords: "",
  description: "",
  views: undefined,
  autolink: 0,
  created_at: 0,
  updated_at: 0,
});

const rules = { name: [{ required: true, message: t("message.common.msgNameRequired"), trigger: "blur" }] };

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
    const res = await getCmsTags(props.editId);
    const data = (res as any).data;
    if (data?.id) {
      Object.assign(formData, {
        id: data.id,
        name: data.name || "",
        seotitle: data.seotitle || "",
        keywords: data.keywords || "",
        description: data.description || "",
        views: data.views,
        autolink: data.autolink ?? 0,
        created_at: data.created_at || 0,
        updated_at: data.updated_at || 0,
      });
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
    const data = { ...formData };
    if (formData.id) {
      await updateCmsTags(data);
      ElMessage.success(t("message.editSuccess"));
    } else {
      await addCmsTags(data);
      ElMessage.success(t("message.addSuccess"));
    }
    emit("saved");
  } catch {
    console.error(t("message.common.submitFailed"));
  } finally {
    submitting.value = false;
  }
};

const onDelete = () => {
  ElMessageBox.confirm(
    t("message.common.confirmDeleteItem", { name: formData.name || "" }),
    t("message.common.confirmDeleteTitle"),
    {
      type: "warning",
      confirmButtonText: t("message.common.confirmDeleteTitle"),
      cancelButtonText: t("message.common.cancel"),
    },
  )
    .then(async () => {
      await delCmsTags([formData.id!]);
      ElMessage.success(t("message.common.msgDeleteOk"));
      emit("saved");
    })
    .catch(() => {});
};

onMounted(() => loadData());
</script>

<style scoped>
.tge-drawer-form {
  padding: 24px;
}
.tge-form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 32px;
  align-items: start;
}
.tge-form-grid > * {
  min-width: 0;
}

.tge-label {
  font-family: var(--cc-font-sans);
  font-size: 13px;
  font-weight: 500;
  color: var(--cc-color-text-2);
}
.tge-req {
  color: #ef4444;
  margin-left: 2px;
}

.tge-meta-row {
  display: flex;
  gap: 32px;
  flex-wrap: wrap;
  padding-top: 16px;
  margin-bottom: 20px;
  border-top: 1px solid var(--cc-color-border-light);
}
.tge-meta {
  font-family: var(--cc-font-sans);
  font-size: 12px;
  color: var(--cc-color-text-4);
}
.tge-meta b {
  color: var(--cc-color-text-3);
}

.tge-form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding-top: 24px;
  border-top: 1px solid var(--cc-color-border-light);
}
.tge-form-actions .el-button {
  font-family: var(--cc-font-sans);
  font-weight: 600;
  border-radius: 10px;
  padding: 12px 28px;
}
.tge-submit-btn {
  background: var(--cc-color-primary) !important;
  border: none !important;
  box-shadow: var(--cc-shadow-card);
  transition: all 0.25s !important;
}
.tge-submit-btn:hover:not(.is-loading) {
  background: var(--cc-color-primary-active) !important;
  box-shadow: var(--cc-shadow-card-hover);
  transform: translateY(-1px);
}
</style>
