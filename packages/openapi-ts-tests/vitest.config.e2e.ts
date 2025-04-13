import { fileURLToPath } from 'node:url';

import { createVitestConfig } from '@config/vite-base';

export default createVitestConfig(
  fileURLToPath(new URL('./', import.meta.url)),
  {
    test: {
      // Dont run tests in parallel. This is to ensure the test server can start up.
      // And that the port was not previously taken.
      fileParallelism: false,
      include: ['test/e2e/**/*.test.ts'],
    },
  },
);
