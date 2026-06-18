<template>
  <div class="login-page">
    <!-- Left Brand Panel -->
    <div class="login-brand">
      <div class="brand-inner">
        <div class="brand-logo">
          <img :src="logoMini" alt="logo" />
        </div>
        <h1 class="brand-title">{{ getThemeConfig.globalViceTitle }}</h1>
        <p class="brand-subtitle">{{ $t("message.signInText") }}</p>
        <div class="brand-features">
          <div class="feature-item" v-for="(item, i) in features" :key="i">
            <span class="feature-dot"></span>
            <span>{{ item }}</span>
          </div>
        </div>
      </div>
      <!-- Decorative geometric elements -->
      <div class="brand-geometry">
        <div class="geo-line geo-line-1"></div>
        <div class="geo-line geo-line-2"></div>
        <div class="geo-line geo-line-3"></div>
        <div class="geo-circle geo-circle-1"></div>
        <div class="geo-circle geo-circle-2"></div>
        <div class="geo-square geo-square-1"></div>
      </div>
    </div>

    <!-- Right Form Panel -->
    <div class="login-form-panel">
      <div class="form-card">
        <div class="form-header">
          <h2 class="form-title">{{ $t("message.account.accountBtnText") }}</h2>
          <p class="form-desc">{{ $t("message.account.accountPlaceholder1") }}</p>
        </div>
        <Account />
      </div>
      <div class="login-footer">
        <span>Copyright &copy; {{ currentYear }} AICODCMS. All Rights Reserved.</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useThemeConfig } from "/@/stores/themeConfig";
import logoMini from "/@/assets/logo-mini.svg";
import { NextLoading } from "/@/utils/loading";
import Account from "/@/views/login/component/account.vue";

export default defineComponent({
  name: "loginIndex",
  components: { Account },
  setup() {
    const storesThemeConfig = useThemeConfig();
    const { themeConfig } = storeToRefs(storesThemeConfig);

    const getThemeConfig = computed(() => themeConfig.value);
    const currentYear = computed(() => new Date().getFullYear());

    const features = computed(() => {
      // Use the i18n system - these keys are defined in the i18n files
      return [] as string[];
    });

    onMounted(() => {
      NextLoading.done();
    });

    return {
      logoMini,
      getThemeConfig,
      currentYear,
      features,
    };
  },
});
</script>

<style scoped>
/* ============================================
   Login Page · AICODCMS Design System
   - 所有色值走 --cc-* 变量
   - 左 brand 用 --cc-grad-cosmic 渐变 + 暗色 navy 底
   - 右 form 自适应亮/暗
   ============================================ */

.login-page {
  width: 100%;
  height: 100vh;
  display: flex;
  overflow: hidden;
  background: var(--cc-color-bg);
  font-family: var(--cc-font-sans);
}

/* --- Left Brand Panel --- */
.login-brand {
  flex: 0 0 44%;
  position: relative;
  background:
    radial-gradient(circle at 80% 10%, rgba(22, 186, 170, 0.18), transparent 55%),
    radial-gradient(circle at 10% 90%, rgba(99, 102, 241, 0.18), transparent 60%),
    linear-gradient(160deg, #0f1a2e 0%, #0d1525 40%, #0b1220 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  user-select: none;
}

.brand-inner {
  position: relative;
  z-index: 2;
  text-align: center;
  padding: 0 48px;
  max-width: 420px;
}

.brand-logo {
  margin-bottom: 28px;
  animation: brandFadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;
}
.brand-logo img {
  width: 72px;
  height: 64px;
  filter: drop-shadow(0 4px 12px rgba(22, 186, 170, 0.35));
}

.brand-title {
  font-size: var(--cc-font-28);
  font-weight: 700;
  letter-spacing: 0.04em;
  color: #ffffff;
  margin: 0 0 12px 0;
  animation: brandFadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both;
}
.brand-subtitle {
  font-size: var(--cc-font-16);
  font-weight: 400;
  color: rgba(255, 255, 255, 0.72);
  margin: 0 0 40px 0;
  letter-spacing: 0.02em;
  animation: brandFadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both;
}

.brand-features {
  display: flex;
  flex-direction: column;
  gap: 14px;
  animation: brandFadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both;
}
.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  color: rgba(255, 255, 255, 0.72);
  font-size: var(--cc-font-14);
  letter-spacing: 0.01em;
}
.feature-dot {
  width: 6px;
  height: 6px;
  border-radius: var(--cc-radius-full);
  background: var(--cc-color-primary);
  flex-shrink: 0;
  box-shadow: 0 0 8px rgba(22, 186, 170, 0.55);
}

/* --- Geometric Decorations --- */
.brand-geometry {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;
}
.geo-line {
  position: absolute;
  background: linear-gradient(90deg, rgba(22, 186, 170, 0.06), rgba(22, 186, 170, 0.02));
}
.geo-line-1 {
  width: 1px;
  height: 80%;
  left: 18%;
  top: 10%;
  background: linear-gradient(
    180deg,
    transparent,
    rgba(22, 186, 170, 0.08) 30%,
    rgba(22, 186, 170, 0.08) 70%,
    transparent
  );
}
.geo-line-2 {
  width: 60%;
  height: 1px;
  left: 20%;
  bottom: 15%;
  background: linear-gradient(90deg, transparent, rgba(22, 186, 170, 0.06), transparent);
}
.geo-line-3 {
  width: 1px;
  height: 40%;
  right: 12%;
  top: 30%;
  background: linear-gradient(180deg, transparent, rgba(22, 186, 170, 0.05), transparent);
}
.geo-circle {
  position: absolute;
  border-radius: var(--cc-radius-full);
  border: 1px solid rgba(22, 186, 170, 0.06);
}
.geo-circle-1 {
  width: 300px;
  height: 300px;
  right: -100px;
  top: -80px;
}
.geo-circle-2 {
  width: 180px;
  height: 180px;
  left: -60px;
  bottom: -40px;
  border-width: 2px;
  opacity: 0.5;
}
.geo-square {
  position: absolute;
  border: 1px solid rgba(22, 186, 170, 0.05);
  transform: rotate(45deg);
}
.geo-square-1 {
  width: 120px;
  height: 120px;
  right: 15%;
  bottom: 25%;
}

/* --- Right Form Panel --- */
.login-form-panel {
  flex: 1 1 56%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--cc-color-surface);
  position: relative;
}

.form-card {
  width: 100%;
  max-width: 400px;
  padding: 0 24px;
}

.form-header {
  margin-bottom: 36px;
  animation: formSlideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.form-title {
  font-size: 26px;
  font-weight: 700;
  color: var(--cc-color-text-1);
  margin: 0 0 8px 0;
  letter-spacing: 0.02em;
}

.form-desc {
  font-size: var(--cc-font-14);
  color: var(--cc-color-text-3);
  margin: 0;
  letter-spacing: 0.01em;
}

/* --- Footer --- */
.login-footer {
  position: absolute;
  bottom: 24px;
  font-size: var(--cc-font-12);
  color: var(--cc-color-text-4);
  letter-spacing: 0.01em;
}

/* --- Animations --- */
@keyframes brandFadeIn {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes formSlideUp {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* --- Responsive --- */
@media (max-width: 768px) {
  .login-brand {
    display: none;
  }
  .login-form-panel {
    flex: 1 1 100%;
    padding: 24px;
  }
  .form-card {
    max-width: 100%;
    padding: 0;
  }
  .form-title {
    font-size: 24px;
  }
}

@media (max-width: 480px) {
  .form-header {
    margin-bottom: 28px;
  }
  .form-title {
    font-size: 22px;
  }
  .form-desc {
    font-size: var(--cc-font-13);
  }
}
</style>
