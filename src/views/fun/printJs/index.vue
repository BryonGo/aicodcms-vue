<template>
  <div ref="printRef">
    <el-card shadow="hover" :header="$t('message.fun.printJs')">
      <el-alert
        :title="$t('message.fun.attrPrintJs')"
        type="success"
        :closable="false"
        class="mb15"
      ></el-alert>
      <el-button @click="onPrintJs" size="default" type="primary">
        <SvgIcon name="iconfont icon-dayin" />
        {{ $t("message.fun.btnPrintDemo") }}
      </el-button>
    </el-card>
  </div>
</template>

<script lang="ts">
import { reactive, toRefs, defineComponent } from "vue";
import printJs from "print-js";

export default defineComponent({
  name: "funPrintJs",
  setup() {
    const state = reactive({
      printRef: null as null | HTMLDivElement,
    });
    // 打印点击
    const onPrintJs = () => {
      printJs({
        printable: state.printRef,
        type: "html",
        css: [
          "//at.alicdn.com/t/font_2298093_o73r8wjdhlg.css",
          "//unpkg.com/element-plus/dist/index.css",
        ],
        scanStyles: false,
        style: `@media print{.mb15{margin-bottom:15px;}.el-button--small i.iconfont{font-size: 12px !important;margin-right: 5px;}}`,
      });
    };
    return {
      onPrintJs,
      ...toRefs(state),
    };
  },
});
</script>
