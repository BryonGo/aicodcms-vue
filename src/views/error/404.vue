<template>
  <div class="error layout-view-bg-white" :style="{ height: `calc(100vh - ${initTagViewHeight}` }">
    <div class="error-flex">
      <div class="left">
        <div class="left-item">
          <div class="left-item-animation left-item-num">404</div>
          <div class="left-item-animation left-item-title">
            {{ $t("message.notFound.foundTitle") }}
          </div>
          <div class="left-item-animation left-item-msg">{{ $t("message.notFound.foundMsg") }}</div>
          <div class="left-item-animation left-item-btn">
            <el-button type="primary" round @click="onGoHome">{{
              $t("message.notFound.foundBtn")
            }}</el-button>
          </div>
        </div>
      </div>
      <div class="right">
        <img
          src="https://img-blog.csdnimg.cn/9eb1d85a417f4ed1ba7107f149ce3da1.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAbHl0LXRvcA==,size_16,color_FFFFFF,t_70,g_se,x_16"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { useThemeConfig } from "/@/stores/themeConfig";
import { useTagsViewRoutes } from "/@/stores/tagsViewRoutes";

export default defineComponent({
  name: "404",
  setup() {
    const storesThemeConfig = useThemeConfig();
    const storesTagsViewRoutes = useTagsViewRoutes();
    const { themeConfig } = storeToRefs(storesThemeConfig);
    const { isTagsViewCurrenFull } = storeToRefs(storesTagsViewRoutes);
    const router = useRouter();
    const onGoHome = () => {
      router.push("/");
    };
    // 设置主内容的高度
    const initTagViewHeight = computed(() => {
      let { isTagsview } = themeConfig.value;
      if (isTagsViewCurrenFull.value) {
        return `30px`;
      } else {
        if (isTagsview) return `114px`;
        else return `80px`;
      }
    });
    return {
      onGoHome,
      initTagViewHeight,
    };
  },
});
</script>

<style scoped>
.error {
  height: 100%;
  background-color: var(--cc-color-surface);
  display: flex;
}
.error .error-flex {
  margin: auto;
  display: flex;
  height: 350px;
  width: 900px;
}
.error .left {
  flex: 1;
  height: 100%;
  align-items: center;
  display: flex;
}
.left-item-animation {
  opacity: 0;
  animation-name: error-num;
  animation-duration: 0.5s;
  animation-fill-mode: forwards;
}
.left-item-num {
  color: var(--cc-color-text-3);
  font-size: 64px;
  font-weight: 700;
  letter-spacing: -0.02em;
}
.left-item-title {
  font-size: var(--cc-font-20);
  color: var(--cc-color-text-1);
  font-weight: 600;
  margin: 15px 0 8px 0;
  animation-delay: 0.1s;
}
.left-item-msg {
  color: var(--cc-color-text-3);
  font-size: var(--cc-font-13);
  margin-bottom: 30px;
  animation-delay: 0.2s;
}
.left-item-btn {
  animation-delay: 0.2s;
}
.error .right {
  flex: 1;
  opacity: 0;
  animation-name: error-img;
  animation-duration: 2s;
  animation-fill-mode: forwards;
}
.error .right img {
  width: 100%;
  height: 100%;
}
</style>
