<template>
  <ProPage :title="$t('message.menu_cms_link_edit')">
    <el-card v-loading="loading">
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
          <el-select v-model="form.group_name">
            <el-option label="friend" value="friend" />
            <el-option label="partner" value="partner" />
            <el-option label="footer" value="footer" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('message.cmsLink.logoUrl')">
          <el-input v-model="form.logo" />
        </el-form-item>
        <el-form-item :label="$t('message.cmsLink.target')">
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
            $t("message.common.save")
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
import { ref, reactive, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { getLink, editLink } from "@/api/cms/link";
import ProPage from "/@/components/pro/ProPage.vue";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const loading = ref(false);
const submitting = ref(false);

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
  const id = Number(route.query.id);
  if (!id) {
    ElMessage.error(t("message.cmsLink.missingId"));
    return;
  }
  loading.value = true;
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
    })
    .finally(() => {
      loading.value = false;
    });
});

function onSubmit() {
  submitting.value = true;
  const data = { ...form, status: form.statusBool ? 1 : 0 };
  delete data.statusBool;
  editLink(data)
    .then((res: any) => {
      if (res.code === 0 || res.code === 200) {
        ElMessage.success(t("message.cmsLink.saveSuccess"));
        router.push("/cms/link/list");
      }
    })
    .finally(() => {
      submitting.value = false;
    });
}
</script>
