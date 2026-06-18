<template>
  <el-upload
    v-model:file-list="dataFileList"
    class="upload-demo"
    :action="action"
    :multiple="multiple"
    :drag="drag"
    :on-remove="handleRemove"
    :before-remove="beforeRemove"
    :limit="limit"
    :on-exceed="handleExceed"
    :before-upload="beforeUpload"
    :on-change="handleChange"
    :on-success="handleSuccess"
    :data="dataParam"
  >
    <el-icon class="el-icon--upload"><ele-UploadFilled /></el-icon>
    <div class="el-upload__text">
      {{ $t("message.component.dragText") }}<em>{{ $t("message.component.clickToUpload") }}</em>
    </div>
    <template #tip>
      <div class="el-upload__tip">
        {{ $t("message.component.uploadSizeLimit", { size: uploadSize }) }}
      </div>
    </template>
  </el-upload>
</template>

<script lang="ts">
import { computed, defineComponent, getCurrentInstance, reactive, ref } from "vue";
import type { UploadProps, UploadUserFile } from "element-plus";
import { ElMessage, ElMessageBox } from "element-plus";
import { useI18n } from "vue-i18n";
import { getToken } from "/@/utils/aicodcod";
import _ from "lodash";

export default defineComponent({
  name: "uploadFile",
  props: {
    action: { type: String, default: "" }, //上传地址
    name: { type: String, default: "file" }, //上传文件类型
    method: { type: String, default: "post" }, //设置上传请求方法
    multiple: { type: Boolean, default: true }, //是否支持多选文件
    showFileList: { type: Boolean, default: true }, //是否显示已上传文件列表
    drag: { type: Boolean, default: true }, //是否启用拖拽上传
    accept: { type: String, default: ".txt,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar" }, //上传文件格式
    disabled: { type: Boolean, default: false }, //是否禁止
    listType: { type: String, default: "picture-card" }, //
    uploadSize: { type: Number, default: 200 }, //上传文件大小M
    limit: { type: Number, default: 5 }, //上传最大数量
    modelValue: {
      type: Array,
      default: function () {
        return [];
      },
    },
  },
  setup(props, { emit }) {
    const { t } = useI18n();
    let uploadedFile: Array<any> = [];
    const { proxy } = <any>getCurrentInstance();
    const dataParam = reactive({
      token: getToken(),
    });
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
        emit("upFileData", val);
      },
    });
    const beforeUpload: UploadProps["beforeUpload"] = () => {
      return true;
    };
    const handleChange: UploadProps["onChange"] = () => {};
    const handleExceed = () => {
      ElMessage.error(t("message.component.uploadCountExceed", { count: props.limit }));
    };
    const handleSuccess: UploadProps["onSuccess"] = (response, uploadFile) => {
      uploadedFile = uploadedFile.filter((item: UploadUserFile) => {
        return item.raw?.uid != uploadFile.raw?.uid;
      });
      if (response.code === 0) {
        uploadedFile.push({
          name: response.data.name,
          url: response.data.path,
          fullUrl: response.data.fullPath,
          fileType: response.data.type,
          size: response.data.size,
        });
      } else {
        ElMessage.error(response.message);
      }
      setDataFileList();
    };
    const beforeRemove: UploadProps["beforeRemove"] = (uploadFile) => {
      return ElMessageBox.confirm(
        t("message.component.confirmDeleteFile", { name: uploadFile.name }),
        t("message.common.tips"),
        {
          confirmButtonText: t("message.common.confirm"),
          cancelButtonText: t("message.common.cancel"),
          type: "warning",
        },
      ).then(
        () => true,
        () => false,
      );
    };
    const handleRemove: UploadProps["onRemove"] = (file) => {
      //移除后
      uploadedFile.splice(
        uploadedFile.findIndex((item: any) => item.name === file.name),
        1,
      );
      setDataFileList();
    };
    const setDataFileList = () => {
      dataFileList.value = uploadedFile;
    };
    return {
      dataFileList,
      handleSuccess,
      beforeRemove,
      handleRemove,
      beforeUpload,
      handleChange,
      handleExceed,
      dataParam,
    };
  },
});
</script>
<style>
.el-upload.is-drag {
  display: block;
  width: 200px;
  height: 200px;
}
</style>
