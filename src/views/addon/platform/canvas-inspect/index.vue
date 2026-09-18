<template>
  <div class="pf-page">
    <el-breadcrumb separator="→">
      <el-breadcrumb-item :to="{ path: '/' }">
        <el-icon><HomeFilled /></el-icon>
        {{ $t("message.sdk.platform.breadcrumbHome") }}
      </el-breadcrumb-item>
      <el-breadcrumb-item>{{ $t("message.sdk.platform.breadcrumbSdk") }}</el-breadcrumb-item>
      <el-breadcrumb-item>{{ $t("message.sdk.platform.canvasInspectTitle") }}</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="pf-header">
      <div>
        <h1 class="pf-title">{{ $t("message.sdk.platform.canvasInspectTitle") }}</h1>
        <!--
          这段说明是给运营看的，不是装饰：页面上的每一个数字都能对到库里，
          而这个页面**故意没有任何写操作**（D21：会话永不删，后台没有删除入口）。
        -->
        <p class="pf-subtitle">
          只读排查：按账号或关键词找会话，按图号看节点产物与运行记录。此页不提供任何修改与删除。
        </p>
      </div>
    </div>

    <div class="pf-filter-card">
      <el-form :inline="true" @submit.prevent>
        <el-form-item label="账号 ID">
          <el-input
            v-model="q.accountId"
            placeholder="accountId"
            clearable
            style="width: 180px"
            @keyup.enter="loadConversations"
          />
        </el-form-item>
        <el-form-item label="关键词">
          <el-input
            v-model="q.keyword"
            placeholder="会话 id / 节点id / 标题"
            clearable
            style="width: 220px"
            @keyup.enter="loadConversations"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadConversations">查会话</el-button>
          <el-button @click="onReset">重置</el-button>
        </el-form-item>
        <el-form-item label="图 ID">
          <el-input
            v-model="q.graphId"
            placeholder="graphId"
            clearable
            style="width: 200px"
            @keyup.enter="loadGraph"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" plain @click="loadGraph">查这张图</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 会话列表 -->
    <div class="pf-table-card">
      <el-table
        :data="conversations"
        border
        v-loading="loadingConv"
        class="pf-table"
        :empty-text="$t('message.sdk.platform.noData')"
        @row-click="openConversation"
      >
        <el-table-column prop="id" label="会话 ID" width="200" />
        <el-table-column prop="accountId" label="账号" width="200" />
        <el-table-column prop="ownerType" label="归属" width="120" />
        <el-table-column prop="ownerId" label="归属对象" min-width="220" show-overflow-tooltip />
        <el-table-column prop="title" label="标题" min-width="140" />
        <el-table-column prop="messageCount" label="消息数" width="90" align="center" />
        <el-table-column label="状态" width="90" align="center">
          <template #default="{ row }">
            <!-- 软删的会话照样列出来并标记：用户问"删了还能找回吗"时，先得看得见它。 -->
            <el-tag v-if="row.deleted" type="danger" size="small" effect="plain" round>已删除</el-tag>
            <el-tag v-else type="success" size="small" effect="plain" round>存活</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="updatedAt" label="最后更新" width="180" />
        <el-table-column label="" width="90" align="center">
          <template #default>
            <span class="pf-link">看详情</span>
          </template>
        </el-table-column>
      </el-table>
      <div class="pf-footer">
        <pagination v-model:page="page" v-model:limit="size" :total="total" @change="loadConversations" />
      </div>
    </div>

    <!-- 图排查：节点产物 + 运行记录 -->
    <div v-if="graph" class="pf-table-card">
      <p class="pf-block-title">
        图 {{ graph.graphId }} · {{ graph.title || "未命名" }} · {{ graph.nodes }} 个节点 ·
        账号 {{ graph.accountId }} · 更新 {{ graph.updatedAt }}
        <el-tag v-if="graph.deleted" type="danger" size="small" effect="plain" round>已删除</el-tag>
      </p>
      <el-table :data="graph.artifacts" border class="pf-table" empty-text="这张图还没有产物">
        <el-table-column prop="nodeId" label="节点" width="140" />
        <el-table-column prop="slot" label="槽" width="90" />
        <el-table-column prop="type" label="类型" width="90" />
        <el-table-column prop="version" label="版本" width="70" align="center" />
        <el-table-column prop="note" label="备注" min-width="200" show-overflow-tooltip />
        <el-table-column prop="review" label="审核" width="90" />
        <el-table-column label="内容" width="90" align="center">
          <template #default="{ row }">
            <a v-if="row.mediaUrl" :href="row.mediaUrl" target="_blank" rel="noreferrer">打开</a>
            <span v-else-if="row.text">文本</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="conversationId" label="会话" width="200" />
        <el-table-column prop="createdAt" label="产出时间" width="180" />
      </el-table>

      <p class="pf-block-title">运行记录</p>
      <el-table :data="graph.runs" border class="pf-table" empty-text="还没有运行记录">
        <el-table-column prop="id" label="运行 ID" width="200" />
        <el-table-column prop="nodeId" label="节点" width="140" />
        <el-table-column prop="nodeType" label="类型" width="120" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)" size="small" effect="plain" round>
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="cost" label="扣点" width="90" align="right" />
        <el-table-column prop="error" label="错误" min-width="240" show-overflow-tooltip />
        <el-table-column prop="startedAt" label="开始" width="180" />
        <el-table-column prop="finishedAt" label="结束" width="180" />
      </el-table>
    </div>

    <!-- 会话详情：消息 + 引用它的产物 -->
    <el-drawer v-model="drawer" title="会话详情（只读）" size="60%">
      <div v-if="detail">
        <p class="pf-block-title">
          会话 {{ detail.conversation.id }} · 账号 {{ detail.conversation.accountId }} ·
          归属 {{ detail.conversation.ownerType }} {{ detail.conversation.ownerId }} ·
          共 {{ detail.conversation.messageCount }} 条
        </p>
        <div v-for="m in detail.messages" :key="m.seq" class="cv-msg">
          <span class="cv-role" :class="`cv-role--${m.role}`">{{ m.role }}</span>
          <span class="cv-time">{{ m.createdAt }} · {{ m.model }}</span>
          <pre class="cv-text">{{ m.content }}</pre>
        </div>
        <p v-if="!detail.messages.length" class="pf-subtitle">这个会话还没有消息。</p>

        <p class="pf-block-title">引用这个会话的产物（{{ detail.artifacts.length }}）</p>
        <el-table :data="detail.artifacts" border size="small" empty-text="没有产物引用它">
          <el-table-column prop="graphId" label="图" width="200" />
          <el-table-column prop="nodeId" label="节点" width="130" />
          <el-table-column prop="type" label="类型" width="80" />
          <el-table-column prop="version" label="版本" width="70" align="center" />
          <el-table-column prop="note" label="备注" min-width="160" show-overflow-tooltip />
        </el-table>
      </div>
      <p v-else class="pf-subtitle">加载中…</p>
    </el-drawer>
  </div>
</template>

<script lang="ts">
/**
 * 画布排查页（只读）。
 *
 * 为什么单独一页而不是塞进「AI 供应商与模型」：这一页回答的是**用户侧问题**
 * （"我这个图跑到哪一步了/为什么失败/扣了多少"），操作者是客服与支持同学，
 * 不是配模型的运营。混在一起会让两边都找不到东西。
 *
 * 页面上的文案直接用中文，不走 i18n：它是内部支持工具，只有中文场景；
 * 而通用控件（查询/重置/无数据/分页）复用了已有的 i18n 键。
 */
import { defineComponent, onActivated, onMounted, reactive, ref } from "vue";
import { HomeFilled } from "@element-plus/icons-vue";
import {
  canvasConversationDetail,
  canvasConversationList,
  canvasGraphInspect,
  type CanvasArtifactItem,
  type CanvasConversationDetailRes,
  type CanvasConversationItem,
  type CanvasGraphInspectRes,
} from "/@/api/addon/canvasInspect";

export default defineComponent({
  name: "addonPlatformCanvasInspect",
  components: { HomeFilled },
  setup() {
    const conversations = ref<CanvasConversationItem[]>([]);
    const loadingConv = ref(false);
    const page = ref(1);
    const size = ref(20);
    const total = ref(0);
    const q = reactive<{ accountId?: string; keyword?: string; graphId?: string }>({
      accountId: "",
      keyword: "",
      graphId: "",
    });

    const graph = ref<CanvasGraphInspectRes | null>(null);
    const drawer = ref(false);
    const detail = ref<CanvasConversationDetailRes | null>(null);

    const loadConversations = async () => {
      loadingConv.value = true;
      try {
        // 项目的 axios 拦截器回的是**整个信封**（{code,message,data}），
        // 所以这里要 `res.data || res` 解一层（与 ledger 等页面同一写法）。
        const res: any = await canvasConversationList({
          accountId: q.accountId ? Number(q.accountId) : undefined,
          keyword: q.keyword || undefined,
          page: page.value,
          pageSize: size.value,
        });
        const d = res?.data || res || {};
        conversations.value = d.list || [];
        total.value = d.total || 0;
      } finally {
        loadingConv.value = false;
      }
    };

    const loadGraph = async () => {
      if (!q.graphId) {
        graph.value = null;
        return;
      }
      const res: any = await canvasGraphInspect({ graphId: q.graphId });
      graph.value = res?.data || res || null;
    };

    const openConversation = async (row: CanvasConversationItem) => {
      drawer.value = true;
      detail.value = null;
      const res: any = await canvasConversationDetail({ id: row.id });
      detail.value = res?.data || res || null;
    };

    const onReset = () => {
      q.accountId = "";
      q.keyword = "";
      q.graphId = "";
      page.value = 1;
      graph.value = null;
      void loadConversations();
    };

    const statusTagType = (status: string) => {
      switch (status) {
        case "done":
          return "success";
        case "failed":
          return "danger";
        case "running":
          return "warning";
        default:
          return "info";
      }
    };

    onMounted(loadConversations);
    // keep-alive 页面回到前台时刷新：支持同学往往一边查一边让用户重试。
    onActivated(loadConversations);

    return {
      conversations,
      loadingConv,
      page,
      size,
      total,
      q,
      graph,
      drawer,
      detail,
      loadConversations,
      loadGraph,
      openConversation,
      onReset,
      statusTagType,
    };
  },
});
</script>

<style scoped>
.pf-link {
  color: var(--el-color-primary);
  cursor: pointer;
}
.pf-block-title {
  margin: 14px 0 8px;
  font-weight: 600;
}
.cv-msg {
  padding: 8px 0;
  border-bottom: 1px dashed var(--el-border-color-lighter);
}
.cv-role {
  display: inline-block;
  min-width: 64px;
  font-weight: 600;
}
.cv-role--user {
  color: var(--el-color-primary);
}
.cv-role--assistant {
  color: var(--el-color-success);
}
.cv-time {
  margin-left: 8px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
}
.cv-text {
  margin: 6px 0 0;
  white-space: pre-wrap;
  word-break: break-word;
  font-family: inherit;
}
</style>
