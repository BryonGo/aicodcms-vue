<template>
  <slot v-if="getUserAuthBtnList" />
</template>

<script lang="ts">
import { computed, defineComponent, type PropType } from "vue";
import { storeToRefs } from "pinia";
import { useUserInfo } from "/@/stores/userInfo";

export default defineComponent({
  name: "auths",
  props: {
    value: {
      type: Array as PropType<string[]>,
      default: () => [],
    },
  },
  setup(props) {
    const stores = useUserInfo();
    const { permissions } = storeToRefs(stores);
    // 多个权限满足任意一个即可显示，并支持超级管理员权限。
    const getUserAuthBtnList = computed(() => {
      return (
        permissions.value.includes("*/*/*") ||
        props.value.some((permission) => permissions.value.includes(permission))
      );
    });
    return {
      getUserAuthBtnList,
    };
  },
});
</script>
