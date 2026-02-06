import { fileURLToPath } from 'node:url';

import { createVitestConfig } from '@config/vite-base';

// https://vitejs.dev/config/
export default createVitestConfig(fileURLToPath(new URL('./', import.meta.url)), {
  resolve: {
    alias: {
      src: new URL('./src', import.meta.url).pathname,
    },
  },
  test: {
    environment: 'node',
    globals: true,
    include: ['test/**/*.test.ts'],
    watch: false,
  },
});
