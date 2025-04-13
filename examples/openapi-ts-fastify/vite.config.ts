import { fileURLToPath } from 'node:url';

import { createVitestConfig } from '@config/vite-base';

// https://vitejs.dev/config/
export default createVitestConfig(
  fileURLToPath(new URL('./', import.meta.url)),
  {
    test: {
      environment: 'node',
      globals: true,
      include: ['test/**/*.test.ts'],
      watch: false,
    },
  },
);
