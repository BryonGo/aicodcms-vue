<template>
  <div class="layout-footer mt15" v-show="isDelayFooter">
    <div class="layout-footer-warp">
      <div>Copyright © 2021-2023 g-fast.cn All Rights Reserved.</div>
      <div class="mt5">{{ $t("message.layoutFooterCopyright") }}</div>
    </div>
  </div>
</template>

<script lang="ts">
import { toRefs, reactive, defineComponent } from "vue";
import { onBeforeRouteUpdate } from "vue-router";

export default defineComponent({
  name: "layoutFooter",
  setup() {
    const state = reactive({
      isDelayFooter: true,
    });
    // 路由改变时，等主界面动画加载完毕再显示 footer
    onBeforeRouteUpdate(() => {
      setTimeout(() => {
        state.isDelayFooter = false;
        setTimeout(() => {
          state.isDelayFooter = true;
        }, 800);
      }, 0);
    });
    return {
      ...toRefs(state),
    };
  },
});
</script>

<style scoped>
.layout-footer {
  width: 100%;
  display: flex;
}
.layout-footer-warp {
  margin: auto;
  color: var(--cc-color-text-3);
  font-size: var(--cc-font-12);
  text-align: center;
  animation: error-num 1s ease-in-out;
}
</style>
