import request from "/@/utils/request";

export interface DocumentPageParams {
  page?: number;
  limit?: number;
}

export interface DocumentCategoryItem {
  id: number;
  parent_id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  lang: string;
  source_category_id: number;
  weigh: number;
  status: number;
  created_at: number;
  updated_at: number;
  children?: DocumentCategoryItem[];
}

export interface DocumentListItem {
  id: number;
  category_id: number;
  title: string;
  slug: string;
  summary: string;
  lang: string;
  file_path: string;
  file_hash: string;
  file_mtime: number;
  synced_at: number;
  weigh: number;
  views: number;
  status: number;
  created_at: number;
  updated_at: number;
}

export interface DocumentDetail extends DocumentListItem {
  content_md: string;
  content_html: string;
  source_doc_id: number;
  file_path: string;
  file_hash: string;
  file_mtime: number;
  synced_at: number;
}

export interface DocumentCategoryPayload {
  id?: number;
  parent_id?: number;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  lang?: string;
  source_category_id?: number;
  weigh?: number;
  status?: number;
}

export interface DocumentPayload {
  id?: number;
  category_id?: number;
  title: string;
  slug: string;
  content_md?: string;
  summary?: string;
  lang?: string;
  source_doc_id?: number;
  file_path?: string;
  weigh?: number;
  status?: number;
}

export interface DocumentSyncResult {
  scanned: number;
  created: number;
  updated: number;
  hidden: number;
  categories: number;
  errors: string[];
}

export interface DocumentListParams extends DocumentPageParams {
  category_id?: number;
  lang?: string;
  status?: number;
  keyword?: string;
}

export function getDocumentCategoryTree(params?: { lang?: string; with_docs?: boolean }) {
  return request({ url: "/api/v1/addon/document/admin/category/tree", method: "get", params });
}

export function addDocumentCategory(data: DocumentCategoryPayload) {
  return request({ url: "/api/v1/addon/document/admin/category/add", method: "post", data });
}

export function editDocumentCategory(data: DocumentCategoryPayload) {
  return request({ url: "/api/v1/addon/document/admin/category/edit", method: "put", data });
}

export function deleteDocumentCategory(id: number) {
  return request({
    url: "/api/v1/addon/document/admin/category/del",
    method: "delete",
    params: { id },
  });
}

export function sortDocumentCategory(
  items: Array<{ id: number; parent_id: number; weigh: number }>,
) {
  return request({
    url: "/api/v1/addon/document/admin/category/sort",
    method: "put",
    data: { items },
  });
}

export function getDocumentList(params: DocumentListParams) {
  return request({ url: "/api/v1/addon/document/admin/list", method: "get", params });
}

export function getDocumentDetail(id: number) {
  return request({ url: "/api/v1/addon/document/admin/get", method: "get", params: { id } });
}

export function addDocument(data: DocumentPayload) {
  return request({ url: "/api/v1/addon/document/admin/add", method: "post", data });
}

export function editDocument(data: DocumentPayload) {
  return request({ url: "/api/v1/addon/document/admin/edit", method: "put", data });
}

export function deleteDocument(id: number) {
  return request({ url: "/api/v1/addon/document/admin/del", method: "delete", params: { id } });
}

export function sortDocument(items: Array<{ id: number; weigh: number }>) {
  return request({ url: "/api/v1/addon/document/admin/sort", method: "put", data: { items } });
}

export function syncDocumentSource(params?: { lang?: string }) {
  return request({ url: "/api/v1/addon/document/admin/sync", method: "post", data: params || {} });
}
