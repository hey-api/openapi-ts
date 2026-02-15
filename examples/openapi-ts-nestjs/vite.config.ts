import swc from 'unplugin-swc';
import { defineProject } from 'vitest/config';

export default defineProject({
  plugins: [swc.vite()],
  resolve: {
    alias: {
      src: new URL('./src', import.meta.url).pathname,
    },
  },
  test: {
    environment: 'node',
    globals: true,
    include: ['test/**/*.test.ts'],
  },
});
