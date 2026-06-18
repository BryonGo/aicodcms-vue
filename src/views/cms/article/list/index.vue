<template>
  <ProPage :title="pageTitle" :subtitle="pageSubtitle">
    <template #actions>
      <template v-if="!isTrashMode">
        <el-button
          type="primary"
          :icon="Plus"
          v-auth="'api/v1/admin/article/add'"
          @click="handleAdd"
        >
          {{ $t("message.common.btnAdd") }}
        </el-button>
      </template>
    </template>

    <!-- 文章 / 回收站 Tab 栏 -->
    <nav class="tab-bar">
      <button
        class="tab-item"
        :class="{ active: activeTab === 'article' }"
        @click="switchTab('article')"
      >
        {{ $t("message.cms.articleList.tabArticle") }}
      </button>
      <button
        class="tab-item tab-item-warn"
        :class="{ active: activeTab === 'trash' }"
        @click="switchTab('trash')"
      >
        <el-icon class="tab-icon"><DeleteFilled /></el-icon>
        {{ $t("message.cms.articleList.tabRecycle") }}
      </button>
    </nav>

    <!-- ============ 文章列表 Tab ============ -->
    <div v-show="activeTab === 'article'" class="tab-content">
      <ProSearch
        v-model="queryParams"
        :fields="searchFields"
        collapsible
        :collapse-threshold="2"
        @search="onSearch"
        @reset="onReset"
      />

      <!-- 爬虫筛选 -->
      <div class="crawler-filter" v-if="!isTrashMode">
        <div class="crawler-filter-inner">
          <span class="crawler-filter-label">{{ $t("message.cms.articleList.colCrawler") }}</span>
          <span
            v-for="(label, key) in crawlerBotTags"
            :key="key"
            class="crawler-opt"
            :class="{
              active: crawlerFilterState[key] === true,
              exclude: crawlerFilterState[key] === false,
            }"
            @click="toggleCrawlerFilter(key)"
            >{{ label }}</span
          >
          <button v-if="hasCrawlerFilter" class="crawler-clear" @click="clearCrawlerFilter">
            {{ $t("message.cms.articleList.btnClear") }}
          </button>
        </div>
      </div>

      <!-- 主区域：侧栏树 + 表格 -->
      <el-row :gutter="12">
        <!-- 左侧栏目树 -->
        <el-col :span="sidebarShow ? 4 : 0">
          <div v-show="sidebarShow" class="tree-panel">
            <div class="tree-header">
              <span class="tree-title">{{ $t("message.cms.articleList.sidebarTitle") }}</span>
              <button class="tree-clear" @click="clearTreeFilter">
                <el-icon><Close /></el-icon>
              </button>
            </div>
            <div class="tree-search-wrapper">
              <el-input
                v-model="channelFilter"
                :placeholder="$t('message.cms.articleList.searchChannel')"
                size="small"
                clearable
              />
            </div>
            <div class="tree-scroll">
              <el-tree
                ref="treeRef"
                :data="state.channel_tree"
                :props="{ id: 'id', children: 'children', label: 'name' }"
                :filter-node-method="channel_tree_filter_node"
                check-strictly
                default-expand-all
                highlight-current
                node-key="id"
                show-checkbox
                @check="handleTreeCheck"
              />
            </div>
          </div>
        </el-col>

        <!-- 右侧表格 -->
        <el-col :span="sidebarShow ? 20 : 24">
          <div class="toolbar-card">
            <ProToolbar @refresh="cmsArticleList">
              <template #left>
              <el-button
                :icon="Hide"
                @click="sidebarShow = !sidebarShow"
                :title="$t('message.cms.articleList.toggleSidebar')"
              />
              <span v-if="state.ids.length" class="sel-count">
                {{ state.ids.length }}{{ $t("message.cms.articleList.selectedCount") }}
              </span>
              <el-button
                type="danger"
                :icon="Delete"
                v-auth="'api/v1/admin/article/del'"
                :disabled="!state.ids.length"
                @click="handleDelete(null)"
                >{{ $t("message.common.btnDelete") }}</el-button
              >
              <el-button :disabled="!state.ids.length" @click="batchDialog = 'channel'">{{
                $t("message.cmsArticle.moveChannel")
              }}</el-button>
              <el-button :disabled="!state.ids.length" @click="batchDialog = 'tags'">{{
                $t("message.cmsArticle.setTags")
              }}</el-button>
              <el-button :disabled="!state.ids.length" @click="batchDialog = 'status'">{{
                $t("message.cmsArticle.setStatus")
              }}</el-button>
            </template>
          </ProToolbar>

          <ProTable
            :data="filteredTableData"
            :loading="loading"
            :total="state.tableData.total"
            :page="state.tableData.param.page"
            :page-size="state.tableData.param.row"
            :max-height="tableMaxHeight"
            selection
            @selection-change="handleSelectionChange"
            @pagination="onPageChange"
          >
            <el-table-column
              :label="$t('message.cms.articleList.colCover')"
              width="72"
              align="center"
            >
              <template #default="{ row }">
                <el-popover placement="right" trigger="hover" :width="320" v-if="row.image">
                  <img :src="proxy.getUpFileUrl(row.image)" class="cover-preview-img" />
                  <template #reference>
                    <img :src="proxy.getUpFileUrl(row.image)" class="cover-thumb" />
                  </template>
                </el-popover>
                <span v-else class="cover-none">—</span>
              </template>
            </el-table-column>
            <el-table-column
              :label="$t('message.common.colId')"
              width="60"
              prop="id"
              align="center"
              class-name="col-id"
            />
            <el-table-column
              :label="$t('message.cms.blockEdit.colTitle')"
              min-width="200"
              show-overflow-tooltip
            >
              <template #default="{ row }">
                <span class="article-title">{{ row.title }}</span>
                <span
                  class="flag-tags"
                  v-if="row.is_top || row.is_slide || row.is_hot || row.is_new || row.is_recommend"
                >
                  <span v-if="row.is_top" class="flag-tag flag-top">{{
                    $t("message.cms.articleList.tagTop")
                  }}</span>
                  <span v-if="row.is_recommend" class="flag-tag flag-rec">{{
                    $t("message.cms.articleList.tagRecommend")
                  }}</span>
                  <span v-if="row.is_hot" class="flag-tag flag-hot">{{
                    $t("message.cms.articleList.flagHot")
                  }}</span>
                  <span v-if="row.is_new" class="flag-tag flag-new">{{
                    $t("message.cms.articleList.flagNew")
                  }}</span>
                  <span v-if="row.is_slide" class="flag-tag flag-slide">{{
                    $t("message.cms.articleList.tagSlide")
                  }}</span>
                </span>
              </template>
            </el-table-column>
            <el-table-column
              :label="$t('message.cms.articleList.colLangs')"
              width="120"
              align="center"
            >
              <template #default="{ row }">
                <div class="lang-flags">
                  <span
                    v-for="l in allLangFlags"
                    :key="l.code"
                    class="lang-flag"
                    :class="{ active: row.trans_langs?.includes(l.code) }"
                    :title="`${l.code}`"
                    >{{ l.flag }}</span
                  >
                  <span v-if="!allLangFlags.length" class="lang-none">—</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column
              :label="$t('message.cms.articleList.colChannel')"
              width="110"
              align="center"
            >
              <template #default="{ row }">
                <span class="chan-tag">{{ row.channel_info?.name }}</span>
              </template>
            </el-table-column>
            <el-table-column
              :label="$t('message.cms.articleList.colViews')"
              width="65"
              prop="views"
              align="center"
              class-name="col-views"
            />
            <el-table-column
              :label="$t('message.cms.articleList.colCrawler')"
              width="150"
              align="center"
            >
              <template #default="{ row }">
                <div class="spider-tags">
                  <span
                    v-for="(label, key) in crawlerBotTags"
                    :key="key"
                    class="spider-tag"
                    :class="{ active: row.crawler_status?.[key] }"
                    >{{ label }}</span
                  >
                  <span
                    v-if="!row.crawler_status || !Object.keys(row.crawler_status).length"
                    class="spider-none"
                    >—</span
                  >
                </div>
              </template>
            </el-table-column>
            <el-table-column :label="$t('message.common.colStatus')" width="80" align="center">
              <template #default="{ row }">
                <span class="status-dot" :class="row.status ? 'dot-pub' : 'dot-draft'"></span>
                {{
                  row.status
                    ? $t("message.cms.articleList.statusPublished")
                    : $t("message.cms.articleList.statusDraft")
                }}
              </template>
            </el-table-column>
            <el-table-column
              :label="$t('message.common.colCreateTime')"
              width="90"
              align="center"
              class-name="col-time"
            >
              <template #default="{ row }">
                {{ proxy.parseTime(row.created_at, "{d}/{m}") }}
              </template>
            </el-table-column>
            <el-table-column
              :label="$t('message.common.colOperation')"
              width="120"
              align="center"
              fixed="right"
            >
              <template #default="{ row }">
                <div class="row-actions">
                  <button
                    class="act-btn act-edit"
                    v-auth="'api/v1/admin/article/edit'"
                    @click="handleUpdate(row)"
                    :title="$t('message.common.btnEdit')"
                  >
                    <el-icon><EditPen /></el-icon>
                  </button>
                  <button
                    class="act-btn act-trans"
                    @click="handleTranslation(row)"
                    :title="$t('message.cms.articleList.translationManage')"
                  >
                    <el-icon><Notebook /></el-icon>
                  </button>
                  <button
                    class="act-btn act-del"
                    v-auth="'api/v1/admin/article/del'"
                    @click="handleDelete(row)"
                    :title="$t('message.common.btnDelete')"
                  >
                    <el-icon><Delete /></el-icon>
                  </button>
                </div>
              </template>
            </el-table-column>
          </ProTable>
          </div><!-- /.toolbar-card -->
        </el-col>
      </el-row>
    </div>

    <!-- ============ 回收站 Tab ============ -->
    <div v-show="activeTab === 'trash'" class="tab-content">
      <div class="trash-container">
        <div class="trash-stats">
          <div class="trash-stat-item">
            <span class="trash-stat-value">{{ state.tableData.total }}</span>
            <span class="trash-stat-label">{{ $t("message.cms.articleList.labelArticle") }}</span>
          </div>
          <div class="trash-stat-divider"></div>
          <div class="trash-stat-item">
            <span class="trash-stat-value">{{ checkedIds.length }}</span>
            <span class="trash-stat-label">{{ $t("message.cms.articleList.selected") }}</span>
          </div>
          <div style="flex: 1"></div>
          <div class="trash-actions">
            <button
              class="trash-btn trash-btn-warning"
              :disabled="!checkedIds.length"
              @click="handleRestore(null)"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <polyline points="1 4 1 10 7 10" />
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
              </svg>
              {{ $t("message.cms.articleList.batchRestore") }}
            </button>
            <button
              class="trash-btn trash-btn-danger"
              :disabled="!checkedIds.length"
              @click="handleHardDel(null)"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <polyline points="3 6 5 6 21 6" />
                <path
                  d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                />
              </svg>
              {{ $t("message.cms.articleList.btnHardDelete") }}
            </button>
            <button class="trash-btn trash-btn-ghost" @click="exitTrash">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" /></svg
              >{{ $t("message.common.backToList") }}
            </button>
          </div>
        </div>

        <div class="trash-notice">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <span>{{ $t("message.cms.articleList.trashHelp") }}</span>
        </div>

        <ProTable
          :data="state.tableData.data"
          :loading="loading"
          :total="state.tableData.total"
          :page="state.tableData.param.page"
          :page-size="state.tableData.param.row"
          @pagination="onPageChange"
          :empty-text="$t('message.cms.articleList.trashEmpty')"
        >
          <el-table-column width="40" align="center">
            <template #header>
              <input
                type="checkbox"
                :checked="isAllChecked"
                @change="toggleSelectAll"
                class="trash-checkbox"
              />
            </template>
            <template #default="{ row }">
              <input
                type="checkbox"
                :checked="checkedIds.includes(row.id)"
                @change="toggleRow(row)"
                class="trash-checkbox"
              />
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('message.cms.articleList.colCover')"
            width="72"
            align="center"
          >
            <template #default="{ row }">
              <div class="trash-cover" v-if="row.image">
                <img :src="proxy.getUpFileUrl(row.image)" />
              </div>
              <div class="trash-cover trash-cover-empty" v-else>—</div>
            </template>
          </el-table-column>
          <el-table-column :label="$t('message.cms.articleList.colTitle')" min-width="200">
            <template #default="{ row }">
              <div class="trash-title">{{ row.title }}</div>
              <div class="trash-meta">
                ID: {{ row.id }}
                <span
                  v-if="row.deleted_at === 0 && row.trans_langs?.length"
                  class="trash-tag-trash"
                  >{{ $t("message.cms.articleList.onlyTranslationDeleted") }}</span
                >
              </div>
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('message.cms.articleList.colChannel')"
            width="110"
            align="center"
          >
            <template #default="{ row }">
              <span class="trash-channel">{{ row.channel_info?.name || "—" }}</span>
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('message.cms.articleList.colTransLangs')"
            width="120"
            align="center"
          >
            <template #default="{ row }">
              <div class="trash-langs">
                <span
                  v-for="l in allLangFlags"
                  :key="l.code"
                  class="trash-lang-badge"
                  :class="{ 'trash-lang-exists': row.trans_langs?.includes(l.code) }"
                  :title="`${l.code}`"
                  >{{ l.flag }}</span
                >
                <span v-if="!allLangFlags.length" class="trash-lang-none">—</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('message.cms.articleList.colDeletedAt')"
            width="100"
            align="center"
          >
            <template #default="{ row }">
              <span class="trash-time">{{ proxy.parseTime(row.created_at, "{y}-{m}-{d}") }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('message.common.colOperation')" width="160" align="center">
            <template #default="{ row }">
              <div class="trash-actions-row">
                <button
                  class="trash-row-btn trash-row-btn-restore"
                  @click.stop="handleRestore(row)"
                >
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <polyline points="1 4 1 10 7 10" />
                    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                  </svg>
                  {{ $t("message.cms.articleList.btnRestore") }}
                </button>
                <button class="trash-row-btn trash-row-btn-delete" @click.stop="handleHardDel(row)">
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <polyline points="3 6 5 6 21 6" />
                    <path
                      d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                    /></svg
                  >{{ $t("message.common.delete") }}
                </button>
              </div>
            </template>
          </el-table-column>
        </ProTable>
      </div>
    </div>

    <!-- ============ 多语言选择弹窗 ============ -->
    <el-dialog
      v-model="transDialogVisible"
      :title="$t('message.cms.common.selectLanguage')"
      width="420px"
    >
      <div class="lang-dialog-body">
        <el-select
          v-model="transDialogLang"
          :placeholder="$t('message.cms.articleList.placeholderSelectLang')"
          size="large"
          style="width: 300px"
        >
          <el-option
            v-for="lang in transDialogLangs"
            :key="lang.code"
            :label="`${lang.flag} ${lang.code} — ${lang.nativeName}`"
            :value="lang.code"
          />
        </el-select>
      </div>
      <template #footer>
        <el-button @click="transDialogVisible = false">{{ $t("message.common.cancel") }}</el-button>
        <el-button type="primary" :disabled="!transDialogLang" @click="goToEditWithLang">{{
          $t("message.common.confirm")
        }}</el-button>
      </template>
    </el-dialog>

    <!-- ============ 批量操作弹窗 ============ -->
    <el-dialog :title="batchDialogTitle" v-model="batchDialogVisible" width="450px">
      <template v-if="batchDialog === 'channel'">
        <el-select
          v-model="batchChannelId"
          :placeholder="$t('message.cmsArticle.selectTargetChannel')"
          style="width: 100%"
        >
          <el-option v-for="c in channelTree" :key="c.id" :value="c.id" :label="c.name" />
        </el-select>
      </template>
      <template v-if="batchDialog === 'tags'">
        <el-input v-model="batchTags" :placeholder="$t('message.cmsArticle.inputTagsCsv')" />
      </template>
      <template v-if="batchDialog === 'status'">
        <el-select
          v-model="batchStatus"
          :placeholder="$t('message.cmsArticle.selectStatus')"
          style="width: 100%"
        >
          <el-option :label="$t('message.cmsArticle.published')" :value="1" />
          <el-option :label="$t('message.cmsArticle.draft')" :value="2" />
          <el-option :label="$t('message.cmsArticle.scheduled')" :value="3" />
        </el-select>
      </template>
      <template #footer>
        <el-button @click="batchDialogVisible = false">{{
          $t("message.cmsArticle.cancel")
        }}</el-button>
        <el-button type="primary" @click="onBatchConfirm" :loading="batchLoading">{{
          $t("message.cmsArticle.confirmExecute")
        }}</el-button>
      </template>
    </el-dialog>
  </ProPage>
</template>

<script lang="ts">
import {
  defineComponent,
  getCurrentInstance,
  onMounted,
  reactive,
  ref,
  computed,
  watch,
} from "vue";
import { useI18n } from "vue-i18n";
import { ElMessage, ElMessageBox } from "element-plus";
import { useRouter } from "vue-router";
import { useCmsCache } from "/@/stores/cmsCache";
import { getLanguageCatalog } from "/@/api/cms/setting";
import {
  listCmsArticle,
  delCmsArticle,
  getChannelTree,
  listTrashCmsArticle,
  restoreCmsArticle,
  hardDelCmsArticle,
  batchChannel as apiBatchChannel,
  batchTags as apiBatchTags,
  batchStatus as apiBatchStatus,
} from "/@/api/cms/article";
import {
  Plus,
  Delete,
  DeleteFilled,
  EditPen,
  Hide,
  Notebook,
  Close,
} from "@element-plus/icons-vue";
import ProPage from "/@/components/pro/ProPage.vue";
import ProSearch from "/@/components/pro/ProSearch.vue";
import ProToolbar from "/@/components/pro/ProToolbar.vue";
import ProTable from "/@/components/pro/ProTable.vue";
import type { ProSearchField } from "/@/components/pro/ProSearch.vue";

export default defineComponent({
  name: "apiV1CmsCmsArticleList",
  components: { ProPage, ProSearch, ProToolbar, ProTable },
  crawlerBotTags: {
    google: "G",
    baidu: "B",
    bing: "Bi",
    bytespider: "By",
    shenma: "S",
    sogou: "So",
  },
  crawlerBotColors: {
    google: "#4285F4",
    baidu: "#DE2910",
    bing: "#008373",
    bytespider: "#FF0050",
    shenma: "#FF6A00",
    sogou: "#FF4A00",
  },
  setup() {
    const { t } = useI18n();
    const { proxy } = <any>getCurrentInstance();
    const router = useRouter();
    const cmsCache = useCmsCache();
    const treeRef = ref();
    const loading = ref(false);
    const channelFilter = ref("");
    const checkedIds = ref<number[]>([]);
    const isTrashMode = ref(false);
    const activeTab = ref("article");
    const sidebarShow = ref(true);
    const crawlerBotTags: Record<string, string> = {
      google: "G",
      baidu: "B",
      bing: "Bi",
      bytespider: "By",
      shenma: "S",
      sogou: "So",
    };

    const { cms_article_attr, cms_article_pub_type } = proxy.useDict(
      "cms_article_attr",
      "cms_article_pub_type",
    );

    // ====== 搜索字段 ======
    const queryParams = reactive<Record<string, any>>({
      keywords: undefined,
      flag: undefined,
      status: undefined,
      channel_id: undefined,
    });

    const searchFields = computed<ProSearchField[]>(() => [
      {
        prop: "keywords",
        label: t("message.cms.articleList.searchPlaceholderTitle"),
        type: "input",
      },
      {
        prop: "flag",
        label: t("message.cms.articleList.searchPlaceholderAttribute"),
        type: "select",
        options: (cms_article_attr.value || []).map((d: any) => ({
          label: d.label,
          value: d.value,
        })),
      },
      {
        prop: "status",
        label: t("message.cms.articleList.searchPlaceholderStatus"),
        type: "select",
        options: (cms_article_pub_type.value || []).map((d: any) => ({
          label: d.label,
          value: d.value,
        })),
      },
    ]);

    // ====== 数据状态 ======
    const state = reactive({
      ids: [] as number[],
      channel_tree: [] as any[],
      tableData: {
        data: [] as any[],
        total: 0,
        param: { page: 1, row: 10 },
      },
    });

    const tableMaxHeight = computed(() =>
      sidebarShow.value ? "calc(100vh - 380px)" : "calc(100vh - 320px)",
    );

    // ====== 爬虫筛选 ======
    const crawlerFilterState = reactive<Record<string, boolean | undefined>>({});
    const hasCrawlerFilter = computed(() =>
      Object.values(crawlerFilterState).some((v) => v !== undefined),
    );
    const filteredTableData = computed(() => {
      if (!hasCrawlerFilter.value) return state.tableData.data;
      return state.tableData.data.filter((row: any) => {
        for (const [key, val] of Object.entries(crawlerFilterState)) {
          if (val === undefined) continue;
          const hasIt = row.crawler_status?.[key] === true;
          if (val === true && !hasIt) return false;
          if (val === false && hasIt) return false;
        }
        return true;
      });
    });
    function toggleCrawlerFilter(key: string) {
      const cur = crawlerFilterState[key];
      if (cur === undefined) crawlerFilterState[key] = true;
      else if (cur === true) crawlerFilterState[key] = false;
      else delete crawlerFilterState[key];
    }
    function clearCrawlerFilter() {
      Object.keys(crawlerFilterState).forEach((k) => delete crawlerFilterState[k]);
    }

    // ====== 页面标题 ======
    const pageTitle = computed(() =>
      isTrashMode.value
        ? t("message.cms.articleList.tabRecycle")
        : t("message.cms.articleList.breadcrumbs.article"),
    );
    const pageSubtitle = computed(
      () =>
        `${t("message.cms.articleList.breadcrumbs.home")} / ${t("message.cms.articleList.breadcrumbs.cms")} / ${pageTitle.value}`,
    );

    // ====== 数据加载 ======
    const cmsArticleList = async () => {
      loading.value = true;
      const params: Record<string, any> = {
        page: state.tableData.param.page,
        row: state.tableData.param.row,
        ...queryParams,
      };
      if (isTrashMode.value) params.is_trash = true;
      const api = isTrashMode.value ? listTrashCmsArticle : listCmsArticle;
      try {
        const res = await api(params);
        state.tableData.data = res.data.list ?? [];
        state.tableData.total = res.data.total || 0;
      } catch (_e) {
        state.tableData.data = [];
        state.tableData.total = 0;
      } finally {
        loading.value = false;
      }
    };

    const onSearch = () => {
      state.tableData.param.page = 1;
      cmsArticleList();
    };

    const onReset = () => {
      Object.assign(queryParams, {
        keywords: undefined,
        flag: undefined,
        status: undefined,
        channel_id: undefined,
      });
      state.tableData.param.page = 1;
      cmsArticleList();
    };

    const onPageChange = (p: { page: number; limit: number }) => {
      state.tableData.param.page = p.page;
      state.tableData.param.row = p.limit;
      cmsArticleList();
    };

    // ====== Tab 切换 ======
    const switchTab = (tab: string) => {
      activeTab.value = tab;
      isTrashMode.value = tab === "trash";
      state.tableData.param.page = 1;
      cmsArticleList();
    };

    const exitTrash = () => switchTab("article");

    // ====== 选择 ======
    const handleSelectionChange = (selection: any[]) => {
      state.ids = selection.map((item: any) => item.id);
    };

    const isAllChecked = computed(
      () =>
        state.tableData.data.length > 0 &&
        state.tableData.data.every((r: any) => checkedIds.value.includes(r.id)),
    );
    const toggleSelectAll = () => {
      if (isAllChecked.value) checkedIds.value = [];
      else checkedIds.value = state.tableData.data.map((r: any) => r.id);
    };
    const toggleRow = (row: any) => {
      const idx = checkedIds.value.indexOf(row.id);
      if (idx >= 0) checkedIds.value.splice(idx, 1);
      else checkedIds.value.push(row.id);
    };

    // ====== 树筛选 ======
    const channel_tree_filter_node = (value: string, data: any) =>
      !value || data.name.includes(value);
    const handleTreeCheck = (_data: any, treeStatus: any) => {
      const keys = treeStatus.checkedKeys || [];
      queryParams.channel_id = keys.length ? keys : undefined;
      state.tableData.param.page = 1;
      cmsArticleList();
    };
    const clearTreeFilter = () => {
      treeRef.value?.setCheckedKeys([]);
      queryParams.channel_id = undefined;
      cmsArticleList();
    };

    watch(channelFilter, (val) => {
      treeRef.value?.filter(val);
    });

    // ====== 多语言标志 ======
    const allLangFlags = ref<{ code: string; flag: string }[]>([]);
    getLanguageCatalog("active").then((res: any) => {
      const activeInfos = res?.data?.activeInfos || [];
      const defaultLang = res?.data?.default || "zh-CN";
      allLangFlags.value = activeInfos
        .filter((l: any) => l.code !== defaultLang)
        .map((l: any) => ({ code: l.code, flag: l.flag }));
    });

    // ====== 操作 ======
    const handleAdd = () => router.push({ path: "/cms/article/list/add" });
    const handleUpdate = (row: any) =>
      router.push({ path: "/cms/article/list/edit", query: { id: row.id } });

    const transDialogVisible = ref(false);
    const transDialogLang = ref("");
    const transDialogLangs = ref<any[]>([]);
    const transDialogArticleId = ref(0);
    const handleTranslation = async (row: any) => {
      transDialogArticleId.value = row.id;
      transDialogLang.value = "";
      const res: any = await getLanguageCatalog("active");
      transDialogLangs.value = (res?.data?.activeInfos || []).filter(
        (l: any) => l.code !== "zh-CN",
      );
      transDialogVisible.value = true;
    };
    const goToEditWithLang = () => {
      if (!transDialogLang.value || !transDialogArticleId.value) return;
      router.push({
        path: "/cms/article/list/edit",
        query: { id: transDialogArticleId.value, lang: transDialogLang.value },
      });
      transDialogVisible.value = false;
    };

    const handleDelete = (row: any | null) => {
      const ids = row ? [row.id] : state.ids;
      if (!ids.length) {
        ElMessage.error(t("message.common.msgSelectDelete"));
        return;
      }
      ElMessageBox.confirm(
        t("message.cms.articleList.confirmDelete"),
        t("message.common.confirmTitle"),
        {
          confirmButtonText: t("message.common.confirm"),
          cancelButtonText: t("message.common.cancel"),
          type: "warning",
        },
      )
        .then(() =>
          delCmsArticle(ids).then(() => {
            ElMessage.success(t("message.common.msgDeleteOk"));
            cmsCache.invalidateByPrefix("");
            cmsArticleList();
          }),
        )
        .catch(() => {});
    };

    const handleRestore = (row: any | null) => {
      const ids = row ? [row.id] : checkedIds.value;
      if (!ids.length) {
        ElMessage.warning(t("message.cms.articleList.msgSelectRestore"));
        return;
      }
      ElMessageBox.confirm(
        t("message.cms.articleList.confirmRestore"),
        t("message.common.confirmTitle"),
        {
          confirmButtonText: t("message.common.confirm"),
          cancelButtonText: t("message.common.cancel"),
          type: "info",
        },
      )
        .then(() =>
          restoreCmsArticle(ids).then(() => {
            ElMessage.success(t("message.cms.articleList.msgRestoreOk"));
            cmsCache.invalidateByPrefix("");
            checkedIds.value = [];
            cmsArticleList();
          }),
        )
        .catch(() => {});
    };

    const handleHardDel = (row: any | null) => {
      const ids = row ? [row.id] : checkedIds.value;
      if (!ids.length) {
        ElMessage.warning(t("message.cms.articleList.msgSelectHardDelete"));
        return;
      }
      ElMessageBox.confirm(
        t("message.cms.articleList.confirmHardDelete"),
        t("message.cms.articleList.confirmWarning"),
        {
          confirmButtonText: t("message.common.confirm"),
          cancelButtonText: t("message.common.cancel"),
          type: "warning",
        },
      )
        .then(() =>
          hardDelCmsArticle(ids).then(() => {
            ElMessage.success(t("message.cms.articleList.msgHardDeleteOk"));
            checkedIds.value = [];
            cmsArticleList();
          }),
        )
        .catch(() => {});
    };

    // ====== 批量操作 ======
    const batchDialog = ref<string | null>(null);
    const batchDialogVisible = ref(false);
    const batchLoading = ref(false);
    const batchChannelId = ref();
    const batchTags = ref("");
    const batchStatus = ref();
    const channelTree = ref<any[]>([]);

    const batchDialogTitle = computed(() => {
      const map: Record<string, string> = {
        channel: t("message.cmsArticle.moveChannel"),
        tags: t("message.cmsArticle.setTags"),
        status: t("message.cmsArticle.setStatus"),
      };
      return map[batchDialog.value || ""] || "";
    });

    watch(batchDialog, (val) => {
      batchDialogVisible.value = !!val;
      if (!val) batchLoading.value = false;
    });

    const onBatchConfirm = async () => {
      batchLoading.value = true;
      const ids = state.ids;
      try {
        if (batchDialog.value === "channel")
          await apiBatchChannel({ ids, channel_id: batchChannelId.value });
        else if (batchDialog.value === "tags") await apiBatchTags({ ids, tags: batchTags.value });
        else if (batchDialog.value === "status")
          await apiBatchStatus({ ids, status: batchStatus.value });
        ElMessage.success(t("message.cmsArticle.batchSuccess"));
        batchDialog.value = null;
        cmsArticleList();
      } catch (_e) {
        // 拦截器处理消息
      } finally {
        batchLoading.value = false;
      }
    };

    // ====== 初始化 ======
    onMounted(() => {
      getChannelTree().then((res: any) => {
        state.channel_tree = res.data.channel_tree || [];
        cmsCache.setChannelTree(state.channel_tree);
        channelTree.value = res.data.channel_tree || [];
      });
      cmsArticleList();
    });

    return {
      proxy,
      treeRef,
      loading,
      sidebarShow,
      isTrashMode,
      activeTab,
      channelFilter,
      tableMaxHeight,
      allLangFlags,
      pageTitle,
      pageSubtitle,
      crawlerBotTags,
      queryParams,
      searchFields,
      state,
      checkedIds,
      isAllChecked,
      crawlerFilterState,
      hasCrawlerFilter,
      toggleCrawlerFilter,
      clearCrawlerFilter,
      filteredTableData,
      cmsArticleList,
      onSearch,
      onReset,
      onPageChange,
      switchTab,
      exitTrash,
      handleSelectionChange,
      toggleSelectAll,
      toggleRow,
      channel_tree_filter_node,
      handleTreeCheck,
      clearTreeFilter,
      handleAdd,
      handleUpdate,
      handleTranslation,
      handleDelete,
      handleRestore,
      handleHardDel,
      transDialogVisible,
      transDialogLangs,
      transDialogLang,
      goToEditWithLang,
      batchDialog,
      batchDialogVisible,
      batchDialogTitle,
      batchLoading,
      batchChannelId,
      batchTags,
      batchStatus,
      channelTree,
      onBatchConfirm,
    };
  },
});
</script>

<style scoped>
/* ===== Design token bridge ===== */
.artl-page {
  --bg: var(--cc-color-bg);
  --surface: var(--cc-color-surface);
  --border: var(--cc-color-border-light);
  --text: var(--cc-color-text-1);
  --text2: var(--cc-color-text-3);
  --text3: var(--cc-color-text-4);
  --primary: var(--cc-color-primary);
  --primary-light: var(--cc-color-primary-softer);
  --radius: var(--cc-radius-md);
  --trans: 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  --green: var(--cc-color-success);
  --amber: var(--cc-color-warning);
  --amber-bg: var(--cc-color-warning-soft);
  --red: var(--cc-color-danger);
  --red-bg: var(--cc-color-danger-soft);
}
.tab-content {
  animation: fadeUp 0.3s ease both;
}

/* ===== 搜索区卡片化 ===== */
.tab-content :deep(.pro-search) {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 12px 16px;
  margin-bottom: 10px;
}

/* ===== Tab Bar ===== */
.tab-bar {
  display: flex;
  gap: 0;
  border-bottom: 2px solid var(--border);
  margin-bottom: 16px;
}
.tab-item {
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text2);
  border: none;
  background: none;
  cursor: pointer;
  position: relative;
  transition: color var(--trans);
  display: inline-flex;
  align-items: center;
  gap: 5px;
}
.tab-item::after {
  content: "";
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--primary);
  transform: scaleX(0);
  transition: transform var(--trans);
}
.tab-item.active {
  color: var(--primary);
}
.tab-item.active::after {
  transform: scaleX(1);
}
.tab-item:hover {
  color: var(--text);
}
.tab-item-warn.active {
  color: var(--amber);
}
.tab-item-warn.active::after {
  background: var(--amber);
}
.tab-icon {
  font-size: 14px;
}

/* ===== Crawler Filter ===== */
.crawler-filter {
  padding: 0;
  margin-bottom: 10px;
}
.crawler-filter-inner {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 8px 14px;
}
.crawler-filter-label {
  font-size: 12px;
  color: var(--text2);
  margin-right: 4px;
  white-space: nowrap;
}
.crawler-opt {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  color: var(--text3);
  background: var(--bg);
  transition: all 0.15s;
  border: 1px solid transparent;
}
.crawler-opt:hover {
  border-color: var(--text2);
}
.crawler-opt.active {
  color: #fff;
  background: var(--tag-color, var(--cc-color-primary));
  border-color: transparent;
}
.crawler-opt.exclude {
  color: var(--text3);
  background: var(--bg);
  border-color: var(--border);
  text-decoration: line-through;
  opacity: 0.6;
}
.crawler-clear {
  font-size: 11px;
  color: var(--primary);
  cursor: pointer;
  border: none;
  background: none;
  padding: 2px 6px;
}
.crawler-clear:hover {
  text-decoration: underline;
}

/* ===== Table area card ===== */
.toolbar-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
}
.toolbar-card :deep(.pro-toolbar) {
  border-bottom: 1px solid var(--border);
  padding: 8px 12px;
  margin-bottom: 0;
}
.toolbar-card :deep(.el-table) {
  border-radius: 0;
}
.tab-content :deep(.pro-toolbar) {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius) var(--radius) 0 0;
  padding: 8px 12px;
  margin-bottom: 0;
}
.tab-content :deep(.el-table) {
  border: 1px solid var(--border);
  border-top: none;
  border-radius: 0 0 var(--radius) var(--radius);
}
.tab-content :deep(.el-table__inner-wrapper) {
  border-radius: 0 0 var(--radius) var(--radius);
}

/* ===== Tree Panel ===== */
.tree-panel {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
}
.tree-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px 4px;
}
.tree-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
}
.tree-clear {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 4px;
  border: none;
  background: var(--bg);
  color: var(--text2);
  cursor: pointer;
}
.tree-search-wrapper {
  padding: 0 12px 8px;
}
.tree-scroll {
  max-height: calc(100vh - 400px);
  overflow: auto;
}

/* ===== Selection Count ===== */
.sel-count {
  font-size: 12px;
  color: var(--primary);
  font-weight: 500;
  padding: 0 4px;
}

/* ===== Cover ===== */
.cover-thumb {
  width: 48px;
  height: 34px;
  border-radius: 5px;
  object-fit: cover;
  display: block;
  margin: 0 auto;
}
.cover-preview-img {
  max-width: 300px;
  max-height: 240px;
  border-radius: 6px;
  display: block;
}
.cover-none {
  color: var(--text3);
  font-size: 12px;
}

/* ===== Title & Flags ===== */
.article-title {
  font-weight: 500;
  color: var(--text);
}
.flag-tags {
  display: inline-flex;
  gap: 3px;
  margin-left: 8px;
  vertical-align: middle;
}
.flag-tag {
  display: inline-block;
  padding: 1px 5px;
  font-size: 10px;
  font-weight: 600;
  border-radius: 3px;
  line-height: 1.5;
}
.flag-top {
  background: #fde8e8;
  color: #c0392b;
}
.flag-rec {
  background: var(--cc-color-primary-softer);
  color: var(--primary);
}
.flag-hot {
  background: #fde8ec;
  color: #e74c3c;
}
.flag-new {
  background: #e8f8e8;
  color: var(--green);
}
.flag-slide {
  background: #fef3e2;
  color: var(--amber);
}

/* ===== Language Flags ===== */
.lang-flags {
  display: flex;
  gap: 4px;
  justify-content: center;
  flex-wrap: wrap;
}
.lang-flag {
  font-size: 14px;
  opacity: 0.25;
  filter: grayscale(1);
  cursor: default;
  transition: all var(--trans);
}
.lang-flag.active {
  opacity: 1;
  filter: none;
}
.lang-none {
  color: var(--text3);
  font-size: 12px;
}

/* ===== Channel Tag ===== */
.chan-tag {
  display: inline-block;
  padding: 2px 8px;
  background: var(--primary-light);
  color: var(--primary);
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

/* ===== Status Dot ===== */
.status-dot {
  display: inline-block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  margin-right: 4px;
  vertical-align: middle;
}
.dot-pub {
  background: var(--green);
}
.dot-draft {
  background: var(--text3);
}

/* ===== Row Actions ===== */
.row-actions {
  display: flex;
  gap: 2px;
  justify-content: center;
}
.act-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 5px;
  border: 1px solid transparent;
  background: transparent;
  font-size: 14px;
  cursor: pointer;
  transition: all var(--trans);
}
.act-edit {
  color: var(--primary);
}
.act-edit:hover {
  background: var(--primary-light);
  border-color: var(--border);
}
.act-trans {
  color: var(--amber);
}
.act-trans:hover {
  background: var(--amber-bg);
  border-color: var(--border);
}
.act-del {
  color: var(--red);
}
.act-del:hover {
  background: var(--red-bg);
  border-color: var(--border);
}
.col-id :deep(.cell) {
  color: var(--text3);
  font-size: 12px;
}

/* ===== spider-tag override using $options.crawlerBotColors is handled inline via :style --tag-color ===== */
.spider-tags {
  display: flex;
  gap: 2px;
  flex-wrap: wrap;
  justify-content: center;
}
.spider-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  color: var(--text3);
  background: var(--bg);
  transition: all 0.2s;
}
.spider-tag.active {
  color: #fff;
  background: var(--tag-color, #666);
}
.spider-none {
  color: var(--text3);
  font-size: 12px;
}

/* ===== Trash ===== */
.trash-container {
  padding: 0;
}
.trash-stats {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 16px;
  background: linear-gradient(135deg, #fdf6ec 0%, #fef3e2 100%);
  border: 1px solid #f5e6d3;
  border-radius: 8px;
  margin-bottom: 12px;
}
.trash-stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.trash-stat-value {
  font-size: 22px;
  font-weight: 700;
  color: var(--amber);
  line-height: 1.2;
}
.trash-stat-label {
  font-size: 11px;
  color: #b88a4a;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.trash-stat-divider {
  width: 1px;
  height: 32px;
  background: #e8d5b8;
}
.trash-actions {
  display: flex;
  gap: 8px;
}
.trash-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 14px;
  border-radius: 6px;
  border: 1px solid transparent;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  background: white;
}
.trash-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.trash-btn-warning {
  background: var(--amber);
  color: white;
  border-color: var(--amber);
}
.trash-btn-warning:hover:not(:disabled) {
  background: #d48a1a;
}
.trash-btn-danger {
  color: var(--red);
  border-color: #fbc4c4;
}
.trash-btn-danger:hover:not(:disabled) {
  background: var(--red-bg);
}
.trash-btn-ghost {
  color: var(--cc-color-text-3);
  border-color: var(--border);
}
.trash-btn-ghost:hover {
  color: var(--primary);
  border-color: var(--border);
  background: var(--primary-light);
}
.trash-notice {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: var(--cc-color-bg);
  border-radius: 6px;
  font-size: 12px;
  color: var(--cc-color-text-3);
  margin-bottom: 12px;
}
.trash-checkbox {
  width: 14px;
  height: 14px;
  accent-color: var(--primary);
  cursor: pointer;
}
.trash-title {
  font-weight: 500;
  color: var(--text);
  margin-bottom: 2px;
}
.trash-meta {
  font-size: 11px;
  color: var(--text3);
  display: flex;
  align-items: center;
  gap: 6px;
}
.trash-cover {
  width: 48px;
  height: 34px;
  border-radius: 5px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
.trash-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.trash-cover-empty {
  background: var(--cc-color-bg);
  color: var(--text3);
  font-size: 11px;
}
.trash-channel {
  display: inline-block;
  padding: 2px 8px;
  background: #f0f9eb;
  color: var(--green);
  border-radius: 4px;
  font-size: 12px;
}
.trash-langs {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}
.trash-lang-badge {
  font-size: 15px;
  opacity: 0.25;
  filter: grayscale(1);
  transition: all 0.2s;
  cursor: default;
}
.trash-lang-exists {
  opacity: 1;
  filter: none;
}
.trash-lang-none {
  color: var(--text3);
  font-size: 12px;
}
.trash-tag-trash {
  font-size: 10px;
  color: var(--amber);
  background: var(--amber-bg);
  padding: 0 5px;
  border-radius: 3px;
  font-weight: 500;
}
.trash-time {
  font-size: 12px;
  color: var(--text2);
}
.trash-actions-row {
  display: flex;
  gap: 4px;
}
.trash-row-btn {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 4px 10px;
  border-radius: 4px;
  border: 1px solid transparent;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s;
  background: transparent;
}
.trash-row-btn-restore {
  color: var(--amber);
  border-color: #f5d9b3;
}
.trash-row-btn-restore:hover {
  background: var(--amber-bg);
  border-color: var(--amber);
}
.trash-row-btn-delete {
  color: var(--red);
  border-color: #fbc4c4;
}
.trash-row-btn-delete:hover {
  background: var(--red-bg);
  border-color: var(--red);
}
.lang-dialog-body {
  text-align: center;
  padding: 10px 0;
}

/* ===== Animations ===== */
@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
