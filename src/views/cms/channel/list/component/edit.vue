<template>
  <div class="chn-drawer-form">
    <el-form ref="formRef" :model="formData" :rules="rules" label-position="top" size="large">
          <el-tabs model-value="base" type="border-card" class="chn-tabs">
            <el-tab-pane :label="$t('message.cms.channelEdit.basicInfo')" name="base">
              <div class="chn-form-grid">
                <el-form-item :label="$t('message.cms.channelEdit.colParentId')" prop="parent_id">
                  <el-tree-select
                    v-model="formData.parent_id"
                    :data="CmsChannelChannelOptions"
                    :key="cascaderKey"
                    :props="{
                      label: 'name',
                      value: 'id',
                      disabled: 'disabled',
                      children: 'children',
                    }"
                    check-strictly
                    clearable
                    filterable
                    :placeholder="$t('message.cms.channelEdit.placeholderSelect')"
                    style="width: 100%"
                    :teleported="false"
                  />
                </el-form-item>
                <el-form-item :label="$t('message.common.colName')" prop="name">
                  <el-input
                    v-model.trim="formData.name"
                    :placeholder="$t('message.cms.channelEdit.placeholderName2')"
                  />
                </el-form-item>
                <el-form-item :label="$t('message.cms.channelEdit.colFlag')" prop="flag">
                  <el-input
                    v-model.trim="formData.flag"
                    :placeholder="$t('message.cms.channelEdit.placeholderFlag')"
                  />
                  <span
                    v-if="formData.flag"
                    class="flag-color-badge"
                    :style="{ background: flagColor(formData.flag) }"
                    >{{ formData.flag }}</span
                  >
                </el-form-item>
                <el-form-item :label="$t('message.cms.channelEdit.colDiyname')" prop="diyname">
                  <el-input
                    v-model.trim="formData.diyname"
                    :placeholder="$t('message.cms.channelEdit.placeholderDiynameUrl')"
                    :disabled="isEditIndex"
                  />
                </el-form-item>
                <el-form-item :label="$t('message.common.type')" prop="type" class="chn-full-row">
                  <el-radio-group
                    v-model="formData.type"
                    @change="CmsChannelChange"
                    :disabled="isEditIndex"
                  >
                    <el-radio
                      v-for="(item, index) in CmsChannelTypeOptions"
                      :key="index"
                      :value="item.value"
                      >{{ item.label }}</el-radio
                    >
                  </el-radio-group>
                </el-form-item>
                <el-form-item
                  v-if="formData.type === 'index'"
                  :label="$t('message.cms.channelEdit.colLayouttpl')"
                >
                  <el-input v-model.trim="formData.layouttpl" placeholder="layout/xxx" />
                </el-form-item>
                <el-form-item
                  v-if="formData.type === 'link'"
                  :label="$t('message.cms.articleEdit.colJumpUrl')"
                >
                  <el-input
                    v-model.trim="formData.outlink"
                    :placeholder="$t('message.cms.channelEdit.placeholderOutlink')"
                  />
                </el-form-item>
                <el-form-item
                  v-if="formData.type === 'channel'"
                  :label="$t('message.cms.channelEdit.colChanneltpl')"
                >
                  <el-input v-model.trim="formData.channeltpl" placeholder="channel/xxx" />
                </el-form-item>
                <el-form-item
                  v-if="formData.type === 'list'"
                  :label="$t('message.cms.channelEdit.colListtpl')"
                >
                  <el-input v-model.trim="formData.listtpl" placeholder="list/xxx" />
                </el-form-item>
                <el-form-item
                  v-if="formData.type === 'list' || formData.type === 'channel'"
                  :label="$t('message.cms.channelEdit.contentTemplate')"
                >
                  <el-input v-model.trim="formData.showtpl" placeholder="show/xxx" />
                </el-form-item>
                <el-form-item
                  v-if="formData.type === 'page'"
                  :label="$t('message.cms.channelEdit.colShowtpl')"
                >
                  <el-input v-model.trim="formData.showtpl" placeholder="show/xxx" />
                </el-form-item>
                <el-form-item :label="$t('message.common.colStatus')">
                  <el-radio-group v-model="formData.status">
                    <el-radio value="1">{{ $t("message.common.normal") }}</el-radio>
                    <el-radio value="0">{{ $t("message.common.hidden") }}</el-radio>
                  </el-radio-group>
                </el-form-item>
              </div>
            </el-tab-pane>
            <el-tab-pane :label="$t('message.cms.channelEdit.moreSettings')" name="more">
              <div class="chn-form-grid">
                <el-form-item :label="$t('message.cms.channelEdit.weigh')">
                  <el-input-number
                    v-model="formData.weigh"
                    :min="0"
                    :max="9999"
                    style="width: 100%"
                  />
                </el-form-item>
                <el-form-item :label="$t('message.cms.articleEdit.colSeotitle')">
                  <el-input
                    v-model.trim="formData.seotitle"
                    :placeholder="$t('message.cms.channelEdit.placeholderSeotitle2')"
                  />
                </el-form-item>
                <el-form-item :label="$t('message.cms.articleEdit.colKeywords')">
                  <el-input
                    v-model.trim="formData.keywords"
                    :placeholder="$t('message.cms.channelEdit.placeholderKeywords2')"
                  />
                </el-form-item>
                <el-form-item
                  :label="$t('message.cms.tagList.colDescription')"
                  class="chn-full-row"
                >
                  <el-input
                    v-model="formData.description"
                    type="textarea"
                    :rows="3"
                    :placeholder="$t('message.cms.channelEdit.placeholderDescription2')"
                  />
                </el-form-item>
                <el-form-item :label="$t('message.cms.articleEdit.colImage')">
                  <el-upload
                    v-loading="upLoadingThumb"
                    :action="buildApiUrl('/api/v1/addon/upload')"
                    :before-upload="beforeAvatarUploadThumb"
                    :data="setUpData()"
                    :on-success="handleAvatarSuccessThumb"
                    :show-file-list="false"
                    class="avatar-uploader"
                    name="file"
                  >
                    <img v-if="imageUrlThumb" :src="imageUrlThumb" class="avatar" />
                    <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
                  </el-upload>
                </el-form-item>
              </div>
            </el-tab-pane>
            <el-tab-pane :label="$t('message.cms.channelEdit.multiLang')" name="trans">
              <TranslationEditor v-model="formData.translations" :fields="translationFields" />
            </el-tab-pane>
          </el-tabs>

          <div v-if="formData.id" class="chn-meta-row">
            <span class="chn-meta"><b>创建时间:</b> {{ fmtTs(formData.created_at) }}</span>
            <span class="chn-meta"><b>更新时间:</b> {{ fmtTs(formData.updated_at) }}</span>
          </div>

          <div class="chn-form-actions">
            <el-button size="large" @click="$emit('close')">{{
              $t("message.common.cancel")
            }}</el-button>
            <el-button
              type="primary"
              size="large"
              :loading="submitting"
              @click="onSubmit"
              class="chn-submit-btn"
            >
              <template v-if="!submitting"
                ><el-icon style="margin-right: 4px"><Check /></el-icon
                >{{ $t("message.common.save") }}</template
              >
              <template v-else>{{ $t("message.common.saving") }}</template>
            </el-button>
          </div>
      </el-form>
    </div>
</template>

<script lang="ts">
import { defineComponent, getCurrentInstance, reactive, ref, toRefs, unref, computed } from "vue";
import { useI18n } from "vue-i18n";
import { ElMessage, ElMessageBox, UploadProps } from "element-plus";
import {
  addCmsChannel,
  getCmsChannel,
  listCmsChannel,
  updateCmsChannel,
  delCmsChannel,
} from "/@/api/cms/channel";
import { buildApiUrl, getToken } from "/@/utils/aicodcod";
import { ChannelEditState, ChannelTypeOptions } from "/@/views/cms/channel/list/component/model";
import TranslationEditor, {
  type TranslationField,
} from "/@/components/translation/TranslationEditor.vue";
import {
  Check,
  Delete,
  Plus,
} from "@element-plus/icons-vue";

export default defineComponent({
  name: "apiV1ChannelEditPage",
  components: { TranslationEditor, Check, Delete, Plus },
  props: {
    editId: { type: Number, default: 0 },
    parentId: { type: Number, default: 0 },
  },
  emits: ["saved", "close"],
  setup(props, ctx) {
    const { t: $t } = useI18n();
    const baseURL = buildApiUrl("/");
    const { proxy } = <any>getCurrentInstance();
    const formRef = ref<HTMLElement | null>(null);
    const imageUrlThumb = ref("");
    const CmsChannelChannelOptions = ref<any[]>([]);
    const cascaderKey = ref(0);
    const upLoadingThumb = ref(false);

    const loading = ref(false);
    const submitting = ref(false);
    const loadError = ref("");

    const translationFields: TranslationField[] = [
      { key: "name", label: $t("message.cms.channelEdit.transName"), type: "text" },
      { key: "seotitle", label: $t("message.cms.channelEdit.transSeotitle"), type: "text" },
      { key: "keywords", label: $t("message.cms.channelEdit.transKeywords"), type: "text" },
      {
        key: "description",
        label: $t("message.cms.channelEdit.transDescription"),
        type: "textarea",
        rows: 2,
      },
      {
        key: "layouttpl",
        label: $t("message.cms.channelEdit.transLayouttpl"),
        type: "templateInput",
      },
      {
        key: "channeltpl",
        label: $t("message.cms.channelEdit.transChanneltpl"),
        type: "templateInput",
      },
      { key: "listtpl", label: $t("message.cms.channelEdit.transListtpl"), type: "templateInput" },
      { key: "showtpl", label: $t("message.cms.channelEdit.transShowtpl"), type: "templateInput" },
    ];

    const isEditIndex = computed(
      () => state.formData?.diyname === "index" || state.formData?.type === "index",
    );
    const pageTitle = computed(() => {
      if (isEditIndex.value) return $t("message.cms.channelEdit.editHomeTitle");
      if (!state.formData.id) return $t("message.cms.channelEdit.addCategoryTitle");
      return $t("message.cms.channelEdit.editCategoryTitle");
    });

    const state = reactive<ChannelEditState>({
      loading: false,
      isShowDialog: false,
      formData: {
        id: undefined,
        name: undefined,
        type: "list",
        seotitle: undefined,
        keywords: undefined,
        description: undefined,
        created_at: undefined,
        updated_at: undefined,
        deleted_at: undefined,
        content: undefined,
        parent_id: undefined,
        listtpl: "list_news",
        showtpl: "show_news",
        isInherit: undefined,
        image: undefined,
        channeltpl: "channel_default",
        layouttpl: "layout",
        linkedCmsChannelCmsChannel: { id: undefined, name: undefined },
        translations: [],
        status: "1",
        isnav: 0,
        flag: undefined,
      },
      rules: {
        name: [
          {
            required: true,
            message: $t("message.cms.channelEdit.msgNameRequired"),
            trigger: "blur",
          },
        ],
        diyname: [
          {
            required: true,
            message: $t("message.cms.channelEdit.msgRouteRequired"),
            trigger: "blur",
          },
        ],
      },
    });

    const flagColor = (flag: string | undefined): string => {
      const colors: Record<string, string> = {
        index: "#67c23a",
        list: "#409eff",
        channel: "#909399",
        page: "#e6a23c",
        hot: "#f56c6c",
      };
      return colors[flag || ""] || "#909399";
    };

    const fmtTs = (ts?: number | string) => {
      if (ts === undefined || ts === null || ts === "" || Number(ts) <= 0) return "—";
      return new Date(Number(ts) * 1000).toLocaleString("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    const loadData = async () => {
      const id = props.editId;
      const parent_id = props.parentId || 0;
      loadError.value = "";

      listCmsChannel({ row: 100, page: 1 })
        .then((res: any) => {
          let list = res.data.list ?? [];
          list.forEach((item: any) => {
            item["disabled"] = item.type !== "channel";
          });
          CmsChannelChannelOptions.value = proxy.handleTree(list, "id", "parent_id");
          cascaderKey.value++;
        })
        .catch(() => {});

      CmsChannelChange("list");
      state.formData.parent_id = parent_id || undefined;

      if (!id) {
        return;
      }

      try {
        const res = await getCmsChannel(id);
        const data = (res as any).data?.info || (res as any).data;
        if (data?.id) {
          imageUrlThumb.value = data.thumb ? proxy.getUpFileUrl(data.thumb) : "";
          if (data.banner) {
            try {
              data.banner = JSON.parse(data.banner);
            } catch (e) {
              data.banner = [];
            }
          } else {
            data.banner = [];
          }
          data.status = "" + (data.status ?? "1");
          state.formData = data;
          if (data.translations?.length > 0) state.formData.translations = data.translations;
          CmsChannelChange(data.type);
        } else {
          loadError.value = $t("message.cms.channelEdit.notFound");
        }
      } catch {
        loadError.value = $t("message.common.msgNetworkErrorRetry");
      } finally {
      }
    };

    const CmsChannelChange = (_val: string) => {
      // 模板字段改为手动输入，不再从后端拉取文件列表
    };

    const onSubmit = () => {
      const formWrap = unref(formRef) as any;
      if (!formWrap) return;
      formWrap.validate((valid: boolean) => {
        if (!valid) return;
        submitting.value = true;
        const submitData = { ...state.formData } as any;
        const transList = submitData.translations || [];
        delete submitData.translations;
        if (transList.length > 0)
          submitData.translations = transList.filter((t: any) => t.lang && t.lang !== "zh-CN");
        const api =
          !submitData.id || submitData.id === 0
            ? addCmsChannel(submitData)
            : updateCmsChannel(submitData);
        api
          .then(() => {
            ElMessage.success(
              submitData.id
                ? $t("message.cms.channelEdit.msgEditOk2")
                : $t("message.cms.channelEdit.msgAddOk2"),
            );
            ctx.emit("saved");
          })
          .finally(() => {
            submitting.value = false;
          });
      });
    };

    const handleAvatarSuccessThumb: UploadProps["onSuccess"] = (res, file) => {
      if (res.code === 0) {
        imageUrlThumb.value = URL.createObjectURL(file.raw!);
        state.formData.image = res.data.full_path;
      } else {
        ElMessage.error(res.msg);
      }
      upLoadingThumb.value = false;
    };
    const beforeAvatarUploadThumb = () => {
      upLoadingThumb.value = true;
      return true;
    };
    const setUpData = () => {
      return { token: getToken() };
    };

    const onDelete = () => {
      ElMessageBox.confirm(
        $t("message.common.confirmDeleteItem", { name: state.formData.name || "" }),
        $t("message.common.confirmDeleteTitle"),
        {
          type: "warning",
          confirmButtonText: $t("message.common.confirmDeleteTitle"),
          cancelButtonText: $t("message.common.cancel"),
        },
      )
        .then(async () => {
          await delCmsChannel([state.formData.id!]);
          ElMessage.success($t("message.common.msgDeleteOk"));
          ctx.emit("saved");
        })
        .catch(() => {});
    };

    loadData();

    return {
      CmsChannelChange,
      proxy,
      onSubmit,
      onDelete,
      formRef,
      imageUrlThumb,
      upLoadingThumb,
      handleAvatarSuccessThumb,
      beforeAvatarUploadThumb,
      setUpData,
      baseURL,
      buildApiUrl,
      CmsChannelChannelOptions,
      cascaderKey,
      CmsChannelTypeOptions: ChannelTypeOptions,
      isEditIndex,
      flagColor,
      pageTitle,
      fmtTs,
      translationFields,
      submitting,
      loadError,
      ...toRefs(state),
    };
  },
});
</script>

<style scoped>
.chn-drawer-form {
  padding: 24px;
}

.chn-tabs {
  margin-bottom: 24px;
}
.chn-tabs :deep(.el-tabs__content) {
  padding: 20px 0 0;
}
.chn-tabs :deep(.el-tabs__header) {
  background: transparent;
  border: none;
  margin-bottom: 0;
}
.chn-tabs :deep(.el-tabs__nav) {
  border: none;
}
.chn-tabs :deep(.el-tabs__item) {
  font-family: var(--cc-font-sans);
  font-size: 14px;
  font-weight: 500;
  color: var(--cc-color-text-3);
  padding: 10px 20px;
  border-radius: 8px 8px 0 0;
}
.chn-tabs :deep(.el-tabs__item.is-active) {
  color: var(--cc-color-text-1);
  background: #fff;
  border-color: var(--cc-color-border);
}

.chn-form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 32px;
  align-items: start;
}
.chn-form-grid > * {
  min-width: 0;
}
.chn-full-row {
  grid-column: 1 / -1;
}

.chn-meta-row {
  display: flex;
  gap: 32px;
  flex-wrap: wrap;
  padding-top: 16px;
  margin-bottom: 20px;
  border-top: 1px solid var(--cc-color-border-light);
}
.chn-meta {
  font-family: var(--cc-font-sans);
  font-size: 12px;
  color: var(--cc-color-text-4);
}
.chn-meta b {
  color: var(--cc-color-text-3);
}

.chn-drawer-form :deep(.el-form-item__label) {
  margin-bottom: 6px;
}
.chn-drawer-form :deep(.el-input__wrapper),
.chn-drawer-form :deep(.el-textarea__inner),
.chn-drawer-form :deep(.el-input-number__wrapper) {
  border-radius: 10px;
  background: var(--cc-color-bg);
  box-shadow: none;
  border: 1px solid var(--cc-color-border);
  transition: border-color 0.25s, background 0.25s, box-shadow 0.25s;
}
.chn-drawer-form :deep(.el-input__wrapper:hover),
.chn-drawer-form :deep(.el-textarea__inner:hover) {
  background: #fff;
  border-color: var(--cc-color-text-4);
}
.chn-drawer-form :deep(.el-input__wrapper.is-focus),
.chn-drawer-form :deep(.el-textarea__inner:focus) {
  background: #fff;
  border-color: var(--cc-color-text-3);
  box-shadow: 0 0 0 3px var(--cc-color-focus-ring);
}
.chn-drawer-form :deep(.el-input__inner),
.chn-drawer-form :deep(.el-textarea__inner) {
  font-family: var(--cc-font-sans);
  font-size: 14px;
  color: var(--cc-color-text-1);
}

.chn-form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding-top: 24px;
  border-top: 1px solid var(--cc-color-border-light);
}
.chn-form-actions .el-button {
  font-family: var(--cc-font-sans);
  font-weight: 600;
  border-radius: 10px;
  padding: 12px 28px;
}
.chn-submit-btn {
  background: var(--cc-color-primary) !important;
  border: none !important;
  box-shadow: var(--cc-shadow-card);
  transition: all 0.25s !important;
}
.chn-submit-btn:hover:not(.is-loading) {
  background: var(--cc-color-primary-active) !important;
  box-shadow: var(--cc-shadow-card-hover);
  transform: translateY(-1px);
}

.chn-drawer-form :deep(.avatar-uploader .avatar) {
  width: 128px;
  height: 128px;
  display: block;
}
.chn-drawer-form :deep(.avatar-uploader .el-upload) {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
}
.flag-color-badge {
  display: inline-flex;
  align-items: center;
  padding: 0 8px;
  height: 24px;
  border-radius: 4px;
  color: #fff;
  font-size: 12px;
  margin-left: 8px;
}

@media (min-width: 1440px) {
  .chn-form-grid {
    gap: 0 48px;
  }
}
@media (max-width: 768px) {
  .chn-form-grid {
    grid-template-columns: 1fr;
  }
  .chn-form-actions {
    flex-direction: column-reverse;
  }
  .chn-form-actions .el-button {
    width: 100%;
  }
}
</style>
