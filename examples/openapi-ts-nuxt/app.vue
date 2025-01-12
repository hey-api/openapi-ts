<script setup lang="ts">
import { client } from './client';

// configure internal service client
client.setConfig({
  auth: () => {
    // fetch auth token
    return undefined;
  },
  // set default base url for requests
  baseURL: 'https://petstore3.swagger.io/api/v3',
  // set default headers for requests
  headers: {
    Authorization: 'Bearer <token_from_service_client>',
  },
});
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />
    <!-- <NuxtWelcome /> -->
    <Home />
  </div>
</template>
