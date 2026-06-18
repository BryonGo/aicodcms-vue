<template>
  <ProPage :title="$t('message.form.formManage')" :subtitle="$t('message.form.formManage')">
    <template #actions>
      <el-button type="primary" :icon="Plus" @click="onAdd">{{
        $t("message.form.newForm")
      }}</el-button>
    </template>

    <ProToolbar v-model:size="tableSize" @refresh="load" />

    <ProTable
      :data="list"
      :loading="loading"
      :size="tableSize"
      :total="total"
      :page="query.page"
      :page-size="query.limit"
      @pagination="onPageChange"
    >
      <el-table-column prop="id" label="ID" width="70" align="center" />
      <el-table-column
        prop="title"
        :label="$t('message.form.formTitle')"
        min-width="180"
        show-overflow-tooltip
      />
      <el-table-column
        prop="field_cnt"
        :label="$t('message.form.fieldCount')"
        width="100"
        align="center"
      />
      <el-table-column
        prop="data_cnt"
        :label="$t('message.form.submitCount')"
        width="100"
        align="center"
      />
      <el-table-column
        prop="created_at"
        :label="$t('message.form.createTime')"
        width="170"
        align="center"
      />
      <el-table-column :label="$t('message.form.action')" width="280" fixed="right" align="center">
        <template #default="{ row }">
          <el-button link size="small" type="primary" @click="onEdit(row)">设置</el-button>
          <el-button link size="small" type="primary" @click="onField(row)">{{
            $t("message.form.fieldBuilder")
          }}</el-button>
          <el-button link size="small" type="success" @click="onData(row)">{{
            $t("message.form.data")
          }}</el-button>
          <el-button link size="small" type="danger" @click="onDel(row.id)">{{
            $t("message.form.delete")
          }}</el-button>
        </template>
      </el-table-column>
    </ProTable>

    <el-drawer
      :title="editId ? $t('message.form.editForm') : $t('message.form.newForm')"
      v-model="dialogVisible"
      width="500px"
    >
      <el-form :model="form" label-width="100px">
        <el-form-item :label="$t('message.form.formTitle')"
          ><el-input v-model="form.title"
        /></el-form-item>
        <el-form-item :label="$t('message.form.submitBtn')"
          ><el-input v-model="form.submit_btn"
        /></el-form-item>
        <el-form-item :label="$t('message.form.successMsg')"
          ><el-input v-model="form.success_msg"
        /></el-form-item>
        <el-form-item :label="$t('message.form.notifyEmail')"
          ><el-input v-model="form.email_to" :placeholder="$t('message.form.commaSep')"
        /></el-form-item>
        <el-form-item :label="$t('message.form.status')">
          <el-switch v-model="form.status" :active-value="1" :inactive-value="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">{{ $t("message.form.cancel") }}</el-button>
        <el-button type="primary" @click="onSave">{{ editId ? "保存" : "创建" }}</el-button>
      </template>
    </el-dialog>
  </ProPage>
</template>

<script lang="ts">
import { useI18n } from "vue-i18n";
import { defineComponent, onMounted, reactive, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useRouter } from "vue-router";
import { Plus } from "@element-plus/icons-vue";
import ProPage from "/@/components/pro/ProPage.vue";
import ProToolbar from "/@/components/pro/ProToolbar.vue";
import ProTable from "/@/components/pro/ProTable.vue";
import { listForms, addForm, editForm, delForm } from "/@/api/addon/form/index";

export default defineComponent({
  name: "FormList",
  components: { ProPage, ProToolbar, ProTable, Plus },
  setup() {
    const { t } = useI18n();
    const router = useRouter();
    const list = ref<any[]>([]);
    const total = ref(0);
    const loading = ref(false);
    const tableSize = ref<"large" | "default" | "small">("default");
    const dialogVisible = ref(false);
    const editId = ref(0);
    const query = reactive({ page: 1, limit: 20 });
    const form = reactive({
      title: "",
      submit_btn: t("message.form.submit"),
      success_msg: t("message.form.submitSuccess"),
      email_to: "",
      status: 1,
    });

    const load = () => {
      loading.value = true;
      listForms(query)
        .then((r: any) => {
          list.value = r?.data?.list || [];
          total.value = r?.data?.total || 0;
        })
        .finally(() => {
          loading.value = false;
        });
    };

    const onPageChange = ({ page, limit }: { page: number; limit: number }) => {
      query.page = page;
      query.limit = limit;
      load();
    };

    const onAdd = () => {
      editId.value = 0;
      form.title = "";
      form.submit_btn = t("message.form.submit");
      form.success_msg = t("message.form.submitSuccess");
      form.email_to = "";
      form.status = 1;
      dialogVisible.value = true;
    };
    const onEdit = (row: any) => {
      editId.value = row.id;
      form.title = row.title;
      dialogVisible.value = true;
    };

    const onSave = () => {
      if (!form.title) {
        ElMessage.warning(t("message.form.pleaseEnterTitle"));
        return;
      }
      if (editId.value) {
        editForm({ id: editId.value, ...form }).then(() => {
          ElMessage.success(t("message.form.saved"));
          dialogVisible.value = false;
          load();
        });
      } else {
        addForm(form.title).then(() => {
          ElMessage.success(t("message.form.created"));
          dialogVisible.value = false;
          load();
        });
      }
    };

    const onDel = (id: number) => {
      ElMessageBox.confirm(t("message.form.confirmDeleteForm"), t("message.form.confirm"), {
        type: "warning",
      }).then(() => {
        delForm(id).then(() => {
          ElMessage.success(t("message.form.deleted"));
          load();
        });
      });
    };

    const onField = (row: any) => {
      router.push({ path: "/addon/form/field/" + row.id });
    };
    const onData = (row: any) => {
      router.push({ path: "/addon/form/data/" + row.id });
    };

    onMounted(load);
    return {
      list,
      total,
      loading,
      tableSize,
      query,
      dialogVisible,
      editId,
      form,
      load,
      onPageChange,
      onAdd,
      onEdit,
      onSave,
      onDel,
      onField,
      onData,
      Plus,
    };
  },
});
</script>
