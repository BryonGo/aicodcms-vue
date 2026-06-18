import request from "/@/utils/request";

// ==================== Types ====================

export interface MQStats {
  adapter: string;
  topics: Record<string, number>;
  total: number;
  consumers: number;
}

export interface MQTopic {
  name: string;
  len: number;
}

export interface PeekMessageItem {
  id: string;
  payload: string;
  payload_size: number;
  created_at: number;
}

export interface TopicPeekRes {
  messages: PeekMessageItem[];
}

// ==================== API ====================

/** 队列统计 */
export function getMQStats() {
  return request<MQStats>({
    url: "/api/v1/addon/mq/stats",
    method: "get",
  });
}

/** Topic 列表 */
export function getMQTopics() {
  return request<{ list: MQTopic[] }>({
    url: "/api/v1/addon/mq/topics",
    method: "get",
  });
}

/** 清空 Topic */
export function clearMQTopic(name: string) {
  return request({
    url: "/api/v1/addon/mq/topic/clear",
    method: "delete",
    data: { name },
  });
}

/** 健康检查 */
export function checkMQHealth() {
  return request<{ ok: boolean }>({
    url: "/api/v1/addon/mq/health",
    method: "get",
  });
}

/** Peek 预览消息（不消费不删除） */
export function peekMQMessages(topic: string, count: number = 50) {
  return request<TopicPeekRes>({
    url: `/api/v1/addon/mq/topics/${encodeURIComponent(topic)}/peek`,
    method: "get",
    params: { count },
  });
}
