<template>
  <div class="fa-page pch-fp">
    <el-breadcrumb separator="→"
      ><el-breadcrumb-item :to="{ path: '/' }"
        ><el-icon><HomeFilled /></el-icon> {{ $t("message.router.home") }}</el-breadcrumb-item
      ><el-breadcrumb-item>{{
        $t("message.sdk.payChannel.breadcrumbSdkModule")
      }}</el-breadcrumb-item
      ><el-breadcrumb-item :to="{ path: '/addon/pay/channel/list' }">{{
        $t("message.sdk.payChannel.title")
      }}</el-breadcrumb-item
      ><el-breadcrumb-item>{{
        $t("message.sdk.payChannel.breadcrumbAdd")
      }}</el-breadcrumb-item></el-breadcrumb
    >

    <div class="pch-header">
      <el-button link class="pch-back" @click="$router.push('/addon/pay/channel/list')"
        ><el-icon><ArrowLeft /></el-icon> {{ $t("message.sdk.payChannel.back") }}</el-button
      >
      <h1 class="pch-ht">{{ $t("message.sdk.payChannel.addTitle") }}</h1>
      <p class="pch-st">{{ $t("message.sdk.payChannel.addSubtitle") }}</p>
    </div>

    <div class="pch-card">
      <el-form ref="fr" :model="f" :rules="r" label-position="top" size="large">
        <el-row :gutter="20">
          <el-col :xs="24" :md="12"
            ><el-form-item prop="channel_code"
              ><template #label
                ><span class="pch-lb"
                  >{{ $t("message.sdk.payChannel.labelCode") }} <span class="pch-req">*</span></span
                ></template
              ><el-input
                v-model="f.channel_code"
                placeholder="alipay/wechat"
                class="pch-mono" /></el-form-item
          ></el-col>
          <el-col :xs="24" :md="12"
            ><el-form-item prop="name"
              ><template #label
                ><span class="pch-lb"
                  >{{ $t("message.sdk.payChannel.labelName") }} <span class="pch-req">*</span></span
                ></template
              ><el-input
                v-model="f.name"
                :placeholder="$t('message.sdk.payChannel.placeholderName')" /></el-form-item
          ></el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :xs="24" :md="12"
            ><el-form-item prop="platform_type"
              ><template #label
                ><span class="pch-lb">{{
                  $t("message.sdk.payChannel.labelPlatform")
                }}</span></template
              ><el-input v-model="f.platform_type" placeholder="Android,iOS" /></el-form-item
          ></el-col>
          <el-col :xs="24" :md="12"
            ><el-form-item prop="dev_link"
              ><template #label
                ><span class="pch-lb">{{
                  $t("message.sdk.payChannel.labelDevLink")
                }}</span></template
              ><el-input v-model="f.dev_link" placeholder="https://..." /></el-form-item
          ></el-col>
        </el-row>
        <el-form-item prop="description"
          ><template #label
            ><span class="pch-lb">{{
              $t("message.sdk.payChannel.labelDescription")
            }}</span></template
          ><el-input v-model="f.description" type="textarea" :rows="2"
        /></el-form-item>
        <el-form-item prop="state"
          ><template #label
            ><span class="pch-lb">{{ $t("message.sdk.payChannel.labelState") }}</span></template
          ><el-switch
            v-model="f.state"
            :active-value="1"
            :inactive-value="0"
            :active-text="$t('message.sdk.payChannel.stateShow')"
            :inactive-text="$t('message.sdk.payChannel.stateHide')"
        /></el-form-item>
        <div class="pch-actions">
          <el-button size="large" @click="$router.push('/addon/pay/channel/list')">{{
            $t("message.common.cancel")
          }}</el-button
          ><el-button type="primary" size="large" :loading="sub" @click="onSubmit" class="pch-sub"
            ><el-icon><Check /></el-icon> {{ $t("message.sdk.payChannel.btnSubmit") }}</el-button
          >
        </div>
      </el-form>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { HomeFilled, ArrowLeft, Check } from "@element-plus/icons-vue";
import { addPayChannel } from "/@/api/addon/pay";
import { useI18n } from "vue-i18n";

export default defineComponent({
  name: "addonSdkPayChannelAdd",
  components: { HomeFilled, ArrowLeft, Check },
  setup() {
    const router = useRouter();
    const { t } = useI18n();
    const fr = ref();
    const sub = ref(false);
    const f = reactive({
      channel_code: "",
      name: "",
      platform_type: "",
      dev_link: "",
      description: "",
      state: 1,
    });
    const r = {
      channel_code: [{ required: true, message: t("message.sdk.payChannel.addRequiredCode") }],
      name: [{ required: true, message: t("message.sdk.payChannel.addRequiredName") }],
    };
    const onSubmit = async () => {
      try {
        await fr.value?.validate();
      } catch {
        return;
      }
      sub.value = true;
      try {
        await addPayChannel({ ...f });
        ElMessage.success(t("message.sdk.payChannel.addSuccess"));
        router.push("/addon/pay/channel/list");
      } finally {
        sub.value = false;
      }
    };
    return { fr, f, r, sub, onSubmit };
  },
});
</script>

<style scoped>
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
.pch-fp {
  max-width: 960px;
  margin: 0 auto;
}
.pch-mono :deep(.el-input__inner) {
  font-family:
    "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important;
}
.pch-header {
  margin: var(--cc-space-6) 0 var(--cc-space-5);
  padding: var(--cc-space-7) var(--cc-space-8);
  background:
    radial-gradient(circle at 0 0, var(--cc-color-primary-softer), transparent 34%),
    var(--cc-color-surface);
  border: 1px solid var(--cc-color-border-light);
  border-radius: var(--cc-radius-xl);
  box-shadow: var(--cc-shadow-sm);
}
.pch-hr {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: var(--cc-space-4);
}
.pch-back {
  font-family: var(--cc-font-sans);
  font-size: var(--cc-font-13);
  color: var(--cc-color-text-3);
  padding: 0;
  margin-bottom: var(--cc-space-2);
}
.pch-back:hover {
  color: var(--cc-color-primary);
}
.pch-ht {
  font-family: var(--cc-font-sans);
  font-size: var(--cc-font-28);
  font-weight: 650;
  color: var(--cc-color-text-1);
  margin: 0 0 var(--cc-space-1);
  letter-spacing: -0.02em;
}
.pch-st {
  font-size: var(--cc-font-13);
  color: var(--cc-color-text-3);
  margin: 0;
}
.pch-id {
  display: inline-block;
  padding: 2px 10px;
  background: var(--cc-color-primary-softer);
  border: 1px solid var(--cc-color-primary-soft);
  border-radius: var(--cc-radius-sm);
  font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: var(--cc-font-13);
  color: var(--cc-color-primary);
}
.pch-card {
  background: var(--cc-color-surface);
  border: 1px solid var(--cc-color-border-light);
  border-radius: var(--cc-radius-xl);
  padding: var(--cc-space-8) var(--cc-space-9);
  box-shadow: var(--cc-shadow-sm);
}
.pch-lb {
  font-family: var(--cc-font-sans);
  font-size: var(--cc-font-13);
  font-weight: 550;
  color: var(--cc-color-text-2);
}
.pch-req {
  color: var(--cc-color-danger);
}
.pch-card :deep(.el-input__wrapper),
.pch-card :deep(.el-textarea__inner) {
  border-radius: var(--cc-radius-md);
  border: 1px solid var(--cc-color-border-light);
  background: var(--cc-color-surface-hover);
  box-shadow: none;
}
.pch-card :deep(.el-input__wrapper.is-focus),
.pch-card :deep(.el-textarea__inner:focus) {
  border-color: var(--cc-color-primary);
  box-shadow: 0 0 0 3px var(--cc-color-primary-softer);
}
.pch-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--cc-space-3);
  padding-top: var(--cc-space-5);
  border-top: 1px solid var(--cc-color-border-light);
}
.pch-actions .el-button {
  font-weight: 600;
  border-radius: var(--cc-radius-md);
  padding: 12px 28px;
}
.pch-sub {
  font-weight: 650;
}
@media (min-width: 1440px) {
  .pch-fp {
    max-width: 1320px;
  }
  .pch-header {
    padding: var(--cc-space-8) var(--cc-space-10);
  }
  .pch-card {
    padding: var(--cc-space-8) var(--cc-space-10);
  }
}
@media (max-width: 768px) {
  .pch-header,
  .pch-card {
    padding: var(--cc-space-5);
  }
  .pch-hr {
    align-items: flex-start;
    flex-direction: column;
  }
  .pch-actions {
    flex-direction: column-reverse;
  }
  .pch-actions .el-button {
    width: 100%;
  }
}
</style>
