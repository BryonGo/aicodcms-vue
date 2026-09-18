import { RouteRecordRaw } from "vue-router";
import pinia from "/@/stores/index";
import { useUserInfo } from "/@/stores/userInfo";
import { useRequestOldRoutes } from "/@/stores/requestOldRoutes";
import { Session } from "/@/utils/storage";
import { NextLoading } from "/@/utils/loading";
import { dynamicRoutes, notFoundAndNoPower } from "/@/router/route";
import { formatTwoStageRoutes, formatFlatteningRoutes, router } from "/@/router/index";
import { useRoutesList } from "/@/stores/routesList";
import { useTagsViewRoutes } from "/@/stores/tagsViewRoutes";
import { getUserMenus } from "/@/api/pms/menu";

const layouModules: any = import.meta.glob("../layout/routerView/*.{vue,tsx}");
const viewsModules: any = import.meta.glob("../views/**/*.{vue,tsx}");

// 后端控制路由

/**
 * 获取目录下的 .vue、.tsx 全部文件
 * @method import.meta.glob
 * @link 参考：https://cn.vitejs.dev/guide/features.html#json
 */
const dynamicViewsModules: Record<string, Function> = Object.assign(
  {},
  { ...layouModules },
  { ...viewsModules },
);

// These routes belong to the frontend shell and must survive every backend-menu refresh.
const shellHomeRoute = dynamicRoutes[0].children?.find((route: any) => route.path === "/home");
const shellUtilityRoutes =
  dynamicRoutes[0].children?.filter((route: any) => route.meta?.is_hide !== false) || [];

/**
 * 后端控制路由：初始化方法，防止刷新时路由丢失
 * @method NextLoading 界面 loading 动画开始执行
 * @method useUserInfo().setUserInfos() 触发初始化用户信息 pinia
 * @method useRequestOldRoutes().setRequestOldRoutes() 存储接口原始路由（未处理component），根据需求选择使用
 * @method setAddRoute 添加动态路由
 * @method setFilterMenuAndCacheTagsViewRoutes 设置路由到 vuex routesList 中（已处理成多级嵌套路由）及缓存多级嵌套数组处理后的一维数组
 */
/** Restore the frontend-owned routes before adding the current backend menu. */
function resetBackendManagedRoutes() {
  dynamicRoutes[0].children = shellHomeRoute
    ? [shellHomeRoute, ...shellUtilityRoutes]
    : [...shellUtilityRoutes];
}

/** Replace backend-managed routes with a fresh, component-resolved menu. */
async function applyBackendMenuRoutes(menuRoute: any[]) {
  resetBackendManagedRoutes();
  dynamicRoutes[0].children?.push(...(await backEndComponent(menuRoute)));
}

/** Register the current dynamic routes and refresh the derived menu/cache stores. */
async function publishBackendRoutes() {
  await setAddRoute();
  await setFilterMenuAndCacheTagsViewRoutes();
}

/** Remove routes previously published by the backend-menu control plane. */
function removePublishedBackendRoutes() {
  setFilterRouteEnd().forEach((route: RouteRecordRaw) => {
    const routeName = route.name;
    if (routeName && router.hasRoute(routeName)) router.removeRoute(routeName);
  });
}

export async function initBackEndControlRoutes() {
  // 界面 loading 动画开始执行
  if (window.nextLoading === undefined) NextLoading.start();
  // 无 token 停止执行下一步
  if (!Session.get("token")) return false;
  try {
    // 触发初始化用户信息 pinia
    // https://gitee.com/lyt-top/vue-next-admin/issues/I5F1HP
    await useUserInfo().setUserInfos();
    await useUserInfo().setPermissions();
    // 获取路由菜单数据
    await getBackEndControlRoutes();
    let menuRoute = Session.get("userMenu");
    // 若菜单接口失败 / 401 / 没有数据，停在这里不抛错，避免整页白屏
    if (!menuRoute) {
      NextLoading.done();
      return false;
    }
    // 存储接口原始路由（未处理component），根据需求选择使用
    useRequestOldRoutes().setRequestOldRoutes(JSON.parse(JSON.stringify(menuRoute)));
    // 每次从完整菜单重新装配，避免重复初始化时菜单不断累加。
    await applyBackendMenuRoutes(menuRoute);
    await publishBackendRoutes();
  } catch (err) {
    // 后端 401 / 网络错误 / 任意子调用抛错都在这里兜住
    // 不再让 vue-router 的 beforeEach 把整个路由初始化拍死
    console.error("[initBackEndControlRoutes] failed:", err);
    NextLoading.done();
    return false;
  }
}

/**
 * 设置路由到 vuex routesList 中（已处理成多级嵌套路由）及缓存多级嵌套数组处理后的一维数组
 * @description 用于左侧菜单、横向菜单的显示
 * @description 用于 tagsView、菜单搜索中：未过滤隐藏的(isHide)
 */
export function setFilterMenuAndCacheTagsViewRoutes() {
  const storesRoutesList = useRoutesList(pinia);
  storesRoutesList.setRoutesList(dynamicRoutes[0].children as any);
  setCacheTagsViewRoutes();
}

/**
 * 缓存多级嵌套数组处理后的一维数组
 * @description 用于 tagsView、菜单搜索中：未过滤隐藏的(isHide)
 */
export function setCacheTagsViewRoutes() {
  const storesTagsView = useTagsViewRoutes(pinia);
  storesTagsView.setTagsViewRoutes(
    formatTwoStageRoutes(formatFlatteningRoutes(dynamicRoutes))[0].children,
  );
}

/**
 * 处理路由格式及添加捕获所有路由或 404 Not found 路由
 * @description 替换 dynamicRoutes（/@/router/route）第一个顶级 children 的路由
 * @returns 返回替换后的路由数组
 */
export function setFilterRouteEnd() {
  let filterRouteEnd: any = formatTwoStageRoutes(formatFlatteningRoutes(dynamicRoutes));
  filterRouteEnd[0].children = [...filterRouteEnd[0].children, ...notFoundAndNoPower];
  return filterRouteEnd;
}

/**
 * 添加动态路由
 * @method router.addRoute
 * @description 此处循环为 dynamicRoutes（/@/router/route）第一个顶级 children 的路由一维数组，非多级嵌套
 * @link 参考：https://next.router.vuejs.org/zh/api/#addroute
 */
export async function setAddRoute() {
  await setFilterRouteEnd().forEach((route: RouteRecordRaw) => {
    const routeName: any = route.name;
    if (!router.hasRoute(routeName)) router.addRoute(route);
  });
}

/**
 * 请求后端路由菜单接口
 * @description isRequestRoutes 为 true，则开启后端控制路由
 * @returns 返回后端路由菜单数据
 */
export async function getBackEndControlRoutes() {
  let menuRoute = Session.get("userMenu");
  let permissions = Session.get("permissions");
  if (!menuRoute || !permissions) {
    await refreshBackEndControlRoutes();
  }
}

/**
 * 请求后端路由菜单接口刷新菜单及权限
 * @description isRequestRoutes 为 true，则开启后端控制路由
 * @returns 返回后端路由菜单数据
 */
export async function refreshBackEndControlRoutes() {
  // 获取路由（包 try/catch 兜住 401 / 网络错误）
  try {
    const res: any = await getUserMenus();
    Session.set("userMenu", res.data.menu_list);
    Session.set("permissions", res.data.permissions);
  } catch (err) {
    // 后端 401 / 网络异常：清掉 token 让前端识别为未登录
    // 不在这里跳转登录页（避免循环），由请求拦截器统一处理
    console.warn("[refreshBackEndControlRoutes] getUserMenus failed:", err);
    return;
  }
  await useUserInfo().setPermissions();

  // 重新初始化路由菜单
  let menuRoute = Session.get("userMenu");
  if (!menuRoute) return;

  // 存储接口原始路由
  useRequestOldRoutes().setRequestOldRoutes(JSON.parse(JSON.stringify(menuRoute)));

  // 先移除当前已注册的动态路由，再装配新菜单，避免旧权限继续残留。
  removePublishedBackendRoutes();
  await applyBackendMenuRoutes(menuRoute);
  await publishBackendRoutes();
}

/**
 * 重新请求后端路由菜单接口
 * @description 用于菜单管理界面刷新菜单（未进行测试）
 * @description 路径：/src/views/pms/menu/component/addMenu.vue
 */

export function setBackEndControlRefreshRoutes() {
  getBackEndControlRoutes();
}

/**
 * 后端路由 component 转换
 * @param routes 后端返回的路由表数组
 * @returns 返回处理成函数后的 component
 */
export function backEndComponent(routes: any[]): any[] {
  if (!routes) return [];

  return routes.map((sourceItem: any): any => {
    const item: any = {
      ...sourceItem,
      meta: sourceItem.meta ? { ...sourceItem.meta } : sourceItem.meta,
      children: sourceItem.children ? backEndComponent(sourceItem.children) : sourceItem.children,
    };

    if (item.children?.length) {
      const firstVisibleChild = item.children.find((child: any) => !child.meta?.is_hide);
      if (firstVisibleChild) item.redirect = firstVisibleChild;
    }
    if (item.component) {
      item.component = dynamicImport(dynamicViewsModules, item.component as string);
    }

    // 将菜单 name（如 api/v1/pms/cms/article）作为权限标识注入路由 meta。
    if (item.meta && item.name) {
      const permissions = Array.isArray(item.meta.permissions)
        ? [...item.meta.permissions]
        : [];
      if (!permissions.includes(item.name)) permissions.push(item.name);
      item.meta.permissions = permissions;
    }
    return item;
  });
}

/**
 * 后端路由 component 转换函数
 * @param dynamicViewsModules 获取目录下的 .vue、.tsx 全部文件
 * @param component 当前要处理项 component
 * @returns 返回处理成函数后的 component
 */
export function dynamicImport(dynamicViewsModules: Record<string, Function>, component: string) {
  // 过滤掉 *.legacy.vue 备份文件（避免 glob 匹配冲突导致路由找不到组件）
  const keys = Object.keys(dynamicViewsModules).filter((k) => !k.includes(".legacy.vue"));
  const matchKeys = keys.filter((key) => {
    const k = key.replace(/..\/views|../, "");
    return k.startsWith(`${component}`) || k.startsWith(`/${component}`);
  });
  if (matchKeys?.length === 1) {
    const matchKey = matchKeys[0];
    return dynamicViewsModules[matchKey];
  }
  if (matchKeys?.length > 1) {
    return false;
  }
}
