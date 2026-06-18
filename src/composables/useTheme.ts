import { watch, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useThemeConfig } from "/@/stores/themeConfig";

/**
 * AICODCMS 新主题接管层
 *
 * 与现有 themeConfig store 完全兼容（不修改任何字段），
 * 只是把"渲染"这一步统一收口到这里：
 *  - 根据 themeConfig.isIsDark 切换 <html data-theme>
 *  - 把 themeConfig.primary 强制写入 inline style，
 *    以最高 CSS 优先级覆盖 App.vue 中通过 localStorage.themeConfigStyle 恢复的历史 inline color
 *  - 同步派生 --el-color-primary-light-N 的浅色色阶（避免历史色残留）
 *
 * 老的 utils/theme.ts、setings.vue 中的颜色逻辑保持原样，
 * 它们写入的 --el-color-* 与本接管层共存——本接管层会在 App 启动后再写一次，保证最终值正确。
 */
export function useTheme() {
  const store = useThemeConfig();
  const { themeConfig } = storeToRefs(store);

  const applyDark = (dark: boolean) => {
    const html = document.documentElement;
    html.setAttribute("data-theme", dark ? "dark" : "light");
    html.classList.toggle("dark", dark);
  };

  const applyPrimary = (primary: string | undefined) => {
    if (!primary) return;
    const html = document.documentElement;
    // 注意：用 priority='important' 写入 inline style，
    // 这样可以压过 App.vue 在 onMounted 中通过 cssText 灌入的历史色
    html.style.setProperty("--cc-color-primary", primary, "important");
    html.style.setProperty("--el-color-primary", primary, "important");
    // 主色的浅/深色阶（与 Element Plus 默认梯度对齐，用 color-mix 现算）
    const mix = (pct: number, against: "#fff" | "#000") =>
      `color-mix(in srgb, ${primary} ${pct}%, ${against})`;
    html.style.setProperty("--el-color-primary-light-3", mix(60, "#fff"), "important");
    html.style.setProperty("--el-color-primary-light-5", mix(40, "#fff"), "important");
    html.style.setProperty("--el-color-primary-light-7", mix(22, "#fff"), "important");
    html.style.setProperty("--el-color-primary-light-8", mix(14, "#fff"), "important");
    html.style.setProperty("--el-color-primary-light-9", mix(8, "#fff"), "important");
    html.style.setProperty("--el-color-primary-dark-2", mix(80, "#000"), "important");
  };

  /**
   * 清掉 documentElement 上 cssText 残留的所有 --el- / --cc- / --next- 变量。
   * App.vue 在 onMounted 里会用 localStorage.themeConfigStyle 恢复 cssText，
   * 里面是用户**老版本**保存下来的整套 EP 变量硬编码（背景/边框/填充/色阶...），
   * 这些会覆盖 index.css → theme/light.css 里 --cc- 桥接 --el- 的逻辑，
   * 导致即使删除了 main.css 的硬编码，新设计系统仍然不生效。
   * 这里只清 CSS 变量，不动其它 inline 样式（比如 width/height）。
   */
  const purgeLegacyInlineVars = () => {
    const html = document.documentElement;
    const style = html.style;
    const toRemove: string[] = [];
    for (let i = 0; i < style.length; i++) {
      const name = style.item(i);
      if (name.startsWith("--el-") || name.startsWith("--cc-") || name.startsWith("--next-")) {
        toRemove.push(name);
      }
    }
    toRemove.forEach((name) => style.removeProperty(name));
  };

  const apply = () => {
    purgeLegacyInlineVars();
    applyDark(!!themeConfig.value.isIsDark);
    applyPrimary(themeConfig.value.primary);
  };

  // 立即应用一次（首屏避免闪烁）
  apply();

  // 后续响应变化
  watch(
    () => themeConfig.value.isIsDark,
    (v) => applyDark(!!v),
  );
  watch(
    () => themeConfig.value.primary,
    (v) => applyPrimary(v),
  );

  // App.vue 的 onMounted 会通过 cssText 灌入 localStorage 里的历史 inline style，
  // 那一步会把我们 setup() 时写入的 --cc/--el-color-primary 整体覆盖掉。
  // 所以这里在 onMounted 末尾再写一次（自然晚于 App.vue 的恢复逻辑），保证最终主色 = themeConfig.primary。
  onMounted(() => {
    // 用 microtask 让位给同一 tick 内可能的其他 onMounted（如 App.vue 的样式恢复）
    queueMicrotask(apply);
  });

  return { apply };
}
