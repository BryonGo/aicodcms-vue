<template>
  <div class="pf-page">
    <el-breadcrumb separator="→">
      <el-breadcrumb-item :to="{ path: '/' }"
        ><el-icon><HomeFilled /></el-icon>
        {{ $t("message.sdk.platform.breadcrumbHome") }}</el-breadcrumb-item
      >
      <el-breadcrumb-item>{{
        $t("message.sdk.platform.breadcrumbSdk")
      }}</el-breadcrumb-item>
      <el-breadcrumb-item>{{
        $t("message.sdk.platform.hougongToolTitle")
      }}</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="pf-header">
      <div>
        <h1 class="pf-title">
          {{ $t("message.sdk.platform.hougongToolTitle") }}
        </h1>
        <p class="pf-subtitle">
          {{ $t("message.sdk.platform.hougongToolSubtitle") }}
        </p>
      </div>
      <div class="pf-header-actions">
        <el-button
          :disabled="!selection.length"
          @click="onBatch(false)"
          >{{ $t("message.sdk.platform.btnBatchDisable") }}</el-button
        >
        <el-button
          :disabled="!selection.length"
          @click="onBatch(true)"
          >{{ $t("message.sdk.platform.btnBatchEnable") }}</el-button
        >
        <el-button type="primary" @click="openTool()">{{
          $t("message.sdk.platform.btnCreateTool")
        }}</el-button>
      </div>
    </div>

    <div class="pf-filter-card">
      <el-form :inline="true" @submit.prevent>
        <el-form-item :label="$t('message.sdk.platform.filterCategory')">
          <el-select
            v-model="q.category"
            clearable
            style="width: 140px"
            @change="load"
          >
            <el-option
              :label="$t('message.sdk.platform.categoryAll')"
              value=""
            />
            <el-option label="image" value="image" />
            <el-option label="video" value="video" />
            <el-option label="enhance" value="enhance" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('message.sdk.platform.filterStatus')">
          <el-select
            v-model="q.status"
            clearable
            style="width: 140px"
            @change="load"
          >
            <el-option :label="$t('message.sdk.platform.statusAll')" value="" />
            <el-option
              :label="$t('message.common.enabled')"
              :value="1"
            />
            <el-option
              :label="$t('message.common.disabled')"
              :value="0"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('message.sdk.platform.filterKeyword')">
          <el-input
            v-model="q.query"
            placeholder="name / code"
            clearable
            style="width: 200px"
            @keyup.enter="load"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="load">{{
            $t("message.sdk.platform.btnQuery")
          }}</el-button>
          <el-button @click="onReset">{{
            $t("message.common.btnReset")
          }}</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="pf-table-card">
      <el-table
        :data="rows"
        border
        v-loading="loading"
        class="pf-table"
        :empty-text="$t('message.common.noData')"
        @selection-change="onSelectionChange"
      >
        <el-table-column type="selection" width="46" />
        <el-table-column
          prop="code"
          :label="$t('message.sdk.platform.colToolCode')"
          width="150"
          show-overflow-tooltip
        />
        <el-table-column
          prop="name"
          :label="$t('message.sdk.platform.colToolName')"
          min-width="140"
          show-overflow-tooltip
        />
        <el-table-column
          prop="category"
          :label="$t('message.sdk.platform.filterCategory')"
          width="110"
        />
        <el-table-column
          prop="engine"
          label="engine"
          width="100"
        />
        <el-table-column
          prop="workflow"
          label="workflow"
          width="150"
          show-overflow-tooltip
        />
        <el-table-column
          :label="$t('message.sdk.platform.colTemplateCount')"
          width="90"
          align="center"
        >
          <template #default="{ row }">
            <span class="pf-mono">{{ row.templateCount || 0 }}</span>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('message.sdk.platform.colSwitch')"
          width="100"
          align="center"
        >
          <template #default="{ row }">
            <el-switch
              :model-value="row.status === 1"
              @change="(v: boolean) => onToggleOne(row, v)"
            />
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('message.sdk.platform.colActions')"
          width="220"
          fixed="right"
        >
          <template #default="{ row }">
            <el-button link type="primary" @click="openTool(row)">{{
              $t("message.common.btnEdit")
            }}</el-button>
            <el-button link type="primary" @click="openTemplates(row)">{{
              $t("message.sdk.platform.btnTemplates")
            }}</el-button>
            <el-button link type="danger" @click="onDeleteTool(row)">{{
              $t("message.common.btnDelete")
            }}</el-button>
          </template>
        </el-table-column>
        <!--
          空表格要说清"为什么空"：创作工具按站点隔离，后台当前站点是「默认站」时
          这里一条都不会有（工具都在 hougong 站下），而默认的「暂无数据」看起来
          像功能坏了。实测踩到：运营打开这个页面以为工具丢了。
        -->
        <template #empty>
          <div class="hg-empty">
            <p v-if="currentSiteName">
              {{
                $t("message.sdk.platform.toolsEmptyOnSite", {
                  site: currentSiteName,
                })
              }}
            </p>
            <p v-else>{{ $t("message.sdk.platform.toolsEmptyNoSite") }}</p>
          </div>
        </template>
      </el-table>
    </div>

    <!-- 工具编辑 -->
    <el-dialog
      v-model="toolDialog"
      :title="
        toolForm.id
          ? $t('message.common.btnEditTool')
          : $t('message.sdk.platform.btnCreateTool')
      "
      width="720px"
    >
      <el-form label-width="120px">
        <el-form-item :label="$t('message.sdk.platform.colToolCode')">
          <el-input v-model="toolForm.code" placeholder="upscale / face-swap" />
        </el-form-item>
        <el-form-item :label="$t('message.sdk.platform.colToolName')">
          <el-input v-model="toolForm.name" />
        </el-form-item>
        <el-form-item :label="$t('message.sdk.platform.filterCategory')">
          <el-select v-model="toolForm.category" style="width: 100%">
            <el-option label="image" value="image" />
            <el-option label="video" value="video" />
            <el-option label="enhance" value="enhance" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('message.sdk.platform.colToolInput')">
          <el-select v-model="toolForm.input" style="width: 100%">
            <el-option
              v-for="opt in INPUT_OPTIONS"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('message.sdk.platform.colSummary')">
          <el-input v-model="toolForm.summary" maxlength="120" show-word-limit />
        </el-form-item>
        <el-form-item label="icon">
          <el-input v-model="toolForm.icon" placeholder="i-lucide-sparkles" />
        </el-form-item>
        <el-form-item :label="$t('message.sdk.platform.colToolCover')">
          <el-input v-model="toolForm.cover" :placeholder="$t('message.sdk.platform.phToolCover')" />
        </el-form-item>
        <el-form-item :label="$t('message.sdk.platform.colToolBadge')">
          <el-input v-model="toolForm.badge" maxlength="8" show-word-limit :placeholder="$t('message.sdk.platform.phToolBadge')" />
        </el-form-item>
        <el-form-item :label="$t('message.sdk.platform.colToolTags')">
          <el-input
            v-model="toolForm.tags"
            maxlength="255"
            :placeholder="$t('message.sdk.platform.phToolTags')"
          />
        </el-form-item>
        <el-form-item label="engine / workflow">
          <el-input v-model="toolForm.engine" placeholder="comfy" style="width: 40%" />
          <el-input
            v-model="toolForm.workflow"
            placeholder="upscale"
            style="width: 55%; margin-left: 5%"
          />
        </el-form-item>
        <el-form-item :label="$t('message.sdk.platform.colPromptPreset')">
          <el-input
            v-model="toolForm.promptPreset"
            type="textarea"
            :rows="2"
            :placeholder="$t('message.sdk.platform.promptPresetHint')"
          />
        </el-form-item>
        <el-form-item :label="$t('message.sdk.platform.colNegativePreset')">
          <el-input v-model="toolForm.negativePreset" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item :label="$t('message.sdk.platform.colLoraCodes')">
          <el-input
            v-model="loraText"
            type="textarea"
            :rows="2"
            :placeholder="$t('message.sdk.platform.loraCodesHint')"
          />
        </el-form-item>
        <el-form-item :label="$t('message.sdk.platform.colParams')">
          <el-input
            v-model="paramsText"
            type="textarea"
            :rows="2"
            :placeholder="PARAMS_PLACEHOLDER"
          />
        </el-form-item>
        <el-form-item label="sort / status">
          <el-input-number v-model="toolForm.sort" :min="0" />
          <el-switch
            v-model="toolForm.status"
            :active-value="1"
            :inactive-value="0"
            style="margin-left: 16px"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="toolDialog = false">{{
          $t("message.common.btnCancel")
        }}</el-button>
        <el-button type="primary" :loading="saving" @click="saveTool">{{
          $t("message.common.btnSave")
        }}</el-button>
      </template>
    </el-dialog>

    <!-- 模板管理 -->
    <el-drawer
      v-model="tplDrawer"
      :title="`${toolName} · ${$t('message.sdk.platform.btnTemplates')}`"
      size="720px"
    >
      <div style="margin-bottom: 12px">
        <el-button type="primary" size="small" @click="openTpl()">{{
          $t("message.sdk.platform.btnCreateTemplate")
        }}</el-button>
      </div>
      <el-table :data="templates" border size="small">
        <el-table-column prop="code" label="code" width="130" />
        <el-table-column prop="name" :label="$t('message.sdk.platform.colToolName')" min-width="120" />
        <el-table-column
          prop="prompt"
          :label="$t('message.sdk.platform.colPromptPreset')"
          min-width="180"
          show-overflow-tooltip
        />
        <el-table-column :label="$t('message.sdk.platform.colIsCard')" width="110" align="center">
          <template #default="{ row }">
            <el-switch
              :model-value="row.isCard !== 0"
              @change="(v: boolean) => onToggleCard(row, v)"
            />
          </template>
        </el-table-column>
        <el-table-column :label="$t('message.sdk.platform.colSwitch')" width="80" align="center">
          <template #default="{ row }">
            <el-switch
              :model-value="row.status === 1"
              @change="(v: boolean) => onToggleTpl(row, v)"
            />
          </template>
        </el-table-column>
        <el-table-column :label="$t('message.sdk.platform.colActions')" width="130">
          <template #default="{ row }">
            <el-button link type="primary" @click="openTpl(row)">{{
              $t("message.common.btnEdit")
            }}</el-button>
            <el-button link type="danger" @click="onDeleteTpl(row)">{{
              $t("message.common.btnDelete")
            }}</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-dialog
        v-model="tplDialog"
        :title="
          tplForm.id
            ? $t('message.common.btnEditTemplate')
            : $t('message.sdk.platform.btnCreateTemplate')
        "
        width="560px"
        append-to-body
      >
        <el-form label-width="110px">
          <el-form-item label="code">
            <el-input v-model="tplForm.code" />
          </el-form-item>
          <el-form-item :label="$t('message.sdk.platform.colToolName')">
            <el-input v-model="tplForm.name" />
          </el-form-item>
          <el-form-item :label="$t('message.sdk.platform.colSummary')">
            <el-input v-model="tplForm.summary" />
          </el-form-item>
          <el-form-item :label="$t('message.sdk.platform.colPromptPreset')">
            <el-input v-model="tplForm.prompt" type="textarea" :rows="3" />
          </el-form-item>
          <el-form-item :label="$t('message.sdk.platform.colNegativePreset')">
            <el-input v-model="tplForm.negativePrompt" type="textarea" :rows="2" />
          </el-form-item>
          <el-form-item :label="$t('message.sdk.platform.colParams')">
            <el-input
              v-model="tplParamsText"
              type="textarea"
              :rows="2"
              placeholder='{"denoise":0.55}'
            />
          </el-form-item>
          <el-form-item :label="$t('message.sdk.platform.colToolCover')">
            <el-input
              v-model="tplForm.cover"
              :placeholder="$t('message.sdk.platform.phToolCoverTpl')"
            />
          </el-form-item>
          <el-form-item :label="$t('message.sdk.platform.colToolBadge')">
            <el-input
              v-model="tplForm.badge"
              maxlength="8"
              show-word-limit
              :placeholder="$t('message.sdk.platform.phToolBadge')"
            />
          </el-form-item>
          <el-form-item :label="$t('message.sdk.platform.colToolTags')">
            <el-input
              v-model="tplForm.tags"
              maxlength="255"
              :placeholder="$t('message.sdk.platform.phToolTagsTpl')"
            />
          </el-form-item>
          <el-form-item :label="$t('message.sdk.platform.colIsCard')">
            <el-switch v-model="tplForm.isCard" :active-value="1" :inactive-value="0" />
            <span style="margin-left: 12px; color: var(--el-text-color-secondary); font-size: 12px">
              {{ $t("message.sdk.platform.isCardHint") }}
            </span>
          </el-form-item>
          <el-form-item label="sort / status">
            <el-input-number v-model="tplForm.sort" :min="0" />
            <el-switch
              v-model="tplForm.status"
              :active-value="1"
              :inactive-value="0"
              style="margin-left: 16px"
            />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="tplDialog = false">{{
            $t("message.common.btnCancel")
          }}</el-button>
          <el-button type="primary" :loading="saving" @click="saveTpl">{{
            $t("message.common.btnSave")
          }}</el-button>
        </template>
      </el-dialog>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { HomeFilled } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { computed, onMounted, reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useSiteInfo } from "/@/stores/siteInfo";
import {
  createHougongTemplate,
  createHougongTool,
  deleteHougongTemplate,
  deleteHougongTool,
  getHougongTemplates,
  getHougongTools,
  setHougongTemplateStatus,
  setHougongToolStatus,
  updateHougongTemplate,
  updateHougongTool,
  type HougongTool,
  type HougongToolTemplate,
  type TemplateInput,
  type ToolInput,
  type ToolParams,
} from "/@/api/addon/hougongTool";

const { t } = useI18n();
// 当前站点名只用于"空表格时说清楚是哪个站为空"（工具按站点隔离，切错站就一条都没有）。
const currentSiteName = computed(() => useSiteInfo().currentSite?.name || "");

const loading = ref(false);
const saving = ref(false);
const rows = ref<HougongTool[]>([]);
const selection = ref<HougongTool[]>([]);
const q = reactive<{ category: string; status: number | ""; query: string }>({
  category: "",
  status: "",
  query: "",
});

/** 工具表单：纯前端结构，提交前把 lora/params 文本转成后端字段 */
/** 输入形态选项：值即后端的 input，标签写清"前台会长出什么面板"。 */
const INPUT_OPTIONS = [
  { value: "text", label: "text · 只有提示词（文生图 / 文生视频）" },
  { value: "image", label: "image · 单图（放大 / 脱衣 / 换背景 / 图生视频…）" },
  { value: "image_pair", label: "image_pair · 双图：目标图 + 人脸图（换脸）" },
  { value: "image_mask", label: "image_mask · 图 + 涂抹蒙版（局部重绘）" },
  { value: "video_pair", label: "video_pair · 视频 + 人脸图（视频换脸）" },
  { value: "character", label: "character · 角色选择 + 提示词（角色延展）" },
];

const emptyTool = () => ({
  id: 0,
  code: "",
  name: "",
  category: "image",
  // 输入形态必须能选：它决定前台渲染哪个面板（单图/双图/蒙版/视频+人脸/角色），
  // 缺了它运营建出来的工具会落到默认 text —— 上传图的面板根本不出现，
  // 而工具在后台看起来一切正常。
  input: "image",
  summary: "",
  icon: "",
  // 效果列表要的两样：封面图（缩略图）与角标（热门/新品/精选）。留空也能用：
  // 前台会用图标 + 渐变兜底，不会出现空框。
  cover: "",
  badge: "",
  // 标签：效果列表的标签行按它筛（"全部 / 热门 / 脱衣 / 全脱 / 护士装…"）。
  tags: "",
  engine: "comfy",
  workflow: "",
  promptPreset: "",
  negativePreset: "",
  sort: 0,
  status: 1,
});
/**
 * params 的两类字段都要能看见：共用字段（denoise/steps/cfg/checkpoint/modelId…）
 * 与**工作流专属字段**（脱衣的 garmentRegion/samThreshold、视频的 length/resolution…）。
 * 后者由对应 workflow builder 解释，平台只透传 —— 运营在后台看不到线索就只能猜，
 * 而"猜错的参数"从结果上通常只表现为"效果不好"。详见 docs/HOUGONG-TOOLS.md。
 */
const PARAMS_PLACEHOLDER = `共用：{"denoise":0.6,"steps":28,"checkpoint":"xxx.safetensors"}
脱衣/服饰：{"bodyRegion":{"x":0.12,"y":0.13,"w":0.76,"h":0.83},"samThreshold":0.93}
视频：{"length":124,"steps":6,"durationSeconds":5}
云端模型：{"modelId":"<catalog id>","resolution":"720p"}`;

const toolDialog = ref(false);
const toolForm = reactive(emptyTool());
const loraText = ref("");
const paramsText = ref("");

const tplDrawer = ref(false);
const tplDialog = ref(false);
const templates = ref<HougongToolTemplate[]>([]);
const activeTool = ref<HougongTool | null>(null);
const toolName = computed(() => activeTool.value?.name || "");
const emptyTpl = () => ({
  id: 0,
  code: "",
  name: "",
  summary: "",
  prompt: "",
  negativePrompt: "",
  cover: "",
  badge: "",
  tags: "",
  // 默认单独成卡：新加的玩法先按"一个效果"出现，要合并成父工具的选项再关掉。
  isCard: 1,
  sort: 0,
  status: 1,
});
const tplForm = reactive(emptyTpl());
const tplParamsText = ref("");

async function load() {
  loading.value = true;
  try {
    const res: any = await getHougongTools({
      category: q.category || undefined,
      status: q.status === "" ? undefined : Number(q.status),
      query: q.query || undefined,
    });
    rows.value = res.data?.items || [];
  } finally {
    loading.value = false;
  }
}

function onSelectionChange(v: HougongTool[]) {
  selection.value = v;
}

function onReset() {
  q.category = "";
  q.status = "";
  q.query = "";
  load();
}

/** 解析 JSON 文本；空串按 {} 处理，非法则提示并返回 null（调用方据此中止保存）。 */
function parseParams(text: string): ToolParams | null {
  const s = (text || "").trim();
  if (!s) return {};
  try {
    const v = JSON.parse(s);
    if (v === null || typeof v !== "object" || Array.isArray(v)) {
      throw new Error("not object");
    }
    return v as ToolParams;
  } catch {
    ElMessage.error(t("message.sdk.platform.jsonInvalid"));
    return null;
  }
}

function openTool(row?: HougongTool) {
  Object.assign(toolForm, emptyTool());
  loraText.value = "";
  paramsText.value = "";
  if (row) {
    // 回填必须把**所有**表单字段带上：后台接口是整体覆盖语义，
    // 少回填一个字段，运营改个名字就会把封面/角标/输入形态一起清掉
    // （实测踩到：改过名字的工具，封面图与"输入形态"被悄悄重置成默认值）。
    Object.assign(toolForm, {
      id: row.id,
      code: row.code,
      name: row.name,
      category: row.category,
      summary: row.summary,
      icon: row.icon,
      cover: row.cover || "",
      badge: row.badge || "",
      tags: row.tags || "",
      input: row.input || "image",
      engine: row.engine,
      workflow: row.workflow,
      promptPreset: row.promptPreset || "",
      negativePreset: row.negativePreset || "",
      sort: row.sort,
      status: row.status,
    });
    loraText.value = (row.loraCodes || []).join("\n");
    paramsText.value = row.params ? JSON.stringify(row.params) : "";
  }
  toolDialog.value = true;
}

async function saveTool() {
  const params = parseParams(paramsText.value);
  if (params === null) return;
  const loraCodes = loraText.value
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);
  const payload: ToolInput = {
    code: toolForm.code.trim(),
    name: toolForm.name.trim(),
    category: toolForm.category,
    input: toolForm.input,
    summary: toolForm.summary,
    icon: toolForm.icon,
    cover: toolForm.cover.trim(),
    badge: toolForm.badge.trim(),
    tags: toolForm.tags.trim(),
    engine: toolForm.engine,
    workflow: toolForm.workflow,
    promptPreset: toolForm.promptPreset,
    negativePreset: toolForm.negativePreset,
    loraCodes,
    params,
    sort: toolForm.sort,
    status: toolForm.status,
  };
  if (!payload.code || !payload.name) {
    ElMessage.error(t("message.sdk.platform.codeNameRequired"));
    return;
  }
  saving.value = true;
  try {
    if (toolForm.id) {
      await updateHougongTool(toolForm.id, payload);
    } else {
      await createHougongTool(payload);
    }
    ElMessage.success(t("message.sdk.platform.saveOk"));
    toolDialog.value = false;
    await load();
  } catch (e: any) {
    ElMessage.error(e?.message || t("message.sdk.platform.saveFailed"));
  } finally {
    saving.value = false;
  }
}

async function onToggleOne(row: HougongTool, enabled: boolean) {
  try {
    await setHougongToolStatus([row.id], enabled);
    row.status = enabled ? 1 : 0;
    ElMessage.success(t("message.sdk.platform.saveOk"));
  } catch (e: any) {
    ElMessage.error(e?.message || t("message.sdk.platform.saveFailed"));
    await load();
  }
}

async function onBatch(enabled: boolean) {
  const ids = selection.value.map((r) => r.id);
  if (!ids.length) return;
  try {
    await setHougongToolStatus(ids, enabled);
    ElMessage.success(t("message.sdk.platform.saveOk"));
    await load();
  } catch (e: any) {
    ElMessage.error(e?.message || t("message.sdk.platform.saveFailed"));
  }
}

async function onDeleteTool(row: HougongTool) {
  try {
    await ElMessageBox.confirm(
      t("message.sdk.platform.deleteToolConfirm", { name: row.name }),
      { type: "warning" }
    );
  } catch {
    return;
  }
  try {
    await deleteHougongTool(row.id);
    ElMessage.success(t("message.sdk.platform.saveOk"));
    await load();
  } catch (e: any) {
    ElMessage.error(e?.message || t("message.sdk.platform.saveFailed"));
  }
}

async function openTemplates(row: HougongTool) {
  activeTool.value = row;
  tplDrawer.value = true;
  await loadTemplates();
}

async function loadTemplates() {
  if (!activeTool.value) return;
  const res: any = await getHougongTemplates(activeTool.value.id);
  templates.value = res.data?.items || [];
}

function openTpl(row?: HougongToolTemplate) {
  Object.assign(tplForm, emptyTpl());
  tplParamsText.value = "";
  if (row) {
    Object.assign(tplForm, {
      id: row.id,
      code: row.code,
      name: row.name,
      summary: row.summary,
      prompt: row.prompt || "",
      negativePrompt: row.negativePrompt || "",
      cover: row.cover || "",
      badge: row.badge || "",
      tags: row.tags || "",
      isCard: row.isCard === 0 ? 0 : 1,
      sort: row.sort,
      status: row.status,
    });
    tplParamsText.value = row.params ? JSON.stringify(row.params) : "";
  }
  tplDialog.value = true;
}

async function saveTpl() {
  if (!activeTool.value) return;
  const params = parseParams(tplParamsText.value);
  if (params === null) return;
  const payload: TemplateInput = {
    code: tplForm.code.trim(),
    name: tplForm.name.trim(),
    summary: tplForm.summary,
    prompt: tplForm.prompt,
    negativePrompt: tplForm.negativePrompt,
    params,
    cover: tplForm.cover.trim(),
    badge: tplForm.badge.trim(),
    tags: tplForm.tags.trim(),
    isCard: tplForm.isCard,
    sort: tplForm.sort,
    status: tplForm.status,
  };
  if (!payload.code || !payload.name) {
    ElMessage.error(t("message.sdk.platform.codeNameRequired"));
    return;
  }
  saving.value = true;
  try {
    if (tplForm.id) {
      await updateHougongTemplate(activeTool.value.id, tplForm.id, payload);
    } else {
      await createHougongTemplate(activeTool.value.id, payload);
    }
    ElMessage.success(t("message.sdk.platform.saveOk"));
    tplDialog.value = false;
    await loadTemplates();
    await load();
  } catch (e: any) {
    ElMessage.error(e?.message || t("message.sdk.platform.saveFailed"));
  } finally {
    saving.value = false;
  }
}

async function onToggleTpl(row: HougongToolTemplate, enabled: boolean) {
  if (!activeTool.value) return;
  try {
    await setHougongTemplateStatus(activeTool.value.id, [row.id], enabled);
    row.status = enabled ? 1 : 0;
    ElMessage.success(t("message.sdk.platform.saveOk"));
  } catch (e: any) {
    ElMessage.error(e?.message || t("message.sdk.platform.saveFailed"));
    await loadTemplates();
  }
}

/**
 * 切换「单独成卡」。
 *
 * 这里没有单独的后端接口：它就是模板的一个字段，走整条编辑接口 ——
 * 只要**不回填**其余字段（后台接口是整体覆盖语义），用 row 里已有的值原样提交即可，
 * 所以下面每个字段都显式带上，避免"只改开关却把提示词清空"。
 */
async function onToggleCard(row: HougongToolTemplate, isCard: boolean) {
  if (!activeTool.value) return;
  const next = isCard ? 1 : 0;
  try {
    await updateHougongTemplate(activeTool.value.id, row.id, {
      code: row.code,
      name: row.name,
      summary: row.summary,
      prompt: row.prompt || "",
      negativePrompt: row.negativePrompt || "",
      params: row.params || {},
      cover: row.cover || "",
      badge: row.badge || "",
      tags: row.tags || "",
      isCard: next,
      sort: row.sort,
      status: row.status,
    });
    row.isCard = next;
    ElMessage.success(t("message.sdk.platform.saveOk"));
  } catch (e: any) {
    ElMessage.error(e?.message || t("message.sdk.platform.saveFailed"));
    await loadTemplates();
  }
}

async function onDeleteTpl(row: HougongToolTemplate) {
  if (!activeTool.value) return;
  try {
    await ElMessageBox.confirm(
      t("message.sdk.platform.deleteTemplateConfirm", { name: row.name }),
      { type: "warning" }
    );
  } catch {
    return;
  }
  try {
    await deleteHougongTemplate(activeTool.value.id, row.id);
    ElMessage.success(t("message.sdk.platform.saveOk"));
    await loadTemplates();
    await load();
  } catch (e: any) {
    ElMessage.error(e?.message || t("message.sdk.platform.saveFailed"));
  }
}

onMounted(load);
</script>

<style scoped>
/* 空表格里的说明文字：Element Plus 的 empty 插槽默认居中，这里只补行距与配色。 */
.hg-empty {
  padding: 18px 12px;
  color: var(--el-text-color-secondary);
  font-size: 13px;
  line-height: 1.9;
}
.hg-empty p {
  margin: 0;
}
</style>
