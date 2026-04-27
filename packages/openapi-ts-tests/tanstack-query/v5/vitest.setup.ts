import { fileURLToPath } from 'node:url';

import { beforeAll } from 'vitest';

beforeAll(() => {
  process.chdir(fileURLToPath(new URL('.', import.meta.url)));
});
