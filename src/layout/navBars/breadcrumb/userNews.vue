<template>
  <div class="layout-navbars-breadcrumb-user-news">
    <div class="head-box">
      <div class="head-box-title">{{ $t("message.user.newTitle") }}</div>
      <div class="head-box-btn" v-if="newsList.length > 0" @click="onAllReadClick">
        {{ $t("message.user.newBtn") }}
      </div>
    </div>
    <div class="content-box">
      <template v-if="newsList.length > 0">
        <div class="content-box-item" v-for="(v, k) in newsList" :key="k">
          <div>{{ v.label }}</div>
          <div class="content-box-msg">
            {{ v.value }}
          </div>
          <div class="content-box-time">{{ v.time }}</div>
        </div>
      </template>
      <el-empty :description="$t('message.user.newDesc')" v-else></el-empty>
    </div>
    <div class="foot-box" @click="onGoToGiteeClick" v-if="newsList.length > 0">
      {{ $t("message.user.newGo") }}
    </div>
  </div>
</template>

<script lang="ts">
import { reactive, toRefs, defineComponent } from "vue";

export default defineComponent({
  name: "layoutBreadcrumbUserNews",
  setup() {
    const state = reactive({
      newsList: [
        {
          label: "关于版本发布的通知",
          value:
            "vue-next-admin，基于 vue3 + CompositionAPI + typescript + vite + element plus，正式发布时间：2021年02月28日！",
          time: "2020-12-08",
        },
        {
          label: "关于学习交流的通知",
          value: "QQ群号码 665452019，欢迎小伙伴入群学习交流探讨！",
          time: "2020-12-08",
        },
      ],
    });
    // 全部已读点击
    const onAllReadClick = () => {
      state.newsList = [];
    };
    // 前往通知中心点击
    const onGoToGiteeClick = () => {
      window.open("https://gitee.com/tiger1103/gfast");
    };
    return {
      onAllReadClick,
      onGoToGiteeClick,
      ...toRefs(state),
    };
  },
});
</script>

<style scoped>
.layout-navbars-breadcrumb-user-news .head-box {
  display: flex;
  border-bottom: 1px solid var(--cc-color-border-light);
  box-sizing: border-box;
  color: var(--cc-color-text-1);
  justify-content: space-between;
  height: 35px;
  align-items: center;
}
.layout-navbars-breadcrumb-user-news .head-box .head-box-btn {
  color: var(--cc-color-primary);
  font-size: var(--cc-font-13);
  cursor: pointer;
  opacity: 0.85;
  transition: opacity 0.18s ease;
}
.layout-navbars-breadcrumb-user-news .head-box .head-box-btn:hover {
  opacity: 1;
}
.layout-navbars-breadcrumb-user-news .content-box {
  font-size: var(--cc-font-13);
}
.layout-navbars-breadcrumb-user-news .content-box .content-box-item {
  padding-top: 12px;
}
.layout-navbars-breadcrumb-user-news .content-box .content-box-item:last-of-type {
  padding-bottom: 12px;
}
.layout-navbars-breadcrumb-user-news .content-box .content-box-msg {
  color: var(--cc-color-text-3);
  margin-top: 5px;
  margin-bottom: 5px;
}
.layout-navbars-breadcrumb-user-news .content-box .content-box-time {
  color: var(--cc-color-text-3);
}
.layout-navbars-breadcrumb-user-news .foot-box {
  height: 35px;
  color: var(--cc-color-primary);
  font-size: var(--cc-font-13);
  cursor: pointer;
  opacity: 0.85;
  display: flex;
  align-items: center;
  justify-content: center;
  border-top: 1px solid var(--cc-color-border-light);
  transition: opacity 0.18s ease;
}
.layout-navbars-breadcrumb-user-news .foot-box:hover {
  opacity: 1;
}
.layout-navbars-breadcrumb-user-news :deep(.el-empty__description p) {
  font-size: var(--cc-font-13);
}
</style>
