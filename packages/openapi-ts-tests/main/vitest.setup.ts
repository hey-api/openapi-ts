import { beforeAll } from 'vitest';

beforeAll(() => {
  process.chdir(new URL('.', import.meta.url).pathname);
});
