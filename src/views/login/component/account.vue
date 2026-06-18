<template>
  <div class="login-form-wrap">
    <el-form
      ref="loginForm"
      class="login-form"
      :model="ruleForm"
      :rules="formRules"
      @keyup.enter="onSignIn"
    >
      <!-- Username -->
      <div class="form-field" style="animation-delay: 0.05s">
        <el-form-item prop="username">
          <el-input
            type="text"
            :placeholder="$t('message.account.accountPlaceholder1')"
            v-model="ruleForm.username"
            clearable
            autocomplete="off"
            size="large"
          >
            <template #prefix>
              <span class="field-icon">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </span>
            </template>
          </el-input>
        </el-form-item>
      </div>

      <!-- Password -->
      <div class="form-field" style="animation-delay: 0.15s">
        <el-form-item prop="password">
          <el-input
            :type="isShowPassword ? 'text' : 'password'"
            :placeholder="$t('message.account.accountPlaceholder2')"
            v-model="ruleForm.password"
            autocomplete="off"
            size="large"
          >
            <template #prefix>
              <span class="field-icon">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>
            </template>
            <template #suffix>
              <button
                type="button"
                class="field-toggle"
                :class="{ active: isShowPassword }"
                @click="isShowPassword = !isShowPassword"
                tabindex="-1"
                :aria-label="isShowPassword ? 'Hide password' : 'Show password'"
              >
                <svg
                  v-if="!isShowPassword"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                <svg
                  v-else
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path
                    d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"
                  />
                  <path
                    d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"
                  />
                  <path d="m14.12 14.12a3 3 0 1 0-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              </button>
            </template>
          </el-input>
        </el-form-item>
      </div>

      <!-- Captcha -->
      <div class="form-field" style="animation-delay: 0.25s">
        <el-form-item prop="verifyCode">
          <div class="captcha-row">
            <el-input
              type="text"
              maxlength="4"
              :placeholder="$t('message.account.accountPlaceholder3')"
              v-model="ruleForm.verifyCode"
              clearable
              autocomplete="off"
              size="large"
              class="captcha-input"
            >
              <template #prefix>
                <span class="field-icon">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <rect x="3" y="11" width="18" height="10" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 9.9-1" />
                  </svg>
                </span>
              </template>
            </el-input>
            <div
              class="captcha-img-wrap"
              @click="getCaptcha"
              :title="$t('message.account.accountPlaceholder3')"
            >
              <img class="captcha-img" :src="captchaSrc" alt="captcha" />
              <div class="captcha-overlay">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <polyline points="23 4 23 10 17 10" />
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                </svg>
              </div>
            </div>
          </div>
        </el-form-item>
      </div>

      <!-- Submit Button -->
      <div class="form-field form-submit" style="animation-delay: 0.35s">
        <button
          type="button"
          class="submit-btn"
          :class="{ loading: loading.signIn }"
          :disabled="loading.signIn"
          @click="onSignIn"
        >
          <span v-if="!loading.signIn" class="submit-text">{{
            $t("message.account.accountBtnText")
          }}</span>
          <span v-else class="submit-spinner">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
            >
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
          </span>
        </button>
      </div>
    </el-form>
  </div>
</template>

<script lang="ts">
import {
  toRefs,
  reactive,
  defineComponent,
  computed,
  onMounted,
  getCurrentInstance,
  ref,
  unref,
} from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { useI18n } from "vue-i18n";

import { storeToRefs } from "pinia";
import { useThemeConfig } from "/@/stores/themeConfig";
import { initFrontEndControlRoutes } from "/@/router/frontEnd";
import { initBackEndControlRoutes } from "/@/router/backEnd";
import { Session } from "/@/utils/storage";
import { formatAxis } from "/@/utils/formatTime";
import { NextLoading } from "/@/utils/loading";
import { login, captcha } from "/@/api/login";

export default defineComponent({
  name: "loginAccount",
  setup() {
    const { t } = useI18n();
    const { proxy } = <any>getCurrentInstance();
    const storesThemeConfig = useThemeConfig();
    const { themeConfig } = storeToRefs(storesThemeConfig);
    const route = useRoute();
    const router = useRouter();
    const loginForm = ref(null);
    const state = reactive({
      isShowPassword: false,
      ruleForm: {
        username: "",
        password: "",
        verifyCode: "",
        verifyKey: "",
      },
      formRules: {
        username: [
          {
            required: true,
            trigger: "blur",
            message: t("message.account.msgUsernameRequired"),
          },
        ],
        password: [
          {
            required: true,
            trigger: "blur",
            message: t("message.account.msgPasswordRequired"),
          },
        ],
        verifyCode: [
          {
            required: true,
            trigger: "blur",
            message: t("message.account.msgVerifyCodeRequired"),
          },
        ],
      },
      loading: {
        signIn: false,
      },
      captchaSrc: "",
    });

    onMounted(() => {
      getCaptcha();
    });

    const getCaptcha = () => {
      captcha().then((res: any) => {
        const img = res.data.img;
        state.captchaSrc = img && !img.startsWith("data:") ? `data:image/png;base64,${img}` : img;
        state.ruleForm.verifyKey = res.data.key;
      });
    };

    // Time greeting
    const currentTime = computed(() => {
      return formatAxis(new Date());
    });

    // Sign in
    const onSignIn = async () => {
      if (state.loading.signIn) {
        return;
      }
      const formWrap = unref(loginForm) as any;
      if (!formWrap) return;
      formWrap.validate((valid: boolean) => {
        if (valid) {
          state.loading.signIn = true;
          login(state.ruleForm)
            .then(async (res: any) => {
              const userInfo = res.data.user_info;
              userInfo.avatar = proxy.getUpFileUrl(userInfo.avatar);
              // Store token
              Session.set("token", res.data.token);
              // Store user info
              Session.set("userInfo", userInfo);
              // Store menu list
              Session.set("userMenu", res.data.menu_list);
              // Store permissions
              Session.set("permissions", res.data.permissions);
              // Store username for simulation data
              localStorage.setItem("username", state.ruleForm.username);

              if (!themeConfig.value.isRequestRoutes) {
                await initFrontEndControlRoutes();
                signInSuccess();
              } else {
                await initBackEndControlRoutes();
                signInSuccess();
              }
            })
            .catch((err: any) => {
              state.loading.signIn = false;
              const msg = err?.msg || err?.message || t("message.account.msgLoginFailed");
              ElMessage.error(msg);
              getCaptcha();
            });
        }
      });
    };

    // Post-login redirect
    const signInSuccess = () => {
      const currentTimeInfo = currentTime.value;
      if (route.query?.redirect) {
        const paramsStr = route.query?.params;
        const hasParams = paramsStr && typeof paramsStr === "string" && paramsStr.length > 0;
        router.push({
          path: <string>route.query?.redirect,
          query: hasParams ? JSON.parse(paramsStr) : {},
        });
      } else {
        router.push("/");
      }
      state.loading.signIn = true;
      const signInText = t("message.signInText");
      ElMessage.success(`${currentTimeInfo}，${signInText}`);
      NextLoading.start();
    };

    return {
      onSignIn,
      getCaptcha,
      loginForm,
      ...toRefs(state),
    };
  },
});
</script>

<style scoped>
/* ============================================
   Login Form · AICODCMS Design System
   配色全部走 --cc-* 变量，亮/暗自动切换
   ============================================ */

.login-form-wrap {
  width: 100%;
}
.login-form {
  width: 100%;
}

/* --- Form Fields --- */
.form-field {
  animation: fieldEnter 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
}
.form-submit {
  animation-delay: 0.35s;
}

/* --- Input Overrides --- */
.login-form :deep(.el-form-item) {
  margin-bottom: 20px;
  position: relative;
}
.login-form :deep(.el-form-item__content) {
  position: relative;
}
.login-form :deep(.el-form-item__error) {
  font-size: var(--cc-font-12);
  position: absolute;
  left: calc(100% + 12px);
  top: 50%;
  transform: translateY(-50%);
  padding-top: 0;
  width: auto;
  white-space: nowrap;
  color: var(--cc-color-danger);
}

.login-form :deep(.el-input__wrapper) {
  border-radius: var(--cc-radius-md);
  background: var(--cc-color-bg);
  border: 1.5px solid var(--cc-color-border);
  box-shadow: none !important;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 2px 14px;
}
.login-form :deep(.el-input__wrapper:hover) {
  border-color: var(--cc-color-border-strong);
  background: var(--cc-color-surface-hover);
}
.login-form :deep(.el-input__wrapper.is-focus) {
  border-color: var(--cc-color-primary);
  background: var(--cc-color-surface);
  box-shadow: 0 0 0 3px var(--cc-color-focus-ring) !important;
}

.login-form :deep(.el-input__inner) {
  font-size: 15px;
  color: var(--cc-color-text-1);
  height: 44px;
  line-height: 44px;
}
.login-form :deep(.el-input__inner::placeholder) {
  color: var(--cc-color-text-4);
  font-size: var(--cc-font-14);
}

.login-form :deep(.el-input__prefix) {
  margin-right: 8px;
}
.login-form :deep(.el-input__suffix) {
  margin-left: 4px;
}

/* --- Field Icons --- */
.field-icon {
  display: flex;
  align-items: center;
  color: var(--cc-color-text-4);
  transition: color 0.2s ease;
}
.login-form :deep(.is-focus) .field-icon {
  color: var(--cc-color-primary);
}

/* --- Password Toggle --- */
.field-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: var(--cc-color-text-4);
  border-radius: var(--cc-radius-sm);
  transition: all 0.2s ease;
}
.field-toggle:hover {
  color: var(--cc-color-text-2);
  background: var(--cc-color-surface-hover);
}
.field-toggle.active {
  color: var(--cc-color-primary);
}

/* --- Captcha Row --- */
.captcha-row {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  width: 100%;
}
.captcha-input {
  flex: 1;
  min-width: 0;
}
.captcha-img-wrap {
  flex-shrink: 0;
  width: 128px;
  height: 48px;
  border-radius: var(--cc-radius-md);
  overflow: hidden;
  cursor: pointer;
  position: relative;
  border: 1.5px solid var(--cc-color-border);
  transition: border-color 0.2s ease;
}
.captcha-img-wrap:hover {
  border-color: var(--cc-color-primary);
}
.captcha-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.captcha-overlay {
  position: absolute;
  inset: 0;
  background: color-mix(in srgb, var(--cc-color-surface) 85%, transparent);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
  color: var(--cc-color-primary);
}
.captcha-img-wrap:hover .captcha-overlay {
  opacity: 1;
}

/* --- Submit Button --- */
.submit-btn {
  position: relative;
  width: 100%;
  height: 48px;
  border: none;
  border-radius: var(--cc-radius-lg);
  background: var(--cc-color-primary);
  color: #ffffff;
  font-size: var(--cc-font-16);
  font-weight: 600;
  letter-spacing: 0.06em;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  margin-top: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.submit-btn::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, transparent 60%);
  opacity: 0;
  transition: opacity 0.3s ease;
}
.submit-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  background: var(--cc-color-primary-hover);
  box-shadow: 0 8px 24px var(--cc-color-primary-soft);
}
.submit-btn:hover:not(:disabled)::before {
  opacity: 1;
}
.submit-btn:active:not(:disabled) {
  transform: translateY(0);
  background: var(--cc-color-primary-active);
  box-shadow: 0 4px 12px var(--cc-color-primary-softer);
}
.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
.submit-btn.loading {
  background: var(--cc-color-text-3);
}

.submit-text {
  position: relative;
  z-index: 1;
}
.submit-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
}
.submit-spinner svg {
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* --- Animations --- */
@keyframes fieldEnter {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* --- Validation Overrides --- */
.login-form :deep(.el-form-item.is-error .el-input__wrapper) {
  border-color: var(--cc-color-danger);
}
.login-form :deep(.el-form-item.is-error .el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--cc-color-danger) 12%, transparent) !important;
}

/* 暗/亮色由 theme/dark.css 桥接 --cc-* 自动切换，
   登录页本身不再写 :global(html.dark) 覆盖。 */
</style>
