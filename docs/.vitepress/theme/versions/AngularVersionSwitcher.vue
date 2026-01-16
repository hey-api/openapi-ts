<script setup lang="ts">
import VersionSwitcher from '@components/VersionSwitcher.vue';

const versions = [
  {
    label: 'Angular 20',
    short: 'v20',
    value: 'v20',
  },
  {
    label: 'Angular 19',
    short: 'v19',
    value: 'v19',
  },
];
</script>

<template>
  <VersionSwitcher :values="versions" default="v20" />
</template>
