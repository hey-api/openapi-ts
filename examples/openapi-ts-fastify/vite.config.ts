import { defineConfig } from 'vitest/config';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [],
  test: {
    environment: 'node',
    globals: true,
    include: ['test/**/*.test.ts'],
    watch: false,
  },
});
