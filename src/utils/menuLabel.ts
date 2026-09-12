/**
 * 菜单标题的可读化。
 *
 * 约定：`sys_menu.title` **既可能是 i18n key，也可能是纯文本** ——
 *   - 侧边栏用 `$t(meta.title)` 渲染，两种都能显示（纯文本时 $t 原样返回）
 *   - 但后台「菜单管理」页此前直接渲染 `{{ row.title }}`，于是 key 型菜单
 *     （如 `message.sdk.platformModelSwitch`、`common.edit`）在管理页显示成裸 key，
 *     看起来像「i18n 没做」——其实是显示层没翻译。
 *
 * 这里统一：能翻译就显示译文，翻不出来就原样显示纯文本。
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
