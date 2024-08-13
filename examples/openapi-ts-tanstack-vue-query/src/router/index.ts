import { createRouter, createWebHistory } from 'vue-router'

import TanstackExample from '@/views/TanstackExample.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      component: TanstackExample,
      name: 'home',
      path: '/'
    }
  ]
})

export default router
