<template>
  <div class="article-editor" :class="{ 'is-add-mode': isAddMode, 'is-edit-mode': !isAddMode }">
    <!-- 面包屑 -->
    <el-breadcrumb separator="→" class="mb15">
      <el-breadcrumb-item :to="{ path: '/' }"
        ><el-icon><HomeFilled /></el-icon> {{ $t("message.router.home") }}</el-breadcrumb-item
      >
      <el-breadcrumb-item>{{ $t("message.cms.articleList.breadcrumbs.cms") }}</el-breadcrumb-item>
      <el-breadcrumb-item>{{
        $t("message.cms.articleList.breadcrumbs.article")
      }}</el-breadcrumb-item>
      <el-breadcrumb-item>{{
        isAddMode ? $t("message.router.cmsArticleAdd") : $t("message.router.cmsArticleEdit")
      }}</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 顶部信息栏 -->
    <div class="editor-header">
      <div class="header-info">
        <div class="header-meta">
          <span class="mode-badge" :class="isAddMode ? 'badge-add' : 'badge-edit'">
            <el-icon><component :is="isAddMode ? 'Plus' : 'Edit'" /></el-icon>
            {{
              isAddMode
                ? $t("message.cms.articleEdit.addTitle")
                : $t("message.cms.articleEdit.editTitle")
            }}
          </span>
        </div>

        <!-- 默认语言提示（仅 Add 模式） -->
        <el-alert v-if="isAddMode" type="info" :closable="false" show-icon class="lang-alert">
          <template #title>
            {{ $t("message.cms.articleEdit.defaultLanguage") }} — {{ defaultLangInfo.flag }}
            {{ defaultLangInfo.nativeName }}（{{ defaultLangInfo.code }}）
            <span class="lang-hint">{{ $t("message.cms.articleEdit.defaultLanguageHint") }}</span>

            <!-- Revision history dialog / 历史版本 -->
            <el-drawer
              :title="$t('message.cmsArticle.revisionHistory')"
              v-model="revisionDialogVisible"
              width="700px"
              :close-on-click-modal="false"
            >
              <el-table :data="revisionList" stripe max-height="400">
                <el-table-column label="ID" prop="id" width="60" />
                <el-table-column
                  :label="$t('message.cmsArticle.remark')"
                  prop="remark"
                  min-width="150"
                />
                <el-table-column
                  :label="$t('message.cmsArticle.operateTime')"
                  prop="created_at"
                  width="180"
                />
                <el-table-column :label="$t('message.cmsArticle.action')" width="160">
                  <template #default="{ row }">
                    <el-button size="small" @click="onPreviewRevision(row.id)">{{
                      $t("message.cmsArticle.view")
                    }}</el-button>
                    <el-button size="small" type="primary" @click="onRestoreRevision(row.id)">{{
                      $t("message.cmsArticle.restore")
                    }}</el-button>
                  </template>
                </el-table-column>
              </el-table>
              <el-collapse v-if="revisionPreview" style="margin-top: 16px">
                <el-collapse-item
                  :title="
                    $t('message.cmsArticle.fieldSnapshot') +
                    ' (' +
                    Object.keys(revisionPreview.fields || {}).length +
                    ' ' +
                    $t('message.cmsArticle.fieldsCount') +
                    ')'
                  "
                >
                  <pre style="max-height: 300px; overflow: auto">{{
                    JSON.stringify(revisionPreview.fields, null, 2)
                  }}</pre>
                </el-collapse-item>
                <el-collapse-item
                  :title="$t('message.cmsArticle.contentSnapshot')"
                  v-if="revisionPreview.content"
                >
                  <pre style="max-height: 300px; overflow: auto">{{ revisionPreview.content }}</pre>
                </el-collapse-item>
              </el-collapse>
            </el-drawer>
          </template>
        </el-alert>

        <!-- 语言选择器（仅 Edit 模式） -->
        <div v-if="!isAddMode" class="lang-bar">
          <span class="lang-bar-label">{{ $t("message.cms.articleEdit.editLang") }}：</span>
          <el-select
            v-model="editLangCode"
            size="default"
            class="lang-select"
            @change="onEditLangChange"
          >
            <el-option
              v-for="lang in editLangOptions"
              :key="lang.code"
              :label="`${lang.flag} ${lang.code} — ${lang.nativeName}`"
              :value="lang.code"
            />
          </el-select>
          <el-tag v-if="editLangCode === 'zh-CN'" type="info" size="small">{{
            $t("message.common.default")
          }}</el-tag>
          <el-button
            v-if="editLangCode !== 'zh-CN'"
            type="danger"
            link
            size="small"
            class="btn-delete-trans"
            @click="onDeleteTranslation"
          >
            <el-icon><Delete /></el-icon> {{ $t("message.cms.articleEdit.deleteTranslation") }}
          </el-button>
        </div>
      </div>
    </div>

    <!-- 主体编辑区 -->
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-position="top"
      class="editor-form"
    >
      <div class="form-body">
        <!-- 左侧主表单区 -->
        <div class="form-primary">
          <!-- 基本信息 -->
          <section class="field-group">
            <div class="group-header">
              <span class="group-icon">
                <el-icon><Document /></el-icon>
              </span>
              <span class="group-title">{{ $t("message.cms.articleEdit.basicInfo") }}</span>
            </div>

            <div v-if="isAddMode || editLangCode === 'zh-CN'" class="form-grid form-grid-2col">
              <el-form-item :label="$t('message.cms.articleEdit.colChannel')" prop="categoryId">
                <el-tree-select
                  v-model="formData.channel_id"
                  :data="cmsChannelOptions"
                  :key="cascaderKey"
                  :placeholder="$t('message.cms.articleEdit.placeholderSelectChannel')"
                  highlight-current
                  node-key="id"
                  check-strictly
                  :default-expanded-keys="[formData.channel_id]"
                  filterable
                  teleported
                  :props="{ label: 'name', value: 'id', disabled: 'disabled' }"
                >
                  <template #default="{ data }">
                    {{ data.name }}
                    <span v-if="data.type === 'jump'" class="channel-hint">{{
                      $t("message.cms.articleEdit.channelJumpHint")
                    }}</span>
                    <span v-if="data.type === 'page'" class="channel-hint">{{
                      $t("message.cms.articleEdit.channelPageHint")
                    }}</span>
                  </template>
                </el-tree-select>
              </el-form-item>

              <el-form-item :label="$t('message.cms.articleEdit.colModel')" prop="model_id">
                <el-select
                  v-model="formData.model_id"
                  :placeholder="$t('message.cms.articleEdit.placeholderSelectModel')"
                  clearable
                  @change="handleModelChange"
                >
                  <el-option
                    v-for="item in modulesOptions"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id"
                  />
                </el-select>
              </el-form-item>
            </div>

            <el-form-item
              :label="$t('message.cms.articleEdit.colTitle')"
              prop="title"
              class="field-title"
            >
              <el-input
                v-model.trim="formData.title"
                :placeholder="$t('message.cms.articleEdit.placeholderTitle')"
                size="large"
                class="input-title"
              />
            </el-form-item>

            <div class="form-grid form-grid-2col">
              <el-form-item :label="$t('message.cms.articleEdit.colSeotitle')" prop="seotitle">
                <el-input
                  v-model.trim="formData.seotitle"
                  :placeholder="$t('message.cms.articleEdit.placeholderSeotitle2')"
                />
              </el-form-item>
              <el-form-item :label="$t('message.cms.articleEdit.colKeywords')" prop="keywords">
                <el-input
                  v-model.trim="formData.keywords"
                  :placeholder="$t('message.cms.articleEdit.placeholderKeywords2')"
                />
              </el-form-item>
            </div>

            <el-form-item :label="$t('message.cms.articleEdit.colDescription')" prop="tag">
              <el-input
                v-model="formData.description"
                :placeholder="$t('message.cms.articleEdit.placeholderDescription')"
                type="textarea"
                :rows="2"
              />
            </el-form-item>

            <el-form-item :label="$t('message.cms.articleEdit.colTags')" prop="tags">
              <el-input
                v-model="formData.tags"
                :placeholder="$t('message.cms.articleEdit.placeholderTags2')"
                type="textarea"
                :rows="2"
              />
            </el-form-item>
          </section>

          <!-- 缩略图 -->
          <section class="field-group" v-if="editLangCode === 'zh-CN'">
            <div class="group-header">
              <span class="group-icon">
                <el-icon><Picture /></el-icon>
              </span>
              <span class="group-title">{{ $t("message.cms.articleEdit.thumbnail") }}</span>
            </div>

            <el-form-item prop="image" class="image-upload-item">
              <el-upload
                :action="buildApiUrl('/api/v1/addon/upload')"
                :on-success="handleAvatarSuccessThumb"
                :show-file-list="false"
                class="avatar-uploader"
                name="file"
              >
                <div class="upload-box">
                  <img
                    v-if="!proxy.isEmpty(imageUrlThumb)"
                    :src="imageUrlThumb"
                    class="upload-preview"
                  />
                  <el-icon v-else class="upload-placeholder">
                    <Plus />
                  </el-icon>
                </div>
              </el-upload>
              <div class="field-hint">{{ $t("message.cms.articleEdit.hintThumbnailSize") }}</div>
            </el-form-item>
          </section>

          <!-- 正文编辑（平铺） -->
          <div class="content-section">
            <div class="content-section-header">
              <span class="content-section-icon">
                <el-icon><EditPen /></el-icon>
              </span>
              <span class="content-section-title">{{
                $t("message.cms.articleEdit.colContent")
              }}</span>
            </div>

            <el-form-item prop="content" class="content-editor">
              <ProEditor
                v-model="formData.content"
                toolbar="full"
                editor-id="cmsArticleEditor"
                :placeholder="$t('message.cms.articleEdit.placeholderContent')"
                :bordered="false"
              />
            </el-form-item>

            <!-- 电影模块 -->
            <template v-if="Number(formData.model_id) === 3">
              <section class="field-group">
                <el-form-item :label="$t('message.cms.articleEdit.moviePlayerActor')">
                  <movie-editor
                    :model-groups="playerGroups"
                    :model-actors="actorRoles"
                    @update:model-groups="playerGroups = $event"
                    @update:model-actors="actorRoles = $event"
                  />
                </el-form-item>
              </section>
            </template>
          </div>
        </div>

        <!-- 右侧侧边栏 -->
        <aside class="form-sidebar">
          <!-- 发布设置（主语言可见） -->
          <section class="field-group field-group-sidebar" v-if="editLangCode === 'zh-CN'">
            <div class="group-header">
              <span class="group-icon">
                <el-icon><Setting /></el-icon>
              </span>
              <span class="group-title">{{ $t("message.cms.articleEdit.publishSettings") }}</span>
            </div>

            <div class="sidebar-status">
              <span class="status-label">{{ $t("message.common.colStatus") }}</span>
              <el-tag :type="statusTagType" size="large" class="status-badge">
                {{ statusLabel }}
              </el-tag>
            </div>

            <div class="checkbox-row">
              <el-checkbox
                v-model="formData.is_hot"
                true-value="1"
                false-value="0"
                class="cb-item"
                >{{ $t("message.cms.articleEdit.flagHot") }}</el-checkbox
              >
              <el-checkbox
                v-model="formData.is_new"
                true-value="1"
                false-value="0"
                class="cb-item"
                >{{ $t("message.cms.articleEdit.flagNew") }}</el-checkbox
              >
              <el-checkbox
                v-model="formData.is_recommend"
                true-value="1"
                false-value="0"
                class="cb-item"
                >{{ $t("message.cms.articleEdit.flagRecommend") }}</el-checkbox
              >
              <el-checkbox
                v-model="formData.is_top"
                true-value="1"
                false-value="0"
                class="cb-item"
                >{{ $t("message.cms.articleEdit.flagTop") }}</el-checkbox
              >
            </div>

            <el-form-item :label="$t('message.cms.articleEdit.colIsJump')" prop="is_jump">
              <el-radio-group v-model="formData.is_jump" class="jump-radio">
                <el-radio-button
                  v-for="dict in jumpOptions"
                  :key="dict.value"
                  :label="dict.value"
                  :value="dict.value"
                  >{{ dict.label }}</el-radio-button
                >
              </el-radio-group>
            </el-form-item>

            <el-form-item
              :label="$t('message.cms.articleEdit.colJumpUrl')"
              prop="jump_url"
              v-if="formData.is_jump === '1'"
            >
              <el-input
                v-model.trim="formData.jump_url"
                :placeholder="$t('message.cms.articleEdit.placeholderJumpUrl')"
              />
            </el-form-item>

            <el-form-item :label="$t('message.cms.articleEdit.colViews')" prop="views">
              <el-input
                v-model.number="formData.views"
                :placeholder="$t('message.cms.articleEdit.placeholderViews')"
                type="number"
                min="0"
              />
            </el-form-item>

            <el-form-item :label="$t('message.cms.articleEdit.colPublishTime')">
              <el-date-picker
                v-model="formData.published_at"
                type="datetime"
                value-format="YYYY-MM-DD HH:mm:ss"
                class="full-width-picker"
              />
            </el-form-item>
          </section>

          <!-- 翻译提示（非默认语言 Edit 模式） -->
          <div
            v-if="!isAddMode && editLangCode !== 'zh-CN' && moduleFields.length > 0"
            class="sidebar-notice"
          >
            <el-alert type="warning" :closable="false" show-icon>
              <template #title
                >非默认语言 ({{ editLangCode }}) you can fill translation values for translatable
                fields. They will be saved automatically.</template
              >
            </el-alert>
          </div>

          <!-- 模型字段 -->
          <section class="field-group field-group-sidebar" v-if="moduleFields.length > 0">
            <div class="group-header">
              <span class="group-icon">
                <el-icon><Grid /></el-icon>
              </span>
              <span class="group-title">{{ $t("message.cms.articleEdit.modelFields") }}</span>
              <span class="group-count">{{ moduleFields.length }}</span>
            </div>

            <div class="module-fields-list">
              <div class="module-field-item" v-for="item in moduleFields" :key="item.id">
                <div class="mf-label">
                  <span class="mf-name">{{ $t("moduleField_" + item.name, item.label) }}</span>
                  <el-tag
                    v-if="item.is_translatable === 1"
                    size="small"
                    type="success"
                    effect="plain"
                    class="mf-tag"
                    >{{ $t("message.cms.articleEdit.translatable") }}</el-tag
                  >
                </div>
                <div class="mf-control">
                  <modules-data-form-item
                    v-model="item.content"
                    :module-field="item"
                    :disabled="shouldDisableModuleField(item)"
                  />
                </div>
              </div>
            </div>
          </section>

          <!-- 更多设置 -->
          <section class="field-group field-group-sidebar">
            <div class="group-header">
              <span class="group-icon">
                <el-icon><More /></el-icon>
              </span>
              <span class="group-title">{{ $t("message.cms.articleEdit.moreSettings") }}</span>
            </div>

            <el-form-item :label="$t('message.cms.articleEdit.colShowtpl')" prop="showtpl">
              <el-select
                v-model="formData.showtpl"
                :placeholder="$t('message.cms.articleEdit.placeholderShowtpl')"
                clearable
              >
                <el-option
                  v-for="(item, index) in templateFileList"
                  :key="index"
                  :label="item.name"
                  :value="item.name"
                />
              </el-select>
              <div class="field-hint">{{ $t("message.cms.articleEdit.showtplHint") }}</div>
            </el-form-item>
          </section>

          <!-- SEO 检查面板 -->
          <div class="seo-panel">
            <div class="seo-header">{{ $t("message.cmsArticle.seoCheck") }}</div>
            <template v-if="seoResult">
              <div class="seo-score" :class="seoColorClass">{{ seoResult.score }}/100</div>
              <div v-for="item in seoResult.items" :key="item.label" class="seo-item">
                <div class="seo-item-header">
                  <span>{{ item.label }}</span>
                  <span>{{ item.value }}</span>
                </div>
                <div class="seo-bar-bg">
                  <div
                    class="seo-bar"
                    :class="'seo-' + item.color"
                    :style="{ width: item.score + '%' }"
                  ></div>
                </div>
              </div>
              <div v-if="seoResult.suggestions.length" class="seo-tips">
                <div v-for="s in seoResult.suggestions" :key="s" class="seo-tip">
                  &#x1f4a1; {{ s }}
                </div>
              </div>
            </template>
            <div v-else class="seo-empty">{{ $t("message.cmsArticle.seoAutoCheck") }}</div>
          </div>
        </aside>
      </div>
    </el-form>

    <!-- 固定底栏 -->
    <footer class="editor-footer">
      <div class="footer-inner">
        <el-button @click="onCancel" size="large">{{
          $t("message.cms.articleEdit.cancelButton")
        }}</el-button>
        <el-button type="warning" @click="onSubmitDraft" size="large" :disabled="loading">
          {{ $t("message.cmsArticle.saveDraft") }}
        </el-button>
        <el-button size="large" @click="onShowRevisions" v-if="state.formData.id">
          {{ $t("message.cmsArticle.revisionHistory") }}
        </el-button>
        <el-dropdown trigger="click" @command="handlePublish">
          <el-button type="primary" @click="onSubmitPublish" size="large" :loading="loading">
            {{ $t("message.cms.articleEdit.confirmButton") }}
          </el-button>
        </el-dropdown>
      </div>
    </footer>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  getCurrentInstance,
  computed,
  watch,
  onMounted,
  reactive,
  ref,
  toRefs,
} from "vue";
import { useI18n } from "vue-i18n";
import { dayjs, ElMessage, ElMessageBox, UploadProps } from "element-plus";
import {
  Delete,
  Plus,
  Document,
  Setting,
  EditPen,
  Grid,
  More,
  Edit,
  Picture,
} from "@element-plus/icons-vue";
import {
  addCmsArticle,
  getCmsArticle,
  updateCmsArticle,
  delArticleTranslation,
} from "/@/api/cms/article";
import { useCmsCache } from "/@/stores/cmsCache";
import { useThemeConfig } from "/@/stores/themeConfig";
import { storeToRefs } from "pinia";
import { buildApiUrl, getToken } from "/@/utils/aicodcod";
import { CmsArticleEditState } from "/@/views/cms/article/list/component/model";
import ProEditor from "/@/components/pro/ProEditor.vue";
import { type TranslationField } from "/@/components/translation/TranslationEditor.vue";
import { useRoute, useRouter } from "vue-router";
import { getChannelTree } from "/@/api/cms/article";
import { listModulesField } from "/@/api/pms/modulesField";
import { listModulesInfo } from "/@/api/pms/modulesInfo";
import { ModulesFieldInfoData } from "/@/views/pms/modulesField/list/component/model";
import ModulesDataFormItem from "/@/components/modulesData/forumItem.vue";
import { listTemplateFiles } from "/@/api/cms/tpl";
import { getLanguageCatalog } from "/@/api/cms/setting";
import { CmsTemplateFileData } from "/@/views/cms/tpl/list/component/model";
import MovieEditor from "/@/views/addon/movie/playEditor.vue";
import {
  getPlayerGroups,
  getPlayUrls,
  savePlayerGroups,
  savePlayUrls,
  getActorRoles,
  saveActorRoles,
} from "/@/api/addon/movie";
import { seoCheck } from "/@/api/cms/article";
import { listCmsRevision, getCmsRevision, restoreCmsRevision } from "/@/api/cms/revision";

export default defineComponent({
  name: "apiV1CmsArticleEditComponent",
  components: { MovieEditor, ModulesDataFormItem, ProEditor },
  props: {},
  setup() {
    const { t } = useI18n();
    const templateFileList = ref<CmsTemplateFileData[]>([]);
    const baseURL = buildApiUrl("/");
    const { proxy } = <any>getCurrentInstance();
    const route = useRoute();
    const router = useRouter();
    const cmsCache = useCmsCache();
    const isAddMode = computed(() => !route.query.id);

    const statusLabel = computed(() => {
      const map: Record<number, string> = {
        0: t("message.cmsArticle.unpublished"),
        1: t("message.cmsArticle.published"),
        2: t("message.cmsArticle.draft"),
        3: t("message.cmsArticle.scheduled"),
      };
      return map[formData.status] || t("message.cmsArticle.unknown");
    });

    const statusTagType = computed(() => {
      const map: Record<number, string> = { 0: "info", 1: "success", 2: "warning", 3: "danger" };
      return map[formData.status] || "info";
    });
    const defaultLangInfo = ref({
      flag: "🇨🇳",
      code: "zh-CN",
      nativeName: t("message.common.zhCn"),
    });
    const formRef = ref();

    const editLangCode = ref((route.query.lang as string) || "zh-CN");
    const editLangOptions = ref<{ code: string; flag: string; nativeName: string }[]>([]);
    const editLangName = computed(() => {
      const opt = editLangOptions.value.find((l) => l.code === editLangCode.value);
      return opt?.nativeName || editLangCode.value;
    });
    const editLangFlag = computed(() => {
      const opt = editLangOptions.value.find((l) => l.code === editLangCode.value);
      return opt?.flag || "🌐";
    });

    const onEditLangChange = (lang: string) => {
      if (lang === ((route.query.lang as string) || "zh-CN")) return;
      router.push({ path: "/cms/article/list/edit", query: { id: route.query.id, lang } });
    };

    const storesThemeConfig = useThemeConfig();
    const { themeConfig } = storeToRefs(storesThemeConfig);
    watch(
      () => themeConfig.value.globalI18n,
      (newLang) => {
        if (!route.query.id) return;
        const mapped: Record<string, string> = {
          "zh-cn": "zh-CN",
          en: "en-US",
          ja: "ja-JP",
          th: "th-TH",
        };
        const target = mapped[newLang] || "zh-CN";
        if (editLangCode.value !== target) {
          editLangCode.value = target;
          router.push({
            path: "/cms/article/list/edit",
            query: { id: route.query.id, lang: target },
          });
        }
      },
    );

    const imageUrlThumb = ref("");
    const upLoadingThumb = ref(false);
    const cmsChannelOptions = ref([]);
    const cascaderKey = ref(0);
    const modulesOptions = ref([]);
    const jumpOptions = [
      { label: t("message.common.yes"), value: "1" },
      { label: t("message.common.no"), value: "0" },
    ];

    const { cms_article_attr, cms_article_pub_type } = proxy.useDict(
      "cms_article_attr",
      "cms_article_pub_type",
    );

    const state = reactive<CmsArticleEditState>({
      loading: false,
      isShowDialog: false,
      formData: {
        id: undefined,
        user_id: undefined,
        channel_id: undefined,
        channel_ids: undefined,
        model_id: 0,
        special_ids: undefined,
        admin_id: undefined,
        title: undefined,
        style: undefined,
        image: undefined,
        images: undefined,
        seotitle: undefined,
        keywords: undefined,
        description: undefined,
        tags: undefined,
        is_jump: undefined,
        jump_url: undefined,
        diyname: undefined,
        views: undefined,
        created_at: undefined,
        updated_at: undefined,
        published_at: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        deleted_at: undefined,
        is_slide: undefined,
        is_hot: "0",
        is_new: "0",
        is_recommend: "0",
        is_top: "0",
        status: 1,
        weigh: undefined,
        showtpl: undefined,
        content: "",
        modulesData: {},
        translations: [],
      },
      rules: {
        title: [
          {
            required: true,
            message: t("message.cms.articleEdit.msgTitleRequired"),
            trigger: "blur",
          },
          { max: 200, message: t("message.cms.articleEdit.msgTitleMax"), trigger: "blur" },
        ],
        channel_id: [
          {
            required: true,
            message: t("message.cms.articleEdit.msgSelectCategory"),
            trigger: "change",
          },
        ],
      },
    });

    const openDialog = () => {
      resetForm();
      moduleFields.value = [];
      listModulesInfo({ row: 50, page: 1 }).then((res: any) => {
        modulesOptions.value = res.data.list ?? [];
        if (isAddMode.value && modulesOptions.value.length > 0) {
          const defaultModel = modulesOptions.value[0];
          state.formData.model_id = defaultModel.id;
          handleModelChange(defaultModel.id);
        }
      });
      getChannelTree().then((res: any) => {
        let tree = res.data?.channel_tree ?? [];
        const setDisabled = (nodes: any[]) => {
          nodes.forEach((node: any) => {
            if (node.type === "link") {
              node["disabled"] = true;
            }
            if (node.children?.length) {
              setDisabled(node.children);
            }
          });
        };
        setDisabled(tree);
        cmsChannelOptions.value = tree;
        cascaderKey.value++;
      });
      if (route.query?.id) {
        const queryLang = route.query?.lang as string;
        getCmsArticle(Number(route.query?.id), queryLang)
          .then((res: any) => {
            if (res.code !== 0 || !res.data) {
              ElMessage.error(res?.msg || t("message.cms.articleEdit.msgNotFound"));
              return;
            }
            const data = res.data;
            imageUrlThumb.value = data.image ? proxy.getUpFileUrl(data.image) : "";
            data.status = "" + (data.status ?? 1);
            data.is_jump = "" + (data.is_jump ?? 0);
            data.model_id = Number(data.model_id) || 0;
            Object.assign(state.formData, data);

            if (data.translations && data.translations.length > 0) {
              state.formData.translations = data.translations;
              const editLang = queryLang;
              if (editLang && editLang !== "zh-CN") {
                const trans = data.translations[0];
                if (trans) {
                  state.formData.title = trans.title || "";
                  state.formData.seotitle = trans.seotitle || "";
                  state.formData.keywords = trans.keywords || "";
                  state.formData.description = trans.description || "";
                  state.formData.tags = trans.tags || "";
                  state.formData.content = trans.content || "";
                }
              }
            } else {
              const editLang = queryLang;
              if (editLang && editLang !== "zh-CN") {
                state.formData.title = "";
                state.formData.seotitle = "";
                state.formData.keywords = "";
                state.formData.description = "";
                state.formData.tags = "";
                state.formData.content = "";
                state.formData.translations = [];
              }
            }
            if (state.formData.model_id && state.formData.model_id > 0) {
              listModulesField({ row: 20, page: 1, moduleId: state.formData.model_id }).then(
                (res: any) => {
                  (res.data?.list ?? []).forEach((item: any) => {
                    if (["checkbox", "image", "images", "file", "files"].includes(item.type)) {
                      item["content"] = state.formData.modulesData?.[item.name] ?? [];
                    } else {
                      item["content"] = state.formData.modulesData?.[item.name] ?? "";
                    }
                  });
                  moduleFields.value = res.data?.list ?? [];
                },
              );
            }
            if (state.formData.model_id === 3 && state.formData.id) {
              const aid = state.formData.id;
              Promise.all([getPlayerGroups(aid), getActorRoles(aid)]).then(
                ([gRes, aRes]: any[]) => {
                  const groups = gRes.data?.list || [];
                  const urlPromises = groups.map((g: any) =>
                    getPlayUrls(aid, g.id).then((uRes: any) => ({
                      ...g,
                      urls: uRes.data?.list || [],
                    })),
                  );
                  Promise.all(urlPromises).then((fullGroups) => {
                    playerGroups.value = fullGroups;
                  });
                  actorRoles.value = aRes.data?.list || [];
                },
              );
            }
          })
          .catch((err: any) => {
            ElMessage.error(err?.msg || t("message.cms.articleEdit.msgLoadFailed"));
          });
      }
      state.isShowDialog = true;
    };

    const closeDialog = () => {
      state.isShowDialog = false;
      proxy.mittBus.emit(
        "onCurrentContextmenuClick",
        Object.assign({}, { contextMenuClickId: 1, ...route }),
      );
    };

    const onCancel = () => {
      closeDialog();
    };

    const onDeleteTranslation = () => {
      const articleId = Number(route.query?.id);
      const lang = editLangCode.value;
      if (!articleId || lang === "zh-CN") return;
      ElMessageBox.confirm(
        t(
          `Delete translation ${editLangFlag.value} ${editLangName.value} (${lang})? This cannot be undone.`,
        ),
        t("message.cms.articleEdit.deleteTranslationTitle"),
        {
          confirmButtonText: t("message.cms.articleEdit.confirmDelete"),
          cancelButtonText: t("message.common.cancel"),
          type: "warning",
        },
      )
        .then(async () => {
          await delArticleTranslation(articleId, lang);
          ElMessage.success(t("message.cms.articleEdit.translationDeleted"));
          closeDialog();
          router.push({ path: "/cms/article/list/edit", query: { id: articleId } });
        })
        .catch(() => {});
    };

    const moduleFields = ref<ModulesFieldInfoData[]>([]);
    const playerGroups = ref<any[]>([]);
    const actorRoles = ref<any[]>([]);

    const shouldDisableModuleField = (item: ModulesFieldInfoData) => {
      if (isAddMode.value) return false;
      if (editLangCode.value === "zh-CN") return false;
      return item.is_translatable !== 1;
    };

    const translationFields: TranslationField[] = [
      { key: "title", label: t("message.cms.articleEdit.transTitle"), type: "text" },
      { key: "seotitle", label: t("message.cms.articleEdit.transSeotitle"), type: "text" },
      { key: "keywords", label: t("message.cms.articleEdit.transKeywords"), type: "text" },
      {
        key: "description",
        label: t("message.cms.articleEdit.transDescription"),
        type: "textarea",
        rows: 2,
      },
      { key: "tags", label: t("message.cms.articleEdit.transTags"), type: "text" },
      {
        key: "showtpl",
        label: t("message.cms.articleEdit.transTemplate"),
        type: "templateInput",
        placeholder: "e.g. show_news_en.html",
        hint: "Use main table template if empty",
      },
      { key: "author", label: t("message.cms.articleEdit.transAuthor"), type: "text" },
      {
        key: "content",
        label: t("message.cms.articleEdit.transContent"),
        type: "richtext",
        rows: 6,
      },
    ];

    const handleModelChange = (modelId: any) => {
      const mid = Number(modelId) || 0;
      state.formData.model_id = mid;
      moduleFields.value = [];
      if (mid > 0) {
        listModulesField({ row: 20, page: 1, moduleId: mid }).then((res: any) => {
          (res.data.list ?? []).forEach((item: ModulesFieldInfoData) => {
            if (["checkbox", "image", "images", "file", "files"].includes(item.type)) {
              item.content = [];
            } else {
              item.content = "";
            }
          });
          moduleFields.value = res.data.list ?? [];
        });
      }
    };

    // Save article as draft (status=2)
    const onSubmitDraft = () => {
      if (!route.query.id && !state.formData.title) {
        ElMessage.warning(t("statusDraftHint"));
        return;
      }
      if (!route.query.id) {
        // New article: save and redirect to edit
        state.formData.status = 2;
      } else {
        // Existing: just update status
        state.formData.status = 2;
      }
      onSubmit();
    };

    // Publish now or schedule (auto-detect: future published_at → status=3)
    const onSubmitPublish = () => {
      if (!state.formData.title) {
        ElMessage.warning(t("statusTitleRequired"));
        return;
      }
      const now = dayjs();
      const pub = dayjs(state.formData.published_at);
      if (pub.isAfter(now)) {
        state.formData.status = 3;
      } else {
        state.formData.status = 1;
      }
      onSubmit();
    };

    const onSubmit = () => {
      formRef.value?.validate((valid: boolean) => {
        if (!valid) {
          ElMessage.warning(t("message.cms.articleEdit.msgCheckForm"));
          return;
        }
        state.loading = true;
        state.formData.modulesData = {};
        moduleFields.value.forEach((item: ModulesFieldInfoData) => {
          state.formData.modulesData[item.name] = item.content;
        });
        const submitData = { ...state.formData } as any;
        if (submitData.showtpl === undefined || submitData.showtpl === null) {
          submitData.showtpl = "";
        }
        const editLang = route.query?.lang as string;
        const existingTranslations = submitData.translations || [];
        delete submitData.translations;
        if (editLang && editLang !== "zh-CN") {
          submitData.translations = [
            {
              lang: editLang,
              title: submitData.title,
              seotitle: submitData.seotitle,
              keywords: submitData.keywords,
              description: submitData.description,
              tags: submitData.tags,
              content: submitData.content,
            },
          ];
        } else {
          const validTrans = existingTranslations.filter((t: any) => t.lang && t.lang !== "zh-CN");
          if (validTrans.length > 0) {
            submitData.translations = validTrans;
          }
        }
        submitData.status = Number(submitData.status);
        submitData.is_jump = Number(submitData.is_jump);
        const doSaveMovieData = async (articleId: number) => {
          if (state.formData.model_id !== 3) return;
          const groups = playerGroups.value.map((g: any) => ({
            group_name: g.group_name,
            sort: g.sort || 0,
            urls: g.urls || [],
          }));
          if (groups.length > 0) {
            await savePlayerGroups(articleId, groups);
            const gRes: any = await getPlayerGroups(articleId);
            const savedGroups = gRes.data?.list || [];
            for (let i = 0; i < savedGroups.length && i < groups.length; i++) {
              const urls = groups[i].urls.map((u: any) => ({
                ...u,
                article_id: articleId,
                group_id: savedGroups[i].id,
              }));
              if (urls.length > 0) {
                await savePlayUrls(articleId, savedGroups[i].id, urls);
              }
            }
          }
          if (actorRoles.value.length > 0) {
            const items = actorRoles.value.map((r: any) => ({
              actor_id: Number(r.actor_id),
              actor_name: r.actor_name || "",
              role_name: r.role_name || "",
              sort: r.sort || 0,
            }));
            await saveActorRoles(articleId, items);
          }
        };
        if (!submitData.id || submitData.id === 0) {
          addCmsArticle(submitData)
            .then((res: any) => {
              const newId = res.data?.id || res.id;
              return doSaveMovieData(newId);
            })
            .then(() => {
              ElMessage.success(t("message.common.msgAddOk"));
              cmsCache.invalidateByPrefix("");
              closeDialog();
              router.push({ path: "/cms/article/list" });
            })
            .finally(() => {
              state.loading = false;
            });
        } else {
          updateCmsArticle(submitData)
            .then(() => {
              return doSaveMovieData(submitData.id);
            })
            .then(() => {
              ElMessage.success(t("message.common.msgEditOk"));
              cmsCache.invalidateByPrefix("");
              closeDialog();
              router.push({ path: "/cms/article/list" });
            })
            .finally(() => {
              state.loading = false;
            });
        }
      });
    };

    const resetForm = () => {
      state.formData = {
        id: undefined,
        user_id: undefined,
        channel_id: undefined,
        channel_ids: undefined,
        model_id: 0,
        special_ids: undefined,
        admin_id: undefined,
        title: undefined,
        style: undefined,
        image: undefined,
        images: undefined,
        seotitle: undefined,
        keywords: undefined,
        description: undefined,
        tags: undefined,
        is_jump: 0,
        jump_url: "",
        diyname: undefined,
        views: undefined,
        created_at: undefined,
        updated_at: undefined,
        deleted_at: undefined,
        published_at: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        is_slide: undefined,
        is_hot: "0",
        is_new: "0",
        is_recommend: "0",
        is_top: "0",
        status: 1,
        weigh: undefined,
        showtpl: "",
        content: "",
        modulesData: {},
        translations: [],
      };
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

    onMounted(() => {
      listTemplateFiles("/show").then((res: any) => {
        templateFileList.value = res.data?.list ?? [];
      });
      getLanguageCatalog("active").then((res: any) => {
        editLangOptions.value = res?.data?.activeInfos || [];
      });
      openDialog();
    });

    const revisionDialogVisible = ref(false);
    const revisionList = ref<any[]>([]);
    const revisionPreview = ref<any>(null);

    const onShowRevisions = () => {
      revisionDialogVisible.value = true;
      loadRevisions();
    };

    const loadRevisions = () => {
      if (!state.formData.id) return;
      listCmsRevision(state.formData.id).then((res: any) => {
        revisionList.value = res?.data?.list || [];
      });
    };

    const onPreviewRevision = (id: number) => {
      getCmsRevision(id).then((res: any) => {
        revisionPreview.value = res?.data || null;
      });
    };

    const onRestoreRevision = (id: number) => {
      ElMessageBox.confirm(
        t("message.cmsArticle.confirmRestore"),
        t("message.cmsArticle.confirmRestoreTitle"),
        {
          type: "warning",
        },
      ).then(() => {
        restoreCmsRevision(id).then(() => {
          ElMessage.success(t("message.cmsArticle.restoredToRevision"));
          revisionDialogVisible.value = false;
          location.reload();
        });
      });
    };

    const seoResult = ref<any>(null);
    let seoTimer: any = null;

    const seoColorClass = computed(() => {
      if (!seoResult.value) return "";
      const s = seoResult.value.score;
      return s >= 80 ? "seo-green" : s >= 50 ? "seo-yellow" : "seo-red";
    });

    const runSeoCheck = () => {
      const title = state.formData.title || "";
      const desc = state.formData.description || "";
      const content = state.formData.content || "";
      if (!title) {
        seoResult.value = null;
        return;
      }
      seoCheck({ title, description: desc, content }).then((r: any) => {
        seoResult.value = r.data || null;
      });
    };

    watch(
      () => state.formData.title,
      () => {
        clearTimeout(seoTimer);
        seoTimer = setTimeout(runSeoCheck, 500);
      },
    );
    watch(
      () => state.formData.description,
      () => {
        clearTimeout(seoTimer);
        seoTimer = setTimeout(runSeoCheck, 500);
      },
    );
    watch(
      () => state.formData.content,
      () => {
        clearTimeout(seoTimer);
        seoTimer = setTimeout(runSeoCheck, 500);
      },
    );

    return {
      seoResult,
      seoColorClass,
      proxy,
      formRef,
      openDialog,
      revisionDialogVisible,
      revisionList,
      revisionPreview,
      onShowRevisions,
      onPreviewRevision,
      onRestoreRevision,
      closeDialog,
      onCancel,
      onDeleteTranslation,
      onSubmit,
      moduleFields,
      cascaderKey,
      isAddMode,
      defaultLangInfo,
      shouldDisableModuleField,
      onEditLangChange,
      editLangOptions,
      editLangCode,
      editLangFlag,
      editLangName,
      imageUrlThumb,
      upLoadingThumb,
      handleAvatarSuccessThumb,
      beforeAvatarUploadThumb,
      setUpData,
      baseURL,
      buildApiUrl,
      cms_article_attr,
      cms_article_pub_type,
      cmsChannelOptions,
      templateFileList,
      jumpOptions,
      handleModelChange,
      modulesOptions,
      playerGroups,
      actorRoles,
      translationFields,
      ...toRefs(state),
    };
  },
});
</script>

<style scoped>
/* ======== Container ======== */
.article-editor {
  --editor-bg: var(--cc-color-bg);
  --editor-surface: var(--cc-color-surface);
  --editor-border: var(--cc-color-border-light);
  --editor-text: var(--cc-color-text-1);
  --editor-text-secondary: var(--cc-color-text-3);
  --editor-primary: var(--cc-color-primary);
  --editor-primary-light: var(--cc-color-primary-softer);
  --editor-radius: 10px;
  --editor-shadow: 0 1px 2px rgba(0, 0, 0, 0.04), 0 3px 6px rgba(0, 0, 0, 0.04);
  --editor-shadow-hover: 0 2px 4px rgba(0, 0, 0, 0.06), 0 6px 16px rgba(0, 0, 0, 0.06);
  --editor-transition: 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  --footer-height: 68px;

  min-height: 100vh;
  background: var(--editor-bg);
  padding-bottom: calc(var(--footer-height) + 32px);
}

/* ======== Header ======== */
.editor-header {
  background: var(--editor-surface);
  border-bottom: 1px solid var(--editor-border);
  padding: 0 32px;
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(8px);
}

.header-info {
  max-width: 1400px;
  margin: 0 auto;
  padding: 16px 0 12px;
}

.header-meta {
  margin-bottom: 10px;
}

.mode-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.badge-add {
  color: var(--cc-color-success);
}
.badge-edit {
  color: var(--editor-primary);
}

.lang-alert {
  border-radius: 8px;
  margin-bottom: 0;
  border: 1px solid var(--cc-color-border-light);
  background: var(--cc-color-bg);
}

.lang-alert :deep(.el-alert__title) {
  font-size: 13px;
  color: var(--editor-text-secondary);
}

.lang-hint {
  color: var(--cc-color-text-4);
  font-size: 12px;
  margin-left: 10px;
}

.lang-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
}

.lang-bar-label {
  font-weight: 600;
  font-size: 13px;
  color: var(--editor-text);
}

.lang-select {
  width: 280px;
}

.btn-delete-trans {
  margin-left: auto;
}

/* ======== Form Body ======== */
.editor-form {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px 32px 0;
}

.form-body {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.form-primary {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-sidebar {
  width: 380px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: sticky;
  top: 100px;
}

/* ======== Field Groups ======== */
.field-group {
  background: var(--editor-surface);
  border: 1px solid var(--editor-border);
  border-radius: var(--editor-radius);
  padding: 20px 24px;
  box-shadow: var(--editor-shadow);
  transition: box-shadow var(--editor-transition);
}

.field-group:hover {
  box-shadow: var(--editor-shadow-hover);
}

.group-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--editor-border);
}

.group-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: var(--editor-primary-light);
  color: var(--editor-primary);
  font-size: 14px;
}

.group-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--editor-text);
  letter-spacing: -0.01em;
}

.group-count {
  margin-left: auto;
  font-size: 12px;
  color: var(--editor-text-secondary);
  background: var(--editor-bg);
  padding: 2px 8px;
  border-radius: 10px;
}

/* ======== Form Grids ======== */
.form-grid {
  display: grid;
  gap: 0 16px;
}

.form-grid-2col {
  grid-template-columns: 1fr 1fr;
}

.form-grid-3col {
  grid-template-columns: 1fr 1fr 1fr;
}

/* ======== Title Input ======== */
.field-title :deep(.el-form-item__label) {
  font-size: 13px;
}

.input-title :deep(.el-input__inner) {
  font-size: 18px;
  font-weight: 600;
  letter-spacing: -0.01em;
  border: none;
  border-bottom: 2px solid var(--editor-border);
  border-radius: 0;
  padding-left: 0;
  padding-right: 0;
  background: transparent;
  transition: border-color var(--editor-transition);
}

.input-title :deep(.el-input__inner):focus {
  border-color: var(--editor-primary);
  box-shadow: none;
}

.input-title :deep(.el-input__inner)::placeholder {
  font-weight: 400;
  font-size: 16px;
  color: var(--cc-color-text-4);
}

/* ======== Checkbox Row ======== */
.checkbox-row {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.cb-item {
  height: auto;
}

.cb-item :deep(.el-checkbox__label) {
  font-size: 13px;
  color: var(--editor-text);
}

/* ======== Radio Groups ======== */
.jump-radio :deep(.el-radio-button__inner) {
  border-radius: 6px;
  padding: 6px 16px;
  font-size: 13px;
}

/* ======== Upload ======== */
.upload-box {
  width: 120px;
  height: 80px;
  border: 1.5px dashed var(--editor-border);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--editor-transition);
  background: var(--editor-bg);
  overflow: hidden;
}

.upload-box:hover {
  border-color: var(--editor-primary);
  background: var(--editor-primary-light);
}

.upload-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-placeholder {
  font-size: 24px;
  color: var(--cc-color-text-4);
  transition: color var(--editor-transition);
}

.upload-box:hover .upload-placeholder {
  color: var(--editor-primary);
}

.full-width-picker {
  width: 100%;
}

/* ======== Image Upload Card ======== */
.image-upload-item {
  margin-bottom: 0;
}

.image-upload-item .upload-box {
  width: 220px;
  height: 124px;
}

/* ======== Content Section (Flat) ======== */
.content-section {
  background: var(--editor-surface);
  border: 1px solid var(--editor-border);
  border-radius: var(--editor-radius);
  padding: 20px 24px;
  box-shadow: var(--editor-shadow);
}

.content-section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--editor-border);
}

.content-section-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: var(--editor-primary-light);
  color: var(--editor-primary);
  font-size: 14px;
}

.content-section-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--editor-text);
  letter-spacing: -0.01em;
}

.content-editor {
  margin-bottom: 0;
}

.content-editor :deep(.pro-editor),
.content-editor :deep(.gf-tiptap),
.content-editor :deep(.gf-tiptap > div),
.content-editor :deep(.gf-tiptap-content),
.content-editor :deep(.ProseMirror) {
  max-width: 100%;
  width: 100%;
  word-break: break-word;
  overflow-wrap: break-word;
}

/* ======== Sidebar ======== */
.field-group-sidebar {
  padding: 16px 20px;
}

/* ======== Sidebar Status ======== */
.sidebar-status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  margin-bottom: 8px;
  border-bottom: 1px solid var(--editor-bg);
}

.status-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--editor-text-secondary);
}

.status-badge {
  font-size: 13px;
}

.field-group-sidebar .group-header {
  margin-bottom: 12px;
  padding-bottom: 10px;
}

.sidebar-notice {
  margin-bottom: -4px;
}

.sidebar-notice :deep(.el-alert) {
  border-radius: 8px;
}

/* ======== Module Fields ======== */
.module-fields-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.module-field-item {
  padding: 10px 0;
  border-bottom: 1px solid var(--editor-bg);
}

.module-field-item:last-child {
  border-bottom: none;
}

.mf-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.mf-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--editor-text);
}

.mf-tag {
  font-size: 11px;
  height: 20px;
  padding: 0 6px;
}

.mf-control {
  width: 100%;
}

/* ======== Field Hint ======== */
.field-hint {
  font-size: 12px;
  color: var(--editor-text-secondary);
  margin-top: 6px;
  line-height: 1.4;
}

/* ======== Channel Hint ======== */
.channel-hint {
  margin-left: 8px;
  font-size: 12px;
  color: var(--editor-text-secondary);
}

/* ======== Form Item Overrides ======== */
.field-group :deep(.el-form-item) {
  margin-bottom: 16px;
}

.field-group :deep(.el-form-item__label) {
  font-size: 13px;
  font-weight: 500;
  color: var(--editor-text-secondary);
  padding-bottom: 4px;
}

.field-group :deep(.el-input__wrapper),
.field-group :deep(.el-textarea__inner),
.field-group :deep(.el-select .el-input__wrapper) {
  box-shadow: 0 0 0 1px var(--editor-border) inset;
  border-radius: 6px;
  transition: all var(--editor-transition);
}

.field-group :deep(.el-input__wrapper:hover),
.field-group :deep(.el-textarea__inner:hover) {
  box-shadow: 0 0 0 1px var(--cc-color-border-strong) inset;
}

.field-group :deep(.el-input__wrapper.is-focus),
.field-group :deep(.el-textarea__inner:focus) {
  box-shadow:
    0 0 0 2px var(--cc-color-primary-soft) inset,
    0 0 0 1px var(--editor-primary) inset;
}

.field-group :deep(.el-textarea__inner) {
  border-radius: 6px;
  padding: 10px 12px;
  line-height: 1.6;
}

/* ======== Footer ======== */
.editor-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: var(--footer-height);
  background: var(--editor-surface);
  border-top: 1px solid var(--editor-border);
  z-index: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.04);
}

.footer-inner {
  width: 100%;
  max-width: 1400px;
  padding: 0 32px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* ======== Stagger Animation ======== */
.form-primary > .field-group {
  animation: cardIn 0.35s cubic-bezier(0.22, 0.61, 0.36, 1) both;
}

.form-primary > .field-group:nth-child(1) {
  animation-delay: 0s;
}
.form-primary > .field-group:nth-child(2) {
  animation-delay: 0.05s;
}

.content-section {
  animation: cardIn 0.35s cubic-bezier(0.22, 0.61, 0.36, 1) 0.1s both;
}

.form-sidebar > .field-group:nth-child(1) {
  animation: cardIn 0.35s cubic-bezier(0.22, 0.61, 0.36, 1) 0.15s both;
}
.form-sidebar > .field-group:nth-child(3) {
  animation: cardIn 0.35s cubic-bezier(0.22, 0.61, 0.36, 1) 0.2s both;
}
.form-sidebar > .field-group:nth-child(4) {
  animation: cardIn 0.35s cubic-bezier(0.22, 0.61, 0.36, 1) 0.25s both;
}

@keyframes cardIn {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ======== Responsive ======== */
@media (max-width: 1200px) {
  .form-body {
    flex-direction: column;
  }

  .form-sidebar {
    width: 100%;
    position: static;
  }

  .form-grid-3col {
    grid-template-columns: 1fr 1fr;
  }

  .form-grid-2col {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 1024px) {
  .editor-form {
    padding: 16px;
  }

  .editor-header {
    padding: 0 16px;
  }

  .form-grid-3col {
    grid-template-columns: 1fr;
  }

  .footer-inner {
    padding: 0 16px;
  }
}

.seo-panel {
  margin-top: 16px;
  padding: 12px;
  background: var(--cc-color-bg);
  border-radius: var(--cc-radius-md);
}
.seo-header {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 10px;
}
.seo-score {
  font-size: 24px;
  font-weight: 700;
  text-align: center;
  padding: 8px;
  border-radius: var(--cc-radius-sm);
  margin-bottom: 10px;
}
.seo-green {
  color: var(--cc-color-success);
  background: var(--cc-color-success-soft);
}
.seo-yellow {
  color: var(--cc-color-warning);
  background: var(--cc-color-warning-soft);
}
.seo-red {
  color: var(--cc-color-danger);
  background: var(--cc-color-danger-soft);
}
.seo-item {
  margin-bottom: 8px;
}
.seo-item-header {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--cc-color-text-3);
  margin-bottom: 2px;
}
.seo-bar-bg {
  height: 6px;
  background: var(--cc-color-border-light);
  border-radius: 3px;
  overflow: hidden;
}
.seo-bar {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s;
}
.seo-tips {
  margin-top: 8px;
}
.seo-tip {
  font-size: 12px;
  color: var(--cc-color-text-3);
  padding: 2px 0;
}
.seo-empty {
  text-align: center;
  color: var(--cc-color-text-4);
  font-size: 13px;
  padding: 20px 0;
}
.seo-bar.seo-green {
  background: var(--cc-color-success);
}
.seo-bar.seo-yellow {
  background: var(--cc-color-warning);
}
.seo-bar.seo-red {
  background: var(--cc-color-danger);
}
</style>
