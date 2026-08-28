<template>
  <div class="pms-card-container">
    <el-breadcrumb separator="→" class="mb15">
      <el-breadcrumb-item :to="{ path: '/' }">{{ t("message.router.home") }}</el-breadcrumb-item>
      <el-breadcrumb-item>{{ t("addon_shortio.plugin") }}</el-breadcrumb-item>
      <el-breadcrumb-item>{{ t("addon_shortio.title") }}</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="pms-card-header">
      <div>
        <h1 class="pms-card-title">{{ t("addon_shortio.title") }}</h1>
        <p class="pms-card-sub">{{ t("addon_shortio.subtitle") }}</p>
        <div v-if="domains.length > 0" class="pms-card-domain">
          <el-tag v-for="d in domains" :key="d.id" size="small" :type="d.state === 'configured' ? 'success' : 'warning'" effect="light" round>
            {{ d.hostname }} · {{ d.state }}
          </el-tag>
        </div>
      </div>
      <div class="pms-card-actions">
        <el-button size="large" type="success" class="pms-card-add" @click="onOpenAdd">
          <el-icon><ele-FolderAdd /></el-icon> {{ t("addon_shortio.add") }}
        </el-button>
      </div>
    </div>

    <!-- 工具栏：搜索 / 筛选 -->
    <div class="pms-card-toolbar">
      <el-input
        v-model="tableData.param.keyword"
        :placeholder="t('addon_shortio.keywordPlaceholder')"
        clearable
        style="width: 220px"
        @keyup.enter="load"
        @clear="load"
      />
      <el-select v-model="tableData.param.status" style="width: 140px" @change="load">
        <el-option :label="t('addon_shortio.allStatus')" :value="-1" />
        <el-option :label="t('addon_shortio.enabled')" :value="1" />
        <el-option :label="t('addon_shortio.disabled')" :value="0" />
      </el-select>
      <el-button type="primary" @click="load">
        <el-icon><ele-Search /></el-icon> {{ t("addon_shortio.search") }}
      </el-button>
      <el-button @click="onReset">
        <el-icon><ele-Refresh /></el-icon> {{ t("addon_shortio.reset") }}
      </el-button>
    </div>

    <div class="pms-card-table">
      <el-table :data="tableData.data" stripe border size="small" style="width: 100%">
        <el-table-column type="index" label="#" width="50" align="center" />
        <el-table-column :label="t('addon_shortio.code')" width="130">
          <template #default="scope">
            <el-link type="primary" :underline="false" @click="onCopy(scope.row)">
              {{ scope.row.code }}
              <el-icon style="margin-left: 4px"><ele-CopyDocument /></el-icon>
            </el-link>
          </template>
        </el-table-column>
        <el-table-column prop="name" :label="t('addon_shortio.name')" min-width="110" show-overflow-tooltip />
        <el-table-column :label="t('addon_shortio.targetUrl')" min-width="180" show-overflow-tooltip>
          <template #default="scope">
            <el-link type="primary" :underline="false" :href="scope.row.target_url" target="_blank">
              {{ scope.row.target_url }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column :label="t('addon_shortio.status')" width="90" align="center">
          <template #default="scope">
            <el-switch
              :model-value="scope.row.status === 1"
              :loading="scope.row._switching"
              @change="(v: boolean) => onToggle(scope.row, v)"
            />
          </template>
        </el-table-column>
        <el-table-column :label="t('addon_shortio.redirectType')" width="80" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.redirect_type === 301 ? 'warning' : 'success'" size="small" effect="light" round>
              {{ scope.row.redirect_type || "默认" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="t('addon_shortio.expireAt')" width="150" align="center">
          <template #default="scope">
            <span :class="{ 'expired-text': isExpired(scope.row.expire_at) }">
              {{ formatTs(scope.row.expire_at) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column :label="t('addon_shortio.clickCount')" width="90" align="center">
          <template #default="scope">
            <el-link type="primary" :underline="false" @click="onOpenStats(scope.row)">
              {{ scope.row.click_count ?? 0 }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column :label="t('addon_shortio.createdAt')" width="150" align="center">
          <template #default="scope">{{ formatTs(scope.row.created_at) }}</template>
        </el-table-column>
        <el-table-column :label="t('addon_shortio.actions')" width="170" align="center" fixed="right">
          <template #default="scope">
            <el-button link size="small" type="primary" @click="onOpenEdit(scope.row)">
              <el-icon><ele-Edit /></el-icon> {{ t("addon_shortio.edit") }}
            </el-button>
            <el-button link size="small" type="info" @click="onOpenStats(scope.row)">
              <el-icon><ele-DataLine /></el-icon> {{ t("addon_shortio.stats") }}
            </el-button>
            <el-button link size="small" type="danger" @click="onDel(scope.row)">
              <el-icon><ele-Delete /></el-icon> {{ t("addon_shortio.del") }}
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

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="dialog.visible"
      :title="dialog.isEdit ? t('addon_shortio.editTitle') : t('addon_shortio.addTitle')"
      width="560px"
      destroy-on-close
      :close-on-click-modal="false"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item :label="t('addon_shortio.code')" prop="code">
          <el-input
            v-model="form.code"
            :placeholder="t('addon_shortio.codePlaceholder')"
            maxlength="64"
            :disabled="dialog.isEdit"
          />
        </el-form-item>
        <el-form-item :label="t('addon_shortio.name')" prop="name">
          <el-input v-model="form.name" :placeholder="t('addon_shortio.namePlaceholder')" maxlength="128" />
        </el-form-item>
        <el-form-item :label="t('addon_shortio.targetUrl')" prop="target_url">
          <el-input v-model="form.target_url" :placeholder="t('addon_shortio.urlPlaceholder')" />
        </el-form-item>
        <el-form-item :label="t('addon_shortio.redirectType')">
          <el-radio-group v-model="form.redirect_type">
            <el-radio :value="0">{{ t("addon_shortio.redirectDefault") }}</el-radio>
            <el-radio :value="302">302</el-radio>
            <el-radio :value="301">301</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="t('addon_shortio.expireAt')">
          <el-date-picker
            v-model="form.expire_at"
            type="datetime"
            value-format="X"
            :placeholder="t('addon_shortio.expirePlaceholder')"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item :label="t('addon_shortio.status')">
          <el-switch
            v-model="form.status"
            :active-value="1"
            :inactive-value="0"
            :active-text="t('addon_shortio.enabled')"
            :inactive-text="t('addon_shortio.disabled')"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialog.visible = false">{{ t("addon_shortio.cancel") }}</el-button>
        <el-button type="primary" :loading="dialog.saving" @click="onSubmit">
          {{ t("addon_shortio.save") }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 点击统计抽屉 -->
    <el-drawer v-model="stats.visible" :title="t('addon_shortio.statsTitle')" size="480px" destroy-on-close>
      <template v-if="stats.data">
        <div class="stats-head">
          <div>
            <div class="stats-code">{{ stats.code }}</div>
            <div class="stats-total">
              {{ t("addon_shortio.totalClicks") }}
              <b>{{ stats.data.total }}</b>
            </div>
          </div>
          <el-radio-group v-model="stats.days" size="small" @change="onLoadStats">
            <el-radio-button :value="7">{{ t("addon_shortio.days7") }}</el-radio-button>
            <el-radio-button :value="14">{{ t("addon_shortio.days14") }}</el-radio-button>
            <el-radio-button :value="30">{{ t("addon_shortio.days30") }}</el-radio-button>
          </el-radio-group>
        </div>
        <div v-if="stats.data.daily.length === 0" class="stats-empty">
          {{ t("addon_shortio.noData") }}
        </div>
        <div v-else class="stats-bars">
          <div v-for="d in stats.data.daily" :key="d.date" class="stats-bar-row">
            <span class="stats-bar-date">{{ d.date }}</span>
            <div class="stats-bar-track">
              <div class="stats-bar-fill" :style="{ width: barWidth(d.count) }" />
            </div>
            <span class="stats-bar-count">{{ d.count }}</span>
          </div>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script lang="ts">
import { reactive, ref, defineComponent } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useI18n } from "vue-i18n";
import {
  listShortioLinks,
  saveShortioLink,
  delShortioLinks,
  enableShortioLink,
  shortioStats,
  listShortioDomains,
} from "/@/api/addon/shortio";

const formatTs = (ts: number) => {
  if (!ts) return "—";
  const d = new Date(ts * 1000);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
};

const isExpired = (ts: number) => ts > 0 && ts * 1000 < Date.now();

export default defineComponent({
  name: "apiV1AddonShortioList",
  setup() {
    const { t } = useI18n();
    const formRef = ref();
    const domains = ref<any[]>([]);
    const tableData = reactive<{ data: any[]; total: number; param: any }>({
      data: [],
      total: 0,
      param: { page: 1, limit: 20, keyword: "", status: -1 },
    });
    const dialog = reactive({ visible: false, isEdit: false, saving: false });
    const stats = reactive<{
      visible: boolean;
      id: string;
      code: string;
      days: number;
      data: any;
    }>({ visible: false, id: "", code: "", days: 7, data: null });

    const emptyForm = () => ({
      id: "",
      code: "",
      name: "",
      target_url: "",
      status: 1,
      redirect_type: 0,
      expire_at: null,
    });
    const form = reactive(emptyForm());

    const rules = {
      code: [
        {
          pattern: /^[A-Za-z0-9_-]{1,64}$/,
          message: t("addon_shortio.codeRuleMsg"),
          trigger: "blur",
        },
      ],
      target_url: [
        { required: true, message: t("addon_shortio.urlRequired"), trigger: "blur" },
        {
          pattern: /^https?:\/\/\S+$/,
          message: t("addon_shortio.urlRuleMsg"),
          trigger: "blur",
        },
      ],
    };

    const load = () => {
      listShortioLinks(tableData.param).then((res: any) => {
        tableData.data = res?.data?.list || [];
        tableData.total = res?.data?.total || 0;
      });
    };

    const loadDomains = () => {
      listShortioDomains().then((res: any) => {
        domains.value = res?.data?.list || [];
      });
    };

    const onReset = () => {
      tableData.param.keyword = "";
      tableData.param.status = -1;
      tableData.param.page = 1;
      load();
    };

    const onOpenAdd = () => {
      Object.assign(form, emptyForm());
      dialog.isEdit = false;
      dialog.visible = true;
    };

    const onOpenEdit = (row: any) => {
      Object.assign(form, emptyForm(), {
        id: row.id,
        code: row.code,
        name: row.name,
        target_url: row.target_url,
        status: row.status,
        redirect_type: row.redirect_type || 0,
        expire_at: row.expire_at || null,
      });
      dialog.isEdit = true;
      dialog.visible = true;
    };

    const onSubmit = () => {
      formRef.value?.validate((valid: boolean) => {
        if (!valid) return;
        dialog.saving = true;
        saveShortioLink(form)
          .then((res: any) => {
            ElMessage.success(t("addon_shortio.saveOk"));
            dialog.visible = false;
            load();
            if (res?.data?.shortio?.code) onCopy(res.data.shortio, false);
          })
          .finally(() => {
            dialog.saving = false;
          });
      });
    };

    const onDel = (row: any) => {
      ElMessageBox.confirm(t("addon_shortio.delConfirm", { code: row.code }), t("addon_shortio.tip"), {
        type: "warning",
      })
        .then(() => {
          delShortioLinks([row.id]).then(() => {
            ElMessage.success(t("addon_shortio.delOk"));
            load();
          });
        })
        .catch(() => {});
    };

    const onToggle = (row: any, v: boolean) => {
      const tip = v ? t("addon_shortio.enableConfirm", { code: row.code }) : t("addon_shortio.disableConfirm", { code: row.code });
      ElMessageBox.confirm(tip, t("addon_shortio.tip"), { type: "warning" })
        .then(() => {
          row._switching = true;
          enableShortioLink(row.id, v ? 1 : 0)
            .then(() => {
              ElMessage.success(v ? t("addon_shortio.enableOk") : t("addon_shortio.disableOk"));
              if (!v) {
                // short.io 归档的链接不再出现在列表中
                ElMessage.info(t("addon_shortio.archivedHint"));
                load();
              } else {
                row.status = 1;
              }
            })
            .finally(() => {
              row._switching = false;
            });
        })
        .catch(() => {});
    };

    const onCopy = (row: any, showTip = true) => {
      const url = row.short_url || `https://${row.code}`;
      navigator.clipboard
        ?.writeText(url)
        .then(() => {
          if (showTip) ElMessage.success(t("addon_shortio.copyOk", { url }));
        })
        .catch(() => {
          if (showTip) ElMessage.warning(t("addon_shortio.copyFail"));
        });
    };

    const onOpenStats = (row: any) => {
      stats.id = row.id;
      stats.code = row.code;
      stats.days = 7;
      stats.visible = true;
      onLoadStats();
    };

    const onLoadStats = () => {
      shortioStats(stats.id, stats.days).then((res: any) => {
        stats.data = res?.data || { total: 0, daily: [] };
      });
    };

    const barWidth = (count: number) => {
      const max = Math.max(1, ...(stats.data?.daily || []).map((d: any) => d.count));
      return `${Math.max(4, Math.round((count / max) * 100))}%`;
    };

    load();
    loadDomains();

    return {
      t,
      formRef,
      domains,
      tableData,
      dialog,
      stats,
      form,
      rules,
      load,
      onReset,
      onOpenAdd,
      onOpenEdit,
      onSubmit,
      onDel,
      onToggle,
      onCopy,
      onOpenStats,
      onLoadStats,
      barWidth,
      formatTs,
      isExpired,
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
.pms-card-domain {
  margin-top: 8px;
  display: flex;
  gap: 8px;
}
.pms-card-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}
.pms-card-toolbar {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 14px;
}
.pms-card-table {
  background: var(--cc-color-surface);
  border: 1px solid var(--cc-color-border-light);
  border-radius: var(--cc-radius-lg);
  padding: var(--cc-space-5) var(--cc-space-6) var(--cc-space-3);
}
.expired-text {
  color: var(--cc-color-danger);
}
.stats-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.stats-code {
  font-size: 18px;
  font-weight: 600;
  color: var(--cc-color-text-1);
}
.stats-total {
  margin-top: 4px;
  font-size: 13px;
  color: var(--cc-color-text-3);
}
.stats-total b {
  font-size: 16px;
  color: var(--cc-color-primary);
}
.stats-empty {
  padding: 40px 0;
  text-align: center;
  color: var(--cc-color-text-4);
}
.stats-bars {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.stats-bar-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.stats-bar-date {
  width: 90px;
  font-size: 12px;
  color: var(--cc-color-text-2);
  text-align: right;
  flex-shrink: 0;
}
.stats-bar-track {
  flex: 1;
  height: 14px;
  background: var(--cc-color-border-light);
  border-radius: 7px;
  overflow: hidden;
}
.stats-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--cc-color-primary), var(--cc-color-success));
  border-radius: 7px;
  transition: width 0.3s;
}
.stats-bar-count {
  width: 40px;
  font-size: 12px;
  color: var(--cc-color-text-2);
  flex-shrink: 0;
}
</style>
