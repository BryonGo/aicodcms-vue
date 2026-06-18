<template>
  <div class="fa-page setting-page">
    <!-- 面包屑 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">
        <el-icon><HomeFilled /></el-icon> {{ $t("message.cms.setting.breadcrumbHome") }}
      </el-breadcrumb-item>
      <el-breadcrumb-item>{{ $t("message.cms.setting.breadcrumbCms") }}</el-breadcrumb-item>
      <el-breadcrumb-item>{{ $t("message.cms.setting.breadcrumbCurrent") }}</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 页头 -->
    <div class="set-header">
      <div>
        <h1 class="set-title">{{ $t("message.cms.setting.breadcrumbCurrent") }}</h1>
        <p class="set-subtitle">{{ $t("message.cms.setting.subtitle") }}</p>
      </div>
    </div>

    <!-- 双栏内容区 -->
    <div class="set-body">
      <!-- 左侧：分组列表 -->
      <el-card shadow="never" class="set-left">
        <template #header>
          <div class="set-left-header">
            <span>{{ $t("message.cms.setting.configGroup") }}</span>
            <el-button
              v-auth="'api/v1/admin/setting/group/add'"
              type="primary"
              size="small"
              @click="onAddGroup"
            >
              <el-icon><Plus /></el-icon>
            </el-button>
          </div>
        </template>
        <div class="set-left-body">
          <div
            v-for="group in groupList"
            :key="group.id"
            class="set-left-item"
            :class="{ 'is-active': selectedGroupId === group.id }"
            @click="onSelectGroup(group)"
          >
            <span class="set-left-name">{{ group.name }}</span>
            <el-dropdown
              v-auth="['api/v1/admin/setting/group/edit', 'api/v1/admin/setting/group/del']"
              trigger="click"
              @command="(cmd: string) => onGroupCommand(cmd, group)"
              @click.stop
            >
              <el-icon class="set-left-more"><MoreFilled /></el-icon>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="edit" v-auth="'api/v1/admin/setting/group/edit'">
                    <el-icon><Edit /></el-icon> {{ $t("message.cms.setting.editGroupLabel") }}
                  </el-dropdown-item>
                  <el-dropdown-item command="del" v-auth="'api/v1/admin/setting/group/del'" divided>
                    <el-icon><Delete /></el-icon>
                    <span style="color: var(--el-color-danger)">{{
                      $t("message.cms.setting.deleteGroupLabel")
                    }}</span>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
          <el-empty
            v-if="groupList.length === 0 && !groupLoading"
            :description="$t('message.cms.setting.noGroups')"
          />
        </div>
      </el-card>

      <!-- 右侧：动态表单 + 字段管理 -->
      <el-card shadow="never" class="set-right">
        <div v-if="!selectedGroupId" class="set-right-empty">
          <el-empty :description="$t('message.cms.setting.selectGroup')" />
        </div>

        <template v-else>
          <el-tabs v-model="activeTab" class="set-tabs">
            <!-- 配置值 Tab -->
            <el-tab-pane name="config">
              <template #label>
                <span>{{ $t("message.cms.setting.configValue") }}</span>
                <el-tooltip :content="$t('message.cms.setting.refreshForm')" placement="top">
                  <el-button
                    text
                    size="small"
                    style="padding: 0 4px; margin-left: 2px"
                    @click.stop="refreshForm"
                  >
                    <el-icon :size="13"><RefreshRight /></el-icon>
                  </el-button>
                </el-tooltip>
              </template>
              <DynamicSettingForm
                :key="'form-' + selectedGroupId + '-' + formRefreshKey"
                :group-id="selectedGroupId"
                :group-name="selectedGroupName"
                @saved="onFormSaved"
              />
            </el-tab-pane>

            <!-- 字段定义 Tab -->
            <el-tab-pane :label="$t('message.cms.setting.fieldDefinition')" name="fields">
              <div class="set-field-toolbar">
                <el-button
                  v-auth="'api/v1/admin/setting/field/add'"
                  type="primary"
                  size="small"
                  @click="onAddField"
                >
                  <el-icon><Plus /></el-icon> {{ $t("message.cms.setting.addFieldBtn") }}
                </el-button>
                <el-button
                  v-auth="'api/v1/admin/setting/field/del'"
                  size="small"
                  :disabled="selectedFieldIds.length === 0"
                  @click="onBatchDelField"
                >
                  <el-icon><Delete /></el-icon> {{ $t("message.cms.setting.batchDelete") }}
                </el-button>
              </div>

              <el-table
                v-loading="fieldLoading"
                :data="fieldList"
                border
                stripe
                size="small"
                @selection-change="onFieldSelectionChange"
              >
                <el-table-column type="selection" width="40" align="center" />
                <el-table-column
                  :label="$t('message.common.colId')"
                  prop="id"
                  width="60"
                  align="center"
                />
                <el-table-column
                  :label="$t('message.cms.setting.colFieldPath')"
                  prop="name"
                  min-width="160"
                  show-overflow-tooltip
                />
                <el-table-column
                  :label="$t('message.cms.setting.colDisplayLabel')"
                  prop="label"
                  width="120"
                />
                <el-table-column
                  :label="$t('message.common.type')"
                  prop="type"
                  width="90"
                  align="center"
                >
                  <template #default="{ row }">
                    <el-tag size="small" effect="plain" type="info">{{
                      typeLabel(row.type)
                    }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column
                  :label="$t('message.cms.setting.colRequired2')"
                  prop="required"
                  width="60"
                  align="center"
                >
                  <template #default="{ row }">
                    <el-tag :type="row.required === 1 ? 'danger' : 'info'" size="small">
                      {{ row.required === 1 ? $t("message.common.yes") : $t("message.common.no") }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column
                  :label="$t('message.cms.setting.colDefaultValue')"
                  prop="default_value"
                  width="120"
                  show-overflow-tooltip
                />
                <el-table-column
                  :label="$t('message.common.colSort')"
                  prop="sort"
                  width="60"
                  align="center"
                />
                <el-table-column
                  :label="$t('message.cms.setting.colOperation2')"
                  width="120"
                  align="center"
                  fixed="right"
                >
                  <template #default="{ row }">
                    <el-button
                      v-auth="'api/v1/admin/setting/field/edit'"
                      link
                      type="primary"
                      size="small"
                      @click="onEditField(row)"
                    >
                      {{ $t("message.cms.setting.colEdit") }}
                    </el-button>
                    <el-button
                      v-auth="'api/v1/admin/setting/field/del'"
                      link
                      type="danger"
                      size="small"
                      @click="onDelField(row)"
                    >
                      {{ $t("message.cms.setting.colDelete") }}
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>
          </el-tabs>
        </template>
      </el-card>
    </div>

    <!-- 分组弹窗 -->
    <el-dialog
      v-model="groupDialogVisible"
      :title="groupDialogTitle"
      width="420px"
      :close-on-click-modal="false"
    >
      <el-form ref="groupFormRef" :model="groupForm" :rules="groupFormRules" label-width="80px">
        <el-form-item :label="$t('message.cms.setting.groupName')" prop="name">
          <el-input
            v-model="groupForm.name"
            :placeholder="$t('message.cms.setting.placeholderGroupName')"
          />
        </el-form-item>
        <el-form-item :label="$t('message.common.colSort')" prop="sort">
          <el-input-number v-model="groupForm.sort" :min="0" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="groupDialogVisible = false">{{ $t("message.common.cancel") }}</el-button>
        <el-button type="primary" :loading="groupSubmitting" @click="onGroupSubmit">{{
          $t("message.common.confirm")
        }}</el-button>
      </template>
    </el-dialog>

    <!-- 字段编辑弹窗 -->
    <el-drawer
      v-model="fieldDialogVisible"
      :title="fieldDialogTitle"
      width="680px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-form ref="fieldFormRef" :model="fieldForm" :rules="fieldFormRules" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="$t('message.cms.setting.fieldPath')" prop="name">
              <el-input
                v-model="fieldForm.name"
                :placeholder="$t('message.cms.setting.placeholderFieldPath')"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('message.cms.setting.displayLabel')" prop="label">
              <el-input
                v-model="fieldForm.label"
                :placeholder="$t('message.cms.setting.placeholderDisplayLabel')"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="$t('message.cms.setting.fieldType')" prop="type">
              <el-select
                v-model="fieldForm.type"
                :placeholder="$t('message.cms.setting.placeholderSelect')"
                style="width: 100%"
                @change="onFieldTypeChange"
              >
                <el-option
                  v-for="t in FIELD_TYPES"
                  :key="t.value"
                  :label="t.label"
                  :value="t.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('message.cms.setting.belongGroup')" prop="group_id">
              <el-select
                v-model="fieldForm.group_id"
                :placeholder="$t('message.cms.setting.placeholderSelect')"
                style="width: 100%"
              >
                <el-option v-for="g in groupList" :key="g.id" :label="g.name" :value="g.id" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="$t('message.cms.setting.required')">
              <el-switch v-model="fieldForm.required" :active-value="1" :inactive-value="0" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('message.common.colSort')">
              <el-input-number v-model="fieldForm.sort" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item :label="$t('message.cms.setting.tip')" prop="tip">
          <el-input
            v-model="fieldForm.tip"
            :placeholder="$t('message.cms.setting.placeholderTip')"
          />
        </el-form-item>
        <el-form-item :label="$t('message.cms.setting.defaultValue')" prop="default_value">
          <el-input
            v-model="fieldForm.default_value"
            :placeholder="$t('message.cms.setting.placeholderDefaultValue')"
          />
        </el-form-item>
        <el-form-item
          v-if="['select', 'radio'].includes(fieldForm.type)"
          :label="$t('message.cms.setting.optionsConfig')"
          prop="options"
        >
          <el-alert type="info" :closable="false" style="margin-bottom: 8px" show-icon>
            {{ $t("message.cms.setting.optionsHint") }}
          </el-alert>
          <el-input
            v-model="fieldForm.options"
            type="textarea"
            :rows="4"
            :placeholder="$t('message.cms.setting.optionsPlaceholder')"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="fieldDialogVisible = false">{{ $t("message.common.cancel") }}</el-button>
        <el-button type="primary" :loading="fieldSubmitting" @click="onFieldSubmit">{{
          $t("message.common.confirm")
        }}</el-button>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from "element-plus";
import { Plus, Delete, Edit, MoreFilled, RefreshRight, HomeFilled } from "@element-plus/icons-vue";
import DynamicSettingForm from "/@/components/DynamicSettingForm/index.vue";
import {
  listSettingGroup,
  addSettingGroup,
  editSettingGroup,
  delSettingGroup,
  listSettingFieldByGroup,
} from "/@/api/cms/setting";
import { addSettingField, editSettingField, delSettingField } from "/@/api/cms/settingField";

const { t: $t } = useI18n();

const FIELD_TYPES = computed(() => [
  { label: $t("message.cms.setting.typeText"), value: "text" },
  { label: $t("message.cms.setting.typeNumber"), value: "number" },
  { label: $t("message.cms.setting.typeTextarea"), value: "textarea" },
  { label: $t("message.cms.setting.typePassword"), value: "password" },
  { label: $t("message.cms.setting.typeSwitch"), value: "switch" },
  { label: $t("message.cms.setting.typeSelect"), value: "select" },
  { label: $t("message.cms.setting.typeRadio"), value: "radio" },
  { label: $t("message.cms.setting.typeImage"), value: "image" },
]);

const TYPE_LABEL_MAP = computed<Record<string, string>>(() => ({
  text: $t("message.cms.setting.typeLabelText"),
  number: $t("message.cms.setting.typeLabelNumber"),
  textarea: $t("message.cms.setting.typeLabelTextarea"),
  password: $t("message.cms.setting.typeLabelPassword"),
  switch: $t("message.cms.setting.typeLabelSwitch"),
  select: $t("message.cms.setting.typeLabelSelect"),
  radio: $t("message.cms.setting.typeLabelRadio"),
  image: $t("message.cms.setting.typeLabelImage"),
}));
const typeLabel = (type: string) => TYPE_LABEL_MAP.value[type] || type;

// ── 分组 ──
interface GroupItem {
  id: number;
  name: string;
  icon: string;
  sort: number;
}
const groupLoading = ref(false);
const groupList = ref<GroupItem[]>([]);
const selectedGroupId = ref<number | null>(null);
const selectedGroupName = ref("");

// ── Tab ──
const activeTab = ref("config");
const formRefreshKey = ref(0);
const refreshForm = () => {
  formRefreshKey.value++;
};

// ── 字段列表 ──
const fieldLoading = ref(false);
const fieldList = ref<any[]>([]);
const selectedFieldIds = ref<number[]>([]);

// ── 分组弹窗 ──
const groupDialogVisible = ref(false);
const groupDialogTitle = ref($t("message.cms.setting.addGroupTitle"));
const groupSubmitting = ref(false);
const groupFormRef = ref<FormInstance>();
const groupForm = reactive({
  id: undefined as number | undefined,
  name: "",
  sort: 0,
});
const groupFormRules: FormRules = {
  name: [
    { required: true, message: $t("message.cms.setting.msgGroupNameRequired"), trigger: "blur" },
  ],
};

// ── 字段弹窗 ──
const fieldDialogVisible = ref(false);
const fieldDialogTitle = ref($t("message.cms.setting.addFieldTitle"));
const fieldSubmitting = ref(false);
const fieldFormRef = ref<FormInstance>();
const fieldForm = reactive({
  id: undefined as number | undefined,
  name: "",
  label: "",
  type: "text",
  group_id: undefined as number | undefined,
  required: 0,
  tip: "",
  default_value: "",
  options: "",
  sort: 0,
});
const fieldFormRules: FormRules = {
  name: [
    { required: true, message: $t("message.cms.setting.msgFieldPathRequired"), trigger: "blur" },
  ],
  label: [
    { required: true, message: $t("message.cms.setting.msgDisplayLabelRequired"), trigger: "blur" },
  ],
  type: [
    { required: true, message: $t("message.cms.setting.msgFieldTypeRequired"), trigger: "change" },
  ],
};

// ── 加载 ──
const loadGroupList = () => {
  groupLoading.value = true;
  listSettingGroup()
    .then((res: any) => {
      if (res?.code === 0) {
        groupList.value = Array.isArray(res.data?.groups) ? res.data.groups : [];
        if (groupList.value.length > 0 && selectedGroupId.value === null) {
          onSelectGroup(groupList.value[0]);
        }
      }
    })
    .catch(() => {
      ElMessage.error($t("message.cms.setting.msgGroupLoadFailed"));
    })
    .finally(() => {
      groupLoading.value = false;
    });
};

const loadFieldList = (groupId: number) => {
  fieldLoading.value = true;
  listSettingFieldByGroup(groupId)
    .then((res: any) => {
      if (res?.code === 0) {
        fieldList.value = Array.isArray(res.data?.list) ? res.data.list : [];
        fieldList.value.forEach((item: any) => {
          item.required = Number(item.required);
        });
      }
    })
    .catch(() => {
      fieldList.value = [];
    })
    .finally(() => {
      fieldLoading.value = false;
    });
};

// ── 分组操作 ──
const onSelectGroup = (group: GroupItem) => {
  selectedGroupId.value = group.id;
  selectedGroupName.value = group.name;
  loadFieldList(group.id);
};

const onAddGroup = () => {
  groupForm.id = undefined;
  groupForm.name = "";
  groupForm.sort = 0;
  groupDialogTitle.value = $t("message.cms.setting.addGroupTitle");
  groupDialogVisible.value = true;
};

const onGroupCommand = (cmd: string, group: GroupItem) => {
  if (cmd === "edit") {
    groupForm.id = group.id;
    groupForm.name = group.name;
    groupForm.sort = group.sort ?? 0;
    groupDialogTitle.value = $t("message.cms.setting.editGroupTitle");
    groupDialogVisible.value = true;
  } else if (cmd === "del") {
    onDelGroup(group);
  }
};

const onDelGroup = (group: GroupItem) => {
  ElMessageBox.confirm(
    $t("message.cms.setting.deleteGroupConfirm", { name: group.name }),
    $t("message.cms.setting.warning"),
    {
      type: "warning",
      confirmButtonText: $t("message.cms.setting.msgDelete"),
    },
  )
    .then(() => {
      delSettingGroup(group.id).then((res: any) => {
        if (res?.code === 0) {
          ElMessage.success($t("message.common.msgDeleteOk"));
          if (selectedGroupId.value === group.id) {
            selectedGroupId.value = null;
            selectedGroupName.value = "";
            fieldList.value = [];
          }
          loadGroupList();
        }
      });
    })
    .catch(() => {});
};

const onGroupSubmit = async () => {
  const valid = await groupFormRef.value?.validate().catch(() => false);
  if (!valid) return;
  groupSubmitting.value = true;
  const api = groupForm.id
    ? editSettingGroup(groupForm)
    : addSettingGroup({ name: groupForm.name, sort: groupForm.sort });
  api
    .then((res: any) => {
      if (res?.code === 0) {
        ElMessage.success(
          groupForm.id ? $t("message.common.msgEditOk") : $t("message.common.msgAddOk"),
        );
        groupDialogVisible.value = false;
        loadGroupList();
      }
    })
    .finally(() => {
      groupSubmitting.value = false;
    });
};

// ── 字段操作 ──
const onFieldSelectionChange = (rows: any[]) => {
  selectedFieldIds.value = rows.map((r) => r.id);
};
const onFieldTypeChange = (val: string) => {
  if (val !== "select" && val !== "radio") fieldForm.options = "";
};

const onAddField = () => {
  fieldForm.id = undefined;
  fieldForm.name = "";
  fieldForm.label = "";
  fieldForm.type = "text";
  fieldForm.group_id = selectedGroupId.value ?? undefined;
  fieldForm.required = 0;
  fieldForm.tip = "";
  fieldForm.default_value = "";
  fieldForm.options = "";
  fieldForm.sort = 0;
  fieldDialogTitle.value = $t("message.cms.setting.addFieldTitle");
  fieldDialogVisible.value = true;
};

const onEditField = (row: any) => {
  fieldForm.id = row.id;
  fieldForm.name = row.name;
  fieldForm.label = row.label;
  fieldForm.type = row.type;
  fieldForm.group_id = row.group_id;
  fieldForm.required = Number(row.required);
  fieldForm.tip = row.tip ?? "";
  fieldForm.default_value = row.default_value ?? "";
  fieldForm.options = row.options ?? "";
  fieldForm.sort = row.sort ?? 0;
  fieldDialogTitle.value = $t("message.cms.setting.editFieldTitle");
  fieldDialogVisible.value = true;
};

const onFieldSubmit = async () => {
  const valid = await fieldFormRef.value?.validate().catch(() => false);
  if (!valid) return;
  fieldSubmitting.value = true;
  const payload = {
    name: fieldForm.name,
    label: fieldForm.label,
    type: fieldForm.type,
    group_id: fieldForm.group_id,
    required: fieldForm.required,
    tip: fieldForm.tip,
    default_value: fieldForm.default_value,
    options: fieldForm.options,
    sort: fieldForm.sort,
  };
  const api = fieldForm.id
    ? editSettingField({ id: fieldForm.id, ...payload })
    : addSettingField(payload);
  api
    .then((res: any) => {
      if (res?.code === 0) {
        ElMessage.success(
          fieldForm.id ? $t("message.common.msgEditOk") : $t("message.common.msgAddOk"),
        );
        fieldDialogVisible.value = false;
        if (selectedGroupId.value) {
          loadFieldList(selectedGroupId.value);
          refreshForm();
        }
      }
    })
    .finally(() => {
      fieldSubmitting.value = false;
    });
};

const onDelField = (row: any) => {
  ElMessageBox.confirm(
    $t("message.cms.setting.deleteFieldConfirm"),
    $t("message.common.confirmDeleteTitle"),
    { type: "warning" },
  )
    .then(() => {
      delSettingField([row.id]).then((res: any) => {
        if (res?.code === 0) {
          ElMessage.success($t("message.common.msgDeleteOk"));
          if (selectedGroupId.value) {
            loadFieldList(selectedGroupId.value);
            refreshForm();
          }
        }
      });
    })
    .catch(() => {});
};

const onBatchDelField = () => {
  if (!selectedFieldIds.value.length) return;
  ElMessageBox.confirm(
    $t("message.cms.setting.deleteFieldsConfirm", { count: selectedFieldIds.value.length }),
    $t("message.common.confirmDeleteTitle"),
    { type: "warning" },
  )
    .then(() => {
      delSettingField(selectedFieldIds.value).then((res: any) => {
        if (res?.code === 0) {
          ElMessage.success($t("message.common.msgDeleteOk"));
          selectedFieldIds.value = [];
          if (selectedGroupId.value) {
            loadFieldList(selectedGroupId.value);
            refreshForm();
          }
        }
      });
    })
    .catch(() => {});
};

const onFormSaved = () => {
  ElMessage.success($t("message.cms.setting.msgConfigSaved"));
};

onMounted(() => {
  loadGroupList();
});
</script>

<style scoped>
.fa-page {
  max-width: 1400px;
  margin: 0 auto;
}

.setting-page {
  font-family: var(--cc-font-sans);
}

/* ==================== 面包屑 ==================== */
.setting-page :deep(.el-breadcrumb) {
  margin-bottom: 8px;
  font-size: 13px;
}

/* ==================== 页头 ==================== */
.set-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin: 12px 0 20px;
  padding: 24px 28px 20px;
  background: var(--cc-color-surface);
  border-radius: 16px;
  border: 1px solid var(--cc-color-border);
}

.set-title {
  font-family: var(--cc-font-sans);
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--cc-color-text-1);
  margin: 0 0 4px;
}

.set-subtitle {
  font-family: var(--cc-font-sans);
  font-size: 14px;
  color: var(--cc-color-text-3);
  margin: 0;
}

/* ==================== 双栏内容区 ==================== */
.set-body {
  display: flex;
  gap: 12px;
  height: calc(100vh - 280px);
  overflow: hidden;
}

/* ---- 左侧分组 ---- */
.set-left {
  width: 200px;
  min-width: 200px;
  border: 1px solid var(--cc-color-border);
  border-radius: 12px;
}

.set-left :deep(.el-card__header) {
  padding: 12px;
  border-bottom: 1px solid #e2e8f0;
}

.set-left :deep(.el-card__body) {
  padding: 4px 0;
  flex: 1;
  overflow: hidden auto;
}

.set-left-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 600;
  font-size: 14px;
  color: var(--cc-color-text-1);
}

.set-left-body {
  flex: 1;
  overflow-y: auto;
  padding: 4px 0;
}

.set-left-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 13px;
  color: var(--cc-color-text-2);
  transition: background 0.2s;
}

.set-left-item:hover {
  background: #f1f5f9;
  color: var(--cc-color-primary);
}

.set-left-item.is-active {
  background: var(--cc-color-primary-softer);
  color: var(--cc-color-primary);
  font-weight: 600;
}

.set-left-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.set-left-more {
  opacity: 0;
  font-size: 14px;
  transition: opacity 0.2s;
  color: var(--cc-color-text-4);
}

.set-left-item:hover .set-left-more {
  opacity: 1;
}

/* ---- 右侧表单 ---- */
.set-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--cc-color-border);
  border-radius: 12px;
}

.set-right :deep(.el-card__body) {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 0;
}

.set-right-empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Tabs */
.set-tabs {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.set-tabs :deep(.el-tabs__header) {
  margin: 0;
  padding: 0 16px;
  background: var(--cc-color-bg);
  border-bottom: 1px solid #e2e8f0;
}

.set-tabs :deep(.el-tabs__content) {
  flex: 1;
  overflow: auto;
  padding: 16px;
}

/* 字段工具栏 */
.set-field-toolbar {
  margin-bottom: 12px;
  display: flex;
  gap: 8px;
}

/* ---- 表格 ---- */
.set-right :deep(.el-table th.el-table__cell) {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--cc-color-text-3);
  background: var(--cc-color-bg);
  border-bottom: 1px solid var(--cc-color-border-light);
}

/* ==================== 响应式 ==================== */
@media (max-width: 768px) {
  .set-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    padding: 20px;
  }

  .set-body {
    flex-direction: column;
    height: auto;
  }

  .set-left {
    width: 100%;
    min-width: unset;
  }
}

@media (min-width: 1441px) {
  .fa-page {
    max-width: none !important;
    padding: 0 40px;
  }
}
</style>
