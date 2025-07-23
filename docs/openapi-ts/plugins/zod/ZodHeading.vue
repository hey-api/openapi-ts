<script setup lang="ts">
const versions = [
  {
    label: 'Zod 4',
    short: 'v4',
    value: 'v4',
  },
  {
    label: 'Zod Mini',
    short: 'Mini',
    value: 'mini',
  },
  {
    label: 'Zod 3',
    short: 'v3',
    value: 'v3',
  },
];
</script>

<template>
  <div class="container">
    <h1>Zod</h1>
    <VersionSwitcher :values="versions" default="v4" />
  </div>
</template>

<style scoped>
.container {
  align-items: center;
  column-gap: 1rem;
  display: flex;
}
</style>
