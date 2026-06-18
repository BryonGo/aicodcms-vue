import request from "/@/utils/request";

export function listForms(params: any) {
  return request({ url: "/api/v1/addon/form/list", method: "get", params });
}
export function addForm(title: string) {
  return request({ url: "/api/v1/addon/form/add", method: "post", data: { title } });
}
export function editForm(data: any) {
  return request({ url: "/api/v1/addon/form/edit", method: "put", data });
}
export function delForm(id: number) {
  return request({ url: "/api/v1/addon/form/del", method: "delete", data: { id } });
}
export function listFormFields(formId: number) {
  return request({
    url: "/api/v1/addon/form/field/list",
    method: "get",
    params: { form_id: formId },
  });
}
export function saveFormFields(formId: number, fields: any[]) {
  return request({
    url: "/api/v1/addon/form/field/save",
    method: "post",
    data: { form_id: formId, fields },
  });
}
export function listFormData(formId: number, params: any) {
  return request({
    url: "/api/v1/addon/form/data/list",
    method: "get",
    params: { form_id: formId, ...params },
  });
}
export function delFormData(ids: number[]) {
  return request({ url: "/api/v1/addon/form/data/del", method: "delete", data: { ids } });
}
