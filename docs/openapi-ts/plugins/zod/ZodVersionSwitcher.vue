<script setup lang="ts">
const versions = [
  {
    label: 'v3',
    value: 'v3',
  },
  {
    label: 'v4',
    value: 'v4',
  },
];
</script>

<template>
  <VersionSwitcher :values="versions" default="v4" />
</template>
