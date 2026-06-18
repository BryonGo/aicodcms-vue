<template>
  <!-- 操作日志详情抽屉 -->
  <div class="system-sysOperLog-detail">
    <el-drawer v-model="isShowDialog" size="80%" direction="ltr">
      <template #header>
        <h4>{{ $t("message.pms.operLog.detailTitle") }}</h4>
      </template>
      <el-form ref="formRef" :model="formData" label-width="100px">
        <el-row>
          <el-col :span="12">
            <el-form-item :label="$t('message.common.colId')">{{ formData.oper_id }}</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('message.pms.operLog.colModule')">{{
              formData.title
            }}</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('message.pms.operLog.colMethod')">{{
              formData.method
            }}</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('message.pms.operLog.colMethod')">{{
              proxy.getOptionValue(formData.request_method, request_methodOptions, "value", "label")
            }}</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('message.pms.operLog.colOperator')">{{
              formData.oper_name
            }}</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('message.pms.operLog.colDept')">{{
              formData.dept_name
            }}</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('message.pms.operLog.colUrl')">{{
              formData.oper_url
            }}</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('message.pms.operLog.colIp')">{{
              formData.oper_ip
            }}</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('message.pms.operLog.colLocation')">{{
              formData.oper_location
            }}</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('message.pms.operLog.colParam')">{{
              formData.oper_param
            }}</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('message.pms.operLog.colError')">{{
              formData.error_msg
            }}</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('message.pms.operLog.colTime')">{{
              parseTime(formData.oper_time, "{y}-{m}-{d} {h}:{i}:{s}")
            }}</el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-drawer>
  </div>
</template>
<script lang="ts">
import { reactive, toRefs, defineComponent, ref, getCurrentInstance } from "vue";
import { useI18n } from "vue-i18n";
import { getSysOperLog } from "/@/api/pms/monitor/operLog";
import {
  SysOperLogInfoData,
  SysOperLogEditState,
} from "/@/views/pms/monitor/operLog/component/model";
import { parseTime } from "/@/utils/aicodcod";
export default defineComponent({
  name: "apiV1SystemSysOperLogDetail",
  components: {},
  props: {
    request_methodOptions: {
      type: Array,
      default: () => [],
    },
  },
  setup(props, { emit }) {
    const { t } = useI18n();
    const { proxy } = <any>getCurrentInstance();
    const formRef = ref<HTMLElement | null>(null);
    const menuRef = ref();
    const state = reactive<SysOperLogEditState>({
      loading: false,
      isShowDialog: false,
      formData: {
        oper_id: undefined,
        title: undefined,
        business_type: undefined,
        method: undefined,
        request_method: undefined,
        operator_type: undefined,
        oper_name: undefined,
        dept_name: undefined,
        oper_url: undefined,
        oper_ip: undefined,
        oper_location: undefined,
        oper_param: undefined,
        json_result: undefined,
        status: false,
        error_msg: undefined,
        oper_time: undefined,
        linkedSysOperLogSysDept: {
          dept_id: undefined, // 部门id
          dept_name: undefined, // 部门名称
        },
      },
      // 表单校验
      rules: {
        oper_id: [
          { required: true, message: t("message.pms.operLog.msgIdRequired"), trigger: "blur" },
        ],
        oper_name: [
          {
            required: true,
            message: t("message.pms.operLog.msgOperatorRequired"),
            trigger: "blur",
          },
        ],
        dept_name: [
          { required: true, message: t("message.pms.operLog.msgDeptRequired"), trigger: "blur" },
        ],
        status: [
          { required: true, message: t("message.pms.operLog.msgStatusRequired"), trigger: "blur" },
        ],
      },
    });
    // 打开弹窗
    const openDialog = (row?: SysOperLogInfoData) => {
      resetForm();
      if (row) {
        getSysOperLog(row.oper_id!).then((res: any) => {
          const data = res.data;
          state.formData = data;
        });
      }
      state.isShowDialog = true;
    };
    // 关闭弹窗
    const closeDialog = () => {
      state.isShowDialog = false;
    };
    // 取消
    const onCancel = () => {
      closeDialog();
    };
    const resetForm = () => {
      state.formData = {
        oper_id: undefined,
        title: undefined,
        business_type: undefined,
        method: undefined,
        request_method: undefined,
        operator_type: undefined,
        oper_name: undefined,
        dept_name: undefined,
        oper_url: undefined,
        oper_ip: undefined,
        oper_location: undefined,
        oper_param: undefined,
        json_result: undefined,
        status: false,
        error_msg: undefined,
        oper_time: undefined,
        linkedSysOperLogSysDept: {
          dept_id: undefined, // 部门id
          dept_name: undefined, // 部门名称
        },
      };
    };
    //关联sys_dept表选项
    const getSysDeptItemsdept_name = () => {
      emit("getSysDeptItemsdept_name");
    };
    return {
      proxy,
      openDialog,
      closeDialog,
      onCancel,
      menuRef,
      formRef,
      getSysDeptItemsdept_name,
      parseTime,
      ...toRefs(state),
    };
  },
});
</script>
<style scoped>
.system-sysOperLog-detail :deep(.el-form-item--large .el-form-item__label) {
  font-weight: 600;
  color: var(--cc-color-text-2);
}
.system-sysOperLog-detail :deep(.el-form-item__content) {
  color: var(--cc-color-text-1);
}
.pic-block {
  margin-right: 8px;
}
.file-block {
  width: 100%;
  border: 1px solid var(--cc-color-border-light);
  border-radius: var(--cc-radius-sm);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: border-color 0.18s ease;
  margin-bottom: 5px;
  padding: 3px 6px;
  color: var(--cc-color-text-2);
}
.file-block:hover {
  border-color: var(--cc-color-primary);
}
.ml-2 {
  margin-right: 5px;
}
</style>
