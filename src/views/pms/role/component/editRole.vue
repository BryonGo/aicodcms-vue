<template>
  <div class="system-edit-role-container">
    <el-drawer
      :title="$t('message.pms.role.' + (formData.id === 0 ? 'addTitle' : 'editTitle'))"
      v-model="isShowDialog"
      size="50%"
      destroy-on-close
    >
      <div v-if="isLoading" class="loading-overlay">
        <el-icon class="is-loading" size="30"><Loading /></el-icon>
      </div>
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        size="default"
        label-width="90px"
        :class="{ 'form-loading': isLoading }"
      >
        <el-row :gutter="35">
          <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
            <el-form-item :label="$t('message.common.colName')" prop="name">
              <el-input
                v-model="formData.name"
                :placeholder="$t('message.pms.role.placeholderName')"
                clearable
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
            <el-form-item :label="$t('message.common.colSort')">
              <el-input-number
                v-model="formData.listOrder"
                :min="0"
                controls-position="right"
                :placeholder="$t('message.common.colSort')"
                class="w100"
              />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
            <el-form-item :label="$t('message.pms.role.labelRoleStatus')">
              <el-switch
                v-model="formData.status"
                :active-value="1"
                :inactive-value="0"
                inline-prompt
                :active-text="$t('message.pms.common.enabled')"
                :inactive-text="$t('message.common.disabled')"
              ></el-switch>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb20">
            <el-form-item :label="$t('message.pms.role.labelRoleDesc')">
              <el-input
                v-model="formData.remark"
                type="textarea"
                :placeholder="$t('message.pms.role.placeholderName')"
                maxlength="150"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb20">
            <el-form-item :label="$t('message.pms.role.colMenuPerms')">
              <el-row :gutter="35">
                <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
                  <el-checkbox v-model="menuExpand" @change="handleCheckedTreeExpand($event)">{{
                    $t("message.pms.role.expandAll")
                  }}</el-checkbox>
                  <el-checkbox v-model="menuNodeAll" @change="handleCheckedTreeNodeAll($event)">{{
                    $t("message.pms.role.checkAll")
                  }}</el-checkbox>
                  <el-checkbox
                    v-model="menuCheckStrictly"
                    @change="handleCheckedTreeConnect($event)"
                    >{{ $t("message.pms.role.checkAll") }}</el-checkbox
                  >
                </el-col>
                <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb20">
                  <el-tree
                    :data="menuData"
                    ref="menuRef"
                    :props="menuProps"
                    :default-checked-keys="formData.menuIds"
                    node-key="id"
                    show-checkbox
                    class="menu-data-tree tree-border"
                    :check-strictly="!menuCheckStrictly"
                  />
                </el-col>
              </el-row>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="onCancel" size="default">{{ $t("message.common.cancel") }}</el-button>
          <el-button
            type="primary"
            @click="onSubmit"
            size="default"
            :loading="loading"
            :disabled="isLoading"
            >{{
              formData.id === 0 ? $t("message.common.add") : $t("message.common.edit")
            }}</el-button
          >
        </span>
      </template>
    </el-drawer>
  </div>
</template>

<script lang="ts">
import { reactive, toRefs, defineComponent, ref, getCurrentInstance, unref } from "vue";
import { useI18n } from "vue-i18n";
import { Loading } from "@element-plus/icons-vue";
import { addRole, editRole, getRole, getRoleParams } from "/@/api/pms/role";
import { ElMessage } from "element-plus";
import { refreshBackEndControlRoutes } from "/@/router/backEnd";

// 定义接口来定义对象的类型
interface MenuDataTree {
  id: number;
  pid: number;
  title: string;
  children?: MenuDataTree[];
}
interface DialogRow {
  id: number;
  name: string;
  status: number;
  listOrder: number;
  remark: string;
  menuIds: Array<number>;
}
interface RoleState {
  loading: boolean;
  isLoading: boolean;
  isShowDialog: boolean;
  formData: DialogRow;
  menuData: Array<MenuDataTree>;
  menuExpand: boolean;
  menuNodeAll: boolean;
  menuCheckStrictly: boolean;
  menuProps: {
    children: string;
    label: string;
  };
  rules: object;
}

export default defineComponent({
  name: "systemEditRole",
  setup(props, { emit }) {
    const { t } = useI18n();
    const { proxy } = getCurrentInstance() as any;
    const formRef = ref<HTMLElement | null>(null);
    const menuRef = ref();
    const state = reactive<RoleState>({
      loading: false,
      isLoading: false,
      isShowDialog: false,
      formData: {
        id: 0,
        name: "",
        status: 1,
        listOrder: 0,
        remark: "",
        menuIds: [],
      },
      // 表单校验
      rules: {
        name: [{ required: true, message: t("message.pms.role.msgNameRequired"), trigger: "blur" }],
      },
      menuData: [],
      menuExpand: false,
      menuNodeAll: false,
      menuCheckStrictly: false,
      menuProps: {
        children: "children",
        label: "title",
      },
    });
    // 打开弹窗
    const openDialog = (row?: DialogRow) => {
      resetForm();
      state.isLoading = true;
      getMenuData()
        .then(() => {
          if (row) {
            return getRole(row.id).then((res: any) => {
              if (res.data.role) {
                state.formData = res.data.role;
                state.formData.menuIds = res.data.menu_ids ?? [];
              }
            });
          }
        })
        .finally(() => {
          state.isLoading = false;
          state.isShowDialog = true;
        });
    };
    // 关闭弹窗
    const closeDialog = () => {
      state.isShowDialog = false;
    };
    // 取消
    const onCancel = () => {
      closeDialog();
    };
    // 新增
    const onSubmit = () => {
      const formWrap = unref(formRef) as any;
      if (!formWrap) return;
      formWrap.validate((valid: boolean) => {
        if (valid) {
          state.loading = true;
          state.formData.menuIds = getMenuAllCheckedKeys();
          if (state.formData.id === 0) {
            //添加
            console.log("【角色添加】请求参数:", state.formData);
            addRole(state.formData)
              .then((res: any) => {
                console.log("【角色添加】响应结果:", res);
                ElMessage.success(t("message.common.msgAddOk"));
                closeDialog(); // 关闭弹窗
                resetMenuSession();
                emit("getRoleList");
              })
              .finally(() => {
                state.loading = false;
              });
          } else {
            //修改
            console.log("【角色修改】请求参数:", state.formData);
            editRole(state.formData)
              .then((res: any) => {
                console.log("【角色修改】响应结果:", res);
                ElMessage.success(t("message.common.msgEditOk"));
                closeDialog(); // 关闭弹窗
                resetMenuSession();
                emit("getRoleList");
              })
              .finally(() => {
                state.loading = false;
              });
          }
        }
      });
    };
    // 获取菜单结构数据
    const getMenuData = () => {
      return getRoleParams().then((res: any) => {
        state.menuData = proxy.handleTree(res.data.menu, "id", "pid");
      });
    };
    const resetForm = () => {
      state.menuCheckStrictly = false;
      state.menuExpand = false;
      state.menuNodeAll = false;
      state.formData = {
        id: 0,
        name: "",
        status: 1,
        listOrder: 0,
        remark: "",
        menuIds: [],
      };
    };
    /** 树权限（展开/折叠）*/
    const handleCheckedTreeExpand = (value: any) => {
      let treeList = state.menuData;
      for (let i = 0; i < treeList.length; i++) {
        menuRef.value.store.nodesMap[treeList[i].id].expanded = value;
      }
    };

    /** 树权限（全选/全不选） */
    const handleCheckedTreeNodeAll = (value: any) => {
      if (value) {
        menuRef.value.setCheckedKeys(getAllNodeIds(state.menuData));
      } else {
        menuRef.value.setCheckedKeys([]);
      }
    };

    /** 递归获取所有节点 ID */
    function getAllNodeIds(nodes: MenuDataTree[]): number[] {
      const ids: number[] = [];
      nodes.forEach((node) => {
        ids.push(node.id);
        if (node.children && node.children.length > 0) {
          ids.push(...getAllNodeIds(node.children));
        }
      });
      return ids;
    }

    /** 树权限（父子联动） */
    const handleCheckedTreeConnect = (value: any) => {
      state.menuCheckStrictly = value ? true : false;
    };

    /** 所有菜单节点数据 */
    function getMenuAllCheckedKeys() {
      // 目前被选中的菜单节点
      let checkedKeys = menuRef.value.getCheckedKeys();
      // 半选中的菜单节点
      let halfCheckedKeys = menuRef.value.getHalfCheckedKeys();
      checkedKeys.unshift.apply(checkedKeys, halfCheckedKeys);
      return checkedKeys;
    }

    // 重置菜单session
    const resetMenuSession = () => {
      refreshBackEndControlRoutes();
    };
    return {
      openDialog,
      closeDialog,
      onCancel,
      onSubmit,
      menuRef,
      formRef,
      handleCheckedTreeExpand,
      handleCheckedTreeNodeAll,
      handleCheckedTreeConnect,
      resetMenuSession,
      ...toRefs(state),
    };
  },
});
</script>

<style scoped>
.tree-border {
  margin-top: 5px;
  border: 1px solid #e5e6e7 !important;
  border-radius: 4px;
}
.system-edit-role-container {
  .menu-data-tree {
    border: var(--el-input-border, var(--el-border-base));
    border-radius: var(--el-input-border-radius, var(--el-border-radius-base));
    padding: 5px;
  }
}
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}
.form-loading {
  opacity: 0.5;
  pointer-events: none;
}
</style>
