import { computed } from "vue";
import { useSiteInfo } from "/@/stores/siteInfo";

/**
 * 运营平台（及其他后台插件页）的站点作用域。
 *
 * 口径（站群 P3 之后统一）：
 *  - 页面默认跟随右上角选择器里的**当前站点**，而不是让运营手填 siteId；
 *  - 超级管理员保留跨站能力：可以把 siteId 清空看全站群，或改成别的站点；
 *  - 普通站点管理员只能待在自己可见的站点里，输入框禁用（后端也会独立校验，
 *    前端禁用只是不给误操作的入口，不是安全边界）。
 *
 * 典型用法：
 * ```ts
 * const { currentSiteId, isSuperAdmin, currentSiteLabel } = useSiteScope();
 * const q = reactive({ siteId: currentSiteId.value || undefined });
 * ```
 */
export function useSiteScope() {
  const siteStore = useSiteInfo();

  /** 右上角当前站点的 id；站点未就绪时为 0。 */
  const currentSiteId = computed(() => siteStore.currentSiteId);

  /** 当前账号是否超级管理员（超管可跨站筛选）。 */
  const isSuperAdmin = computed(() => siteStore.isSuperAdmin);

  /** 当前站点展示名：`后宫 AI 创作站（hougong）`，未就绪时为空串。 */
  const currentSiteLabel = computed(() => {
    const s = siteStore.currentSite;
    return s ? `${s.name}（${s.code}）` : "";
  });

  return { siteStore, currentSiteId, isSuperAdmin, currentSiteLabel };
}
