<template>
  <div class="dynamic-model-form">
    <!-- 模型选择器 -->
    <el-form-item
      :label="$t('message.cms.common.placeholderSelectModel')"
      prop="model_id"
      v-if="showModelSelect"
    >
      <el-select
        v-model="currentModelId"
        :placeholder="$t('message.cms.common.placeholderSelectModel')"
        clearable
        @change="handleModelChange"
        style="width: 100%"
      >
        <el-option v-for="item in modelList" :key="item.id" :label="item.name" :value="item.id" />
      </el-select>
    </el-form-item>

    <!-- 动态字段渲染区 -->
    <template v-if="fields.length > 0">
      <el-divider content-position="left" v-if="showDivider">
        {{ $t("message.component.fieldExtension", { name: currentModelName }) }}
      </el-divider>
      <el-form-item
        v-for="field in fields"
        :key="field.id"
        :label="$t('moduleField_' + field.name, field.label)"
        :prop="field.name"
        :rules="getFieldRules(field)"
      >
        <modules-data-form-item v-model="field.content" :module-field="field" style="width: 100%" />
        <span v-if="field.description" class="field-desc">{{ field.description }}</span>
      </el-form-item>
    </template>

    <!-- 无模型选择时的提示 -->
    <el-empty
      v-if="!currentModelId && !showModelSelect"
      :image-size="80"
      :description="$t('message.component.noModelHint')"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, onMounted, PropType } from "vue";
import { ElMessage } from "element-plus";
import { useI18n } from "vue-i18n";
import { listModulesInfo, getModulesInfo } from "/@/api/pms/modulesInfo";
import { listModulesField } from "/@/api/pms/modulesField";
import { ModulesFieldInfoData } from "/@/views/pms/modulesField/list/component/model";
import ModulesDataFormItem from "/@/components/modulesData/forumItem.vue";
export interface ModulesInfoData {
  id: number;
  name: string;
  table_name: string;
  sort: number;
  status: boolean;
  created_at: string;
  updated_at: string;
}

export default defineComponent({
  name: "DynamicModelForm",
  components: { ModulesDataFormItem },
  props: {
    // 预选的模型ID（编辑模式时传入）
    modelId: {
      type: Number as PropType<number | undefined>,
      default: undefined,
    },
    // 外部传入的模型数据（用于回显）
    modelData: {
      type: Object as PropType<Record<string, any>>,
      default: () => ({}),
    },
    // 是否显示模型选择器
    showModelSelect: {
      type: Boolean,
      default: true,
    },
    // 是否显示分隔线
    showDivider: {
      type: Boolean,
      default: true,
    },
  },
  emits: ["update:modelId", "fields-change", "data-change"],
  setup(props, { emit }) {
    const { t } = useI18n();
    const currentModelId = ref<number | undefined>(props.modelId);
    const currentModelName = ref("");
    const modelList = ref<ModulesInfoData[]>([]);
    const fields = ref<ModulesFieldInfoData[]>([]);

    // 加载模型列表
    const loadModelList = () => {
      listModulesInfo({ row: 50, page: 1 }).then((res: any) => {
        modelList.value = res.data?.list ?? [];
        // 如果传入了 modelId 且 modelList 已加载，自动触发字段加载
        if (currentModelId.value) {
          const matched = modelList.value.find((m) => m.id === currentModelId.value);
          if (matched) {
            currentModelName.value = matched.name;
            loadFields(currentModelId.value);
          }
        }
      });
    };

    // 根据模型ID加载字段
    const loadFields = (moduleId: number) => {
      if (!moduleId || moduleId <= 0) {
        fields.value = [];
        return;
      }
      listModulesField({ row: 100, page: 1, moduleId })
        .then((res: any) => {
          const rawFields: any[] = res.data?.list ?? [];
          fields.value = rawFields.map((item: any) => {
            // 初始化字段内容：优先使用外部传入的数据，其次使用默认值
            let content: any = undefined;
            if (props.modelData && props.modelData[item.name] !== undefined) {
              content = props.modelData[item.name];
            } else if (item.default !== undefined && item.default !== "") {
              content = item.default;
            } else if (
              ["checkbox", "image", "images", "file", "files", "tags"].includes(item.type)
            ) {
              content = [];
            } else {
              content = "";
            }
            return {
              ...item,
              content,
            };
          });
          emit("fields-change", fields.value);
        })
        .catch(() => {
          ElMessage.error(t("message.common.msgNetworkError"));
        });
    };

    // 模型切换
    const handleModelChange = (val: number | undefined) => {
      currentModelId.value = val;
      emit("update:modelId", val);
      if (val && val > 0) {
        const matched = modelList.value.find((m) => m.id === val);
        currentModelName.value = matched?.name || "";
        loadFields(val);
      } else {
        fields.value = [];
        currentModelName.value = "";
      }
    };

    // 获取字段校验规则
    const getFieldRules = (field: ModulesFieldInfoData) => {
      if (!field.field_length || field.field_length <= 0) return [];
      const rules: any[] = [];
      // 只有 text/textarea/select 类型做长度校验
      if (
        ["text", "textarea", "select", "email", "url", "password", "json", "code"].includes(
          field.type || "",
        )
      ) {
        rules.push({
          max: field.field_length,
          message: t("message.component.fieldMaxLength", {
            label: field.label,
            max: field.field_length,
          }),
          trigger: "blur",
        });
      }
      return rules;
    };

    // 暴露方法供父组件调用：收集字段数据
    const getFieldData = (): Record<string, any> => {
      const data: Record<string, any> = {};
      fields.value.forEach((field) => {
        data[field.name] = field.content;
      });
      return data;
    };

    // 暴露方法：设置字段数据（回显用）
    const setFieldData = (data: Record<string, any>) => {
      fields.value.forEach((field) => {
        if (data[field.name] !== undefined) {
          field.content = data[field.name];
        }
      });
    };

    // 暴露方法：重置字段
    const resetFields = () => {
      fields.value.forEach((field) => {
        if (["checkbox", "image", "images", "file", "files", "tags"].includes(field.type || "")) {
          field.content = [];
        } else {
          field.content = field.default || "";
        }
      });
    };

    // 监听外部 modelId 变化
    watch(
      () => props.modelId,
      (val) => {
        if (val !== undefined && val !== currentModelId.value) {
          currentModelId.value = val;
          if (val && val > 0) {
            loadFields(val);
          }
        }
      },
    );

    // 监听外部 modelData 变化（回显数据）
    watch(
      () => props.modelData,
      (val) => {
        if (val && Object.keys(val).length > 0) {
          setFieldData(val);
        }
      },
      { deep: true },
    );

    onMounted(() => {
      if (props.showModelSelect) {
        loadModelList();
      } else if (props.modelId && props.modelId > 0) {
        // 不显示选择器时，直接根据id加载模型名称
        getModulesInfo(props.modelId).then((res: any) => {
          if (res.data) {
            currentModelName.value = res.data.name || "";
          }
        });
        loadFields(props.modelId);
      }
    });

    return {
      currentModelId,
      currentModelName,
      modelList,
      fields,
      handleModelChange,
      getFieldRules,
      getFieldData,
      setFieldData,
      resetFields,
    };
  },
});
</script>

<style scoped>
.dynamic-model-form {
  width: 100%;
  .field-desc {
    display: block;
    font-size: 12px;
    color: #999;
    margin-top: 4px;
    line-height: 1.4;
  }
}
</style>
