<template>
  <div class="pms-card-container">
    <el-breadcrumb separator="→" class="mb15">
      <el-breadcrumb-item :to="{ path: '/' }">{{ $t('message.addon_sitelink.breadcrumbHome') }}</el-breadcrumb-item>
      <el-breadcrumb-item>{{ $t('message.addon_sitelink.breadcrumbModule') }}</el-breadcrumb-item>
      <el-breadcrumb-item>{{ $t('message.addon_sitelink.title') }}</el-breadcrumb-item>
    </el-breadcrumb>
    <div class="pms-card-header">
      <div>
        <h1 class="pms-card-title">{{ $t('message.addon_sitelink.title') }}</h1>
        <p class="pms-card-sub">
          {{ $t('message.addon_sitelink.subtitle') }}
        </p>
      </div>
      <div class="pms-card-actions">
        <el-button
          size="large"
          type="success"
          class="pms-card-add"
          @click="onOpenAdd"
        >
          <el-icon><ele-FolderAdd /></el-icon> {{ $t('message.addon_sitelink.btnAdd') }}
        </el-button>
      </div>
    </div>

    <div class="pms-card-table">
      <el-table
        :data="tableData.data"
        stripe
        border
        size="small"
        style="width: 100%"
      >
        <el-table-column type="index" label="#" width="55" align="center" />
        <el-table-column :label="$t('message.addon_sitelink.colSourceSite')" width="150" show-overflow-tooltip>
          <template #default="scope">
            {{ siteName(scope.row.source_site_id) }}
          </template>
        </el-table-column>
        <el-table-column :label="$t('message.addon_sitelink.colTargetSite')" width="150" show-overflow-tooltip>
          <template #default="scope">
            {{ siteName(scope.row.target_site_id) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="anchor"
          :label="$t('message.addon_sitelink.colAnchor')"
          min-width="140"
          show-overflow-tooltip
        />
        <el-table-column
          prop="target_url"
          :label="$t('message.addon_sitelink.colTargetUrl')"
          min-width="180"
          show-overflow-tooltip
        />
        <el-table-column
          prop="position"
          :label="$t('message.addon_sitelink.colPosition')"
          width="100"
          align="center"
        />
        <el-table-column label="nofollow" width="100" align="center">
          <template #default="scope">
            <el-tag
              :type="scope.row.nofollow === 1 ? 'warning' : 'success'"
              size="small"
              effect="light"
              round
            >
              {{ scope.row.nofollow === 1 ? "nofollow" : "dofollow" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="$t('message.addon_sitelink.colStatus')" width="90" align="center">
          <template #default="scope">
            <el-tag
              :type="scope.row.status === 1 ? 'success' : 'info'"
              size="small"
              effect="light"
              round
            >
              {{ scope.row.status === 1 ? $t('message.addon_sitelink.statusOn') : $t('message.addon_sitelink.statusOff') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="$t('message.common.colOperation')" width="160" align="center" fixed="right">
          <template #default="scope">
            <el-button
              link
              size="small"
              type="primary"
              @click="onOpenEdit(scope.row)"
            >
              <el-icon><ele-Edit /></el-icon> {{ $t('message.common.btnEdit') }}
            </el-button>
            <el-button
              link
              size="small"
              type="danger"
              @click="onDel(scope.row)"
            >
              <el-icon><ele-Delete /></el-icon> {{ $t('message.common.btnDelete') }}
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
    <ProDrawer
      v-model="dialog.visible"
      :title="dialog.isEdit ? $t('message.addon_sitelink.dialogEdit') : $t('message.addon_sitelink.dialogAdd')"
      :size="560"
      destroy-on-close
      :close-on-click-modal="false"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item :label="$t('message.addon_sitelink.colSourceSite')" prop="source_site_id">
          <el-select v-model="form.source_site_id" style="width: 100%">
            <el-option :label="$t('message.addon_sitelink.allSites')" :value="0" />
            <el-option
              v-for="s in sites"
              :key="s.id"
              :label="`${s.name}（${s.code}）`"
              :value="s.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('message.addon_sitelink.colTargetSite')" prop="target_site_id">
          <el-select v-model="form.target_site_id" style="width: 100%">
            <el-option
              v-for="s in sites"
              :key="s.id"
              :label="`${s.name}（${s.code}）`"
              :value="s.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('message.addon_sitelink.colAnchor')" prop="anchor">
          <el-input v-model="form.anchor" :placeholder="$t('message.addon_sitelink.phAnchor')" />
        </el-form-item>
        <el-form-item :label="$t('message.addon_sitelink.colTargetUrl')" prop="target_url">
          <el-input
            v-model="form.target_url"
            :placeholder="$t('message.addon_sitelink.phTargetUrl')"
          />
        </el-form-item>
        <el-form-item :label="$t('message.addon_sitelink.colPosition')" prop="position">
          <el-select v-model="form.position" style="width: 100%">
            <el-option label="footer" value="footer" />
            <el-option label="sidebar" value="sidebar" />
            <el-option label="article" value="article" />
          </el-select>
        </el-form-item>
        <el-form-item label="nofollow">
          <el-switch
            v-model="form.nofollow"
            :active-value="1"
            :inactive-value="0"
            active-text="nofollow"
          />
        </el-form-item>
        <el-form-item :label="$t('message.addon_sitelink.colStatus')">
          <el-switch
            v-model="form.status"
            :active-value="1"
            :inactive-value="0"
          />
        </el-form-item>
        <el-form-item :label="$t('message.common.colSort')">
          <el-input-number v-model="form.weigh" :min="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialog.visible = false">{{ $t('message.common.btnCancel') }}</el-button>
        <el-button type="primary" :loading="dialog.saving" @click="onSubmit"
          >{{ $t('message.common.btnSave') }}</el-button
        >
      </template>
    </ProDrawer>
  </div>
</template>

<script lang="ts">
import { reactive, ref, defineComponent } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useI18n } from "vue-i18n";
import {
  listSitelinks,
  saveSitelink,
  delSitelink,
} from "/@/api/addon/sitelink";
import { listSites } from "/@/api/cms/site";
import ProDrawer from "/@/components/pro/ProDrawer.vue";

export default defineComponent({
  name: "apiV1AddonSitelinkList",
  components: { ProDrawer },
  setup() {
    const { t } = useI18n();
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
      target_site_id: [
        { required: true, message: t("message.addon_sitelink.ruleTargetSite"), trigger: "change" },
      ],
      anchor: [{ required: true, message: t("message.addon_sitelink.ruleAnchor"), trigger: "blur" }],
      target_url: [
        { required: true, message: t("message.addon_sitelink.ruleTargetUrl"), trigger: "blur" },
      ],
      position: [
        { required: true, message: t("message.addon_sitelink.rulePosition"), trigger: "change" },
      ],
    };

    const siteName = (id: number) => {
      if (id === 0) return t("message.addon_sitelink.allSites");
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
      ElMessageBox.confirm(t("message.addon_sitelink.delConfirm", { anchor: row.anchor }), t("message.common.confirmTitle"), {
        type: "warning",
      })
        .then(() => {
          delSitelink(row.id).then(() => {
            ElMessage.success(t("message.common.msgDeleteOk"));
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
            ElMessage.success(t("message.common.msgSaveOk"));
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
