<template>
  <div class="fa-page cur-fp">
    <el-breadcrumb separator="→"
      ><el-breadcrumb-item :to="{ path: '/' }"
        ><el-icon><HomeFilled /></el-icon>
        {{ $t("message.sdk.game.breadcrumbHome") }}</el-breadcrumb-item
      ><el-breadcrumb-item>{{ $t("message.sdk.game.breadcrumbSdk") }}</el-breadcrumb-item
      ><el-breadcrumb-item :to="{ path: '/addon/sdk/currency/list' }">{{
        $t("message.sdk.currency.title")
      }}</el-breadcrumb-item
      ><el-breadcrumb-item>{{ $t("message.common.add") }}</el-breadcrumb-item></el-breadcrumb
    >

    <div class="cur-pg">
      <el-button link class="cur-bk" @click="$router.push('/addon/sdk/currency/list')"
        ><el-icon><ArrowLeft /></el-icon> {{ $t("message.common.back") }}</el-button
      >
      <h1 class="cur-ht">{{ $t("message.common.add") }}</h1>
      <p class="cur-st">{{ $t("message.sdk.currency.addSubtitle") }}</p>
    </div>

    <div class="cur-fc">
      <el-form ref="fr" :model="f" :rules="r" label-position="top" size="large">
        <el-row :gutter="20">
          <el-col :xs="24" :md="12"
            ><el-form-item prop="currency_code"
              ><template #label
                >{{ $t("message.sdk.currency.addLabelCode") }}
                <span class="cur-req">*</span></template
              ><el-input
                v-model="f.currency_code"
                placeholder="USD/CNY"
                class="cur-mono" /></el-form-item
          ></el-col>
          <el-col :xs="24" :md="12"
            ><el-form-item prop="currency_name"
              ><template #label
                >{{ $t("message.sdk.currency.addLabelName") }}
                <span class="cur-req">*</span></template
              ><el-input
                v-model="f.currency_name"
                :placeholder="$t('message.sdk.currency.placeholderName')" /></el-form-item
          ></el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :xs="24" :md="12"
            ><el-form-item prop="currency_symbol"
              ><template #label>{{ $t("message.sdk.currency.addLabelSymbol") }}</template
              ><el-input
                v-model="f.currency_symbol"
                placeholder="$ / ¥ / €"
                class="cur-mono" /></el-form-item
          ></el-col>
          <el-col :xs="24" :md="12"
            ><el-form-item prop="area_code"
              ><template #label>{{ $t("message.sdk.currency.addLabelAreaCode") }}</template
              ><el-input v-model="f.area_code" placeholder="US/CN" class="cur-mono" /></el-form-item
          ></el-col>
        </el-row>
        <el-form-item prop="area_name"
          ><template #label>{{ $t("message.sdk.currency.addLabelAreaName") }}</template
          ><el-input
            v-model="f.area_name"
            :placeholder="$t('message.sdk.currency.placeholderRegion')"
        /></el-form-item>
        <el-form-item prop="rate_fixed"
          ><template #label>{{ $t("message.sdk.currency.addLabelFixedRate") }}</template
          ><el-input-number
            v-model="f.rate_fixed"
            :precision="6"
            style="width: 100%"
            placeholder="6.500000"
        /></el-form-item>
        <div class="cur-acts">
          <el-button size="large" @click="$router.push('/addon/sdk/currency/list')">{{
            $t("message.common.cancel")
          }}</el-button
          ><el-button type="primary" size="large" :loading="sub" @click="onSubmit" class="cur-sb"
            ><el-icon><Check /></el-icon> {{ $t("message.common.submit") }}</el-button
          >
        </div>
      </el-form>
    </div>
  </div>
</template>

<script lang="ts">
import { useI18n } from "vue-i18n";
import { defineComponent, ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { HomeFilled, ArrowLeft, Check } from "@element-plus/icons-vue";
import { addCurrency } from "/@/api/addon/sdk";
export default defineComponent({
  name: "addonSdkCurrencyAdd",
  components: { HomeFilled, ArrowLeft, Check },
  setup() {
    const { t } = useI18n();
    const router = useRouter();
    const fr = ref();
    const sub = ref(false);
    const f = reactive({
      currency_code: "",
      currency_name: "",
      currency_symbol: "",
      area_code: "",
      area_name: "",
      rate_fixed: null as any,
    });
    const r = {
      currency_code: [{ required: true, message: t("message.sdk.currency.addRequiredCode") }],
      currency_name: [{ required: true, message: t("message.sdk.currency.addRequiredName") }],
    };
    const onSubmit = async () => {
      try {
        await fr.value?.validate();
      } catch {
        return;
      }
      sub.value = true;
      try {
        await addCurrency({ ...f, rate_fixed: f.rate_fixed || 0 });
        ElMessage.success(t("message.common.msgAddOk"));
        router.push("/addon/sdk/currency/list");
      } finally {
        sub.value = false;
      }
    };
    return { fr, f, r, sub, onSubmit };
  },
});
</script>

<style scoped>
.cur-fp {
  max-width: 960px;
  margin: 0 auto;
}
.cur-mono :deep(.el-input__inner) {
  font-family: "JetBrains Mono", monospace !important;
}
.cur-pg {
  margin: 28px 0 24px;
  padding: 32px 36px;
  background: linear-gradient(135deg, #fff7ed, #ffedd5);
  border-radius: var(--cc-radius-xl);
  border: 1px solid #fed7aa;
}
.cur-bk {
  font-family: "Lexend Deca", sans-serif;
  font-size: 13px;
  color: var(--cc-color-text-3);
  padding: 0;
  margin-bottom: 10px;
}
.cur-ht {
  font-family: "Lexend Deca", sans-serif;
  font-size: 28px;
  font-weight: 700;
  color: #9a3412;
  margin: 0 0 4px;
}
.cur-st {
  font-size: 14px;
  color: #ea580c;
  margin: 0;
}
.cur-fc {
  background: var(--cc-color-surface);
  border: 1px solid #fed7aa;
  border-radius: var(--cc-radius-xl);
  padding: 36px 40px;
}
.cur-req {
  color: var(--cc-color-danger);
}
.cur-fc :deep(.el-input__wrapper),
.cur-fc :deep(.el-input-number__wrapper) {
  border-radius: var(--cc-radius-md);
  border: 1px solid #fed7aa;
  background: #fff7ed;
}
.cur-fc :deep(.el-input__wrapper.is-focus),
.cur-fc :deep(.el-input-number__wrapper.is-focus) {
  border-color: #f97316;
  box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
}
.cur-acts {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 24px;
  border-top: 1px solid #ffedd5;
}
.cur-acts .el-button {
  font-weight: 600;
  border-radius: var(--cc-radius-md);
  padding: 12px 28px;
}
.cur-sb {
  background: linear-gradient(135deg, #f97316, #ea580c) !important;
  border: none !important;
}
@media (min-width: 1440px) {
  .cur-fp {
    max-width: 1320px;
  }
  .cur-pg {
    padding: 40px 48px;
  }
  .cur-fc {
    padding: 40px 48px;
  }
}
</style>
