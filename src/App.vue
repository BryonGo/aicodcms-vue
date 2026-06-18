<template>
  <el-config-provider :size="getGlobalComponentSize" :locale="elementPlusLocale">
    <router-view v-show="themeConfig.lockScreenTime > 1" />
    <LockScreen v-if="themeConfig.isLockScreen" />
    <Setings ref="setingsRef" v-show="themeConfig.lockScreenTime > 1" />
    <CloseFull v-if="!themeConfig.isLockScreen" />
  </el-config-provider>
</template>

<script lang="ts">
import {
  computed,
  ref,
  getCurrentInstance,
  onBeforeMount,
  onMounted,
  onUnmounted,
  nextTick,
  defineComponent,
  watch,
} from "vue";
import { useRoute } from "vue-router";
import { storeToRefs } from "pinia";
import { useTagsViewRoutes } from "/@/stores/tagsViewRoutes";
import { useThemeConfig } from "/@/stores/themeConfig";
import { useTheme } from "/@/composables/useTheme";
import other from "/@/utils/other";
import { Local, Session } from "/@/utils/storage";
import { elementPlusLocales } from "/@/i18n";
import setIntroduction from "/@/utils/setIconfont";
import LockScreen from "/@/layout/lockScreen/index.vue";
import Setings from "/@/layout/navBars/breadcrumb/setings.vue";
import CloseFull from "/@/layout/navBars/breadcrumb/closeFull.vue";

export default defineComponent({
  name: "app",
  components: { LockScreen, Setings, CloseFull },
  setup() {
    const { proxy } = <any>getCurrentInstance();
    const setingsRef = ref();
    const route = useRoute();
    const stores = useTagsViewRoutes();
    const storesThemeConfig = useThemeConfig();
    const { themeConfig } = storeToRefs(storesThemeConfig);
    // 接管新设计令牌的主题渲染（亮/暗 + 主色注入）
    // 注意：必须先从 Local 恢复 themeConfig 后再生效，恢复在 onMounted 中执行
    // 这里挂一个 watcher 即可保证后续变化同步
    useTheme();
    const elementPlusLocale = computed(() => {
      return elementPlusLocales[themeConfig.value.globalI18n] || elementPlusLocales["zh-cn"];
    });
    // 获取全局组件大小
    const getGlobalComponentSize = computed(() => {
      return other.globalComponentSize();
    });
    // 布局配置弹窗打开
    const openSetingsDrawer = () => {
      setingsRef.value.openDrawer();
    };
    // 设置初始化，防止刷新时恢复默认
    onBeforeMount(() => {
      // 设置批量第三方 icon 图标
      setIntroduction.cssCdn();
      // 设置批量第三方 js
      setIntroduction.jsCdn();
    });
    // 页面加载时
    onMounted(() => {
      nextTick(() => {
        // 监听布局配置弹窗点击打开
        proxy.mittBus.on("openSetingsDrawer", () => {
          openSetingsDrawer();
        });
        // i18n 语言切换由 elementPlusLocale computed 属性自动响应 store.globalI18n 变更
        // 获取缓存中的布局配置
        if (Local.get("themeConfig")) {
          storesThemeConfig.setThemeConfig(Local.get("themeConfig"));
          const savedStyle = Local.get("themeConfigStyle");
          if (savedStyle) {
            // 先恢复已保存的样式
            document.documentElement.style.cssText = savedStyle;
            // 补全按钮类型颜色变量（确保不被缓存覆盖丢失）
            const rootStyle = getComputedStyle(document.documentElement);
            if (!document.documentElement.style.getPropertyValue("--el-color-success")) {
              document.documentElement.style.setProperty(
                "--el-color-success",
                rootStyle.getPropertyValue("--el-color-success") || "#16b777",
              );
            }
            if (!document.documentElement.style.getPropertyValue("--el-color-danger")) {
              document.documentElement.style.setProperty(
                "--el-color-danger",
                rootStyle.getPropertyValue("--el-color-danger") || "#FF5722",
              );
            }
            if (!document.documentElement.style.getPropertyValue("--el-color-warning")) {
              document.documentElement.style.setProperty(
                "--el-color-warning",
                rootStyle.getPropertyValue("--el-color-warning") || "#FFB800",
              );
            }
            if (!document.documentElement.style.getPropertyValue("--el-color-info")) {
              document.documentElement.style.setProperty(
                "--el-color-info",
                rootStyle.getPropertyValue("--el-color-info") || "#393D49",
              );
            }
          }
        }
        // 获取缓存中的全屏配置
        if (Session.get("isTagsViewCurrenFull")) {
          stores.setCurrenFullscreen(Session.get("isTagsViewCurrenFull"));
        }
      });
    });
    // 页面销毁时，关闭监听布局配置/i18n监听
    onUnmounted(() => {
      proxy.mittBus.off("openSetingsDrawer", () => {});
    });
    // 监听路由的变化，设置网站标题
    watch(
      () => route.path,
      () => {
        other.useTitle();
      },
      {
        deep: true,
      },
    );
    return {
      themeConfig,
      setingsRef,
      getGlobalComponentSize,
      elementPlusLocale,
    };
  },
});
</script>
