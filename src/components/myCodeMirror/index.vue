<template>
  <codemirror
    ref="cmRef"
    v-model="code"
    placeholder="Code goes here..."
    :style="{ height: editHeight + 'px' }"
    :autofocus="true"
    :indent-with-tab="true"
    :tab-size="2"
    :extensions="extensions"
    @ready="handleReady"
    @update="handleUpdate"
  />
</template>

<script lang="ts">
import { computed, defineComponent, ref, shallowRef, watch } from "vue";
import { Codemirror } from "vue-codemirror";
import { html } from "@codemirror/lang-html";
import { oneDark } from "@codemirror/theme-one-dark";

export default defineComponent({
  name: "myCodeMirror",
  components: {
    Codemirror,
  },
  props: {
    modelValue: {
      type: String,
      default: "",
    },
    height: {
      type: Number,
      default: 500,
    },
    language: {
      type: String,
      default: "html",
    },
  },
  setup(props, { emit }) {
    const code = ref(props.modelValue);
    const cmRef = ref();

    const getExtensions = () => {
      const exts = [oneDark];
      if (props.language === "html") {
        exts.push(html());
      }
      return exts;
    };

    const extensions = computed(() => getExtensions());

    const view = shallowRef();
    const editHeight = computed(() => props.height);

    const handleReady = (payload: any) => {
      view.value = payload.view;
    };

    const handleUpdate = () => {
      emit("update:modelValue", code.value);
    };

    watch(
      () => props.modelValue,
      (newVal) => {
        if (newVal !== code.value) {
          code.value = newVal;
        }
      },
    );

    return {
      code,
      cmRef,
      extensions,
      handleReady,
      handleUpdate,
      editHeight,
    };
  },
});
</script>
