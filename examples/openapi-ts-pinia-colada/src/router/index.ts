import { createRouter, createWebHistory } from 'vue-router';

import PiniaColadaExample from '@/views/PiniaColadaExample.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      component: PiniaColadaExample,
      name: 'home',
      path: '/',
    },
  ],
});

export default router;
