<script setup lang="ts">
import { VueQueryDevtools } from '@tanstack/vue-query-devtools'
import { RouterView } from 'vue-router'
</script>

<template>
  <div>
    <RouterView />
    <VueQueryDevtools />
  </div>
</template>
