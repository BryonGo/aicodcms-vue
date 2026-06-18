<template>
  <div>
    <apiV1CmsPageEdit ref="editRef"></apiV1CmsPageEdit>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import apiV1CmsPageEdit from "/@/views/cms/page/list/component/edit.vue";

export default defineComponent({
  name: "apiV1CmsPageAdd",
  components: {
    apiV1CmsPageEdit,
  },
});
</script>

<style scoped></style>
