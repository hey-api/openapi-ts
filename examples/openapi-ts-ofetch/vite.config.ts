import { fileURLToPath, URL } from 'node:url';

import { createViteConfig } from '@config/vite-base';
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
export default createViteConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
