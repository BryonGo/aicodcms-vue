<template>
  <el-form ref="fr" :model="f" :rules="r" label-position="top" size="large">
    <el-row :gutter="20">
      <el-col :xs="24" :md="12"
        ><el-form-item prop="channel_code"
          ><template #label
            ><span class="pch-lb"
              >{{ $t("message.sdk.payChannel.labelCode") }}
              <span class="pch-req">*</span></span
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
              >{{ $t("message.sdk.payChannel.labelName") }}
              <span class="pch-req">*</span></span
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
        ><span class="pch-lb">{{
          $t("message.sdk.payChannel.labelState")
        }}</span></template
      ><el-switch
        v-model="f.state"
        :active-value="1"
        :inactive-value="0"
        :active-text="$t('message.sdk.payChannel.stateShow')"
        :inactive-text="$t('message.sdk.payChannel.stateHide')"
    /></el-form-item>
  </el-form>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { addPayChannel, editPayChannel, getPayChannelDetail } from "/@/api/addon/pay";
import { useI18n } from "vue-i18n";

export default defineComponent({
  name: "addonSdkPayChannelForm",
  props: {
    mode: { type: String as () => "add" | "edit", default: "add" },
    id: { type: [Number, String], default: undefined },
  },
  emits: ["success", "cancel"],
  setup(props, { emit }) {
    const { t } = useI18n();
    const fr = ref();
    const f = reactive<any>({
      id: 0,
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
    onMounted(() => {
      if (props.mode === "edit" && props.id) {
        const id = Number(props.id);
        if (id) {
          getPayChannelDetail({ id })
            .then((res: any) => {
              const d = res.data || res;
              const item = d.pay_channel || d;
              if (item?.id) Object.assign(f, item);
            })
            .catch(() => {});
        }
      }
    });
    const submit = async () => {
      try {
        await fr.value?.validate();
      } catch {
        return;
      }
      if (props.mode === "add") {
        await addPayChannel({ ...f });
        ElMessage.success(t("message.sdk.payChannel.addSuccess"));
      } else {
        await editPayChannel({
          id: f.id,
          channel_code: f.channel_code,
          name: f.name,
          platform_type: f.platform_type,
          dev_link: f.dev_link,
          description: f.description,
          state: f.state,
        });
        ElMessage.success(t("message.sdk.payChannel.saveSuccess"));
      }
      emit("success");
    };
    return { fr, f, r, submit };
  },
});
</script>

<style scoped>
.pch-mono :deep(.el-input__inner) {
  font-family:
    "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important;
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
:deep(.el-input__wrapper),
:deep(.el-textarea__inner) {
  border-radius: var(--cc-radius-md);
  border: 1px solid var(--cc-color-border-light);
  background: var(--cc-color-surface-hover);
  box-shadow: none;
}
:deep(.el-input__wrapper.is-focus),
:deep(.el-textarea__inner:focus) {
  border-color: var(--cc-color-primary);
  box-shadow: 0 0 0 3px var(--cc-color-primary-softer);
}
</style>
