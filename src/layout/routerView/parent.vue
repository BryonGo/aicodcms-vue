<template>
  <div class="h100">
    <router-view v-slot="{ Component }">
      <keep-alive :include="getKeepAliveNames" :max="10">
        <component :is="Component" :key="refreshRouterViewKey" class="w100" />
      </keep-alive>
    </router-view>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  toRefs,
  reactive,
  getCurrentInstance,
  onBeforeMount,
  onUnmounted,
  nextTick,
  watch,
  onMounted,
} from "vue";
import { useRoute } from "vue-router";
import { storeToRefs } from "pinia";
import { useKeepALiveNames } from "/@/stores/keepAliveNames";
import { useThemeConfig } from "/@/stores/themeConfig";
import { Session } from "/@/utils/storage";

// 定义接口来定义对象的类型
interface ParentViewState {
  refreshRouterViewKey: null | string;
  keepAliveNameList: string[];
}

export default defineComponent({
  name: "layoutParentView",
  setup() {
    const { proxy } = <any>getCurrentInstance();
    const route = useRoute();
    const storesKeepAliveNames = useKeepALiveNames();
    const storesThemeConfig = useThemeConfig();
    const { keepAliveNames, cachedViews } = storeToRefs(storesKeepAliveNames);
    const { themeConfig } = storeToRefs(storesThemeConfig);
    const state = reactive<ParentViewState>({
      refreshRouterViewKey: null,
      keepAliveNameList: [],
    });
    // 获取组件缓存列表(name值)
    const getKeepAliveNames = computed(() => {
      return themeConfig.value.isTagsview ? cachedViews.value : state.keepAliveNameList;
    });
    // 页面加载前，处理缓存，页面刷新时路由缓存处理
    onBeforeMount(() => {
      state.keepAliveNameList = keepAliveNames.value;
      proxy.mittBus.on("onTagsViewRefreshRouterView", (fullPath: string) => {
        state.keepAliveNameList = keepAliveNames.value.filter(
          (name: string) => route.name !== name,
        );
        state.refreshRouterViewKey = null;
        nextTick(() => {
          state.refreshRouterViewKey = fullPath;
          state.keepAliveNameList = keepAliveNames.value;
        });
      });
    });
    // 页面加载时
    onMounted(() => {
      // https://gitee.com/lyt-top/vue-next-admin/issues/I58U75
      // https://gitee.com/lyt-top/vue-next-admin/issues/I59RXK
      nextTick(() => {
        setTimeout(() => {
          if (themeConfig.value.isCacheTagsView)
            cachedViews.value = Session.get("tagsViewList")?.map((item: any) => item.name);
        }, 0);
      });
    });
    // 页面卸载时
    onUnmounted(() => {
      proxy.mittBus.off("onTagsViewRefreshRouterView", () => {});
    });
    // 监听路由变化，防止 tagsView 多标签时，切换动画消失
    // 使用 deep 监听 route 对象而非 fullPath 字符串，修复面包屑导航白屏
    watch(
      () => ({ path: route.path, query: route.query, hash: route.hash }),
      () => {
        state.refreshRouterViewKey = decodeURI(route.fullPath);
      },
      { deep: true },
    );
    return {
      getKeepAliveNames,
      ...toRefs(state),
    };
  },
});
</script>
