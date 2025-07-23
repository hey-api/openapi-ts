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
  <Heading>
    <slot />
    <VersionSwitcher :values="versions" default="v4" />
  </Heading>
</template>
