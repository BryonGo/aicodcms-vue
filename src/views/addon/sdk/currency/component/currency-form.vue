<template>
  <div class="cur-fp">
    <div v-if="loading" class="cur-loading">
      <el-icon :size="28" class="cur-spin"><Loading /></el-icon>
      <p>{{ $t("message.user.loading") }}</p>
    </div>
    <template v-else-if="loadError">
      <div class="cur-error">
        <el-icon :size="40"><WarningFilled /></el-icon>
        <h3>{{ $t("message.sdk.currency.title") }}</h3>
        <p>{{ loadError }}</p>
        <el-button type="primary" @click="emit('cancel')">{{ $t("message.common.back") }}</el-button>
      </div>
    </template>
    <template v-else>
      <div class="cur-fc">
        <el-form ref="fr" :model="f" :rules="r" label-position="top" size="large">
          <el-row :gutter="20">
            <el-col :xs="24" :md="12">
              <el-form-item prop="currency_code">
                <template #label
                  >{{ $t("message.sdk.currency.addLabelCode") }}
                  <span class="cur-req">*</span></template
                >
                <el-input v-model="f.currency_code" placeholder="USD/CNY" class="cur-mono" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :md="12">
              <el-form-item prop="currency_name">
                <template #label
                  >{{ $t("message.sdk.currency.addLabelName") }}
                  <span class="cur-req">*</span></template
                >
                <el-input
                  v-model="f.currency_name"
                  :placeholder="$t('message.sdk.currency.placeholderName')"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :xs="24" :md="12">
              <el-form-item prop="currency_symbol">
                <template #label>{{ $t("message.sdk.currency.addLabelSymbol") }}</template>
                <el-input v-model="f.currency_symbol" placeholder="$ / ¥ / €" class="cur-mono" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :md="12">
              <el-form-item prop="area_code">
                <template #label>{{ $t("message.sdk.currency.addLabelAreaCode") }}</template>
                <el-input v-model="f.area_code" placeholder="US/CN" class="cur-mono" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item prop="area_name">
            <template #label>{{ $t("message.sdk.currency.addLabelAreaName") }}</template>
            <el-input
              v-model="f.area_name"
              :placeholder="$t('message.sdk.currency.placeholderRegion')"
            />
          </el-form-item>
          <el-form-item prop="rate_fixed">
            <template #label>{{ $t("message.sdk.currency.colFixedRate") }}</template>
            <el-input-number
              v-model="f.rate_fixed"
              :precision="6"
              style="width: 100%"
              placeholder="6.500000"
            />
          </el-form-item>
        </el-form>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, computed, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Loading, WarningFilled } from "@element-plus/icons-vue";
import {
  addCurrency,
  getCurrencyDetail,
  editCurrency,
  deleteCurrency,
} from "/@/api/addon/sdk";
import { useI18n } from "vue-i18n";

export default defineComponent({
  name: "addonSdkCurrencyForm",
  components: { Loading, WarningFilled },
  props: {
    mode: { type: String as () => "add" | "edit", default: "add" },
    id: { type: [Number, String], default: undefined },
  },
  emits: ["success", "deleted", "cancel"],
  setup(props, { emit }) {
    const { t } = useI18n();
    const fr = ref();
    const loading = ref(false);
    const loadError = ref("");
    const isEdit = computed(() => props.mode === "edit");
    const f = reactive<any>({
      id: 0,
      currency_code: "",
      currency_name: "",
      currency_symbol: "",
      area_code: "",
      area_name: "",
      rate_fixed: 0,
    });
    const r = {
      currency_code: [{ required: true, message: t("message.sdk.currency.addRequiredCode") }],
      currency_name: [{ required: true, message: t("message.sdk.currency.addRequiredName") }],
    };

    const loadData = async () => {
      const id = Number(props.id);
      if (!id) {
        loading.value = false;
        return;
      }
      try {
        const res: any = await getCurrencyDetail({ id });
        const d = res.data || res;
        const cur = d.currency || d;
        if (cur?.id) Object.assign(f, cur);
      } catch {
        loadError.value = t("message.common.msgNetworkError");
      } finally {
        loading.value = false;
      }
    };

    const submit = async () => {
      try {
        await fr.value?.validate();
      } catch {
        return;
      }
      if (isEdit.value) {
        await editCurrency({
          id: f.id,
          currency_code: f.currency_code,
          currency_name: f.currency_name,
          currency_symbol: f.currency_symbol,
          area_code: f.area_code,
          area_name: f.area_name,
          rate_fixed: f.rate_fixed || 0,
        });
        ElMessage.success(t("message.common.msgSaveOk"));
      } else {
        await addCurrency({ ...f, rate_fixed: f.rate_fixed || 0 });
        ElMessage.success(t("message.common.msgAddOk"));
      }
      emit("success");
    };

    const remove = async () => {
      try {
        await ElMessageBox.confirm(
          t("message.sdk.currency.deleteConfirm", { code: f.currency_code }),
          t("message.common.confirmDeleteTitle"),
          { type: "warning" },
        );
      } catch {
        return;
      }
      await deleteCurrency({ ids: [f.id] });
      ElMessage.success(t("message.common.msgDeleteOk"));
      emit("deleted");
    };

    onMounted(async () => {
      if (isEdit.value && props.id) {
        loading.value = true;
        loadError.value = "";
        await loadData();
      }
    });

    return { fr, f, r, loading, loadError, isEdit, submit, remove, emit };
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
.cur-spin {
  animation: cur-spin 1s linear infinite;
  color: #f97316;
}
@keyframes cur-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
.cur-loading,
.cur-error {
  text-align: center;
  padding: 80px 20px;
  color: var(--cc-color-text-4);
}
.cur-error h3 {
  color: #4b5563;
  margin: 16px 0 8px;
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
@media (max-width: 768px) {
  .cur-fc {
    padding: 20px 16px;
    border-radius: var(--cc-radius-lg);
  }
}
</style>
