import { RouteRecordRaw } from "vue-router";
import { Session } from "/@/utils/storage";

const allPermissions = "*/*/*";

function checkPerm(perm: string): boolean {
  const permissions = Session.get("permissions") || [];
  return permissions.includes(allPermissions) || permissions.includes(perm);
}

/**
 * 路由meta对象参数说明
 * meta: {
 *      title:          菜单栏及 tagsView 栏、菜单搜索名称（国际化）
 *      isLink：        是否超链接菜单，开启外链条件，`1、is_link: 链接地址不为空`
 *      isHide：        是否隐藏此路由
 *      isKeepAlive：   是否缓存组件状态
 *      isAffix：       是否固定在 tagsView 栏上
 *      isIframe：      是否内嵌窗口，开启条件，`1、is_iframe:true 2、isLink：链接地址不为空`
 *      roles：         当前路由权限标识，取角色管理。控制路由显示、隐藏。超级管理员：admin 普通角色：common
 *      icon：          菜单、tagsView 图标，阿里：加 `iconfont xxx`，fontawesome：加 `fa xxx`
 * }
 */

/**
 * 定义动态路由
 * 前端添加路由，请在顶级节点的 `children 数组` 里添加
 * @description 未开启 isRequestRoutes 为 true 时使用（前端控制路由），开启时第一个顶级 children 的路由将被替换成接口请求回来的路由数据
 * @description 各字段请查看 `/@/views/pms/menu/component/addMenu.vue 下的 ruleForm`
 * @returns 返回路由菜单数据
 */
export const dynamicRoutes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "/",
    component: () => import("/@/layout/index.vue"),
    redirect: "/home",
    meta: {
      is_keep_alive: true,
    },
    children: [
      {
        path: "/home",
        name: "home",
        component: () => import("/@/views/home/index.vue"),
        meta: {
          title: "message.router.home",
          is_link: "",
          is_hide: false,
          is_keep_alive: true,
          is_affix: true,
          is_iframe: false,
          roles: ["admin", "common"],
          icon: "iconfont icon-shouye",
        },
      },
      // Pro 组件预览页（隐藏路由，可通过 URL /pro/demo 访问）
      {
        path: "/pro/demo",
        name: "proDemo",
        component: () => import("/@/views/fun/proDemo.vue"),
        meta: {
          title: "Pro 组件预览",
          is_hide: true,
          is_keep_alive: false,
        },
      },
      {
        path: "/cms/article/list/add",
        name: "cmsArticleAdd",
        component: () => import("/@/views/cms/article/list/add.vue"),
        meta: {
          title: "message.router.user.cmsArticleAdd",
          is_hide: true,
          is_keep_alive: true,
          permissions: ["api/v1/admin/article/add"],
        },
        beforeEnter: (_to, _from, next) => {
          if (checkPerm("api/v1/admin/article/add")) return next();
          next("/401");
        },
      },
      {
        path: "/cms/article/list/edit",
        name: "cmsArticleEdit",
        component: () => import("/@/views/cms/article/list/edit.vue"),
        meta: {
          title: "message.router.cmsArticleEdit",
          is_hide: true,
          is_keep_alive: true,
          permissions: ["api/v1/admin/article/edit"],
        },
        beforeEnter: (_to, _from, next) => {
          if (checkPerm("api/v1/admin/article/edit")) return next();
          next("/401");
        },
      },
      {
        path: "/cms/block/list",
        name: "cmsBlock",
        component: () => import("/@/views/cms/block/list/index.vue"),
        meta: {
          title: "message.router.cmsBlock",
          is_hide: true, // 隐藏，由后端菜单控制显示位置
          is_keep_alive: true,
          permissions: ["api/v1/admin/block/list"],
        },
      },
      {
        path: "/cms/block/list/add",
        name: "cmsBlockAdd",
        component: () => import("/@/views/cms/block/list/edit.vue"),
        meta: {
          title: "message.router.cmsBlockAdd",
          is_hide: true,
          is_keep_alive: true,
          permissions: ["api/v1/admin/block/add"],
        },
        beforeEnter: (_to, _from, next) => {
          if (checkPerm("api/v1/admin/block/add")) return next();
          next("/401");
        },
      },
      {
        path: "/cms/block/list/edit",
        name: "cmsBlockEdit",
        component: () => import("/@/views/cms/block/list/edit.vue"),
        meta: {
          title: "message.router.cmsBlockEdit",
          is_hide: true,
          is_keep_alive: true,
          permissions: ["api/v1/admin/block/edit"],
        },
        beforeEnter: (_to, _from, next) => {
          if (checkPerm("api/v1/admin/block/edit")) return next();
          next("/401");
        },
      },
      // ==================== PMS Dict ====================
      {
        path: "/pms/dict/list/add",
        name: "pmsDictAdd",
        component: () => import("/@/views/pms/dict/edit.vue"),
        meta: { title: "message.router.pmsDictAdd", is_hide: true, is_keep_alive: true },
      },
      {
        path: "/pms/dict/list/edit",
        name: "pmsDictEdit",
        component: () => import("/@/views/pms/dict/edit.vue"),
        meta: { title: "message.router.pmsDictEdit", is_hide: true, is_keep_alive: true },
      },
      // ==================== PMS Post ====================
      {
        path: "/pms/post/list/add",
        name: "pmsPostAdd",
        component: () => import("/@/views/pms/post/edit.vue"),
        meta: { title: "message.router.pmsPostAdd", is_hide: true, is_keep_alive: true },
      },
      {
        path: "/pms/post/list/edit",
        name: "pmsPostEdit",
        component: () => import("/@/views/pms/post/edit.vue"),
        meta: { title: "message.router.pmsPostEdit", is_hide: true, is_keep_alive: true },
      },
      // ==================== Addon Job ====================
      {
        path: "/addon/job/list/add",
        name: "addonJobAdd",
        component: () => import("/@/views/addon/job/edit.vue"),
        meta: { title: "message.router.addonJobAdd", is_hide: true, is_keep_alive: true },
      },
      {
        path: "/addon/job/list/edit",
        name: "addonJobEdit",
        component: () => import("/@/views/addon/job/edit.vue"),
        meta: { title: "message.router.addonJobEdit", is_hide: true, is_keep_alive: true },
      },
      // ==================== Addon MQ ====================
      {
        path: "/addon/mq/messages",
        name: "addonMqMessages",
        component: () => import("/@/views/addon/mq/messages.vue"),
        meta: { title: "message.addon_mq.peekMessages", is_hide: true, is_keep_alive: true },
      },
      // ==================== PMS Param ====================
      {
        path: "/pms/param/list/add",
        name: "pmsParamAdd",
        component: () => import("/@/views/pms/param/edit.vue"),
        meta: { title: "message.router.pmsParamAdd", is_hide: true, is_keep_alive: true },
      },
      {
        path: "/pms/param/list/edit",
        name: "pmsParamEdit",
        component: () => import("/@/views/pms/param/edit.vue"),
        meta: { title: "message.router.pmsParamEdit", is_hide: true, is_keep_alive: true },
      },
      // ==================== PMS Sub-dialogs → Page-card routes ====================
      {
        path: "/pms/dept/list/add",
        name: "pmsDeptAdd",
        component: () => import("/@/views/pms/dept/edit.vue"),
        meta: { title: "message.router.pmsDeptAdd", is_hide: true, is_keep_alive: true },
      },
      {
        path: "/pms/dept/list/edit",
        name: "pmsDeptEdit",
        component: () => import("/@/views/pms/dept/edit.vue"),
        meta: { title: "message.router.pmsDeptEdit", is_hide: true, is_keep_alive: true },
      },
      {
        path: "/pms/dict/data/add",
        name: "pmsDictDataAdd",
        component: () => import("/@/views/pms/dict/editData.vue"),
        meta: { title: "message.router.pmsDictDataAdd", is_hide: true, is_keep_alive: true },
      },
      {
        path: "/pms/dict/data/edit",
        name: "pmsDictDataEdit",
        component: () => import("/@/views/pms/dict/editData.vue"),
        meta: { title: "message.router.pmsDictDataEdit", is_hide: true, is_keep_alive: true },
      },
      {
        path: "/pms/user/list/add",
        name: "pmsUserAdd",
        component: () => import("/@/views/pms/user/edit.vue"),
        meta: { title: "message.router.pmsUserAdd", is_hide: true, is_keep_alive: true },
      },
      {
        path: "/pms/user/list/edit",
        name: "pmsUserEdit",
        component: () => import("/@/views/pms/user/edit.vue"),
        meta: { title: "message.router.pmsUserEdit", is_hide: true, is_keep_alive: true },
      },
      {
        path: "/pms/role/list/add",
        name: "pmsRoleAdd",
        component: () => import("/@/views/pms/role/edit.vue"),
        meta: { title: "message.router.pmsRoleAdd", is_hide: true, is_keep_alive: true },
      },
      {
        path: "/pms/role/list/edit",
        name: "pmsRoleEdit",
        component: () => import("/@/views/pms/role/edit.vue"),
        meta: { title: "message.router.pmsRoleEdit", is_hide: true, is_keep_alive: true },
      },
      {
        path: "/pms/menu/list/add",
        name: "pmsMenuAdd",
        component: () => import("/@/views/pms/menu/edit.vue"),
        meta: { title: "message.router.pmsMenuAdd", is_hide: true, is_keep_alive: true },
      },
      {
        path: "/pms/menu/list/edit",
        name: "pmsMenuEdit",
        component: () => import("/@/views/pms/menu/edit.vue"),
        meta: { title: "message.router.pmsMenuEdit", is_hide: true, is_keep_alive: true },
      },
      // ==================== PMS Sub-dialogs (dept/user/role/menu/dicData) - routes for future page-card conversion ====================
      // ==================== CMS Channel ====================
      {
        path: "/cms/channel/list/add",
        name: "cmsChannelAdd",
        component: () => import("/@/views/cms/channel/list/edit.vue"),
        meta: {
          title: "message.router.cmsChannelAdd",
          is_hide: true,
          is_keep_alive: true,
          permissions: ["api/v1/admin/channel/add"],
        },
        beforeEnter: (_to, _from, next) => {
          if (checkPerm("api/v1/admin/channel/add")) return next();
          next("/401");
        },
      },
      {
        path: "/cms/channel/list/edit",
        name: "cmsChannelEdit",
        component: () => import("/@/views/cms/channel/list/edit.vue"),
        meta: {
          title: "message.router.cmsChannelEdit",
          is_hide: true,
          is_keep_alive: true,
          permissions: ["api/v1/admin/channel/edit"],
        },
        beforeEnter: (_to, _from, next) => {
          if (checkPerm("api/v1/admin/channel/edit")) return next();
          next("/401");
        },
      },
      // ==================== CMS Page ====================
      {
        path: "/cms/page/list/add",
        name: "cmsPageAdd",
        component: () => import("/@/views/cms/page/list/edit.vue"),
        meta: {
          title: "message.router.cmsPageAdd",
          is_hide: true,
          is_keep_alive: true,
          permissions: ["api/v1/admin/page/add"],
        },
        beforeEnter: (_to, _from, next) => {
          if (checkPerm("api/v1/admin/page/add")) return next();
          next("/401");
        },
      },
      {
        path: "/cms/page/list/edit",
        name: "cmsPageEdit",
        component: () => import("/@/views/cms/page/list/edit.vue"),
        meta: {
          title: "message.router.cmsPageEdit",
          is_hide: true,
          is_keep_alive: true,
          permissions: ["api/v1/admin/page/edit"],
        },
        beforeEnter: (_to, _from, next) => {
          if (checkPerm("api/v1/admin/page/edit")) return next();
          next("/401");
        },
      },
      // ==================== CMS Tag ====================
      {
        path: "/cms/tag/list/add",
        name: "cmsTagAdd",
        component: () => import("/@/views/cms/tag/list/edit.vue"),
        meta: {
          title: "message.router.cmsTagAdd",
          is_hide: true,
          is_keep_alive: true,
          permissions: ["api/v1/admin/tag/add"],
        },
        beforeEnter: (_to, _from, next) => {
          if (checkPerm("api/v1/admin/tag/add")) return next();
          next("/401");
        },
      },
      {
        path: "/cms/tag/list/edit",
        name: "cmsTagEdit",
        component: () => import("/@/views/cms/tag/list/edit.vue"),
        meta: {
          title: "message.router.cmsTagEdit",
          is_hide: true,
          is_keep_alive: true,
          permissions: ["api/v1/admin/tag/edit"],
        },
        beforeEnter: (_to, _from, next) => {
          if (checkPerm("api/v1/admin/tag/edit")) return next();
          next("/401");
        },
      },
      // ==================== CMS Link ====================
      {
        path: "/cms/link/list/add",
        name: "cmsLinkAdd",
        component: () => import("/@/views/cms/link/list/add.vue"),
        meta: {
          title: "message.router.cmsLinkAdd",
          is_hide: true,
          is_keep_alive: true,
          permissions: ["api/v1/admin/link/add"],
        },
        beforeEnter: (_to, _from, next) => {
          if (checkPerm("api/v1/admin/link/add")) return next();
          next("/401");
        },
      },
      {
        path: "/cms/link/list/edit",
        name: "cmsLinkEdit",
        component: () => import("/@/views/cms/link/list/edit.vue"),
        meta: {
          title: "message.router.cmsLinkEdit",
          is_hide: true,
          is_keep_alive: true,
          permissions: ["api/v1/admin/link/edit"],
        },
        beforeEnter: (_to, _from, next) => {
          if (checkPerm("api/v1/admin/link/edit")) return next();
          next("/401");
        },
      },
      // ==================== PMS ModulesInfo ====================
      {
        path: "/pms/modules/info/list/add",
        name: "pmsModulesInfoAdd",
        component: () => import("/@/views/pms/modulesInfo/list/edit.vue"),
        meta: {
          title: "message.router.pmsModulesInfoAdd",
          is_hide: true,
          is_keep_alive: true,
          permissions: ["api/v1/admin/modules/info/add"],
        },
        beforeEnter: (_to, _from, next) => {
          if (checkPerm("api/v1/admin/modules/info/add")) return next();
          next("/401");
        },
      },
      {
        path: "/pms/modules/info/list/edit",
        name: "pmsModulesInfoEdit",
        component: () => import("/@/views/pms/modulesInfo/list/edit.vue"),
        meta: {
          title: "message.router.pmsModulesInfoEdit",
          is_hide: true,
          is_keep_alive: true,
          permissions: ["api/v1/admin/modules/info/edit"],
        },
        beforeEnter: (_to, _from, next) => {
          if (checkPerm("api/v1/admin/modules/info/edit")) return next();
          next("/401");
        },
      },
      // ==================== PMS ModulesField ====================
      {
        path: "/pms/modules/field/list/add",
        name: "pmsModulesFieldAdd",
        component: () => import("/@/views/pms/modulesField/list/edit.vue"),
        meta: {
          title: "message.router.pmsModulesFieldAdd",
          is_hide: true,
          is_keep_alive: true,
          permissions: ["api/v1/admin/modules/field/add"],
        },
        beforeEnter: (_to, _from, next) => {
          if (checkPerm("api/v1/admin/modules/field/add")) return next();
          next("/401");
        },
      },
      {
        path: "/pms/modules/field/list/edit",
        name: "pmsModulesFieldEdit",
        component: () => import("/@/views/pms/modulesField/list/edit.vue"),
        meta: {
          title: "message.router.pmsModulesFieldEdit",
          is_hide: true,
          is_keep_alive: true,
          permissions: ["api/v1/admin/modules/field/edit"],
        },
        beforeEnter: (_to, _from, next) => {
          if (checkPerm("api/v1/admin/modules/field/edit")) return next();
          next("/401");
        },
      },
      // ==================== SDK 管理 ====================
      {
        path: "/addon/sdk/game/list",
        name: "addonSdkGameList",
        component: () => import("/@/views/addon/sdk/game/list/index.vue"),
        meta: {
          title: "message.sdk.gameList",
          is_hide: true,
          is_keep_alive: true,
          permissions: ["api/v1/addon/sdk/game/list"],
        },
      },
      {
        path: "/addon/sdk/game/add",
        name: "addonSdkGameAdd",
        component: () => import("/@/views/addon/sdk/game/add.vue"),
        meta: {
          title: "message.sdk.gameAdd",
          is_hide: true,
          is_keep_alive: true,
          permissions: ["api/v1/addon/sdk/game/add"],
        },
      },
      {
        path: "/addon/sdk/game/edit",
        name: "addonSdkGameEdit",
        component: () => import("/@/views/addon/sdk/game/edit.vue"),
        meta: {
          title: "message.sdk.gameEdit",
          is_hide: true,
          is_keep_alive: true,
          permissions: ["api/v1/addon/sdk/game/edit"],
        },
      },
      {
        path: "/addon/product/list",
        name: "addonSdkProductList",
        component: () => import("/@/views/addon/product/list/index.vue"),
        meta: {
          title: "message.sdk.productList",
          is_hide: true,
          is_keep_alive: true,
          permissions: ["api/v1/addon/product/list"],
        },
      },
      {
        path: "/addon/product/add",
        name: "addonSdkProductAdd",
        component: () => import("/@/views/addon/product/add.vue"),
        meta: {
          title: "message.sdk.productAdd",
          is_hide: true,
          is_keep_alive: true,
          permissions: ["api/v1/addon/product/add"],
        },
      },
      {
        path: "/addon/product/edit",
        name: "addonSdkProductEdit",
        component: () => import("/@/views/addon/product/edit.vue"),
        meta: {
          title: "message.sdk.productEdit",
          is_hide: true,
          is_keep_alive: true,
          permissions: ["api/v1/addon/product/edit"],
        },
      },
      {
        path: "/addon/sdk/version/list",
        name: "addonSdkVersionList",
        component: () => import("/@/views/addon/sdk/version/list/index.vue"),
        meta: {
          title: "message.sdk.versionList",
          is_hide: true,
          is_keep_alive: true,
          permissions: ["api/v1/addon/sdk/version/list"],
        },
      },
      {
        path: "/addon/sdk/version/add",
        name: "addonSdkVersionAdd",
        component: () => import("/@/views/addon/sdk/version/add.vue"),
        meta: {
          title: "message.sdk.versionAdd",
          is_hide: true,
          is_keep_alive: true,
          permissions: ["api/v1/addon/sdk/version/add"],
        },
      },
      {
        path: "/addon/sdk/version/edit",
        name: "addonSdkVersionEdit",
        component: () => import("/@/views/addon/sdk/version/edit.vue"),
        meta: {
          title: "message.sdk.versionEdit",
          is_hide: true,
          is_keep_alive: true,
          permissions: ["api/v1/addon/sdk/version/edit"],
        },
      },
      {
        path: "/addon/pay/config/list",
        name: "addonPayConfigList",
        component: () => import("/@/views/addon/pay/config/list/index.vue"),
        meta: {
          title: "message.sdk.payConfigList",
          is_hide: true,
          is_keep_alive: true,
          permissions: ["api/v1/addon/pay/config/list"],
        },
      },
      {
        path: "/addon/pay/config/add",
        name: "addonPayConfigAdd",
        component: () => import("/@/views/addon/pay/config/add.vue"),
        meta: {
          title: "message.sdk.payConfigAdd",
          is_hide: true,
          is_keep_alive: true,
          permissions: ["api/v1/addon/pay/config/add"],
        },
      },
      {
        path: "/addon/pay/config/edit",
        name: "addonPayConfigEdit",
        component: () => import("/@/views/addon/pay/config/edit.vue"),
        meta: {
          title: "message.sdk.payConfigEdit",
          is_hide: true,
          is_keep_alive: true,
          permissions: ["api/v1/addon/pay/config/edit"],
        },
      },
      {
        path: "/addon/sdk/developer/list",
        name: "addonSdkDeveloperList",
        component: () => import("/@/views/addon/sdk/developer/list/index.vue"),
        meta: {
          title: "message.sdk.developerList",
          is_hide: true,
          is_keep_alive: true,
          permissions: ["api/v1/addon/sdk/developer/list"],
        },
      },
      {
        path: "/addon/sdk/developer/add",
        name: "addonSdkDeveloperAdd",
        component: () => import("/@/views/addon/sdk/developer/add.vue"),
        meta: {
          title: "message.sdk.developerAdd",
          is_hide: true,
          is_keep_alive: true,
          permissions: ["api/v1/addon/sdk/developer/add"],
        },
      },
      {
        path: "/addon/sdk/developer/edit",
        name: "addonSdkDeveloperEdit",
        component: () => import("/@/views/addon/sdk/developer/edit.vue"),
        meta: {
          title: "message.sdk.developerEdit",
          is_hide: true,
          is_keep_alive: true,
          permissions: ["api/v1/addon/sdk/developer/edit"],
        },
      },
      {
        path: "/addon/order/list",
        name: "addonOrderList",
        component: () => import("/@/views/addon/sdk/order/list/index.vue"),
        meta: {
          title: "message.sdk.orderList",
          is_hide: true,
          is_keep_alive: true,
          permissions: ["api/v1/addon/order/list"],
        },
      },
      {
        path: "/addon/order/detail",
        name: "addonOrderDetail",
        component: () => import("/@/views/addon/sdk/order/detail.vue"),
        meta: {
          title: "message.sdk.orderDetail",
          is_hide: true,
          is_keep_alive: true,
          permissions: ["api/v1/addon/order/list"],
        },
      },
      {
        path: "/addon/order/completed/list",
        name: "addonCompletedList",
        component: () => import("/@/views/addon/sdk/order/completed/index.vue"),
        meta: {
          title: "message.sdk.completedList",
          is_hide: true,
          is_keep_alive: true,
          permissions: ["api/v1/addon/order/completed/list"],
        },
      },
      {
        path: "/addon/sdk/game-order/list",
        name: "addonSdkGameOrderList",
        component: () => import("/@/views/addon/sdk/game-order/list/index.vue"),
        meta: {
          title: "message.sdk.gameOrder",
          is_hide: true,
          is_keep_alive: true,
          permissions: ["api/v1/addon/sdk/game-order/list"],
        },
      },
      {
        path: "/addon/sdk/game-user/list",
        name: "addonSdkGameUserList",
        component: () => import("/@/views/addon/sdk/gameuser/index.vue"),
        meta: {
          title: "message.sdk.gameUserList",
          is_hide: true,
          is_keep_alive: true,
          permissions: ["api/v1/addon/sdk/game-user/list"],
        },
      },
      {
        path: "/addon/sdk/refund/list",
        name: "addonSdkRefundList",
        component: () => import("/@/views/addon/sdk/refund/index.vue"),
        meta: {
          title: "message.sdk.refundList",
          is_hide: true,
          is_keep_alive: true,
          permissions: ["api/v1/addon/sdk/refund/google/list"],
        },
      },
      {
        path: "/addon/sdk/ban/list",
        name: "addonSdkBanList",
        component: () => import("/@/views/addon/sdk/ban/list/index.vue"),
        meta: {
          title: "message.sdk.banList",
          is_hide: true,
          is_keep_alive: true,
          permissions: ["api/v1/addon/sdk/ban/list"],
        },
      },
      {
        path: "/addon/sdk/ban/add",
        name: "addonSdkBanAdd",
        component: () => import("/@/views/addon/sdk/ban/add.vue"),
        meta: {
          title: "message.sdk.banAdd",
          is_hide: true,
          is_keep_alive: true,
          permissions: ["api/v1/addon/sdk/ban/add"],
        },
      },
      {
        path: "/addon/sdk/ban/edit",
        name: "addonSdkBanEdit",
        component: () => import("/@/views/addon/sdk/ban/edit.vue"),
        meta: {
          title: "message.sdk.banEdit",
          is_hide: true,
          is_keep_alive: true,
          permissions: ["api/v1/addon/sdk/ban/edit"],
        },
      },
      {
        path: "/addon/sdk/login-log/list",
        name: "addonSdkLoginLogList",
        component: () => import("/@/views/addon/sdk/login-log/list/index.vue"),
        meta: {
          title: "message.sdk.loginLogList",
          is_hide: true,
          is_keep_alive: true,
          permissions: ["api/v1/addon/sdk/login-log/list"],
        },
      },
      // ---- 用户管理 ----
      {
        path: "/addon/sdk/user/list",
        name: "addonSdkUserList",
        component: () => import("/@/views/addon/sdk/user/index.vue"),
        meta: {
          title: "message.sdk.userList",
          is_hide: true,
          is_keep_alive: true,
          permissions: ["api/v1/addon/sdk/user/list"],
        },
      },
      {
        path: "/addon/sdk/user/detail",
        name: "addonSdkUserDetail",
        component: () => import("/@/views/addon/sdk/user/detail.vue"),
        meta: {
          title: "message.sdk.userDetail",
          is_hide: true,
          is_keep_alive: true,
          permissions: ["api/v1/addon/sdk/user/list"],
        },
      },
      // ---- 全局支付通道 ----
      {
        path: "/addon/pay/channel/list",
        name: "addonPayChannelList",
        component: () => import("/@/views/addon/pay/channel/index.vue"),
        meta: {
          title: "message.sdk.payChannelList",
          is_hide: true,
          is_keep_alive: true,
          permissions: ["api/v1/addon/pay/channel/list"],
        },
      },
      {
        path: "/addon/pay/channel/add",
        name: "addonPayChannelAdd",
        component: () => import("/@/views/addon/pay/channel/add.vue"),
        meta: {
          title: "message.sdk.payChannelAdd",
          is_hide: true,
          is_keep_alive: true,
          permissions: ["api/v1/addon/pay/channel/add"],
        },
      },
      {
        path: "/addon/pay/channel/edit",
        name: "addonPayChannelEdit",
        component: () => import("/@/views/addon/pay/channel/edit.vue"),
        meta: {
          title: "message.sdk.payChannelEdit",
          is_hide: true,
          is_keep_alive: true,
          permissions: ["api/v1/addon/pay/channel/edit"],
        },
      },
      // ---- 货币管理 ----
      {
        path: "/addon/sdk/currency/list",
        name: "addonSdkCurrencyList",
        component: () => import("/@/views/addon/sdk/currency/index.vue"),
        meta: {
          title: "message.sdk.currencyList",
          is_hide: true,
          is_keep_alive: true,
          permissions: ["api/v1/addon/sdk/currency/list"],
        },
      },
      {
        path: "/addon/sdk/currency/add",
        name: "addonSdkCurrencyAdd",
        component: () => import("/@/views/addon/sdk/currency/add.vue"),
        meta: {
          title: "message.sdk.currencyAdd",
          is_hide: true,
          is_keep_alive: true,
          permissions: ["api/v1/addon/sdk/currency/add"],
        },
      },
      {
        path: "/addon/sdk/currency/edit",
        name: "addonSdkCurrencyEdit",
        component: () => import("/@/views/addon/sdk/currency/edit.vue"),
        meta: {
          title: "message.sdk.currencyEdit",
          is_hide: true,
          is_keep_alive: true,
          permissions: ["api/v1/addon/sdk/currency/edit"],
        },
      },
      {
        path: "/addon/sdk/email",
        name: "addonSdkEmail",
        component: () => import("/@/views/addon/sdk/email/index.vue"),
        meta: { title: "message.sdk.email", is_hide: true, is_keep_alive: true },
      },
    ],
  },
];

/**
 * 定义404、401界面
 * @link 参考：https://next.router.vuejs.org/zh/guide/essentials/history-mode.html#netlify
 */
export const notFoundAndNoPower = [
  {
    path: "/:path(.*)*",
    name: "notFound",
    component: () => import("/@/views/error/404.vue"),
    meta: {
      title: "message.staticRoutes.notFound",
      is_hide: true,
    },
  },
  {
    path: "/401",
    name: "noPower",
    component: () => import("/@/views/error/401.vue"),
    meta: {
      title: "message.staticRoutes.noPower",
      is_hide: true,
    },
  },
];

/**
 * 定义静态路由（默认路由）
 * 此路由不要动，前端添加路由的话，请在 `dynamicRoutes 数组` 中添加
 * @description 前端控制直接改 dynamicRoutes 中的路由，后端控制不需要修改，请求接口路由数据时，会覆盖 dynamicRoutes 第一个顶级 children 的内容（全屏，不包含 layout 中的路由出口）
 * @returns 返回路由菜单数据
 */
export const staticRoutes: Array<RouteRecordRaw> = [
  {
    path: "/login",
    name: "login",
    component: () => import("/@/views/login/index.vue"),
    meta: {
      title: "message.router.login",
    },
  },
  /**
   * 提示：写在这里的为全屏界面，不建议写在这里
   * 请写在 `dynamicRoutes` 路由数组中
   */
  {
    path: "/:pathMatch(.*)*",
    component: () => import("/@/layout/routerView/parent.vue"),
    meta: {
      title: "message.router.loading",
    },
  },
];
