<script setup lang="ts">
script setup lang="ts">
import VersionSwitcher from '@components/VersionSwitcher.vue';

const versions = [
  ts/VersionSwitcher.vue';
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
  <VersionSwitcher :values="versions" default="v4" />
</template>
