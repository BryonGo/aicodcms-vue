<template>
  <div class="dy-form">
    <el-form
      ref="formRef"
      :model="formValues"
      :rules="formRules"
      label-position="top"
      v-loading="loading"
    >
      <!-- 无分组时提示 -->
      <el-empty
        v-if="displayedFields.length === 0 && !loading"
        :description="$t('message.cms.common.noFieldsHint')"
      />

      <!-- 字段渲染 -->
      <template v-else>
        <!-- 分组内仅一个字段时直接渲染，否则按 tabs 分组 -->
        <template v-if="displayedGroups.length === 1">
          <div class="form-section">
            <div class="form-section-inner">
              <el-row :gutter="32">
                <el-col v-for="field in displayedFields" :key="field.name" :span="24">
                  <el-form-item :label="field.label" :prop="field.name">
                    <!-- text -->
                    <el-input
                      v-if="field.type === 'text'"
                      v-model="formValues[field.name]"
                      :placeholder="field.tip || $t('message.cms.common.placeholderInput')"
                      clearable
                    />
                    <!-- number -->
                    <el-input
                      v-else-if="field.type === 'number'"
                      v-model.number="formValues[field.name]"
                      type="number"
                      :placeholder="field.tip || $t('message.cms.common.placeholderInput')"
                    />
                    <!-- textarea -->
                    <el-input
                      v-else-if="field.type === 'textarea'"
                      v-model="formValues[field.name]"
                      type="textarea"
                      :rows="4"
                      :placeholder="field.tip || $t('message.cms.common.placeholderInput')"
                    />
                    <!-- password -->
                    <el-input
                      v-else-if="field.type === 'password'"
                      v-model="formValues[field.name]"
                      type="password"
                      show-password
                      :placeholder="field.tip || $t('message.cms.common.placeholderInput')"
                    />
                    <!-- switch -->
                    <el-switch
                      v-else-if="field.type === 'switch'"
                      v-model="formValues[field.name]"
                      :active-value="1"
                      :inactive-value="0"
                    />
                    <!-- select -->
                    <el-select
                      v-else-if="field.type === 'select'"
                      v-model="formValues[field.name]"
                      clearable
                      filterable
                      style="width: 100%"
                    >
                      <el-option
                        v-for="opt in safeOptions(field.options)"
                        :key="String(opt.value ?? opt)"
                        :label="String(opt.label ?? opt)"
                        :value="String(opt.value ?? opt)"
                      />
                    </el-select>
                    <!-- radio -->
                    <el-radio-group
                      v-else-if="field.type === 'radio'"
                      v-model="formValues[field.name]"
                    >
                      <el-radio
                        v-for="opt in safeOptions(field.options)"
                        :key="String(opt.value ?? opt)"
                        :label="String(opt.value ?? opt)"
                      >
                        {{ opt.label ?? opt }}
                      </el-radio>
                    </el-radio-group>
                    <!-- image -->
                    <div v-else-if="field.type === 'image'" class="img-upload">
                      <el-upload
                        :action="uploadUrl"
                        :data="uploadData"
                        :headers="{ Authorization: 'Bearer ' + token }"
                        :on-success="(res: any) => onUploadSuccess(res, field.name)"
                        :show-file-list="false"
                      >
                        <img
                          v-if="formValues[field.name]"
                          :src="getImgUrl(formValues[field.name])"
                          class="img-preview"
                        />
                        <div v-else class="img-placeholder">
                          <el-icon><Plus /></el-icon>
                          <span>{{ $t("message.component.uploadImage") }}</span>
                        </div>
                      </el-upload>
                      <el-button
                        v-if="formValues[field.name]"
                        size="small"
                        type="danger"
                        style="margin-left: 8px"
                        @click="formValues[field.name] = ''"
                        >{{ $t("message.cms.common.clear") }}</el-button
                      >
                    </div>
                    <!-- fallback -->
                    <el-input
                      v-else
                      v-model="formValues[field.name]"
                      :placeholder="field.tip || $t('message.cms.common.placeholderInput')"
                    />
                    <!-- 提示 -->
                    <div v-if="field.tip && field.type !== 'image'" class="field-tip">
                      {{ field.tip }}
                    </div>
                  </el-form-item>
                </el-col>
              </el-row>
            </div>
          </div>
        </template>

        <!-- 多个分组时用 tabs 切换 -->
        <el-tabs v-else v-model="activeGroupTab" class="dy-form-tabs">
          <el-tab-pane v-for="group in displayedGroups" :key="group" :label="group" :name="group">
            <div class="form-section">
              <div class="form-section-inner">
                <el-row :gutter="32">
                  <el-col v-for="field in getGroupFields(group)" :key="field.name" :span="24">
                    <el-form-item :label="field.label" :prop="field.name">
                      <!-- text -->
                      <el-input
                        v-if="field.type === 'text'"
                        v-model="formValues[field.name]"
                        :placeholder="field.tip || $t('message.cms.common.placeholderInput')"
                        clearable
                      />
                      <!-- number -->
                      <el-input
                        v-else-if="field.type === 'number'"
                        v-model.number="formValues[field.name]"
                        type="number"
                        :placeholder="field.tip || $t('message.cms.common.placeholderInput')"
                      />
                      <!-- textarea -->
                      <el-input
                        v-else-if="field.type === 'textarea'"
                        v-model="formValues[field.name]"
                        type="textarea"
                        :rows="4"
                        :placeholder="field.tip || $t('message.cms.common.placeholderInput')"
                      />
                      <!-- password -->
                      <el-input
                        v-else-if="field.type === 'password'"
                        v-model="formValues[field.name]"
                        type="password"
                        show-password
                        :placeholder="field.tip || $t('message.cms.common.placeholderInput')"
                      />
                      <!-- switch -->
                      <el-switch
                        v-else-if="field.type === 'switch'"
                        v-model="formValues[field.name]"
                        :active-value="1"
                        :inactive-value="0"
                      />
                      <!-- select -->
                      <el-select
                        v-else-if="field.type === 'select'"
                        v-model="formValues[field.name]"
                        clearable
                        filterable
                        style="width: 100%"
                      >
                        <el-option
                          v-for="opt in safeOptions(field.options)"
                          :key="String(opt.value ?? opt)"
                          :label="String(opt.label ?? opt)"
                          :value="String(opt.value ?? opt)"
                        />
                      </el-select>
                      <!-- radio -->
                      <el-radio-group
                        v-else-if="field.type === 'radio'"
                        v-model="formValues[field.name]"
                      >
                        <el-radio
                          v-for="opt in safeOptions(field.options)"
                          :key="String(opt.value ?? opt)"
                          :label="String(opt.value ?? opt)"
                        >
                          {{ opt.label ?? opt }}
                        </el-radio>
                      </el-radio-group>
                      <!-- image -->
                      <div v-else-if="field.type === 'image'" class="img-upload">
                        <el-upload
                          :action="uploadUrl"
                          :data="uploadData"
                          :headers="{ Authorization: 'Bearer ' + token }"
                          :on-success="(res: any) => onUploadSuccess(res, field.name)"
                          :show-file-list="false"
                        >
                          <img
                            v-if="formValues[field.name]"
                            :src="getImgUrl(formValues[field.name])"
                            class="img-preview"
                          />
                          <div v-else class="img-placeholder">
                            <el-icon><Plus /></el-icon>
                            <span>{{ $t("message.component.uploadImage") }}</span>
                          </div>
                        </el-upload>
                      </div>
                      <!-- fallback -->
                      <el-input
                        v-else
                        v-model="formValues[field.name]"
                        :placeholder="field.tip || $t('message.cms.common.placeholderInput')"
                      />
                      <div v-if="field.tip && field.type !== 'image'" class="field-tip">
                        {{ field.tip }}
                      </div>
                    </el-form-item>
                  </el-col>
                </el-row>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </template>

      <!-- 保存按钮 -->
      <div v-if="displayedFields.length > 0" class="form-actions">
        <el-divider />
        <el-button type="primary" size="large" :loading="submitLoading" @click="onSubmit" round>
          {{ $t("message.common.save") }}
        </el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { ElMessage, type FormInstance } from "element-plus";
import { Plus } from "@element-plus/icons-vue";
import { useI18n } from "vue-i18n";
const { t } = useI18n();
import { getCmsSettingFields, saveCmsSettingFields } from "/@/api/cms/setting";
import { buildApiUrl, getToken, getUpFileUrl } from "/@/utils/aicodcod";

// ========== Props ==========
interface Props {
  groupId?: number | string;
  groupName?: string;
}
const props = withDefaults(defineProps<Props>(), {
  groupId: 0,
  groupName: "",
});

// ========== Emit ==========
const emit = defineEmits<{
  saved: [];
}>();

// ========== 上传 ==========
const uploadUrl = buildApiUrl("/api/v1/addon/upload");
const uploadData = { token: getToken() };
const token = getToken();

// ========== 状态 ==========
const formRef = ref<FormInstance>();
const loading = ref(false);
const submitLoading = ref(false);
const activeGroupTab = ref("");

// 后端返回字段的 group 字段是字符串（group_name），而 props.groupName 传入的也是 name
// displayedGroups 是 computed，依据 props.groupName 过滤或不过滤
interface FieldDef {
  name: string;
  label: string;
  type: string;
  value: any;
  default: any;
  required: boolean;
  tip: string;
  group: string;
  options: any[];
}

const allFields = ref<FieldDef[]>([]);
const allGroups = ref<string[]>([]);
const formValues = reactive<Record<string, any>>({});
const formRules = reactive<Record<string, any>>({});

// ========== 计算属性 ==========
const displayedGroups = computed(() => {
  const groups = allGroups.value || [];
  if (!props.groupName) return groups;
  return groups.filter((g) => g === props.groupName);
});

const displayedFields = computed(() => {
  const fields = allFields.value || [];
  if (!props.groupName) return fields;
  return fields.filter((f) => f.group === props.groupName);
});

// ========== 工具方法 ==========
const safeOptions = (options: any): any[] => {
  if (Array.isArray(options)) return options;
  return [];
};

const getGroupFields = (group: string): FieldDef[] => {
  return (allFields.value || []).filter((f) => f.group === group);
};

const getImgUrl = (url: string) => {
  if (!url) return "";
  if (/^http/i.test(url) || url.startsWith("blob:")) return url;
  return getUpFileUrl(url);
};

const onUploadSuccess = (res: any, fieldName: string) => {
  if (res && res.code === 0) {
    formValues[fieldName] = res.data?.path || "";
    ElMessage.success(t("message.common.msgAddOk"));
  } else {
    ElMessage.error(res?.msg || res?.message || t("message.common.msgAddOk"));
  }
};

// ========== 加载数据 ==========
const loadFields = () => {
  loading.value = true;
  getCmsSettingFields()
    .then((res: any) => {
      if (res && res.code === 0) {
        const data = res.data || {};
        allFields.value = Array.isArray(data.fields) ? data.fields : [];
        allGroups.value = Array.isArray(data.groups) ? data.groups : [];

        // 直接用 props.groupName 初始化 Tab，确保：
        // 1. 首次挂载时正确显示当前分组
        // 2. 刷新后（key 变化重新挂载）仍然显示当前分组
        if (props.groupName) {
          activeGroupTab.value = props.groupName;
        }

        // 构建表单值
        const values: Record<string, any> = {};
        const rules: Record<string, any> = {};
        for (const field of allFields.value) {
          // 优先使用 value（YAML 中的值），否则用 default
          values[field.name] = field.value !== undefined ? field.value : (field.default ?? "");
          if (field.required) {
            rules[field.name] = [
              {
                required: true,
                message: field.label + t("message.common.requiredSuffix"),
                trigger: "blur",
              },
            ];
          }
        }
        Object.assign(formValues, values);
        Object.assign(formRules, rules);
      }
    })
    .catch(() => {
      allFields.value = [];
      allGroups.value = [];
    })
    .finally(() => {
      loading.value = false;
    });
};

// ========== 提交 ==========
const onSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;

  submitLoading.value = true;
  saveCmsSettingFields({ ...formValues })
    .then((res: any) => {
      if (res && res.code === 0) {
        ElMessage.success(t("message.common.msgSaveOk"));
        emit("saved");
      } else {
        ElMessage.error(res?.msg || res?.message || t("message.common.msgSaveOk"));
      }
    })
    .catch(() => {
      ElMessage.error(t("message.common.msgSaveOk"));
    })
    .finally(() => {
      submitLoading.value = false;
    });
};

// ========== 初始化 ==========
onMounted(() => {
  loadFields();
});
</script>

<style scoped>
.dy-form {
  padding: 0;
}

.dy-form-tabs {
  margin-bottom: 0;
}

/* ====== 字段卡片容器 ====== */
.form-section {
  background: #ffffff;
  border: 1px solid #eef1f5;
  border-radius: 14px;
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.04),
    0 1px 2px rgba(0, 0, 0, 0.02);
  transition: box-shadow 0.2s ease;

  &:hover {
    box-shadow:
      0 2px 8px rgba(0, 0, 0, 0.06),
      0 1px 3px rgba(0, 0, 0, 0.03);
  }
}

.form-section-inner {
  padding: 28px 32px 8px;
}

/* ====== 表单字段增强 ====== */
:deep(.el-form-item) {
  margin-bottom: 24px;
}

:deep(.el-form-item__label) {
  font-size: 13px;
  font-weight: 600;
  color: #334155;
  padding-bottom: 8px;
  line-height: 1.4;
}

:deep(.el-input__wrapper),
:deep(.el-textarea__inner),
:deep(.el-select .el-input__wrapper) {
  border-radius: 8px;
  transition:
    box-shadow 0.2s ease,
    border-color 0.2s ease;
  border: 1px solid #d0d5dd;
  box-shadow: none;
}

:deep(.el-input__wrapper:hover),
:deep(.el-textarea__inner:hover) {
  border-color: #a4b0c2;
}

:deep(.el-input__wrapper.is-focus),
:deep(.el-textarea__inner:focus),
:deep(.el-select .el-input__wrapper.is-focus) {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

:deep(.el-textarea__inner) {
  min-height: 40px;
}

/* ====== 提示文字 ====== */
.field-tip {
  color: #94a3b8;
  font-size: 12px;
  line-height: 1.5;
  margin-top: 6px;
  padding-left: 1px;
}

/* ====== 操作按钮区 ====== */
.form-actions {
  padding: 8px 0 12px;

  :deep(.el-divider) {
    margin: 0 0 20px;
    border-color: #eef1f5;
  }

  .el-button {
    padding: 12px 32px;
    font-size: 14px;
    font-weight: 600;
  }
}

/* ====== 图片上传 ====== */
.img-upload {
  display: flex;
  align-items: flex-start;

  .el-upload {
    border: 1px dashed #d0d5dd;
    border-radius: 10px;
    cursor: pointer;
    overflow: hidden;
    transition:
      border-color 0.2s,
      background 0.2s;
    width: 148px;
    height: 148px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fafbfc;

    &:hover {
      border-color: #3b82f6;
      background: #f5f8ff;
    }
  }
}

.img-preview {
  max-width: 148px;
  max-height: 148px;
  object-fit: contain;
  display: block;
}

.img-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  font-size: 12px;
  gap: 6px;

  .el-icon {
    font-size: 24px;
    color: #64748b;
  }
}
</style>
