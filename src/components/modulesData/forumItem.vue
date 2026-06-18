<template>
  <div class="module-field-forum-item">
    <el-input
      v-if="
        moduleField.type === 'textarea' ||
        moduleField.type === 'json' ||
        moduleField.type === 'code'
      "
      v-model="tempValue"
      :style="{
        width: width,
        fontFamily:
          moduleField.type === 'json' || moduleField.type === 'code' ? 'monospace' : 'inherit',
      }"
      :type="moduleField.type === 'code' ? 'textarea' : 'textarea'"
      :rows="moduleField.type === 'json' ? 6 : 4"
      @input="handleTextInput"
    >
    </el-input>
    <el-input
      v-else-if="moduleField.type === 'number'"
      v-model.trim="tempValue"
      type="number"
      @input="handleTextInput"
    >
    </el-input>
    <el-input
      v-else-if="moduleField.type === 'password'"
      v-model.trim="tempValue"
      type="password"
      show-password
      @input="handleTextInput"
    >
    </el-input>
    <el-input
      v-else-if="moduleField.type === 'email'"
      v-model.trim="tempValue"
      type="email"
      @input="handleTextInput"
    >
    </el-input>
    <el-input
      v-else-if="moduleField.type === 'url'"
      v-model.trim="tempValue"
      type="url"
      @input="handleTextInput"
    >
    </el-input>
    <el-date-picker
      v-else-if="moduleField.type === 'date'"
      v-model="tempValue"
      type="date"
      value-format="YYYY-MM-DD"
      @change="handleDateChange"
    >
    </el-date-picker>
    <el-time-picker
      v-else-if="moduleField.type === 'time'"
      v-model="tempValue"
      value-format="HH:mm:ss"
      @change="handleDateChange"
    >
    </el-time-picker>
    <el-date-picker
      v-else-if="moduleField.type === 'datetime'"
      v-model="tempValue"
      type="datetime"
      value-format="YYYY-MM-DD HH:mm:ss"
      @change="handleDateChange"
    >
    </el-date-picker>
    <GfTiptap
      v-else-if="moduleField.type === 'richtext'"
      v-model="tempValue"
      toolbar="cms"
      :placeholder="$t('message.cms.common.placeholderContent')"
    />
    <el-switch
      v-else-if="moduleField.type === 'switch'"
      v-model="tempValue"
      :active-value="1"
      :inactive-value="0"
      @change="handleSwitchChange"
    >
    </el-switch>
    <el-rate
      v-else-if="moduleField.type === 'rate'"
      v-model="tempValue"
      :allow-half="true"
      :show-text="false"
      @change="handleDateChange"
    >
    </el-rate>
    <el-slider
      v-else-if="moduleField.type === 'slider'"
      v-model="tempValue"
      :min="0"
      :max="100"
      :step="1"
      style="padding: 0 12px"
      @change="handleDateChange"
    >
    </el-slider>
    <el-color-picker
      v-else-if="moduleField.type === 'color'"
      v-model="tempValue"
      :predefine="['#409eff', '#67c23a', '#e6a23c', '#f56c6c', '#909399', '#000000', '#ffffff']"
      @change="handleDateChange"
    >
    </el-color-picker>
    <div v-else-if="moduleField.type === 'tags'" class="tags-input-wrapper">
      <el-tag
        v-for="(tag, idx) in tagList"
        :key="idx"
        closable
        :disable-transitions="false"
        @close="removeTag(idx)"
        style="margin: 2px"
      >
        {{ tag }}
      </el-tag>
      <el-input
        v-if="tagInputVisible"
        ref="tagInputRef"
        v-model="tagInputValue"
        size="small"
        style="width: 100px"
        @keyup.enter="confirmTag"
        @blur="confirmTag"
      />
      <el-button v-else size="small" @click="showTagInput"
        >+ {{ $t("message.common.add") }}</el-button
      >
    </div>
    <el-checkbox-group v-else-if="moduleField.type === 'checkbox'" v-model="tempValue">
      <el-checkbox v-for="(item, index) in moduleFieldOptions" :key="index" :label="item.value">
        {{ $t("moduleFieldOpt_" + moduleField.name + "_" + item.label, item.value) }}
      </el-checkbox>
    </el-checkbox-group>
    <el-radio-group v-else-if="moduleField.type === 'radio'" v-model="tempValue">
      <el-radio v-for="(item, index) in moduleFieldOptions" :key="index" :label="item.value">
        {{ $t("moduleFieldOpt_" + moduleField.name + "_" + item.label, item.value) }}
      </el-radio>
    </el-radio-group>
    <el-select v-else-if="moduleField.type === 'select'" v-model="tempValue">
      <el-option
        v-for="(item, index) in moduleFieldOptions"
        :key="index"
        :label="$t('moduleFieldOpt_' + moduleField.name + '_' + item.label, item.value)"
        :value="item.value"
      >
      </el-option>
    </el-select>
    <upload-img
      v-else-if="moduleField.type === 'image'"
      v-model="tempValue"
      :limit="1"
      :action="buildApiUrl('/api/v1/addon/upload')"
      @uploadData="setUpImgList"
    >
    </upload-img>
    <upload-img
      v-else-if="moduleField.type === 'images'"
      v-model="tempValue"
      :limit="10"
      :action="buildApiUrl('/api/v1/pms/upload/multiple')"
      @uploadData="setUpImgList"
    >
    </upload-img>
    <upload-file
      v-else-if="moduleField.type === 'file'"
      v-model="tempValue"
      :drag="false"
      :action="buildApiUrl('/api/v1/addon/upload')"
      :limit="1"
      @upFileData="handleUpFile"
    >
      <el-button type="primary" :icon="Upload">{{ $t("message.cms.common.uploadFile") }}</el-button>
    </upload-file>
    <upload-file
      v-else-if="moduleField.type === 'files'"
      v-model="tempValue"
      :drag="false"
      :action="buildApiUrl('/api/v1/pms/upload/multiple')"
      :limit="10"
      @upFileData="handleUpFileList"
    >
      <el-button type="primary" :icon="Upload">{{ $t("message.cms.common.uploadFile") }}</el-button>
    </upload-file>
    <el-input v-else v-model.trim="tempValue" @input="handleTextInput"></el-input>
  </div>
</template>

<script lang="ts">
import { defineComponent, getCurrentInstance, PropType, ref, watch, nextTick } from "vue";
import { ModulesFieldInfoData } from "/@/views/pms/modulesField/list/component/model";

import { ElMessage, UploadProps } from "element-plus";
import { buildApiUrl, getToken } from "/@/utils/aicodcod";
import uploadImg from "/@/components/uploadImg/index.vue";
import uploadFile from "/@/components/uploadFile/index.vue";
import GfTiptap from "/@/components/tiptap/index.vue";
import { Upload } from "@element-plus/icons-vue";

export interface ModuleFieldOptions {
  label: string;
  value: any;
}

export default defineComponent({
  name: "moduleDataFormItem",
  components: {
    uploadImg,
    uploadFile,
    GfTiptap,
  },
  props: {
    width: {
      type: String,
      default: "",
    },
    moduleField: Object as PropType<ModulesFieldInfoData>,
    modelValue: null,
  },
  setup(props, { emit }) {
    const baseURL = buildApiUrl("/");
    const { proxy } = <any>getCurrentInstance();
    //图片上传地址
    const imageUrlThumb = ref("");
    //上传加载
    const upLoadingThumb = ref(false);
    const tempValue = ref(props.modelValue);
    const tagList = ref<string[]>([]);
    const tagInputVisible = ref(false);
    const tagInputValue = ref("");
    const tagInputRef = ref();
    // 初始化 tags
    watch(
      () => props.modelValue,
      (val) => {
        if (props.moduleField?.type === "tags") {
          if (typeof val === "string" && val) {
            tagList.value = val
              .split(",")
              .map((t: string) => t.trim())
              .filter(Boolean);
          } else if (Array.isArray(val)) {
            tagList.value = [...val];
          } else {
            tagList.value = [];
          }
        }
      },
      { immediate: true },
    );
    const showTagInput = () => {
      tagInputVisible.value = true;
      nextTick(() => tagInputRef.value?.focus());
    };
    const confirmTag = () => {
      const v = tagInputValue.value.trim();
      if (v && !tagList.value.includes(v)) {
        tagList.value.push(v);
        emit("update:modelValue", tagList.value.join(","));
      }
      tagInputVisible.value = false;
      tagInputValue.value = "";
    };
    const removeTag = (idx: number) => {
      tagList.value.splice(idx, 1);
      emit("update:modelValue", tagList.value.join(","));
    };
    const setEditContent = (data: string) => {
      emit("update:modelValue", data);
    };
    const handleSwitchChange = (val: any) => {
      emit("update:modelValue", val);
    };
    const moduleFieldOptions = ref<ModuleFieldOptions[]>([]);
    if (
      props.moduleField?.type &&
      ["select", "radio", "checkbox"].includes(props.moduleField?.type)
    ) {
      if (props.moduleField?.options) {
        props.moduleField?.options.split(",").forEach((item: any) => {
          const tItem = item.split(":");
          if (Array.isArray(tItem) && tItem.length === 2) {
            moduleFieldOptions.value.push({ label: tItem[0], value: tItem[1] });
          }
        });
      }
    }
    //单图上传缩略图
    const handleAvatarSuccessThumb: UploadProps["onSuccess"] = (res, file) => {
      if (res.code === 0) {
        imageUrlThumb.value = URL.createObjectURL(file.raw!);
        emit("update:modelValue", res.data.full_path);
      } else {
        ElMessage.error(res.msg);
      }
      upLoadingThumb.value = false;
    };
    const beforeAvatarUploadThumb = () => {
      upLoadingThumb.value = true;
      return true;
    };
    const setUpData = () => {
      return { token: getToken() };
    };
    const setUpImgList = (val: any) => {
      emit("update:modelValue", val);
    };
    const handleDateChange = (value: any) => {
      emit("update:modelValue", value);
    };
    const handleUpFile = (data: any) => {
      emit("update:modelValue", data);
    };
    const handleUpFileList = (data: any) => {
      emit("update:modelValue", data);
    };
    const handleTextInput = (value: any) => {
      emit("update:modelValue", value);
    };
    return {
      proxy,
      Upload,
      moduleFieldOptions,
      handleUpFile,
      handleTextInput,
      handleUpFileList,
      setUpImgList,
      setEditContent,
      handleDateChange,
      handleSwitchChange,
      imageUrlThumb,
      upLoadingThumb,
      handleAvatarSuccessThumb,
      beforeAvatarUploadThumb,
      setUpData,
      baseURL,
      buildApiUrl,
      tempValue,
      tagList,
      tagInputVisible,
      tagInputValue,
      tagInputRef,
      showTagInput,
      confirmTag,
      removeTag,
    };
  },
  watch: {
    tempValue: function (newValue: any) {
      this.$emit("update:modelValue", newValue);
    },
  },
});
</script>

<style scoped>
.tags-input-wrapper {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
  padding: 4px 0;
  min-height: 32px;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  padding: 4px 8px;
}
.tags-input-wrapper:focus-within {
  border-color: var(--cc-color-primary);
}
.module-field-forum-item :deep(.avatar-uploader .avatar) {
  max-width: 178px;
  max-height: 178px;
  display: block;
}

.module-field-forum-item :deep(.avatar-uploader .el-upload) {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.module-field-forum-item :deep(.avatar-uploader .el-upload:hover) {
  border-color: var(--el-color-primary);
}

.module-field-forum-item :deep(.el-icon.avatar-uploader-icon) {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
}
</style>
<style>
.el-select__popper {
  z-index: 99999 !important;
}
</style>
