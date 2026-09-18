<template>
  <div class="pf-page">
    <el-breadcrumb separator="→">
      <el-breadcrumb-item :to="{ path: '/' }">
        <el-icon><HomeFilled /></el-icon>
        {{ $t("message.sdk.platform.breadcrumbHome") }}
      </el-breadcrumb-item>
      <el-breadcrumb-item>{{ $t("message.sdk.platform.breadcrumbSdk") }}</el-breadcrumb-item>
      <el-breadcrumb-item>{{ $t("message.sdk.platform.canvasTemplatesTitle") }}</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="pf-header">
      <div>
        <h1 class="pf-title">{{ $t("message.sdk.platform.canvasTemplatesTitle") }}</h1>
        <!--
          把"怎么造模板"写在页面上：运营第一次进来时唯一的问题就是"模板从哪来"。
          答案是"从一张调好的图另存"——所以这里要给出图 id 的入口，而不是只放一个 JSON 框。
        -->
        <p class="pf-subtitle">
          画布模板是**站点资产**：用户新建画布时能选到（只含"已启用"的），套用后得到同一套结构。
          推荐做法：在画布上把一条产线调好 → 复制那张图的 ID → 在这里「从图另存」。
        </p>
      </div>
      <el-button type="primary" @click="openCreate">新建模板</el-button>
    </div>

    <div class="pf-table-card">
      <el-table :data="rows" border v-loading="loading" class="pf-table" :empty-text="$t('message.sdk.platform.noData')">
        <el-table-column prop="name" label="模板名" min-width="160" />
        <el-table-column prop="summary" label="说明" min-width="240" show-overflow-tooltip />
        <el-table-column prop="nodeCount" label="步数" width="80" align="center" />
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.state === 'enabled' ? 'success' : 'info'" size="small" effect="plain" round>
              {{ row.state === "enabled" ? "已启用" : "已停用" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="排序" width="80" align="center" />
        <el-table-column prop="updatedAt" label="更新" width="180" />
        <el-table-column :label="$t('message.sdk.platform.colOp')" width="200" align="center">
          <template #default="{ row }">
            <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
            <el-button link type="primary" @click="toggleState(row)">
              {{ row.state === "enabled" ? "停用" : "启用" }}
            </el-button>
            <el-button link type="danger" @click="onDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="dialog" :title="form.id ? '编辑模板' : '新建模板'" width="640px">
      <el-form label-width="110px">
        <el-form-item label="模板名" required>
          <el-input v-model="form.name" maxlength="64" placeholder="例如：三镜短剧产线" />
        </el-form-item>
        <el-form-item label="说明">
          <el-input v-model="form.summary" maxlength="255" placeholder="几步、产出什么（用户选模板时看这句）" />
        </el-form-item>
        <el-form-item label="从图另存">
          <el-input v-model="form.graphId" placeholder="canvas_graph.id（画布上那张调好的图）" />
          <div class="pf-hint">
            填了图 ID 就复制那张图的结构（**产物与运行记录不会被复制**：模板只给产线）。
            编辑已有模板时留空 = 不改结构。
          </div>
        </el-form-item>
        <el-form-item label="结构 JSON">
          <el-input
            v-model="form.graph"
            type="textarea"
            :rows="4"
            placeholder="高级入口：直接粘结构 JSON（与上面的图 ID 二选一，都填以这里为准）"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="enabled" active-text="启用（下发前台）" inactive-text="停用（只留后台）" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sort" :min="0" :max="9999" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialog = false">{{ $t("message.sdk.platform.btnCancel") }}</el-button>
        <el-button type="primary" :loading="saving" @click="onSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
/**
 * 后台「画布模板」页。
 *
 * 为什么需要它：模板此前只存在用户的浏览器 localStorage 里
 * （`ai-platform/app/data/canvas-templates.ts`）—— 运营改不了、换台机器就没了、
 * 也没法表达"这几条产线是官方推荐的"。这一页把模板变成站点资产。
 *
 * 用户侧只读（画布开始对话框里选），所以写入口只在这里。
 */
import { defineComponent, onMounted, reactive, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { HomeFilled } from "@element-plus/icons-vue";
import {
  canvasTemplateDel,
  canvasTemplateList,
  canvasTemplateSave,
  type CanvasTemplateItem,
} from "/@/api/addon/canvasTemplate";

export default defineComponent({
  name: "addonPlatformCanvasTemplates",
  components: { HomeFilled },
  setup() {
    const rows = ref<CanvasTemplateItem[]>([]);
    const loading = ref(false);
    const dialog = ref(false);
    const saving = ref(false);
    const enabled = ref(true);
    const form = reactive<{ id?: string; name: string; summary: string; graphId: string; graph: string; sort: number }>({
      id: undefined,
      name: "",
      summary: "",
      graphId: "",
      graph: "",
      sort: 0,
    });

    const load = async () => {
      loading.value = true;
      try {
        // 拦截器回整个信封，这里解一层（与其它后台页一致）。
        const res: any = await canvasTemplateList();
        rows.value = (res?.data || res)?.list || [];
      } finally {
        loading.value = false;
      }
    };

    const openCreate = () => {
      form.id = undefined;
      form.name = "";
      form.summary = "";
      form.graphId = "";
      form.graph = "";
      form.sort = rows.value.length * 10;
      enabled.value = true;
      dialog.value = true;
    };

    const openEdit = (row: CanvasTemplateItem) => {
      form.id = row.id;
      form.name = row.name;
      form.summary = row.summary;
      // 编辑时不回填结构与图 id：**留空 = 不改结构**（避免一次误保存把结构清成空图）。
      form.graphId = "";
      form.graph = "";
      form.sort = row.sort;
      enabled.value = row.state === "enabled";
      dialog.value = true;
    };

    const onSave = async () => {
      if (!form.name.trim()) {
        ElMessage.warning("模板名不能为空");
        return;
      }
      saving.value = true;
      try {
        await canvasTemplateSave({
          id: form.id,
          name: form.name.trim(),
          summary: form.summary.trim(),
          state: enabled.value ? "enabled" : "hidden",
          sort: Number(form.sort) || 0,
          graphId: form.graphId.trim() || undefined,
          graph: form.graph.trim() || undefined,
        });
        ElMessage.success("已保存");
        dialog.value = false;
        await load();
      } catch (e: any) {
        ElMessage.error(e?.message || "保存失败");
      } finally {
        saving.value = false;
      }
    };

    const toggleState = async (row: CanvasTemplateItem) => {
      try {
        await canvasTemplateSave({
          id: row.id,
          name: row.name,
          state: row.state === "enabled" ? "hidden" : "enabled",
          sort: row.sort,
        });
        await load();
      } catch (e: any) {
        ElMessage.error(e?.message || "操作失败");
      }
    };

    const onDelete = async (row: CanvasTemplateItem) => {
      try {
        await ElMessageBox.confirm(
          `删除模板「${row.name}」？用户侧会立刻看不到它（已经套用过的图不受影响）。`,
          "删除模板",
          { type: "warning" },
        );
      } catch {
        return; // 用户取消
      }
      try {
        await canvasTemplateDel(row.id);
        ElMessage.success("已删除");
        await load();
      } catch (e: any) {
        ElMessage.error(e?.message || "删除失败");
      }
    };

    onMounted(load);

    return { rows, loading, dialog, saving, enabled, form, openCreate, openEdit, onSave, toggleState, onDelete };
  },
});
</script>

<style scoped>
.pf-hint {
  margin-top: 6px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
  line-height: 1.5;
}
</style>
