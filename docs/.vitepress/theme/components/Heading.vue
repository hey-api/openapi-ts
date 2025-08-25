<script setup lang="ts">
const props = defineProps<{
  spaceBetween?: boolean;
}>();
</script>

<template>
  <div class="container" :class="{ 'space-between': props.spaceBetween }">
    <slot />
  </div>
</template>

<style scoped>
.container {
  align-items: center;
  column-gap: 1rem;
  display: flex;
}

.space-between {
  justify-content: space-between;
}
</style>
