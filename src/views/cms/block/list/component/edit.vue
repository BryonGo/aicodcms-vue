<template>
  <div class="blk-drawer-form">
    <el-form ref="formRef" :model="formData" :rules="rules" label-position="top" size="large">
      <el-tabs model-value="base" type="border-card" class="blk-tabs">
        <el-tab-pane :label="$t('message.cms.channelEdit.basicInfo')" name="base">
          <div class="blk-form-grid">
            <el-form-item prop="name">
              <template #label
                ><span class="blk-label"
                  >{{ $t("message.common.colName") }} <span class="blk-req">*</span></span
                ></template
              >
              <el-input
                v-model.trim="formData.name"
                :placeholder="$t('message.cms.blockEdit.placeholderName')"
              />
            </el-form-item>
            <el-form-item prop="title">
              <template #label
                ><span class="blk-label">{{
                  $t("message.cms.blockEdit.colTitle")
                }}</span></template
              >
              <el-input
                v-model.trim="formData.title"
                :placeholder="$t('message.cms.articleEdit.placeholderTitle')"
              />
            </el-form-item>
            <el-form-item prop="type">
              <template #label
                ><span class="blk-label"
                  >{{ $t("message.common.type") }} <span class="blk-req">*</span></span
                ></template
              >
              <el-input
                v-model.trim="formData.type"
                :placeholder="$t('message.cms.blockEdit.placeholderType')"
              />
            </el-form-item>
            <el-form-item prop="image">
              <template #label
                ><span class="blk-label">{{
                  $t("message.cms.blockEdit.colImage")
                }}</span></template
              >
              <el-input
                v-model.trim="formData.image"
                :placeholder="$t('message.cms.blockEdit.placeholderImage')"
              />
            </el-form-item>
            <el-form-item prop="url">
              <template #label
                ><span class="blk-label">{{
                  $t("message.cms.blockEdit.colUrl")
                }}</span></template
              >
              <el-input
                v-model.trim="formData.url"
                :placeholder="$t('message.cms.blockEdit.placeholderUrl')"
              />
            </el-form-item>
            <el-form-item prop="content" class="blk-full-row">
              <template #label
                ><span class="blk-label">{{
                  $t("message.cms.blockEdit.colContent")
                }}</span></template
              >
              <el-input
                v-model.trim="formData.content"
                type="textarea"
                :rows="6"
                :placeholder="$t('message.cms.articleEdit.placeholderTitle')"
              />
            </el-form-item>
            <el-form-item prop="parsetpl">
              <template #label
                ><span class="blk-label">{{
                  $t("message.cms.blockEdit.colParsetpl")
                }}</span></template
              >
              <el-radio-group v-model="formData.parsetpl">
                <el-radio :label="1">{{ $t("message.common.yes") }}</el-radio>
                <el-radio :label="0">{{ $t("message.common.no") }}</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item prop="weigh">
              <template #label
                ><span class="blk-label">{{
                  $t("message.cms.channelEdit.weigh")
                }}</span></template
              >
              <el-input-number
                v-model="formData.weigh"
                :min="0"
                :max="9999"
                style="width: 100%"
              />
            </el-form-item>
            <el-form-item prop="status">
              <template #label
                ><span class="blk-label">{{ $t("message.common.status") }}</span></template
              >
              <el-radio-group v-model="formData.status">
                <el-radio :label="1">{{ $t("message.common.normal") }}</el-radio>
                <el-radio :label="0">{{ $t("message.common.hidden") }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </div>
        </el-tab-pane>
        <el-tab-pane :label="$t('message.cms.channelEdit.multiLang')" name="trans">
          <TranslationEditor v-model="formData.translations" :fields="translationFields" />
        </el-tab-pane>
      </el-tabs>

      <div v-if="formData.id" class="blk-meta-row">
        <span class="blk-meta"
          ><b>{{ $t("message.common.colCreateTime") }}</b>
          {{ fmtTs(formData.created_at) }}</span
        >
        <span class="blk-meta"
          ><b>{{ $t("message.common.colUpdateTime") }}</b>
          {{ fmtTs(formData.updated_at) }}</span
        >
      </div>

      <div class="blk-form-actions">
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
          class="blk-submit-btn"
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
import { addCmsBlock, getCmsBlock, updateCmsBlock, delCmsBlock } from "/@/api/cms/block";
import TranslationEditor, {
  type TranslationField,
} from "/@/components/translation/TranslationEditor.vue";

const props = withDefaults(defineProps<{ editId?: number }>(), { editId: 0 });
const emit = defineEmits<{ saved: []; close: [] }>();

const { t } = useI18n();
const formRef = ref<FormInstance>();
const submitting = ref(false);

const translationFields: TranslationField[] = [
  { key: "title", label: t("message.cms.blockEdit.transTitle"), type: "text" },
  { key: "content", label: t("message.cms.blockEdit.transContent"), type: "textarea", rows: 6 },
];

interface BlockFormData {
  id: number | undefined;
  name: string;
  title: string;
  type: string;
  image: string;
  url: string;
  content: string;
  parsetpl: number;
  weigh: number;
  status: number;
  translations: any[];
  created_at: number;
  updated_at: number;
}

const formData = reactive<BlockFormData>({
  id: undefined,
  name: "",
  title: "",
  type: "",
  image: "",
  url: "",
  content: "",
  parsetpl: 0,
  weigh: 0,
  status: 1,
  translations: [],
  created_at: 0,
  updated_at: 0,
});

const rules = {
  name: [{ required: true, message: t("message.cms.setting.msgNameRequired"), trigger: "blur" }],
  type: [{ required: true, message: t("message.cms.blockEdit.msgTypeRequired"), trigger: "blur" }],
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
    const res = await getCmsBlock(props.editId);
    const data = (res as any).data;
    if (data?.id) {
      formData.id = data.id;
      formData.name = data.name || "";
      formData.title = data.title || "";
      formData.type = data.type || "";
      formData.image = data.image || "";
      formData.url = data.url || "";
      formData.content = data.content || "";
      formData.parsetpl = data.parsetpl ?? 0;
      formData.weigh = data.weigh ?? 0;
      formData.status = data.status ?? 1;
      formData.created_at = data.created_at || 0;
      formData.updated_at = data.updated_at || 0;
      if (data.translations?.length > 0) formData.translations = data.translations;
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
    const submitData = { ...formData } as any;
    const transList = submitData.translations || [];
    delete submitData.translations;
    if (transList.length > 0) {
      submitData.translations = transList.filter((item: any) => item.lang && item.lang !== "zh-CN");
    }
    if (formData.id) {
      await updateCmsBlock(submitData);
      ElMessage.success(t("message.editSuccess"));
    } else {
      await addCmsBlock(submitData);
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
      await delCmsBlock([formData.id!]);
      ElMessage.success(t("message.common.msgDeleteOk"));
      emit("saved");
    })
    .catch(() => {});
};

onMounted(() => loadData());
</script>

<style scoped>
.blk-drawer-form {
  padding: 24px;
}

.blk-tabs {
  margin-bottom: 24px;
}
.blk-tabs :deep(.el-tabs__content) {
  padding: 20px 0 0;
}
.blk-tabs :deep(.el-tabs__header) {
  background: transparent;
  border: none;
  margin-bottom: 0;
}
.blk-tabs :deep(.el-tabs__nav) {
  border: none;
}
.blk-tabs :deep(.el-tabs__item) {
  font-family: var(--cc-font-sans);
  font-size: 14px;
  font-weight: 500;
  color: var(--cc-color-text-3);
  padding: 10px 20px;
  border-radius: 8px 8px 0 0;
}
.blk-tabs :deep(.el-tabs__item.is-active) {
  color: var(--cc-color-text-1);
  background: #fff;
  border-color: var(--cc-color-border);
}

.blk-form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 32px;
  align-items: start;
}
.blk-form-grid > * {
  min-width: 0;
}
.blk-full-row {
  grid-column: 1 / -1;
}

.blk-label {
  font-family: var(--cc-font-sans);
  font-size: 13px;
  font-weight: 500;
  color: var(--cc-color-text-2);
  letter-spacing: 0.005em;
}
.blk-req {
  color: #ef4444;
  margin-left: 2px;
}

.blk-meta-row {
  display: flex;
  gap: 32px;
  flex-wrap: wrap;
  padding-top: 16px;
  margin-bottom: 20px;
  border-top: 1px solid var(--cc-color-border-light);
}
.blk-meta {
  font-family: var(--cc-font-sans);
  font-size: 12px;
  color: var(--cc-color-text-4);
}
.blk-meta b {
  color: var(--cc-color-text-3);
}

.blk-form-card :deep(.el-form-item__label) {
  margin-bottom: 6px;
}
.blk-form-card :deep(.el-input__wrapper),
.blk-form-card :deep(.el-input-number__wrapper),
.blk-form-card :deep(.el-textarea__inner) {
  border-radius: 10px;
  background: var(--cc-color-bg);
  box-shadow: none;
  border: 1px solid var(--cc-color-border);
  transition:
    border-color 0.25s,
    background 0.25s,
    box-shadow 0.25s;
}
.blk-form-card :deep(.el-input__wrapper:hover),
.blk-form-card :deep(.el-input-number__wrapper:hover),
.blk-form-card :deep(.el-textarea__inner:hover) {
  background: #fff;
  border-color: var(--cc-color-text-4);
}
.blk-form-card :deep(.el-input__wrapper.is-focus),
.blk-form-card :deep(.el-input-number__wrapper.is-focus),
.blk-form-card :deep(.el-textarea__inner:focus) {
  background: #fff;
  border-color: var(--cc-color-text-3);
  box-shadow: 0 0 0 3px var(--cc-color-focus-ring);
}
.blk-form-card :deep(.el-input__inner),
.blk-form-card :deep(.el-input-number__inner),
.blk-form-card :deep(.el-textarea__inner) {
  font-family: var(--cc-font-sans);
  font-size: 14px;
  color: var(--cc-color-text-1);
}
.blk-form-card :deep(.el-input__inner::placeholder) {
  color: var(--cc-color-text-4);
}

.blk-form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding-top: 24px;
  border-top: 1px solid var(--cc-color-border-light);
}
.blk-form-actions .el-button {
  font-family: var(--cc-font-sans);
  font-weight: 600;
  letter-spacing: 0.005em;
  border-radius: 10px;
  padding: 12px 28px;
}
.blk-submit-btn {
  background: var(--cc-color-primary) !important;
  border: none !important;
  box-shadow: var(--cc-shadow-card);
  transition: all 0.25s !important;
}
.blk-submit-btn:hover:not(.is-loading) {
  background: var(--cc-color-primary-active) !important;
  box-shadow: var(--cc-shadow-card-hover);
  transform: translateY(-1px);
}

@media (min-width: 1440px) {
  .blk-form-grid {
    gap: 0 48px;
  }
}

@media (max-width: 768px) {
  .blk-form-grid {
    grid-template-columns: 1fr;
  }
  .blk-form-actions {
    flex-direction: column;
  }
  .blk-form-actions .el-button {
    width: 100%;
  }
  .blk-meta-row {
    flex-direction: column;
    gap: 8px;
  }
}
</style>
