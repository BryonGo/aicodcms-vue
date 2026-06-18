<template>
  <div class="up-img" v-if="limit > 1">
    <el-upload
      v-model:file-list="dataFileList"
      :limit="limit"
      :action="action"
      :multiple="multiple"
      :list-type="listType"
      :on-success="handleAvatarSuccess"
      :on-preview="handlePictureCardPreview"
      :on-remove="handleRemove"
      :on-exceed="handleExceed"
      :before-upload="beforeAvatarUpload"
      :data="dataParam"
    >
      <el-icon><ele-Plus /></el-icon>
    </el-upload>

    <el-dialog v-model="dialogVisible">
      <img w-full :src="dialogImageUrl" alt="Preview Image" />
    </el-dialog>
  </div>
  <div v-else>
    <div class="up-img">
      <el-upload
        v-model:file-list="dataFileList"
        :limit="limit"
        class="avatar-uploader"
        :action="action"
        :show-file-list="false"
        :on-success="handleAvatarSuccess"
        :before-upload="beforeAvatarUpload"
        :on-preview="handlePictureCardPreview"
        :on-remove="handleRemove"
        :data="dataParam"
      >
        <img v-if="imageUrl" :src="imageUrl" class="avatar" />
        <el-icon v-else class="avatar-uploader-icon"><ele-Plus /></el-icon>
      </el-upload>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, getCurrentInstance, reactive } from "vue";
import type { UploadProps, UploadUserFile } from "element-plus";
import { ElMessage } from "element-plus";
import { buildApiUrl, getToken } from "/@/utils/aicodcod";
import { useI18n } from "vue-i18n";
import _ from "lodash";
export default defineComponent({
  name: "uploadImg",
  props: {
    action: { type: String, default: "" }, //上传地址
    name: { type: String, default: "file" }, //上传文件类型
    limit: { type: Number, default: 1 }, //上传最大数量
    method: { type: String, default: "post" }, //设置上传请求方法
    multiple: { type: Boolean, default: true }, //是否支持多选文件
    showFileList: { type: Boolean, default: true }, //是否显示已上传文件列表
    drag: { type: Boolean, default: false }, //是否启用拖拽上传
    // accept:       { type : String, default : '.jpg,.jpeg,.png,.gif' },//接受上传的文件类型格式
    disabled: { type: Boolean, default: false }, //是否是否禁止上传
    listType: { type: String, default: "picture-card" }, //是否启用拖拽上传
    uploadSize: { type: Number, default: 10 }, //上传文件大小
    modelValue: {
      type: Array,
      default: function () {
        return [];
      },
    },
  },
  setup(props, { emit }) {
    const { t } = useI18n();
    const baseURL = buildApiUrl("/");
    const { proxy } = <any>getCurrentInstance();
    const dialogImageUrl = ref("");
    const dialogVisible = ref(false);
    const imageUrl = ref("");
    const dataParam = reactive({
      token: getToken(),
    });
    let uploadedFile: Array<any> = [];
    const dataFileList = computed({
      get: () => {
        let value: Array<UploadUserFile> = (props.modelValue as UploadUserFile[]) || [];
        value.map((item: UploadUserFile) => {
          if (item.url) {
            item.url = proxy.getUpFileUrl(item.url);
          }
          return item;
        });
        uploadedFile = _.cloneDeep(value);
        return value;
      },
      set: (val) => {
        emit("uploadData", val);
      },
    });

    const beforeAvatarUpload: UploadProps["beforeUpload"] = (rawFile) => {
      if (rawFile.type.substring(0, 5) !== "image") {
        ElMessage.error(t("message.component.uploadImageOnly"));
        return false;
      } else if (rawFile.size / 1024 / 1024 > props.uploadSize) {
        ElMessage.error(t("message.component.uploadSizeExceed", { size: props.uploadSize }));
        return false;
      }
      return true;
    };
    const handleRemove: UploadProps["onRemove"] = (file) => {
      uploadedFile.splice(
        uploadedFile.findIndex((item: any) => item.name === file.name),
        1,
      );
      setDataFileList();
    };
    const handleExceed = () => {
      ElMessage.error(t("message.component.uploadCountExceed", { count: props.limit }));
    };
    const handlePictureCardPreview: UploadProps["onPreview"] = (uploadFile) => {
      dialogImageUrl.value = uploadFile.url!;
      dialogVisible.value = true;
    };
    const handleAvatarSuccess: UploadProps["onSuccess"] = (response, uploadFile) => {
      if (props.limit == 1) {
        uploadedFile = [];
        imageUrl.value = URL.createObjectURL(uploadFile.raw!);
      }
      uploadedFile = uploadedFile.filter((item: UploadUserFile) => {
        return item.raw?.uid != uploadFile.raw?.uid;
      });
      if (response.code === 0) {
        uploadedFile.push({
          name: response.data.name,
          url: response.data.path,
          fileType: response.data.type,
          size: response.data.size,
        });
      } else {
        ElMessage.error(response.message);
      }
      setDataFileList();
    };
    const setDataFileList = () => {
      dataFileList.value = uploadedFile;
    };
    return {
      dataFileList,
      imageUrl,
      baseURL,
      buildApiUrl,
      dialogVisible,
      dialogImageUrl,
      handleExceed,
      beforeAvatarUpload,
      handleRemove,
      handlePictureCardPreview,
      handleAvatarSuccess,
      dataParam,
    };
  },
});
</script>

<style scoped>
.up-img :deep(.avatar-uploader .avatar) {
  width: 178px;
  height: 178px;
  display: block;
}
.up-img :deep(.avatar-uploader .el-upload) {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.up-img :deep(.avatar-uploader .el-upload:hover) {
  border-color: var(--el-color-primary);
}

.up-img :deep(.el-icon.avatar-uploader-icon) {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
}
</style>
