<template>
  <ProPage :title="`字段构建 — ID: ${formId}`" :subtitle="$t('message.form.formManage')">
    <template #actions>
      <el-button :icon="Plus" @click="addField">{{ $t("message.form.addField") }}</el-button>
      <el-button type="primary" :icon="Check" @click="onSave">{{
        $t("message.form.saveAllFields")
      }}</el-button>
    </template>

    <div v-if="fields.length" class="field-list">
      <div v-for="(f, i) in fields" :key="i" class="field-card">
        <div class="field-card__index">{{ i + 1 }}</div>
        <div class="field-card__body">
          <el-input
            v-model="f.label"
            :placeholder="$t('message.form.fieldLabel')"
            class="field-label"
          />
          <el-select v-model="f.type" class="field-type">
            <el-option :label="$t('message.form.text')" value="text" />
            <el-option :label="$t('message.form.textarea')" value="textarea" />
            <el-option :label="$t('message.form.select')" value="select" />
            <el-option :label="$t('message.form.radio')" value="radio" />
            <el-option :label="$t('message.form.checkbox')" value="checkbox" />
            <el-option :label="$t('message.form.file')" value="file" />
            <el-option :label="$t('message.form.email')" value="email" />
            <el-option :label="$t('message.form.date')" value="date" />
            <el-option :label="$t('message.form.number')" value="number" />
          </el-select>
          <el-switch
            v-model="f.required"
            :active-value="true"
            :inactive-value="false"
            :active-text="$t('message.form.required')"
          />
          <el-input
            v-model="f.placeholder"
            :placeholder="$t('message.form.placeholder')"
            class="field-placeholder"
          />
          <el-input
            v-if="['select', 'radio', 'checkbox'].includes(f.type)"
            v-model="f.optionsRaw"
            :placeholder="$t('message.form.optionsHint')"
            class="field-options"
          />
        </div>
        <el-button
          class="field-card__delete"
          size="small"
          type="danger"
          plain
          :icon="Delete"
          @click="removeField(i)"
        />
      </div>
    </div>

    <div v-else class="field-empty">
      <div class="field-empty__title">{{ $t("message.form.noFields") }}</div>
      <el-button type="primary" plain :icon="Plus" @click="addField">{{
        $t("message.form.addField")
      }}</el-button>
    </div>
  </ProPage>
</template>

<script lang="ts">
import { useI18n } from "vue-i18n";
import { defineComponent, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { ElMessage } from "element-plus";
import { Plus, Check, Delete } from "@element-plus/icons-vue";
import ProPage from "/@/components/pro/ProPage.vue";
import { listFormFields, saveFormFields } from "/@/api/addon/form/index";

export default defineComponent({
  name: "FormFieldBuilder",
  components: { ProPage, Plus, Check, Delete },
  setup() {
    const { t } = useI18n();
    const route = useRoute();
    const formId = Number(route.params.id);
    const fields = ref<any[]>([]);

    const load = () => {
      listFormFields(formId).then((r: any) => {
        fields.value = (r?.data?.fields || []).map((f: any) => ({
          ...f,
          optionsRaw: (f.options || []).join(","),
        }));
      });
    };

    const addField = () => {
      fields.value.push({
        label: "",
        type: "text",
        required: false,
        placeholder: "",
        optionsRaw: "",
        options: [],
      });
    };

    const removeField = (i: number) => {
      fields.value.splice(i, 1);
    };

    const onSave = () => {
      const data = fields.value.map((f: any) => ({
        label: f.label,
        type: f.type,
        required: f.required,
        placeholder: f.placeholder,
        options: ["select", "radio", "checkbox"].includes(f.type)
          ? (f.optionsRaw || "").split(",").filter(Boolean)
          : [],
      }));
      saveFormFields(formId, data).then(() => {
        ElMessage.success(t("message.form.fieldSaved"));
        load();
      });
    };

    onMounted(load);
    return { formId, fields, addField, removeField, onSave, Plus, Check, Delete };
  },
});
</script>

<style scoped>
.field-list {
  display: flex;
  flex-direction: column;
  gap: var(--cc-space-3);
}
.field-card {
  display: flex;
  align-items: flex-start;
  gap: var(--cc-space-3);
  padding: var(--cc-space-4);
  background: var(--cc-color-surface);
  border: 1px solid var(--cc-color-border-light);
  border-radius: var(--cc-radius-lg);
  box-shadow: var(--cc-shadow-xs);
}
.field-card__index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: var(--cc-radius-md);
  background: var(--cc-color-primary-softer);
  color: var(--cc-color-primary);
  font-size: var(--cc-font-13);
  font-weight: 700;
  flex-shrink: 0;
}
.field-card__body {
  display: flex;
  align-items: center;
  gap: var(--cc-space-2);
  flex-wrap: wrap;
  flex: 1;
}
.field-label {
  width: 160px;
}
.field-type {
  width: 140px;
}
.field-placeholder {
  width: 160px;
}
.field-options {
  width: 240px;
}
.field-card__delete {
  flex-shrink: 0;
}
.field-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--cc-space-4);
  padding: var(--cc-space-8) var(--cc-space-5);
  background: var(--cc-color-surface);
  border: 1px dashed var(--cc-color-border-strong);
  border-radius: var(--cc-radius-lg);
  color: var(--cc-color-text-3);
}
.field-empty__title {
  font-size: var(--cc-font-14);
  font-weight: 600;
}
@media (max-width: 768px) {
  .field-card {
    flex-direction: column;
  }
  .field-card__body,
  .field-label,
  .field-type,
  .field-placeholder,
  .field-options {
    width: 100%;
  }
}
</style>
