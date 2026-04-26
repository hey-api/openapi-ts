import { beforeAll } from 'vitest';

beforeAll(() => {
  globalThis.process.chdir(new URL('.', import.meta.url).pathname);
});
