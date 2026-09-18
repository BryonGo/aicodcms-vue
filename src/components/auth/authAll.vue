<template>
  <slot v-if="getUserAuthBtnList" />
</template>

<script lang="ts">
import { computed, defineComponent, type PropType } from "vue";
import { storeToRefs } from "pinia";
import { useUserInfo } from "/@/stores/userInfo";

export default defineComponent({
  name: "authAll",
  props: {
    value: {
      type: Array as PropType<string[]>,
      default: () => [],
    },
  },
  setup(props) {
    const stores = useUserInfo();
    const { permissions } = storeToRefs(stores);
    // 所有权限都满足时显示；超级管理员权限可以通过全部检查。
    const getUserAuthBtnList = computed(() => {
      return (
        permissions.value.includes("*/*/*") ||
        props.value.every((permission) => permissions.value.includes(permission))
      );
    });
    return {
      getUserAuthBtnList,
    };
  },
});
</script>
