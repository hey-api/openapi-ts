import { fileURLToPath } from 'node:url';

import { createVitestConfig } from '@config/vite-base';

export default createVitestConfig(
  fileURLToPath(new URL('./', import.meta.url)),
  {
    // Add specific configuration here if needed
  },
);
