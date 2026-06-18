/**
 * 后端控制菜单 — 已废弃，使用从 sys_menu 动态加载
 */
export function useMenuApi() {
  return {
    getMenuAdmin: () => Promise.reject(new Error("动态菜单已从后端加载")),
    getMenuTest: () => Promise.reject(new Error("动态菜单已从后端加载")),
  };
}
