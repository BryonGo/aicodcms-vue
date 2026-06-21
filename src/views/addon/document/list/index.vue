<template>
  <ProPage :title="$t('message.document.title')" :subtitle="$t('message.document.subtitle')">
    <template #actions>
      <el-button plain :icon="FolderAdd" @click="openCategoryDialog()">
        {{ $t("message.document.addCategory") }}
      </el-button>
      <el-button plain :icon="RefreshRight" :loading="syncing" @click="handleSyncSource">
        {{ $t("message.document.syncSource") }}
      </el-button>
      <el-button type="primary" :icon="Plus" @click="openDocumentDialog()">
        {{ $t("message.document.addDocument") }}
      </el-button>
    </template>

    <div class="document-layout">
      <el-card class="document-sidebar" shadow="never">
        <el-tabs v-model="categoryLang" @tab-change="onLangTabChange" class="category-tabs">
          <el-tab-pane :label="$t('message.document.langZhCn')" name="zh-CN" />
          <el-tab-pane :label="$t('message.document.langEnUs')" name="en-US" />
        </el-tabs>
        <div class="sidebar-toolbar">
          <el-button link type="primary" size="small" @click="openCategoryDialogWithLang()">
            + {{ $t("message.document.addCategory") }}
          </el-button>
          <el-button link size="small" @click="loadCategories">
            {{ $t("message.document.refresh") }}
          </el-button>
        </div>
        <el-tree
          ref="categoryTreeRef"
          :data="categoryTree"
          node-key="id"
          :props="treeProps"
          default-expand-all
          highlight-current
          draggable
          :allow-drop="allowDrop"
          @node-click="onCategorySelect"
          @node-drop="onNodeDrop"
        >
          <template #default="{ data }">
            <span class="category-node">
              <span class="category-drag-handle">⋮⋮</span>
              <span class="category-title">{{ data.name }}</span>
              <span class="category-actions">
                <el-button link size="small" type="primary" @click.stop="openCategoryDialog(data)">
                  {{ $t("message.common.edit") }}
                </el-button>
                <el-button link size="small" type="danger" @click.stop="removeCategory(data)">
                  {{ $t("message.common.delete") }}
                </el-button>
              </span>
            </span>
          </template>
        </el-tree>
      </el-card>

      <el-card class="document-main" shadow="never">
        <ProSearch v-model="query" :fields="searchFields" @search="onSearch" @reset="onReset" />

        <ProToolbar v-model:size="tableSize" @refresh="loadDocuments">
          <template #left>
            <el-button plain @click="clearCategory">
              {{ $t("message.document.allCategory") }}
            </el-button>
          </template>
        </ProToolbar>

        <ProTable
          :data="documents"
          :loading="loading"
          :size="tableSize"
          :total="total"
          :page="query.page"
          :page-size="query.limit"
          @pagination="onPageChange"
        >
          <el-table-column
            prop="title"
            :label="$t('message.document.docTitle')"
            min-width="220"
            show-overflow-tooltip
          />
          <el-table-column prop="slug" label="Slug" min-width="180" show-overflow-tooltip />
          <el-table-column
            prop="file_path"
            :label="$t('message.document.sourceFile')"
            min-width="240"
            show-overflow-tooltip
          />
          <el-table-column
            prop="lang"
            :label="$t('message.document.lang')"
            width="100"
            align="center"
          >
            <template #default="{ row }">{{ row.lang || $t("message.document.allLang") }}</template>
          </el-table-column>
          <el-table-column
            prop="weigh"
            :label="$t('message.common.colSort')"
            width="90"
            align="center"
          />
          <el-table-column
            prop="views"
            :label="$t('message.document.views')"
            width="90"
            align="center"
          />
          <el-table-column :label="$t('message.common.status')" width="110" align="center">
            <template #default="{ row }">
              <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small" effect="plain">
                {{
                  row.status === 1 ? $t("message.document.published") : $t("message.document.draft")
                }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('message.common.operation')"
            width="180"
            fixed="right"
            align="center"
          >
            <template #default="{ row }">
              <el-button link size="small" type="primary" @click="openDocumentDialog(row)">
                {{ $t("message.common.edit") }}
              </el-button>
              <el-button link size="small" type="danger" @click="removeDocument(row)">
                {{ $t("message.common.delete") }}
              </el-button>
            </template>
          </el-table-column>
        </ProTable>
      </el-card>
    </div>

    <el-drawer
      v-model="categoryDialogVisible"
      :title="
        categoryForm.id ? $t('message.document.editCategory') : $t('message.document.addCategory')
      "
      width="560px"
    >
      <el-form :model="categoryForm" label-width="120px">
        <el-form-item :label="$t('message.document.parentCategory')">
          <el-tree-select
            v-model="categoryForm.parent_id"
            :data="categoryOptions"
            :props="treeProps"
            node-key="id"
            check-strictly
            clearable
            :placeholder="$t('message.document.rootCategory')"
          />
        </el-form-item>
        <el-form-item :label="$t('message.document.categoryName')" required>
          <el-input v-model="categoryForm.name" />
        </el-form-item>
        <el-form-item label="Slug" required>
          <el-input v-model="categoryForm.slug" />
        </el-form-item>
        <el-form-item :label="$t('message.document.lang')">
          <el-select
            v-model="categoryForm.lang"
            clearable
            :placeholder="$t('message.document.allLang')"
            style="width: 100%"
          >
            <el-option :label="$t('message.document.langZhCn')" value="zh-CN" />
            <el-option :label="$t('message.document.langEnUs')" value="en-US" />
            <el-option :label="$t('message.document.langUniversal')" value="" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('message.document.sourceCategoryId')">
          <el-tree-select
            v-model="categoryForm.source_category_id"
            :data="categoryOptions"
            :props="treeProps"
            node-key="id"
            check-strictly
            clearable
            :placeholder="$t('message.document.sourceCategoryHint')"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item :label="$t('message.document.description')">
          <el-input v-model="categoryForm.description" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item :label="$t('message.common.colSort')">
          <el-input-number v-model="categoryForm.weigh" :min="0" />
          <span class="ml-2 text-sm text-gray-400">{{ $t("message.document.weighHint") }}</span>
        </el-form-item>
        <el-form-item :label="$t('message.common.status')">
          <el-switch v-model="categoryForm.status" :active-value="1" :inactive-value="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="categoryDialogVisible = false">{{
          $t("message.common.cancel")
        }}</el-button>
        <el-button type="primary" @click="saveCategory">{{ $t("message.common.save") }}</el-button>
      </template>
    </el-drawer>

    <el-drawer
      v-model="documentDialogVisible"
      :title="
        documentForm.id ? $t('message.document.editDocument') : $t('message.document.addDocument')
      "
      width="860px"
      class="document-editor-dialog"
    >
      <el-form :model="documentForm" label-width="110px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item :label="$t('message.document.category')">
              <el-tree-select
                v-model="documentForm.category_id"
                :data="categoryOptions"
                :props="treeProps"
                node-key="id"
                check-strictly
                clearable
                :placeholder="$t('message.document.selectCategory')"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('message.document.lang')">
              <el-input v-model="documentForm.lang" :placeholder="$t('message.document.allLang')" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item :label="$t('message.document.docTitle')" required>
          <el-input v-model="documentForm.title" />
        </el-form-item>
        <el-form-item label="Slug" required>
          <el-input v-model="documentForm.slug" />
        </el-form-item>
        <el-form-item :label="$t('message.document.summary')">
          <el-input v-model="documentForm.summary" type="textarea" :rows="2" />
        </el-form-item>
        <el-alert
          class="source-alert"
          :title="$t('message.document.sourceHint')"
          type="info"
          show-icon
          :closable="false"
        />
        <el-form-item :label="$t('message.document.sourceFile')">
          <el-input
            v-model="documentForm.file_path"
            :placeholder="$t('message.document.sourceFileHint')"
          />
        </el-form-item>
        <el-form-item :label="$t('message.document.markdown')">
          <GfTiptap
            v-model="documentForm.content_md"
            :markdown="true"
            toolbar="full"
            :placeholder="$t('message.document.markdownHint')"
          />
        </el-form-item>
        <el-descriptions v-if="documentForm.id" class="source-meta" :column="2" border size="small">
          <el-descriptions-item :label="$t('message.document.sourceHash')">
            {{ documentForm.file_hash || "--" }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('message.document.sourceMtime')">
            {{ formatTime(documentForm.file_mtime) }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('message.document.syncedAt')">
            {{ formatTime(documentForm.synced_at) }}
          </el-descriptions-item>
        </el-descriptions>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item :label="$t('message.common.colSort')">
              <el-input-number v-model="documentForm.weigh" :min="0" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('message.common.status')">
              <el-switch
                v-model="documentForm.status"
                :active-value="1"
                :inactive-value="0"
                :active-text="$t('message.document.published')"
                :inactive-text="$t('message.document.draft')"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="documentDialogVisible = false">{{
          $t("message.common.cancel")
        }}</el-button>
        <el-button type="primary" @click="saveDocument">{{ $t("message.common.save") }}</el-button>
      </template>
    </el-drawer>
  </ProPage>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, reactive, ref, nextTick } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { FolderAdd, Plus, RefreshRight } from "@element-plus/icons-vue";
import { useI18n } from "vue-i18n";
import ProPage from "/@/components/pro/ProPage.vue";
import ProSearch, { type ProSearchField } from "/@/components/pro/ProSearch.vue";
import ProToolbar from "/@/components/pro/ProToolbar.vue";
import ProTable from "/@/components/pro/ProTable.vue";
import GfTiptap from "/@/components/tiptap/index.vue";
import {
  addDocument,
  addDocumentCategory,
  deleteDocument,
  deleteDocumentCategory,
  editDocument,
  editDocumentCategory,
  getDocumentCategoryTree,
  getDocumentDetail,
  getDocumentList,
  sortDocumentCategory,
  syncDocumentSource,
  type DocumentCategoryItem,
} from "/@/api/addon/document";

export default defineComponent({
  name: "DocumentList",
  components: { ProPage, ProSearch, ProToolbar, ProTable, FolderAdd, Plus, RefreshRight },
  setup() {
    const { t } = useI18n();
    const treeProps = { label: "name", children: "children", value: "id" };
    const tableSize = ref<"large" | "default" | "small">("default");
    const loading = ref(false);
    const syncing = ref(false);
    const categoryTree = ref<DocumentCategoryItem[]>([]);
    const documents = ref<any[]>([]);
    const total = ref(0);
    const selectedCategoryId = ref(0);
    const categoryDialogVisible = ref(false);
    const documentDialogVisible = ref(false);
    const categoryLang = ref("zh-CN");
    const categoryTreeRef = ref<any>(null);

    const query = reactive({
      category_id: 0,
      lang: "",
      status: -1,
      keyword: "",
      page: 1,
      limit: 20,
    });

    const categoryForm = reactive({
      id: 0,
      parent_id: 0,
      name: "",
      slug: "",
      description: "",
      icon: "",
      lang: "",
      source_category_id: 0,
      weigh: 0,
      status: 1,
    });

    const documentForm = reactive({
      id: 0,
      category_id: 0,
      title: "",
      slug: "",
      content_md: "",
      summary: "",
      lang: "",
      source_doc_id: 0,
      file_path: "",
      file_hash: "",
      file_mtime: 0,
      synced_at: 0,
      weigh: 0,
      status: 1,
    });

    const categoryOptions = computed(() => categoryTree.value);
    const searchFields = computed<ProSearchField[]>(() => [
      {
        prop: "keyword",
        label: t("message.document.keyword"),
        placeholder: t("message.document.searchKeyword"),
        width: "220px",
      },
      {
        prop: "lang",
        label: t("message.document.lang"),
        placeholder: "zh-CN / en-US",
        width: "160px",
      },
      {
        prop: "status",
        label: t("message.common.status"),
        type: "select",
        width: "150px",
        options: [
          { label: t("message.document.allStatus"), value: -1 },
          { label: t("message.document.published"), value: 1 },
          { label: t("message.document.draft"), value: 0 },
        ],
      },
    ]);

    const resetCategoryForm = () => {
      Object.assign(categoryForm, {
        id: 0,
        parent_id: 0,
        name: "",
        slug: "",
        description: "",
        icon: "",
        lang: "",
        source_category_id: 0,
        weigh: 0,
        status: 1,
      });
    };

    const resetDocumentForm = () => {
      Object.assign(documentForm, {
        id: 0,
        category_id: selectedCategoryId.value || 0,
        title: "",
        slug: "",
        content_md: "",
        summary: "",
        lang: query.lang || "",
        source_doc_id: 0,
        file_path: "",
        file_hash: "",
        file_mtime: 0,
        synced_at: 0,
        weigh: 0,
        status: 1,
      });
    };

    const onLangTabChange = (lang: string) => {
      query.lang = lang;
      query.category_id = 0;
      selectedCategoryId.value = 0;
      loadCategories();
      loadDocuments();
    };

    // 打开新增分类时预填当前 tab 语言
    const openCategoryDialogWithLang = (row?: any) => {
      resetCategoryForm();
      if (row?.id) {
        Object.assign(categoryForm, row);
      } else {
        categoryForm.lang = categoryLang.value;
      }
      categoryDialogVisible.value = true;
    };

    const allowDrop = (_draggingNode: any, dropNode: any, type: string) => {
      // 只允许同层拖动（inner 也允许，以支持改变父级）
      return true;
    };

    // 拍平树，收集 id/parent_id/weigh 以便批量提交
    const flattenTree = (
      nodes: any[],
      parentId = 0,
    ): Array<{ id: number; parent_id: number; weigh: number }> => {
      const result: Array<{ id: number; parent_id: number; weigh: number }> = [];
      nodes.forEach((node, index) => {
        result.push({ id: node.id, parent_id: parentId, weigh: nodes.length - index });
        if (node.children?.length) {
          result.push(...flattenTree(node.children, node.id));
        }
      });
      return result;
    };

    const onNodeDrop = () => {
      // el-tree 拖动结束后 categoryTree 已被 el-tree 内部更新
      // 通过 ref 读取最新树数据
      const treeData = categoryTreeRef.value?.data || categoryTree.value;
      const items = flattenTree(treeData);
      sortDocumentCategory(items).then(() => {
        ElMessage.success(t("message.document.saved"));
        loadCategories();
      });
    };

    const loadCategories = () => {
      return getDocumentCategoryTree({ lang: categoryLang.value || undefined }).then((r: any) => {
        categoryTree.value = r?.data?.list || [];
      });
    };

    const loadDocuments = () => {
      loading.value = true;
      return getDocumentList(query)
        .then((r: any) => {
          documents.value = r?.data?.list || [];
          total.value = r?.data?.total || 0;
        })
        .finally(() => {
          loading.value = false;
        });
    };

    const onSearch = () => {
      query.page = 1;
      loadCategories();
      loadDocuments();
    };

    const onReset = () => {
      query.category_id = 0;
      query.lang = "";
      query.status = -1;
      query.keyword = "";
      query.page = 1;
      selectedCategoryId.value = 0;
      loadCategories();
      loadDocuments();
    };

    const onPageChange = ({ page, limit }: { page: number; limit: number }) => {
      query.page = page;
      query.limit = limit;
      loadDocuments();
    };

    const onCategorySelect = (node: DocumentCategoryItem) => {
      selectedCategoryId.value = node.id;
      query.category_id = node.id;
      query.page = 1;
      loadDocuments();
    };

    const clearCategory = () => {
      selectedCategoryId.value = 0;
      query.category_id = 0;
      query.page = 1;
      loadDocuments();
    };

    const openCategoryDialog = (row?: any) => {
      resetCategoryForm();
      if (row?.id) Object.assign(categoryForm, row);
      categoryDialogVisible.value = true;
    };

    const saveCategory = () => {
      if (!categoryForm.name || !categoryForm.slug) {
        ElMessage.warning(t("message.document.fillRequired"));
        return;
      }
      const payload = { ...categoryForm, parent_id: categoryForm.parent_id || 0 };
      const action = categoryForm.id ? editDocumentCategory(payload) : addDocumentCategory(payload);
      action.then(() => {
        ElMessage.success(t("message.document.saved"));
        categoryDialogVisible.value = false;
        loadCategories();
      });
    };

    const removeCategory = (row: any) => {
      ElMessageBox.confirm(
        t("message.document.confirmDeleteCategory"),
        t("message.common.confirm"),
        {
          type: "warning",
        },
      ).then(() => {
        deleteDocumentCategory(row.id).then(() => {
          ElMessage.success(t("message.document.deleted"));
          loadCategories();
          loadDocuments();
        });
      });
    };

    const openDocumentDialog = (row?: any) => {
      resetDocumentForm();
      if (row?.id) {
        getDocumentDetail(row.id).then((r: any) => {
          Object.assign(documentForm, r?.data?.detail || row);
          documentDialogVisible.value = true;
        });
      } else {
        documentDialogVisible.value = true;
      }
    };

    const saveDocument = () => {
      if (!documentForm.title || !documentForm.slug) {
        ElMessage.warning(t("message.document.fillRequired"));
        return;
      }
      const payload = { ...documentForm, category_id: documentForm.category_id || 0 };
      const action = documentForm.id ? editDocument(payload) : addDocument(payload);
      action.then(() => {
        ElMessage.success(t("message.document.saved"));
        documentDialogVisible.value = false;
        loadDocuments();
      });
    };

    const handleSyncSource = () => {
      ElMessageBox.confirm(t("message.document.confirmSyncSource"), t("message.common.confirm"), {
        type: "warning",
      }).then(() => {
        syncing.value = true;
        syncDocumentSource({ lang: query.lang || undefined })
          .then((r: any) => {
            const data = r?.data || {};
            const lines = [
              `${t("message.document.scanned")}: ${data.scanned || 0}`,
              `${t("message.document.created")}: ${data.created || 0}`,
              `${t("message.document.updated")}: ${data.updated || 0}`,
              `${t("message.document.hidden")}: ${data.hidden || 0}`,
              `${t("message.document.categories")}: ${data.categories || 0}`,
            ];
            if (data.errors?.length) {
              lines.push("", `${t("message.document.errors")}:`, ...data.errors);
            }
            ElMessage.success(t("message.document.syncComplete"));
            ElMessageBox.alert(lines.join("\n"), t("message.document.syncResult"), {
              customClass: "document-sync-result",
            });
            loadCategories();
            loadDocuments();
          })
          .finally(() => {
            syncing.value = false;
          });
      });
    };

    const formatTime = (value: number) => {
      if (!value) return "--";
      return new Date(value * 1000).toLocaleString();
    };

    const removeDocument = (row: any) => {
      ElMessageBox.confirm(
        t("message.document.confirmDeleteDocument"),
        t("message.common.confirm"),
        {
          type: "warning",
        },
      ).then(() => {
        deleteDocument(row.id).then(() => {
          ElMessage.success(t("message.document.deleted"));
          loadDocuments();
        });
      });
    };

    onMounted(() => {
      loadCategories();
      loadDocuments();
    });

    return {
      FolderAdd,
      Plus,
      RefreshRight,
      tableSize,
      loading,
      syncing,
      treeProps,
      categoryTree,
      categoryOptions,
      documents,
      total,
      selectedCategoryId,
      query,
      categoryForm,
      documentForm,
      categoryDialogVisible,
      documentDialogVisible,
      searchFields,
      loadCategories,
      loadDocuments,
      onSearch,
      onReset,
      onPageChange,
      onCategorySelect,
      clearCategory,
      openCategoryDialog,
      openCategoryDialogWithLang,
      saveCategory,
      removeCategory,
      openDocumentDialog,
      saveDocument,
      handleSyncSource,
      formatTime,
      removeDocument,
      categoryLang,
      categoryTreeRef,
      onLangTabChange,
      allowDrop,
      onNodeDrop,
    };
  },
});
</script>

<style scoped>
.document-layout {
  display: grid;
  grid-template-columns: 320px minmax(0, 1fr);
  gap: var(--cc-space-4);
}
.document-sidebar,
.document-main {
  border-radius: var(--cc-radius-lg);
}
.sidebar-header,
.category-node {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}
.category-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}
.category-lang-tag {
  margin-left: var(--cc-space-1);
  flex-shrink: 0;
  font-size: 10px;
}
.category-tabs {
  margin-bottom: var(--cc-space-2);
}
.category-tabs :deep(.el-tabs__header) {
  margin-bottom: 0;
}
.sidebar-toolbar {
  display: flex;
  align-items: center;
  gap: var(--cc-space-2);
  padding: var(--cc-space-2) 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
  margin-bottom: var(--cc-space-2);
}
.category-drag-handle {
  cursor: grab;
  color: var(--el-text-color-placeholder);
  margin-right: var(--cc-space-1);
  flex-shrink: 0;
  font-size: 12px;
  line-height: 1;
}
.category-drag-handle:active {
  cursor: grabbing;
}
.category-actions {
  display: none;
  flex-shrink: 0;
  margin-left: var(--cc-space-2);
}
.category-node:hover .category-actions {
  display: inline-flex;
}
.document-sidebar :deep(.el-card__body) {
  max-height: calc(100vh - 250px);
  overflow: auto;
}
.source-alert {
  margin-bottom: var(--cc-space-4);
}
.source-meta {
  margin-bottom: var(--cc-space-4);
}
.document-editor-dialog :deep(.el-textarea__inner) {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
}
:global(.document-sync-result .el-message-box__message) {
  white-space: pre-wrap;
}
@media (max-width: 1200px) {
  .document-layout {
    grid-template-columns: 1fr;
  }
}
</style>
