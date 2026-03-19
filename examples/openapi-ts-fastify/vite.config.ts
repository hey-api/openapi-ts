import { defineProject } from 'vitest/config';

export default defineProject({
  resolve: {
    alias: {
      src: new URL('./src', import.meta.url).pathname,
    },
  },
  test: {
    environment: 'node',
    include: ['test/**/*.test.ts'],
  },
});
