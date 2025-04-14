import { fileURLToPath } from 'node:url';

import { createVitestConfig } from '@config/vite-base';
import { defineVitestConfig } from '@nuxt/test-utils/config';

// Create a base configuration with any shared settings
const baseConfig = createVitestConfig(
  fileURLToPath(new URL('./', import.meta.url)),
  {
    test: {
      coverage: {
        exclude: ['dist', 'src/**/*.d.ts'],
        include: ['src/**/*.ts'],
        provider: 'v8',
      },
    },
  },
);

// Use Nuxt's config with our common test settings
export default defineVitestConfig({
  ...baseConfig,
  test: {
    ...baseConfig.test,
    environment: 'nuxt',
    environmentOptions: {
      nuxt: {
        domEnvironment: 'jsdom',
      },
    },
  },
});
