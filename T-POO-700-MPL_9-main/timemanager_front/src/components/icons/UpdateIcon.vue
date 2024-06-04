<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    :stroke="props.color || 'white'"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <polygon points="16 3 21 8 8 21 3 21 3 16 16 3"></polygon>
  </svg>
</template>

<script setup lang="ts">
const props = defineProps<{
  color?: string
}>()
</script>
