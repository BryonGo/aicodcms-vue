<template>
  <div class="login-scan-container">
    <div ref="qrcodeRef"></div>
    <div class="font12 mt20 login-msg">{{ $t("message.scan.text") }}</div>
  </div>
</template>

<script lang="ts">
import { ref, defineComponent, onMounted, onBeforeUnmount } from "vue";
import QRCode from "qrcodejs2-fixes";

export default defineComponent({
  name: "loginScan",
  setup() {
    const qrcodeRef = ref<HTMLElement | null>(null);
    let qrCodeInstance: any = null;
    // 初始化生成二维码
    const initQrcode = () => {
      if (qrcodeRef.value) {
        qrcodeRef.value.textContent = "";
      }
      qrCodeInstance = new QRCode(qrcodeRef.value, {
        text: `https://qm.qq.com/cgi-bin/qm/qr?k=CDO9yYdygFMKdQihlUXj4-Y0RDEhPTsh&noverify=0`,
        width: 260,
        height: 260,
        colorDark: "#000000",
        colorLight: "#ffffff",
      });
    };
    // 页面加载时
    onMounted(() => {
      initQrcode();
    });
    // 组件卸载时清理 QRCode 实例
    onBeforeUnmount(() => {
      if (qrCodeInstance) {
        qrCodeInstance.clear();
        qrCodeInstance = null;
      }
    });
    return { qrcodeRef };
  },
});
</script>

<style scoped>
.login-scan-container {
  display: flex;
  flex-direction: column;
  padding: 20px;
  text-align: center;
  opacity: 0;
  animation: error-num 0.5s forwards;
  animation-delay: 0.1s;
}
.login-scan-container :deep(img) {
  margin: auto;
}
.login-msg {
  color: var(--el-text-color-placeholder);
  opacity: 0;
  animation: error-num 0.5s forwards;
  animation-delay: 0.2s;
}
</style>
