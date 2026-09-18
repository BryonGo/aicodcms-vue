<template>
  <transition name="el-fade-in">
    <div v-if="visible" class="sta-global-progress">
      <div class="sta-global-progress__header">
        <el-icon v-if="anyActive" class="is-loading"><Loading /></el-icon>
        <span>{{ t("message.cms.sta.globalTitle") }}</span>
      </div>
      <div
        v-for="item in visibleItems"
        :key="item.key"
        class="sta-global-progress__item"
      >
        <div class="sta-global-progress__row">
          <span class="sta-global-progress__name">{{ item.label }}</span>
          <span class="sta-global-progress__status" :style="{ color: item.color }">
            {{ item.statusText }}
          </span>
        </div>
        <el-progress
          :percentage="item.percentage"
          :status="item.statusType"
          :stroke-width="14"
          :text-inside="true"
          style="width: 100%"
        />
      </div>
    </div>
  </transition>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onMounted, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";
import { Loading } from "@element-plus/icons-vue";
import { getStaProgress } from "/@/api/cms/sta";
import { Session, Local } from "/@/utils/storage";

const { t } = useI18n();

const ACTIVE = ["running", "stopping"];

interface Item {
  key: "article" | "list" | "tag";
  label: string;
  status: string;
  percentage: number;
  currentLang: string;
  currentId: number;
  statusType: "" | "success" | "exception";
  color: string;
  statusText: string;
}

const items = reactive<Record<"article" | "list" | "tag", Item>>({
  article: {
    key: "article",
    label: "",
    status: "idle",
    percentage: 0,
    currentLang: "",
    currentId: 0,
    statusType: "",
    color: "",
    statusText: "",
  },
  list: {
    key: "list",
    label: "",
    status: "idle",
    percentage: 0,
    currentLang: "",
    currentId: 0,
    statusType: "",
    color: "",
    statusText: "",
  },
  tag: {
    key: "tag",
    label: "",
    status: "idle",
    percentage: 0,
    currentLang: "",
    currentId: 0,
    statusType: "",
    color: "",
    statusText: "",
  },
});

const labels = {
  article: "message.cms.sta.tabArticle",
  list: "message.cms.sta.tabList",
  tag: "message.cms.sta.tabTag",
} as const;

const anyActive = computed(() =>
  ACTIVE.some((s) => Object.values(items).some((i) => i.status === s)),
);
const visibleItems = computed(() => Object.values(items).filter((i) => i.status !== "idle"));

// 任务结束后保留展示几秒，再自动隐藏
const doneAt = ref(0);
let hadActive = false;
const visible = computed(() => {
  if (anyActive.value) return true;
  return doneAt.value > 0 && Date.now() - doneAt.value < 4000;
});

let timer: ReturnType<typeof setTimeout> | null = null;

// 看门狗：每轮轮询开始时重置；**15 秒内没有任何一次成功轮询**就把状态归零。
//
// 为什么需要：老代码只在"拿到响应"时更新状态，任何让它拿不到新状态的情况
// （会话失效后直接 return、请求一直失败、定时器链断掉）都会把上一次的"运行中"
// 永久留在屏幕上 —— 就是"浮窗一直存在"那个现象。看门狗不看失败原因，只看
// "最近有没有成功过一次"，因此对这些情况一律兜住。
let watchdog: ReturnType<typeof setTimeout> | null = null;
const WATCHDOG_MS = 15000;

/** resetIdle 把所有条目归零：浮窗随之隐藏（active 没了、也没有刚完成的 4 秒窗口）。 */
const resetIdle = () => {
  ;(Object.keys(items) as Array<"article" | "list" | "tag">).forEach((key) => {
    const item = items[key];
    item.status = "idle";
    item.statusText = "";
    item.percentage = 0;
    item.currentLang = "";
    item.currentId = 0;
    item.color = "";
    item.statusType = "";
  });
  hadActive = false;
  doneAt.value = 0;
};

const statusTextOf = (item: Item): string => {
  switch (item.status) {
    case "running":
      return item.currentLang
        ? `${t("message.cms.sta.statusGenerating")} ${item.currentLang} / #${item.currentId}`
        : t("message.cms.sta.statusGenerating");
    case "stopping":
      return t("message.cms.sta.statusStopping");
    case "completed":
      return t("message.cms.sta.statusCompleted");
    case "failed":
      return t("message.cms.sta.statusFailed");
    case "stopped":
      return t("message.cms.sta.statusStopped");
    default:
      return "";
  }
};

const update = async () => {
  // 未登录（无 token）不轮询：避免登录页对 admin 接口 401 触发"登录已过期"弹窗循环
  if (!Session.get("token")) {
    // 未登录（或刚被 401 登出）：把状态归零，别让上一次的"运行中"留在屏幕上。
    resetIdle();
    timer = setTimeout(update, 5000);
    return;
  }
  // 站群：站点码未就绪（登录/刷新后站点初始化尚未完成）时跳过本轮，
  // 避免非超管用户在守卫放行前发出无 X-Site-Code 的请求被 403。
  if (!Local.get("currentSiteCode")) {
    // 站群：站点码还没就绪时同样先归零，避免带着上一次的状态空转。
    resetIdle();
    timer = setTimeout(update, 1000);
    return;
  }
  let hasActive = false;
  try {
    const res = await getStaProgress();
    const data = res?.data || {};
    (Object.keys(items) as Array<"article" | "list" | "tag">).forEach((key) => {
      const snap = data[key] || {};
      const item = items[key];
      item.label = t(labels[key]);
      item.status = snap.status || "idle";
      item.percentage = snap.percentage || 0;
      item.currentLang = snap.current_lang || "";
      item.currentId = snap.current_id || 0;
      if (ACTIVE.includes(item.status)) hasActive = true;
      item.statusType =
        item.status === "completed"
          ? "success"
          : item.status === "failed"
            ? "exception"
            : "";
      item.color =
        item.status === "running"
          ? "var(--el-color-primary)"
          : item.status === "completed"
            ? "var(--el-color-success)"
            : item.status === "failed"
              ? "var(--el-color-danger)"
              : item.status === "stopping" || item.status === "stopped"
                ? "var(--el-color-warning)"
                : "";
      item.statusText = statusTextOf(item);
    });
    // **只有成功拿到状态才续期**看门狗：失败/挂起/提前 return 都不续期，
    // 于是"最后一次成功"过去 15 秒即归零 —— 这正是要修的那个"浮窗一直存在"。
    // （放在 try 里，不能放外面：放外面失败时也会续期，等于没装。）
    if (watchdog) clearTimeout(watchdog);
    watchdog = setTimeout(() => resetIdle(), WATCHDOG_MS);
  } catch {
    /* 失败不在这里处理：由上面的看门狗兜底（连续失败 → 没有成功轮询 → 归零） */
  }
  if (!hasActive && hadActive) doneAt.value = Date.now();
  hadActive = hasActive;
  timer = setTimeout(update, hasActive ? 1000 : 5000);
};

onMounted(update);
onUnmounted(() => {
  if (timer) clearTimeout(timer);
  if (watchdog) clearTimeout(watchdog);
});
</script>

<style scoped>
.sta-global-progress {
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 2500;
  width: 300px;
  padding: 12px 14px;
  border-radius: 8px;
  background: var(--el-bg-color-overlay);
  border: 1px solid var(--el-border-color-light);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.18);
}
.sta-global-progress__header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 10px;
  color: var(--el-text-color-primary);
}
.sta-global-progress__item + .sta-global-progress__item {
  margin-top: 10px;
}
.sta-global-progress__row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
  font-size: 12px;
}
.sta-global-progress__name {
  color: var(--el-text-color-regular);
}
.sta-global-progress__status {
  color: var(--el-text-color-secondary);
}
</style>
