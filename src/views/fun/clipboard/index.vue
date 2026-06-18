<template>
  <el-card shadow="hover" :header="$t('message.fun.clipboard')">
    <el-alert
      :title="$t('message.fun.attrClipboard')"
      type="success"
      :closable="false"
      class="mb15"
    ></el-alert>
    <el-input :placeholder="$t('message.cms.common.placeholderInput')" v-model="copyVal">
      <template #append>
        <el-button @click="copyText(copyVal)">{{ $t("message.cms.common.copy") }}</el-button>
      </template>
    </el-input>
    <el-input
      :placeholder="$t('message.cms.common.placeholderPaste')"
      v-model="shearVal"
      class="mt15"
    >
    </el-input>
  </el-card>
</template>

<script lang="ts">
import { reactive, toRefs, onMounted, defineComponent } from "vue";
import commonFunction from "/@/utils/commonFunction";

export default defineComponent({
  name: "funClipboard",
  setup() {
    const { copyText } = commonFunction();
    const state = reactive({
      copyVal: "https://gitee.com/lyt-top/vue-next-admin",
      shearVal: "",
    });
    // 页面加载时
    onMounted(() => {});
    return {
      copyText,
      ...toRefs(state),
    };
  },
});
</script>
