<template>
  <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
    <el-form-item :label="$t('message.common.colName')" prop="name">
      <el-input v-model="form.name" />
    </el-form-item>
    <el-form-item :label="$t('message.common.colUrl')" prop="url">
      <el-input v-model="form.url" placeholder="https://..." />
    </el-form-item>
    <el-form-item :label="$t('message.cmsLink.group')" prop="group_name">
      <el-select v-model="form.group_name" :placeholder="$t('message.cmsLink.selectGroup')">
        <el-option label="friend" value="friend" />
        <el-option label="partner" value="partner" />
        <el-option label="footer" value="footer" />
      </el-select>
    </el-form-item>
    <el-form-item :label="$t('message.cmsLink.logoUrl')">
      <el-input v-model="form.logo" placeholder="https://..." />
    </el-form-item>
    <el-form-item :label="$t('message.cmsLink.target')">
      <el-radio-group v-model="form.target">
        <el-radio value="_blank">{{ $t("message.cmsLink.targetBlank") }}</el-radio>
        <el-radio value="_self">{{ $t("message.cmsLink.targetSelf") }}</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item :label="$t('message.common.colSort')">
      <el-input-number v-model="form.sort" :min="0" />
    </el-form-item>
    <el-form-item :label="$t('message.common.colStatus')">
      <el-switch v-model="form.statusBool" />
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { ref, reactive, onMounted } from "vue";
import { ElMessage } from "element-plus";
import type { FormInstance } from "element-plus";
import { addLink, editLink, getLink } from "@/api/cms/link";

const props = withDefaults(
  defineProps<{
    mode?: "add" | "edit";
    id?: number | string;
  }>(),
  { mode: "add" },
);

const emit = defineEmits<{
  (e: "success"): void;
  (e: "cancel"): void;
}>();

const { t } = useI18n();
const formRef = ref<FormInstance>();

const form = reactive({
  id: 0,
  name: "",
  url: "",
  group_name: "friend",
  logo: "",
  target: "_blank",
  sort: 0,
  statusBool: true,
});

const rules = {
  name: [{ required: true, message: t("message.common.msgNameRequired"), trigger: "blur" }],
  url: [{ required: true, message: t("message.cmsLink.urlRequired"), trigger: "blur" }],
  group_name: [{ required: true, message: t("message.cmsLink.selectGroup"), trigger: "change" }],
};

onMounted(() => {
  if (props.mode === "edit") {
    const id = Number(props.id);
    if (!id) {
      ElMessage.error(t("message.cmsLink.missingId"));
      return;
    }
    getLink(id)
      .then((res: any) => {
        if (res.code === 0 || (res.code === 200 && res.data)) {
          const d = res.data;
          form.id = d.id;
          form.name = d.name;
          form.url = d.url;
          form.group_name = d.group_name || "friend";
          form.logo = d.logo || "";
          form.target = d.target || "_blank";
          form.sort = d.sort || 0;
          form.statusBool = d.status === 1;
        }
      });
  }
});

async function submit() {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;
  const { statusBool, ...rest } = form;
  const data = { ...rest, status: statusBool ? 1 : 0 };
  if (props.mode === "add") {
    const res: any = await addLink(data);
    if (res.code === 0 || res.code === 200) {
      ElMessage.success(t("message.cmsLink.addSuccess"));
      emit("success");
    } else {
      ElMessage.error(res.msg || t("message.cms.msgSaveFailed"));
    }
  } else {
    const res: any = await editLink(data);
    if (res.code === 0 || res.code === 200) {
      ElMessage.success(t("message.cmsLink.saveSuccess"));
      emit("success");
    } else {
      ElMessage.error(res.msg || t("message.cms.msgSaveFailed"));
    }
  }
}

defineExpose({ submit });
</script>
