// 后端（Go API）当前**正在跑**的版本。
//
// 为什么要它：控制台自己是镜像 tag（发布 = 换镜像），而 API 是「宿主换二进制」发布的 ——
// 两条发布链彼此独立，很容易只发了半边（控制台发了、API 没换，或反过来）。
// 把两个版本并排显示，管理员一眼就能看出漂移，不必登服务器 docker ps / ./aicodcms -v。
//
// 数据源：API 的探针端点 /api/version（免鉴权、不参与站点解析，站点表抖动也不影响它）。
// 字段契约见后端仓库 aicodcms 的 docs/VERSION-CONTRACT.md 第 2.1 节。
//
// 刻意不走 utils/request 里的 axios 实例：那是业务通道 —— 会带 token、会弹错误提示、
// 超时 50 秒。版本探测属于背景行为，失败只该安静地显示「未知」，不能打扰管理员。
import { ref } from "vue";
import { buildApiUrl } from "/@/utils/aicodcod";

export type ApiVersionInfo = {
  service?: string;
  version?: string;
  commit?: string;
  buildTime?: string;
  startedAt?: string;
  goVersion?: string;
};

const info = ref<ApiVersionInfo | null>(null);
const failed = ref(false);
const loading = ref(false);

// 模块级缓存 + 节流：多处读它（用户菜单，以后可能还有「关于」页）时不会各打一次接口。
const THROTTLE_MS = 30_000;
let lastFetchedAt = 0;
let inflight: Promise<void> | null = null;

async function fetchVersion(force = false): Promise<void> {
  const now = Date.now();
  if (!force && now - lastFetchedAt < THROTTLE_MS) return;
  if (inflight) return inflight;
  lastFetchedAt = now;
  loading.value = true;
  inflight = (async () => {
    try {
      const res = await fetch(`${buildApiUrl("api/version")}?t=${now}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      info.value = (await res.json()) as ApiVersionInfo;
      failed.value = false;
    } catch {
      // 打不通就标记「未知」：控制台照常用，不能因为有探针失败就报错。
      // 常见原因：这套环境还没部署带 /api/version 的 API，或本机开发指向的线上 API 还是旧版。
      failed.value = true;
    } finally {
      loading.value = false;
      inflight = null;
    }
  })();
  return inflight;
}

/** 绕过节流强制刷新一次（用户真正展开菜单时调用，保证看到的是此刻的值）。 */
export function refreshApiVersion(): Promise<void> {
  return fetchVersion(true);
}

export function useApiVersion() {
  void fetchVersion();
  return { info, failed, loading, refresh: refreshApiVersion };
}
