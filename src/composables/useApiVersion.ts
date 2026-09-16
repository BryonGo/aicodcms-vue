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

/**
 * versionAlert 判定「发布自检」那两行该不该出现。
 *
 * 抽成纯函数是为了能单测 —— 它的分支在本地开发环境下**一个都走不到**
 * （dev 里 /api/version 返回 version="dev"、/admin/version.json 又取不到），
 * 只靠肉眼看界面等于没验证。
 *
 * 返回：
 *   "failed"  接口探测失败 —— 无从判断，值得提醒
 *   "drift"   两侧都拿到具体版本，但 commit 对不上 —— 只发布了半边
 *   ""        正常，整块隐藏
 *
 * 刻意把 dev / 空值判成**正常**而不是异常：它们只说明"判定不了"。
 * 报出来只会造成狼来了 —— 本地开发每次打开菜单都弹一个告警，很快就没人看了。
 */
export function versionAlert(
  consoleTag: string,
  info: ApiVersionInfo | null,
  failed: boolean,
): "" | "drift" | "failed" {
  if (failed) return "failed";
  const tag = (consoleTag || "").trim();
  const version = (info?.version || "").trim();
  const commit = (info?.commit || "").trim();
  // 占位版本一律当「判定不了」。除了字面量 "dev"，还要认本地回退出来的
  // dev-<短 sha>[-dirty]（见 aicodcms docs/VERSION-CONTRACT.md 第 6 节）——
  // 只判等号的话，本地 consoleTag="dev" 配 version="dev-a6f28b3b-dirty" 会算出
  // drift，于是本地每开一次菜单都弹一个"只发布了半边"的假告警。
  const placeholder = (s: string) => !s || s.startsWith("dev");
  if (placeholder(tag) || placeholder(version) || !commit) return "";
  // 镜像 tag 形如 20260915153531-e693224，尾段是短 sha；与接口 commit 互相前缀匹配
  const tagSha = tag.includes("-") ? tag.split("-").pop() || tag : tag;
  const same = tagSha.startsWith(commit) || commit.startsWith(tagSha);
  return same ? "" : "drift";
}

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
