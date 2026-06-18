<template>
  <ProPage :title="$t('message.menu_cms_link_add')">
    <el-card>
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
        @submit.prevent="onSubmit"
      >
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
        <el-form-item :label="$t('message.cmsLink.target')" prop="target">
          <el-radio-group v-model="form.target">
            <el-radio value="_blank">_blank</el-radio>
            <el-radio value="_self">_self</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="$t('message.common.colSort')">
          <el-input-number v-model="form.sort" :min="0" />
        </el-form-item>
        <el-form-item :label="$t('message.common.colStatus')">
          <el-switch v-model="form.statusBool" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="submitting" @click="onSubmit">{{
            $t("message.common.submit")
          }}</el-button>
          <el-button @click="$router.push('/cms/link/list')">{{
            $t("message.common.cancel")
          }}</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </ProPage>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { addLink } from "@/api/cms/link";
import ProPage from "/@/components/pro/ProPage.vue";

const { t } = useI18n();
const router = useRouter();
const submitting = ref(false);

const form = reactive({
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

function onSubmit() {
  submitting.value = true;
  const data = { ...form, status: form.statusBool ? 1 : 0 };
  delete data.statusBool;
  addLink(data)
    .then((res: any) => {
      if (res.code === 0 || res.code === 200) {
        ElMessage.success(t("message.cmsLink.addSuccess"));
        router.push("/cms/link/list");
      }
    })
    .finally(() => {
      submitting.value = false;
    });
}
</script>
