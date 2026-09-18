import request from "/@/utils/request";

/**
 * 画布会话与产物的**只读**排查接口（后端 `api/v1/cms/admin/canvas_inspect.go`）。
 *
 * 这里没有任何写操作 —— 不是漏了，是 D21 的边界：会话永不删、后台不提供删除入口。
 * 排查页的职责是把"当时发生了什么"原样摆出来。
 */

export interface CanvasConversationItem {
  id: string;
  accountId: string;
  product: string;
  ownerType: string;
  /** 画布节点会话是 `{graphId}:{nodeId}`：据此跳到那张图。 */
  ownerId: string;
  title: string;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
  /** 已被软删（用户删项目/账号时按 owner 级联删）。排查页照样列出来并标记。 */
  deleted?: boolean;
}

export interface CanvasMessageItem {
  seq: number;
  role: string;
  content: string;
  model: string;
  createdAt: string;
}

export interface CanvasArtifactItem {
  id: string;
  graphId: string;
  nodeId: string;
  slot: string;
  type: string;
  version: number;
  note: string;
  review: string;
  text?: string;
  /** 媒体限时地址（一小时）：能直接点开看，不是永久链接。 */
  mediaUrl?: string;
  conversationId?: string;
  createdAt: string;
}

export interface CanvasRunItem {
  id: string;
  nodeId: string;
  nodeType: string;
  status: string;
  error?: string;
  cost: number;
  startedAt: string;
  finishedAt?: string;
}

export interface CanvasConversationListParams {
  accountId?: number;
  keyword?: string;
  page?: number;
  pageSize?: number;
}

export interface CanvasConversationListRes {
  list: CanvasConversationItem[];
  total: number;
  page: number;
}

export interface CanvasConversationDetailRes {
  conversation: CanvasConversationItem;
  messages: CanvasMessageItem[];
  artifacts: CanvasArtifactItem[];
}

export interface CanvasGraphInspectRes {
  graphId: string;
  title: string;
  accountId: string;
  revision: number;
  updatedAt: string;
  nodes: number;
  /** 这张图已被软删（用户在画布上删了图），产物仍按图号列出来。 */
  deleted?: boolean;
  artifacts: CanvasArtifactItem[];
  runs: CanvasRunItem[];
}

/** 会话列表（可按账号/关键词过滤）。 */
export function canvasConversationList(params: CanvasConversationListParams) {
  return request<CanvasConversationListRes>({
    url: "/api/v1/admin/canvas/inspect/conversation/list",
    method: "get",
    params,
  });
}

/** 会话详情（消息 + 引用它的产物）。 */
export function canvasConversationDetail(params: { id: string | number; limit?: number }) {
  return request<CanvasConversationDetailRes>({
    url: "/api/v1/admin/canvas/inspect/conversation/detail",
    method: "get",
    params,
  });
}

/** 按图排查（产物 + 运行记录）。 */
export function canvasGraphInspect(params: { graphId: string | number }) {
  return request<CanvasGraphInspectRes>({
    url: "/api/v1/admin/canvas/inspect/graph",
    method: "get",
    params,
  });
}
