import './assets/main.css';

import { createApp } from 'vue';

import App from './App.vue';
import { client } from './client/client.gen';

// configure internal service client
client.setConfig({
  // set default base url for requests
  baseUrl: 'https://petstore3.swagger.io/api/v3',
  // set default headers for requests
  headers: {
    Authorization: 'Bearer <token_from_service_client>',
  },
});

createApp(App).mount('#app');
