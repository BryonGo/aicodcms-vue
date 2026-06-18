import request from "/@/utils/request";

export function uploadTiptapImage(data: FormData) {
  return request({ url: "/api/v1/pms/tiptap/image", method: "post", data });
}

export function uploadTiptapFile(data: FormData) {
  return request({ url: "/api/v1/pms/tiptap/file", method: "post", data });
}
