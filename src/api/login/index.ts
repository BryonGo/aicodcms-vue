import request from "/@/utils/request";

/**
 * 登录api接口集合
 * @method signIn 用户登录
 */
export function login(params: object) {
  return request({
    url: "/api/v1/pms/login",
    method: "post",
    data: params,
  });
}

/**
 * 获取验证码
 */
export function captcha() {
  return request({
    url: "/api/v1/pub/captcha/get",
    method: "get",
  });
}

/**
 * 退出登录
 */
export function logout() {
  return request({
    url: "/api/v1/pms/login-out",
    method: "get",
  });
}

/**
 * 获取登录验证方式配置（none/captcha/turnstile/both + Turnstile site key）
 */
export function verificationConfig() {
  return request({
    url: "/api/v1/pub/verification/config",
    method: "get",
  });
}
