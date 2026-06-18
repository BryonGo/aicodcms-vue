<template>
  <div class="fa-page cur-fp">
    <el-breadcrumb separator="→"
      ><el-breadcrumb-item :to="{ path: '/' }"
        ><el-icon><HomeFilled /></el-icon> {{ $t("message.router.home") }}</el-breadcrumb-item
      ><el-breadcrumb-item>{{ $t("message.sdk.game.breadcrumbSdk") }}</el-breadcrumb-item
      ><el-breadcrumb-item :to="{ path: '/addon/sdk/currency/list' }">{{
        $t("message.sdk.currency.title")
      }}</el-breadcrumb-item
      ><el-breadcrumb-item>{{ $t("message.common.edit") }}</el-breadcrumb-item></el-breadcrumb
    >

    <div v-if="ld" style="text-align: center; padding: 80px">
      <el-icon :size="28" style="animation: spin 1s linear infinite; color: #f97316"
        ><Loading
      /></el-icon>
      <p>{{ $t("message.user.loading") }}</p>
    </div>
    <template v-else>
      <div class="cur-pg">
        <el-button link class="cur-bk" @click="$router.push('/addon/sdk/currency/list')"
          ><el-icon><ArrowLeft /></el-icon> {{ $t("message.common.back") }}</el-button
        >
        <div class="cur-hr">
          <div>
            <h1 class="cur-ht">{{ f.currency_name || $t("message.sdk.currencyEdit") }}</h1>
            <p class="cur-st">
              {{ f.currency_symbol }} — ID: <span class="cur-id">{{ f.id }}</span>
            </p>
          </div>
          <el-button type="danger" plain size="large" @click="onDel"
            ><el-icon><Delete /></el-icon>{{ $t("message.common.delete") }}</el-button
          >
        </div>
      </div>

      <div class="cur-fc">
        <el-form ref="fr" :model="f" :rules="r" label-position="top" size="large">
          <el-row :gutter="20">
            <el-col :xs="24" :md="12"
              ><el-form-item prop="currency_code"
                ><template #label
                  >{{ $t("message.sdk.currency.colCode") }}<span class="cur-req">*</span></template
                ><el-input v-model="f.currency_code" class="cur-mono" /></el-form-item
            ></el-col>
            <el-col :xs="24" :md="12"
              ><el-form-item prop="currency_name"
                ><template #label
                  >{{ $t("message.common.colName") }}<span class="cur-req">*</span></template
                ><el-input v-model="f.currency_name" /></el-form-item
            ></el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :xs="24" :md="12"
              ><el-form-item prop="currency_symbol"
                ><template #label>{{ $t("message.sdk.currency.colSymbol") }}</template
                ><el-input v-model="f.currency_symbol" class="cur-mono" /></el-form-item
            ></el-col>
            <el-col :xs="24" :md="12"
              ><el-form-item prop="area_code"
                ><template #label>{{ $t("message.sdk.currency.addLabelAreaCode") }}</template
                ><el-input v-model="f.area_code" class="cur-mono" /></el-form-item
            ></el-col>
          </el-row>
          <el-form-item prop="area_name"
            ><template #label>{{ $t("message.sdk.currency.addLabelAreaName") }}</template
            ><el-input v-model="f.area_name"
          /></el-form-item>
          <el-form-item prop="rate_fixed"
            ><template #label>{{ $t("message.sdk.currency.colFixedRate") }}</template
            ><el-input-number v-model="f.rate_fixed" :precision="6" style="width: 100%"
          /></el-form-item>
          <div class="cur-acts">
            <el-button size="large" @click="$router.push('/addon/sdk/currency/list')">{{
              $t("message.common.cancel")
            }}</el-button
            ><el-button type="primary" size="large" :loading="sub" @click="onSubmit" class="cur-sb"
              ><el-icon><Check /></el-icon> {{ $t("message.common.save") }}</el-button
            >
          </div>
        </el-form>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, onMounted, onActivated, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { HomeFilled, ArrowLeft, Check, Delete, Loading } from "@element-plus/icons-vue";
import { getCurrencyDetail, editCurrency, deleteCurrency } from "/@/api/addon/sdk";
import { useI18n } from "vue-i18n";
export default defineComponent({
  name: "addonSdkCurrencyEdit",
  components: { HomeFilled, ArrowLeft, Check, Delete, Loading },
  setup() {
    const route = useRoute();
    const { t } = useI18n();
    const router = useRouter();
    const fr = ref();
    const ld = ref(true);
    const sub = ref(false);
    const f = reactive<any>({
      id: 0,
      currency_code: "",
      currency_name: "",
      currency_symbol: "",
      area_code: "",
      area_name: "",
      rate_fixed: 0,
    });
    const r = { currency_code: [{ required: true }], currency_name: [{ required: true }] };
    const load = async () => {
      const id = Number(route.query.id);
      if (!id) {
        ld.value = false;
        return;
      }
      try {
        const res: any = await getCurrencyDetail({ id });
        const d = res.data || res;
        const cur = d.currency || d;
        if (cur?.id) Object.assign(f, cur);
        ld.value = false;
      } catch {
        ld.value = false;
      }
    };
    const onSubmit = async () => {
      try {
        await fr.value?.validate();
      } catch {
        return;
      }
      sub.value = true;
      try {
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
        router.push("/addon/sdk/currency/list");
      } finally {
        sub.value = false;
      }
    };
    const onDel = () => {
      ElMessageBox.confirm(
        t("message.sdk.currency.deleteConfirm", { code: f.currency_code }),
        t("message.common.confirmDeleteTitle"),
        { type: "warning" },
      )
        .then(async () => {
          await deleteCurrency({ ids: [f.id] });
          ElMessage.success(t("message.common.msgDeleteOk"));
          router.push("/addon/sdk/currency/list");
        })
        .catch(() => {});
    };
    onMounted(() => load());
    onActivated(() => load());
    watch(
      () => route.query.id,
      () => {
        if (route.query.id) load();
      },
    );
    return { fr, f, r, ld, sub, onSubmit, onDel };
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
.cur-hr {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
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
.cur-id {
  display: inline-block;
  padding: 2px 10px;
  background: rgba(249, 115, 22, 0.08);
  border-radius: 6px;
  font-family: "JetBrains Mono", monospace;
  font-size: 13px;
  color: #ea580c;
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
