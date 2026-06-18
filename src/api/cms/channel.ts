import request from "/@/utils/request";
// 查询文章分类列表
export function listCmsChannel(query: object) {
  return request({
    url: "/api/v1/admin/channel/list",
    method: "get",
    params: query,
  });
}
// 查询文章分类详细
export function getCmsChannel(id: number) {
  return request({
    url: "/api/v1/admin/channel/",
    method: "get",
    params: {
      id: id.toString(),
    },
  });
}
// 新增文章分类
export function addCmsChannel(data: object) {
  return request({
    url: "/api/v1/admin/channel/add",
    method: "post",
    data: data,
  });
}
// 修改文章分类
export function updateCmsChannel(data: object) {
  return request({
    url: "/api/v1/admin/channel/edit",
    method: "put",
    data: data,
  });
}
// 删除文章分类
export function delCmsChannel(ids: number[]) {
  return request({
    url: "/api/v1/admin/channel/del",
    method: "delete",
    data: {
      ids: ids,
    },
  });
}

// 更新栏目权重
export function updateCmsChannelWeigh(id: number, weigh: number) {
  return request({
    url: "/api/v1/admin/channel/weigh",
    method: "put",
    data: { id, weigh },
  });
}

// 清空栏目下所有文章
export function clearChannelArticles(channelIds: number[]) {
  return request({
    url: "/api/v1/admin/channel/clear_articles",
    method: "delete",
    data: { channel_ids: channelIds },
  });
}

// 关联modules_info表选项
export function listModulesInfo(query: object) {
  return request({
    url: "/api/v1/admin/modules/info/list",
    method: "get",
    params: query,
  });
}
