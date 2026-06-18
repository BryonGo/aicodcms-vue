import { createRouter, createWebHashHistory } from "vue-router";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import pinia from "/@/stores/index";
import { storeToRefs } from "pinia";
import { useKeepALiveNames } from "/@/stores/keepAliveNames";
import { useRoutesList } from "/@/stores/routesList";
import { useThemeConfig } from "/@/stores/themeConfig";
import { Session } from "/@/utils/storage";
import { staticRoutes } from "/@/router/route";
import { initFrontEndControlRoutes } from "/@/router/frontEnd";
import { initBackEndControlRoutes } from "/@/router/backEnd";

const allPermissions = "*/*/*";

/**
 * 1、前端控制路由时：isRequestRoutes 为 false，需要写 roles，需要走 setFilterRoute 方法。
 * 2、后端控制路由时：isRequestRoutes 为 true，不需要写 roles，不需要走 setFilterRoute 方法），
 * 相关方法已拆解到对应的 `backEnd.ts` 与 `frontEnd.ts`（他们互不影响，不需要同时改 2 个文件）。
 * 特别说明：
 * 1、前端控制：路由菜单由前端去写（无菜单管理界面，有角色管理界面），角色管理中有 roles 属性，需返回到 userInfo 中。
 * 2、后端控制：路由菜单由后端返回（有菜单管理界面、有角色管理界面）
 */

// 读取 `/src/stores/themeConfig.ts` 是否开启后端控制路由配置
const storesThemeConfig = useThemeConfig(pinia);
const { themeConfig } = storeToRefs(storesThemeConfig);
const { isRequestRoutes } = themeConfig.value;

/**
 * 创建一个可以被 Vue 应用程序使用的路由实例
 * @method createRouter(options: RouterOptions): Router
 * @link 参考：https://next.router.vuejs.org/zh/api/#createrouter
 */
export const router = createRouter({
  history: createWebHashHistory(),
  routes: staticRoutes,
});

/**
 * 路由多级嵌套数组处理成一维数组
 * @param arr 传入路由菜单数据数组
 * @returns 返回处理后的一维路由菜单数组
 */
export function formatFlatteningRoutes(arr: any) {
  if (arr.length <= 0) return false;
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].children) {
      arr = arr.slice(0, i + 1).concat(arr[i].children, arr.slice(i + 1));
    }
  }
  return arr;
}

/**
 * 一维数组处理成多级嵌套数组（只保留二级：也就是二级以上全部处理成只有二级，keep-alive 支持二级缓存）
 * @description isKeepAlive 处理 `name` 值，进行缓存。顶级关闭，全部不缓存
 * @link 参考：https://v3.cn.vuejs.org/api/built-in-components.html#keep-alive
 * @param arr 处理后的一维路由菜单数组
 * @returns 返回将一维数组重新处理成 `定义动态路由（dynamicRoutes）` 的格式
 */
export function formatTwoStageRoutes(arr: any) {
  if (arr.length <= 0) return false;
  const newArr: any = [];
  const cacheList: Array<string> = [];
  arr.forEach((v: any) => {
    if (v.path === "/") {
      newArr.push({
        component: v.component,
        name: v.name,
        path: v.path,
        redirect: v.redirect,
        meta: v.meta,
        children: [],
      });
    } else {
      // 判断是否是动态路由（xx/:id/:name），用于 tagsView 等中使用
      // 修复：https://gitee.com/lyt-top/vue-next-admin/issues/I3YX6G
      if (v.path.indexOf("/:") > -1) {
        v.meta["isDynamic"] = true;
        v.meta["isDynamicPath"] = v.path;
      }
      newArr[0].children.push({ ...v });
      // 存 name 值，keep-alive 中 include 使用，实现路由的缓存
      // 路径：/@/layout/routerView/parent.vue
      if (newArr[0].meta.is_keep_alive && v.meta.is_keep_alive) {
        cacheList.push(v.name);
        const stores = useKeepALiveNames(pinia);
        stores.setCacheKeepAlive(cacheList);
      }
    }
  });
  return newArr;
}

// 路由加载前
router.beforeEach(async (to, from, next) => {
  NProgress.configure({ showSpinner: false });
  if (to.meta.title) NProgress.start();
  const token = Session.get("token");
  if (to.path === "/login" && !token) {
    next();
    NProgress.done();
  } else {
    if (!token) {
      next(`/login?redirect=${to.path}&params=${JSON.stringify(to.query ? to.query : to.params)}`);
      Session.clear();
      NProgress.done();
    } else if (token && to.path === "/login") {
      next("/home");
      NProgress.done();
    } else {
      const storesRoutesList = useRoutesList(pinia);
      const { routesList } = storeToRefs(storesRoutesList);
      if (routesList.value.length === 0) {
        if (isRequestRoutes) {
          // 后端控制路由：路由数据初始化，防止刷新时丢失
          const ok = await initBackEndControlRoutes();
          if (!ok) {
            // API 临时失败（后端重启/网络抖动）：不清 token，跳登录页让用户刷新重试
            next(`/login?redirect=${to.path}`);
            NProgress.done();
            return;
          }
          // 动态添加路由：防止非首页刷新时跳转回首页的问题
          // 确保 addRoute() 时动态添加的路由已经被完全加载上去
          next({ ...to, replace: true });
        } else {
          // https://gitee.com/lyt-top/vue-next-admin/issues/I5F1HP
          const ok = await initFrontEndControlRoutes();
          if (!ok) {
            next(`/login?redirect=${to.path}`);
            NProgress.done();
            return;
          }
          next({ ...to, replace: true });
        }
      } else {
        // 全局权限检查：meta.permissions 指定了所需权限时，校验当前用户是否拥有
        const needPerms: string[] = (to.meta?.permissions as string[]) || [];
        if (needPerms.length > 0) {
          const permissions: string[] = Session.get("permissions") || [];
          const hasPerm =
            permissions.includes(allPermissions) || needPerms.some((p) => permissions.includes(p));
          if (!hasPerm) {
            next("/401");
            NProgress.done();
            return;
          }
        }
        next();
      }
    }
  }
});

// 路由加载后
router.afterEach(() => {
  NProgress.done();
});

// 导出路由
export default router;
