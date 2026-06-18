import request from "/@/utils/request";

export function getMenuList(query: object) {
  return request({
    url: "/api/v1/pms/menu/list",
    method: "get",
    params: query,
  });
}

export function getUserMenus() {
  return request({
    url: "/api/v1/pms/user/menus",
    method: "get",
  });
}

export function getMenuParams() {
  return request({
    url: "/api/v1/pms/menu/get-params",
    method: "get",
  });
}

export function addMenu(data: object) {
  return request({
    url: "/api/v1/pms/menu/add",
    method: "post",
    data: data,
  });
}

export function getMenuInfo(id: number) {
  return request({
    url: "/api/v1/pms/menu/get",
    method: "get",
    params: { id },
  });
}

export function updateMenu(data: object) {
  return request({
    url: "/api/v1/pms/menu/edit",
    method: "put",
    data: data,
  });
}

// 删除菜单
export function delMenu(menuId: number) {
  return request({
    url: "/api/v1/pms/menu/del",
    method: "delete",
    data: { ids: [menuId] },
  });
}

// 拖拽排序
export function menuSort(items: { id: number; pid: number; weigh: number }[]) {
  return request({
    url: "/api/v1/pms/menu/sort",
    method: "put",
    data: { items },
  });
}
