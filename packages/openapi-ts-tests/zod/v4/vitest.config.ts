import { fileURLToPath } from 'node:url';

import { createVitestConfig } from '@config/vite-base';

const rootDir = fileURLToPath(new URL('./', import.meta.url));

export default createVitestConfig(rootDir);
