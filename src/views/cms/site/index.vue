<template>
  <div class="pms-card-container">
    <el-breadcrumb separator="→" class="mb15">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>内容</el-breadcrumb-item>
      <el-breadcrumb-item>站点管理</el-breadcrumb-item>
    </el-breadcrumb>
    <div class="pms-card-header">
      <div>
        <h1 class="pms-card-title">站点管理</h1>
        <p class="pms-card-sub">站点只负责入口与语言；业务配置请切换站点后前往「系统设置」</p>
      </div>
      <div class="pms-card-actions">
        <el-button size="large" type="success" class="pms-card-add" @click="onOpenAdd">
          <el-icon><ele-FolderAdd /></el-icon> 新增站点
        </el-button>
      </div>
    </div>
    <div class="pms-card-table">
      <el-table :data="tableData.data" stripe border size="small" style="width: 100%">
        <el-table-column type="index" label="#" width="55" align="center" />
        <el-table-column prop="code" label="站点码" width="140" show-overflow-tooltip />
        <el-table-column prop="name" label="站点名" min-width="140" show-overflow-tooltip />
        <el-table-column label="绑定域名" min-width="200" show-overflow-tooltip>
          <template #default="scope">
            <el-tag v-for="d in scope.row.domains || []" :key="d" size="small" class="mr5" effect="plain">
              {{ d }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="default_lang" label="默认语言" width="90" align="center" />
        <el-table-column label="语言子集" min-width="160" show-overflow-tooltip>
          <template #default="scope">
            <el-tag v-for="l in scope.row.langs || []" :key="l" size="small" class="mr5" effect="plain">
              {{ l }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="theme" label="主题" width="90" show-overflow-tooltip />
        <el-table-column label="状态" width="90" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'info'" size="small" effect="light" round>
              {{ scope.row.status === 1 ? "启用" : "停用" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="排序" width="70" align="center" />
        <el-table-column label="操作" width="160" align="center" fixed="right">
          <template #default="scope">
            <el-button link size="small" type="primary" @click="onOpenEdit(scope.row)">
              <el-icon><ele-Edit /></el-icon> 编辑
            </el-button>
            <el-button
              link
              size="small"
              type="danger"
              :disabled="scope.row.code === 'default'"
              @click="onDel(scope.row)"
            >
              <el-icon><ele-Delete /></el-icon> 删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 编辑弹窗 -->
    <el-dialog
      v-model="dialog.visible"
      :title="dialog.isEdit ? '编辑站点' : '新增站点'"
      width="720px"
      destroy-on-close
      :close-on-click-modal="false"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="110px">
            <el-form-item label="站点码" prop="code">
              <el-input v-model="form.code" placeholder="小写字母数字连字符，如 site2" :disabled="dialog.isEdit" />
            </el-form-item>
            <el-form-item label="站点名" prop="name">
              <el-input v-model="form.name" placeholder="站点名称" />
            </el-form-item>
            <el-form-item label="绑定域名" prop="domains">
              <el-input v-model="form.domainsText" placeholder="多个域名用逗号分隔，首个为 canonical，如 a.com,www.a.com" />
            </el-form-item>
            <el-form-item label="默认语言" prop="default_lang">
              <el-select v-model="form.default_lang" placeholder="选择默认语言" style="width: 100%">
                <el-option v-for="l in langOptions" :key="l" :label="l" :value="l" />
              </el-select>
            </el-form-item>
            <el-form-item label="语言子集">
              <el-select
                v-model="form.langs"
                multiple
                filterable
                placeholder="站点支持的语言（不选=全部）"
                style="width: 100%"
              >
                <el-option v-for="l in langOptions" :key="l" :label="l" :value="l" />
              </el-select>
            </el-form-item>
            <el-form-item label="主题">
              <el-input v-model="form.theme" placeholder="主题名，留空回退默认主题" />
            </el-form-item>
            <el-form-item label="状态">
              <el-switch v-model="form.status" :active-value="1" :inactive-value="0" />
            </el-form-item>
            <el-form-item label="排序">
              <el-input-number v-model="form.sort" :min="0" />
            </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialog.visible = false">取消</el-button>
        <el-button type="primary" :loading="dialog.saving" @click="onSubmit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { reactive, ref, defineComponent } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { listSites, saveSite, delSite } from "/@/api/cms/site";

const langOptions = [
  "zh-CN",
  "zh-TW",
  "en-US",
  "ja-JP",
  "ko-KR",
  "th-TH",
  "vi-VN",
  "ru-RU",
  "de-DE",
  "fr-FR",
  "es-ES",
  "pt-PT",
  "ar-SA",
  "id-ID",
  "ms-MY",
];

export default defineComponent({
  name: "apiV1CmsAdminSiteList",
  setup() {
    const formRef = ref();
    const tableData = reactive<{ data: any[] }>({ data: [] });
    const dialog = reactive({
      visible: false,
      isEdit: false,
      saving: false,
    });

    const emptyForm = () => ({
      id: 0,
      code: "",
      name: "",
      domainsText: "",
      default_lang: "zh-CN",
      langs: [] as string[],
      theme: "",
      status: 1,
      sort: 0,
    });
    const form = reactive(emptyForm());

    const rules = {
      code: [{ required: true, message: "请输入站点码", trigger: "blur" }],
      name: [{ required: true, message: "请输入站点名", trigger: "blur" }],
      default_lang: [{ required: true, message: "请选择默认语言", trigger: "change" }],
    };

    const load = () => {
      listSites().then((res: any) => {
        tableData.data = res?.data?.list || [];
      });
    };

    const fillForm = (row: any) => {
      form.id = row.id || 0;
      form.code = row.code || "";
      form.name = row.name || "";
      form.domainsText = (row.domains || []).join(",");
      form.default_lang = row.default_lang || "zh-CN";
      form.langs = row.langs || [];
      form.theme = row.theme || "";
      form.status = row.status ?? 1;
      form.sort = row.sort ?? 0;
    };

    const onOpenAdd = () => {
      Object.assign(form, emptyForm());
      dialog.isEdit = false;
      dialog.visible = true;
    };

    const onOpenEdit = (row: any) => {
      fillForm(row);
      dialog.isEdit = true;
      dialog.visible = true;
    };

    const onDel = (row: any) => {
      ElMessageBox.confirm(`确认删除站点「${row.name}」？`, "提示", { type: "warning" })
        .then(() => {
          delSite(row.id).then(() => {
            ElMessage.success("删除成功");
            load();
          });
        })
        .catch(() => {});
    };

    const onSubmit = () => {
      formRef.value?.validate((valid: boolean) => {
        if (!valid) return;
        const payload = {
          id: form.id,
          code: form.code,
          name: form.name,
          domains: form.domainsText
            .split(",")
            .map((d) => d.trim())
            .filter(Boolean),
          default_lang: form.default_lang,
          langs: form.langs,
          theme: form.theme,
          status: form.status,
          sort: form.sort,
        };
        dialog.saving = true;
        saveSite(payload)
          .then(() => {
            ElMessage.success("保存成功");
            dialog.visible = false;
            load();
          })
          .finally(() => {
            dialog.saving = false;
          });
      });
    };

    load();

    return {
      formRef,
      tableData,
      dialog,
      form,
      rules,
      langOptions,
      onOpenAdd,
      onOpenEdit,
      onDel,
      onSubmit,
    };
  },
});
</script>

<style scoped>
.pms-card-container {
  max-width: 1400px;
  margin: 0 auto;
}
.pms-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin: 24px 0 20px;
  padding: 24px 28px;
  background: var(--cc-color-surface);
  border-radius: var(--cc-radius-lg);
  border: 1px solid var(--cc-color-border-light);
}
.pms-card-title {
  font-size: var(--cc-font-20);
  font-weight: 600;
  color: var(--cc-color-text-1);
  margin: 0 0 4px;
}
.pms-card-sub {
  font-size: var(--cc-font-13);
  color: var(--cc-color-text-3);
  margin: 0;
}
.pms-card-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}
.pms-card-table {
  background: var(--cc-color-surface);
  border: 1px solid var(--cc-color-border-light);
  border-radius: var(--cc-radius-lg);
  padding: var(--cc-space-5) var(--cc-space-6) var(--cc-space-3);
}
.mr5 {
  margin-right: 5px;
}
</style>
