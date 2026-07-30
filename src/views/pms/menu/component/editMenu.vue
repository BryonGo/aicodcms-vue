<template>
  <div class="menu-drawer-form">
    <el-form
      ref="formRef"
      :model="ruleForm"
      :rules="rules"
      label-position="top"
      size="large"
      v-loading="loading"
    >
          <div class="pms-card-grid">
            <!-- 上级菜单：el-tree 单选 -->
            <el-form-item :label="$t('message.pms.menu.colParentMenu')" class="pms-card-full">
              <div class="menu-tree-wrapper">
                <el-input
                  v-model="parentMenuLabel"
                  :placeholder="$t('message.pms.menu.placeholderSelectParent')"
                  readonly
                  suffix-icon="Search"
                  @click="treeVisible = !treeVisible"
                  class="menu-tree-trigger"
                />
                <div v-if="treeVisible" class="menu-tree-dropdown">
                  <el-tree
                    ref="treeRef"
                    :data="menuTreeData"
                    :props="{ value: 'id', label: 'title', children: 'children' }"
                    node-key="id"
                    highlight-current
                    :expand-on-click-node="false"
                    @node-click="onTreeSelect"
                    default-expand-all
                    class="menu-tree-body"
                  />
                  <div class="menu-tree-footer">
                    <el-button size="small" type="primary" link @click="onClearParent">{{
                      $t("message.pms.menu.clearSelection")
                    }}</el-button>
                    <el-button size="small" @click="treeVisible = false">{{
                      $t("message.common.close")
                    }}</el-button>
                  </div>
                </div>
              </div>
            </el-form-item>

            <!-- 菜单类型 -->
            <el-form-item :label="$t('message.common.type')" prop="menu_type"
              ><el-radio-group v-model="ruleForm.menu_type"
                ><el-radio value="M">{{ $t("message.pms.menu.typeDir") }}</el-radio
                ><el-radio value="C">{{ $t("message.pms.menu.typeMenu") }}</el-radio
                ><el-radio value="F">{{
                  $t("message.pms.menu.typeButton")
                }}</el-radio></el-radio-group
              ></el-form-item
            >
            <!-- 图标：目录和菜单 -->
            <el-form-item v-if="ruleForm.menu_type != 'F'" :label="$t('message.pms.menu.menuIcon')"
              ><IconSelector v-model="ruleForm.icon"
            /></el-form-item>

            <!-- 菜单名称 -->
            <el-form-item :label="$t('message.common.colName')" prop="menu_name"
              ><el-input v-model="ruleForm.menu_name"
            /></el-form-item>

            <!-- 路由名称（目录）-->
            <el-form-item v-if="ruleForm.menu_type == 'M'" :label="$t('message.pms.menu.routeName')"
              ><el-input
                v-model="ruleForm.name"
                :placeholder="$t('message.pms.menu.routeNameExample')"
            /></el-form-item>

            <!-- 权限标识（菜单+按钮）-->
            <el-form-item
              v-if="ruleForm.menu_type != 'M'"
              :label="$t('message.pms.menu.permId')"
              prop="name"
            >
              <el-input v-model="ruleForm.name" :placeholder="$t('message.pms.menu.permExample')" />
            </el-form-item>

            <!-- 路由路径（目录+菜单）-->
            <el-form-item
              v-if="ruleForm.menu_type != 'F'"
              :label="$t('message.pms.menu.colRoutePath')"
              prop="path"
              ><el-input v-model="ruleForm.path"
            /></el-form-item>
            <!-- 重定向（目录+菜单）-->
            <el-form-item v-if="ruleForm.menu_type != 'F'" :label="$t('message.pms.menu.redirect')"
              ><el-input v-model="ruleForm.redirect"
            /></el-form-item>
            <!-- 组件路径（目录+菜单）-->
            <el-form-item
              v-if="ruleForm.menu_type != 'F'"
              :label="$t('message.pms.menu.componentPath')"
              ><el-input v-model="ruleForm.component"
            /></el-form-item>

            <!-- 外链/内嵌（目录）-->
            <el-form-item
              v-if="ruleForm.menu_type == 'M'"
              :label="$t('message.pms.menu.linkUrlLabel')"
              ><el-input v-model="ruleForm.link_url"
            /></el-form-item>

            <!-- 排序 -->
            <el-form-item :label="$t('message.common.colSort')" prop="menu_sort"
              ><el-input-number v-model="ruleForm.menu_sort" :min="0" style="width: 100%"
            /></el-form-item>
            <!-- 可见 -->
            <el-form-item :label="$t('message.common.statusShow')"
              ><el-switch
                v-model="ruleForm.is_hide"
                :active-value="0"
                :inactive-value="1"
                :active-text="$t('message.common.statusShow')"
                :inactive-text="$t('message.common.statusHide')"
            /></el-form-item>
            <!-- 缓存 -->
            <el-form-item :label="$t('message.pms.menu.cacheLabel')"
              ><el-switch
                v-model="ruleForm.is_keep_alive"
                :active-value="0"
                :inactive-value="1"
                :active-text="$t('message.common.yes')"
                :inactive-text="$t('message.common.no')"
            /></el-form-item>
            <!-- 外链开关（目录）-->
            <el-form-item v-if="ruleForm.menu_type == 'M'" :label="$t('message.pms.menu.colIsLink')"
              ><el-switch
                v-model="ruleForm.is_link"
                :active-value="0"
                :inactive-value="1"
                :active-text="$t('message.common.yes')"
                :inactive-text="$t('message.common.no')"
            /></el-form-item>
            <!-- 内嵌开关（目录）-->
            <el-form-item
              v-if="ruleForm.menu_type == 'M'"
              :label="$t('message.pms.menu.iframeLabel')"
              ><el-switch
                v-model="ruleForm.is_iframe"
                :active-value="0"
                :inactive-value="1"
                :active-text="$t('message.common.yes')"
                :inactive-text="$t('message.common.no')"
            /></el-form-item>
            <!-- 固钉（目录+菜单）-->
            <el-form-item
              v-if="ruleForm.menu_type != 'F'"
              :label="$t('message.pms.menu.fixedLabel')"
              ><el-switch
                v-model="ruleForm.is_affix"
                :active-value="0"
                :inactive-value="1"
                :active-text="$t('message.common.yes')"
                :inactive-text="$t('message.common.no')"
            /></el-form-item>
          </div>
          <div class="menu-form-actions">
            <el-button size="large" @click="$emit('close')">{{ $t("message.common.cancel") }}</el-button
            ><el-button
              type="primary"
              size="large"
              :loading="submitting"
              @click="onSubmit"
              class="menu-submit-btn"
              >{{ submitting ? $t("message.common.saving") : $t("message.common.save") }}</el-button
            >
          </div>
        </el-form>
    </div>
</template>
<script lang="ts">
import {
  reactive,
  toRefs,
  defineComponent,
  ref,
  unref,
  getCurrentInstance,
  nextTick,
} from "vue";
import { getMenuParams, addMenu, getMenuInfo, updateMenu } from "/@/api/pms/menu";
import { ElMessage } from "element-plus";
import IconSelector from "/@/components/iconSelector/index.vue";
import { useI18n } from "vue-i18n";

// 递归查找节点标题
function findNodeTitle(tree: any[], id: number): string {
  for (const node of tree) {
    if (node.id === id) return node.title;
    if (node.children?.length) {
      const found = findNodeTitle(node.children, id);
      if (found) return found;
    }
  }
  return "";
}

export default defineComponent({
  name: "systemEditMenu",
  components: { IconSelector },
  props: {
    editId: { type: Number, default: 0 },
    parentId: { type: Number, default: 0 },
  },
  emits: ["saved", "close"],
  setup(props, ctx) {
    const { t } = useI18n();
    const formRef = ref();
    const treeRef = ref();
    const submitting = ref(false);
    const loading = ref(false);
    const treeVisible = ref(false);
    const menuTreeData = ref<any[]>([]);
    const parentMenuLabel = ref("");
    const { proxy } = getCurrentInstance() as any;
    const state = reactive({
      ruleForm: {
        id: 0,
        parent_id: 0,
        menu_type: "M",
        menu_name: "",
        name: "",
        icon: "",
        path: "",
        redirect: "",
        component: "",
        link_url: "",
        menu_sort: 0,
        is_hide: 0,
        is_keep_alive: 0,
        is_link: 0,
        is_iframe: 0,
        is_affix: 0,
        roles: [],
      },
      rules: {
        menu_name: [
          { required: true, message: t("message.pms.menu.msgNameRequired"), trigger: "blur" },
        ],
      },
    });

    // 加载菜单树
    getMenuParams()
      .then((r: any) => {
        const list = r.data.menus || [];
        menuTreeData.value = proxy.handleTree(list, "id", "pid");
      })
      .then(() => {
        // 树加载完成后，再加载编辑数据（或设置 parentId）
        const id = props.editId;
        if (props.parentId) {
          state.ruleForm.parent_id = props.parentId;
          nextTick(() => {
            parentMenuLabel.value = findNodeTitle(menuTreeData.value, props.parentId);
            treeRef.value?.setCurrentKey(props.parentId);
          });
        }
        if (id) {
          loading.value = true;
          getMenuInfo(id)
            .then((r: any) => {
              const rule = r.data.rule;
              if (rule) {
                const menuTypeMap: Record<number, string> = { 0: "M", 1: "C", 2: "F" };
                state.ruleForm = {
                  id: rule.id,
                  parent_id: rule.pid,
                  menu_type: menuTypeMap[rule.menu_type] || "M",
                  menu_name: rule.title,
                  name: rule.name,
                  icon: rule.icon,
                  path: rule.path,
                  redirect: rule.redirect,
                  component: rule.component,
                  link_url: rule.link_url,
                  menu_sort: rule.weigh,
                  is_hide: rule.is_hide,
                  is_keep_alive: rule.is_cached,
                  is_link: rule.is_link,
                  is_iframe: rule.is_iframe,
                  is_affix: rule.is_affix,
                  roles: r.data.role_ids || [],
                };
                // 回显上级菜单名称
                nextTick(() => {
                  parentMenuLabel.value = rule.pid
                    ? findNodeTitle(menuTreeData.value, rule.pid)
                    : "";
                  if (rule.pid) {
                    treeRef.value?.setCurrentKey(rule.pid);
                  }
                });
              }
            })
            .finally(() => (loading.value = false));
        }
      });

    // 树节点选择
    const onTreeSelect = (node: any) => {
      state.ruleForm.parent_id = node.id;
      parentMenuLabel.value = node.title;
      treeVisible.value = false;
    };
    // 清除上级菜单
    const onClearParent = () => {
      state.ruleForm.parent_id = 0;
      parentMenuLabel.value = "";
      treeRef.value?.setCurrentKey(null);
      treeVisible.value = false;
    };

    const typeToNum: Record<string, number> = { M: 0, C: 1, F: 2 };
    const onSubmit = () => {
      const w = unref(formRef) as any;
      if (!w) return;
      w.validate((v: boolean) => {
        if (!v) return;
        submitting.value = true;
        const payload = { ...state.ruleForm, menu_type: typeToNum[state.ruleForm.menu_type] ?? 0 };
        (state.ruleForm.id ? updateMenu(payload) : addMenu(payload))
          .then(() => {
            ElMessage.success(state.ruleForm.id ? t("message.common.msgEditOk") : t("message.common.msgAddOk"));
            ctx.emit("saved");
          })
          .finally(() => (submitting.value = false));
      });
    };
    return {
      ...toRefs(state),
      formRef,
      treeRef,
      treeVisible,
      menuTreeData,
      parentMenuLabel,
      onTreeSelect,
      onClearParent,
      submitting,
      loading,
      onSubmit,
    };
  },
});
</script>
<style scoped>
.menu-drawer-form {
  padding: 24px;
}

.menu-drawer-form :deep(.el-form-item) {
  margin-bottom: 22px;
}

.menu-drawer-form :deep(.el-form-item__label) {
  font-size: 13px;
  font-weight: 600;
  color: var(--cc-color-text-1);
  padding-bottom: 6px;
}

.menu-drawer-form :deep(.el-input__wrapper) {
  border-radius: 8px;
  border: 1px solid #d0d5dd;
  box-shadow: none;
  transition: box-shadow 0.2s ease, border-color 0.2s ease;
}

.menu-drawer-form :deep(.el-input__wrapper:hover) {
  border-color: #a4b0c2;
}

.menu-drawer-form :deep(.el-input__wrapper.is-focus) {
  border-color: var(--cc-color-primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.menu-drawer-form :deep(.el-radio-group) {
  margin-top: 2px;
}

/* 上级菜单 tree 选择器 */
.menu-tree-wrapper {
  position: relative;
  width: 100%;
}

.menu-tree-trigger :deep(.el-input__wrapper) {
  cursor: pointer;
}

.menu-tree-dropdown {
  position: absolute;
  z-index: 1000;
  top: 44px;
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid var(--cc-color-border);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  max-height: 360px;
  display: flex;
  flex-direction: column;
}

.menu-tree-body {
  flex: 1;
  overflow-y: auto;
  padding: 8px 4px;
  max-height: 300px;
}

.menu-tree-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-top: 1px solid #eef1f5;
}

.pms-card-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 32px;
}

.pms-card-full {
  grid-column: 1 / -1;
}

.menu-form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 24px;
  border-top: 1px solid #eef1f5;
}

.menu-form-actions .el-button {
  font-family: var(--cc-font-sans);
  font-weight: 600;
  border-radius: 10px;
  padding: 12px 28px;
}

.menu-submit-btn {
  background: var(--cc-color-primary) !important;
  border: none !important;
}

@media (max-width: 768px) {
  .pms-card-grid {
    grid-template-columns: 1fr;
  }

  .menu-form-actions {
    flex-direction: column-reverse;
  }

  .menu-form-actions .el-button {
    width: 100%;
  }
}
</style>
