import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createVitestConfig } from '@config/vite-base';

const rootDir = fileURLToPath(new URL('./', import.meta.url));

export default createVitestConfig(rootDir, {
  resolve: {
    alias: [
      { find: /^~\/(.*)/, replacement: path.resolve(rootDir, 'src/$1') },
      { find: '~', replacement: path.resolve(rootDir, 'src') },
    ],
  },
});
