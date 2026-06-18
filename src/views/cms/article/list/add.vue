<template>
  <div>
    <apiV1CmsCmsArticleEdit ref="editRef"></apiV1CmsCmsArticleEdit>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import apiV1CmsCmsArticleEdit from "/@/views/cms/article/list/component/edit.vue";

export default defineComponent({
  name: "apiV1CmsCmsArticleAdd",
  components: {
    apiV1CmsCmsArticleEdit,
  },
});
</script>

<style scoped></style>
