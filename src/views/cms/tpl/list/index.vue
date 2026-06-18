<template>
  <div class="cms-tpl-container">
    <el-breadcrumb separator="→" class="mb15">
      <el-breadcrumb-item :to="{ path: '/' }"
        ><el-icon><HomeFilled /></el-icon> {{ $t("message.router.home") }}</el-breadcrumb-item
      >
      <el-breadcrumb-item>{{ $t("message.cms.tplList.breadcrumbCms") }}</el-breadcrumb-item>
      <el-breadcrumb-item>{{ $t("message.cms.tplList.breadcrumbCurrent") }}</el-breadcrumb-item>
    </el-breadcrumb>
    <el-row :gutter="10" style="width: 100%">
      <!-- 左侧文件树 -->
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="tree-header">
              <span>{{ $t("message.cms.tplList.treeTitle") }}</span>
              <div class="tree-actions">
                <el-button
                  link
                  type="primary"
                  @click="refresh"
                  :title="$t('message.common.refresh')"
                  size="small"
                >
                  <el-icon><RefreshRight /></el-icon>
                </el-button>
                <el-button
                  link
                  type="primary"
                  @click="showCreateDialog('file')"
                  :title="$t('message.cms.tplList.newFile')"
                  size="small"
                >
                  <el-icon><DocumentAdd /></el-icon>
                </el-button>
                <el-button
                  link
                  type="primary"
                  @click="showCreateDialog('dir')"
                  :title="$t('message.cms.tplList.newDir')"
                  size="small"
                >
                  <el-icon><FolderAdd /></el-icon>
                </el-button>
              </div>
            </div>
          </template>
          <el-scrollbar height="calc(100vh - 280px)" @contextmenu.prevent="handleEmptyContextMenu">
            <div class="tree-content" @contextmenu.prevent="handleEmptyContextMenu">
              <!-- 返回上级按钮 -->
              <div
                v-if="currentPath !== '/'"
                class="tree-item back-btn"
                @click="goBack"
                @contextmenu.prevent.stop="handleEmptyContextMenu"
              >
                <span class="node-prefix"> </span>
                <span class="node-icon">📂</span>
                <span class="node-label">{{ $t("message.cms.tplList.backToParent") }}</span>
              </div>
              <!-- 文件列表 -->
              <template v-for="(item, index) in fileList" :key="item.path">
                <div
                  class="tree-item"
                  :class="{ active: currentFile === item.path, 'is-dir': item.isDir }"
                  @click="handleSelect(item)"
                  @contextmenu.prevent.stop="handleItemContextMenu($event, item)"
                >
                  <!-- 竖线前缀 -->
                  <span class="node-prefix">
                    <span class="tree-connector">{{
                      index === fileList.length - 1 ? "└─" : "├─"
                    }}</span>
                  </span>

                  <!-- 展开箭头（仅目录） -->
                  <span
                    v-if="item.isDir"
                    class="expand-icon"
                    @click.stop="handleExpandToggle(item)"
                  >
                    <el-icon size="12" :class="{ rotated: expandedDirs.has(item.path) }">
                      <CaretRight />
                    </el-icon>
                  </span>

                  <!-- 图标 -->
                  <span class="node-icon">
                    <el-icon
                      v-if="item.isDir"
                      :size="16"
                      :color="expandedDirs.has(item.path) ? '#409EFF' : '#E6A23C'"
                    >
                      <FolderOpened v-if="expandedDirs.has(item.path)" />
                      <Folder v-else />
                    </el-icon>
                    <el-icon v-else-if="item.name.endsWith('.html')" :size="16" color="#E6A23C"
                      ><Document
                    /></el-icon>
                    <el-icon v-else-if="item.name.endsWith('.css')" :size="16" color="#409EFF"
                      ><Document
                    /></el-icon>
                    <el-icon v-else-if="item.name.endsWith('.js')" :size="16" color="#67C23A"
                      ><Document
                    /></el-icon>
                    <el-icon v-else :size="16" color="#909399"><Document /></el-icon>
                  </span>

                  <!-- 名称 -->
                  <span class="node-label">{{ item.name }}</span>

                  <!-- 操作按钮 -->
                  <span class="node-actions" v-if="currentFile === item.path">
                    <el-button
                      link
                      type="warning"
                      size="small"
                      @click.stop="showRenameDialog(item)"
                      >{{ $t("message.cms.tplList.rename") }}</el-button
                    >
                    <el-button
                      link
                      type="danger"
                      size="small"
                      @click.stop="showDeleteDialog(item)"
                      >{{ $t("message.cms.tplList.remove") }}</el-button
                    >
                  </span>
                </div>

                <!-- 子目录内容（展开时显示） -->
                <template v-if="item.isDir && expandedDirs.has(item.path)">
                  <div
                    v-for="(child, childIndex) in getChildren(item.path)"
                    :key="child.path"
                    class="tree-item child-item"
                    :class="{ active: currentFile === child.path, 'is-dir': child.isDir }"
                    @click="handleSelect(child)"
                    @contextmenu.prevent.stop="handleItemContextMenu($event, child)"
                  >
                    <span class="node-prefix child-prefix">
                      <span class="tree-connector">{{
                        childIndex === getChildren(item.path).length - 1 ? "  └─" : "  ├─"
                      }}</span>
                    </span>
                    <span class="node-icon">
                      <el-icon v-if="child.isDir" :size="16" color="#E6A23C"><Folder /></el-icon>
                      <el-icon v-else :size="16" color="#909399"><Document /></el-icon>
                    </span>
                    <span class="node-label">{{ child.name }}</span>
                    <span class="node-actions" v-if="currentFile === child.path">
                      <el-button
                        link
                        type="warning"
                        size="small"
                        @click.stop="showRenameDialog(child)"
                        >{{ $t("message.cms.tplList.rename") }}</el-button
                      >
                      <el-button
                        link
                        type="danger"
                        size="small"
                        @click.stop="showDeleteDialog(child)"
                        >{{ $t("message.cms.tplList.remove") }}</el-button
                      >
                    </span>
                  </div>
                </template>
              </template>

              <div
                v-if="fileList.length === 0 && !loading"
                class="empty-tree"
                @contextmenu.prevent.stop="handleEmptyContextMenu"
              >
                <p>{{ $t("message.cms.tplList.noFiles") }}</p>
              </div>
            </div>
          </el-scrollbar>
        </el-card>
      </el-col>

      <!-- 右键菜单 -->
      <teleport to="body">
        <div
          v-if="contextMenu.visible"
          class="context-menu-mask"
          @click="closeContextMenu"
          @contextmenu.prevent="closeContextMenu"
        ></div>
        <div
          v-show="contextMenu.visible"
          class="context-menu"
          :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
        >
          <!-- 空白区域右键 -->
          <template v-if="!contextMenu.target">
            <div class="context-menu-item" @click="doCreate('file')">
              <el-icon><DocumentAdd /></el-icon> {{ $t("message.cms.tplList.contextNewFile") }}
            </div>
            <div class="context-menu-item" @click="doCreate('dir')">
              <el-icon><FolderAdd /></el-icon> {{ $t("message.cms.tplList.contextNewFolder") }}
            </div>
            <div class="context-menu-divider"></div>
            <div class="context-menu-item" @click="doRefresh">
              <el-icon><RefreshRight /></el-icon> {{ $t("message.cms.tplList.contextRefresh") }}
            </div>
          </template>
          <!-- 文件夹右键 -->
          <template v-else-if="contextMenu.target.isDir">
            <div class="context-menu-item" @click="doCreateInDir('file')">
              <el-icon><DocumentAdd /></el-icon> {{ $t("message.cms.tplList.contextNewFile") }}
            </div>
            <div class="context-menu-item" @click="doCreateInDir('dir')">
              <el-icon><FolderAdd /></el-icon> {{ $t("message.cms.tplList.contextNewFolder") }}
            </div>
            <div class="context-menu-divider"></div>
            <div class="context-menu-item" @click="doRename">
              <el-icon><Edit /></el-icon> {{ $t("message.cms.tplList.contextRename") }}
            </div>
            <div class="context-menu-item danger" @click="doDelete">
              <el-icon><Delete /></el-icon> {{ $t("message.cms.tplList.contextDelete") }}
            </div>
          </template>
          <!-- 文件右键 -->
          <template v-else>
            <div class="context-menu-item" @click="doEdit">
              <el-icon><Edit /></el-icon> {{ $t("message.cms.tplList.contextEdit") }}
            </div>
            <div class="context-menu-divider"></div>
            <div class="context-menu-item" @click="doRename">
              <el-icon><EditPen /></el-icon> {{ $t("message.cms.tplList.contextRename") }}
            </div>
            <div class="context-menu-item danger" @click="doDelete">
              <el-icon><Delete /></el-icon> {{ $t("message.cms.tplList.contextDelete") }}
            </div>
          </template>
        </div>
      </teleport>

      <!-- 右侧编辑器 -->
      <el-col :span="18">
        <el-card shadow="hover">
          <template #header>
            <div class="editor-header">
              <span v-if="currentFile" class="file-path">{{ currentFile }}</span>
              <span v-else class="placeholder">{{ $t("message.cms.tplList.selectFileHint") }}</span>
              <div class="editor-actions" v-if="currentFile">
                <el-tag v-if="isModified" type="warning" size="small">{{
                  $t("message.cms.tplList.modified")
                }}</el-tag>
                <el-button v-if="isModified" size="small" @click="revertChanges">{{
                  $t("message.cms.tplList.revert")
                }}</el-button>
                <el-button type="primary" @click="saveFile">{{
                  $t("message.common.save")
                }}</el-button>
              </div>
            </div>
          </template>
          <div class="editor-content">
            <template v-if="currentFile">
              <MyCodeMirror v-model="fileContent" :height="editorHeight" language="html" />
            </template>
            <div v-else class="empty-state">
              <p>{{ $t("message.cms.tplList.selectFileFromLeft") }}</p>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 新建对话框 -->
    <el-dialog
      v-model="createDialogVisible"
      :title="
        createType === 'file' ? $t('message.cms.tplList.newFile') : $t('message.cms.tplList.newDir')
      "
      width="400px"
    >
      <el-form-item
        :label="
          createType === 'file'
            ? $t('message.cms.tplList.newFileName')
            : $t('message.cms.tplList.newDirName')
        "
        required
      >
        <el-input
          v-model="newItemName"
          :placeholder="
            createType === 'file'
              ? $t('message.cms.tplList.placeholderFileName')
              : $t('message.cms.tplList.placeholderDirName')
          "
        />
      </el-form-item>
      <template #footer>
        <el-button @click="createDialogVisible = false">{{
          $t("message.cms.tplList.cancelCreate")
        }}</el-button>
        <el-button type="primary" @click="confirmCreate">{{
          $t("message.cms.tplList.confirmCreate")
        }}</el-button>
      </template>
    </el-dialog>

    <!-- 重命名对话框 -->
    <el-dialog
      v-model="renameDialogVisible"
      :title="$t('message.cms.tplList.renameTitle')"
      width="400px"
    >
      <el-form-item :label="$t('message.cms.tplList.newName')" required>
        <el-input v-model="newFileName" />
      </el-form-item>
      <template #footer>
        <el-button @click="renameDialogVisible = false">{{
          $t("message.cms.tplList.cancelCreate")
        }}</el-button>
        <el-button type="primary" @click="confirmRename">{{
          $t("message.cms.tplList.confirmCreate")
        }}</el-button>
      </template>
    </el-dialog>

    <!-- 删除确认 -->
    <el-dialog
      v-model="deleteDialogVisible"
      :title="$t('message.cms.tplList.deleteTitle')"
      width="400px"
    >
      <p>{{ deleteConfirmMsg }}</p>
      <template #footer>
        <el-button @click="deleteDialogVisible = false">{{
          $t("message.cms.tplList.cancelCreate")
        }}</el-button>
        <el-button type="danger" @click="confirmDelete">{{
          $t("message.cms.tplList.remove")
        }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from "vue";
import { useI18n } from "vue-i18n";
import { ElMessage } from "element-plus";
import {
  listTemplateFiles,
  readTemplateFile,
  saveTemplateFile,
  createTemplateItem,
  deleteTemplateItem,
  renameTemplateItem,
} from "@/api/cms/tpl";
import {
  RefreshRight,
  DocumentAdd,
  FolderAdd,
  CaretRight,
  FolderOpened,
  Folder,
  Document,
  Edit,
  EditPen,
  Delete,
} from "@element-plus/icons-vue";
import MyCodeMirror from "@/components/myCodeMirror/index.vue";

// 调试模式
const { t } = useI18n();
const DEBUG = true;
const log = (...args: any[]) => DEBUG && console.log(">>>", ...args);

// 排序：文件夹 > .html > 其他
const sortItems = (a: any, b: any) => {
  if (a.isDir !== b.isDir) return a.isDir ? -1 : 1;
  const extA = a.name?.split(".").pop() || "";
  const extB = b.name?.split(".").pop() || "";
  if (extA === "html" && extB !== "html") return -1;
  if (extA !== "html" && extB === "html") return 1;
  return a.name?.localeCompare(b.name) || 0;
};

// 当前目录路径
const currentDir = ref("");
const currentPath = ref("/");

const fileList = ref<any[]>([]);
const currentFile = ref("");
const fileContent = ref("");
const originalContent = ref("");
const isModified = computed(() => fileContent.value !== originalContent.value);
const loading = ref(false);
const editorHeight = ref(500);

// 已展开的目录
const expandedDirs = ref(new Set<string>());
// 子目录缓存
const childrenCache = ref(new Map<string, any[]>());

// 右键菜单
const contextMenu = ref({ visible: false, x: 0, y: 0, target: null as any });

const closeContextMenu = () => {
  contextMenu.value.visible = false;
  contextMenu.value.target = null;
};

const handleEmptyContextMenu = (e: MouseEvent) => {
  contextMenu.value = { visible: true, x: e.clientX, y: e.clientY, target: null };
};

const handleItemContextMenu = (e: MouseEvent, item: any) => {
  contextMenu.value = { visible: true, x: e.clientX, y: e.clientY, target: item };
};

// 右键菜单操作 - 在当前目录新建
const doCreate = (type: "file" | "dir") => {
  closeContextMenu();
  createTargetDir.value = "";
  showCreateDialog(type);
};

// 右键菜单操作 - 编辑文件
const doEdit = () => {
  if (contextMenu.value.target) {
    handleSelect(contextMenu.value.target);
  }
  closeContextMenu();
};

// 右键菜单操作 - 重命名
const doRename = () => {
  if (contextMenu.value.target) {
    showRenameDialog(contextMenu.value.target);
  }
  closeContextMenu();
};

// 右键菜单操作 - 删除
const doDelete = () => {
  if (contextMenu.value.target) {
    showDeleteDialog(contextMenu.value.target);
  }
  closeContextMenu();
};

// 右键菜单 - 刷新
const doRefresh = () => {
  closeContextMenu();
  refresh();
};

// Esc 键关闭右键菜单
const handleEscKey = (e: KeyboardEvent) => {
  if (e.key === "Escape") closeContextMenu();
};

// 右键菜单操作 - 在文件夹内新建
const doCreateInDir = (type: "file" | "dir") => {
  closeContextMenu();
  if (contextMenu.value.target?.isDir) {
    createTargetDir.value = contextMenu.value.target.path.replace(/^\//, "");
  }
  showCreateDialog(type);
};

const createDialogVisible = ref(false);
const createType = ref<"file" | "dir">("file");
const newItemName = ref("");
const createTargetDir = ref(""); // 右键指定创建目录
const renameDialogVisible = ref(false);
const newFileName = ref("");
const renameTarget = ref<any>(null);
const deleteDialogVisible = ref(false);
const deleteTarget = ref<any>(null);

const deleteConfirmMsg = computed(() => {
  if (!deleteTarget.value) return "";
  const name = deleteTarget.value.name || "";
  if (deleteTarget.value.isDir) {
    return t("message.cms.tplList.deleteDirMsg", { name });
  }
  return t("message.cms.tplList.deleteMsg", { name });
});

// 获取子文件列表
const getChildren = (parentPath: string) => {
  return childrenCache.value.get(parentPath) || [];
};

// 切换展开/折叠
const handleExpandToggle = async (item: any) => {
  if (expandedDirs.value.has(item.path)) {
    expandedDirs.value.delete(item.path);
  } else {
    expandedDirs.value.add(item.path);
    if (!childrenCache.value.has(item.path)) {
      await loadChildren(item);
    }
  }
};

// 返回上级目录
const goBack = () => {
  const parts = currentDir.value.split("/").filter(Boolean);
  parts.pop();
  const newDir = parts.join("/");
  loadFiles(newDir);
};

const refresh = () => loadFiles(currentDir.value);

// 加载子目录
const loadChildren = async (parent: any) => {
  try {
    const apiPath = parent.path.replace(/^\//, ""); // 去掉开头的 /
    const res = await listTemplateFiles("/" + apiPath);
    log("loadChildren API response:", res);
    const list = res?.data?.list || [];
    const children = list.map((item: any) => ({
      ...item,
      isDir: item.is_dir ?? item.isDir,
      path: parent.path + "/" + item.name,
    }));
    children.sort(sortItems);
    childrenCache.value.set(parent.path, children);
  } catch (e: any) {
    log("loadChildren error:", e);
    ElMessage.error(e.message || t("message.cms.tplList.msgLoadFailed"));
  }
};

// 加载文件列表
const loadFiles = async (dir: string) => {
  log("loadFiles called, dir:", dir);
  loading.value = true;
  try {
    // API 路径格式：/path/to/dir
    const apiPath = dir ? "/" + dir : "/";
    const res = await listTemplateFiles(apiPath);
    log("loadFiles raw API response:", res);
    log("loadFiles res.data:", res?.data);

    // API 返回结构是 { code: 0, data: { list: [...] } }
    // 空目录或异常时 res.dis可能为 null/undefined，用 || []
    const list = res?.data?.list || [];
    log("processed list:", list);

    currentDir.value = dir;
    currentPath.value = dir ? "/" + dir : "/";

    fileList.value = list
      .map((item: any) => ({
        ...item,
        isDir: item.is_dir ?? item.isDir,
        path: (dir ? "/" + dir : "") + "/" + item.name,
      }))
      .sort(sortItems);
    log("fileList.value:", fileList.value);
  } catch (e: any) {
    log("loadFiles error:", e);
    ElMessage.error(e.message || t("message.cms.tplList.msgLoadFailed"));
  } finally {
    loading.value = false;
  }
};

// 选择文件/进入目录
const handleSelect = async (item: any) => {
  log("handleSelect, item:", item);

  // 如果是目录，点击进入
  if (item.isDir) {
    const newDir = (currentDir.value ? currentDir.value + "/" : "") + item.name;
    await loadFiles(newDir);
    return;
  }

  if (isModified.value) {
    ElMessage.warning(t("message.cms.tplList.msgUnsaved"));
    return;
  }

  try {
    // API 路径去掉开头的 /
    const apiPath = item.path.replace(/^\//, "");
    const res = await readTemplateFile(apiPath);
    log("readTemplateFile response:", res);
    currentFile.value = item.path;
    fileContent.value = res?.data?.content;
    originalContent.value = fileContent.value;
  } catch (e: any) {
    log("read file failed:", e);
    ElMessage.error(e.message || t("message.cms.tplList.msgReadFailed"));
  }
};

const saveFile = async () => {
  if (!currentFile.value) return;
  try {
    const apiPath = currentFile.value.replace(/^\//, "");
    await saveTemplateFile(apiPath, fileContent.value);
    originalContent.value = fileContent.value;
    ElMessage.success(t("message.saveSuccess"));
  } catch (e: any) {
    log("save failed:", e);
    ElMessage.error(e.message || t("message.cms.tplList.msgSaveFailed"));
  }
};

const revertChanges = () => {
  fileContent.value = originalContent.value;
};

const showCreateDialog = (type: "file" | "dir") => {
  createType.value = type;
  newItemName.value = "";
  createDialogVisible.value = true;
};

const confirmCreate = async () => {
  if (!newItemName.value) {
    ElMessage.warning(t("message.cms.tplList.msgNameRequired"));
    return;
  }
  try {
    const dir = createTargetDir.value || currentDir.value;
    await createTemplateItem(dir, newItemName.value, createType.value === "dir");
    ElMessage.success(t("message.createSuccess"));
    createDialogVisible.value = false;
    createTargetDir.value = "";
    await refresh();
  } catch (e: any) {
    log("create failed:", e);
    ElMessage.error(e.message || t("message.cms.tplList.msgCreateFailed"));
  }
};

const showRenameDialog = (item: any) => {
  renameTarget.value = item;
  newFileName.value = item.name;
  renameDialogVisible.value = true;
};

const confirmRename = async () => {
  if (!newFileName.value || !renameTarget.value) return;
  try {
    const apiPath = renameTarget.value.path.replace(/^\//, "");
    await renameTemplateItem(apiPath, newFileName.value);
    ElMessage.success(t("message.cms.tplList.msgRenameOk"));
    renameDialogVisible.value = false;
    await refresh();
  } catch (e: any) {
    log("rename failed:", e);
    ElMessage.error(e.message || t("message.cms.tplList.msgRenameFailed"));
  }
};

const showDeleteDialog = (item: any) => {
  deleteTarget.value = item;
  deleteDialogVisible.value = true;
};

const confirmDelete = async () => {
  if (!deleteTarget.value) return;
  try {
    const apiPath = deleteTarget.value.path.replace(/^\//, "");
    await deleteTemplateItem(apiPath);
    ElMessage.success(t("message.deleteSuccess"));
    deleteDialogVisible.value = false;
    if (currentFile.value === deleteTarget.value.path) {
      currentFile.value = "";
      fileContent.value = "";
      originalContent.value = "";
    }
    await refresh();
  } catch (e: any) {
    log("delete failed:", e);
    ElMessage.error(e.message || t("message.cms.tplList.msgDeleteFailed"));
  }
};

onMounted(() => {
  log("component mounted, call loadFiles");
  loadFiles("");
  document.addEventListener("keydown", handleEscKey);
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleEscKey);
});
</script>

<style scoped>
/* ==================== 总体容器 ==================== */
.cms-tpl-container {
  padding: 10px;
  height: calc(100vh - 110px);
}

.cms-tpl-container :deep(.el-row) {
  height: 100%;
}

.cms-tpl-container :deep(.el-col) {
  height: 100%;
}

/* ==================== 左侧树面板 — VS Code 暗色风格 ==================== */
.cms-tpl-container :deep(.el-card.is-always-shadow) {
  box-shadow: none;
  border: 1px solid #e4e7ed;
}

.cms-tpl-container :deep(.el-card__body) {
  padding: 0;
  border-radius: 0 0 8px 8px;
}

/* 左侧卡片 body */
.cms-tpl-container :deep(.el-col:first-child) .el-card__body {
  height: calc(100% - 52px);
  overflow: hidden;
}

/* 右侧卡片 body — 允许垂直滚动 */
.cms-tpl-container :deep(.el-col:last-child) .el-card__body {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* 左侧卡片 */
.cms-tpl-container :deep(.el-col:first-child) .el-card {
  background: #1e1e1e;
  border-color: #333;
  border-radius: 8px;
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 左侧卡片 header */
.cms-tpl-container :deep(.el-col:first-child) .el-card__header {
  background: #252526;
  border-bottom: 1px solid #333;
  padding: 8px 12px;
  flex-shrink: 0;
}

.tree-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #cccccc;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  user-select: none;
}

.tree-header span {
  opacity: 0.7;
}

.tree-actions {
  display: flex;
  gap: 2px;
}

.tree-actions .el-button {
  color: #858585;
  --el-button-hover-link-text-color: #ffffff;
  transition: color 0.2s;
}

.tree-actions .el-button:hover {
  color: #ffffff;
}

/* 左侧滚动条 */
.cms-tpl-container :deep(.el-scrollbar__wrap) {
  overflow-x: auto;
}

.cms-tpl-container :deep(.el-scrollbar__bar.is-vertical) {
  width: 6px;
}

.cms-tpl-container :deep(.el-scrollbar__bar.is-horizontal) {
  height: 6px;
}

.cms-tpl-container :deep(.el-scrollbar__thumb) {
  background: #424242;
  border-radius: 3px;
}

.cms-tpl-container :deep(.el-scrollbar__thumb:hover) {
  background: #555555;
}

/* ==================== 树内容容器 ==================== */
.tree-content {
  padding: 4px 0;
  min-height: 100%;
  background: #1e1e1e;
}

/* ==================== 树节点 — 暗色 IDE 风格 ==================== */
.tree-item {
  display: flex;
  align-items: center;
  padding: 3px 8px;
  padding-left: 12px;
  cursor: pointer;
  font-size: 13px;
  font-family: "Consolas", "Monaco", "SF Mono", "Fira Code", monospace;
  white-space: nowrap;
  color: #cccccc;
  transition: background-color 0.12s ease;
  position: relative;
  user-select: none;
}

/* 激活指示器（左侧蓝色竖线） */
.tree-item.active::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: #409eff;
  border-radius: 0 2px 2px 0;
}

.tree-item:hover {
  background: #2a2d2e;
}

.tree-item.active {
  background: #37373d;
}

.tree-item.active .node-label {
  color: #ffffff;
}

/* 文件夹节点 */
.tree-item.is-dir .node-label {
  color: #cccccc;
}

.tree-item.is-dir:hover .node-label {
  color: #e0e0e0;
}

.tree-item.active.is-dir {
  background: #37373d;
}

.tree-item.active.is-dir .node-label {
  color: #ffffff;
}

/* 子节点缩进 */
.child-item {
  padding-left: 32px;
}

/* ==================== 返回上级按钮 ==================== */
.back-btn {
  color: #75beff;
  border-bottom: 1px solid #333;
  margin: 0 8px 4px 8px;
  padding: 6px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.back-btn:hover {
  background: #2a2d2e;
  color: #a0d0ff;
}

/* ==================== 连接线/前缀 ==================== */
.node-prefix {
  display: inline-block;
  width: 16px;
  color: #555555;
  flex-shrink: 0;
  text-align: center;
  font-size: 11px;
}

.child-prefix {
  width: 24px;
}

.tree-connector {
  color: #555555;
}

/* ==================== 展开箭头 ==================== */
.expand-icon {
  display: inline-flex;
  align-items: center;
  margin-right: 2px;
  color: #858585;
  transition: color 0.2s;
}

.expand-icon:hover {
  color: #cccccc;
}

/* ==================== 节点图标 ==================== */
.node-icon {
  margin: 0 5px;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
}

/* ==================== 节点标签 ==================== */
.node-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #cccccc;
  font-size: 13px;
  margin-left: 2px;
}

/* ==================== 节点操作按钮（hover 显示） ==================== */
.node-actions {
  display: none;
  margin-left: 6px;
  flex-shrink: 0;
}

.node-actions .el-button {
  font-size: 11px;
  padding: 1px 4px;
  height: auto;
  min-height: auto;
  --el-button-hover-link-text-color: #ffffff;
}

.node-actions .el-button--warning {
  color: #d19a66;
}

.node-actions .el-button--danger {
  color: #e06c75;
}

.tree-item:hover .node-actions {
  display: flex;
  gap: 4px;
}

/* ==================== 空状态 ==================== */
.empty-tree {
  padding: 40px 20px;
  text-align: center;
  color: #555555;
  font-size: 13px;
}

/* ==================== 右侧编辑器面板 ==================== */
/* 右侧卡片 */
.cms-tpl-container :deep(.el-col:last-child) .el-card {
  border-color: #e4e7ed;
  border-radius: 8px;
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.cms-tpl-container :deep(.el-col:last-child) .el-card__header {
  border-bottom: 1px solid #ebeef5;
  padding: 6px 16px;
  flex-shrink: 0;
}

/* ==================== 编辑器头部 ==================== */
.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.file-path {
  font-family: "Consolas", "Monaco", "SF Mono", monospace;
  font-size: 12px;
  color: #606266;
  background: #e8ecf1;
  padding: 2px 10px;
  border-radius: 4px;
  letter-spacing: 0.2px;
  max-width: 60%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.placeholder {
  color: #909399;
  font-size: 13px;
}

.editor-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

/* ==================== 编辑器内容区 ==================== */
.editor-content {
  flex: 1;
  min-height: 0;
  overflow: auto;
}

.editor-content :deep(.cm-editor) {
  height: 100%;
  font-size: 14px;
}

.editor-content :deep(.cm-scroller) {
  font-family: "Monaco", "Menlo", "Consolas", "SF Mono", monospace;
}

.editor-content :deep(.cm-gutters) {
  border-right: 1px solid #e8e8e8;
}

.empty-state {
  min-height: 400px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #909399;
  border-radius: 4px;
}

/* ==================== 展开箭头旋转动画 ==================== */
.expand-icon .el-icon {
  transition: transform 0.2s ease;
}

.expand-icon .el-icon.rotated {
  transform: rotate(90deg);
}

/* ==================== 右键菜单遮罩 ==================== */
.context-menu-mask {
  position: fixed;
  inset: 0;
  z-index: 9998;
}

/* ==================== 右键菜单 — 毛玻璃风格 ==================== */
.context-menu {
  position: fixed;
  z-index: 9999;
  min-width: 180px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(228, 231, 237, 0.8);
  border-radius: 10px;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.12),
    0 2px 8px rgba(0, 0, 0, 0.06);
  padding: 6px 0;
  font-size: 13px;
  user-select: none;
  animation: contextMenuIn 0.12s ease-out;
}

@keyframes contextMenuIn {
  from {
    opacity: 0;
    transform: scale(0.92) translateY(-4px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.context-menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 16px;
  cursor: pointer;
  color: #303133;
  transition: all 0.12s ease;
  font-size: 13px;
}

.context-menu-item:hover {
  background: var(--cc-color-primary-softer);
  color: var(--cc-color-primary);
  padding-left: 20px;
}

.context-menu-item.danger {
  color: #f56c6c;
}

.context-menu-item.danger:hover {
  background: #fef0f0;
  color: #f56c6c;
}

.context-menu-item .el-icon {
  font-size: 15px;
  flex-shrink: 0;
}

.context-menu-divider {
  height: 1px;
  margin: 4px 8px;
  background: linear-gradient(to right, transparent, #e4e7ed, transparent);
}

/* ==================== 对话框样式 ==================== */
.cms-tpl-container :deep(.el-dialog) {
  border-radius: 12px;
  box-shadow:
    0 12px 48px rgba(0, 0, 0, 0.15),
    0 4px 12px rgba(0, 0, 0, 0.08);
}

.cms-tpl-container :deep(.el-dialog__header) {
  padding: 20px 24px 0;
  font-weight: 600;
}

.cms-tpl-container :deep(.el-dialog__body) {
  padding: 20px 24px;
}

.cms-tpl-container :deep(.el-dialog__footer) {
  padding: 0 24px 20px;
  border-top: none;
}

.cms-tpl-container :deep(.el-dialog .el-form-item) {
  margin-bottom: 0;
}

.cms-tpl-container :deep(.el-dialog .el-form-item__label) {
  font-weight: 500;
  padding-bottom: 6px;
}

/* ==================== 额外过渡优化 ==================== */
.tree-item,
.context-menu-item {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* CodeMirror 编辑器在暗色侧栏中 */
.cms-tpl-container :deep(.el-scrollbar) {
  flex: 1;
  min-height: 0;
}
</style>
