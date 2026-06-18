import request from "/@/utils/request";

// 获取指定资源的翻译列表
export function getCmsTranslations(type: string, refId: number) {
  return request({
    url: `/api/v1/admin/${type}/translations`,
    method: "get",
    params: { [`${type}_id`]: refId },
  });
}
