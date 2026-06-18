<template>
  <span class="nav-menu-icon" :style="iconStyle">
    <SvgIcon :name="name" :size="15" :color="tone.color" />
  </span>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";

const tones = [
  {
    color: "var(--cc-color-primary)",
    bg: "color-mix(in srgb, var(--cc-color-primary) 14%, transparent)",
  },
  {
    color: "var(--cc-color-success)",
    bg: "color-mix(in srgb, var(--cc-color-success) 14%, transparent)",
  },
  {
    color: "var(--cc-color-warning)",
    bg: "color-mix(in srgb, var(--cc-color-warning) 16%, transparent)",
  },
  {
    color: "var(--cc-color-danger)",
    bg: "color-mix(in srgb, var(--cc-color-danger) 12%, transparent)",
  },
  {
    color: "var(--cc-color-info)",
    bg: "color-mix(in srgb, var(--cc-color-info) 14%, transparent)",
  },
];

const pickTone = (seed = "") => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return tones[hash % tones.length];
};

export default defineComponent({
  name: "NavMenuIcon",
  props: {
    name: {
      type: String,
      default: "",
    },
    seed: {
      type: String,
      default: "",
    },
  },
  setup(props) {
    const tone = computed(() => pickTone(props.seed || props.name));
    const iconStyle = computed(() => ({
      "--nav-menu-icon-color": tone.value.color,
      "--nav-menu-icon-bg": tone.value.bg,
    }));
    return { tone, iconStyle };
  },
});
</script>
