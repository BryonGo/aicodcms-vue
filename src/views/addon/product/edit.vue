<template>
  <ProPage
    :title="product?.name || $t('message.sdk.product.editTitle')"
    :subtitle="$t('message.sdk.product.breadcrumbProduct')"
    class="product-edit-page"
  >
    <template #actions>
      <el-button @click="$router.push('/addon/product/list')">{{
        $t("message.common.back")
      }}</el-button>
    </template>

    <div v-if="loading" class="product-state">
      {{ $t("message.sdk.product.editLoading") }}
    </div>
    <div v-else-if="!product" class="product-state product-state--error">
      {{ $t("message.sdk.product.editErrorNotFound") }}
    </div>
    <template v-else>
      <div class="product-edit-card">
        <el-tabs v-model="activeTab" class="product-tabs">
          <el-tab-pane :label="$t('message.sdk.product.tabBasic')" name="basic">
            <el-form ref="basicForm" :model="basic" label-width="100px" class="product-basic-form">
              <el-form-item :label="$t('message.sdk.product.addLabelType')">
                <el-tag>{{ typeLabel(product.type) }}</el-tag>
              </el-form-item>
              <template v-if="product.type === 0">
                <el-form-item :label="$t('message.sdk.product.addLabelAppId')">
                  <el-tag>{{ product.extra?.app_id }}</el-tag>
                </el-form-item>
                <el-form-item :label="$t('message.sdk.product.addLabelProductId')">
                  <el-tag type="info">{{ product.extra?.local_product_id }}</el-tag>
                </el-form-item>
              </template>
              <el-form-item :label="$t('message.sdk.product.addLabelName')" prop="name">
                <el-input v-model="basic.name" />
              </el-form-item>
              <el-form-item :label="$t('message.sdk.product.addLabelDescription')">
                <el-input v-model="basic.description" type="textarea" :rows="3" />
              </el-form-item>
              <el-form-item :label="$t('message.sdk.product.addLabelPrice')">
                <el-input-number v-model="basic.price" :min="0" style="width: 200px" />
              </el-form-item>
              <el-form-item :label="$t('message.sdk.product.addLabelStatus')">
                <el-switch v-model="basic.state" :active-value="1" :inactive-value="0" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="onSaveBasic" :loading="saving">{{
                  $t("message.sdk.product.editBtnSave")
                }}</el-button>
              </el-form-item>
            </el-form>
          </el-tab-pane>

          <el-tab-pane :label="$t('message.sdk.product.tabSkus')" name="skus">
            <div class="product-section-head">
              <span class="product-section-title">{{ $t("message.sdk.product.tabSkus") }}</span>
              <el-button type="primary" size="small" @click="showSkuDialog = true">{{
                $t("message.sdk.product.skuAdd")
              }}</el-button>
            </div>
            <el-table
              :data="skus"
              border
              size="small"
              class="product-sub-table"
              :empty-text="$t('message.common.noData')"
            >
              <el-table-column
                prop="channel_code"
                :label="$t('message.sdk.product.skuChannelCode')"
                width="130"
              />
              <el-table-column
                prop="sku"
                :label="$t('message.sdk.product.addLabelPlatformProductId')"
                min-width="150"
              />
              <el-table-column
                prop="price"
                :label="$t('message.sdk.product.skuPrice')"
                width="120"
                align="right"
              >
                <template #default="{ row }">¥{{ (row.price / 100).toFixed(2) }}</template>
              </el-table-column>
              <el-table-column
                prop="currency"
                :label="$t('message.sdk.product.skuCurrency')"
                width="80"
              />
              <el-table-column
                :label="$t('message.sdk.product.colAction')"
                width="140"
                fixed="right"
              >
                <template #default="{ row }">
                  <el-button link size="small" @click="editSku(row)">{{
                    $t("message.sdk.product.btnEdit")
                  }}</el-button>
                  <el-button link size="small" type="danger" @click="deleteSku(row)">{{
                    $t("message.sdk.product.btnDelete")
                  }}</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>

          <el-tab-pane :label="$t('message.sdk.product.tabTranslations')" name="translations">
            <div class="product-section-head">
              <span class="product-section-title">{{
                $t("message.sdk.product.tabTranslations")
              }}</span>
              <el-button type="primary" size="small" @click="showTransDialog = true">{{
                $t("message.sdk.product.transAdd")
              }}</el-button>
            </div>
            <el-table
              :data="translations"
              border
              size="small"
              :empty-text="$t('message.common.noData')"
              class="product-sub-table"
            >
              <el-table-column
                prop="lang"
                :label="$t('message.sdk.product.transLang')"
                width="100"
              />
              <el-table-column
                prop="name"
                :label="$t('message.sdk.product.transName')"
                min-width="150"
              />
              <el-table-column
                prop="description"
                :label="$t('message.sdk.product.transDescription')"
                min-width="200"
                show-overflow-tooltip
              />
              <el-table-column
                :label="$t('message.sdk.product.colAction')"
                width="140"
                fixed="right"
              >
                <template #default="{ row }">
                  <el-button link size="small" @click="editTrans(row)">{{
                    $t("message.sdk.product.btnEdit")
                  }}</el-button>
                  <el-button
                    v-if="row.lang !== 'zh-CN'"
                    link
                    size="small"
                    type="danger"
                    @click="deleteTrans(row)"
                    >{{ $t("message.sdk.product.btnDelete") }}</el-button
                  >
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </div>
    </template>

    <!-- SKU Dialog -->
    <el-drawer
      v-model="showSkuDialog"
      :title="skuEditId ? $t('message.sdk.product.skuEdit') : $t('message.sdk.product.skuAdd')"
      width="450px"
    >
      <el-form :model="skuForm" label-width="100px">
        <el-form-item :label="$t('message.sdk.product.skuChannelCode')">
          <el-select v-model="skuForm.channel_code" class="w-full">
            <el-option label="alipay_web" value="alipay_web" />
            <el-option label="google_play" value="google_play" />
            <el-option label="apple_store" value="apple_store" />
            <el-option label="internal" value="internal" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('message.sdk.product.addLabelPlatformProductId')">
          <el-input v-model="skuForm.sku" placeholder="com.example.product.100" />
        </el-form-item>
        <el-form-item :label="$t('message.sdk.product.skuPrice')">
          <el-input-number v-model="skuForm.price" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item :label="$t('message.sdk.product.skuCurrency')">
          <el-select v-model="skuForm.currency" style="width: 100%">
            <el-option label="CNY" value="CNY" />
            <el-option label="USD" value="USD" />
            <el-option label="EUR" value="EUR" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showSkuDialog = false">{{ $t("message.common.cancel") }}</el-button>
        <el-button type="primary" @click="saveSku" :loading="saving">{{
          $t("message.common.save")
        }}</el-button>
      </template>
    </el-drawer>

    <!-- Translation Dialog -->
    <el-drawer
      v-model="showTransDialog"
      :title="
        transEditId ? $t('message.sdk.product.transEdit') : $t('message.sdk.product.transAdd')
      "
      width="450px"
    >
      <el-form :model="transForm" label-width="100px">
        <el-form-item :label="$t('message.sdk.product.transLang')">
          <el-select v-model="transForm.lang" class="w-full" :disabled="!!transEditId">
            <el-option label="zh-CN" value="zh-CN" />
            <el-option label="en-US" value="en-US" />
            <el-option label="ja-JP" value="ja-JP" />
            <el-option label="ko-KR" value="ko-KR" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('message.sdk.product.transName')">
          <el-input v-model="transForm.name" />
        </el-form-item>
        <el-form-item :label="$t('message.sdk.product.transDescription')">
          <el-input v-model="transForm.description" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showTransDialog = false">{{ $t("message.common.cancel") }}</el-button>
        <el-button type="primary" @click="saveTrans" :loading="saving">{{
          $t("message.common.save")
        }}</el-button>
      </template>
    </el-dialog>
  </ProPage>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, onMounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import ProPage from "/@/components/pro/ProPage.vue";
import {
  getProductDetail,
  editProduct,
  deleteProduct,
  getSkuList,
  addSku,
  editSku,
  deleteSku,
  getTransList,
  addTrans,
  editTrans,
  deleteTrans,
  ProductItem,
} from "/@/api/addon/product";

export default defineComponent({
  name: "addonSdkProductEdit",
  components: { ProPage },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const id = Number(route.query.id) || 0;
    const loading = ref(true);
    const product = ref<ProductItem | null>(null);
    const saving = ref(false);
    const activeTab = ref("basic");

    // ----- Basic Info -----
    const basic = reactive({ name: "", description: "", price: 0, state: 1 });

    // ----- SKU -----
    const skus = ref<any[]>([]);
    const showSkuDialog = ref(false);
    const skuEditId = ref(0);
    const skuForm = reactive({ channel_code: "internal", sku: "", price: 0, currency: "CNY" });

    // ----- Translation -----
    const translations = ref<any[]>([]);
    const showTransDialog = ref(false);
    const transEditId = ref(0);
    const transForm = reactive({ lang: "en-US", name: "", description: "" });

    const typeLabel = (t: number) => {
      const map: Record<number, string> = {
        0: t("message.sdk.product.optGame"),
        1: t("message.sdk.product.optSubscribe"),
        2: "Token",
        3: t("message.sdk.product.optSoftware"),
        4: "CMS",
      };
      return map[t] || t("message.sdk.product.unknownType");
    };

    const loadProduct = async () => {
      loading.value = true;
      try {
        const res: any = await getProductDetail({ id });
        const d = res.data || res;
        product.value = d.product || d;
        const p = product.value!;
        basic.name = p.name;
        basic.description = p.description || "";
        basic.price = p.price;
        basic.state = p.state;

        // load SKUs
        const skuRes: any = await getSkuList({ product_id: id });
        skus.value = skuRes.data?.list || skuRes.list || [];

        // load translations
        const trRes: any = await getTransList({ product_id: id });
        translations.value = trRes.data?.list || trRes.list || [];
      } finally {
        loading.value = false;
      }
    };

    const onSaveBasic = async () => {
      saving.value = true;
      try {
        await editProduct({ id, ...basic });
        ElMessage.success(t("message.sdk.product.msgSaveSuccess"));
      } finally {
        saving.value = false;
      }
    };

    // ----- SKU -----
    const editSku = (row: any) => {
      skuEditId.value = row.id;
      skuForm.channel_code = row.channel_code;
      skuForm.sku = row.sku;
      skuForm.price = row.price;
      skuForm.currency = row.currency;
      showSkuDialog.value = true;
    };
    const saveSku = async () => {
      saving.value = true;
      try {
        if (skuEditId.value) {
          await editSku({ id: skuEditId.value, ...skuForm });
        } else {
          await addSku({ product_id: id, ...skuForm });
        }
        ElMessage.success(t("message.sdk.product.msgSkuSaveSuccess"));
        showSkuDialog.value = false;
        skuEditId.value = 0;
        const res: any = await getSkuList({ product_id: id });
        skus.value = res.data?.list || res.list || [];
      } finally {
        saving.value = false;
      }
    };
    const deleteSku = (row: any) => {
      ElMessageBox.confirm(
        t("message.sdk.product.confirmDeleteSku"),
        t("message.sdk.product.confirmDeleteTitle"),
        { type: "warning" },
      )
        .then(async () => {
          await deleteSku({ ids: [row.id] });
          ElMessage.success(t("message.sdk.product.msgDeleted"));
          const res: any = await getSkuList({ product_id: id });
          skus.value = res.data?.list || res.list || [];
        })
        .catch(() => {});
    };

    // ----- Translation -----
    const editTrans = (row: any) => {
      transEditId.value = row.id;
      transForm.lang = row.lang;
      transForm.name = row.name;
      transForm.description = row.description;
      showTransDialog.value = true;
    };
    const saveTrans = async () => {
      saving.value = true;
      try {
        if (transEditId.value) {
          await editTrans({
            id: transEditId.value,
            name: transForm.name,
            description: transForm.description,
          });
        } else {
          await addTrans({ product_id: id, ...transForm });
        }
        ElMessage.success(t("message.sdk.product.msgTranslationSaved"));
        showTransDialog.value = false;
        transEditId.value = 0;
        const res: any = await getTransList({ product_id: id });
        translations.value = res.data?.list || res.list || [];
      } finally {
        saving.value = false;
      }
    };
    const deleteTrans = (row: any) => {
      ElMessageBox.confirm(
        t("message.sdk.product.confirmDeleteTranslation"),
        t("message.sdk.product.confirmDeleteTitle"),
        { type: "warning" },
      )
        .then(async () => {
          await deleteTrans({ ids: [row.id] });
          ElMessage.success(t("message.sdk.product.msgDeleted"));
          const res: any = await getTransList({ product_id: id });
          translations.value = res.data?.list || res.list || [];
        })
        .catch(() => {});
    };

    onMounted(() => loadProduct());

    return {
      loading,
      product,
      activeTab,
      basic,
      saving,
      skus,
      showSkuDialog,
      skuEditId,
      skuForm,
      translations,
      showTransDialog,
      transEditId,
      transForm,
      typeLabel,
      onSaveBasic,
      editSku,
      saveSku,
      deleteSku,
      editTrans,
      saveTrans,
      deleteTrans,
    };
  },
});
</script>
<style scoped>
.product-edit-page :deep(.pro-page__body) {
  align-items: stretch;
}
.product-state {
  padding: var(--cc-space-10);
  text-align: center;
  color: var(--cc-color-text-3);
  background: var(--cc-color-surface);
  border: 1px solid var(--cc-color-border-light);
  border-radius: var(--cc-radius-xl);
}
.product-state--error {
  color: var(--cc-color-danger);
}
.product-edit-card {
  background: var(--cc-color-surface);
  border: 1px solid var(--cc-color-border-light);
  border-radius: var(--cc-radius-xl);
  padding: var(--cc-space-6);
  box-shadow: var(--cc-shadow-sm);
}
.product-tabs :deep(.el-tabs__header) {
  margin-bottom: var(--cc-space-5);
}
.product-basic-form {
  max-width: 720px;
}
.product-basic-form :deep(.el-input__wrapper),
.product-basic-form :deep(.el-textarea__inner),
.product-edit-page :deep(.el-dialog .el-input__wrapper),
.product-edit-page :deep(.el-dialog .el-textarea__inner) {
  border-radius: var(--cc-radius-md);
  background: var(--cc-color-surface-hover);
  box-shadow: none;
  border: 1px solid var(--cc-color-border-light);
}
.product-basic-form :deep(.el-input__wrapper.is-focus),
.product-basic-form :deep(.el-textarea__inner:focus),
.product-edit-page :deep(.el-dialog .el-input__wrapper.is-focus),
.product-edit-page :deep(.el-dialog .el-textarea__inner:focus) {
  border-color: var(--cc-color-primary);
  box-shadow: 0 0 0 3px var(--cc-color-primary-softer);
}
.product-section-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--cc-space-3);
  margin-bottom: var(--cc-space-4);
}
.product-section-title {
  font-size: var(--cc-font-13);
  color: var(--cc-color-text-3);
  font-weight: 550;
}
.product-sub-table {
  border-radius: var(--cc-radius-lg);
  overflow: hidden;
}
.product-sub-table :deep(th.el-table__cell) {
  background: var(--cc-color-surface-hover);
  color: var(--cc-color-text-3);
  font-weight: 650;
}
@media (max-width: 768px) {
  .product-edit-card {
    padding: var(--cc-space-4);
  }
  .product-section-head {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
