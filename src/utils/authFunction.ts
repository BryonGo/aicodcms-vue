import { useUserInfo } from "/@/stores/userInfo";

const ALL_PERMISSIONS = "*/*/*";

/** 读取当前用户唯一的前端权限来源。 */
function currentPermissions(): string[] {
  return useUserInfo().permissions;
}

/** 判断当前用户是否拥有单个权限；超级管理员权限可以通过所有检查。 */
export function auth(value: string): boolean {
  const permissions = currentPermissions();
  return permissions.includes(ALL_PERMISSIONS) || permissions.includes(value);
}

/** 判断当前用户是否至少拥有一个给定权限。 */
export function auths(value: Array<string>): boolean {
  return value.some((permission) => auth(permission));
}

/** 判断当前用户是否拥有全部给定权限。 */
export function authAll(value: Array<string>): boolean {
  return value.every((permission) => auth(permission));
}
