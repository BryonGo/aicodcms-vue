/**
 * 站群站点初始化信号量（独立模块，避免 request ↔ siteInfo 循环依赖）。
 *
 * 登录/换账号后，路由守卫与登录成功回调都会触发 siteInfo.init()；该 Promise 在本轮
 * init 结束（成功/失败都放行）后 resolve，等待方据此保证首个请求就带 X-Site-Code，
 * 避免非超管用户首屏竞态 403。
 *
 * 为什么不是「模块加载时创建一次的常量 Promise」：登出/换账号必须重置信号量，而
 * Promise 一旦 settle 就永久定型，重置只能**换一个新的 Promise**。旧实现把 resolveFn
 * 置为 null，于是 reset 之后 resolveSiteReady() 再也唤不醒任何等待方 —— 信号量永久沉默。
 */

let resolveFn: (() => void) | null = null;
let ready: Promise<void> = newReady();

function newReady(): Promise<void> {
  return new Promise<void>((resolve) => {
    resolveFn = resolve;
  });
}

/** 当前这一轮的「站点已就绪」Promise。每轮 init 取一次，不要缓存成模块级常量。 */
export function getSiteReady(): Promise<void> {
  return ready;
}

/** 本轮站点初始化完成（成功/失败都放行）。 */
export function resolveSiteReady() {
  resolveFn?.();
}

/** 登出/换账号时重置信号量：换一个新的 deferred，下一轮重新等待。 */
export function resetSiteReady() {
  ready = newReady();
}
