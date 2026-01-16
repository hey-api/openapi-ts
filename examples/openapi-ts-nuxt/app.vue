<script setup lang="ts">
script setup lang="ts">
import { client } from '#hey-api/client.gen';

// configure internal service client
client.setConfig(m // configure internal service client
client.setConfig({
  auth: () => undefined,
  // set default base url for requests
  baseURL: 'https://petstore3.swagger.io/api/v3',
  // set default headers for requests
  headers: {
    Authorization: 'Bearer <token_from_service_client>',
  },
  onRequest: () => {
    console.log('onRequest: global');
  },
  onResponse: () => {
    console.log('onResponse: global');
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
