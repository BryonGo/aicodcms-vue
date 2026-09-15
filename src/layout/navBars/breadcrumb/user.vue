<template>
  <div class="layout-navbars-breadcrumb-user pr15" :style="{ flex: layoutUserFlexNum }">
    <el-dropdown
      :show-timeout="70"
      :hide-timeout="50"
      trigger="click"
      @command="onComponentSizeChange"
    >
      <div class="layout-navbars-breadcrumb-user-icon">
        <i class="iconfont icon-ziti" :title="$t('message.user.title0')"></i>
      </div>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="large" :disabled="disabledSize === 'large'">{{
            $t("message.user.dropdownLarge")
          }}</el-dropdown-item>
          <el-dropdown-item command="default" :disabled="disabledSize === 'default'">{{
            $t("message.user.dropdownDefault")
          }}</el-dropdown-item>
          <el-dropdown-item command="small" :disabled="disabledSize === 'small'">{{
            $t("message.user.dropdownSmall")
          }}</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
    <el-dropdown :show-timeout="70" :hide-timeout="50" trigger="click" @command="onLanguageChange">
      <div class="layout-navbars-breadcrumb-user-icon">
        <i
          class="iconfont"
          :class="disabledI18n === 'en' ? 'icon-fuhao-yingwen' : 'icon-fuhao-zhongwen'"
          :title="$t('message.user.title1')"
        ></i>
      </div>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="zh-cn" :disabled="disabledI18n === 'zh-cn'"
            >简体中文</el-dropdown-item
          >
          <el-dropdown-item command="en" :disabled="disabledI18n === 'en'"
            >English</el-dropdown-item
          >
        </el-dropdown-menu>
      </template>
    </el-dropdown>
    <el-dropdown
      :show-timeout="70"
      :hide-timeout="50"
      trigger="click"
      :disabled="!canSwitchSite"
      @command="onSiteChange"
    >
      <span class="layout-navbars-breadcrumb-user-link site-selector">
        <i class="iconfont icon-quanqiu" :title="'站点'"></i>
        <span class="site-selector-name">{{ currentSiteName }}</span>
        <el-icon v-if="canSwitchSite" class="el-icon--right"><ele-ArrowDown /></el-icon>
      </span>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item
            v-for="s in siteSites"
            :key="s.code"
            :command="s.code"
            :disabled="s.code === currentSiteCode"
          >
            {{ s.name }}（{{ s.code }}）
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
    <div class="layout-navbars-breadcrumb-user-icon" @click="onSearchClick">
      <el-icon :title="$t('message.user.title2')">
        <ele-Search />
      </el-icon>
    </div>
    <div class="layout-navbars-breadcrumb-user-icon" @click="onLayoutSetingClick">
      <i class="icon-skin iconfont" :title="$t('message.user.title3')"></i>
    </div>
    <div class="layout-navbars-breadcrumb-user-icon" @click="removeCacheClick">
      <i class="fa-trash fa" title="清除缓存"></i>
    </div>
    <div class="layout-navbars-breadcrumb-user-icon mr10" @click="onScreenfullClick">
      <i
        class="iconfont"
        :title="isScreenfull ? $t('message.user.title6') : $t('message.user.title5')"
        :class="!isScreenfull ? 'icon-fullscreen' : 'icon-tuichuquanping'"
      ></i>
    </div>
    <el-dropdown
      :show-timeout="70"
      :hide-timeout="50"
      @command="onHandleCommandClick"
      @visible-change="onUserDropdownVisible"
    >
      <span class="layout-navbars-breadcrumb-user-link">
        <img
          :src="userInfos.avatar || defaultAvatar"
          class="layout-navbars-breadcrumb-user-link-photo mr5"
          @error="onAvatarError"
        />
        {{ userInfos.user_name === "" ? "common" : userInfos.user_name }}
        <el-icon class="el-icon--right">
          <ele-ArrowDown />
        </el-icon>
      </span>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="/home">{{ $t("message.user.dropdown1") }}</el-dropdown-item>
          <el-dropdown-item command="/404">{{ $t("message.user.dropdown3") }}</el-dropdown-item>
          <el-dropdown-item command="/401">{{ $t("message.user.dropdown4") }}</el-dropdown-item>
          <el-dropdown-item divided command="clearCache">清空缓存</el-dropdown-item>
          <el-dropdown-item command="logOut">{{ $t("message.user.dropdown5") }}</el-dropdown-item>
          <!-- 版本信息：控制台（镜像 tag）与接口（Go 进程）并排，用于一眼看出只发布了一半 -->
          <el-dropdown-item divided disabled class="user-version">
            <span class="user-version__label">{{ $t("message.user.versionConsole") }}</span>
            <span class="user-version__value" :title="consoleVersionTip">{{
              consoleVersionText
            }}</span>
          </el-dropdown-item>
          <el-dropdown-item disabled class="user-version">
            <span class="user-version__label">{{ $t("message.user.versionApi") }}</span>
            <span class="user-version__value" :title="apiVersionTip">{{ apiVersionText }}</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
    <Search ref="searchRef" />
  </div>
</template>

<script lang="ts">
import {
  ref,
  getCurrentInstance,
  computed,
  reactive,
  toRefs,
  onMounted,
  defineComponent,
} from "vue";
import { useRouter } from "vue-router";
import { ElMessageBox, ElMessage } from "element-plus";
import { useI18n } from "vue-i18n";
import { storeToRefs } from "pinia";
import { useUserInfo } from "/@/stores/userInfo";
import { useSiteInfo } from "/@/stores/siteInfo";
import { useThemeConfig } from "/@/stores/themeConfig";
import other from "/@/utils/other";
import { Session, Local } from "/@/utils/storage";
import UserNews from "/@/layout/navBars/breadcrumb/userNews.vue";
import Search from "/@/layout/navBars/breadcrumb/search.vue";
import { logout } from "/@/api/login";
import { removeCache } from "/@/api/pms/cache";
import { setLanguage } from "/@/api/cms/setting";
import { refreshBackEndControlRoutes } from "/@/router/backEnd";
import { useApiVersion } from "/@/composables/useApiVersion";
import { useVersionWatcher } from "/@/composables/useVersionWatcher";

export default defineComponent({
  name: "layoutBreadcrumbUser",
  components: { UserNews, Search },
  setup() {
    const { t } = useI18n();
    const { proxy } = <any>getCurrentInstance();
    const router = useRouter();
    const stores = useUserInfo();
    const storesSite = useSiteInfo();
    const storesThemeConfig = useThemeConfig();
    const { userInfos } = storeToRefs(stores);
    const { sites: siteSites, currentSiteCode, canSwitchSite } = storeToRefs(storesSite);
    const { themeConfig } = storeToRefs(storesThemeConfig);
    const searchRef = ref();
    // 默认头像 fallback (内联 SVG 用户图标)
    const defaultAvatar =
      "data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22%3E%3Cpath fill=%22%23a0aec0%22 d=%22M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z%22/%3E%3C/svg%3E";
    const onAvatarError = (e: Event) => {
      (e.target as HTMLImageElement).src = defaultAvatar;
    };
    const state = reactive({
      isScreenfull: false,
      disabledI18n: "zh-cn",
      disabledSize: "large",
    });
    // 设置分割样式
    const layoutUserFlexNum = computed(() => {
      let num: string | number = "";
      const { layout, isClassicSplitMenu } = themeConfig.value;
      const layoutArr: string[] = ["defaults", "columns"];
      if (layoutArr.includes(layout) || (layout === "classic" && !isClassicSplitMenu)) num = "1";
      else num = "";
      return num;
    });
    // 当前站点名（站群选择器）
    const currentSiteName = computed(() => {
      return storesSite.currentSite?.name || "默认站点";
    });
    // 版本信息：控制台版本来自 /admin/version.json（容器启动时写入的镜像 tag），
    // 接口版本来自 API 的 /api/version。两者属于两条独立发布链，不一致 = 只发布了半边。
    const apiVersion = useApiVersion();
    const consoleWatcher = useVersionWatcher();
    // 镜像 tag 形如 20260915153531-e693224：菜单里只显示短 sha，完整值放 title
    const shortTag = (v: string) => (v.includes("-") ? v.split("-").pop() || v : v);
    const consoleVersionText = computed(() =>
      consoleWatcher.current.value
        ? shortTag(consoleWatcher.current.value)
        : t("message.user.versionUnset"),
    );
    const consoleVersionTip = computed(() =>
      consoleWatcher.current.value
        ? `version.json · ${consoleWatcher.current.value}`
        : t("message.user.versionTipConsole"),
    );
    const apiVersionText = computed(() => {
      const v = apiVersion.info.value?.version || "";
      if (apiVersion.failed.value) return t("message.user.versionUnknown");
      if (!v || v === "dev") return t("message.user.versionUnset");
      return v;
    });
    const apiVersionTip = computed(() => {
      if (apiVersion.failed.value) return t("message.user.versionTipApiFailed");
      const v = apiVersion.info.value;
      if (!v) return t("message.user.versionTipApi");
      return [
        v.service || "aicodcms-api",
        `version=${v.version || "dev"}`,
        v.commit ? `commit=${v.commit}` : "",
        v.buildTime ? `buildTime=${v.buildTime}` : "",
        v.startedAt ? `startedAt=${v.startedAt}` : "",
        v.goVersion || "",
      ]
        .filter(Boolean)
        .join(" · ");
    });
    // 展开用户菜单时强制刷一次接口版本：节流是为了省请求，但用户主动看的时候必须是最新的
    const onUserDropdownVisible = (visible: boolean) => {
      if (visible) void apiVersion.refresh();
    };
    // 全屏点击时
    const onScreenfullClick = () => {
      if (!document.fullscreenEnabled) {
        ElMessage.warning("暂不不支持全屏");
        return;
      }
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        document.documentElement.requestFullscreen();
      }
      state.isScreenfull = !!document.fullscreenElement;
    };
    const onFullscreenChange = () => {
      state.isScreenfull = !!document.fullscreenElement;
    };
    // 布局配置 icon 点击时
    const onLayoutSetingClick = () => {
      proxy.mittBus.emit("openSetingsDrawer");
    };
    //清除缓存
    const removeCacheClick = () => {
      clearCache();
    };
    // 清空缓存处理
    const clearCache = () => {
      //清除浏览器缓存
      Session.remove("userMenu");
      //清除后端缓存
      removeCache("all").then(() => {
        ElMessage.success("缓存清除成功");
        window.location.reload();
      });
    };
    // 下拉菜单点击时
    const onHandleCommandClick = (path: string) => {
      if (path === "clearCache") {
        clearCache();
      } else if (path === "logOut") {
        ElMessageBox({
          closeOnClickModal: false,
          closeOnPressEscape: false,
          title: t("message.user.logOutTitle"),
          message: t("message.user.logOutMessage"),
          showCancelButton: true,
          confirmButtonText: t("message.user.logOutConfirm"),
          cancelButtonText: t("message.user.logOutCancel"),
          buttonSize: "default",
          beforeClose: (action, instance, done) => {
            if (action === "confirm") {
              //后端退出
              logout().then(() => {
                instance.confirmButtonLoading = true;
                instance.confirmButtonText = t("message.user.logOutExit");
                setTimeout(() => {
                  done();
                  setTimeout(() => {
                    instance.confirmButtonLoading = false;
                  }, 300);
                }, 500);
              });
            } else {
              done();
            }
          },
        })
          .then(async () => {
            // 清除缓存/token等
            Session.clear();
            // 使用 reload 时，不需要调用 resetRoute() 重置路由
            window.location.reload();
          })
          .catch(() => {});
      } else {
        router.push(path);
      }
    };
    // 菜单搜索点击
    const onSearchClick = () => {
      searchRef.value.openSearch();
    };
    // 组件大小改变
    const onComponentSizeChange = (size: string) => {
      Local.remove("themeConfig");
      themeConfig.value.globalComponentSize = size;
      Local.set("themeConfig", themeConfig.value);
      initComponentSize();
      window.location.reload();
    };
    // 语言切换
    const onLanguageChange = (lang: string) => {
      Local.remove("themeConfig");
      themeConfig.value.globalI18n = lang;
      Local.set("themeConfig", themeConfig.value);
      proxy.$i18n.locale = lang;
      initI18n();
      other.useTitle();
      // 通知后端切换语言 + 刷新菜单
      setLanguage(lang)
        .then(() => {
          Session.remove("userMenu");
          refreshBackEndControlRoutes();
          // 5 秒内重新加载页面，使当前页面数据也切换到新语言
          ElMessage.success(
            t("message.user.langSwitchSuccess") || t("message.user.langSwitchSuccess"),
          );
          setTimeout(() => window.location.reload(), 1500);
        })
        .catch(() => {
          console.warn("后端语言切换失败");
          window.location.reload();
        });
    };
    // 站点切换（站群）
    const onSiteChange = (code: string) => {
      if (code === currentSiteCode.value) return;
      storesSite.setCurrent(code);
      ElMessage.success("已切换到站点，正在刷新当前页数据");
      // 停在当前页，只让页面重新取数：复用 tagsView 的「刷新当前页」机制
      // （parent.vue 会把当前路由移出 keep-alive、换掉 router-view 的 key，
      // 组件重新挂载 → onMounted/onActivated 用新的 X-Site-Code 重新请求）。
      // 不用 window.location.reload()：整页刷新会丢掉未提交的表单与页面滚动位置，
      // 而且路由虽是 hash 模式能停在同一页，但代价明显更大。
      proxy.mittBus.emit("onTagsViewRefreshRouterView", router.currentRoute.value.fullPath);
    };
    // 设置 element plus 组件的国际化
    const setI18nConfig = (locale: string) => {
      proxy.mittBus.emit("getI18nConfig", proxy.i18n.global.messages.value[locale]);
    };
    // 初始化言语国际化
    const initI18n = () => {
      switch (Local.get("themeConfig").globalI18n) {
        case "zh-cn":
          state.disabledI18n = "zh-cn";
          setI18nConfig("zh-cn");
          break;
        case "en":
          state.disabledI18n = "en";
          setI18nConfig("en");
          break;
      }
    };
    // 初始化全局组件大小
    const initComponentSize = () => {
      switch (Local.get("themeConfig").globalComponentSize) {
        case "large":
          state.disabledSize = "large";
          break;
        case "default":
          state.disabledSize = "default";
          break;
        case "small":
          state.disabledSize = "small";
          break;
      }
    };
    // 页面加载时
    onMounted(() => {
      document.addEventListener("fullscreenchange", onFullscreenChange);
      if (Local.get("themeConfig")) {
        initI18n();
        initComponentSize();
      }
      // 站群：加载当前管理员可见站点
      storesSite.init();
    });
    return {
      userInfos,
      siteSites,
      currentSiteCode,
      currentSiteName,
      canSwitchSite,
      onSiteChange,
      onLayoutSetingClick,
      onHandleCommandClick,
      onScreenfullClick,
      onSearchClick,
      onComponentSizeChange,
      onLanguageChange,
      removeCacheClick,
      searchRef,
      layoutUserFlexNum,
      defaultAvatar,
      onAvatarError,
      consoleVersionText,
      consoleVersionTip,
      apiVersionText,
      apiVersionTip,
      onUserDropdownVisible,
      ...toRefs(state),
    };
  },
});
</script>

<style scoped>
.layout-navbars-breadcrumb-user {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}
.layout-navbars-breadcrumb-user-link {
  height: 100%;
  display: flex;
  align-items: center;
  white-space: nowrap;
}
.layout-navbars-breadcrumb-user-link-photo {
  width: 25px;
  height: 25px;
  border-radius: 100%;
  object-fit: cover;
  flex-shrink: 0;
}
.layout-navbars-breadcrumb-user-icon {
  padding: 0 10px;
  cursor: pointer;
  color: var(--cc-color-text-2);
  height: 50px;
  line-height: 50px;
  display: flex;
  align-items: center;
  transition:
    background 0.18s ease,
    color 0.18s ease;
}
.layout-navbars-breadcrumb-user-icon:hover {
  background: var(--cc-color-surface-hover);
  color: var(--cc-color-text-1);
}
.layout-navbars-breadcrumb-user-icon:hover i {
  display: inline-block;
  animation: logoAnimation 0.3s ease-in-out;
}
.site-selector {
  padding: 0 10px;
  cursor: pointer;
  color: var(--cc-color-text-2);
  transition: color 0.18s ease;
}
.site-selector:hover {
  color: var(--cc-color-text-1);
}
.site-selector-name {
  font-size: 13px;
  margin: 0 4px;
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
:deep(.el-dropdown) {
  color: var(--cc-color-text-2);
}
:deep(.el-badge) {
  height: 40px;
  line-height: 40px;
  display: flex;
  align-items: center;
}
:deep(.el-badge__content.is-fixed) {
  top: 12px;
}
</style>

<!--
  版本信息行的样式必须放在**非 scoped** 块里：
  el-dropdown 的菜单默认 teleport 到 body，而 <li> 是 Element Plus 自己渲染的，
  scoped 的 `[data-v-xxx] .el-dropdown-menu__item` 匹配不到（菜单不在组件子树内），
  只靠 class 上的 data-v 属性又依赖组件内部实现。class 名带前缀且唯一，不会外泄。
-->
<style>
.user-version {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  cursor: default;
}
.user-version__label {
  color: var(--el-text-color-secondary);
}
.user-version__value {
  margin-left: auto;
  max-width: 170px;
  overflow: hidden;
  color: var(--el-text-color-regular);
  font-family: var(--el-font-family-mono, ui-monospace, SFMono-Regular, Menlo, monospace);
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
