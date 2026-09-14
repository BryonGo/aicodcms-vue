/**
 * 菜单标题的可读化。
 *
 * 约定：`sys_menu.title` **必须是 i18n key**（如 `message.sdk.platformModelSwitch`、
 * `common.edit`），不允许写纯文本 ——
 *   - 侧边栏用 `$t(meta.title)` 渲染：纯文本等于把中文写死在库里，
 *     英文站只能显示中文，改文案还得改库；
 *   - 反过来，key 缺定义时 `$t` 会把 key 原样吐出来（界面上是一串
 *     `message.sdk.xxx`），那不是"没做 i18n"，是**缺 i18n 定义**，补上即可。
 *
 * 历史遗留：库里有 6 条纯文本标题（站点管理 / 站群互链 / 游戏订单 等），
 * 已由 go-sdk 的 `hack/menuseed` 统一升级成 key（该命令还会在每次执行时
 * 复查并列出仍然是纯文本的标题）。前端这份函数的"翻不出来就原样返回"
 * 只为容错保留，不是鼓励写纯文本。
 *
 * 后台「菜单管理」页此前直接渲染 `{{ row.title }}`，于是 key 型菜单在管理页
 * 显示成裸 key，看起来像"i18n 没做"——其实是显示层没翻译。
 * 这里统一：能翻译就显示译文，翻不出来就原样显示（便于发现漏配的 key）。
 * 管理页同时把原始 key 以小字附在下方，便于运营核对/编辑。
 */

type Translate = (key: string) => string;

/** 菜单标题 → 可读文案（纯文本原样返回，key 型返回译文）。 */
export function menuLabel(t: Translate, title?: string | null): string {
  const raw = (title || "").trim();
  if (!raw) return "";
  if (
    raw.startsWith("http://") ||
    raw.startsWith("https://") ||
    raw.startsWith("/")
  )
    return raw;
  const translated = t(raw);
  return translated && translated !== raw ? translated : raw;
}

/** 该 title 是否确实是 i18n key（用于在管理页附注原始 key）。 */
export function isI18nKey(t: Translate, title?: string | null): boolean {
  const raw = (title || "").trim();
  if (
    !raw ||
    raw.startsWith("http://") ||
    raw.startsWith("https://") ||
    raw.startsWith("/")
  )
    return false;
  return t(raw) !== raw;
}
