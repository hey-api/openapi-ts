import './assets/main.css'

import { VueQueryPlugin } from '@tanstack/vue-query'
import { createPinia } from 'pinia'
import { createApp } from 'vue'

import App from './App.vue'
import { client } from './client/services.gen'
import router from './router'

// configure internal service client
client.setConfig({
  // set default base url for requests
  baseUrl: 'https://petstore3.swagger.io/api/v3',
  // set default headers for requests
  headers: {
    Authorization: 'Bearer <token_from_service_client>'
  }
})

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(VueQueryPlugin)

app.mount('#app')
