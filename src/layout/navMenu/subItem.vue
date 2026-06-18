<template>
  <template v-for="val in chils">
    <el-sub-menu :index="val.path" :key="val.path" v-if="val.children && val.children.length > 0">
      <template #title>
        <MenuIcon :name="val.meta.icon" :seed="val.path" />
        <span>{{ $t(val.meta.title) }}</span>
      </template>
      <sub-item :chil="val.children" />
    </el-sub-menu>
    <template v-else>
      <el-menu-item :index="val.path" :key="val.path">
        <template v-if="!val.meta.is_link || (val.meta.is_link && val.meta.is_iframe)">
          <MenuIcon :name="val.meta.icon" :seed="val.path" />
          <span>{{ $t(val.meta.title) }}</span>
        </template>
        <template v-else>
          <a :href="val.meta.is_link" target="_blank" rel="opener" class="w100">
            <MenuIcon :name="val.meta.icon" :seed="val.path" />
            {{ $t(val.meta.title) }}
          </a>
        </template>
      </el-menu-item>
    </template>
  </template>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import MenuIcon from "/@/layout/navMenu/MenuIcon.vue";

export default defineComponent({
  name: "navMenuSubItem",
  components: { MenuIcon },
  props: {
    chil: {
      type: Array,
      default: () => [],
    },
  },
  setup(props) {
    // 获取父级菜单数据
    const chils = computed(() => {
      return <any>props.chil;
    });
    return {
      chils,
    };
  },
});
</script>
