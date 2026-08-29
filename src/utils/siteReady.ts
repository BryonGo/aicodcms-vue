/**
 * 站群站点初始化信号量（独立模块，避免 request ↔ siteInfo 循环依赖）。
 *
 * 登录/刷新后，路由守卫会触发 siteInfo.init()；该 Promise 在 init 完成
 * （无论成功失败）后 resolve。request 拦截器在 currentSiteCode 未就绪时
 * await 它，保证所有 API 请求都带 X-Site-Code，避免非超管用户首屏竞态
 * 403/401。
 */
let resolveFn: (() => void) | null = null;
let started = false;

export const siteReady: Promise<void> = new Promise((resolve) => {
  resolveFn = resolve;
});

/** 标记站点初始化已开始（幂等）。 */
export function markSiteInitStarted() {
  started = true;
}

/** 站点初始化是否已开始。 */
export function isSiteInitStarted() {
  return started;
}

/** 站点初始化完成（成功/失败都放行）。 */
export function resolveSiteReady() {
  resolveFn?.();
}

/** 登出/清理时重置信号量，下次登录重新等待。 */
export function resetSiteReady() {
  started = false;
  resolveFn = null;
}
