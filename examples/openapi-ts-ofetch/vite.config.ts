import path from 'node:path';

import vue from '@vitejs/plugin-vue';

/** @type {import('vite').UserConfig} */
export default {
  build: {
    sourcemap: true,
    target: 'esnext',
  },
  esbuild: {
    target: 'esnext',
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext',
    },
  },
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.join(import.meta.dirname, 'src'),
    },
  },
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
} as import('vite').UserConfig;
