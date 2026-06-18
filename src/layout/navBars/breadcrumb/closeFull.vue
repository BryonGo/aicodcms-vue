<template>
  <div class="layout-navbars-close-full" v-if="isTagsViewCurrenFull">
    <div class="layout-navbars-close-full-icon">
      <SvgIcon
        name="ele-Close"
        :title="$t('message.tagsView.closeFullscreen')"
        @click="onCloseFullscreen"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { storeToRefs } from "pinia";
import { useTagsViewRoutes } from "/@/stores/tagsViewRoutes";

export default defineComponent({
  name: "layoutCloseFull",
  setup() {
    const stores = useTagsViewRoutes();
    const { isTagsViewCurrenFull } = storeToRefs(stores);
    // 关闭当前全屏
    const onCloseFullscreen = () => {
      stores.setCurrenFullscreen(false);
    };
    return {
      isTagsViewCurrenFull,
      onCloseFullscreen,
    };
  },
});
</script>

<style scoped>
.layout-navbars-close-full {
  position: fixed;
  z-index: 9999999999;
  right: -30px;
  top: -30px;
}
.layout-navbars-close-full .layout-navbars-close-full-icon {
  width: 60px;
  height: 60px;
  border-radius: var(--cc-radius-full);
  cursor: pointer;
  background: rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  position: relative;
}
.layout-navbars-close-full .layout-navbars-close-full-icon :deep(i) {
  position: absolute;
  left: 10px;
  top: 35px;
  color: var(--cc-color-text-1);
  transition: color 0.3s ease;
}
.layout-navbars-close-full:hover :deep(i) {
  color: var(--cc-color-primary);
}
</style>
