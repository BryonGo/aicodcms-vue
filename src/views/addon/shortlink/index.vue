<template>
  <div class="pms-card-container">
    <el-breadcrumb separator="→" class="mb15">
      <el-breadcrumb-item :to="{ path: '/' }">{{ t("message.router.home") }}</el-breadcrumb-item>
      <el-breadcrumb-item>{{ t("message.addon_shortlink.plugin") }}</el-breadcrumb-item>
      <el-breadcrumb-item>{{ t("message.addon_shortlink.title") }}</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="pms-card-header">
      <div>
        <h1 class="pms-card-title">{{ t("message.addon_shortlink.title") }}</h1>
        <p class="pms-card-sub">{{ t("message.addon_shortlink.subtitle") }}</p>
      </div>
      <div class="pms-card-actions">
        <el-button size="large" type="success" class="pms-card-add" @click="onOpenAdd">
          <el-icon><ele-FolderAdd /></el-icon> {{ t("message.addon_shortlink.add") }}
        </el-button>
      </div>
    </div>

    <!-- 工具栏：搜索 / 筛选 -->
    <div class="pms-card-toolbar">
      <el-input
        v-model="tableData.param.keyword"
        :placeholder="t('message.addon_shortlink.keywordPlaceholder')"
        clearable
        style="width: 220px"
        @keyup.enter="load"
        @clear="load"
      />
      <el-select v-model="tableData.param.status" style="width: 120px" @change="load">
        <el-option :label="t('message.addon_shortlink.allStatus')" :value="-1" />
        <el-option :label="t('message.addon_shortlink.enabled')" :value="1" />
        <el-option :label="t('message.addon_shortlink.disabled')" :value="0" />
      </el-select>
      <el-button type="primary" @click="load">
        <el-icon><ele-Search /></el-icon> {{ t("message.addon_shortlink.search") }}
      </el-button>
      <el-button @click="onReset">
        <el-icon><ele-Refresh /></el-icon> {{ t("message.addon_shortlink.reset") }}
      </el-button>
    </div>

    <div class="pms-card-table">
      <el-table :data="tableData.data" stripe border size="small" style="width: 100%">
        <el-table-column type="index" label="#" width="50" align="center" />
        <el-table-column :label="t('message.addon_shortlink.code')" width="130">
          <template #default="scope">
            <el-link type="primary" :underline="false" @click="onCopy(scope.row.code)">
              {{ scope.row.code }}
              <el-icon style="margin-left: 4px"><ele-CopyDocument /></el-icon>
            </el-link>
          </template>
        </el-table-column>
        <el-table-column prop="name" :label="t('message.addon_shortlink.name')" min-width="120" show-overflow-tooltip />
        <el-table-column :label="t('message.addon_shortlink.targetUrl')" min-width="200" show-overflow-tooltip>
          <template #default="scope">
            <el-link type="primary" :underline="false" :href="scope.row.target_url" target="_blank">
              {{ scope.row.target_url }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column :label="t('message.addon_shortlink.status')" width="90" align="center">
          <template #default="scope">
            <el-switch
              :model-value="scope.row.status === 1"
              :loading="scope.row._switching"
              @change="(v: boolean) => onToggle(scope.row, v)"
            />
          </template>
        </el-table-column>
        <el-table-column :label="t('message.addon_shortlink.redirectType')" width="80" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.redirect_type === 301 ? 'warning' : 'success'" size="small" effect="light" round>
              {{ scope.row.redirect_type }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="t('message.addon_shortlink.mainCta')" width="110" align="center">
          <template #default="scope">
            <el-tag v-if="scope.row.is_default_cta === 1" type="danger" size="small" effect="dark" round>
              {{ t("message.addon_shortlink.mainCtaTag") }}
            </el-tag>
            <el-button
              v-else
              link
              size="small"
              type="primary"
              @click="onSetDefault(scope.row, 1)"
            >
              {{ t("message.addon_shortlink.setDefault") }}
            </el-button>
          </template>
        </el-table-column>
        <el-table-column :label="t('message.addon_shortlink.expireAt')" width="150" align="center">
          <template #default="scope">
            <span :class="{ 'expired-text': isExpired(scope.row.expire_at) }">
              {{ formatTs(scope.row.expire_at) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column :label="t('message.addon_shortlink.clickCount')" width="90" align="center">
          <template #default="scope">
            <el-link type="primary" :underline="false" @click="onOpenStats(scope.row)">
              {{ scope.row.click_count ?? 0 }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column :label="t('message.addon_shortlink.createdAt')" width="150" align="center">
          <template #default="scope">{{ formatTs(scope.row.created_at) }}</template>
        </el-table-column>
        <el-table-column :label="t('message.addon_shortlink.actions')" width="170" align="center" fixed="right">
          <template #default="scope">
            <el-button link size="small" type="primary" @click="onOpenEdit(scope.row)">
              <el-icon><ele-Edit /></el-icon> {{ t("message.addon_shortlink.edit") }}
            </el-button>
            <el-button link size="small" type="info" @click="onOpenStats(scope.row)">
              <el-icon><ele-DataLine /></el-icon> {{ t("message.addon_shortlink.stats") }}
            </el-button>
            <el-button link size="small" type="danger" @click="onDel(scope.row)">
              <el-icon><ele-Delete /></el-icon> {{ t("message.addon_shortlink.del") }}
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
      :title="dialog.isEdit ? t('message.addon_shortlink.editTitle') : t('message.addon_shortlink.addTitle')"
      width="560px"
      destroy-on-close
      :close-on-click-modal="false"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item :label="t('message.addon_shortlink.code')" prop="code">
          <el-input
            v-model="form.code"
            :placeholder="t('message.addon_shortlink.codePlaceholder')"
            maxlength="16"
          >
            <template #append>
              <el-button @click="onGenCode">{{ t("message.addon_shortlink.random") }}</el-button>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item :label="t('message.addon_shortlink.name')" prop="name">
          <el-input v-model="form.name" :placeholder="t('message.addon_shortlink.namePlaceholder')" maxlength="128" />
        </el-form-item>
        <el-form-item :label="t('message.addon_shortlink.targetUrl')" prop="target_url">
          <el-input v-model="form.target_url" :placeholder="t('message.addon_shortlink.urlPlaceholder')" />
        </el-form-item>
        <el-form-item :label="t('message.addon_shortlink.redirectType')">
          <el-radio-group v-model="form.redirect_type">
            <el-radio :value="302">{{ t("message.addon_shortlink.redirect302") }}</el-radio>
            <el-radio :value="301">{{ t("message.addon_shortlink.redirect301") }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="t('message.addon_shortlink.expireAt')">
          <el-date-picker
            v-model="form.expire_at"
            type="datetime"
            value-format="X"
            :placeholder="t('message.addon_shortlink.expirePlaceholder')"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item :label="t('message.addon_shortlink.status')">
          <el-switch
            v-model="form.status"
            :active-value="1"
            :inactive-value="0"
            :active-text="t('message.addon_shortlink.enabled')"
            :inactive-text="t('message.addon_shortlink.disabled')"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialog.visible = false">{{ t("message.addon_shortlink.cancel") }}</el-button>
        <el-button type="primary" :loading="dialog.saving" @click="onSubmit">
          {{ t("message.addon_shortlink.save") }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 点击统计抽屉 -->
    <el-drawer v-model="stats.visible" :title="t('message.addon_shortlink.statsTitle')" size="480px" destroy-on-close>
      <template v-if="stats.data">
        <div class="stats-head">
          <div>
            <div class="stats-code">{{ stats.code }}</div>
            <div class="stats-total">
              {{ t("message.addon_shortlink.totalClicks") }}
              <b>{{ stats.data.total }}</b>
            </div>
          </div>
          <el-radio-group v-model="stats.days" size="small" @change="onLoadStats">
            <el-radio-button :value="7">{{ t("message.addon_shortlink.days7") }}</el-radio-button>
            <el-radio-button :value="14">{{ t("message.addon_shortlink.days14") }}</el-radio-button>
            <el-radio-button :value="30">{{ t("message.addon_shortlink.days30") }}</el-radio-button>
          </el-radio-group>
        </div>
        <div v-if="stats.data.daily.length === 0" class="stats-empty">
          {{ t("message.addon_shortlink.noData") }}
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
  listShortlinks,
  saveShortlink,
  delShortlinks,
  enableShortlink,
  setDefaultShortlink,
  shortlinkStats,
} from "/@/api/addon/shortlink";

// 短链公共域名（与 cms.yaml shortlink.host 一致；复制时拼接完整短链）
const SHORT_HOST = "go.thdmid.com";

const randomCode = (len = 6) => {
  const alphabet = "23456789abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ";
  const buf = new Uint32Array(len);
  crypto.getRandomValues(buf);
  let out = "";
  for (let i = 0; i < len; i++) out += alphabet[buf[i] % alphabet.length];
  return out;
};

const formatTs = (ts: number) => {
  if (!ts) return "—";
  const d = new Date(ts * 1000);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
};

const isExpired = (ts: number) => ts > 0 && ts * 1000 < Date.now();

export default defineComponent({
  name: "apiV1AddonShortlinkList",
  setup() {
    const { t } = useI18n();
    const formRef = ref();
    const tableData = reactive<{ data: any[]; total: number; param: any }>({
      data: [],
      total: 0,
      param: { page: 1, limit: 20, keyword: "", status: -1 },
    });
    const dialog = reactive({ visible: false, isEdit: false, saving: false });
    const stats = reactive<{
      visible: boolean;
      id: number;
      code: string;
      days: number;
      data: any;
    }>({ visible: false, id: 0, code: "", days: 7, data: null });

    const emptyForm = () => ({
      id: 0,
      code: "",
      name: "",
      target_url: "",
      status: 1,
      redirect_type: 302,
      expire_at: null,
    });
    const form = reactive(emptyForm());

    const rules = {
      code: [
        {
          pattern: /^[A-Za-z0-9]{2,16}$/,
          message: t("message.addon_shortlink.codeRuleMsg"),
          trigger: "blur",
        },
      ],
      target_url: [
        { required: true, message: t("message.addon_shortlink.urlRequired"), trigger: "blur" },
        {
          pattern: /^https?:\/\/\S+$/,
          message: t("message.addon_shortlink.urlRuleMsg"),
          trigger: "blur",
        },
      ],
    };

    const load = () => {
      listShortlinks(tableData.param).then((res: any) => {
        tableData.data = res?.data?.list || [];
        tableData.total = res?.data?.total || 0;
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
        redirect_type: row.redirect_type,
        expire_at: row.expire_at || null,
      });
      dialog.isEdit = true;
      dialog.visible = true;
    };

    const onGenCode = () => {
      form.code = randomCode();
    };

    const onSubmit = () => {
      formRef.value?.validate((valid: boolean) => {
        if (!valid) return;
        dialog.saving = true;
        saveShortlink(form)
          .then((res: any) => {
            ElMessage.success(t("message.addon_shortlink.saveOk"));
            dialog.visible = false;
            load();
            if (res?.data?.code) onCopy(res.data.code, false);
          })
          .finally(() => {
            dialog.saving = false;
          });
      });
    };

    const onDel = (row: any) => {
      ElMessageBox.confirm(t("message.addon_shortlink.delConfirm", { code: row.code }), t("message.addon_shortlink.tip"), {
        type: "warning",
      })
        .then(() => {
          delShortlinks([row.id]).then(() => {
            ElMessage.success(t("message.addon_shortlink.delOk"));
            load();
          });
        })
        .catch(() => {});
    };

    const onToggle = (row: any, v: boolean) => {
      row._switching = true;
      enableShortlink(row.id, v ? 1 : 0)
        .then(() => {
          row.status = v ? 1 : 0;
          ElMessage.success(v ? t("message.addon_shortlink.enableOk") : t("message.addon_shortlink.disableOk"));
        })
        .finally(() => {
          row._switching = false;
        });
    };

    const onSetDefault = (row: any, enable: number) => {
      const action =
        enable === 1 ? t("message.addon_shortlink.setDefaultConfirm") : t("message.addon_shortlink.cancelCtaConfirm");
      ElMessageBox.confirm(t("message.addon_shortlink.setDefaultAsk", { code: row.code, action }), t("message.addon_shortlink.tip"), {
        type: "warning",
      })
        .then(() => {
          setDefaultShortlink(row.id, enable).then(() => {
            ElMessage.success(enable === 1 ? t("message.addon_shortlink.setDefaultOk") : t("message.addon_shortlink.cancelCtaOk"));
            load();
          });
        })
        .catch(() => {});
    };

    const onCopy = (code: string, showTip = true) => {
      const url = `https://${SHORT_HOST}/${code}`;
      navigator.clipboard
        ?.writeText(url)
        .then(() => {
          if (showTip) ElMessage.success(t("message.addon_shortlink.copyOk", { url }));
        })
        .catch(() => {
          if (showTip) ElMessage.warning(t("message.addon_shortlink.copyFail"));
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
      shortlinkStats(stats.id, stats.days).then((res: any) => {
        stats.data = res?.data || { total: 0, daily: [] };
      });
    };

    const barWidth = (count: number) => {
      const max = Math.max(1, ...(stats.data?.daily || []).map((d: any) => d.count));
      return `${Math.max(4, Math.round((count / max) * 100))}%`;
    };

    load();

    return {
      t,
      formRef,
      tableData,
      dialog,
      stats,
      form,
      rules,
      load,
      onReset,
      onOpenAdd,
      onOpenEdit,
      onGenCode,
      onSubmit,
      onDel,
      onToggle,
      onSetDefault,
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
