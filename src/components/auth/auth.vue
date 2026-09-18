<template>
  <slot v-if="getUserAuthBtnList" />
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import { storeToRefs } from "pinia";
import { useUserInfo } from "/@/stores/userInfo";

export default defineComponent({
  name: "auth",
  props: {
    value: {
      type: String,
      default: () => "",
    },
  },
  setup(props) {
    const stores = useUserInfo();
    const { permissions } = storeToRefs(stores);
    // 权限判断统一读取后端返回的 permissions，避免使用未填充的旧字段。
    const getUserAuthBtnList = computed(() => {
      return permissions.value.includes("*/*/*") || permissions.value.includes(props.value);
    });
    return {
      getUserAuthBtnList,
    };
  },
});
</script>
