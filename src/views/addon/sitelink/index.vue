<template>
  <div class="pms-card-container">
    <el-breadcrumb separator="→" class="mb15">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>插件</el-breadcrumb-item>
      <el-breadcrumb-item>站群互链</el-breadcrumb-item>
    </el-breadcrumb>
    <div class="pms-card-header">
      <div>
        <h1 class="pms-card-title">站群互链</h1>
        <p class="pms-card-sub">跨站交叉引流：在站点间互相挂链接（默认 nofollow）</p>
      </div>
      <div class="pms-card-actions">
        <el-button size="large" type="success" class="pms-card-add" @click="onOpenAdd">
          <el-icon><ele-FolderAdd /></el-icon> 新增互链
        </el-button>
      </div>
    </div>

    <div class="pms-card-table">
      <el-table :data="tableData.data" stripe border size="small" style="width: 100%">
        <el-table-column type="index" label="#" width="55" align="center" />
        <el-table-column label="源站点" width="150" show-overflow-tooltip>
          <template #default="scope">
            {{ siteName(scope.row.source_site_id) }}
          </template>
        </el-table-column>
        <el-table-column label="目标站点" width="150" show-overflow-tooltip>
          <template #default="scope">
            {{ siteName(scope.row.target_site_id) }}
          </template>
        </el-table-column>
        <el-table-column prop="anchor" label="锚文本" min-width="140" show-overflow-tooltip />
        <el-table-column prop="target_url" label="目标 URL" min-width="180" show-overflow-tooltip />
        <el-table-column prop="position" label="展示位" width="100" align="center" />
        <el-table-column label="nofollow" width="100" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.nofollow === 1 ? 'warning' : 'success'" size="small" effect="light" round>
              {{ scope.row.nofollow === 1 ? "nofollow" : "dofollow" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'info'" size="small" effect="light" round>
              {{ scope.row.status === 1 ? "启用" : "停用" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" align="center" fixed="right">
          <template #default="scope">
            <el-button link size="small" type="primary" @click="onOpenEdit(scope.row)">
              <el-icon><ele-Edit /></el-icon> 编辑
            </el-button>
            <el-button link size="small" type="danger" @click="onDel(scope.row)">
              <el-icon><ele-Delete /></el-icon> 删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination
        v-show="tableData.total > 0"
        :total="tableData.total"
        v-model:page="tableData.param.page"
        v-model:limit="tableData.param.limit"
        @pagination="load"
      />
    </div>

    <!-- 编辑弹窗 -->
    <el-dialog
      v-model="dialog.visible"
      :title="dialog.isEdit ? '编辑互链' : '新增互链'"
      width="560px"
      destroy-on-close
      :close-on-click-modal="false"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="源站点" prop="source_site_id">
          <el-select v-model="form.source_site_id" style="width: 100%">
            <el-option :label="'全部站点'" :value="0" />
            <el-option v-for="s in sites" :key="s.id" :label="`${s.name}（${s.code}）`" :value="s.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="目标站点" prop="target_site_id">
          <el-select v-model="form.target_site_id" style="width: 100%">
            <el-option v-for="s in sites" :key="s.id" :label="`${s.name}（${s.code}）`" :value="s.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="锚文本" prop="anchor">
          <el-input v-model="form.anchor" placeholder="链接文字，如 推荐站点" />
        </el-form-item>
        <el-form-item label="目标 URL" prop="target_url">
          <el-input v-model="form.target_url" placeholder="/栏目路径 或 绝对 URL" />
        </el-form-item>
        <el-form-item label="展示位" prop="position">
          <el-select v-model="form.position" style="width: 100%">
            <el-option label="footer" value="footer" />
            <el-option label="sidebar" value="sidebar" />
            <el-option label="article" value="article" />
          </el-select>
        </el-form-item>
        <el-form-item label="nofollow">
          <el-switch v-model="form.nofollow" :active-value="1" :inactive-value="0" active-text="nofollow" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="form.status" :active-value="1" :inactive-value="0" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.weigh" :min="0" />
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
import { listSitelinks, saveSitelink, delSitelink } from "/@/api/addon/sitelink";
import { listSites } from "/@/api/cms/site";

export default defineComponent({
  name: "apiV1AddonSitelinkList",
  setup() {
    const formRef = ref();
    const sites = ref<any[]>([]);
    const tableData = reactive<{ data: any[]; total: number; param: any }>({
      data: [],
      total: 0,
      param: { page: 1, limit: 20 },
    });
    const dialog = reactive({ visible: false, isEdit: false, saving: false });

    const emptyForm = () => ({
      id: 0,
      source_site_id: 0,
      target_site_id: 0,
      anchor: "",
      target_url: "",
      position: "footer",
      nofollow: 1,
      status: 1,
      weigh: 0,
    });
    const form = reactive(emptyForm());

    const rules = {
      target_site_id: [{ required: true, message: "请选择目标站点", trigger: "change" }],
      anchor: [{ required: true, message: "请输入锚文本", trigger: "blur" }],
      target_url: [{ required: true, message: "请输入目标 URL", trigger: "blur" }],
      position: [{ required: true, message: "请选择展示位", trigger: "change" }],
    };

    const siteName = (id: number) => {
      if (id === 0) return "全部站点";
      const s = sites.value.find((x) => x.id === id);
      return s ? `${s.name}（${s.code}）` : `#${id}`;
    };

    const load = () => {
      listSitelinks(tableData.param).then((res: any) => {
        tableData.data = res?.data?.list || [];
        tableData.total = res?.data?.total || 0;
      });
    };

    const loadSites = () => {
      listSites().then((res: any) => {
        sites.value = res?.data?.list || [];
      });
    };

    const onOpenAdd = () => {
      Object.assign(form, emptyForm());
      dialog.isEdit = false;
      dialog.visible = true;
    };

    const onOpenEdit = (row: any) => {
      form.id = row.id;
      form.source_site_id = row.source_site_id;
      form.target_site_id = row.target_site_id;
      form.anchor = row.anchor;
      form.target_url = row.target_url;
      form.position = row.position;
      form.nofollow = row.nofollow;
      form.status = row.status;
      form.weigh = row.weigh;
      dialog.isEdit = true;
      dialog.visible = true;
    };

    const onDel = (row: any) => {
      ElMessageBox.confirm(`确认删除互链「${row.anchor}」？`, "提示", { type: "warning" })
        .then(() => {
          delSitelink(row.id).then(() => {
            ElMessage.success("删除成功");
            load();
          });
        })
        .catch(() => {});
    };

    const onSubmit = () => {
      formRef.value?.validate((valid: boolean) => {
        if (!valid) return;
        dialog.saving = true;
        saveSitelink(form)
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
    loadSites();

    return {
      formRef,
      sites,
      tableData,
      dialog,
      form,
      rules,
      siteName,
      load,
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
</style>
