// 控制台版本检测：线上发了新版本，让还挂着旧页面的管理员知道并（安全时机）自动刷新。
//
// 为什么管理后台尤其需要：管理员常驻标签页好几天，而菜单/权限是 DB 驱动的 ——
// 新版本上线后不刷新，会出现"功能没生效、菜单里没有入口"的错觉。
//
// 版本从哪来：容器启动时由 /docker-entrypoint.d/40-console-version.sh 写入
// /admin/version.json（内容来自 compose 传的 CONSOLE_BUILD_VERSION = 镜像 tag），
// 因此不需要在构建时把版本号烤进 JS，也不会与镜像 tag 漂移。
//
// 三条护栏（与前台 useVersionWatcher 一致）：
//   1) 连续两次探测到同一个新版本才认（滚动发布期间新旧容器同时在线会来回跳）；
//   2) sessionStorage 记账，避免"刷新 → 还是旧 HTML → 再刷新"的死循环；
//   3) 有正在编辑的内容时不自动刷（表单/输入框聚焦即视为忙）。

import { ref, watch } from "vue";

// 节拍可配（生产用默认值；本地/e2e 调短，否则一个用例要等一分钟）
const env = import.meta.env as Record<string, string | undefined>;
const POLL_MS = Number(env.VITE_VERSION_POLL_MS) || 60_000;
const MIN_INTERVAL_MS = Number(env.VITE_VERSION_MIN_INTERVAL_MS) || 15_000;
const STABLE_HITS = 2;
const AUTO_DELAY_MS = Number(env.VITE_VERSION_AUTO_DELAY_MS) || 20_000;
const SS_RELOADED = "console:version:reloaded";
const SS_AUTO_OFF = "console:version:auto-off";

/** 当前页面正在跑的版本（第一次探测确立基线）。 */
const current = ref("");
/** 已判定上线的新版本（空 = 没有）。 */
const available = ref("");
const pending = ref("");
const hits = ref(0);
const lastCheckedAt = ref(0);
/** 用户点了"稍后"：本次会话不再自动刷新这个版本。 */
const dismissed = ref(false);
/** 自动刷新倒计时（秒），0 = 未启动。 */
const countdown = ref(0);
/** 因为正在编辑而被暂停。 */
const paused = ref(false);

const blockers = new Set<() => boolean>();

/** 注册"现在不能自动刷新"的条件（页面自己判断，例如表单未保存）。 */
export function registerUpdateBlocker(fn: () => boolean) {
  blockers.add(fn);
  return () => blockers.delete(fn);
}

function hasActiveWork(): boolean {
  for (const fn of blockers) {
    try {
      if (fn()) return true;
    } catch {
      // 单个条件抛错不该让检测整体失效
    }
  }
  const el = document.activeElement as HTMLElement | null;
  if (el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))) return true;
  return false;
}

function ssGet(key: string): string {
  try {
    return sessionStorage.getItem(key) || "";
  } catch {
    return "";
  }
}
function ssSet(key: string, value: string) {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    // 隐私模式下 sessionStorage 可能不可用：退化为"本次页面不自动刷"
  }
}

/** 版本文件地址：dev 是 './' + version.json，生产是 '/admin/' + version.json。 */
function versionUrl(): string {
  const base = import.meta.env.BASE_URL || "/";
  const normalized = base.endsWith("/") ? base : `${base}/`;
  try {
    return `${new URL(normalized, window.location.origin).pathname}version.json`;
  } catch {
    return `${normalized}version.json`;
  }
}

let timer: number | null = null;
let ticker: number | null = null;
let started = false;

async function check(force = false) {
  const now = Date.now();
  if (!force && now - lastCheckedAt.value < MIN_INTERVAL_MS) return;
  lastCheckedAt.value = now;
  try {
    const res = await fetch(`${versionUrl()}?t=${now}`, { cache: "no-store" });
    if (!res.ok) return;
    const data = (await res.json()) as { version?: string };
    const version = String(data?.version || "");
    // `dev*` = 本地开发（dev-<短 sha>[-dirty]，见 vite.config 的 devVersionPlugin）。
    // 必须按**前缀**判而不是等号：dev 版本带了 sha 之后，本地每重启一次 dev server
    // 就会让 version 变一次，用等号判会变成"每重启一次弹一次更新条"。
    if (!version || version.startsWith("dev")) return;
    if (!current.value) {
      current.value = version;
      return;
    }
    if (version === current.value) {
      pending.value = "";
      hits.value = 0;
      available.value = "";
      return;
    }
    if (version === pending.value) hits.value += 1;
    else {
      pending.value = version;
      hits.value = 1;
    }
    if (hits.value >= STABLE_HITS && available.value !== version) available.value = version;
  } catch {
    // 探测失败按"没有新版本"处理，不打扰管理员
  }
}

function autoReloadAllowed(version: string): boolean {
  return ssGet(SS_RELOADED) !== version && ssGet(SS_AUTO_OFF) !== version;
}

function stopCountdown() {
  countdown.value = 0;
  paused.value = false;
  if (ticker !== null) {
    window.clearInterval(ticker);
    ticker = null;
  }
}

function armCountdown() {
  if (ticker !== null || !available.value) return;
  countdown.value = Math.round(AUTO_DELAY_MS / 1000);
  ticker = window.setInterval(() => {
    const version = available.value;
    if (!version || dismissed.value || !autoReloadAllowed(version)) {
      stopCountdown();
      return;
    }
    if (hasActiveWork()) {
      paused.value = true;
      return;
    }
    paused.value = false;
    countdown.value -= 1;
    if (countdown.value <= 0) {
      stopCountdown();
      reload();
    }
  }, 1000);
}

/** 立即刷新（硬刷新，确保拿到新的 index.html 与带哈希的新 chunk）。 */
export function reload() {
  if (available.value) ssSet(SS_RELOADED, available.value);
  window.location.reload();
}

/** 用户点"稍后"：本次会话不再自动刷新该版本。 */
export function dismiss() {
  if (available.value) ssSet(SS_AUTO_OFF, available.value);
  dismissed.value = true;
  stopCountdown();
}

export function startVersionWatch() {
  if (started) return;
  started = true;
  void check(true);
  timer = window.setInterval(() => void check(), POLL_MS);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") void check();
  });
  window.addEventListener("focus", () => void check());
}

export function useVersionWatcher() {
  startVersionWatch();
  watch(available, (version) => {
    if (!version) {
      stopCountdown();
      return;
    }
    dismissed.value = false;
    if (autoReloadAllowed(version)) armCountdown();
  });
  return { current, available, dismissed, countdown, paused, check, reload, dismiss };
}

/** 仅测试/调试用：重置内部状态。 */
export function resetVersionWatcher() {
  if (timer !== null) window.clearInterval(timer);
  timer = null;
  stopCountdown();
  started = false;
  current.value = "";
  available.value = "";
  pending.value = "";
  hits.value = 0;
  lastCheckedAt.value = 0;
  dismissed.value = false;
}
