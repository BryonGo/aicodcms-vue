<template>
  <div class="translation-editor">
    <el-alert
      :title="$t('message.cms.common.multiLangHint')"
      type="info"
      :closable="false"
      show-icon
      style="margin-bottom: 15px"
    />
    <el-select
      v-model="activeLang"
      :placeholder="$t('message.cms.common.selectLanguage')"
      style="width: 280px; margin-bottom: 15px"
    >
      <el-option
        v-for="lang in availableLangs"
        :key="lang.code"
        :label="`${lang.flag} ${lang.code} — ${lang.nativeName}`"
        :value="lang.code"
      />
    </el-select>

    <div v-if="activeLang">
      <el-form-item v-for="field in fields" :key="field.key" :label="field.label">
        <!-- 文本输入 -->
        <el-input
          v-if="field.type === 'text' || field.type === 'string'"
          v-model="currentTrans[field.key]"
          :placeholder="
            field.placeholder || $t('message.cms.common.placeholderInput') + ' ' + field.label
          "
          clearable
        />
        <!-- 文本域 -->
        <el-input
          v-else-if="field.type === 'textarea'"
          v-model="currentTrans[field.key]"
          type="textarea"
          :rows="field.rows || 3"
          :placeholder="
            field.placeholder || $t('message.cms.common.placeholderInput') + ' ' + field.label
          "
        />
        <!-- 富文本（长内容） -->
        <el-input
          v-else-if="field.type === 'richtext'"
          v-model="currentTrans[field.key]"
          type="textarea"
          :rows="field.rows || 6"
          :placeholder="
            field.placeholder || $t('message.cms.common.placeholderInput') + ' ' + field.label
          "
        />
        <!-- 模板选择 -->
        <el-select
          v-else-if="field.type === 'template'"
          v-model="currentTrans[field.key]"
          :placeholder="field.placeholder || $t('message.cms.common.placeholderSelectTemplate')"
          clearable
          style="width: 100%"
        >
          <el-option v-for="opt in field.options || []" :key="opt" :label="opt" :value="opt" />
        </el-select>
        <!-- 输入型选择器（编辑填自定模板名） -->
        <el-input
          v-else-if="field.type === 'templateInput'"
          v-model="currentTrans[field.key]"
          :placeholder="field.placeholder || $t('message.cms.common.placeholderTemplateName')"
          clearable
        />
        <!-- 默认文本输入 -->
        <el-input
          v-else
          v-model="currentTrans[field.key]"
          :placeholder="
            field.placeholder || $t('message.cms.common.placeholderInput') + ' ' + field.label
          "
        />
        <div
          v-if="field.hint"
          style="color: #909399; font-size: 12px; margin-left: 8px; white-space: nowrap"
        >
          {{ field.hint }}
        </div>
      </el-form-item>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref, onMounted } from "vue";
import { getLanguageCatalog } from "/@/api/cms/setting";

export interface TranslationField {
  key: string;
  label: string;
  type: "text" | "textarea" | "richtext" | "template" | "templateInput";
  placeholder?: string;
  rows?: number;
  options?: string[];
  hint?: string;
}

export interface TranslationItem {
  lang: string;
  [key: string]: any;
}

export default defineComponent({
  name: "TranslationEditor",
  props: {
    modelValue: { type: Array as () => TranslationItem[], default: () => [] },
    fields: { type: Array as () => TranslationField[], required: true },
    // langs 保留为可选 prop（兼容外部传入），未传时从 API 获取激活语言列表
    langs: {
      type: Array as () => { code: string; name: string }[],
      default: () => [],
    },
  },
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    // 从 API 获取激活语言列表（排除默认语言 zh-CN）
    const apiLangList = ref<{ code: string; flag: string; name: string; nativeName: string }[]>([]);

    async function fetchLangs() {
      try {
        const res: any = await getLanguageCatalog("active");
        console.log("[TranslationEditor] API raw response:", res);
        console.log("[TranslationEditor] res.data:", res?.data);
        console.log("[TranslationEditor] activeInfos:", res?.data?.activeInfos);
        console.log("[TranslationEditor] default:", res?.data?.default);
        const activeInfos: { code: string; flag: string; nativeName: string }[] =
          res?.data?.activeInfos || [];
        const defaultLang: string = res?.data?.default || "zh-CN";
        const filtered = activeInfos
          .filter((l: any) => l.code !== defaultLang)
          .map((l: any) => ({
            code: l.code,
            flag: l.flag,
            name: l.name,
            nativeName: l.nativeName,
          }));
        console.log("[TranslationEditor] filtered (excl default):", filtered);
        if (filtered.length > 0) {
          apiLangList.value = filtered;
          console.log("[TranslationEditor] apiLangList set:", apiLangList.value);
        } else {
          console.warn(
            "[TranslationEditor] filtered is empty, activeInfos:",
            activeInfos,
            "defaultLang:",
            defaultLang,
          );
          if (props.langs.length > 0) {
            apiLangList.value = props.langs.map((l) => ({
              code: l.code,
              flag: "",
              name: l.name,
              nativeName: l.name,
            }));
          }
        }
      } catch (e) {
        console.error("[TranslationEditor] fetchLangs error:", e);
        if (props.langs.length > 0) {
          apiLangList.value = props.langs.map((l) => ({
            code: l.code,
            flag: "",
            name: l.name,
            nativeName: l.name,
          }));
        }
      }
    }

    const activeLang = ref("");

    // 找到当前语言的翻译对象，不存在则创建
    const currentTrans = computed({
      get: () => {
        const items = props.modelValue || [];
        let item = items.find((i: TranslationItem) => i.lang === activeLang.value);
        if (!item) {
          item = { lang: activeLang.value } as TranslationItem;
          // 初始化所有 field 为空
          (props.fields || []).forEach((f: TranslationField) => {
            item![f.key] = "";
          });
          const newItems = [...items, item];
          emit("update:modelValue", newItems);
        }
        return item;
      },
      set: (val: TranslationItem) => {
        const items = [...(props.modelValue || [])];
        const idx = items.findIndex((i: TranslationItem) => i.lang === activeLang.value);
        if (idx >= 0) {
          items[idx] = val;
        } else {
          items.push(val);
        }
        emit("update:modelValue", items);
      },
    });

    const availableLangs = computed(() => apiLangList.value);

    onMounted(async () => {
      await fetchLangs();
      // 默认选中第一个可用语言
      if (availableLangs.value.length > 0 && !activeLang.value) {
        activeLang.value = availableLangs.value[0].code;
      }
    });

    return { activeLang, currentTrans, availableLangs };
  },
});
</script>
