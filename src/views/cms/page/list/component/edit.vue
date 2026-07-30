<template>
  <div class="pg-drawer-form">
    <el-form ref="formRef" :model="formData" :rules="rules" label-position="top" size="large">
      <el-tabs model-value="base" type="border-card" class="pg-tabs">
        <el-tab-pane :label="$t('message.cms.channelEdit.basicInfo')" name="base">
          <div class="pg-form-grid">
            <el-form-item prop="title">
              <template #label
                ><span class="pg-label"
                  >{{ $t("message.cms.blockEdit.colTitle") }}
                  <span class="pg-req">*</span></span
                ></template
              >
              <el-input
                v-model.trim="formData.title"
                :placeholder="$t('message.cms.articleEdit.placeholderTitle')"
              />
            </el-form-item>
            <el-form-item prop="type">
              <template #label
                ><span class="pg-label">{{ $t("message.common.type") }}</span></template
              >
              <el-input
                v-model.trim="formData.type"
                :placeholder="$t('message.cms.pageEdit.placeholderType')"
              />
            </el-form-item>
            <el-form-item prop="diyname">
              <template #label
                ><span class="pg-label">{{
                  $t("message.cms.pageEdit.colDiyname")
                }}</span></template
              >
              <el-input
                v-model.trim="formData.diyname"
                :placeholder="$t('message.cms.pageEdit.placeholderDiyname')"
              />
            </el-form-item>
            <el-form-item prop="showtpl">
              <template #label
                ><span class="pg-label">{{
                  $t("message.cms.pageEdit.colShowtpl")
                }}</span></template
              >
              <el-input
                v-model.trim="formData.showtpl"
                :placeholder="$t('message.cms.pageEdit.placeholderShowtpl')"
              />
            </el-form-item>
            <el-form-item prop="seotitle">
              <template #label
                ><span class="pg-label">{{
                  $t("message.cms.articleEdit.colSeotitle")
                }}</span></template
              >
              <el-input
                v-model.trim="formData.seotitle"
                :placeholder="$t('message.cms.articleEdit.placeholderSeotitle')"
              />
            </el-form-item>
            <el-form-item prop="keywords">
              <template #label
                ><span class="pg-label">{{
                  $t("message.cms.pageEdit.colKeywords")
                }}</span></template
              >
              <el-input
                v-model.trim="formData.keywords"
                :placeholder="$t('message.cms.articleEdit.placeholderKeywords')"
              />
            </el-form-item>
            <el-form-item prop="description" class="pg-full-row">
              <template #label
                ><span class="pg-label">{{
                  $t("message.cms.articleEdit.colDescription")
                }}</span></template
              >
              <el-input
                v-model.trim="formData.description"
                type="textarea"
                :rows="3"
                :placeholder="$t('message.cms.articleEdit.placeholderDescription')"
              />
            </el-form-item>
            <el-form-item prop="views">
              <template #label
                ><span class="pg-label">{{
                  $t("message.cms.articleEdit.colViews")
                }}</span></template
              >
              <el-input
                v-model.trim="formData.views"
                :placeholder="$t('message.cms.pageEdit.placeholderViews')"
              />
            </el-form-item>
            <el-form-item prop="status">
              <template #label
                ><span class="pg-label">{{ $t("message.common.colStatus") }}</span></template
              >
              <el-radio-group v-model="formData.status">
                <el-radio :label="1">{{ $t("message.cms.pageEdit.statusEnabled") }}</el-radio>
                <el-radio :label="0">{{ $t("message.cms.pageEdit.statusDisabled") }}</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item prop="content" class="pg-full-row">
              <template #label
                ><span class="pg-label">{{
                  $t("message.cms.articleEdit.colContent")
                }}</span></template
              >
              <GfTiptap
                v-model="formData.content"
                toolbar="full"
                :placeholder="$t('message.cms.pageEdit.placeholderContent')"
              />
            </el-form-item>
          </div>
        </el-tab-pane>
        <el-tab-pane :label="$t('message.cms.channelEdit.multiLang')" name="trans">
          <TranslationEditor v-model="formData.translations" :fields="translationFields" />
        </el-tab-pane>
      </el-tabs>

      <div v-if="formData.id" class="pg-meta-row">
        <span class="pg-meta"><b>{{ $t("message.common.colCreateTime") }}:</b> {{ fmtTs(formData.created_at) }}</span>
        <span class="pg-meta"><b>{{ $t("message.common.colUpdateTime") }}:</b> {{ fmtTs(formData.updated_at) }}</span>
      </div>

      <div class="pg-form-actions">
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
          class="pg-submit-btn"
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
import { getCmsPage, addCmsPage, updateCmsPage, delCmsPage } from "/@/api/cms/page";
import GfTiptap from "/@/components/tiptap/index.vue";
import TranslationEditor, {
  type TranslationField,
} from "/@/components/translation/TranslationEditor.vue";

const props = withDefaults(defineProps<{ editId?: number }>(), { editId: 0 });
const emit = defineEmits<{ saved: []; close: [] }>();

const { t } = useI18n();
const formRef = ref<FormInstance>();
const submitting = ref(false);

const translationFields: TranslationField[] = [
  { key: "title", label: t("message.cms.pageEdit.transTitle"), type: "text" },
  { key: "seotitle", label: t("message.cms.pageEdit.transSeotitle"), type: "text" },
  { key: "keywords", label: t("message.cms.pageEdit.transKeywords"), type: "text" },
  {
    key: "description",
    label: t("message.cms.pageEdit.transDescription"),
    type: "textarea",
    rows: 2,
  },
  {
    key: "showtpl",
    label: t("message.cms.pageEdit.transTemplate"),
    type: "templateInput",
    placeholder: "e.g. page_en.html",
  },
  { key: "content", label: t("message.cms.pageEdit.transContent"), type: "richtext", rows: 6 },
];

interface PageFormData {
  id: number | undefined;
  title: string;
  type: string;
  seotitle: string;
  keywords: string;
  description: string;
  content: string;
  diyname: string;
  showtpl: string;
  views: string;
  status: number;
  translations: any[];
  created_at: number;
  updated_at: number;
}

const formData = reactive<PageFormData>({
  id: undefined,
  title: "",
  type: "",
  seotitle: "",
  keywords: "",
  description: "",
  content: "",
  diyname: "",
  showtpl: "",
  views: "",
  status: 1,
  translations: [],
  created_at: 0,
  updated_at: 0,
});

const rules = {
  title: [{ required: true, message: t("message.cms.pageEdit.msgTitleRequired"), trigger: "blur" }],
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
    const res = await getCmsPage(props.editId);
    const data = (res as any).data;
    if (data?.id) {
      Object.assign(formData, {
        id: data.id,
        title: data.title || "",
        type: data.type || "",
        seotitle: data.seotitle || "",
        keywords: data.keywords || "",
        description: data.description || "",
        content: data.content || "",
        diyname: data.diyname || "",
        showtpl: data.showtpl || "",
        views: data.views || "",
        status: data.status ?? 1,
        translations: data.translations?.length > 0 ? data.translations : [],
        created_at: data.created_at || 0,
        updated_at: data.updated_at || 0,
      });
    } else {
      ElMessage.error(t("message.cms.pageEdit.notFound"));
    }
  } catch {
    ElMessage.error(t("message.common.msgNetworkErrorRetry"));
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
      await updateCmsPage(submitData);
      ElMessage.success(t("message.common.msgEditOk"));
    } else {
      await addCmsPage(submitData);
      ElMessage.success(t("message.common.msgAddOk"));
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
    t("message.common.confirmDeleteItem", { name: formData.title || "" }),
    t("message.common.confirmDeleteTitle"),
    {
      type: "warning",
      confirmButtonText: t("message.common.confirmDeleteTitle"),
      cancelButtonText: t("message.common.cancel"),
    },
  )
    .then(async () => {
      await delCmsPage([formData.id!]);
      ElMessage.success(t("message.common.msgDeleteOk"));
      emit("saved");
    })
    .catch(() => {});
};

onMounted(() => loadData());
</script>

<style scoped>
.pg-drawer-form {
  padding: 24px;
}

.pg-tabs {
  margin-bottom: 24px;
}
.pg-tabs :deep(.el-tabs__content) {
  padding: 20px 0 0;
}
.pg-tabs :deep(.el-tabs__header) {
  background: transparent;
  border: none;
  margin-bottom: 0;
}
.pg-tabs :deep(.el-tabs__nav) {
  border: none;
}
.pg-tabs :deep(.el-tabs__item) {
  font-family: var(--cc-font-sans);
  font-size: 14px;
  font-weight: 500;
  color: var(--cc-color-text-3);
  padding: 10px 20px;
  border-radius: 8px 8px 0 0;
}
.pg-tabs :deep(.el-tabs__item.is-active) {
  color: var(--cc-color-text-1);
  background: #fff;
  border-color: var(--cc-color-border);
}

.pg-form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 32px;
  align-items: start;
}
.pg-form-grid > * {
  min-width: 0;
}
.pg-full-row {
  grid-column: 1 / -1;
}

.pg-label {
  font-family: var(--cc-font-sans);
  font-size: 13px;
  font-weight: 500;
  color: var(--cc-color-text-2);
}
.pg-req {
  color: var(--cc-color-danger);
  margin-left: 2px;
}

.pg-meta-row {
  display: flex;
  gap: 32px;
  flex-wrap: wrap;
  padding-top: 16px;
  margin-bottom: 20px;
  border-top: 1px solid var(--cc-color-border-light);
}
.pg-meta {
  font-family: var(--cc-font-sans);
  font-size: 12px;
  color: var(--cc-color-text-4);
}
.pg-meta b {
  color: var(--cc-color-text-3);
}

.pg-drawer-form :deep(.el-form-item__label) {
  margin-bottom: 6px;
}
.pg-drawer-form :deep(.el-input__wrapper),
.pg-drawer-form :deep(.el-textarea__inner) {
  border-radius: 10px;
  background: var(--cc-color-bg);
  box-shadow: none;
  border: 1px solid var(--cc-color-border);
  transition: border-color 0.25s, background 0.25s, box-shadow 0.25s;
}
.pg-drawer-form :deep(.el-input__wrapper:hover),
.pg-drawer-form :deep(.el-textarea__inner:hover) {
  background: var(--cc-color-surface);
  border-color: var(--cc-color-text-4);
}
.pg-drawer-form :deep(.el-input__wrapper.is-focus),
.pg-drawer-form :deep(.el-textarea__inner:focus) {
  background: var(--cc-color-surface);
  border-color: var(--cc-color-text-3);
  box-shadow: 0 0 0 3px var(--cc-color-focus-ring);
}
.pg-drawer-form :deep(.el-input__inner),
.pg-drawer-form :deep(.el-textarea__inner) {
  font-family: var(--cc-font-sans);
  font-size: 14px;
  color: var(--cc-color-text-1);
}

.pg-form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding-top: 24px;
  border-top: 1px solid var(--cc-color-border-light);
}
.pg-form-actions .el-button {
  font-family: var(--cc-font-sans);
  font-weight: 600;
  border-radius: 10px;
  padding: 12px 28px;
}
.pg-submit-btn {
  background: var(--cc-color-primary) !important;
  border: none !important;
  box-shadow: var(--cc-shadow-card);
  transition: all 0.25s !important;
}
.pg-submit-btn:hover:not(.is-loading) {
  background: var(--cc-color-primary-active) !important;
  box-shadow: var(--cc-shadow-card-hover);
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .pg-form-grid {
    grid-template-columns: 1fr;
  }
  .pg-form-actions {
    flex-direction: column-reverse;
  }
  .pg-form-actions .el-button {
    width: 100%;
  }
}
</style>
