<template>
  <div class="field-list">
    <el-breadcrumb separator="→" class="mb15">
      <el-breadcrumb-item :to="{ path: '/' }"
        ><el-icon><HomeFilled /></el-icon> {{ $t("message.router.home") }}</el-breadcrumb-item
      >
      <el-breadcrumb-item>{{ $t("message.cms.tplList.breadcrumbCms") }}</el-breadcrumb-item>
      <el-breadcrumb-item>{{ $t("message.cms.setting.breadcrumbCurrent") }}</el-breadcrumb-item>
      <el-breadcrumb-item>{{ $t("message.cms.field.breadcrumbField") }}</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 工具栏 -->
    <div class="toolbar">
      <el-button type="primary" size="small" @click="onAdd">
        <el-icon><Plus /></el-icon> {{ $t("message.cms.setting.addFieldBtn") }}
      </el-button>
      <el-button size="small" :disabled="selectedIds.length === 0" @click="onBatchDel">
        <el-icon><Delete /></el-icon> {{ $t("message.cms.setting.batchDelete") }}
      </el-button>
    </div>

    <!-- 列表 -->
    <el-table v-loading="loading" :data="tableData" border @selection-change="onSelectionChange">
      <el-table-column type="selection" width="40" align="center" />
      <el-table-column :label="$t('message.common.colId')" prop="id" width="60" align="center" />
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
        :label="$t('message.cms.setting.fieldType')"
        prop="type"
        width="90"
        align="center"
      >
        <template #default="{ row }">
          <span class="type-badge">{{ typeLabel(row.type) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('message.cms.setting.colGroup')"
        prop="group_name"
        width="100"
        align="center"
      />
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
        :label="$t('message.common.colSort')"
        prop="sort"
        width="60"
        align="center"
      />
      <el-table-column
        :label="$t('message.cms.setting.tip')"
        prop="tip"
        min-width="150"
        show-overflow-tooltip
      />
      <el-table-column
        :label="$t('message.cms.setting.colOperation2')"
        width="120"
        align="center"
        fixed="right"
      >
        <template #default="scope">
          <el-button link size="small" @click="onEdit(scope.row)">{{
            $t("message.cms.setting.colEdit")
          }}</el-button>
          <el-button link size="small" type="danger" @click="onDel(scope.row)">{{
            $t("message.cms.setting.colDelete")
          }}</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      v-if="total > 0"
      v-model:current-page="query.page"
      v-model:page-size="query.pageSize"
      :total="total"
      :page-sizes="[10, 20, 50]"
      layout="total, sizes, prev, pager, next"
      style="margin-top: 16px"
      @size-change="onPageChange"
      @current-change="onPageChange"
    />

    <!-- 编辑弹窗 -->
    <el-drawer
      v-model="dialogVisible"
      :title="dialogTitle"
      size="50%"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="$t('message.cms.setting.colFieldPath')" prop="name">
              <el-input
                v-model="formData.name"
                :placeholder="$t('message.cms.setting.placeholderFieldPath')"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('message.cms.setting.colDisplayLabel')" prop="label">
              <el-input
                v-model="formData.label"
                :placeholder="$t('message.cms.setting.placeholderDisplayLabel')"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="$t('message.cms.setting.fieldType')" prop="type">
              <el-select v-model="formData.type" style="width: 100%" @change="onTypeChange">
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
            <el-form-item :label="$t('message.cms.setting.belongGroup')" prop="group_name">
              <el-input
                v-model="formData.group_name"
                :placeholder="$t('message.cms.setting.groupName')"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="$t('message.cms.setting.colRequired2')">
              <el-switch v-model="formData.required" :active-value="1" :inactive-value="0" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('message.common.colSort')">
              <el-input-number v-model="formData.sort" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item :label="$t('message.cms.setting.tip')">
          <el-input
            v-model="formData.tip"
            :placeholder="$t('message.cms.setting.placeholderTip')"
          />
        </el-form-item>
        <el-form-item :label="$t('message.cms.setting.defaultValue')">
          <el-input
            v-model="formData.default_value"
            :placeholder="$t('message.cms.setting.placeholderDefaultValue')"
          />
        </el-form-item>
        <el-form-item
          v-if="['select', 'radio'].includes(formData.type)"
          :label="$t('message.cms.setting.optionsConfig')"
        >
          <div class="options-hint">{{ $t("message.cms.setting.optionsHint") }}</div>
          <pre class="options-example">{{ $t("message.cms.setting.optionsExample") }}</pre>
          <el-input
            v-model="formData.options"
            type="textarea"
            :rows="3"
            :placeholder="$t('message.cms.setting.optionsPlaceholder')"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">{{ $t("message.common.cancel") }}</el-button>
        <el-button type="primary" :loading="submitting" @click="onSubmit">{{
          $t("message.common.confirm")
        }}</el-button>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from "element-plus";
import { Plus, Delete } from "@element-plus/icons-vue";
import { useI18n } from "vue-i18n";
import {
  listSettingField,
  addSettingField,
  editSettingField,
  delSettingField,
} from "/@/api/cms/settingField";

const { t } = useI18n();

const FIELD_TYPES = computed(() => [
  { label: t("message.cms.setting.typeText"), value: "text" },
  { label: t("message.cms.setting.typeNumber"), value: "number" },
  { label: t("message.cms.setting.typeTextarea"), value: "textarea" },
  { label: t("message.cms.setting.typePassword"), value: "password" },
  { label: t("message.cms.setting.typeSwitch"), value: "switch" },
  { label: t("message.cms.setting.typeSelect"), value: "select" },
  { label: t("message.cms.setting.typeRadio"), value: "radio" },
  { label: t("message.cms.setting.typeImage"), value: "image" },
]);

const typeLabel = (type: string) => {
  const map: Record<string, string> = {
    text: t("message.cms.setting.typeLabelText"),
    number: t("message.cms.setting.typeLabelNumber"),
    textarea: t("message.cms.setting.typeLabelTextarea"),
    password: t("message.cms.setting.typeLabelPassword"),
    switch: t("message.cms.setting.typeLabelSwitch"),
    select: t("message.cms.setting.typeLabelSelect"),
    radio: t("message.cms.setting.typeLabelRadio"),
    image: t("message.cms.setting.typeLabelImage"),
  };
  return map[type] || type;
};

const loading = ref(false);
const submitting = ref(false);
const tableData = ref<any[]>([]);
const total = ref(0);
const selectedIds = ref<number[]>([]);

const query = reactive({
  page: 1,
  pageSize: 20,
  name: "",
  group_name: "",
});

const dialogVisible = ref(false);
const dialogTitle = ref(t("message.cms.setting.addFieldTitle"));
const formRef = ref<FormInstance>();

const formData = reactive({
  id: undefined as number | undefined,
  name: "",
  label: "",
  type: "text",
  group_name: t("message.cms.setting.defaultGroupName"),
  required: 0,
  tip: "",
  default_value: "",
  options: "",
  sort: 0,
});

const formRules: FormRules = {
  name: [
    { required: true, message: t("message.cms.setting.msgFieldPathRequired"), trigger: "blur" },
  ],
  label: [
    { required: true, message: t("message.cms.setting.msgDisplayLabelRequired"), trigger: "blur" },
  ],
  type: [
    { required: true, message: t("message.cms.setting.msgFieldTypeRequired"), trigger: "change" },
  ],
};

const getList = () => {
  loading.value = true;
  listSettingField({
    page: query.page,
    row: query.pageSize,
    name: query.name,
    group_name: query.group_name,
  })
    .then((res: any) => {
      if (res && res.code === 0) {
        tableData.value = Array.isArray(res.data?.list) ? res.data.list : [];
        total.value = Number(res.data?.total) || 0;
      }
    })
    .catch(() => {
      tableData.value = [];
    })
    .finally(() => {
      loading.value = false;
    });
};

const onSelectionChange = (rows: any[]) => {
  selectedIds.value = rows.map((r) => r.id);
};

const onPageChange = () => {
  getList();
};

const onTypeChange = (val: string) => {
  if (val !== "select" && val !== "radio") {
    formData.options = "";
  }
};

const resetForm = () => {
  formData.id = undefined;
  formData.name = "";
  formData.label = "";
  formData.type = "text";
  formData.group_name = t("message.cms.setting.defaultGroupName");
  formData.required = 0;
  formData.tip = "";
  formData.default_value = "";
  formData.options = "";
  formData.sort = 0;
};

const onAdd = () => {
  resetForm();
  dialogTitle.value = t("message.cms.setting.addFieldTitle");
  dialogVisible.value = true;
};

const onEdit = (row: any) => {
  formData.id = row.id;
  formData.name = row.name;
  formData.label = row.label;
  formData.type = row.type;
  formData.group_name = row.group_name ?? "";
  formData.required = Number(row.required);
  formData.tip = row.tip ?? "";
  formData.default_value = row.default_value ?? "";
  formData.options = row.options ?? "";
  formData.sort = row.sort ?? 0;
  dialogTitle.value = t("message.cms.setting.editFieldTitle");
  dialogVisible.value = true;
};

const onSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;

  submitting.value = true;
  const payload = {
    name: formData.name,
    label: formData.label,
    type: formData.type,
    group_name: formData.group_name,
    required: formData.required,
    tip: formData.tip,
    default_value: formData.default_value,
    options: formData.options,
    sort: formData.sort,
  };
  const api = formData.id
    ? editSettingField({ id: formData.id, ...payload })
    : addSettingField(payload);

  api
    .then((res: any) => {
      if (res && res.code === 0) {
        ElMessage.success(
          formData.id ? t("message.cms.setting.msgEditOk2") : t("message.cms.setting.msgAddOk2"),
        );
        dialogVisible.value = false;
        getList();
      }
    })
    .finally(() => {
      submitting.value = false;
    });
};

const onDel = (row: any) => {
  ElMessageBox.confirm(
    t("message.cms.setting.deleteFieldConfirm"),
    t("message.common.confirmTitle"),
    { type: "warning" },
  )
    .then(() => {
      delSettingField([row.id]).then((res: any) => {
        if (res && res.code === 0) {
          ElMessage.success(t("message.common.msgDeleteOk"));
          getList();
        }
      });
    })
    .catch(() => {});
};

const onBatchDel = () => {
  if (!selectedIds.value.length) return;
  ElMessageBox.confirm(
    t("message.cms.setting.deleteFieldsConfirm", { count: selectedIds.value.length }),
    t("message.common.confirmTitle"),
    { type: "warning" },
  )
    .then(() => {
      delSettingField(selectedIds.value).then((res: any) => {
        if (res && res.code === 0) {
          ElMessage.success(t("message.common.msgDeleteOk"));
          selectedIds.value = [];
          getList();
        }
      });
    })
    .catch(() => {});
};

onMounted(() => {
  getList();
});
</script>

<style scoped>
.field-list {
  padding: 8px 0;
}

.toolbar {
  margin-bottom: 12px;
  display: flex;
  gap: 8px;
}

.type-badge {
  display: inline-block;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  background: var(--cc-color-bg);
  color: var(--cc-color-text-2);
}

.options-hint {
  color: var(--cc-color-text-3);
  font-size: 12px;
  margin-bottom: 4px;
}

.options-example {
  background: var(--cc-color-bg);
  padding: 6px 10px;
  border-radius: 4px;
  font-size: 12px;
  color: var(--cc-color-text-2);
  margin: 0 0 8px;
  overflow: auto;
}
</style>
