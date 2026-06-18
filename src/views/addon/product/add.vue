<template>
  <ProPage
    :title="$t('message.sdk.product.addTitle')"
    :subtitle="$t('message.sdk.product.addSubtitle')"
    class="product-form-page"
  >
    <template #actions>
      <el-button @click="$router.back()">{{ $t("message.sdk.product.btnCancel") }}</el-button>
    </template>

    <div class="page-card">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="130px" class="product-form">
        <el-form-item :label="$t('message.sdk.product.addLabelType')" prop="type">
          <el-select v-model="form.type" class="w-full">
            <el-option :label="$t('message.sdk.product.type0')" :value="0" />
            <el-option :label="$t('message.sdk.product.type1')" :value="1" />
            <el-option :label="$t('message.sdk.product.type4')" :value="4" />
          </el-select>
        </el-form-item>

        <!-- 游戏专属 (type=0) -->
        <template v-if="form.type === 0">
          <el-form-item :label="$t('message.sdk.product.addLabelAppId')" prop="app_id">
            <el-input v-model.number="form.app_id" :disabled="!!appId" />
          </el-form-item>
          <el-form-item
            :label="$t('message.sdk.product.addLabelProductId')"
            prop="local_product_id"
          >
            <el-input
              v-model="form.local_product_id"
              :placeholder="$t('message.sdk.product.addPlaceholderProductId')"
            />
          </el-form-item>
        </template>

        <!-- 订阅专属 (type=1) -->
        <template v-if="form.type === 1">
          <el-form-item :label="$t('message.sdk.product.labelPlan')" prop="plan">
            <el-input
              v-model="form.plan"
              :placeholder="$t('message.sdk.product.placeholderPlan')"
            />
          </el-form-item>
          <el-form-item :label="$t('message.sdk.product.labelBillingCycle')" prop="billing_cycle">
            <el-select v-model="form.billing_cycle" class="w-full">
              <el-option :label="$t('message.sdk.product.optionTrial')" value="trial" />
              <el-option :label="$t('message.sdk.product.optionMonthly')" value="monthly" />
              <el-option :label="$t('message.sdk.product.optionYearly')" value="yearly" />
            </el-select>
          </el-form-item>
          <el-form-item
            v-if="form.billing_cycle === 'trial'"
            :label="$t('message.sdk.product.labelTrialDays')"
            prop="trial_days"
          >
            <el-input-number v-model="form.trial_days" :min="1" :max="90" style="width: 100%" />
          </el-form-item>
          <el-form-item :label="$t('message.sdk.product.labelFeatures')" prop="features">
            <el-input
              v-model="form.features"
              :placeholder="$t('message.sdk.product.placeholderFeatures')"
            />
          </el-form-item>
        </template>

        <el-form-item :label="$t('message.sdk.product.addLabelName')" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item :label="$t('message.sdk.product.addLabelDescription')" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item :label="$t('message.sdk.product.colPriceCents')" prop="price">
          <el-input
            v-model.number="form.price"
            type="number"
            :placeholder="$t('message.sdk.product.placeholderPrice')"
          />
        </el-form-item>
        <el-form-item :label="$t('message.sdk.product.addLabelStatus')">
          <el-switch v-model="form.status" :active-value="1" :inactive-value="0" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmit" :loading="submitting">{{
            $t("message.sdk.product.addBtnSubmit")
          }}</el-button>
          <el-button @click="$router.back()">{{ $t("message.sdk.product.btnCancel") }}</el-button>
        </el-form-item>
      </el-form>
    </div>
  </ProPage>
</template>

<script lang="ts">
import { defineComponent, ref, reactive } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ElMessage } from "element-plus";
import ProPage from "/@/components/pro/ProPage.vue";
import { addProduct } from "/@/api/addon/product";
import { useI18n } from "vue-i18n";

export default defineComponent({
  name: "addonSdkProductAdd",
  components: { ProPage },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const { t } = useI18n();
    const appId = Number(route.query.app_id) || 0;
    const formRef = ref();
    const submitting = ref(false);

    const form = reactive({
      type: appId ? 0 : 0,
      app_id: appId,
      local_product_id: "",
      plan: "",
      billing_cycle: "monthly",
      trial_days: 7,
      features: "",
      name: "",
      description: "",
      price: 0,
      currency: "CNY",
      status: 1,
    });

    const rules: any = {
      app_id: [
        { required: true, message: t("message.sdk.product.msgAppIdRequired"), trigger: "blur" },
      ],
      local_product_id: [
        { required: true, message: t("message.sdk.product.msgProductIdRequired"), trigger: "blur" },
      ],
      name: [
        { required: true, message: t("message.sdk.product.msgNameRequired"), trigger: "blur" },
      ],
      price: [
        { required: true, message: t("message.sdk.product.msgPriceRequired"), trigger: "blur" },
      ],
    };

    const onSubmit = async () => {
      const valid = await formRef.value?.validate().catch(() => false);
      if (!valid) return;
      submitting.value = true;
      try {
        const payload: Record<string, any> = { ...form };
        if (form.type !== 0) {
          delete payload.app_id;
          delete payload.local_product_id;
        }
        await addProduct(payload);
        ElMessage.success(t("message.sdk.product.msgAddSuccess"));
        router.push("/addon/product/list");
      } finally {
        submitting.value = false;
      }
    };

    return { formRef, form, rules, submitting, appId, onSubmit };
  },
});
</script>

<style scoped>
.product-form-page :deep(.pro-page__body) {
  align-items: center;
}
.page-card {
  width: min(920px, 100%);
  background: var(--cc-color-surface);
  border: 1px solid var(--cc-color-border-light);
  border-radius: var(--cc-radius-xl);
  padding: var(--cc-space-8);
  box-shadow: var(--cc-shadow-sm);
}
.product-form {
  width: 100%;
  max-width: 720px;
}
.product-form :deep(.el-input__wrapper),
.product-form :deep(.el-textarea__inner) {
  border-radius: var(--cc-radius-md);
  background: var(--cc-color-surface-hover);
  box-shadow: none;
  border: 1px solid var(--cc-color-border-light);
}
.product-form :deep(.el-input__wrapper.is-focus),
.product-form :deep(.el-textarea__inner:focus) {
  border-color: var(--cc-color-primary);
  box-shadow: 0 0 0 3px var(--cc-color-primary-softer);
}
.product-form :deep(.el-form-item__label) {
  color: var(--cc-color-text-2);
  font-weight: 550;
}
@media (max-width: 768px) {
  .page-card {
    padding: var(--cc-space-5);
  }
}
</style>
