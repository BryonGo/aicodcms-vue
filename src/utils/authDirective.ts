import type { App } from "vue";
import { useUserInfo } from "/@/stores/userInfo";
import { judementSameArr } from "/@/utils/arrayOperation";

/**
 * 用户权限指令
 * @directive 单个权限验证（v-auth="xxx"）
 * @directive 多个权限验证，满足一个则显示（v-auths="[xxx,xxx]"）
 * @directive 多个权限验证，全部满足则显示（v-auth-all="[xxx,xxx]"）
 */
export function authDirective(app: App) {
  const allPermissions = "*/*/*";
  const stores = useUserInfo();

  // Remove the element the directive is attached to. When the directive is used
  // on a component whose root is a Fragment (e.g. Element Plus `el-dropdown-item`,
  // which renders a comment anchor + <li>), Vue passes the fragment anchor as
  // `el`. In that case the real node is the next element sibling, so remove that
  // instead — otherwise permission-hiding would silently do nothing and Vue emits
  // the "Runtime directive used on component with non-element root node" warning.
  const removeAuthEl = (el: HTMLElement) => {
    const target =
      el.nodeType === 8 /* fragment anchor (comment) in dev */
        ? (el.nextElementSibling as HTMLElement | null)
        : el;
    target?.parentNode?.removeChild(target);
  };

  // 单个权限验证（v-auth="xxx"）
  app.directive("auth", {
    mounted(el, binding) {
      if (stores.permissions.includes(allPermissions)) return;
      if (!stores.permissions.some((v: string) => v === binding.value))
        removeAuthEl(el);
    },
  });
  // 多个权限验证，满足一个则显示（v-auths="[xxx,xxx]"）
  app.directive("auths", {
    mounted(el, binding) {
      if (stores.permissions.includes(allPermissions)) return;
      let flag = false;
      stores.permissions.map((val: string) => {
        binding.value.map((v: string) => {
          if (val === v) flag = true;
        });
      });
      if (!flag) removeAuthEl(el);
    },
  });
  // 多个权限验证，全部满足则显示（v-auth-all="[xxx,xxx]"）
  app.directive("auth-all", {
    mounted(el, binding) {
      if (stores.permissions.includes(allPermissions)) return;
      const flag = judementSameArr(binding.value, stores.permissions);
      if (!flag) removeAuthEl(el);
    },
  });
}
