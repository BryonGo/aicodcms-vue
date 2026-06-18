<template>
  <div class="layout-logo" v-if="setShowLogo" @click="onThemeConfigChange">
    <img :src="logoMini" class="layout-logo-medium-img" />
    <span>{{ themeConfig.globalTitle }}</span>
  </div>
  <div class="layout-logo-size" v-else @click="onThemeConfigChange">
    <img :src="logoMini" class="layout-logo-size-img" />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import { storeToRefs } from "pinia";
import { useThemeConfig } from "/@/stores/themeConfig";

import logoMini from "/@/assets/logo-mini.svg";

export default defineComponent({
  name: "layoutLogo",
  setup() {
    const storesThemeConfig = useThemeConfig();
    const { themeConfig } = storeToRefs(storesThemeConfig);
    // 设置 logo 的显示。classic 经典布局默认显示 logo
    const setShowLogo = computed(() => {
      let { isCollapse, layout } = themeConfig.value;
      return !isCollapse || layout === "classic" || document.body.clientWidth < 1000;
    });
    // logo 点击实现菜单展开/收起
    const onThemeConfigChange = () => {
      if (themeConfig.value.layout === "transverse") return false;
      themeConfig.value.isCollapse = !themeConfig.value.isCollapse;
    };
    return {
      logoMini,
      setShowLogo,
      themeConfig,
      onThemeConfigChange,
    };
  },
});
</script>

<style scoped>
.layout-logo {
  width: 220px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border-bottom: 1px solid var(--cc-color-border-light);
  color: var(--cc-color-primary);
  font-size: var(--cc-font-16);
  font-weight: 700;
  letter-spacing: -0.01em;
  cursor: pointer;
  user-select: none;
  transition: background 0.2s;
}
.layout-logo span {
  white-space: nowrap;
  display: inline-block;
}
.layout-logo:hover {
  background: var(--cc-color-primary-softer);
}
.layout-logo-medium-img {
  width: 30px;
  height: 30px;
  object-fit: contain;
}

.layout-logo-size {
  width: 100%;
  height: 56px;
  display: flex;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid var(--cc-color-border-light);
  transition: background 0.2s;
}
.layout-logo-size-img {
  width: 22px;
  height: 22px;
  object-fit: contain;
}
.layout-logo-size:hover {
  background: var(--cc-color-primary-softer);
}
</style>
