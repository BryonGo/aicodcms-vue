import request from "/@/utils/request";

// ==================== 播放器分组 ====================

export interface PlayerGroup {
  id?: number;
  article_id: number;
  group_name: string;
  sort: number;
}

export function getPlayerGroups(articleId: number) {
  return request({
    url: "/api/v1/addon/movie/player/group/list",
    method: "get",
    params: { article_id: articleId },
  });
}

export function savePlayerGroups(articleId: number, list: PlayerGroup[]) {
  return request({
    url: "/api/v1/addon/movie/player/group/save",
    method: "post",
    data: { article_id: articleId, list },
  });
}

// ==================== 播放地址 ====================

export interface PlayUrl {
  id?: number;
  article_id: number;
  group_id: number;
  episode_num: number;
  episode_title: string;
  play_url: string;
  sort: number;
}

export function getPlayUrls(articleId: number, groupId: number) {
  return request({
    url: "/api/v1/addon/movie/play-url/list",
    method: "get",
    params: { article_id: articleId, group_id: groupId },
  });
}

export function savePlayUrls(articleId: number, groupId: number, list: PlayUrl[]) {
  return request({
    url: "/api/v1/addon/movie/play-url/save",
    method: "post",
    data: { article_id: articleId, group_id: groupId, list },
  });
}

// ==================== 演员 ====================

export interface ActorItem {
  id: number;
  name: string;
  avatar: string;
  alias: string;
}

export function searchActor(keyword: string) {
  return request({ url: "/api/v1/addon/movie/actor/search", method: "get", params: { keyword } });
}

export function addActor(name: string, avatar?: string, alias?: string) {
  return request({
    url: "/api/v1/addon/movie/actor/add",
    method: "post",
    data: { name, avatar, alias },
  });
}

// ==================== 演员角色 ====================

export interface ActorRole {
  id?: number;
  article_id: number;
  actor_id: number;
  actor_name: string;
  role_name: string;
  sort: number;
}

export function getActorRoles(articleId: number) {
  return request({
    url: "/api/v1/addon/movie/actor-role/list",
    method: "get",
    params: { article_id: articleId },
  });
}

export function saveActorRoles(articleId: number, list: ActorRole[]) {
  return request({
    url: "/api/v1/addon/movie/actor-role/save",
    method: "post",
    data: { article_id: articleId, list },
  });
}
